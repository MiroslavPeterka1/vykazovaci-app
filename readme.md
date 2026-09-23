# Výkazy práce — zadání aplikace

## 1. Obecný popis

Aplikace slouží k evidenci zákazníků a vykazování práce pro ně odvedené. Je určena pro větší množství uživatelů, přičemž každý uživatel spravuje pouze své vlastní záznamy — vzájemně nemají uživatelé k záznamům ostatních přístup.

Aplikace umožňuje:

- Přihlásit se / odhlásit se
- Zakládat a editovat zákazníky
- Spouštět a ukončovat činnosti (zaznamená se začátek a konec práce)
- Editovat a mazat zaznamenanou práci
- Označovat činnosti jako vyfakturované (s datem DUZP a poznámkou)
- Počítat odvedenou a vyfakturovanou práci pro jednotlivé zákazníky
- Zobrazovat přehledy
- Vše ukládat do centrální databáze

Administrace probíhá přímo z konzole Firebase, kde je možné spravovat uživatele, zákazníky a činnosti. Uživatelé nemají k administraci přístup a spravují pouze své vlastní záznamy prostřednictvím aplikace.

Aplikace je přístupná komukoli z internetu a může se libovolně používat.

## 2. Vizuální návrh

Závazný vizuální a interakční návrh je ve složce [design_handoff_vykazovani/](design_handoff_vykazovani/):

- [Vykazovani.dc.html](design_handoff_vykazovani/Vykazovani.dc.html) — desktopový prototyp (všechny obrazovky a modály)
- [Vykazovani Mobil.dc.html](design_handoff_vykazovani/Vykazovani%20Mobil.dc.html) — mobilní prototyp
- [README.md](design_handoff_vykazovani/README.md) — handoff: mapování na MUI komponenty, design tokeny (barvy, typografie, rozestupy, stíny, rozměry), popis obrazovek

Prototypy jsou **designová reference v HTML**, ne produkční kód. Úkolem je je znovu postavit v React + TypeScript + MUI + Emotion; data v prototypu jsou generovaná lokálně a nahradí je dotazy do Firestore. Barvy a typografie odpovídají výchozímu MUI light tématu (primary `#1976d2`) — cílem je dosáhnout stejného výsledku MUI komponentami, ne přepisovat inline styly z prototypu.

Design tokeny se v tomto dokumentu nezdvojují; jejich zdrojem je handoff README.

## 3. Layout a navigace

**Desktop:**

- Levé navigační menu, šířka 256 px: logo + název „Výkazy práce“, položky **Přehled** a **Zákazníci**
- V patě levého menu tlačítko s avatarem, jménem a e-mailem uživatele → vede na **Uživatelský profil** (profil tedy není samostatná položka v seznamu navigace)
- Horní modrá lišta (AppBar, 64 px) s názvem aktuální stránky; pokud běží alespoň jedna činnost, je vpravo od názvu odznak se zeleným puntíkem a počtem běžících činností
- Hlavní obsah vpravo, zabírá většinu stránky
- Footer ve spodní části obsahu: „© Výkazy práce“ a odkaz na **Podmínky použití**
- Plovoucí tlačítko **+** (FAB) vpravo dole — pouze na stránkách Přehled a Zákazníci

**Routy:** `/prihlaseni`, `/prehled`, `/zakaznici`, `/zakaznici/:id`, `/profil`, `/podminky`

## 4. Obrazovky

### 4.0 Přihlášení / registrace

Vystředěná karta (max. šířka 420 px) s logem a názvem aplikace nad ní. Obsahuje:

- Dvě záložky **PŘIHLÁŠENÍ / REGISTRACE**
- Pole E-mail a Heslo, v režimu registrace navíc Heslo znovu
- Odkaz **Zapomenuté heslo?** (reset hesla)
- Primární tlačítko na celou šířku: PŘIHLÁSIT SE / VYTVOŘIT ÚČET
- Oddělovač „NEBO“ a tlačítko **POKRAČOVAT S GOOGLE**
- Pod kartou text „Pokračováním souhlasíte s [podmínkami použití].“ — odkaz vede na stránku podmínek, která je dostupná i nepřihlášenému uživateli

