#!/bin/bash
BACKUP_DIR="${1:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

mkdir -p "$BACKUP_DIR"

# PostgreSQL backup via Docker
DB_CONTAINER="deploy-postgres-1"
if docker ps --filter "name=$DB_CONTAINER" --filter "status=running" --format "{{.Names}}" | grep -q .; then
  docker exec "$DB_CONTAINER" pg_dump -U psicoflow psicoflow > "$BACKUP_DIR/psicoflow_db_$TIMESTAMP.sql"
  echo "[OK] PostgreSQL backup: $BACKUP_DIR/psicoflow_db_$TIMESTAMP.sql"
else
  echo "[!] Container PostgreSQL nao esta rodando"
fi

# .env files
for f in .env .env.local; do
  if [ -f "$PROJECT_ROOT/$f" ]; then
    cp "$PROJECT_ROOT/$f" "$BACKUP_DIR/${f}_$TIMESTAMP"
    echo "[OK] $f backup"
  fi
done

# Prisma schema
if [ -f "$PROJECT_ROOT/prisma/schema.prisma" ]; then
  cp "$PROJECT_ROOT/prisma/schema.prisma" "$BACKUP_DIR/schema.prisma_$TIMESTAMP"
  echo "[OK] Schema backup"
fi

echo ""
echo "Backup concluido: $TIMESTAMP"
echo "Diretorio: $BACKUP_DIR"

# Cleanup > 30 days
find "$BACKUP_DIR" -type f -mtime +30 -delete 2>/dev/null
echo "[OK] Backup antigos removidos (mais de 30 dias)"
