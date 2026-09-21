import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

export function App() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 3 }}>
      <Paper sx={{ p: 4, maxWidth: 420 }}>
        <Typography variant="h6" gutterBottom>
          Výkazy práce
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Skelet projektu stojí. Další na řadě je doménová vrstva (čas a výpočet doby).
        </Typography>
      </Paper>
    </Box>
  );
}