Po úspěšném přihlášení je uživatel přesměrován na Přehled. Při neúspěchu se nad formulářem zobrazí chybová hláška (červený alert). Zde nevymýšlet nic nového, držet se standardního přihlašovacího a registračního procesu.

### 4.1 Přehled

Dvě karty pod sebou, max. šířka obsahu 1280 px.

**Karta „Běžící činnosti“** — hlavička s počtem běžících činností. Tabulka se sloupci:

| Činnost | Zákazník | Začátek | Běží | (akce) |

- Řádky jsou podbarvené (`#fff8e1`), sloupec „Běží“ je zvýrazněn oranžově a průběžně se aktualizuje
- Na konci řádku tlačítko **UKONČIT** — nastaví konec na aktuální čas
- Prázdný stav: „Žádná činnost právě neběží. Novou spustíte tlačítkem +.“

**Karta „Odpracovaná práce“** — seřazeno sestupně podle začátku (od nejnovějšího). Sloupce:

| Činnost | Zákazník | Začátek | Konec | Vykázáno | Vyfakturováno | (akce) |

- Sloupec Vyfakturováno je Chip **Ano** (zeleně) / **Ne** (šedě)
- U ukončených a dosud nevyfakturovaných činností je v řádku tlačítko **VYFAKTUROVAT** → otevře modál Vyfakturovat
- Načítá se jen omezený počet záznamů: 10 na stránku, dál stránkování („1–10 z N“ + šipky)

**Kliknutí na řádek** (v obou tabulkách) otevře detail zákazníka, ke kterému položka patří, a nad ním editační modál dané činnosti.

**FAB +** vpravo dole otevře modál **Nová činnost** se začátkem = teď a prázdným koncem.

### 4.2 Zákazníci

Jedna karta, max. šířka 1280 px.

- Nad tabulkou pole pro **fulltextové vyhledávání** (hledá napříč všemi atributy zákazníka, tedy i v DIČ, telefonu a e-mailu, které nejsou ve sloupcích) a vpravo počet nalezených záznamů
- Tabulka se sloupci: **Název | IČ | Adresa | Kontaktní osoba | Vykázáno** (součet ukončených činností zákazníka ve formátu HH:MM)
- Druhý řádek hlavičky obsahuje **filtr nad každým sloupcem** (kromě sloupce Vykázáno)
- Stránkování po 50 záznamech („1–50 z N“ + šipky)
- **FAB +** vpravo dole otevře modál Nový zákazník; po uložení se aplikace přepne rovnou na detail nově založeného zákazníka
- Kliknutím na řádek se otevře **detail zákazníka** (samostatná obrazovka, ne modál)

### 4.3 Detail zákazníka

Nad obsahem tlačítko **‹ ZPĚT NA ZÁKAZNÍKY**. Obsah tvoří tři karty pod sebou na plnou šířku (max. 1400 px):

**1) Karta údajů** — v hlavičce název zákazníka, vpravo zelené tlačítko **⤓ VÝKAZ DO EXCELU** (otevře dialog exportu; na mobilu jen ikona) a ikony **✏️** (editace v modálu) a **🗑** (smazání). Pod hlavičkou atributy v gridu: IČ, DIČ, Adresa, Kontaktní osoba, Telefon, E-mail. Pod nimi oddělený řádek s **poznámkou** na plnou šířku; zachovává zalomení řádků a u prázdné hodnoty ukáže „Bez poznámky“.

**2) Karta „Přehled“** — čtyři hodnoty vedle sebe:

- Celkem vykázáno
- Celkem vyfakturováno (zeleně)
- Vykázáno tento měsíc
- Vyfakturováno tento měsíc

**3) Karta „Činnosti“** — v hlavičce počet záznamů a vpravo tlačítko **+ ČINNOST** (otevře modál nové činnosti s předvyplněným zákazníkem). Tabulka se sloupci:

| Činnost | Začátek | Konec | Vykázáno | Vyfakturováno | DUZP | Poznámka | (akce) |

