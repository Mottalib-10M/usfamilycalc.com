#!/bin/zsh
# Re-download an official WC source into research/raw with browser-like headers.
# usage: wc_fetch.sh <outfile> <url>
cd "$(dirname "$0")/../raw" || exit 1
curl -sL --http2 --compressed --max-time 60 -o "$1" -w "$1 %{http_code} %{size_download}\n" "$2" \
 -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36' \
 -H 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,application/pdf,*/*;q=0.8' -H 'Accept-Language: en-US,en;q=0.9' \
 -H 'Sec-Fetch-Dest: document' -H 'Sec-Fetch-Mode: navigate' -H 'Sec-Fetch-Site: none' -H 'Sec-Fetch-User: ?1' -H 'Upgrade-Insecure-Requests: 1' \
 -H 'sec-ch-ua: "Chromium";v="129", "Not=A?Brand";v="8"' -H 'sec-ch-ua-mobile: ?0' -H 'sec-ch-ua-platform: "macOS"'
