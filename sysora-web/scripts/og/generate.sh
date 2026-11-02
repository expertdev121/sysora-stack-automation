#!/bin/bash
# Renders the 1200 by 630 share images into public/og with headless Chrome.
# Run it from sysora-web when a headline changes. The output is committed,
# so the build does not depend on Chrome or on Google Fonts being reachable.
set -euo pipefail

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
DIR="$(cd "$(dirname "$0")" && pwd)"
OUT="$DIR/../../public/og"
mkdir -p "$OUT"

render() {
  local query
  query=$(python3 -c 'import sys,urllib.parse as u;print(u.urlencode({"t":sys.argv[1],"s":sys.argv[2]}))' "$2" "$3")
  # Chrome sometimes writes the file and then never exits, so each render gets
  # its own profile and a watchdog. Success is judged by the file, not the exit.
  local profile
  profile=$(mktemp -d)
  rm -f "$OUT/$1.png"
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --user-data-dir="$profile" --window-size=1200,630 --virtual-time-budget=4000 \
    --screenshot="$OUT/$1.png" "file://$DIR/template.html?$query" >/dev/null 2>&1 &
  local pid=$! waited=0
  while kill -0 "$pid" 2>/dev/null && [ "$waited" -lt 45 ]; do
    [ -s "$OUT/$1.png" ] && sleep 1 && break
    sleep 1
    waited=$((waited + 1))
  done
  kill "$pid" 2>/dev/null || true
  wait "$pid" 2>/dev/null || true
  rm -rf "$profile"
  [ -s "$OUT/$1.png" ] || { echo "FAILED $1.png" >&2; exit 1; }
  echo "rendered $1.png"
}

render default "GoHighLevel and automation hours from \$13" "Send us the list. Unused hours are refundable."
render services "What the hours get spent on" "GoHighLevel, automation, integrations and software."
render guides "GoHighLevel guides, checked against the documentation" "A2P, costs, snapshots, migrations and the API."
render case-studies "Real hours, real dollars, and one honest overrun" "Four engagements from the public Upwork record."
render agencies "You keep the client. We do the delivery." "White-label GoHighLevel support, from \$95 for 5 hours."
render about "A new company, built on work that is not new" "19 jobs, 1,220 hours, 5.0 on every completed job."
