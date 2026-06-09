param(
  [string]$BackupDir = ".\backups"
)

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$projectRoot = Split-Path -Parent $PSScriptRoot

if (-not (Test-Path $BackupDir)) {
  New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

# Database backup via Docker (PostgreSQL)
$dbContainer = "deploy-postgres-1"
$dbExists = docker ps --filter "name=$dbContainer" --filter "status=running" --format "{{.Names}}" 2>$null
if ($dbExists) {
  $dbBackup = Join-Path $BackupDir "psicoflow_db_$timestamp.sql"
  docker exec $dbContainer pg_dump -U psicoflow psicoflow > $dbBackup
  Write-Host "[OK] PostgreSQL backup: $dbBackup"
} else {
  Write-Host "[!] Container PostgreSQL nao esta rodando. Pulando backup do banco."
}

# .env backup
$envPath = Join-Path $projectRoot ".env"
$envLocalPath = Join-Path $projectRoot ".env.local"
if (Test-Path $envPath) {
  Copy-Item -Path $envPath -Destination (Join-Path $BackupDir ".env_$timestamp")
  Write-Host "[OK] .env backup"
}
if (Test-Path $envLocalPath) {
  Copy-Item -Path $envLocalPath -Destination (Join-Path $BackupDir ".env.local_$timestamp")
  Write-Host "[OK] .env.local backup"
}

# Prisma schema backup
$schemaPath = Join-Path $projectRoot "prisma\schema.prisma"
if (Test-Path $schemaPath) {
  Copy-Item -Path $schemaPath -Destination (Join-Path $BackupDir "schema.prisma_$timestamp")
  Write-Host "[OK] Schema backup"
}

Write-Host "`nBackup concluido em: $timestamp"
Write-Host "Diretorio: $BackupDir"

# Cleanup backups older than 30 days
$oldFiles = Get-ChildItem -Path $BackupDir | Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) }
if ($oldFiles) {
  $oldFiles | Remove-Item -Force
  Write-Host "[OK] Removidos $($oldFiles.Count) backup(s) antigo(s) (mais de 30 dias)"
}
