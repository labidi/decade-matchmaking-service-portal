#!/usr/bin/env bash

# Laravel deployment operations
# This script handles all Laravel-related deployment tasks

set -euo pipefail

PHP="/usr/bin/php"
COMPOSER="/usr/bin/composer"
APP_DIR="$1"

echo "[$(date '+%F %T')] Starting Laravel operations..."

# Change to app directory
cd "$APP_DIR"

# Merge .env.db with .env.stg
echo "Merging .env.db with .env.stg..."
if [[ -f .env.db && -f .env.stg ]]; then
  cat .env.db >> .env.stg
  echo "✓ .env.db merged with .env.stg"
else
  echo "No .env.db file to merge or .env.stg file missing, skipping merge step"
fi

# Replace .env file with staging environment
echo "Replacing .env with .env.stg..."
if [[ -f .env.stg ]]; then
  cp .env.stg .env
  echo "✓ .env file updated from .env.stg"
else
  echo "⚠ Warning: .env.stg file not found, keeping current .env"
fi

# Install composer dependencies
echo "Installing composer dependencies..."
$COMPOSER install --prefer-dist --no-interaction --optimize-autoloader

# Check if migrations are needed
echo "Applying database migrations if needed..."
$PHP artisan migrate -n --force


# Laravel optimization commands
echo "Running Laravel optimizations..."
$PHP artisan config:cache
$PHP artisan route:cache
$PHP artisan view:cache

echo "[$(date '+%F %T')] Laravel operations completed successfully"