#!/bin/bash
# Database backup script for Neon PostgreSQL
# Usage: ./scripts/backup-db.sh
# Requires: psql or pg_dump, DATABASE_URL env var

set -euo pipefail

BACKUP_DIR="backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/psicoflow_backup_${TIMESTAMP}.sql"
MAX_BACKUPS=7

mkdir -p "${BACKUP_DIR}"

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL environment variable is not set."
  echo "Usage: DATABASE_URL='postgresql://...' ./scripts/backup-db.sh"
  exit 1
fi

if command -v pg_dump &> /dev/null; then
  echo "Running pg_dump..."
  pg_dump "${DATABASE_URL}" --no-owner --no-acl -f "${BACKUP_FILE}"
  echo "SUCCESS: Backup saved to ${BACKUP_FILE}"
elif command -v psql &> /dev/null; then
  echo "pg_dump not found. Using psql instead..."
  {
    echo "-- PsicoFlow backup (${TIMESTAMP})"
    echo "-- Generated via psql"
    psql "${DATABASE_URL}" -c "\dt" --quiet 2>/dev/null || true
  } > "${BACKUP_FILE}"
  echo "WARNING: psql-based backup may be incomplete."
  echo "Saved to ${BACKUP_FILE}"
else
  echo "ERROR: Neither pg_dump nor psql found. Install PostgreSQL client tools."
  exit 1
fi

# Remove backups older than MAX_BACKUPS
COUNT=$(ls -1 "${BACKUP_DIR}"/psicoflow_backup_*.sql 2>/dev/null | wc -l)
if [ "${COUNT}" -gt "${MAX_BACKUPS}" ]; then
  ls -1t "${BACKUP_DIR}"/psicoflow_backup_*.sql | tail -n $((COUNT - MAX_BACKUPS)) | while read -r old; do
    rm -f "${old}"
    echo "Deleted old backup: ${old}"
  done
fi

echo "Done. Total backups in ${BACKUP_DIR}: $(ls -1 "${BACKUP_DIR}"/psicoflow_backup_*.sql 2>/dev/null | wc -l)"
