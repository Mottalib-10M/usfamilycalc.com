#!/bin/zsh
# Retry Wayback Machine copies of official URLs that block direct access.
# usage: wc_wayback.sh <outfile> <official url> [timestamp=2026]
cd "$(dirname "$0")/../raw" || exit 1
ts=${3:-2026}
for i in 1 2 3 4 5 6; do
  curl -sL --max-time 150 -o "$1.tmp" "https://web.archive.org/web/${ts}id_/$2" && [ -s "$1.tmp" ] && mv "$1.tmp" "$1" && echo "OK $1" && exit 0
  sleep 20
done
rm -f "$1.tmp"; echo "FAIL $1"
