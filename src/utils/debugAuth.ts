// Archivo temporal para debugging del auth storage
// Puedes ejecutar estas funciones en la consola del navegador

export const debugAuthStorage = () => {
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
  const { useAuthStore } = require('../store/authStore');
  const currentState = useAuthStore.getState();
  console.log('7. Estado actual del store:', {
    user: currentState.user,
    isAuthenticated: currentState.isAuthenticated,
    loading: currentState.loading,
    error: currentState.error
  });
  
  console.log('=== FIN DEBUG ===');
};

export const clearAllAuth = () => {
  console.log('Limpiando todo el auth storage...');
  localStorage.removeItem('AUTH_TOKEN');
  localStorage.removeItem('auth-storage');
  localStorage.removeItem('user'); // por si quedó algo del anterior
  console.log('Auth storage limpiado');
};

export const simulateLogin = () => {
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
  
  // Recargar la página para que tome efecto
  window.location.reload();
};

// Para usar en la consola del navegador:
// import { debugAuthStorage, clearAllAuth, simulateLogin } from './src/utils/debugAuth.ts'
