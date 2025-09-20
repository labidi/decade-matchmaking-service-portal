#!/usr/bin/env bash

# Node.js/NPM deployment operations
# This script handles all frontend build-related deployment tasks

set -euo pipefail

NPM="/usr/bin/npm"
APP_DIR="$1"

echo "[$(date '+%F %T')] Starting NPM operations..."

# Change to app directory
cd "$APP_DIR"

# Install npm dependencies
echo "Installing npm dependencies..."
if [[ -f package-lock.json ]]; then
  $NPM ci --no-audit --no-fund
else
  $NPM install --no-audit --no-fund
fi

# Build frontend assets
echo "Building frontend assets..."
$NPM run build

echo "[$(date '+%F %T')] NPM operations completed successfully"