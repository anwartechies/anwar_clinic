#!/usr/bin/env bash
#
# Backend deploy, run on the EC2 box by POST /deploy/:target (mirrors rhinon-cms).
#
# NEVER executed from its checkout: routes/deploy.ts copies this file to /tmp and runs
# the copy, because bash reads a script lazily — the `git pull` below would otherwise
# rewrite the very bytes this shell is about to execute.
#
# The caller double-forks it (see routes/deploy.ts) so it is not a descendant of the
# API: pm2's treekill would otherwise kill it at `pm2 restart`. Nothing is waiting on
# our exit status: the EXIT trap writing $EXIT_FILE is the only completion signal.
#
# Required env: REPO APP_DIR BRANCH PROC PORT HEALTH_PATH LOG EXIT_FILE META_FILE

set -uo pipefail

mkdir -p "$(dirname "$LOG")"
exec >>"$LOG" 2>&1

STEP="starting"
finish() {
  local code=$?
  if [ "$code" -ne 0 ]; then
    echo ""
    echo "=== FAILED during: $STEP (exit $code) ==="
  fi
  echo "$code" >"$EXIT_FILE"
}
trap finish EXIT
# Being killed is a failure, never a success: without these, the EXIT trap can
# record the last command's status (often 0) for a script that was interrupted.
trap 'exit 130' INT
trap 'exit 143' TERM

say() { echo ""; echo "▸ $1"; STEP="$1"; }
die() { echo "$1"; exit 1; }

echo "=== Deploy $PROC ($BRANCH) — $(date -u '+%Y-%m-%d %H:%M:%S UTC') ==="
echo "repo: $REPO/$APP_DIR"

cd "$REPO" || die "repo not found: $REPO"

# A detached child doesn't get a login shell; pull in nvm if node tools aren't on PATH.
if ! command -v pm2 >/dev/null 2>&1; then
  # shellcheck disable=SC1090
  [ -s "$HOME/.nvm/nvm.sh" ] && . "$HOME/.nvm/nvm.sh" >/dev/null 2>&1
fi
command -v pm2 >/dev/null 2>&1 || die "pm2 not on PATH"
command -v npm >/dev/null 2>&1 || die "npm not on PATH"

BEFORE=$(git rev-parse HEAD)
echo "commit before: $BEFORE"

say "git pull (origin/$BRANCH)"
git fetch origin "$BRANCH" || exit $?
git checkout "$BRANCH" || exit $?
git pull --ff-only origin "$BRANCH" || exit $?

AFTER=$(git rev-parse HEAD)
SUBJECT=$(git log -1 --pretty=%s)
echo "commit after:  $AFTER"
echo "               $SUBJECT"

# Hand the SHAs back to the API for the history row. Written before the build so a
# failed deploy still records what it was trying to ship. Plain key=value lines.
{
  echo "before=$BEFORE"
  echo "after=$AFTER"
  echo "message=$SUBJECT"
} >"$META_FILE" 2>/dev/null || true

cd "$APP_DIR" || die "backend dir missing: $REPO/$APP_DIR"

# Only reinstall when dependencies actually moved (pathspecs are relative to this dir).
# `npm ci` rather than `npm install`: it never rewrites the committed lockfile, so the
# checkout stays clean and the next `git pull --ff-only` can't be blocked by it.
if [ -d node_modules ] && git diff --quiet "$BEFORE" "$AFTER" -- package-lock.json package.json 2>/dev/null; then
  echo ""
  echo "▸ npm ci — skipped (dependencies unchanged)"
else
  say "npm ci"
  npm ci || exit $?
fi

# Build BEFORE restarting: a compile error must fail the deploy with the old build
# still serving traffic, never take the process down.
say "npm run build"
npm run build || exit $?

say "pm2 restart $PROC"
pm2 restart "$PROC" --update-env --no-color || exit $?
pm2 save || true

say "health check :$PORT$HEALTH_PATH"
for i in $(seq 1 30); do
  if curl -fsS --max-time 3 "http://localhost:$PORT$HEALTH_PATH" >/dev/null 2>&1; then
    echo "healthy after ${i}s"
    echo ""
    echo "=== SUCCESS — $(date -u '+%Y-%m-%d %H:%M:%S UTC') ==="
    exit 0
  fi
  sleep 1
done

die "did not pass health check within 30s — check: pm2 logs $PROC"
