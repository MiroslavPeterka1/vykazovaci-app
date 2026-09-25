/**
 * Text podmínek použití, převzatý doslovně z vizuálního návrhu.
 *
 * POZOR: jde o návrh k právní revizi. Údaje provozovatele a datum účinnosti jsou
 * doplněné; text sám ale právníkem neprošel.
 */

export interface TermsSection {
  heading: string;
  body: string;
}

/** Zvyšuje se při každé změně textu; ukládá se k souhlasu uživatele. */
export const TERMS_VERSION = '2026-09-23';

export const TERMS_EFFECTIVE_FROM = '23. 9. 2026';

export const termsSections: TermsSection[] = [
  {
    heading: '1. Kdo službu provozuje',
    body: 'Aplikaci Vykazovátko (dále „služba“) provozuje Miroslav Peterka, kontakt: miroslav.peterka1@seznam.cz. Služba slouží k evidenci zákazníků a k vykazování odpracované doby. Je poskytována bezplatně a nejde o podnikatelskou činnost — provozovatel ji nabízí jako volně dostupný nástroj.',
  },
  {
    heading: '2. Registrace a účet',
    body: 'Službu může používat kdokoli starší 18 let. Registrací potvrzujete, že údaje, které zadáváte, jsou pravdivé, a že odpovídáte za zabezpečení svého hesla. Za činnost provedenou pod vaším účtem odpovídáte vy.',
  },
  {
    heading: '3. Vaše data',
    body: 'Záznamy, které ve službě vytvoříte, jsou přístupné pouze vám. Provozovatel k nim přistupuje jen v nezbytném rozsahu při řešení technického problému nebo na základě zákonné povinnosti. Data jsou uložena v databázi Google Firebase.',
  },
  {
    heading: '4. Obsah, který vkládáte',
    body: 'Odpovídáte za obsah, který do služby vkládáte, včetně osobních údajů třetích osob (například kontaktních osob zákazníků). Ve vztahu k těmto údajům jste správcem vy, provozovatel je pouze zpracovatelem. Do služby nesmíte vkládat nezákonný obsah ani ji používat způsobem, který ji poškozuje nebo přetěžuje.',
  },
  {
    heading: '5. Dostupnost a odpovědnost',
    body: 'Služba je poskytována zdarma a „tak, jak je“, bez záruky dostupnosti, bezchybnosti nebo vhodnosti pro konkrétní účel. Provozovatel neodpovídá za škodu vzniklou používáním služby, ztrátou dat ani za nepřímé škody, zejména ušlý zisk. Doporučujeme si důležitá data zálohovat mimo službu.',
  },
  {
    heading: '6. Ukončení a smazání účtu',
    body: 'Používání služby můžete kdykoli ukončit. Smazáním profilu v sekci Uživatelský profil se nenávratně odstraní všechna data, která jste ve službě vytvořili. Provozovatel může účet zrušit při porušení těchto podmínek nebo při ukončení provozu služby; o ukončení provozu informuje s přiměřeným předstihem.',
  },
  {
    heading: '7. Změny podmínek',
    body: 'Provozovatel má právo tyto podmínky kdykoli změnit. Aktuální znění je vždy dostupné v aplikaci. Pokud po zveřejnění změny službu dále používáte, platí, že se změnou souhlasíte. Pokud se změnou nesouhlasíte, můžete svůj účet smazat.',
  },
  {
    heading: '8. Rozhodné právo',
    body: 'Vztah mezi vámi a provozovatelem se řídí právem České republiky. Případné spory rozhodují české soudy.',
  },
];
