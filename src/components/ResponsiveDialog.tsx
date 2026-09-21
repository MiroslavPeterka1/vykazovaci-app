import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

export interface ResponsiveDialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Šířka na desktopu; návrh používá 480–560 podle druhu modálu. */
  maxWidth?: number;
  children: ReactNode;
  actions?: ReactNode;
}

/**
 * Modál na desktopu, spodní list na mobilu — návrh má pro obojí jiný vzor,
 * ale stejný obsah. Všechny čtyři modály aplikace stojí na tomhle.
 */
export function ResponsiveDialog({
  open,
  onClose,
  title,
  subtitle,
  maxWidth = 520,
  children,
  actions,
}: ResponsiveDialogProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const header = (
    <>
      <Typography sx={{ fontSize: 20, fontWeight: 500 }}>{title}</Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </>
  );

  if (isMobile) {
    return (
      <Drawer
        anchor="bottom"
        open={open}
        onClose={onClose}
        slotProps={{
          paper: {
            sx: {
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              maxHeight: '88%',
              pb: 'calc(28px + env(safe-area-inset-bottom, 0px))',
            },
          },
        }}
      >
        <Box sx={{ px: 3, pt: 2.5, pb: 1 }}>{header}</Box>
        <Box sx={{ px: 3, py: 1, overflowY: 'auto' }}>{children}</Box>
        {actions && <Box sx={{ px: 3, pt: 2 }}>{actions}</Box>}
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth slotProps={{ paper: { sx: { maxWidth } } }}>
      <DialogTitle sx={{ pb: subtitle ? 0.5 : 1 }}>{header}</DialogTitle>
      <DialogContent>{children}</DialogContent>
      {actions && <DialogActions sx={{ p: 2 }}>{actions}</DialogActions>}
    </Dialog>
  );
}
