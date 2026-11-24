#!/usr/bin/env bash
# Re-capture app screenshots used in the deck (utils/assets/screens/*.png).
# Uses a PRODUCTION build on port 3001 (no Next.js dev badge, no stale dev cache) + headless Chrome.
# Run from repo root. Stop `npm run dev` first (build and dev share apps/web/.next).
set -euo pipefail
cd "$(dirname "$0")/.."
D=utils/assets/screens; mkdir -p "$D"
C="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
P="$(mktemp -d)"
(cd apps/web && npx next build >/dev/null && (npx next start -p 3001 >/dev/null 2>&1 &) )
sleep 5
shot() { "$C" --headless=new --disable-gpu --hide-scrollbars --user-data-dir="$P" --force-device-scale-factor=2 \
  --window-size="$3" --virtual-time-budget=6000 --screenshot="$D/$1.png" "http://localhost:3001$2" >/dev/null 2>&1; }
shot dashboard / 1280,860
shot subject /subjects/os 1280,1000
shot report /reports/r-os-3 1280,1100
shot quiz-intro /subjects/dbms/quiz 1280,900
shot study /subjects/os/study 1280,800
shot about /about 1280,1400
pkill -f "next start -p 3001" || true
rm -rf apps/web/.next   # so the next `npm run dev` starts clean
echo "screens written to $D"
