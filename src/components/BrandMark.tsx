import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

/** Logo z návrhu: modrý čtverec s písmenem V a název aplikace. */
export function BrandMark({ size = 36, title = true }: { size?: number; title?: boolean }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: 1,
          bgcolor: 'primary.main',
          color: 'common.white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 500,
          fontSize: size / 2,
        }}
      >
        V
      </Box>
      {title && (
        <Typography sx={{ fontSize: size < 36 ? 16 : 20, fontWeight: 500, letterSpacing: '.15px' }}>
          Výkazy práce
        </Typography>
      )}
    </Box>
  );
}
