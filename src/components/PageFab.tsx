import AddIcon from '@mui/icons-material/Add';
import Fab from '@mui/material/Fab';

import { layout } from '../theme';

/**
 * Plovoucí tlačítko vpravo dole. Na mobilu se zvedá nad spodní navigaci,
 * aby ji nepřekrývalo.
 */
export function PageFab({ title, onClick }: { title: string; onClick: () => void }) {
  return (
    <Fab
      color="primary"
      aria-label={title}
      title={title}
      onClick={onClick}
      sx={{
        position: 'fixed',
        right: { xs: 16, md: 32 },
        bottom: {
          xs: `calc(72px + env(safe-area-inset-bottom, 0px))`,
          md: 32,
        },
        width: layout.fabSize,
        height: layout.fabSize,
        zIndex: (theme) => theme.zIndex.appBar + 1,
      }}
    >
      <AddIcon />
    </Fab>
  );
}
