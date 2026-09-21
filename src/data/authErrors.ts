/** Převod kódů Firebase Auth na hlášky, které dávají smysl uživateli. */

const MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'Nesprávný e-mail nebo heslo.',
  'auth/invalid-login-credentials': 'Nesprávný e-mail nebo heslo.',
  'auth/wrong-password': 'Nesprávný e-mail nebo heslo.',
  'auth/user-not-found': 'Nesprávný e-mail nebo heslo.',
  'auth/user-disabled': 'Tento účet je zablokovaný.',
  'auth/email-already-in-use': 'Účet s tímto e-mailem už existuje. Zkuste se přihlásit.',
  'auth/weak-password': 'Heslo je příliš slabé, použijte alespoň 6 znaků.',
  'auth/invalid-email': 'Neplatný e-mail.',
  'auth/too-many-requests': 'Příliš mnoho pokusů. Zkuste to prosím za chvíli.',
  'auth/network-request-failed': 'Nepodařilo se spojit se serverem. Zkontrolujte připojení.',
  'auth/operation-not-allowed': 'Tento způsob přihlášení není povolený.',
  'auth/popup-blocked': 'Prohlížeč zablokoval přihlašovací okno Google.',
  // Firebase drží jeden účet na e-mail. Když uživatel založil účet heslem a pak
  // zkusí Google (nebo naopak), je potřeba mu říct, kterou cestou se má přihlásit.
  'auth/account-exists-with-different-credential':
    'S tímto e-mailem už účet existuje, ale byl založený jiným způsobem. Přihlaste se e-mailem a heslem.',
};

/** Zavřené přihlašovací okno není chyba, na kterou má smysl upozorňovat. */
const SILENT = new Set(['auth/popup-closed-by-user', 'auth/cancelled-popup-request']);

function errorCode(error: unknown): string | null {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const { code } = error as { code: unknown };
    if (typeof code === 'string') return code;
  }
  return null;
}

/** Vrátí hlášku k zobrazení, nebo null, pokud se nemá hlásit nic. */
export function authErrorMessage(error: unknown): string | null {
  const code = errorCode(error);
  if (code && SILENT.has(code)) return null;
  if (code && MESSAGES[code]) return MESSAGES[code];
  return 'Přihlášení se nezdařilo. Zkuste to prosím znovu.';
}
