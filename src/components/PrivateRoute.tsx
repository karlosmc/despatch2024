import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { CircularProgress, Box, Typography } from '@mui/material';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { user, isAuthenticated, loading, checkAuth } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    // Verificar autenticación al montar el componente
    // console.log('PrivateRoute: Verificando autenticación...');
    // console.log('Estado inicial - user:', user, 'isAuthenticated:', isAuthenticated, 'loading:', loading);
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    // Log cuando cambie el estado de autenticación
    // console.log('PrivateRoute: Estado actualizado - user:', user, 'isAuthenticated:', isAuthenticated, 'loading:', loading);
  }, [user, isAuthenticated, loading]);

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

  // Si no está autenticado, redirigir al login con la ruta actual
  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Si está autenticado, renderizar los children
  return <>{children}</>;
};

export default PrivateRoute;
