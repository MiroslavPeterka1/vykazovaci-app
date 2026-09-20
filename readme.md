# Obecný popis aplikace:

Aplikace bude sloužit k evidenci zákazníků a vykazovaní práce pro ně odvedenné. Aplikace bude sloužit pro větší množství uživatelů a každy si spravuje pouze své vlastní záznamy. Vzájemě nebude mít uživatel přístup k záznamům ostatních. Tato aplikace bude umožňovat:

- Přihlásit/odhlasit se.
- Zakládat a editovat zákazníky
- Přidávat/vykazovat práci s tím, že se zaznamená začátek a konec práce.
- Editovat zaznamenanou práci.
- Počítat odvedenou práci pro jednotlivé zákazníky.
- Zobrazí přehledy.
- Toto vše uloží do centrální databáze.
  Administrace bude probíhat přímo z konzole firebase, kde bude možné spravovat uživatele, zákazníky a činnosti. Uživatelé nebudou mít přístup k administraci a budou spravovat pouze své vlastní záznamy prostřednictvím aplikace.
  Applikace přístupná komukoliv z internetu a může se libovolně používat.

## Základní struktura (layout)

- Navigační menu v levo
- Hlavní obsah vpravo - bude zabírat většinu stránky
- Footer na spodní části stránky - obsahuje odkaz na stránku s podmínkami užití.

## Applikace bude mít 3 sekce (i položky navigačního menu):

1. Přehled
2. Zákazníci
3. Uživatelský profil

Bude ještě nultá stránka - přihlašovací/registrační stránka.

### Add 1. Přehled

Stránka přehledu bude rozdělena na dvě části:

- Tabulka/seznam nedokončené vykázané práce
  - Na každé položce bude vidět:
    - Název činnosti
    - Datum a čas spuštění činnosti
    - Zákazník
    - Tlačítko na ukončení činnosti
- Tabulka/seznam odpracované práce seřezené posledního záznamu. - Na každé položce bude vidět: - Název činnosti - Datum a čas spuštění činnosti - Datum a čas ukončení činnosti - Vykázaná doba - Zákazník

Je třeba optimalizovat, aby se nenačítali všechny záznamy např pouze 10 (v závislosti na designu zobrazujícího elementu). Klikem na položku se proklikneme do detailu zákazníka, ke kterému položka patří s tím, že se zobrazí editační modální formulář.

V pravém dolním rohu je i tlačítko + pro přidání nové činnosti. Klik na toto tlačítko otevře modální formulář pro zadání nové činnosti. Modální formulář bude obsahovat pole pro zadání názvu činnosti a výběr zákazníka (dropdown seznam všech zákazníků s funkcí full textového vyhledávání) (start=teď).

### Add 2. Zákazníci

Položka menu zákazníci vede do seznamu všech zákazníků (tabulky). Nad tabulkou se bude nacházet okno pro full textové vyhledávání. Tabulka bude nad každým sloupcem obsahovat vyhledavací pole. Tabulka bude načítat pouze omezený počet záznamů (např. 50) a další záznamy jsou schované pomocí stránkování tabulky.
V pravém dolním rohu bude tlačítko + pro přidání nového zákazníka. Klik na toto tlačítko otevře modální formulář pro zadání nového zákazníka.
Klikem na položku zákazníka v tabulce se otevře detail zákazníka (ne modální formulář). Detail zákazníka je rozdělen do 2 částí:

- Levá obsahuje atributy zákazníka a možnost jejich editace je zzpřístupněna ikonkou ✏️ v pravém horním rohu (editace je v modálu a uložena po potvrzení).
- Pravá obsahuje tabulku všech činností spojených s tímto zákazníkem. Klikem na položku činnosti se otevře editační modální formulář. Pokud bude řádek tabulky obsahovat neukončenou činnost, bude zvýrazněn a na jeho konci bude vidět tlačítko na ukončení činnosti. Tabulka opět umožňuje stránkování a omezený počet záznamů na stránku a filtrování nad sloupci. V pravém horním rohu je tlačítko + pro přidání nové činnosti.
  Zákazníka lze odstranit tlačítkem v detailu zákazníka pomocí kliknutí na ikonu koše 🗑 která je vedle ikony ✏️. Při smazání zákazníka se odstraní i všechny činnosti s ním spojené. Mázaní je opět potřeba potvrdit v dialogu s tím, že je třeba napsat název zakazníka do potvrzovacího pole, aby došlo k jeho odstranění.

Atributy zákazníka:

- Název
- IČ
- DIČ
- Adresa
- Kontaktní osoba
- Telefon
- Email

Atributy činnosti:

- Název činnosti
- Datum a čas spuštění činnosti
- Datum a čas ukončení činnosti
- Vykázaná doba (dopočtené pole - Read only) (Vizualizované všude ve struktuře HH:MM (nezobrazujeme sekundy níže))
- Zákazník

### Uživatelský profil

Zde bude možné se odhlásit a nechat svůj účet smazat. Při smazání účtu budou odstraněny všechny záznamy spojené s tímto uživatelem.

## Přihlašovací/registrační stránka

Přihlašovací/registrační stránka bude obsahovat pole pro zadání emailu a hesla. Po úspěšném přihlášení bude uživatel přesměrován na stránku přehledu. V případě neúspěšného přihlášení se zobrazí chybová hláška. Pro nové uživatele bude k dispozici možnost registrace. Dále je třeba:

- Přihlašovaní pomocí google účtu
- Reset hesla
  Zde nevymýšlet nic nového, držet se standardního přihlašovacího a registračního procesu.

## Podmínky použití

- Je třeba vydefinovat podmínky použití, kterého mě budou chránit a zároveň informovat uživatele o jejich právech a povinnostech při používání aplikace. Je třeba zmínit, že mám právo podmínky kdykoli měnit. Pokud budou kdykoli přestat aplikaci používat, mohou smazat svůj profíl a tím se mažou i veškerá data, která kdy vytvořila.

# Obecné

- Je možné paralelní běh činností.
- Je třeba řešit změnu letního a zimního času (zkrácení/ prodloužení dne o hodiny v lomové dny).

# Technologie a design:

- Frontend: React, TypeScript
- Backend: Firebase Functions -> pro hromadné operace jako např mazání uživatele
- Hosting: Firebase
- Databáze: Firebase Firestore
- UI knihovna: Material-UI
- Autentizace: Firebase
- Stylování: CSS-in-JS (Emotion)

# Zabezpečení

- Autentizace pomocí Firebase, včetně podpory Google účtu a resetu hesla.
- Logika stukturování dat pro různé uživatele bude:
  - Každý uživatel bude mít přístup pouze ke svým vlastním zákazníkům a činnostem.
  - Data budou uložena ve Firebase Firestore s odpovídajícími bezpečnostními pravidly pro omezení přístupu.
  - Při načítání dat bude aplikace filtrovat záznamy podle aktuálně přihlášeného uživatele.
  - Firestore rules budou definovat přístupová práva tak, aby každý uživatel mohl číst a zapisovat pouze své vlastní záznamy.
