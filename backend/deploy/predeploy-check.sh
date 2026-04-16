#!/usr/bin/env bash
set -Eeuo pipefail

DAYS_IN_MONTH="${DAYS_IN_MONTH:-31}"

INSTANCE_COUNT="${INSTANCE_COUNT:-1}"
OCPU_PER_INSTANCE="${OCPU_PER_INSTANCE:-4}"
MEMORY_GB_PER_INSTANCE="${MEMORY_GB_PER_INSTANCE:-24}"

MAX_TOTAL_OCPU="${MAX_TOTAL_OCPU:-4}"
MAX_TOTAL_MEMORY_GB="${MAX_TOTAL_MEMORY_GB:-24}"
MAX_MONTHLY_OCPU_HOURS="${MAX_MONTHLY_OCPU_HOURS:-3000}"
MAX_MONTHLY_MEMORY_GB_HOURS="${MAX_MONTHLY_MEMORY_GB_HOURS:-18000}"

AUTOSCALING_ENABLED="${AUTOSCALING_ENABLED:-false}"
ALLOW_HORIZONTAL_SCALING_WITH_EQUIVALENT_CAPACITY="${ALLOW_HORIZONTAL_SCALING_WITH_EQUIVALENT_CAPACITY:-false}"

STORAGE_LIMIT_GB="${STORAGE_LIMIT_GB:-200}"
DB_PATH="${DB_PATH:-/var/lib/vrtiq/db/prod.db}"
BACKUP_DIR="${BACKUP_DIR:-/var/lib/vrtiq/backups}"
LOG_DIR="${LOG_DIR:-/var/log/vrtiq}"
ARTIFACT_DIR="${ARTIFACT_DIR:-/srv/vrtiq/releases}"

to_lower() {
  echo "$1" | tr '[:upper:]' '[:lower:]'
}

size_bytes() {
  local path="$1"
  if [[ -f "${path}" ]]; then
    stat -c%s "${path}"
  elif [[ -d "${path}" ]]; then
    du -sb "${path}" | awk '{print $1}'
  else
    echo 0
  fi
}

AUTOSCALING_ENABLED="$(to_lower "${AUTOSCALING_ENABLED}")"
ALLOW_HORIZONTAL_SCALING_WITH_EQUIVALENT_CAPACITY="$(to_lower "${ALLOW_HORIZONTAL_SCALING_WITH_EQUIVALENT_CAPACITY}")"

if [[ "${AUTOSCALING_ENABLED}" == "true" ]]; then
  echo "Autoscaling is disallowed for Oracle Always Free guardrails." >&2
  exit 1
fi

if (( INSTANCE_COUNT > 1 )) && [[ "${ALLOW_HORIZONTAL_SCALING_WITH_EQUIVALENT_CAPACITY}" != "true" ]]; then
  echo "Horizontal scaling is disallowed unless equivalent capacity is removed first." >&2
  echo "Set ALLOW_HORIZONTAL_SCALING_WITH_EQUIVALENT_CAPACITY=true only when totals remain within caps." >&2
  exit 1
fi

TOTAL_OCPU=$(( INSTANCE_COUNT * OCPU_PER_INSTANCE ))
TOTAL_MEMORY_GB=$(( INSTANCE_COUNT * MEMORY_GB_PER_INSTANCE ))

if (( TOTAL_OCPU > MAX_TOTAL_OCPU )); then
  echo "Planned OCPU (${TOTAL_OCPU}) exceeds hard cap (${MAX_TOTAL_OCPU})." >&2
  exit 1
fi

if (( TOTAL_MEMORY_GB > MAX_TOTAL_MEMORY_GB )); then
  echo "Planned memory (${TOTAL_MEMORY_GB} GB) exceeds hard cap (${MAX_TOTAL_MEMORY_GB} GB)." >&2
  exit 1
fi

MONTHLY_OCPU_HOURS=$(( TOTAL_OCPU * 24 * DAYS_IN_MONTH ))
MONTHLY_MEMORY_GB_HOURS=$(( TOTAL_MEMORY_GB * 24 * DAYS_IN_MONTH ))

if (( MONTHLY_OCPU_HOURS > MAX_MONTHLY_OCPU_HOURS )); then
  echo "Worst-case OCPU hours (${MONTHLY_OCPU_HOURS}) exceeds monthly free limit (${MAX_MONTHLY_OCPU_HOURS})." >&2
  exit 1
fi

if (( MONTHLY_MEMORY_GB_HOURS > MAX_MONTHLY_MEMORY_GB_HOURS )); then
  echo "Worst-case memory GB-hours (${MONTHLY_MEMORY_GB_HOURS}) exceeds monthly free limit (${MAX_MONTHLY_MEMORY_GB_HOURS})." >&2
  exit 1
fi

STORAGE_LIMIT_BYTES=$(( STORAGE_LIMIT_GB * 1024 * 1024 * 1024 ))
DB_BYTES="$(size_bytes "${DB_PATH}")"
BACKUP_BYTES="$(size_bytes "${BACKUP_DIR}")"
LOG_BYTES="$(size_bytes "${LOG_DIR}")"
ARTIFACT_BYTES="$(size_bytes "${ARTIFACT_DIR}")"
TOTAL_STORAGE_BYTES=$(( DB_BYTES + BACKUP_BYTES + LOG_BYTES + ARTIFACT_BYTES ))

if (( TOTAL_STORAGE_BYTES > STORAGE_LIMIT_BYTES )); then
  echo "Storage usage exceeds ${STORAGE_LIMIT_GB} GB guardrail." >&2
  echo "db=${DB_BYTES} backup=${BACKUP_BYTES} logs=${LOG_BYTES} artifacts=${ARTIFACT_BYTES}" >&2
  exit 1
fi

echo "Guardrail check passed"
echo "Total OCPU: ${TOTAL_OCPU}"
echo "Total memory GB: ${TOTAL_MEMORY_GB}"
echo "31-day OCPU-hours: ${MONTHLY_OCPU_HOURS} / ${MAX_MONTHLY_OCPU_HOURS}"
echo "31-day memory GB-hours: ${MONTHLY_MEMORY_GB_HOURS} / ${MAX_MONTHLY_MEMORY_GB_HOURS}"
echo "Storage bytes used: ${TOTAL_STORAGE_BYTES} / ${STORAGE_LIMIT_BYTES}"
