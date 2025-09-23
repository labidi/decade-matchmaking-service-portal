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

# Replace .env file with staging environment
#echo "Replacing .env with .env.stg..."
#if [[ -f .env.stg ]]; then
#  cp .env.stg .env
#  echo "✓ .env file updated from .env.stg"
#else
#  echo "⚠ Warning: .env.stg file not found, keeping current .env"
#fi

# Install composer dependencies
echo "Installing composer dependencies..."
$COMPOSER install --prefer-dist --no-interaction --optimize-autoloader

# Check if migrations are needed
echo "Checking for pending migrations..."
MIGRATION_STATUS=$($PHP artisan migrate:status --pending 2>/dev/null | grep -c "Pending" || echo "0")

if [[ "$MIGRATION_STATUS" -gt 0 ]]; then
  echo "running migrations..."
  $PHP artisan migrate -n --force
else
  echo "skipping migration step"
fi

# Laravel optimization commands
echo "Running Laravel optimizations..."
$PHP artisan config:cache
$PHP artisan route:cache
$PHP artisan view:cache

echo "[$(date '+%F %T')] Laravel operations completed successfully"