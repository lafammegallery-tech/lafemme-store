#!/bin/sh
# Install this in a protected directory and supply MARKET_SYNC_SECRET via a protected environment.
set -eu
: "${MARKET_SYNC_SECRET:?Set MARKET_SYNC_SECRET}"
SITE_URL="${SITE_URL:-http://127.0.0.1:8090}"
curl --fail --silent --show-error --max-time 60 -X POST \
  -H "Authorization: Bearer $MARKET_SYNC_SECRET" "$SITE_URL/api/maintenance"
