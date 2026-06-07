#!/usr/bin/env bash

# Git deployment operations
# This script handles all git-related deployment tasks

set -euo pipefail

REMOTE="origin"
APP_DIR="$1"
BRANCH="${2:-main}"

# Setup logging
LOG_FILE="$APP_DIR/storage/logs/git-deploy.log"
mkdir -p "$APP_DIR/storage/logs"
exec &>> "$LOG_FILE"

echo "[$(date '+%F %T')] Starting git operations..."

# Change to app directory
cd "$APP_DIR"

# Fetch latest refs
echo "git fetch --prune '$REMOTE'"
git fetch --prune "$REMOTE"

# Check for new commits on the target branch
LOCAL=$(git rev-parse "$BRANCH")
echo "local $BRANCH: $LOCAL"
REMOTE_BRANCH=$(git rev-parse "$REMOTE/$BRANCH")
echo "remote $REMOTE/$BRANCH: $REMOTE_BRANCH"

if [[ "$LOCAL" == "$REMOTE_BRANCH" ]]; then
  echo "[$(date '+%F %T')] No changes detected on $REMOTE/$BRANCH — nothing to deploy."
  exit 200  # sentinel: "no changes" (distinct from a real git failure)
else
  echo "[$(date '+%F %T')] Changes detected on $REMOTE/$BRANCH — proceeding with deployment…"
fi

# Checkout and update
git checkout "$BRANCH"

# Clean + hard reset to ensure pristine working tree
git reset --hard
git pull --ff-only "$REMOTE" "$BRANCH"

echo "[$(date '+%F %T')] Git operations completed successfully"