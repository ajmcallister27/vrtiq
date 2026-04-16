#!/usr/bin/env bash
set -Eeuo pipefail

APP_ROOT="${APP_ROOT:-/srv/vrtiq/app}"
BACKEND_DIR="${BACKEND_DIR:-${APP_ROOT}/backend}"
TARGET_BRANCH="${TARGET_BRANCH:-master}"
SERVICE_NAME="${SERVICE_NAME:-vrtiq-backend}"
HEALTH_PORT="${PORT:-3000}"

if [[ ! -d "${APP_ROOT}" ]]; then
  echo "APP_ROOT does not exist: ${APP_ROOT}" >&2
  exit 1
fi

if [[ ! -d "${BACKEND_DIR}" ]]; then
  echo "BACKEND_DIR does not exist: ${BACKEND_DIR}" >&2
  exit 1
fi

cd "${APP_ROOT}"
git fetch --prune origin

CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [[ "${CURRENT_BRANCH}" != "${TARGET_BRANCH}" ]]; then
  git checkout "${TARGET_BRANCH}"
fi

git pull --ff-only origin "${TARGET_BRANCH}"

cd "${BACKEND_DIR}"
npm ci
npm run generate
npm run migrate:deploy
bash ./deploy/predeploy-check.sh

sudo systemctl daemon-reload
sudo systemctl restart "${SERVICE_NAME}"
sudo systemctl is-active --quiet "${SERVICE_NAME}"

curl --fail --silent --show-error "http://127.0.0.1:${HEALTH_PORT}/health/ready" > /dev/null

echo "Deploy completed successfully."
