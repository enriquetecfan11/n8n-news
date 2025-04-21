#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';

// Obtener el directorio actual en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directorio de contenido del blog
const BLOG_DIR = path.join(__dirname, 'src/content/blog');

// Campos requeridos según el esquema
const REQUIRED_FIELDS = ['title', 'description', 'pubDate'];

// Bandera para modo de corrección automática
const AUTO_FIX = process.argv.includes('--fix');

/**
 * Limpia el valor de un campo eliminando comentarios y espacios en blanco
 * @param {string} value - Valor a limpiar
 * @returns {string} - Valor limpio
 */
function cleanFieldValue(value) {
    if (!value) return value;

    // Quitar comillas si existen
    let cleanValue = value.replace(/^"(.*)"$/, '$1');

    // Eliminar comentarios (texto después de #)
    const commentIndex = cleanValue.indexOf('#');
    if (commentIndex !== -1) {
        cleanValue = cleanValue.substring(0, commentIndex).trim();
    }

    return cleanValue;
}

/**
 * Valida un archivo Markdown
 * @param {string} filePath - Ruta completa del archivo
 * @returns {Promise<{isValid: boolean, errors: string[], fixable: boolean, fixedContent?: string}>}
 */
async function validateMarkdownFile(filePath) {
    const errors = [];
    const fixes = [];
    let fixable = false;

    try {
        // Leer el contenido del archivo
        const content = await fs.promises.readFile(filePath, 'utf8');

        // Verificar que el archivo tenga frontmatter
        if (!content.startsWith('---')) {
            errors.push(`No tiene frontmatter válido`);
            return { isValid: false, errors, fixable: false };
        }

        // Extraer el frontmatter
        const frontmatterEnd = content.indexOf('---', 3);
        if (frontmatterEnd === -1) {
            errors.push(`El frontmatter no está cerrado correctamente`);
            return { isValid: false, errors, fixable: false };
        }

        const frontmatterContent = content.substring(3, frontmatterEnd).trim();
        const frontmatter = {};
        const frontmatterLines = frontmatterContent.split('\n');

        // Parsear el frontmatter y detectar problemas
        frontmatterLines.forEach((line, index) => {
            const [key, ...valueParts] = line.split(':');
            if (key && valueParts.length > 0) {
                const rawValue = valueParts.join(':').trim();
                const value = cleanFieldValue(rawValue);
                frontmatter[key.trim()] = value;

                // Detectar si hay comentarios en el valor
                if (rawValue.includes('#') && (key.trim() === 'pubDate' || key.trim() === 'updatedDate')) {
                    fixes.push({
                        lineIndex: index,
                        original: line,
                        fixed: `${key}: "${value}"`
                    });
                    fixable = true;
                }
            }
        });

        // Verificar campos requeridos
        for (const field of REQUIRED_FIELDS) {
            if (!frontmatter[field]) {
                errors.push(`Falta el campo requerido: ${field}`);
            }
        }

        // Validar formato de fecha
        if (frontmatter.pubDate) {
            const date = new Date(frontmatter.pubDate);
            if (isNaN(date.getTime())) {
                errors.push(`El formato de la fecha pubDate es inválido: ${frontmatter.pubDate}`);
            }
        }

        // Validar updatedDate si existe
        if (frontmatter.updatedDate) {
            const date = new Date(frontmatter.updatedDate);
            if (isNaN(date.getTime())) {
                errors.push(`El formato de la fecha updatedDate es inválido: ${frontmatter.updatedDate}`);
            }
        }

        // Verificar que el link es una URL válida si existe
        if (frontmatter.link) {
            try {
                new URL(frontmatter.link);
            } catch (e) {
                errors.push(`El campo 'link' no contiene una URL válida: ${frontmatter.link}`);
            }
        }

        // Validar que el contenido después del frontmatter no esté vacío
        const contentAfterFrontmatter = content.substring(frontmatterEnd + 3).trim();
        if (!contentAfterFrontmatter) {
            errors.push(`El contenido del artículo está vacío`);
        }

        // Si hay que corregir y está en modo auto-fix, aplicar las correcciones
        if (AUTO_FIX && fixable) {
            let fixedContent = content;
            let offset = 3; // Iniciar después de la primera línea de frontmatter "---"

            for (const fix of fixes) {
                const startOfLine = fixedContent.indexOf(fix.original, offset);
                if (startOfLine !== -1) {
                    const endOfLine = startOfLine + fix.original.length;
                    fixedContent = fixedContent.substring(0, startOfLine) +
                        fix.fixed +
                        fixedContent.substring(endOfLine);
                    offset = startOfLine + fix.fixed.length;
                }
            }

            return {
                isValid: errors.length === 0,
                errors,
                fixable,
                fixedContent
            };
        }

        return {
            isValid: errors.length === 0,
            errors,
            fixable,
            frontmatter
        };
    } catch (error) {
        errors.push(`Error al leer el archivo: ${error.message}`);
        return { isValid: false, errors, fixable: false };
    }
}