- Filtry ve druhém řádku hlavičky: text na Činnost, „dd.mm.“ na Začátek, select **Vše / Vyfakturováno / Nevyfakturováno**, text na Poznámku
- Neukončené činnosti mají podbarvený řádek a tlačítko **UKONČIT**
- Ukončené a nevyfakturované mají tlačítko **VYFAKTUROVAT**
- Kliknutím na řádek se otevře editační modál činnosti
- Stránkování po 10 záznamech

**Smazání zákazníka** (ikona 🗑) otevře potvrzovací dialog s počtem dotčených činností; smazání je nutné potvrdit **opsáním přesného názvu zákazníka**. Smaže se zákazník i všechny jeho činnosti.

### 4.4 Uživatelský profil

Max. šířka 640 px, dvě karty:

**1) Karta profilu** — avatar, jméno, e-mail, tři statistiky (Zákazníků, Činností, Celkem vykázáno) a tlačítko **ODHLÁSIT SE**.

**2) Karta „Smazání účtu“** — červený nadpis, vysvětlení („Smazáním účtu se nenávratně odstraní všichni vaši zákazníci a všechny vykázané činnosti. Operaci nelze vrátit zpět.“) a tlačítko **SMAZAT ÚČET** → dialog s opsáním přesné fráze `SMAZAT ÚČET`.

### 4.5 Podmínky použití

Samostatná stránka (karta max. 820 px) s nadpisem, datem účinnosti a očíslovanými sekcemi. Odkaz na ni je ve footeru každé stránky i pod přihlašovací kartou. Podrobnosti viz kapitola 12.

## 5. Modální okna

| Modál | Obsah a chování |
| --- | --- |
| **Nová / editace činnosti** | Název činnosti; Zákazník (našeptávač s fulltextem, u nové činnosti z Přehledu prázdný, z detailu předvyplněný); Začátek a Konec (`datetime-local`); read-only **Vykázaná doba** ve formátu HH:MM (u běžící činnosti text „běží“); přepínač **Vyfakturováno**; **DUZP** (zobrazí se po zapnutí přepínače, předvyplněné dnešním datem); **Poznámka**. Akce: **SMAZAT** (pouze při editaci, vlevo), ZRUŠIT, **ULOŽIT** / **SPUSTIT**. |
| **Nový / editace zákazníka** | Grid o dvou sloupcích: Název (přes celou šířku), IČ, DIČ, Adresa, Kontaktní osoba, Telefon, E-mail. Akce: ZRUŠIT, ULOŽIT. |
| **Vyfakturovat** | Podtitul „činnost · zákazník · doba“, **DUZP** (předvyplněno dnešní datum) a **Poznámka** (předvyplněná poznámkou činnosti). Potvrzení nastaví `invoiced = true`, uloží DUZP i poznámku. |
| **Stáhnout pracovní výkaz** | Podtitul s názvem zákazníka. Přepínač **Za měsíc / Za rok**, pod ním výběr měsíce a roku (v ročním režimu jen rok). Souhrn zvoleného období: Činností, Vykázáno, Vyfakturováno (zeleně). Řádek s názvem souboru. Když v období nejsou ukončené činnosti, oranžové upozornění, že soubor bude obsahovat jen hlavičku. Akce: ZRUŠIT, **STÁHNOUT .XLSX**. Po stažení se dialog zavře a objeví se potvrzení „Staženo: <název souboru>“. |
| **Smazání (zákazník / účet)** | Titulek, počty dotčených záznamů, pole pro opsání přesné fráze a nápověda s přesným textem. Tlačítko **SMAZAT NENÁVRATNĚ** je aktivní až při přesné shodě. |

## 6. Datové entity

### Zákazník

- Název (povinné)
- IČ
- DIČ
- Adresa
- Kontaktní osoba
- Telefon
- E-mail
- Poznámka (volný víceřádkový text, nepovinná)

### Činnost

