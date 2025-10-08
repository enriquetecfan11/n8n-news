#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuración de sectores y sus palabras clave
const SECTOR_KEYWORDS = {
  'tecnología': ['microsoft', 'meta', 'google', 'apple', 'nvidia', 'tesla', 'intel', 'tech', 'software', 'hardware', 'ai', 'inteligencia artificial'],
  'finanzas': ['banco', 'bank', 'fed', 'reserva federal', 'inflación', 'inflation', 'tipo de interés', 'interest rate', 'financiero', 'financial'],
  'energía': ['petróleo', 'oil', 'gas', 'energía', 'energy', 'opec', 'crude', 'petrolero'],
  'salud': ['salud', 'health', 'médico', 'medical', 'farmacéutico', 'pharmaceutical', 'vacuna', 'vaccine'],
  'consumo': ['retail', 'consumo', 'consumer', 'ventas', 'sales', 'marca', 'brand'],
  'política': ['trump', 'elección', 'election', 'gobierno', 'government', 'política', 'political', 'congreso', 'congress'],
  'economía': ['pib', 'gdp', 'economía', 'economy', 'recesión', 'recession', 'crecimiento', 'growth', 'empleo', 'employment'],
  'automotriz': ['auto', 'car', 'automotriz', 'automotive', 'ford', 'gm', 'general motors', 'vehículo', 'vehicle'],
  'comercio': ['comercio', 'trade', 'arancel', 'tariff', 'exportación', 'export', 'importación', 'import']
};

// Palabras clave para detectar impacto
const IMPACT_KEYWORDS = {
  'alto': ['fed', 'banco central', 'central bank', 'inflación', 'inflation', 'recesión', 'recession', 'crisis', 'trump', 'elección', 'election', 'guerra', 'war', 'pandemia', 'pandemic'],
  'medio': ['resultados', 'earnings', 'merger', 'adquisición', 'acquisition', 'alianza', 'alliance', 'acuerdo', 'agreement'],
  'bajo': ['análisis', 'analysis', 'opinión', 'opinion', 'tendencia', 'trend', 'predicción', 'prediction']
};

// Palabras clave para detectar sentimiento
const SENTIMENT_KEYWORDS = {
  'positivo': ['sube', 'crece', 'gana', 'mejora', 'aumenta', 'positivo', 'optimista', 'win', 'wins', 'gana', 'ganan', 'rise', 'growth', 'beat', 'strong', 'bullish'],
  'negativo': ['baja', 'cae', 'pierde', 'empeora', 'disminuye', 'negativo', 'pesimista', 'struggled', 'luchó', 'tumult', 'inestabilidad', 'fall', 'drop', 'decline', 'weak', 'bearish', 'crisis']
};

// Tickers conocidos
const KNOWN_TICKERS = [
  'MSFT', 'META', 'GOOGL', 'AAPL', 'NVDA', 'TSLA', 'INTC', 'AMZN', 'NFLX', 'AMD',
  'SPY', 'QQQ', 'DIA', 'VIX', 'BTC', 'ETH', 'EUR', 'USD', 'GBP', 'JPY',
  'F', 'GM', 'BAC', 'JPM', 'WFC', 'C', 'GS', 'MS', 'BLK', 'AXP'
];

function extractTickers(text) {
  const foundTickers = [];
  const upperText = text.toUpperCase();
  
  for (const ticker of KNOWN_TICKERS) {
    if (upperText.includes(ticker)) {
      foundTickers.push(ticker);
    }
  }

  return [...new Set(foundTickers)];
}

function detectSectors(text) {
  const foundSectors = [];
  const lowerText = text.toLowerCase();

  for (const [sector, keywords] of Object.entries(SECTOR_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        foundSectors.push(sector);
        break;
      }
    }
  }

  return [...new Set(foundSectors)];
}

function detectImpact(text) {
  const lowerText = text.toLowerCase();
  let maxScore = 0;
  let detectedImpact = 'bajo';

  for (const [impact, keywords] of Object.entries(IMPACT_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        score++;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      detectedImpact = impact;
    }
  }

  return detectedImpact;
}

function detectSentiment(text) {
  const lowerText = text.toLowerCase();
  let positiveScore = 0;
  let negativeScore = 0;

  for (const keyword of SENTIMENT_KEYWORDS.positivo) {
    if (lowerText.includes(keyword.toLowerCase())) {
      positiveScore++;
    }
  }

  for (const keyword of SENTIMENT_KEYWORDS.negativo) {
    if (lowerText.includes(keyword.toLowerCase())) {
      negativeScore++;
    }
  }

  if (positiveScore > negativeScore) return 'positivo';
  if (negativeScore > positiveScore) return 'negativo';
  return 'neutral';
}

function detectSource(text) {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('investing.com')) return 'Investing.com';
  if (lowerText.includes('bloomberg')) return 'Bloomberg';
  if (lowerText.includes('reuters')) return 'Reuters';
  if (lowerText.includes('cnbc')) return 'CNBC';
  if (lowerText.includes('financial times') || lowerText.includes('ft.com')) return 'Financial Times';
  if (lowerText.includes('wall street journal') || lowerText.includes('wsj.com')) return 'Wall Street Journal';
  
  return 'Fuente desconocida';
}

