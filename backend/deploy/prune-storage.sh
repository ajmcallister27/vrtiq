#!/usr/bin/env bash
set -Eeuo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/lib/vrtiq/backups}"
LOG_DIR="${LOG_DIR:-/var/log/vrtiq}"
ARTIFACT_DIR="${ARTIFACT_DIR:-/srv/vrtiq/releases}"

BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"
LOG_RETENTION_DAYS="${LOG_RETENTION_DAYS:-14}"
RELEASE_RETENTION_COUNT="${RELEASE_RETENTION_COUNT:-3}"

if [[ -d "${BACKUP_DIR}" ]]; then
  find "${BACKUP_DIR}" -maxdepth 1 -type f -name 'prod-*.db.gz' -mtime +"${BACKUP_RETENTION_DAYS}" -delete
fi

if [[ -d "${LOG_DIR}" ]]; then
  find "${LOG_DIR}" -type f -name '*.log.*' -mtime +"${LOG_RETENTION_DAYS}" -delete
  find "${LOG_DIR}" -type f -name '*.log' -mtime +"${LOG_RETENTION_DAYS}" -delete
fi

journalctl --vacuum-time="${LOG_RETENTION_DAYS}d" || true

if [[ -d "${ARTIFACT_DIR}" ]]; then
  mapfile -t RELEASES < <(find "${ARTIFACT_DIR}" -mindepth 1 -maxdepth 1 -type d -printf '%T@ %p\n' | sort -rn | awk '{print $2}')
  if (( ${#RELEASES[@]} > RELEASE_RETENTION_COUNT )); then
    for old_release in "${RELEASES[@]:RELEASE_RETENTION_COUNT}"; do
      rm -rf "${old_release}"
    done
  fi
fi

echo "Storage pruning complete."