- Název činnosti (povinné)
- Zákazník (povinné)
- Datum a čas spuštění činnosti
- Datum a čas ukončení činnosti (prázdné = činnost běží)
- Vykázaná doba (dopočtené pole, read-only; všude zobrazeno ve formátu **HH:MM**, bez sekund; hodiny mohou přesáhnout 24)
- **Vyfakturováno** (ano/ne)
- **DUZP** (datum uskutečnění zdanitelného plnění; vyplňuje se při označení jako vyfakturováno, předvyplní se dnešní datum)
- **Poznámka** (volný text; např. číslo faktury, „Součást paušálu“, „Odsouhlaseno e-mailem“)

## 7. Pravidla a chování

### Čas a výpočet doby

- Doba = `konec − začátek`, zaokrouhleno na minuty, formát `HH:MM`
- Rozdíl se počítá z **absolutních časů (UTC instantů)**, ne z lokálních složek data a času. Den přechodu na letní/zimní čas má 23, resp. 25 hodin a činnost přes tuto hranici musí vyjít správně
- Do Firestore se ukládá `Timestamp`, zobrazuje se v zóně **Europe/Prague**, formát data `DD.MM.YYYY HH:MM`
- Pokud se časová zóna začátku a konce liší (činnost přes změnu času), zobrazí modál u vykázané doby poznámku „zahrnuje změnu času“
- Agregace podle kalendářního dne/měsíce („tento měsíc“) se počítají v zóně Europe/Prague

### Životní cyklus činnosti

- **Spuštění:** FAB na Přehledu → modál, začátek = teď, konec prázdný
- **Ukončení:** tlačítko UKONČIT nastaví konec na aktuální čas, doba se dopočítá
- **Paralelní běh více činností je povolen**
- Činnost lze zadat i zpětně — začátek i konec jsou v modálu volně editovatelné
- Činnost lze smazat z editačního modálu

### Validace

- Činnost vyžaduje název a zákazníka
- Zákazník vyžaduje název
- Konec nesmí předcházet začátku
- Mazací tlačítko je aktivní jen při přesné shodě potvrzovací fráze

### Hledání, filtry a stránkování

- Fulltext na stránce Zákazníci hledá napříč všemi atributy zákazníka
- Filtry nad sloupci se kombinují logickým **AND** (i s fulltextem); změna kteréhokoli filtru resetuje stránkování na první stránku
- Počty záznamů na stránku: Přehled 10, Zákazníci 50, Činnosti v detailu 10 (mobil 8 / 20 / 8)

### Zpětná vazba a stavy

- Potvrzení akcí přes Snackbar vlevo dole (cca 2,6 s): „Činnost spuštěna“, „Činnost ukončena“, „Činnost uložena“, „Činnost smazána“, „Zákazník uložen“, „Zákazník vytvořen“, „Zákazník a jeho činnosti smazány“, „Označeno jako vyfakturováno“, „Účet a všechna data smazány“
- Prázdné stavy: „Žádná činnost právě neběží. Novou spustíte tlačítkem +.“, „Nic nenalezeno“ v našeptávači zákazníků
- Chybové stavy přihlášení: alert nad formulářem

## 8. Mobilní verze

Stejné funkce, jiné vzory (viz mobilní prototyp):

- Dolní navigace **BottomNavigation** (Přehled, Zákazníci, Profil), horní AppBar s titulkem; v detailu zákazníka šipka zpět a ikony ✏️ 🗑 vpravo
- Tabulky nahrazeny **seznamy karet**: běžící činnost (podbarvená, doba + UKONČIT), odpracovaná práce (název, zákazník, čas → čas, doba, Chip stavu, tlačítko VYFAKTUROVAT)
- Zákazníci: pole hledání nad seznamem, řádky s adresou a součtem
- Detail: statistiky v gridu 2×2, pod tím atributy, pod tím seznam činností
- Všechny modály jako **bottom sheety** (zaoblení nahoře, max. výška 88 %, animace zespodu)
- Dotykové cíle min. 44 px, pole Začátek/Konec pod sebou
- Odkaz na podmínky použití je v profilu

## 8a. Export pracovního výkazu do Excelu

