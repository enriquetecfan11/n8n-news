#!/bin/bash

echo "🔍 Ejecutando validación y eliminando archivos markdown inválidos..."
npm run vdel

echo "📦 Actualizando el repositorio con git pull..."
git pull

echo "📤 Verificando si hay archivos nuevos para subir..."
# Comprobar si hay cambios para subir
if [ -n "$(git status --porcelain)" ]; then
    echo "Hay cambios para subir al repositorio"
    git add .
    echo "💾 Ingresa un mensaje para el commit:"
    read commit_message
    git commit -m "$commit_message"
    git push
    echo "✅ Cambios subidos correctamente"
else
    echo "✅ No hay cambios nuevos para subir"
fi

echo "🚀 Iniciando el servidor de desarrollo..."
npm run dev