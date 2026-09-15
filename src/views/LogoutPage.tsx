import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Box, Button, Typography, Container } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';

const LogoutPage: React.FC = () => {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth/login', { replace: true });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          gap: 3,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Cerrar Sesión
        </Typography>
        
        <Typography variant="body1" textAlign="center" color="textSecondary">
          ¿Estás seguro de que deseas cerrar tu sesión?
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
          >
            Cerrar Sesión
          </Button>
          
          <Button
            variant="outlined"
            onClick={() => navigate(-1)}
          >
            Cancelar
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default LogoutPage;
