#!/usr/bin/env bash

# Laravel deployment operations
# This script handles all Laravel-related deployment tasks

set -euo pipefail

PHP="/usr/bin/php"
COMPOSER="/usr/bin/composer"
APP_DIR="$1"
ENVIRONMENT="${2:-dev}"  # Default to 'dev' if not provided

echo "[$(date '+%F %T')] Starting Laravel operations..."

# Change to app directory
cd "$APP_DIR"

# Determine source env file based on environment
if [[ "$ENVIRONMENT" == "prod" ]]; then
    ENV_SOURCE=".env.prod"
else
    ENV_SOURCE=".env.stg"
fi

echo "Environment: $ENVIRONMENT (using $ENV_SOURCE)"

# Merge .env.db with environment-specific file
echo "Merging .env.db with $ENV_SOURCE"
if [[ -f .env.db && -f "$ENV_SOURCE" ]]; then
  cat .env.db >> "$ENV_SOURCE"
  echo "✓ .env.db merged with $ENV_SOURCE"
else
  echo "No .env.db file to merge or $ENV_SOURCE file missing, skipping merge step"
fi

# Replace .env file with environment-specific file
echo "Replacing .env with $ENV_SOURCE..."
if [[ -f "$ENV_SOURCE" ]]; then
  cp "$ENV_SOURCE" .env
  echo "✓ .env file updated from $ENV_SOURCE"
else
  echo "⚠ Warning: $ENV_SOURCE file not found, keeping current .env"
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