function calculateRelevanceScore(impact, sectors, tickers, sentiment) {
  let score = 5; // Base score

  if (impact === 'alto') score += 3;
  else if (impact === 'medio') score += 1;

  score += Math.min(sectors.length, 2);
  score += Math.min(tickers.length, 2);

  if (sentiment === 'positivo' || sentiment === 'negativo') score += 1;

  return Math.min(Math.max(score, 1), 10);
}

function parseFrontmatter(content) {
  const lines = content.split('\n');
  const frontmatter = {};
  let inFrontmatter = false;
  let contentStart = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line === '---') {
      if (!inFrontmatter) {
        inFrontmatter = true;
        continue;
      } else {
        contentStart = i + 1;
        break;
      }
    }
    
    if (inFrontmatter) {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        let value = line.substring(colonIndex + 1).trim();
        
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        
        frontmatter[key] = value;
      }
    }
  }

  const body = lines.slice(contentStart).join('\n');
  return { frontmatter, body };
}

function generateFrontmatter(frontmatter) {
  let result = '---\n';
  
  for (const [key, value] of Object.entries(frontmatter)) {
    if (Array.isArray(value)) {
      result += `${key}: [${value.map(v => `"${v}"`).join(', ')}]\n`;
    } else {
      result += `${key}: "${value}"\n`;
    }
  }
  
  result += '---\n';
  return result;
}

function processBlogFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const { frontmatter, body } = parseFrontmatter(content);
    
    const fullText = `${frontmatter.title || ''} ${body}`;
    
    const metadata = {
      impact: detectImpact(fullText),
      sectors: detectSectors(fullText),
      source: detectSource(fullText),
      sentiment: detectSentiment(fullText),
      relevanceScore: 0,
      tickers: extractTickers(fullText)
    };

    metadata.relevanceScore = calculateRelevanceScore(
      metadata.impact,
      metadata.sectors,
      metadata.tickers,
      metadata.sentiment
    );

    // Merge with existing frontmatter
    const newFrontmatter = { ...frontmatter, ...metadata };
    
    // Create new content
    const newContent = generateFrontmatter(newFrontmatter) + body;
    
    // Create backup
    fs.writeFileSync(filePath + '.backup', content);
    
    // Write new content
    fs.writeFileSync(filePath, newContent);
    
    console.log(`✅ ${path.basename(filePath)}`);
    console.log(`   Impacto: ${metadata.impact} | Sectores: ${metadata.sectors.join(', ') || 'Ninguno'}`);
    console.log(`   Tickers: ${metadata.tickers.join(', ') || 'Ninguno'} | Sentimiento: ${metadata.sentiment}`);
    console.log(`   Fuente: ${metadata.source} | Relevancia: ${metadata.relevanceScore}/10\n`);
    
    return metadata;
  } catch (error) {
    console.error(`❌ Error procesando ${filePath}:`, error.message);
    return null;
  }
}

function main() {
  console.log('🚀 Iniciando análisis de metadatos del blog...\n');
  
  const blogDir = path.join(process.cwd(), 'src/content/blog');
  const files = fs.readdirSync(blogDir).filter(file => file.endsWith('.md'));
  
  console.log(`📚 Encontrados ${files.length} archivos de blog\n`);
  
  const results = [];
  
  for (const file of files) {
    const filePath = path.join(blogDir, file);
    const result = processBlogFile(filePath);
    if (result) {
      results.push({ file, ...result });
    }
  }
  
  console.log('\n📊 REPORTE DE ANÁLISIS\n');
  console.log('='.repeat(50));
  
  // Estadísticas generales
  const totalPosts = results.length;
  console.log(`📈 Total de posts procesados: ${totalPosts}`);
  
  // Distribución por impacto
  const impactCounts = results.reduce((acc, r) => {
    acc[r.impact] = (acc[r.impact] || 0) + 1;
    return acc;
  }, {});
  
  console.log('\n📊 Distribución por Impacto:');
  for (const [impact, count] of Object.entries(impactCounts)) {
    console.log(`   ${impact}: ${count} posts`);
  }
  
  // Distribución por sectores
  const sectorCounts = results.reduce((acc, r) => {
    for (const sector of r.sectors) {
      acc[sector] = (acc[sector] || 0) + 1;
    }
    return acc;
  }, {});
  
  console.log('\n📊 Sectores más frecuentes:');
  const sortedSectors = Object.entries(sectorCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);
  
  for (const [sector, count] of sortedSectors) {
    console.log(`   ${sector}: ${count} posts`);
  }
  
  // Tickers más frecuentes
  const tickerCounts = results.reduce((acc, r) => {
    for (const ticker of r.tickers) {
      acc[ticker] = (acc[ticker] || 0) + 1;
    }
    return acc;
  }, {});
  
  console.log('\n📊 Tickers más frecuentes:');
  const sortedTickers = Object.entries(tickerCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10);
  
  for (const [ticker, count] of sortedTickers) {
    console.log(`   ${ticker}: ${count} posts`);
  }
  
  console.log('\n✅ Análisis completado. Los archivos han sido actualizados.');
  console.log('💡 Los archivos originales se guardaron como .backup');
}

main();
