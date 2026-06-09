@echo off
title PsicoFlow - Instalando...
color 0A
echo ========================================
echo        PSICOFLOW - INSTALADOR
echo ========================================
echo.
echo Instalando dependencias...
echo.
npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo.
    echo [ERRO] Falha ao instalar. Tentando modo alternativo...
    npm install --legacy-peer-deps --no-optional
)
echo.
echo Criando banco de dados...
npx prisma generate
npx prisma db push
if %errorlevel% neq 0 (
    echo.
    echo [ERRO] Falha ao criar banco.
    pause
    exit /b 1
)
echo.
echo ========================================
echo    INSTALACAO CONCLUIDA COM SUCESSO!
echo ========================================
echo.
echo Iniciando o servidor...
echo.
echo Abra o navegador em: http://localhost:3000
echo Para parar: aperte CTRL+C
echo.
start http://localhost:3000
npm run dev
pause
