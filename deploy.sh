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

printf "deploying $BRANCH in $APP_DIR \n"

# --- CONFIG ---
REMOTE="origin"

PHP="/usr/bin/php"
COMPOSER="/usr/bin/composer"
NPM="/usr/bin/npm"
# --------------

# sanity check
[[ -d "$APP_DIR/.git" ]] || { echo "Not a git repo: $APP_DIR"; exit 1; }

echo "changing to: $APP_DIR"

cd "$APP_DIR"

# fetch latest refs
echo "git fetch --prune '$REMOTE'"
git fetch --prune "$REMOTE"

# Check for new commits on the target branch
LOCAL=$(git rev-parse "$BRANCH")
echo "local $BRANCH: $LOCAL"
REMOTE_BRANCH=$(git rev-parse "$REMOTE/$BRANCH")
echo "remote $REMOTE/$BRANCH: $REMOTE_BRANCH"

if [[ "$LOCAL" == "$REMOTE_BRANCH" ]]; then
  echo "[$(date '+%F %T')] No changes detected on $REMOTE/$BRANCH — exiting."
  exit 0
else
  echo "[$(date '+%F %T')] Changes detected on $REMOTE/$BRANCH — proceeding with deployment…"
fi

git checkout "$BRANCH"

# clean + hard reset to ensure pristine working tree
git reset --hard
#git clean -fdx
git pull --ff-only "$REMOTE" "$BRANCH"

# backend deps & migrations
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

$PHP artisan config:cache
$PHP artisan route:cache
$PHP artisan view:cache

# frontend deps & build
if [[ -f package-lock.json ]]; then
  $NPM ci --no-audit --no-fund
else
  $NPM install --no-audit --no-fund
fi

$NPM run build

echo "[$(date '+%F %T')] Deploy finished OK"

