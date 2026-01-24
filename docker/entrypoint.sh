#!/bin/sh
set -e

if [ -n "${OPENROUTER_API_KEY_FILE:-}" ] && [ -f "${OPENROUTER_API_KEY_FILE}" ]; then
  export VITE_OPENROUTER_API_KEY="$(cat "${OPENROUTER_API_KEY_FILE}")"
fi

if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

npm run dev -- --host 0.0.0.0 --port "${CONTAINER_WEB_PORT:-5173}"
