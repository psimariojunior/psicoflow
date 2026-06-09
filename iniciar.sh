#!/bin/bash
echo "========================================"
echo "   PsicoFlow - Iniciando o Sistema"
echo "========================================"
echo ""
echo "1. Instalando dependencias..."
npm install
echo ""
echo "2. Gerando Prisma Client..."
npx prisma generate
echo ""
echo "3. Criando banco de dados..."
npx prisma db push
echo ""
echo "4. Iniciando servidor..."
echo ""
echo "   Acesse: http://localhost:3000"
echo ""
npm run dev
