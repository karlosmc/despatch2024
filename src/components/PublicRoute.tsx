import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ 
  children, 
  redirectTo = '/admin/guias' 
}) => {
  const { user, isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    // Verificar autenticación al montar el componente
    checkAuth();
  }, [checkAuth]);

  // Sin pantalla de "verificando" aquí: `loading` también se activa durante el
  // login, y reemplazar el formulario lo desmontaba y perdía el mensaje de error.
  // checkAuth es síncrono, así que no hace falta esperar.

  // Si ya está autenticado, redirigir a la página principal
  if (isAuthenticated && user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Si no está autenticado, renderizar los children (login/registro)
  return <>{children}</>;
};

export default PublicRoute;
