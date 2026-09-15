import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { CircularProgress, Box, Typography } from '@mui/material';

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ 
  children, 
  redirectTo = '/admin' 
}) => {
  const { user, isAuthenticated, loading, checkAuth } = useAuthStore();

  useEffect(() => {
    // Verificar autenticación al montar el componente
    checkAuth();
  }, [checkAuth]);

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        gap={2}
      >
        <CircularProgress size={60} />
        <Typography variant="h6">Verificando autenticación...</Typography>
      </Box>
    );
  }

  // Si ya está autenticado, redirigir a la página principal
  if (isAuthenticated && user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Si no está autenticado, renderizar los children (login/registro)
  return <>{children}</>;
};

export default PublicRoute;
