@echo off
REM ==========================================
REM PsicoFlow - Inicio Automatico
REM Coloque este atalho em:
REM   shell:startup
REM ou agende como tarefa do Windows
REM ==========================================

cd /d "C:\Users\miche\Desktop\PsicoFlow-Completo\deploy"

REM Inicia os containers se nao estiverem rodando
docker compose -f docker-compose.dev.yml ps >nul 2>&1
if errorlevel 1 (
  echo Iniciando PsicoFlow...
  docker compose -f docker-compose.dev.yml up -d
  echo PsicoFlow iniciado em http://localhost:3000
) else (
  echo PsicoFlow ja esta rodando em http://localhost:3000
)
