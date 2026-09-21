import ButtonBase from '@mui/material/ButtonBase';

import { GoogleIcon } from './GoogleIcon';

/**
 * Tlačítko „Přihlásit se přes Google“ podle brand guidelines Googlu
 * (https://developers.google.com/identity/branding-guidelines), světlá varianta.
 *
 * Záměrně nestaví na `<Button>` z MUI: ten text převádí na verzálky a přidává
 * prostrkání, což by znění tlačítka porušilo. Hodnoty odpovídají specifikaci —
 * výplň #FFFFFF, okraj #747775 1px dovnitř, text #1F1F1F, 14/20 medium,
 * odsazení 12 px / 10 px / 12 px a logo 18 px na bílém podkladu.
 *
 * Dvě věci, které guidelines nepředepisují a bereme z okolního designu:
 * výška 40 px a rádius 4 px. Písmo Google Sans není pro třetí strany dostupné,
 * proto Roboto Medium — stejně jako v referenční implementaci Googlu.
 */
export function GoogleSignInButton({
  onClick,
  disabled,
  label = 'Pokračovat přes Google',
}: {
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <ButtonBase
      onClick={onClick}
      disabled={disabled}
      sx={{
        width: '100%',
        height: 40,
        borderRadius: 1,
        bgcolor: '#FFFFFF',
        border: '1px solid #747775',
        color: '#1F1F1F',
        fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
        fontSize: 14,
        lineHeight: '20px',
        fontWeight: 500,
        letterSpacing: 'normal',
        textTransform: 'none',
        justifyContent: 'center',
        pl: '12px',
        pr: '12px',
        gap: '10px',
        '&:hover': { bgcolor: '#f7f7f7' },
        '&.Mui-disabled': { opacity: 0.38 },
      }}
    >
      <GoogleIcon sx={{ fontSize: 18 }} />
      {label}
    </ButtonBase>
  );
}
