
import { Theme } from '@mui/material';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Drawer from '@mui/material/Drawer';
import useMediaQuery from '@mui/material/useMediaQuery';
import NavListing from './NavListing/NavListing';
import Logo from '../../shared/logo/Logo';
import SidebarItems from '../../vertical/sidebar/SidebarItems';
import { CustomizerContext } from '@/app/context/customizerContext';
import { useContext } from 'react';
import config from '@/app/context/config';
 import LanguageSelector from '@/app/components/shared/LanguageSelector';


const Navigation = () => {
  const lgUp = useMediaQuery((theme: Theme) => theme.breakpoints.up('lg'));
  const { activeMode, isLayout, isMobileSidebar, setIsMobileSidebar } = useContext(CustomizerContext);
  const SidebarWidth = config.sidebarWidth;

  if (lgUp) {
    return (
      <Box sx={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }} py={2}>
        <Container
          sx={{
            maxWidth: isLayout === 'boxed' ? 'lg' : '100%!important',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <NavListing />
          <LanguageSelector /> {/* ✅ Desktop için sağa eklendi */}
        </Container>
      </Box>
    );
  }

  return (
    <Drawer
      anchor="left"
      open={isMobileSidebar}
      onClose={() => setIsMobileSidebar(false)}
      variant="temporary"
      slotProps={{
        paper: {
          sx: {
            width: SidebarWidth,
            border: '0 !important',
            boxShadow: (theme) => theme.shadows[8],
          },
        }
      }}
    >
      <Box px={2}>
        <Logo />
      </Box>

      <SidebarItems />

      <Box px={2} pt={2}>
        <LanguageSelector /> {/* ✅ Mobil drawer için eklendi */}
      </Box>
    </Drawer>
  );
};

export default Navigation;
