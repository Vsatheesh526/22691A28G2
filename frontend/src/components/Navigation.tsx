import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
} from '@mui/material';
import { Link as LinkIcon, Analytics as AnalyticsIcon } from '@mui/icons-material';
import { logger } from '../utils/logger';

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    logger.log('frontend', 'info', 'navigation', `Navigating to ${path}`);
    navigate(path);
  };

  return (
    <AppBar position="static" elevation={1}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <LinkIcon sx={{ mr: 1 }} />
            <Typography
              variant="h6"
              component="div"
              sx={{ 
                flexGrow: 1, 
                cursor: 'pointer',
                fontWeight: 600 
              }}
              onClick={() => handleNavigation('/')}
            >
              URL Shortener
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              color="inherit"
              startIcon={<LinkIcon />}
              onClick={() => handleNavigation('/')}
              sx={{
                backgroundColor: location.pathname === '/' ? 'rgba(255,255,255,0.1)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              Shortener
            </Button>
            <Button
              color="inherit"
              startIcon={<AnalyticsIcon />}
              onClick={() => handleNavigation('/stats')}
              sx={{
                backgroundColor: location.pathname === '/stats' ? 'rgba(255,255,255,0.1)' : 'transparent',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                },
              }}
            >
              Statistics
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navigation; 