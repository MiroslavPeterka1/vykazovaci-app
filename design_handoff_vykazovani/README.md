# Handoff: Výkazy práce (evidence zákazníků a vykazování práce)

## Overview
Webová aplikace pro evidenci zákazníků a vykazování odvedené práce. Každý uživatel vidí a spravuje pouze svoje záznamy. Uživatel zakládá zákazníky, spouští a ukončuje činnosti (možný paralelní běh), edituje je, označuje je jako vyfakturované s DUZP a poznámkou a sleduje součty. Administrace probíhá mimo aplikaci, přímo v konzoli Firebase.

Cílový stack podle zadání: React + TypeScript, Material-UI, Emotion, Firebase Auth (e-mail/heslo, Google, reset hesla), Firestore, Firebase Functions (hromadné operace, např. smazání účtu), Firebase Hosting.

## About the Design Files
Soubory v tomto balíčku jsou **designová reference vytvořená v HTML** — prototypy, které ukazují zamýšlený vzhled a chování. Nejde o produkční kód k překopírování. Úkolem je tyto návrhy **znovu postavit v cílovém prostředí** (React + TypeScript + MUI + Emotion) podle jeho zavedených vzorů; data v prototypu jsou generovaná lokálně a musí být nahrazena Firestore dotazy.

`.dc.html` soubory otevřete přímo v prohlížeči (potřebují `support.js` ve stejné složce; mobilní verze navíc `ios-frame.jsx`). Struktura souboru: šablona (markup) + třída `Component` s logikou — logika je běžný React class-component bez `render()`, `renderVals()` vrací hodnoty do šablony.

## Fidelity
**High-fidelity.** Barvy, typografie, rozestupy a interakce odpovídají výchozímu MUI tématu (light, primary `#1976d2`). Cílem je v MUI komponentách dosáhnout stejného výsledku — ne přepisovat inline styly z prototypu. Prototyp je inline-stylovaný jen proto, že jde o HTML návrh.

Mapování na MUI komponenty:
| Prvek prototypu | MUI |
| --- | --- |
| Levé menu | `Drawer` variant="permanent", šířka 256 |
| Horní modrá lišta | `AppBar` + `Toolbar`, `color="primary"` |
| Karty | `Paper` elevation={1} |
| Tabulky | `Table` / `TableContainer` + `TablePagination` |
| Pole formulářů | `TextField` variant="outlined" |
| Modály | `Dialog` + `DialogTitle/Content/Actions` |
| Spodní list (mobil) | `Drawer` anchor="bottom" nebo `SwipeableDrawer` |
| Toggle | `Switch` |
| Stav fakturace | `Chip` size="small" |
| Toast | `Snackbar` |
| FAB | `Fab color="primary"` |
| Spodní navigace (mobil) | `BottomNavigation` |

## Screens / Views

### 0. Přihlášení / registrace (`route: "login"`)
- **Účel:** přihlášení e-mailem a heslem, registrace, Google přihlášení, reset hesla.
- **Layout:** vystředěná karta max-width 420px na podkladu `#f5f5f5`, nad kartou logo (čtverec 36px, radius 4, `#1976d2`, bílé „V“) + název „Výkazy práce“ (20px/500).
- **Komponenty:** dvě záložky PŘIHLÁŠENÍ / REGISTRACE (aktivní `#1976d2` + spodní podtržení 2px), pole E-mail a Heslo (v režimu registrace navíc Heslo znovu), textový odkaz „Zapomenuté heslo?“ vpravo, primární tlačítko PŘIHLÁSIT SE / VYTVOŘIT ÚČET (plná šířka), oddělovač „NEBO“, tlačítko POKRAČOVAT S GOOGLE (outlined, kruhové barevné logo 18px), pod kartou text „Pokračováním souhlasíte s podmínkami použití.“
- **Chyby:** nad formulářem alert `background #fdeded`, text `#5f2120`, radius 4, 14px.

### 1. Přehled (`route: "overview"`)
- **Účel:** rychlý pohled na běžící činnosti a poslední odpracovanou práci; spuštění nové činnosti.
- **Layout:** dvě karty pod sebou, gap 24, max-width 1280.
- **Karta „Běžící činnosti“:** hlavička (16px/500) + počet; tabulka se sloupci Činnost, Zákazník, Začátek, Běží (oranžově `#ed6c02`, monospace), akce. Řádky podbarvené `#fff8e1`, na konci outlined tlačítko UKONČIT (`#d32f2f`). Prázdný stav: „Žádná činnost právě neběží. Novou spustíte tlačítkem +.“
- **Karta „Odpracovaná práce“:** sloupce Činnost, Zákazník, Začátek, Konec, Vykázáno, Vyfakturováno (Chip Ano/Ne), akce (tlačítko VYFAKTUROVAT u nevyfakturovaných). Řazeno sestupně podle začátku, 10 záznamů na stránku (prop `rowsPerPageOverview`), stránkování „1–10 z N“ + šipky.
- **Kliknutí na řádek:** otevře detail zákazníka dané položky a nad ním editační modál činnosti.
- **FAB +** vpravo dole (56px, `#1976d2`): nová činnost se startem = teď.
- **Overflow:** obě tabulky jsou v `overflow-x:auto` kontejneru s `min-width` (820 / 1080), takže se scrollují uvnitř karty.

