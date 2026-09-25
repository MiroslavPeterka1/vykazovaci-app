# Vykazovátko – prezentační web

Jednostránkový statický web, který z Googlu přivádí nové uživatele do aplikace
na `https://vykazovatko.web.app`. Nemá přihlašování ani vazbu na Firebase.
Návrh: `../design_handoff_vykazovani/Landing Page.dc.html` a `README.md` tamtéž.

- `public/` – zdrojové soubory (čisté HTML + CSS, bez JavaScriptu a bez frameworku)
- `build.sh` – zkopíruje `public/` do `dist/` a dosadí adresu webu a token analytiky
- `wrangler.jsonc` – Cloudflare Workers se statickými soubory z `dist/`

## Proč build.sh, když stránka build nepotřebuje

Canonical, `og:url`, `og:image`, `robots.txt` a `sitemap.xml` potřebují absolutní adresu
webu. V souborech je proto zástupný text `__SITE_URL__` a
skutečná adresa se nastavuje na jednom místě – v proměnné buildu na Cloudflare.
Při změně domény stačí změnit proměnnou a spustit nový build.

| Proměnná | Povinná | Význam |
| --- | --- | --- |
| `SITE_URL` | ano | Adresa webu bez lomítka na konci, `https://vykazovatko.online` |
| `CF_BEACON_TOKEN` | ne | Token Cloudflare Web Analytics; bez něj se měřicí skript nevloží |

Když v `dist/` zůstane nenahrazený zástupný text, build skončí chybou.

## Lokálně

```sh
SITE_URL=http://localhost:8788 ./build.sh
npx wrangler dev --port 8788
```

`wrangler dev` uplatní i `_headers` (CSP, cache) a 404 stránku.

## Nasazení (Cloudflare Workers Builds)

1. Cloudflare dashboard → Workers & Pages → Create → Import a repository → `vykazovaci-app`.
2. **Root directory:** `landing`
3. **Build command:** `./build.sh`, **Deploy command:** `npx wrangler deploy`
4. **Build watch paths:** include `landing/*` – změny v aplikaci web znovu nesestaví.
5. Proměnné buildu: `SITE_URL=https://vykazovatko.online`,
   `CF_BEACON_TOKEN` (Web Analytics → Add a site → ruční JS snippet → hodnota `token`).

Aplikace se nasazuje zvlášť přes `npm run deploy` v kořeni repa a `landing/` nijak neovlivňuje.

## Doména `vykazovatko.online`

1. Worker → Settings → Domains & Routes: přidat custom domain `vykazovatko.online`
   i `www.vykazovatko.online`. Adresu `*.workers.dev` a náhledové URL vypnout, ať Google
   nevidí stejný obsah na dvou adresách.
2. Rules → Redirect Rules → šablona „Redirect from WWW to root“ (301).
3. SSL/TLS: režim Full (strict), zapnout Always Use HTTPS.
4. Doména neposílá e-maily: DNS `TXT @ "v=spf1 -all"` a
   `TXT _dmarc "v=DMARC1; p=reject;"`, aby ji nikdo nemohl zneužít k podvrženým e-mailům.
5. Google Search Console: vlastnost typu Doména (ověření TXT záznamem v Cloudflare DNS),
   odeslat `https://vykazovatko.online/sitemap.xml`.

## Screenshot a obrázky

- `assets/prehled-{800,1600}.webp` – Přehled aplikace nad emulátory s vymyšlenými daty,
  pořízený v headless Chrome při 1440×900 a DPR 2, zmenšený na 16:10.
- `og-image.png` (1200×630) – vyrenderovaný z HTML se stejnými fonty.
- `favicon.png`, `icon-192.png`, `apple-touch-icon.png` – převzaté z `../public/`.
