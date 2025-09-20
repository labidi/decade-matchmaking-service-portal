#!/usr/bin/env bash

echo "[$(date '+%F %T')] Deploy start"

#be very strict
#next line is for production use only
set -euo pipefail
#next line is for debugging only, comment in production
#set -euxo pipefail

# Configuration
APP_DIR="/var/www/html/decade-matchmaking-service-portal_dev"
BRANCH="main"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/scripts"

printf "deploying $BRANCH in $APP_DIR \n"

# sanity check
[[ -d "$APP_DIR/.git" ]] || { echo "Not a git repo: $APP_DIR"; exit 1; }

# Make scripts executable
chmod +x "$SCRIPT_DIR"/*.sh

# Execute git operations
echo "[$(date '+%F %T')] Running git operations..."
if ! "$SCRIPT_DIR/git-deploy.sh" "$APP_DIR"; then
  if [[ $? -eq 1 ]]; then
    echo "[$(date '+%F %T')] No changes detected — exiting."
    exit 0
  else
    echo "[$(date '+%F %T')] Git operations failed"
    exit 1
  fi
fi

# Execute Laravel and NPM operations in parallel
echo "[$(date '+%F %T')] Running Laravel and NPM operations in parallel..."

# Start Laravel operations in background
"$SCRIPT_DIR/laravel-deploy.sh" "$APP_DIR" &
LARAVEL_PID=$!

# Start NPM operations in background
"$SCRIPT_DIR/npm-deploy.sh" "$APP_DIR" &
NPM_PID=$!

# Wait for Laravel operations
echo "Waiting for Laravel operations to complete..."
wait $LARAVEL_PID
LARAVEL_EXIT_CODE=$?
if [[ $LARAVEL_EXIT_CODE -ne 0 ]]; then
  echo "Laravel operations failed with exit code $LARAVEL_EXIT_CODE"
  exit $LARAVEL_EXIT_CODE
fi
echo "✓ Laravel operations completed"

# Wait for NPM operations
echo "Waiting for NPM operations to complete..."
wait $NPM_PID
NPM_EXIT_CODE=$?
if [[ $NPM_EXIT_CODE -ne 0 ]]; then
  echo "NPM operations failed with exit code $NPM_EXIT_CODE"
  exit $NPM_EXIT_CODE
fi
echo "✓ NPM operations completed"

echo "[$(date '+%F %T')] Deploy finished OK"

