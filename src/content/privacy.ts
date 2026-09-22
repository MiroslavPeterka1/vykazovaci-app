import type { TermsSection } from './terms';

/**
 * Zásady ochrany osobních údajů — NÁVRH K PRÁVNÍ REVIZI.
 *
 * Před spuštěním doplnit údaje provozovatele (sekce 1) a datum účinnosti.
 * Odkaz na tuto stránku vyžaduje i Google OAuth consent screen, bez něj
 * Google přihlašování neschválí.
 */

export const PRIVACY_VERSION = '2026-09-22';
export const PRIVACY_EFFECTIVE_FROM = '22. 9. 2026';

export const privacySections: TermsSection[] = [
  {
    heading: '1. Kdo údaje zpracovává',
    body: 'Aplikaci Výkazy práce provozuje Miroslav Peterka, IČ 00000000, kontakt: podpora@vykazy.cz (dále „provozovatel“). Na otázky k ochraně osobních údajů odpovídá provozovatel na uvedeném e-mailu.',
  },
  {
    heading: '2. Jaké údaje o vás zpracováváme',
    body: 'K vedení účtu zpracováváme vaši e-mailovou adresu, jméno, které jste uvedli, a technické údaje nutné k přihlášení. Pokud se přihlašujete přes Google, získáváme od Googlu e-mail a jméno z vašeho účtu; heslo se k nám v takovém případě nedostane. Dále zpracováváme obsah, který v aplikaci sami vytvoříte — záznamy o zákaznících a vykázané činnosti.',
  },
  {
    heading: '3. Údaje vašich zákazníků',
    body: 'Do aplikace vkládáte i osobní údaje třetích osob, typicky jméno, telefon a e-mail kontaktní osoby zákazníka. Ve vztahu k těmto údajům jste správcem vy — rozhodujete, koho do aplikace zadáte a proč. Provozovatel je vůči nim pouze zpracovatelem a nakládá s nimi jen v rozsahu nutném pro provoz služby. Odpovídáte za to, že pro jejich zpracování máte právní důvod a že jste dotčené osoby informovali.',
  },
  {
    heading: '4. Proč údaje zpracováváme',
    body: 'Údaje k účtu zpracováváme proto, abychom vám mohli službu poskytnout — tedy pro plnění smlouvy, kterou s vámi uzavíráme přijetím podmínek použití. Technické záznamy o provozu zpracováváme na základě oprávněného zájmu na zabezpečení a stabilitě služby. Pro marketing vaše údaje nepoužíváme a nikomu je neprodáváme.',
  },
  {
    heading: '5. Kde jsou data uložena',
    body: 'Služba běží na platformě Google Firebase. Databáze i soubory jsou uloženy v datových centrech v Evropské unii. Poskytovatelem infrastruktury je společnost Google, která pro nás vystupuje jako další zpracovatel. Kromě Googlu nepředáváme údaje žádné třetí straně, ledaže to ukládá zákon.',
  },
  {
    heading: '6. Jak dlouho údaje uchováváme',
    body: 'Údaje uchováváme po dobu, po kterou máte účet. Smazáním účtu v sekci Uživatelský profil se nenávratně odstraní váš účet, všichni vaši zákazníci i všechny vykázané činnosti. Provozovatel si nenechává zálohy nad rámec technických záloh platformy, které se automaticky přepisují.',
  },
  {
    heading: '7. Vaše práva',
    body: 'Máte právo na přístup ke svým údajům, na jejich opravu a výmaz, na omezení zpracování, na přenositelnost a právo vznést námitku proti zpracování. Většinu z toho zvládnete přímo v aplikaci — údaje si můžete kdykoli zobrazit, upravit i smazat. S čímkoli dalším se obraťte na kontaktní e-mail. Pokud máte za to, že zpracováním porušujeme vaše práva, můžete podat stížnost u Úřadu pro ochranu osobních údajů (uoou.cz).',
  },
  {
    heading: '8. Cookies a úložiště prohlížeče',
    body: 'Aplikace nepoužívá analytické ani reklamní cookies a nikoho nesleduje. Do úložiště vašeho prohlížeče ukládáme pouze údaje nezbytné k tomu, abyste zůstali přihlášeni. Bez nich by služba nefungovala, proto k nim nepotřebujeme váš souhlas.',
  },
  {
    heading: '9. Zabezpečení',
    body: 'Přístup k datům je řízen tak, aby se každý uživatel dostal pouze ke svým vlastním záznamům. Komunikace mezi prohlížečem a serverem probíhá šifrovaně. Provozovatel k obsahu vašich záznamů přistupuje jen v nezbytném rozsahu při řešení technického problému nebo na základě zákonné povinnosti.',
  },
  {
    heading: '10. Změny těchto zásad',
    body: 'Znění zásad může provozovatel v čase upravit, například když se změní způsob provozu služby. Aktuální verze je vždy dostupná v aplikaci. O podstatných změnách provozovatel informuje s přiměřeným předstihem.',
  },
];