Export se spouští z detailu zákazníka tlačítkem **⤓ VÝKAZ DO EXCELU** a generuje soubor .xlsx
přímo v prohlížeči, bez serveru.

**Co se exportuje:** ukončené činnosti daného zákazníka, jejichž začátek spadá do zvoleného
období (v zóně Europe/Prague), seřazené vzestupně. Běžící činnosti do výkazu nepatří — dokud
nemají konec, jejich doba se ještě mění.

**Název souboru:** `Vykaz_<Zakaznik>_<RRRR-MM>.xlsx` za měsíc, `Vykaz_<Zakaznik>_<RRRR>.xlsx`
za rok. Název zákazníka se zbaví diakritiky a nealfanumerické znaky nahradí podtržítkem.

**Měsíční výkaz** má jeden list. Hlavička souboru (řádky 1–9) nese zákazníka, jeho IČ/DIČ
a adresu, období, jméno a e-mail uživatele a datum vystavení. Na řádku 10 začíná tabulka:

| Datum | Činnost | Začátek | Konec | Doba [h:mm] | Vyfakturováno | DUZP | Poznámka |

Hlavička je ukotvená a má zapnutý automatický filtr. Pod daty je řádek **Celkem** se součtem
přes `SUBTOTAL`, takže respektuje filtr, a pod ním rozpad na vyfakturovanou a nevyfakturovanou
část. Na konci řádek pro podpis zákazníka.

**Roční výkaz** má list **Souhrn RRRR** a za ním jeden list pro každý měsíc s daty. Souhrn
vypisuje všech dvanáct měsíců (i prázdné), název měsíce odkazuje na jeho list a počet činností
i vykázaný čas se berou vzorcem z listu měsíce — úprava v listu se tak promítne do souhrnu.
Nevyfakturovaný čas je zvýrazněný.

**Formátování:** Calibri 11, hlavička tabulky bílá na zelené, řádek součtu podbarvený. Doby
jsou čísla s formátem `[h]:mm`, takže se dají sčítat a součet smí přesáhnout 24 hodin. Data
`dd.mm.rrrr`, časy `hh:mm`, tisk A4 na šířku s opakovanou hlavičkou.

**Dvě věci, na kterých to stojí:**

- **Doba se počítá z absolutních okamžiků, ne z rozdílu časů v buňkách.** Vzorec `Konec − Začátek`
  pracuje s nástěnným časem, takže u činnosti přes změnu letního času dá o hodinu jinou hodnotu.
  V takovém řádku proto vzorec není a je tam rovnou správná hodnota.
- **Vzorce se do souboru ukládají s čárkou jako oddělovačem argumentů**, i když je Excel českému
  uživateli zobrazí se středníkem. Formát xlsx jiný oddělovač nepřijme.

## 9. Datový model (návrh)

```
users/{uid}/customers/{customerId}
  { name, ico, dic, address, person, phone, email, note, createdAt, updatedAt }

users/{uid}/activities/{activityId}
  { customerId, name,
    start: Timestamp,
    end: Timestamp | null,          // null = běží
    durationMinutes: number | null, // dopočteno při uložení/ukončení
    invoiced: boolean,
    invoiceDate: Timestamp | null,  // DUZP
    note: string,
    createdAt, updatedAt }
```

Poznámky k modelu:

- Činnosti jsou samostatná kolekce pod uživatelem (**ne** podkolekce zákazníka), aby šel udělat dotaz „posledních 10 činností napříč všemi zákazníky“ pro Přehled
- `durationMinutes` se ukládá proto, aby šly součty („Vykázáno“ ve sloupci zákazníka, statistiky v detailu) počítat agregačním dotazem nebo průběžně udržovaným součtem, ne načtením všech činností na klienta
- **Zákazníci se pro přihlášeného uživatele načítají celí na klienta** (jde o desítky až stovky záznamů) a fulltext, filtry nad sloupci i stránkování běží lokálně — Firestore neumí substring hledání ani kombinaci filtrů nad více sloupci. **Činnosti** se naopak stránkují serverově kurzorem
- Indexy: `activities` podle `start desc` a `customerId + start desc`; běžící činnosti podle `end == null`
- Kaskádní smazání zákazníka a smazání účtu řeší **Firebase Function** (batch po 500 dokumentech); smazání uživatele ve Firebase Auth navíc vyžaduje čerstvé přihlášení

