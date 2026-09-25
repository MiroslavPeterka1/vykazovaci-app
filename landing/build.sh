#!/bin/sh
# Připraví dist/ z public/: doplní adresu webu a token Cloudflare Web Analytics.
# Stránka sama build nepotřebuje; jde jen o to, aby doména byla na jednom místě
# (proměnná SITE_URL v nastavení buildu na Cloudflare), ne rozesetá po souborech.
set -eu

: "${SITE_URL:?Nastavte SITE_URL, např. https://vykazovatko.online (bez lomítka na konci)}"
SITE_URL="${SITE_URL%/}"
CF_BEACON_TOKEN="${CF_BEACON_TOKEN:-}"

cd "$(dirname "$0")"
rm -rf dist
cp -R public dist

for file in dist/index.html dist/robots.txt dist/sitemap.xml; do
  sed "s|__SITE_URL__|$SITE_URL|g; s|__CF_BEACON_TOKEN__|$CF_BEACON_TOKEN|g" "$file" > "$file.tmp"
  mv "$file.tmp" "$file"
done

# Bez tokenu se měřicí skript vůbec nevloží (lokální vývoj, náhledové buildy).
if [ -z "$CF_BEACON_TOKEN" ]; then
  grep -v 'static.cloudflareinsights.com/beacon' dist/index.html > dist/index.html.tmp
  mv dist/index.html.tmp dist/index.html
fi

if grep -rl '__SITE_URL__\|__CF_BEACON_TOKEN__' dist; then
  echo 'V dist/ zůstal nenahrazený zástupný text.' >&2
  exit 1
fi
