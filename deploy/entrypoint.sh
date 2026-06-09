#!/bin/sh
set -e

echo "Sincronizando schema do banco..."
node /app/node_modules/prisma/build/index.js db push --skip-generate 2>/dev/null || echo "[OK] Schema ja sincronizado"

echo "Iniciando PsicoFlow..."
exec node server.js