## 10. Technologie

- **Frontend:** React, TypeScript
- **Backend:** Firebase Functions — pro hromadné operace, např. smazání účtu a kaskádní smazání zákazníka
- **Databáze:** Firebase Firestore
- **Autentizace:** Firebase Authentication (e-mail + heslo, Google, reset hesla)
- **Hosting:** Firebase Hosting
- **UI knihovna:** Material-UI (výchozí light téma, primary `#1976d2`)
- **Stylování:** CSS-in-JS (Emotion)
- **Ikony:** `@mui/icons-material` (znaky v prototypu jsou jen zástupné)
- **Jazyk UI:** čeština

Mapování prvků prototypu na MUI komponenty je v [handoff README](design_handoff_vykazovani/README.md).

## 11. Zabezpečení

- Autentizace pomocí Firebase, včetně podpory Google účtu a resetu hesla
- Každý uživatel má přístup pouze ke svým vlastním zákazníkům a činnostem
- **Firestore Security Rules jsou jediná autorizační vrstva** — povolují čtení i zápis jen tam, kde `request.auth.uid` odpovídá vlastníkovi dokumentu (`users/{uid}/…`)
- Aplikace při načítání dat pracuje vždy jen nad podstromem přihlášeného uživatele
- Doplňkově (ochrana kvót, **nikoli** bezpečnostní opatření): omezení API klíče na doménu hostingu a nastavení Authorized domains ve Firebase Auth
- Vzhledem k tomu, že registrace je otevřená komukoli, zvážit **Firebase App Check** proti botům a nastavit rozpočtové upozornění na projektu

## 12. Podmínky použití

Podmínky mají chránit provozovatele a zároveň informovat uživatele o jejich právech a povinnostech. Návrh textu je součástí prototypu a obsahuje 8 sekcí:

1. Kdo službu provozuje
2. Registrace a účet
3. Vaše data
4. Obsah, který vkládáte (uživatel je správcem osobních údajů třetích osob, provozovatel zpracovatelem)
5. Dostupnost a odpovědnost (služba zdarma, „tak, jak je“, bez záruky dostupnosti a záloh)
6. Ukončení a smazání účtu (smazáním profilu se nenávratně odstraní všechna vytvořená data)
7. Změny podmínek (provozovatel má právo podmínky kdykoli změnit)
8. Rozhodné právo

Před spuštěním je potřeba:

- Doplnit IČ a kontakt provozovatele a datum účinnosti
- Nechat text **projít právní revizí** — jde o návrh, ne o hotový právní dokument
- Doplnit **zásady ochrany osobních údajů** (privacy policy). Aplikace ukládá osobní údaje třetích osob (kontaktní osoba, telefon, e-mail zákazníka) a odkaz na privacy policy vyžaduje i Google OAuth consent screen

## 13. Otevřené otázky a rozsah v1

Rozhodnout před implementací:

- **Souhlas s podmínkami při registraci** — prototyp má jen informativní text „Pokračováním souhlasíte s podmínkami použití“. Stačí to, nebo chceme povinný checkbox?
- **DUZP při fakturaci** — má být povinné, když je zapnuté Vyfakturováno?
- **Ověření e-mailu po registraci** — vyžadovat, nebo ne? A jak se chovat při kolizi, kdy stejný e-mail přijde přes Google i přes heslo?

Vědomě **mimo rozsah** (není v návrhu):

- Souhrnný výkaz napříč všemi zákazníky za období — export je vždy za jednoho zákazníka

- Předvyplnění zákazníka z ARES podle IČ a validace IČ/DIČ
- Archivace zákazníka místo mazání
- Sazby, fakturovatelnost v penězích, generování faktur
- Upozornění na zapomenutou běžící činnost