### 2. Zákazníci (`route: "customers"`)
- **Layout:** jedna karta, max-width 1280.
- **Nad tabulkou:** fulltextové pole (hledá napříč všemi atributy) a počet nalezených.
- **Tabulka:** sloupce Název, IČ, Adresa, Kontaktní osoba, Vykázáno (součet ukončených činností, HH:MM). Druhý řádek hlavičky obsahuje filtr pro každý sloupec (input 12px).
- **Stránkování:** 50 na stránku (prop `rowsPerPageCustomers`), „1–50 z N“ + šipky. V reálné aplikaci: Firestore `limit` + kurzorové stránkování.
- **FAB +:** modál nový zákazník.
- **Klik na řádek:** detail zákazníka (samostatná obrazovka, ne modál).

### 3. Detail zákazníka (`route: "detail"`)
Tři pásy pod sebou na plnou šířku (max-width 1400), gap 16:
1. **Karta údajů** — hlavička s názvem zákazníka, vpravo ikony ✏️ (editace v modálu) a 🗑 (smazání). Atributy IČ, DIČ, Adresa, Kontaktní osoba, Telefon, E-mail v gridu `repeat(auto-fit, minmax(150px,1fr))`, gap 14/24; label 12px `rgba(0,0,0,.6)`, hodnota 14px.
2. **Karta „Přehled“** — čtyři hodnoty v řadě (`repeat(auto-fit, minmax(170px,1fr))`): Celkem vykázáno, Celkem vyfakturováno (zeleně `#2e7d32`), Vykázáno tento měsíc, Vyfakturováno tento měsíc. Hodnoty 20px/500 monospace.
3. **Karta činností** — hlavička s počtem a tlačítkem „+ ČINNOST“ vpravo. Tabulka: Činnost, Začátek, Konec, Vykázáno, Vyfakturováno (Chip), DUZP, Poznámka, akce. Filtry v druhém řádku hlavičky: text na Činnost, „dd.mm.“ na Začátek, select Vše/Vyfakturováno/Nevyfakturováno, text na Poznámku. Neukončené řádky podbarvené `#fff8e1` s tlačítkem UKONČIT; nevyfakturované ukončené mají tlačítko VYFAKTUROVAT. Stránkování po 10.
- **Smazání zákazníka:** dialog vyžaduje opsání přesného názvu zákazníka; maže i všechny jeho činnosti (v produkci Firebase Function / batch).

### 4. Uživatelský profil (`route: "profile"`)
- Vstup: tlačítko s avatarem v patě levého menu (položka v navigaci není).
- Karta s avatarem, jménem, e-mailem, třemi statistikami (Zákazníků, Činností, Celkem vykázáno) a tlačítkem ODHLÁSIT SE.
- Druhá karta „Smazání účtu“ (nadpis `#d32f2f`, vysvětlení, tlačítko SMAZAT ÚČET) → dialog s opsáním fráze `SMAZAT ÚČET`.

### 5. Podmínky použití (`route: "terms"`)
Karta max-width 820, padding 40/48, nadpis 28px, datum účinnosti, 8 očíslovaných sekcí (provozovatel, registrace a účet, vaše data, vkládaný obsah, dostupnost a odpovědnost, ukončení a smazání účtu, změny podmínek, rozhodné právo). Text je **návrh k právní revizi** — doplnit IČ a kontakt provozovatele. Odkaz je ve footeru každé stránky i pod přihlašovací kartou.

