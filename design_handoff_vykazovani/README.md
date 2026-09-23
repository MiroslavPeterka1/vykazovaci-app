# Handoff: Vykazovátko – landing page

## Overview
Jednostránkový statický web, který představuje aplikaci Výkazy práce (`https://vykazovatko.web.app`) a odkazuje do ní. Web poběží na **Cloudflare Pages** a má ho indexovat Google. Aplikace sama má `noindex`, takže landing page je jediná indexovaná vstupní stránka.

Obsah stojí na třech sdělení:
1. k čemu aplikace slouží,
2. je celá zdarma a neexistuje placená verze,
3. data nikdo jiný nevyužívá a smazáním účtu se automaticky smažou všechna.

## About the Design Files
`Landing Page.dc.html` je **designová reference v HTML**, ne kód k nasazení. Běží na runtime prototypu (`support.js`), který obsah vykreslí JavaScriptem. Pro SEO je to nevhodné, proto stránku **znovu postavte jako čistý statický HTML soubor**, kde je veškerý text přímo v markupu.

Náhled: otevřete `Landing Page.dc.html` v prohlížeči. `support.js`, `image-slot.js` a `.image-slots.state.json` musí ležet ve stejné složce. Obsah karet (sekce „K čemu slouží“ a „Vaše data patří jen vám“) je v poli `features` / `promises` ve třídě `Component` na konci souboru.

## Doporučená implementace
- **Umístění:** nový adresář `landing/` v repozitáři `vykazovaci-app` (nebo samostatné repo). Nesmí zasahovat do buildu aplikace (`dist/`, Firebase hosting).
- **Technologie:** čistý `index.html` + jeden `styles.css`, bez frameworku a bez JavaScriptu. Nic z toho, co stránka dělá, JS nepotřebuje.
- **Cloudflare Pages:** build command žádný, output directory `landing/`.
- **Soubory k vytvoření:**
  - `landing/index.html`
  - `landing/styles.css`
  - `landing/assets/screenshot-prehled.webp` (+ ideálně `@2x`)
  - `landing/favicon.ico`, `landing/apple-touch-icon.png` (zkopírovat z `public/` aplikace)
  - `landing/og-image.png` (1200×630, pro sdílení)
  - `landing/robots.txt` (`User-agent: *`, `Allow: /`, `Sitemap: https://<doména>/sitemap.xml`)
  - `landing/sitemap.xml` (jedna URL)
  - `landing/_headers` (Cloudflare: cache pro `/assets/*`, bezpečnostní hlavičky)
  - `landing/404.html` (jednoduchá, s odkazem na úvod)

## SEO a `<head>`
- `<html lang="cs">`
- `<title>Vykazovátko – bezplatná evidence zákazníků a výkazů práce</title>`
- `<meta name="description" content="Vykazovátko je bezplatná webová aplikace pro evidenci zákazníků a vykazování odpracovaného času. Vaše data vidíte jen vy a smazáním účtu zmizí všechna.">`
- `<link rel="canonical" href="https://<doména landing page>/">` — doménu doplní uživatel
- Open Graph: `og:type=website`, `og:title`, `og:description`, `og:url`, `og:image`, `og:locale=cs_CZ`; `twitter:card=summary_large_image`
- `<meta name="theme-color" content="#1976d2">`
- Strukturovaná data JSON-LD `SoftwareApplication`: `name` „Vykazovátko“, `applicationCategory` „BusinessApplication“, `operatingSystem` „Web“, `url` `https://vykazovatko.web.app`, `offers` `{ "@type": "Offer", "price": "0", "priceCurrency": "CZK" }`, `inLanguage` „cs“
- Jeden `<h1>`, sekce s `<h2>`, karty s `<h3>` (hierarchie odpovídá návrhu)
- Screenshot: `<img>` s `alt="Přehled běžících a odpracovaných činností v aplikaci Vykazovátko"`, `width`/`height` kvůli CLS, `fetchpriority="high"` (je nad ohybem)
- Fonty: Google Fonts Roboto 400/500/700 + Roboto Mono 500, `display=swap`, `preconnect`. Volitelně self-hostovat.

## Fidelity
**High-fidelity.** Barvy, písmo a rozměry odpovídají tématu aplikace (`src/theme.ts`, výchozí MUI light). Texty použijte **doslova** tak, jak jsou v návrhu.

## Layout a sekce
Obsah je vystředěný, `max-width: 1120px`, vodorovný padding 24px. Stránka je plně fluidní: všechny mřížky používají `repeat(auto-fit, minmax(min(100%, X), 1fr))` a samy se zalamují až do jednoho sloupce.

