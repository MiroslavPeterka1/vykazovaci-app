import { createTheme } from '@mui/material/styles';

/**
 * Téma odpovídá vizuálnímu návrhu ve složce design_handoff_vykazovani/.
 * Hodnoty pocházejí z jeho sekce "Design Tokens" — jde o výchozí MUI light téma
 * s několika doplňky navíc (podbarvení běžícího řádku, monospace pro časy).
 */

/** Písmo pro čísla, časy a doby — v návrhu jsou všude monospace. */
export const monoFontFamily = "'Roboto Mono', ui-monospace, SFMono-Regular, monospace";

/** Rozměry, na kterých návrh stojí. */
export const layout = {
  drawerWidth: 256,
  appBarHeight: 64,
  fabSize: 56,
  touchTarget: 44,
  contentMaxWidth: 1280,
  detailMaxWidth: 1400,
  profileMaxWidth: 640,
  termsMaxWidth: 820,
} as const;

declare module '@mui/material/styles' {
  interface Palette {
    /** Běžící (neukončená) činnost — podbarvení řádku a barva doby. */
    running: { row: string; rowHover: string; text: string };
  }
  interface PaletteOptions {
    running?: { row: string; rowHover: string; text: string };
  }
}

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2', dark: '#1565c0', light: '#42a5f5' },
    error: { main: '#d32f2f', dark: '#c62828' },
    success: { main: '#2e7d32', dark: '#1b5e20', light: '#e8f5e9' },
    warning: { main: '#ed6c02' },
    background: { default: '#f5f5f5', paper: '#ffffff' },
    divider: 'rgba(0,0,0,0.12)',
    running: { row: '#fff8e1', rowHover: '#ffecb3', text: '#ed6c02' },
  },
  shape: { borderRadius: 4 },
  typography: {
    fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
    h1: { fontSize: 28, fontWeight: 400 },
    h6: { fontSize: 20, fontWeight: 500, letterSpacing: '0.15px' },
    subtitle1: { fontSize: 16, fontWeight: 500 },
    body1: { fontSize: 15 },
    body2: { fontSize: 14 },
    caption: { fontSize: 12 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { WebkitFontSmoothing: 'antialiased' },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 1 },
    },
    MuiAppBar: {
      defaultProps: { elevation: 4, color: 'primary' },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'medium' },
    },
    MuiTableCell: {
      styleOverrides: {
        head: { fontSize: 13, fontWeight: 500, color: 'rgba(0,0,0,0.6)' },
        body: { fontSize: 14 },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: false },
    },
  },
});