/**
 * Función principal que valida todos los archivos Markdown
 */
async function validateAllMarkdownFiles() {
    try {
        const files = await fs.promises.readdir(BLOG_DIR);
        const mdFiles = files.filter(file => file.endsWith('.md'));

        console.log(chalk.blue(`\n=== ${AUTO_FIX ? 'Corrigiendo' : 'Validando'} ${mdFiles.length} archivos Markdown ===\n`));

        let validCount = 0;
        let invalidCount = 0;
        let fixedCount = 0;
        const issues = [];

        for (const file of mdFiles) {
            const filePath = path.join(BLOG_DIR, file);
            const { isValid, errors, fixable, fixedContent } = await validateMarkdownFile(filePath);

            // Si hay correcciones y estamos en modo auto-fix, guardar el archivo corregido
            if (AUTO_FIX && fixable && fixedContent) {
                await fs.promises.writeFile(filePath, fixedContent, 'utf8');
                console.log(chalk.yellow(`⚒ ${file} (corregido)`));
                fixedCount++;
            } else if (isValid) {
                validCount++;
                console.log(chalk.green(`✓ ${file}`));
            } else {
                invalidCount++;
                console.log(chalk.red(`✗ ${file}`));
                errors.forEach(error => {
                    console.log(chalk.red(`  - ${error}`));
                    issues.push({ file, error });
                });
            }
        }

        console.log('\n=== Resumen ===');
        console.log(`Total archivos: ${mdFiles.length}`);
        console.log(chalk.green(`Archivos válidos: ${validCount}`));

        if (AUTO_FIX) {
            console.log(chalk.yellow(`Archivos corregidos: ${fixedCount}`));
        }

        if (invalidCount > 0) {
            console.log(chalk.red(`Archivos con problemas: ${invalidCount}`));
            console.log('\n=== Problemas encontrados ===');
            issues.forEach(({ file, error }) => {
                console.log(chalk.red(`${file}: ${error}`));
            });

            if (AUTO_FIX) {
                console.log(chalk.yellow('\nAlgunos archivos no pudieron ser corregidos automáticamente. Por favor, corrígelos manualmente.'));
            } else {
                console.log(chalk.yellow('\nPuedes intentar corregir automáticamente algunos problemas ejecutando: npm run validate -- --fix'));
            }

            process.exit(1);
        } else if (fixedCount > 0) {
            console.log(chalk.green('\n¡Todos los archivos han sido corregidos y son válidos!'));
        } else {
            console.log(chalk.green('\n¡Todos los archivos Markdown son válidos!'));
        }
    } catch (error) {
        console.error(chalk.red(`Error al leer el directorio: ${error.message}`));
        process.exit(1);
    }
}

// Ejecutar la validación
validateAllMarkdownFiles();