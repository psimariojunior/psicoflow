param(
  [ValidateSet("sqlite", "postgresql")]
  [string]$Target = "sqlite"
)

$schemaPath = Join-Path $PSScriptRoot "..\prisma\schema.prisma"
$envPath = Join-Path $PSScriptRoot "..\.env"

if ($Target -eq "postgresql") {
  # Change schema provider
  $schema = Get-Content $schemaPath -Raw
  $schema = $schema -replace 'provider = "sqlite"', 'provider = "postgresql"'
  Set-Content $schemaPath $schema

  # Update .env with PostgreSQL URL hint
  $env = Get-Content $envPath -Raw
  $env = $env -replace 'DATABASE_URL="file:./dev.db"', 'DATABASE_URL="postgresql://user:password@localhost:5432/psicoflow"'
  Set-Content $envPath $env

  Write-Host "[OK] Alterado para PostgreSQL"
  Write-Host "[!] Certifique-se de ter o PostgreSQL rodando"
  Write-Host "[!] Execute: npx prisma db push"
} else {
  # Change schema provider
  $schema = Get-Content $schemaPath -Raw
  $schema = $schema -replace 'provider = "postgresql"', 'provider = "sqlite"'
  Set-Content $schemaPath $schema

  # Update .env with SQLite URL
  $env = Get-Content $envPath -Raw
  $env = $env -replace 'DATABASE_URL="postgresql://user:password@localhost:5432/psicoflow"', 'DATABASE_URL="file:./dev.db"'
  Set-Content $envPath $env

  Write-Host "[OK] Alterado para SQLite"
  Write-Host "[!] Execute: npx prisma db push"
}