### Modály
| Modál | Obsah |
| --- | --- |
| Nová / editace činnosti | Název činnosti; Zákazník (autocomplete s fulltextem, dropdown max 220px, u nové z přehledu prázdný, z detailu předvyplněný); Začátek a Konec (`datetime-local`, `minmax(0,1fr)`); read-only Vykázaná doba HH:MM (u běžící „běží“) s poznámkou „zahrnuje změnu času“, pokud se liší timezone offset začátku a konce; Switch Vyfakturováno; DUZP (zobrazí se po zapnutí switche, předvyplní dnešek); Poznámka (textarea). Akce: SMAZAT (jen při editaci, vlevo), ZRUŠIT, ULOŽIT / SPUSTIT. Šířka 520. |
| Nový / editace zákazníka | Grid 2 sloupce: Název (přes 2), IČ, DIČ, Adresa (přes 2), Kontaktní osoba (přes 2), Telefon, E-mail. Šířka 560. |
| Vyfakturovat | Podtitul „činnost · zákazník · doba“, DUZP (předvyplněno dnešek), Poznámka. Potvrzení nastaví `invoiced=true`. Šířka 480. |
| Smazání (zákazník / účet) | Titulek, počty dotčených záznamů, pole pro opsání přesné fráze, tlačítko aktivní až při shodě. Šířka 480. |

## Mobilní verze (`Vykazovani Mobil.dc.html`)
Stejné funkce, jiné vzory. Rám iPhone 402×874 je pouze prezentační obal prototypu.
- Spodní `BottomNavigation` (Přehled, Zákazníci, Profil), horní AppBar s titulkem; v detailu zákazníka šipka zpět a ikony ✏️ 🗑 vpravo.
- Tabulky nahrazeny seznamy karet: běžící činnost (podbarvená, doba + UKONČIT), odpracovaná práce (název, zákazník, čas → čas, doba, Chip stavu, tlačítko VYFAKTUROVAT).
- Zákazníci: pole hledání nad seznamem, řádky s adresou a součtem, šipka vpravo.
- Detail: statistiky v gridu 2×2, pod tím atributy (label 110px vlevo), pod tím seznam činností po 8.
- Všechny modály jako bottom sheety (radius 16 nahoře, max-height 88 %, animace slide-up 0,2 s).
- Dotykové cíle min. 44 px; pole Začátek/Konec pod sebou.

## Interactions & Behavior
- **Navigace:** stavová (`route`), v produkci React Router: `/prehled`, `/zakaznici`, `/zakaznici/:id`, `/profil`, `/podminky`, `/prihlaseni`.
- **Spuštění činnosti:** FAB na přehledu → modál (start = teď, konec prázdný). Paralelní běh více činností je povolen.
- **Ukončení:** tlačítko UKONČIT nastaví konec na teď; doba se dopočítá.
- **Výpočet doby:** `end - start` v ms, zaokrouhleno na minuty, formát `HH:MM` (bez sekund, hodiny mohou přesáhnout 24). Rozdíl počítat z absolutních časů (UTC instantů), ne z lokálních komponent — den přechodu na letní/zimní čas má 23, resp. 25 hodin, a činnost přes tuto hranici musí vyjít správně. Ukládat do Firestore jako `Timestamp`, zobrazovat v `Europe/Prague`.
- **Fakturace:** tlačítko VYFAKTUROVAT (přehled i detail) → modál s DUZP a poznámkou → `invoiced=true`, `invoiceDate`, `note`. Stejná pole jdou nastavit i v editaci činnosti.
- **Hledání a filtry:** fulltext přes všechny atributy zákazníka, filtry nad sloupci se kombinují (AND), změna filtru resetuje stránku na první.
- **Stránkování:** přehled 10, zákazníci 50, činnosti v detailu 10, mobil 8/20/8.
- **Mazání:** potvrzovací dialog s opisem přesné fráze; smazání zákazníka maže i jeho činnosti, smazání účtu maže vše.
- **Zpětná vazba:** Snackbar vlevo dole, 2,6 s („Činnost ukončena“, „Zákazník uložen“, „Označeno jako vyfakturováno“, …).
- **Hover:** řádky tabulky `rgba(0,0,0,.04)`, primární tlačítka `#1565c0`, ikonová tlačítka kruhové podbarvení `rgba(0,0,0,.06)`.
- **Animace:** overlay fade 0,15 s, dialog pop (opacity + translateY 8px + scale .98) 0,18 s, sheet slide-up 0,2 s.
- **Prázdné stavy:** „Žádná činnost právě neběží…“, „Nic nenalezeno“ v dropdownu zákazníků.
- **Validace:** činnost vyžaduje název a zákazníka; zákazník vyžaduje název; mazací tlačítko aktivní jen při přesné shodě fráze; konec nesmí předcházet začátku (doplnit).

