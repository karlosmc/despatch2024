import React from 'react';
import { Box, Typography, Button, Card, CardContent, Grid, Chip } from '@mui/material';
import { useAuthStore } from '../store/authStore';

const AuthDebugPage: React.FC = () => {
  const { user, isAuthenticated, loading, error, checkAuth, reset } = useAuthStore();

  const debugAuthStorage = () => {
    console.log('=== DEBUG AUTH STORAGE ===');
    
    // 1. Verificar token
    const token = localStorage.getItem('AUTH_TOKEN');
    console.log('1. AUTH_TOKEN:', token ? 'EXISTE' : 'NO EXISTE', token);
    
    // 2. Verificar auth-storage de Zustand
    const authStorage = localStorage.getItem('auth-storage');
    console.log('2. auth-storage raw:', authStorage);
    
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage);
        console.log('3. auth-storage parsed:', parsed);
        console.log('4. user en storage:', parsed?.state?.user);
        console.log('5. isAuthenticated en storage:', parsed?.state?.isAuthenticated);
      } catch (error) {
        console.error('6. Error parsing auth-storage:', error);
      }
    }
    
    // 3. Verificar estado actual del store
    const currentState = useAuthStore.getState();
    console.log('7. Estado actual del store:', {
      user: currentState.user,
      isAuthenticated: currentState.isAuthenticated,
      loading: currentState.loading,
      error: currentState.error
    });
    
    console.log('=== FIN DEBUG ===');
  };

  const clearAllAuth = () => {
    console.log('Limpiando todo el auth storage...');
    localStorage.removeItem('AUTH_TOKEN');
    localStorage.removeItem('auth-storage');
    localStorage.removeItem('user');
    reset();
    console.log('Auth storage limpiado');
  };

  const simulateLogin = () => {
    console.log('Simulando login...');
    localStorage.setItem('AUTH_TOKEN', 'fake-token-123');
    
    const fakeUser = {
      id: 1,
      name: 'Usuario Test',
      email: 'test@test.com',
      documento: '12345678'
    };
    
    const authStorageData = {
      state: {
        user: fakeUser,
        isAuthenticated: true
      },
      version: 0
    };
    
    localStorage.setItem('auth-storage', JSON.stringify(authStorageData));
    console.log('Login simulado completado');
    
    // Forzar checkAuth
    checkAuth();
  };

  const simulateExpiredToken = async () => {
    console.log('🔥 Simulando token expirado...');
    
    // Cambiar el token a uno inválido
    localStorage.setItem('AUTH_TOKEN', 'expired-token-invalid');
    
    try {
      // Hacer una petición que debería fallar con 401
      const { default: apiLogged } = await import('../api/axios.auth');
      await apiLogged.get('/api/test-auth'); // Esta ruta debería devolver 401
    } catch (error) {
      console.log('✅ Error capturado por el interceptor:', error);
    }
    
    alert('Token simulado como expirado. Revisa la consola y verás la redirección.');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Auth Debug Page
      </Typography>
      
      <Grid container spacing={3}>
        {/* Estado Actual */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Estado Actual del Auth
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Autenticado:</strong>{' '}
                  <Chip 
                    label={isAuthenticated ? 'SÍ' : 'NO'} 
                    color={isAuthenticated ? 'success' : 'error'}
                    size="small"
                  />
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Loading:</strong>{' '}
                  <Chip 
                    label={loading ? 'SÍ' : 'NO'} 
                    color={loading ? 'warning' : 'default'}
                    size="small"
                  />
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Usuario:</strong>{' '}
                  {user ? (
                    <Chip label={user.name || 'Sin nombre'} color="info" size="small" />
                  ) : (
                    <Chip label="null" color="default" size="small" />
                  )}
                </Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Error:</strong>{' '}
                  {error ? (
                    <Chip label={error} color="error" size="small" />
                  ) : (
                    <Chip label="null" color="default" size="small" />
                  )}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Acciones de Debug */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Acciones de Debug
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button 
                  variant="outlined" 
                  onClick={debugAuthStorage}
                  color="info"
                >
                  Debug Storage (Ver Console)
                </Button>
                
                <Button 
                  variant="outlined" 
                  onClick={() => checkAuth()}
                  color="primary"
                >
                  Ejecutar checkAuth()
                </Button>
                
                <Button 
                  variant="outlined" 
                  onClick={simulateLogin}
                  color="success"
                >
                  Simular Login
                </Button>
                
                <Button 
                  variant="outlined" 
                  onClick={simulateExpiredToken}
                  color="warning"
                >
                  Simular Token Expirado
                </Button>
                
                <Button 
                  variant="outlined" 
                  onClick={clearAllAuth}
                  color="error"
                >
                  Limpiar Todo
                </Button>
                
                <Button 
                  variant="outlined" 
                  onClick={() => window.location.reload()}
                  color="warning"
                >
                  Recargar Página
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 3 }}>
        <Typography variant="body2" color="textSecondary">
          Abre la consola del navegador para ver los logs detallados.
        </Typography>
      </Box>
    </Box>
  );
};

export default AuthDebugPage;
