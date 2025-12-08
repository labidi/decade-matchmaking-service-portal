#!/usr/bin/env bash

# Laravel deployment operations
# This script handles all Laravel-related deployment tasks

set -euo pipefail

PHP="/usr/bin/php"
COMPOSER="/usr/bin/composer"
APP_DIR="$1"
ENVIRONMENT="${2:-dev}"  # Default to 'dev' if not provided
$PHP artisan log:text "Clearing caches..."
$PHP artisan optimize:clear
# Setup logging
LOG_FILE="$APP_DIR/storage/logs/laravel-deploy.log"
mkdir -p "$APP_DIR/storage/logs"
exec &>> "$LOG_FILE"

$PHP artisan log:text  "[$(date '+%F %T')] Starting Laravel operations..."

# Change to app directory
cd "$APP_DIR"

# Determine source env file based on environment
if [[ "$ENVIRONMENT" == "prod" ]]; then
    ENV_SOURCE=".env.prod"
else
    ENV_SOURCE=".env.stg"
fi

$PHP artisan log:text "Environment: $ENVIRONMENT (using $ENV_SOURCE)"

# Merge .env.db with environment-specific file
$PHP artisan log:text "Merging .env.db with $ENV_SOURCE"
if [[ -f .env.db && -f "$ENV_SOURCE" ]]; then
  cat .env.db >> "$ENV_SOURCE"
  $PHP artisan log:text "✓ .env.db merged with $ENV_SOURCE"
else
  $PHP artisan log:text "No .env.db file to merge or $ENV_SOURCE file missing, skipping merge step"
fi

# Replace .env file with environment-specific file
$PHP artisan log:text "Replacing .env with $ENV_SOURCE..."
if [[ -f "$ENV_SOURCE" ]]; then
  cp "$ENV_SOURCE" .env
  $PHP artisan log:text "✓ .env file updated from $ENV_SOURCE"
else
  $PHP artisan log:text "⚠ Warning: $ENV_SOURCE file not found, keeping current .env"
fi

# Install composer dependencies
$PHP artisan log:text "Installing composer dependencies..."
$COMPOSER install --prefer-dist --no-interaction --optimize-autoloader
$COMPOSER  dump-autoload
$PHP artisan log:text "Clearing caches..."
$PHP artisan optimize:clear
# Check if migrations are needed
$PHP artisan log:text "Applying database migrations if needed..."
$PHP artisan migrate -n --force
# Laravel optimization commands
$PHP artisan log:text "Running Laravel optimizations..."
$PHP artisan config:cache
$PHP artisan event:cache
$PHP artisan route:cache
# Generate Ziggy routes
$PHP artisan ziggy:generate
$PHP artisan storage:link

$PHP artisan log:text "[$(date '+%F %T')] Laravel operations completed successfully"