## State Management
Prototyp drží vše v jedné komponentě. V produkci:
- `auth`: aktuální uživatel (Firebase Auth), stav načítání, chyba přihlášení.
- `customers`: seznam pro aktuálního uživatele, stránkovaně (`where ownerUid == uid`, `orderBy name`, `limit`, kurzory).
- `activities`: běžící (`where end == null`) a poslední ukončené (`orderBy start desc`, `limit`), v detailu filtrované `where customerId == id`.
- UI stav: `route`, `selectedCustomerId`, `modal` (`activity` | `customer` | `invoice` | `delete` | null), `editingId`, obsah formulářů, filtry, čísla stránek, snackbar.
- Datový model Firestore (návrh): `users/{uid}/customers/{customerId}` = `{ name, ico, dic, address, person, phone, email, createdAt }`; `users/{uid}/activities/{activityId}` = `{ customerId, name, start: Timestamp, end: Timestamp|null, invoiced: boolean, invoiceDate: Timestamp|null, note: string }`.
- Indexy: `activities` podle `end`, `start desc`, `customerId + start desc`.
- Security rules: čtení i zápis pouze pro `request.auth.uid == uid` vlastníka dokumentu.
- Smazání účtu a kaskádové smazání zákazníka řešit Firebase Function (batch po 500 dokumentech).

## Design Tokens
Výchozí MUI light téma.

**Barvy**
- primary `#1976d2`, primary dark `#1565c0`, primary light `#42a5f5`
- error `#d32f2f`, error dark `#c62828`, error background `#fdeded`, error text `#5f2120`
- success text `#1b5e20`, success background `#e8f5e9`, success value `#2e7d32`
- warning / běžící `#ed6c02`, podbarvení běžícího řádku `#fff8e1` (hover `#ffecb3`)
- background default `#f5f5f5`, paper `#fff`, snackbar `#323232`
- text primary `rgba(0,0,0,.87)`, secondary `rgba(0,0,0,.6)`, disabled `rgba(0,0,0,.26)`
- divider `rgba(0,0,0,.12)`, jemný divider `rgba(0,0,0,.08)`, okraj inputu `rgba(0,0,0,.23)`, hover řádku `rgba(0,0,0,.04)`, aktivní položka menu `rgba(25,118,210,.12)`

**Typografie:** Roboto 400/500/700; čísla, časy a doby v Roboto Mono.
- h1 stránky (podmínky) 28px/400; titulek AppBar 20px/500 (mobil 19px); nadpis karty 16px/500; titulek dialogu 20px/500
- tělo 14–15px/400; hlavička tabulky 13px/500 `rgba(0,0,0,.6)`; popisek pole 12px; tlačítko 13–15px/500, letter-spacing .4px, UPPERCASE
- statistika 20–24px/500 monospace

**Rozestupy:** 4 / 8 / 12 / 16 / 24 / 32 / 48. Buňka tabulky padding 14px (dense 8px) svisle, 16px vodorovně (24px krajní sloupce). Karta padding 16–24px.

**Radius:** 4 (karty, tlačítka, pole), 8 (mobilní karty), 12–16 (chip, sheet), 50 % (avatar, FAB, ikonová tlačítka).

**Stíny:** elevation 1 `0 2px 1px -1px rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 1px 3px 0 rgba(0,0,0,.12)`; AppBar elevation 4; FAB `0 3px 5px -1px rgba(0,0,0,.2), 0 6px 10px 0 rgba(0,0,0,.14), 0 1px 18px 0 rgba(0,0,0,.12)`; dialog `0 11px 15px -7px rgba(0,0,0,.2), 0 24px 38px 3px rgba(0,0,0,.14), 0 9px 46px 8px rgba(0,0,0,.12)`.

**Rozměry:** levé menu 256px, AppBar 64px, FAB 56px, dotykový cíl mobil min. 44px, obsah max-width 1280 (detail 1400, profil 640, podmínky 820).

## Assets
Žádné bitmapy ani ikonové fonty. Ikony v prototypu jsou textové znaky (`▤`, `☰`, `◍`, `⌕`, `‹`, `›`, `✏️`, `🗑`) — v implementaci nahradit `@mui/icons-material` (`DashboardOutlined`, `PeopleOutline`, `PersonOutline`, `Search`, `ChevronLeft/Right`, `Edit`, `Delete`, `Add`, `Stop`, `ReceiptLong`). Logo je čtverec s písmenem „V“, ne obrázek. Google tlačítko používá barevný kruh jako placeholder — nahradit oficiálním Google logem podle jejich brand guidelines.

## Files
- `Vykazovani.dc.html` — desktopový prototyp, všechny obrazovky a modály
- `Vykazovani Mobil.dc.html` — mobilní prototyp
- `ios-frame.jsx` — rám telefonu pro mobilní prototyp (jen prezentace, neimplementovat)
- `support.js` — runtime prototypu (neimplementovat)
