import { useMemo, useState, type ReactNode } from 'react';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import ButtonBase from '@mui/material/ButtonBase';
import Drawer from '@mui/material/Drawer';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Link as RouterLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { countRunning } from '../domain/plural';
import { useAuth } from '../data/useAuth';
import { useRunningActivities } from '../data/useRunningActivities';
import { layout } from '../theme';
import { BrandMark } from './BrandMark';
import { EmailVerificationBanner } from './EmailVerificationBanner';
import { PageTitleContext } from './pageTitleContext';
import { userInitials } from './userInitials';

const NAV_ITEMS = [
  { to: '/prehled', label: 'Přehled', icon: <DashboardOutlinedIcon /> },
  { to: '/zakaznici', label: 'Zákazníci', icon: <PeopleOutlinedIcon /> },
];

function defaultTitle(pathname: string): string {
  if (pathname.startsWith('/zakaznici/')) return 'Zákazník';
  if (pathname.startsWith('/zakaznici')) return 'Zákazníci';
  if (pathname.startsWith('/profil')) return 'Uživatelský profil';
  if (pathname.startsWith('/podminky')) return 'Podmínky použití';
  return 'Přehled';
}

/** Zvýraznění položky menu: detail zákazníka patří pod Zákazníky. */
function isActive(pathname: string, to: string): boolean {
  return pathname === to || pathname.startsWith(`${to}/`);
}

/**
 * `children` slouží stránce podmínek, která se dá otevřít i bez přihlášení —
 * přihlášenému uživateli se vykreslí uvnitř aplikace, ostatním samostatně.
 */
export function AppShell({ children }: { children?: ReactNode }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const [customTitle, setCustomTitle] = useState<string | null>(null);
  const { activities: running } = useRunningActivities();

  const title = customTitle ?? defaultTitle(location.pathname);
  const runningLabel = countRunning(running.length);

  return (
    <PageTitleContext.Provider value={setCustomTitle}>
      <Box sx={{ minHeight: '100vh', display: 'flex', bgcolor: 'background.default' }}>
        {!isMobile && <DesktopNav pathname={location.pathname} />}

        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <AppBar position="sticky" sx={{ zIndex: theme.zIndex.drawer + 1 }}>
            <Toolbar sx={{ height: layout.appBarHeight, gap: 2 }}>
              <Typography variant="h6" noWrap>
                {title}
              </Typography>
              {running.length > 0 && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    bgcolor: 'rgba(255,255,255,0.18)',
                    borderRadius: 4,
                    px: 1.5,
                    py: 0.5,
                    fontSize: 13,
                  }}
                >
                  <Box
                    sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#66bb6a' }}
                    aria-hidden
                  />
                  {runningLabel}
                </Box>
              )}
            </Toolbar>
          </AppBar>

          <EmailVerificationBanner />

          <Box component="main" sx={{ flex: 1, p: { xs: 2, md: 3 }, minWidth: 0 }}>
            {children ?? <Outlet />}
          </Box>

          {isMobile ? <Box sx={{ height: 56 }} /> : <AppFooter />}
        </Box>

        {isMobile && <MobileNav pathname={location.pathname} />}
      </Box>
    </PageTitleContext.Provider>
  );
}

function DesktopNav({ pathname }: { pathname: string }) {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const displayName = profile?.displayName || user?.displayName || '';

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: layout.drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: layout.drawerWidth,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Box
        sx={{
          height: layout.appBarHeight,
          display: 'flex',
          alignItems: 'center',
          px: 2,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <BrandMark size={32} />
      </Box>

      <Box sx={{ p: 1 }}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.to);
          return (
            <ButtonBase
              key={item.to}
              onClick={() => navigate(item.to)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                width: '100%',
                px: 2,
                py: 1.25,
                mb: '2px',
                borderRadius: 1,
                justifyContent: 'flex-start',
                fontSize: 14,
                color: active ? 'primary.dark' : 'rgba(0,0,0,0.75)',
                fontWeight: active ? 500 : 400,
                bgcolor: active ? 'rgba(25,118,210,0.12)' : 'transparent',
                '&:hover': { bgcolor: active ? 'rgba(25,118,210,0.16)' : 'rgba(0,0,0,0.04)' },
              }}
            >
              <Box sx={{ display: 'flex', color: 'inherit' }}>{item.icon}</Box>
              {item.label}
            </ButtonBase>
          );
        })}
      </Box>

      <ButtonBase
        onClick={() => navigate('/profil')}
        sx={{
          mt: 'auto',
          width: '100%',
          p: 2,
          gap: 1.5,
          borderTop: 1,
          borderColor: 'divider',
          justifyContent: 'flex-start',
          textAlign: 'left',
          bgcolor: isActive(pathname, '/profil') ? 'rgba(25,118,210,0.12)' : 'transparent',
          '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
        }}
      >
        <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.light', fontSize: 14 }}>
          {userInitials(displayName, user?.email)}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" noWrap>
            {displayName || 'Uživatel'}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap component="div">
            {user?.email}
          </Typography>
        </Box>
        <ChevronRightIcon sx={{ ml: 'auto', color: 'rgba(0,0,0,0.4)' }} />
      </ButtonBase>
    </Drawer>
  );
}

function MobileNav({ pathname }: { pathname: string }) {
  const navigate = useNavigate();
  const value = useMemo(() => {
    if (isActive(pathname, '/zakaznici')) return '/zakaznici';
    if (isActive(pathname, '/profil') || pathname.startsWith('/podminky')) return '/profil';
    return '/prehled';
  }, [pathname]);

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: (theme) => theme.zIndex.appBar,
        pb: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <BottomNavigation value={value} onChange={(_, next: string) => navigate(next)} showLabels>
        <BottomNavigationAction value="/prehled" label="Přehled" icon={<DashboardOutlinedIcon />} />
        <BottomNavigationAction
          value="/zakaznici"
          label="Zákazníci"
          icon={<PeopleOutlinedIcon />}
        />
        <BottomNavigationAction value="/profil" label="Profil" icon={<PersonOutlinedIcon />} />
      </BottomNavigation>
    </Paper>
  );
}

function AppFooter() {
  return (
    <Box
      component="footer"
      sx={{
        borderTop: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        px: 3,
        py: 2,
        display: 'flex',
        gap: 2,
        alignItems: 'center',
        fontSize: 13,
        color: 'text.secondary',
      }}
    >
      <span>© {new Date().getFullYear()} Vykazovátko</span>
      <Link component={RouterLink} to="/podminky" variant="body2">
        Podmínky použití
      </Link>
      <Link component={RouterLink} to="/ochrana-osobnich-udaju" variant="body2">
        Ochrana osobních údajů
      </Link>
    </Box>
  );
}
