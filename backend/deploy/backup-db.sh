#!/usr/bin/env bash
set -Eeuo pipefail

DB_PATH="${DB_PATH:-/var/lib/vrtiq/db/prod.db}"
BACKUP_DIR="${BACKUP_DIR:-/var/lib/vrtiq/backups}"
BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"

if [[ ! -f "${DB_PATH}" ]]; then
  echo "Database file does not exist: ${DB_PATH}" >&2
  exit 1
fi

mkdir -p "${BACKUP_DIR}"

TIMESTAMP="$(date -u +%Y%m%dT%H%M%SZ)"
BACKUP_FILE="${BACKUP_DIR}/prod-${TIMESTAMP}.db"

cp --reflink=auto "${DB_PATH}" "${BACKUP_FILE}"
gzip -f "${BACKUP_FILE}"

find "${BACKUP_DIR}" -maxdepth 1 -type f -name 'prod-*.db.gz' -mtime +"${BACKUP_RETENTION_DAYS}" -delete

echo "Backup created: ${BACKUP_FILE}.gz"