### 1. Hlavička (`<header>`)
- Spodní okraj `1px solid rgba(0,0,0,.08)`, padding 16/24.
- Vlevo logo: čtverec 32×32, radius 4, `#1976d2`, bílé „V“ 17px/500. Vedle „Vykazovátko“ 18px/500. Gap 12.
- Vpravo odkaz **PŘIHLÁSIT SE** → `https://vykazovatko.web.app`, outlined: border `1px solid rgba(25,118,210,.5)`, radius 4, padding 8/16, 14px/500, letter-spacing .4px, `#1976d2`. Hover: pozadí `rgba(25,118,210,.04)`, border `#1976d2`.

### 2. Hero
- Pozadí `#f5f5f5`, spodní okraj `rgba(0,0,0,.08)`. Padding 72/24/64.
- Dva sloupce `minmax(min(100%, 420px), 1fr)`, gap 48, svisle na střed. Pod ~940 px pod sebou.
- **Levý sloupec:**
  - Štítek „Zdarma, bez reklam a bez omezení“: `#e8f5e9` / text `#1b5e20`, radius 16, padding 5/12, 13px/500, margin-bottom 20.
  - `<h1>` „Evidence zákazníků a výkazů práce na jednom místě“: `font-size: clamp(34px, 4.6vw, 48px)`, line-height 1.12, 500, letter-spacing −.5px, `text-wrap: balance`.
  - Perex (18px, line-height 1.6, `rgba(0,0,0,.7)`, max-width 520, `text-wrap: pretty`): „Zapisujte, kdy jste pro koho začali a skončili pracovat. Vykazovátko spočítá odpracovaný čas, pohlídá, co už je vyfakturované, a výkaz za měsíc nebo rok vám připraví v Excelu.“
  - Řádek (flex-wrap, gap 12): tlačítko **ZAČÍT** → `https://vykazovatko.web.app` (contained `#1976d2`, bílý text, radius 4, padding 13/28, 15px/500, letter-spacing .4px, stín MUI elevation 2, hover `#1565c0`) a vedle text „Registrace e-mailem nebo účtem Google“ (14px, `rgba(0,0,0,.6)`).
- **Pravý sloupec — okno se screenshotem:**
  - Rámeček: `#fff`, radius 8, border `1px solid rgba(0,0,0,.08)`, stín `0 11px 15px -7px rgba(0,0,0,.12), 0 24px 38px 3px rgba(0,0,0,.08)`, `overflow: hidden`.
  - Lišta okna výšky 28px, `#eceff1`, vlevo tři kolečka 9px `rgba(0,0,0,.18)`, gap 6, padding 0/12.
  - Obrázek v poměru **16:10**, `object-fit: cover`, `object-position` vlevo nahoře.

### 3. K čemu slouží
- Padding 72/24. `<h2>` „K čemu slouží“ 28px/500. Podtitul 16px `rgba(0,0,0,.6)`, max-width 620, line-height 1.6, margin-bottom 40: „Pro živnostníky, konzultanty a všechny, kdo účtují podle odpracovaných hodin.“
- Mřížka `minmax(min(100%, 180px), 1fr)`, gap 32 svisle / 40 vodorovně (4 sloupce od ~840 px obsahu).
- Každá položka: číslo (Roboto Mono 13px/500, `#1976d2`, mb 10), `<h3>` 17px/500 (mb 8), text 15px, line-height 1.6, `rgba(0,0,0,.7)`.

| Číslo | Nadpis | Text |
| --- | --- | --- |
| 01 | Zákazníci | Adresář zákazníků s IČ, DIČ, kontakty a poznámkou. Vyhledávání napříč všemi údaji. |
| 02 | Start a stop | Činnost spustíte jedním klikem a ukončíte, až skončíte. Může jich běžet i víc najednou. |
| 03 | Přehled fakturace | U každé činnosti vidíte, jestli je vyfakturovaná a s jakým DUZP. Součty za měsíc i celkem. |
| 04 | Výkaz do Excelu | Pracovní výkaz za měsíc nebo za celý rok stáhnete jako hotový soubor .xlsx pro zákazníka. |

### 4. Vaše data patří jen vám
- Pozadí `#f5f5f5`, horní i spodní okraj `rgba(0,0,0,.08)`, padding 72/24. `<h2>` 28px/500, mb 40.
- Mřížka `minmax(min(100%, 240px), 1fr)`, gap 24 (3 sloupce od ~770 px obsahu).
- Karta: `#fff`, radius 4, padding 28/24, stín MUI elevation 1 (`0 2px 1px -1px rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 1px 3px 0 rgba(0,0,0,.12)`). Nahoře kruh 40px (barvy v tabulce) se znakem 18px/700, mb 18. `<h3>` 18px/500 (mb 10), text 15px, line-height 1.65, `rgba(0,0,0,.7)`.

