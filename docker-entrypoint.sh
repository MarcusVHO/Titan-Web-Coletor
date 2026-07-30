#!/bin/sh
set -e

# Generate runtime env-config.js from container environment variables
cat <<EOF > /app/dist/env-config.js
window.__ENV__ = {
  VITE_API_URL: "${VITE_API_URL:-$VITE_API_BASE_URL}",
  VITE_SUPPLY_API_URL: "${VITE_SUPPLY_API_URL:-$VITE_SUPPLY_API_BASE_URL}"
};
EOF

exec "$@"
