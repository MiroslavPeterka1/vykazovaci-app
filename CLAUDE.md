# CLAUDE.md

Tento soubor je vodítko pro Claude Code (claude.ai/code) při práci v tomto repozitáři.

## Co tohle repo je

**Vykazovátko** (původně Výkazy práce) — webová aplikace pro evidenci zákazníků a vykazování odpracované doby.
Víceuživatelská, každý uživatel vidí a spravuje **pouze svoje** záznamy. Veřejně dostupná,
registrace otevřená komukoli. Veškeré texty jsou **česky**.

Zadání je v [readme.md](readme.md), plán implementace vznikl v plan módu a repo ho plní po etapách.

## Příkazy

- `npm run dev` — vývojový server (http://localhost:5173)
- `npm run emulators` — Firebase emulátory (Auth 9099, Firestore 8080, Functions 5001, UI 4000).
  **Vyžaduje nainstalovanou Javu.** Hosting emulátor běží na 5055, protože port 5000 na macOS
  drží AirPlay Receiver.
- `npm run typecheck` / `npm run lint` / `npm test` — kontroly, které musí projít před commitem
- `npm run test:rules` — testy bezpečnostních pravidel; emulátor si spustí a zase zhasne samy
- `npm --prefix functions run build` — překlad Cloud Functions; emulátor i nasazení čtou `functions/lib`
- `npm run build` — build do `dist/`
- `npm run deploy` — build a nasazení do Firebase (hosting, rules, indexy, funkce);
  functions se překládají automaticky přes predeploy hook

Ostrý projekt je `vykazy-prace-cb9d5`, hosting běží na cíli `app` → `vykazovatko.web.app`.
Konfigurace pro build je v `.env.production` (mimo git).

Lokální vývoj běží proti emulátorům: `.env.local` míří na projekt `demo-vykazy`. Firebase
nikdy nepustí project ID s prefixem `demo-` na ostré služby, takže v něm nejsou žádné
skutečné klíče. Ostrá konfigurace se bere z `.env` podle [.env.example](.env.example).

## PWA

Aplikace jde nainstalovat jako samostatné okno (`display: standalone`). Manifest a service
worker generuje `vite-plugin-pwa` při buildu, ve vývojovém režimu se neregistrují.

- Ikony v `public/` vycházejí z loga v návrhu; generují se skriptem přes headless prohlížeč,
  nejsou kreslené ručně.
- Service worker předem ukládá jen vlastní přeložené soubory. **Do volání na Firebase
  nezasahuje** — data tak nikdy nejdou z cache a nemůžou se tvářit čerstvěji, než jsou.
- `sw.js`, `registerSW.js`, `index.html` a manifest mají v `firebase.json` nastavené
  `no-cache`. Kdyby se service worker kešoval, prohlížeč by novou verzi nikdy nenašel.
- Offline funguje samotná aplikace, ne data — Firestore offline persistence zapnutá není.

## Landing page

Prezentační web v [landing/](landing/) (podrobnosti v [landing/README.md](landing/README.md)).
Čisté HTML + CSS bez JavaScriptu, nasazuje se na Cloudflare Workers nezávisle na Firebase.

- Je to jediná indexovaná stránka: aplikace má `noindex`. Tlačítka vedou na
  `/prihlaseni?registrace`, které otevře rovnou záložku Registrace.
- Absolutní adresa webu je v souborech jako `__SITE_URL__` a dosazuje ji `landing/build.sh`
  z proměnné buildu (`SITE_URL=https://vykazovatko.online`).
- Fonty jsou self-hostované (žádné Google Fonts), měření je Cloudflare Web Analytics bez cookies.
- Texty slibů na landingu musí sedět s `src/content/terms.ts` a `privacy.ts`.

## Export výkazu do Excelu

Dialog v detailu zákazníka generuje .xlsx přímo v prohlížeči.

- **`src/domain/workReport.ts`** popíše sešit jako čistá data (`reportModel.ts`),
  **`src/export/writeWorkbook.ts`** ho teprve zapíše ExcelJS. Důvod: vzorce se odkazují na
  konkrétní čísla řádků a posun by se projevil až v Excelu u uživatele. Testy proto
  vygenerovaný soubor znovu načtou a ověří konkrétní buňky.
- **ExcelJS se načítá dynamickým importem** (256 kB gzip) a je vyřazený z offline cache
  service workeru — export potřebuje data z Firestore, takže bez sítě neproběhne tak jako tak.
- **Vzorce se do xlsx ukládají s čárkou** jako oddělovačem argumentů, i když je Excel českému
  uživateli ukáže se středníkem. Se středníkem by soubor nešel otevřít.
- **Doba se počítá z absolutních okamžiků.** Vzorec `Konec − Začátek` pracuje s nástěnným
  časem, takže u činnosti přes změnu času dá jinou hodnotu — v takovém řádku se vzorec
  vynechá a zapíše se rovnou správné číslo.
- **ExcelJS ukládá `Date` podle UTC složek.** Aby buňka ukázala pražský čas, předává se datum,
  jehož UTC složky odpovídají pražskému nástěnnému času (`asSpreadsheetDate`).

## Zdroj designu (přečíst před implementací UI)

Složka [design_handoff_vykazovani/](design_handoff_vykazovani/) je **vizuální zdroj pravdy**:

- `Vykazovani.dc.html` — desktopový prototyp, všechny obrazovky a modály
- `Vykazovani Mobil.dc.html` — mobilní prototyp
- `Export Excel.dc.html` — návrh obsahu a formátování exportovaného .xlsx
- `README.md` — mapování na MUI komponenty, design tokeny, popis obrazovek a chování
- `support.js`, `ios-frame.jsx` — runtime prototypu, **neimplementovat**

Prototypy jsou designová reference v HTML, **ne kód k překopírování**. Mají inline styly jen
proto, že jde o HTML návrh — v aplikaci se stejného výsledku dosahuje MUI komponentami a
tématem v [src/theme.ts](src/theme.ts), ne přepisem inline stylů. Struktura souboru: šablona
(`<x-dc>` s direktivami `{{ }}`, `<sc-if>`, `<sc-for>`) + třída `Component` s metodou
`renderVals()`, která je zdrojem pravdy o datech a chování.

## Architektura

- **`src/domain/`** — čistá logika bez závislosti na Reactu i Firebase: převody času, výpočet
  a formátování doby, zod schémata, filtry. Plně pokryté testy, protože právě tady se chyba
  pozná nejpozději.
- **`src/data/`** — Firebase: [firebase.ts](src/data/firebase.ts) (inicializace + emulátory),
  hooky nad Firestore, zápisové operace.
- **`src/components/`**, **`src/pages/`**, **`src/routes/`** — UI.
- **`functions/`** — Cloud Functions (Node 22, region `europe-west3`): trigger na počítadla
  a volatelné `deleteCustomer` a `deleteAccount`. Mazání dělá server proto, že Firestore nemá
  kaskádu a dávky z prohlížeče by se při zavření okna nedotáhly; u účtu navíc klientské
  `deleteUser()` vyžaduje čerstvé přihlášení, které Admin SDK obchází.

### Tři věci, které se snadno rozbijí

1. **Čas.** Do Firestore jde `Timestamp` (UTC instant), zobrazuje se v `Europe/Prague`.
   Převod mezi `datetime-local` a `Date` se dělá **explicitně přes `Intl`**, ne přes
   `new Date(string)` — jinak aplikace na zařízení mimo ČR počítá s jinými hodnotami, než
   zobrazuje. Doba je rozdíl absolutních instantů, takže činnost přes změnu času vyjde správně
   (24. 10. 22:00 → 25. 10. 06:00 je **9 hodin**, ne 8).
2. **Kde se filtruje.** Firestore neumí substring hledání. Zákazníci a činnosti jednoho
   zákazníka se načítají celí na klienta a filtrují lokálně; Přehled používá serverové
   kurzorové stránkování a textové filtry nemá.
3. **Součty.** `totalMinutes` a `invoicedMinutes` na zákazníkovi udržuje Cloud Function
   trigger `onActivityWritten`, **ne klient** — administrace probíhá i přímo z konzole Firebase
   a klientské počítadlo by takové úpravy neviděl. Klient do těchto polí nesmí zapisovat
   (hlídají rules) a `createCustomer` je proto vůbec nezakládá. Počítadla jsou eventuálně
   konzistentní: po zápisu činnosti se dorovnají se zpožděním.
4. **Odvozená pole činnosti.** `running` musí vždy odpovídat `end == null` a `durationMinutes`
   existuje jen u ukončené činnosti. Na `running` stojí dotaz Přehledu (nerovnost nad `end`
   by vynutila řazení podle `end`), na `durationMinutes` součty. Hlídají to rules i testy.

## Konvence

- Texty v UI i commity česky, kód a identifikátory anglicky
- Před commitem musí projít `npm run typecheck`, `npm run lint` a `npm test`
- Dočasné soubory patří do scratchpad adresáře, ne do repa
