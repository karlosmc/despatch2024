import { create } from 'zustand';
import {persist} from 'zustand/middleware'




import { LoginUser, User } from '../types/user.interface';
import { authService } from '../service/AuthService';

interface AuthState {
  user: any | null;
  updateUser: (user: Partial<any>) => void;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  message: string | null;
  login: (credentials: LoginUser) => Promise<void>;
  logout: () => Promise<void>;
  forceLogout: () => void; // Para logout inmediato desde interceptor
  register: (credentials: User) => Promise<void>;
  reset: () => void;
  checkAuth: () => void;
  // loadUserFromStorage: () => void;
}

function getToken() {
  return localStorage.getItem('AUTH_TOKEN') || null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      updateUser: (userModified: Partial<User>) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userModified } : null,
        })),
      loading: false,
      error: null,
      isAuthenticated: false,
      message: null,

      login: async (credentials: LoginUser) => {
        set({ loading: true, error: null });
        try {
          const user = await authService.login(credentials);
          
          // Guardar el estado en Zustand (se persistirá automáticamente)
          set({ user, isAuthenticated: true, loading: false, error: null });
          
          // console.log('Usuario logueado y guardado en auth-storage:', user);
          
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || error || 'Error en login';
          set({
            error: errorMessage,
            loading: false,
            isAuthenticated: false,
          });
          // Re-throw the error so LoginForm can catch it
          throw error;
        }
      },

      logout: async () => {
        set({ loading: true });
        try {
          // Llamar al servicio de logout
          await authService.logout();
          console.log("Logout del servidor completado");
        } catch (error: any) {
          // Registrar el error pero no fallar el logout
          console.error("Error en logout del servidor:", error);
        } finally {
          // Siempre limpiar el estado local
          set({ 
            user: null, 
            isAuthenticated: false, 
            loading: false, 
            error: null,
            message: null 
          });
          
          // Limpiar el storage persistente de Zustand
          localStorage.removeItem('auth-storage');
          
          // Limpiar otros stores
          const { useTokenParamsStore } = await import('./tokenParamsStore');
          const { useMiscStore } = await import('./miscStore');
          useTokenParamsStore.getState().clearAll();
          useMiscStore.getState().clearAll();
          
          console.log("Estado de autenticación limpiado completamente");
        }
      },

      forceLogout: () => {
        // Logout inmediato sin llamar al servidor (para interceptor)
        console.log("🔄 Force logout ejecutado por interceptor");
        
        // Limpiar el estado inmediatamente
        set({ 
          user: null, 
          isAuthenticated: false, 
          loading: false, 
          error: null,
          message: null 
        });
        
        // Limpiar storage
        localStorage.removeItem('AUTH_TOKEN');
        localStorage.removeItem('user');
        localStorage.removeItem('auth-storage');
        
        // Limpiar otros stores (importación dinámica para evitar dependencias circulares)
        import('./tokenParamsStore').then(({ useTokenParamsStore }) => {
          useTokenParamsStore.getState().clearAll();
        });
        import('./miscStore').then(({ useMiscStore }) => {
          useMiscStore.getState().clearAll();
        });
        
        console.log("✅ Force logout completado");
      },

      register: async (credentials: User) => {
        set({ loading: true, error: null });
        try {
          await authService.register(credentials);
          set({ isAuthenticated: true, loading: false, error: null });
        } catch (error: any) {
          const errorMessage = error?.response?.data?.message || error || 'Error en registro';
          set({
            error: errorMessage,
            loading: false,
            isAuthenticated: false,
          });
          // Re-throw the error so RegisterForm can catch it
          throw error;
        }
      },

      reset: () => set({ loading: false, error: null, message: null }),

      checkAuth: () => {
        const token = getToken();
        
        if (token) {
          // Si hay token, intentar obtener el usuario del storage persistente de Zustand
          try {
            const authStorage = localStorage.getItem('auth-storage');
            if (authStorage) {
              const parsedStorage = JSON.parse(authStorage);
              const storedState = parsedStorage?.state;
              
              if (storedState?.user && storedState?.isAuthenticated) {
                // Restaurar el estado desde el storage de Zustand
                set({ 
                  user: storedState.user, 
                  isAuthenticated: true, 
                  loading: false,
                  error: null 
                });
                // console.log('Usuario restaurado desde auth-storage:', storedState.user);
                return;
              }
            }
          } catch (error) {
            console.error('Error al restaurar usuario desde auth-storage:', error);
          }
          
          // Si hay token pero no se pudo restaurar el usuario, limpiar el token
          console.log('Token encontrado pero usuario no válido, limpiando...');
          localStorage.removeItem('AUTH_TOKEN');
        }
        
        // No hay token válido o usuario, marcar como no autenticado
        set({ 
          user: null, 
          isAuthenticated: false, 
          loading: false,
          error: null 
        });
      },
    }),
    {
      name: 'auth-storage', // clave en localStorage
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }), // opcional, qué guardar
    }
  )
);