| Znak | Kruh / znak | Nadpis | Text |
| --- | --- | --- | --- |
| 0 | `#e8f5e9` / `#1b5e20` | Celá aplikace je zdarma | Žádné tarify, zkušební doba ani placené funkce. Neexistuje ani žádná placená verze. Všechno, co aplikace umí, máte k dispozici hned po registraci. |
| ◉ | `#e3f2fd` / `#1565c0` | Nikdo jiný data nevyužívá | Záznamy vidíte jen vy. Nikomu je neposkytujeme, neprodáváme a nepoužíváme k reklamě ani k analýzám. |
| × | `#fdeded` / `#c62828` | Smazání účtu smaže vše | Účet můžete kdykoli zrušit v profilu. Spolu s ním se automaticky a nenávratně smažou všichni zákazníci i všechny výkazy. |

Znaky v kruzích jsou zástupné. Nahraďte je inline SVG ikonami Material Icons (např. `Savings`/`MoneyOff`, `Lock`/`VisibilityOff`, `DeleteForever`), velikost 20–22px, `aria-hidden="true"`.

### 5. Závěrečná výzva
- Vystředěný blok, max-width 720, padding 80/24, text na střed.
- `<h2>` „Vyzkoušejte to na první zakázce“ 28px/500, mb 12, `text-wrap: balance`.
- Text 16px, line-height 1.6, `rgba(0,0,0,.65)`, mb 28: „Účet založíte za minutu. Když vám aplikace nesedne, smažete ho i se všemi daty.“
- Tlačítko **OTEVŘÍT APLIKACI** → `https://vykazovatko.web.app`, stejný styl jako ZAČÍT.

### 6. Patička (`<footer>`)
- Horní okraj `1px solid rgba(0,0,0,.12)`, padding 20/24, 13px, `rgba(0,0,0,.6)`, flex-wrap, gap 8/20.
- „© 2026 Vykazovátko“ · odkaz „Podmínky použití“ → `https://vykazovatko.web.app/podminky` · odkaz „Ochrana osobních údajů“ → `https://vykazovatko.web.app/ochrana-osobnich-udaju` · vpravo (`margin-left: auto`) odkaz „vykazovatko.web.app“ → `https://vykazovatko.web.app`.
- Obě cesty existují v `src/routes/router.tsx` (`TERMS_PATH`, `PRIVACY_PATH`) a jsou veřejné, bez přihlášení.

## Interakce
- Stránka nemá žádné skripty. Všechny odkazy do aplikace jsou obyčejné `<a href>` ve stejném okně.
- Hover: odkazy `#1565c0` + podtržení, contained tlačítka `#1565c0` bez podtržení, outlined tlačítko viz hlavička. Přidat `:focus-visible` obrys `2px solid #1976d2`, offset 2px.
- Respektovat `prefers-reduced-motion` (stránka stejně nemá animace).

## Design Tokens
- **Barvy:** primary `#1976d2`, primary dark `#1565c0`; text `rgba(0,0,0,.87)`, sekundární `rgba(0,0,0,.6)`–`.7`; pozadí `#fff` / `#f5f5f5`; oddělovače `rgba(0,0,0,.08)` a `.12`; success `#e8f5e9` / `#1b5e20`; info `#e3f2fd` / `#1565c0`; error `#fdeded` / `#c62828`; lišta okna `#eceff1`.
- **Písmo:** Roboto (400/500/700), čísla Roboto Mono 500. H1 clamp 34–48px, H2 28px, H3 17–18px, perex 18px, tělo 15–16px, drobné 13–14px. Tlačítka UPPERCASE, 500, letter-spacing .4px.
- **Rozestupy:** 8 / 12 / 16 / 20 / 24 / 28 / 32 / 40 / 48 / 64 / 72 / 80.
- **Radius:** 4 (tlačítka, karty, logo), 8 (okno se screenshotem), 16 (štítek), 50 % (kruhy ikon).

## Assets
- `assets/screenshot-prehled.webp` — screenshot Přehledu vložený uživatelem (1020×440). **Pozor:** má jiný poměr než rámeček 16:10 a nízké rozlišení, v rámečku se ořízne. Požádejte uživatele o nový screenshot Přehledu ve velikosti aspoň 1600×1000 (16:10, ideálně 2× pro retina), nebo ho pořiďte z běžící aplikace s ukázkovými daty (bez skutečných zákazníků).
- Logo „V“ je CSS čtverec s písmenem, ne obrázek. Favicon a apple-touch-icon zkopírujte z `public/` aplikace.
- `og-image.png` 1200×630 zatím neexistuje. Vytvořte ho z loga, názvu a hlavního nadpisu na pozadí `#f5f5f5`.

## Files
- `Landing Page.dc.html` — návrh landing page (reference)
- `assets/screenshot-prehled.webp` — screenshot pro hero
- `support.js`, `image-slot.js`, `.image-slots.state.json` — runtime náhledu, **neimplementovat**
