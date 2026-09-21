import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

/** Zástupná obrazovka, než ji nahradí skutečná v dalších etapách. */
export function PlaceholderPage({ title }: { title: string }) {
  return (
    <Paper sx={{ p: 3, maxWidth: 640 }}>
      <Typography variant="subtitle1">{title}</Typography>
      <Typography variant="body2" color="text.secondary">
        Tato obrazovka přijde v některé z dalších etap.
      </Typography>
    </Paper>
  );
}
