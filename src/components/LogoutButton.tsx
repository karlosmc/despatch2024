import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Button, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogContentText, 
  DialogTitle,
  CircularProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuthStore } from '../store/authStore';

interface LogoutButtonProps {
  variant?: 'button' | 'icon' | 'menuItem';
  showConfirmDialog?: boolean;
  onLogoutComplete?: () => void;
  size?: 'small' | 'medium' | 'large';
  color?: 'inherit' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
}

const LogoutButton: React.FC<LogoutButtonProps> = ({
  variant = 'button',
  showConfirmDialog = true,
  onLogoutComplete,
  size = 'medium',
  color = 'error'
}) => {
  const { logout, loading } = useAuthStore();
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogoutClick = () => {
    if (showConfirmDialog) {
      setOpenDialog(true);
    } else {
      handleConfirmLogout();
    }
  };

  const handleConfirmLogout = async () => {
    try {
      setIsLoggingOut(true);
      setOpenDialog(false);
      
      console.log("Iniciando proceso de logout...");
      
      await logout();
      
      console.log("Logout completado, redirigiendo...");
      
      // Ejecutar callback si se proporciona
      if (onLogoutComplete) {
        onLogoutComplete();
      }
      
      // Redirigir al login
      navigate('/auth/login', { replace: true });
      
    } catch (error) {
      console.error('Error durante el logout:', error);
      // Aunque haya error, redirigir al login porque el estado local se limpió
      navigate('/auth/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Renderizar según el variant
  const renderButton = () => {
    const isDisabled = loading || isLoggingOut;
    
    switch (variant) {
      case 'icon':
        return (
          <Tooltip title="Cerrar Sesión">
            <IconButton
              onClick={handleLogoutClick}
              disabled={isDisabled}
              color={color}
              size={size}
            >
              {isLoggingOut ? (
                <CircularProgress size={20} />
              ) : (
                <LogoutIcon />
              )}
            </IconButton>
          </Tooltip>
        );

      case 'menuItem':
        return (
          <Button
            onClick={handleLogoutClick}
            disabled={isDisabled}
            startIcon={isLoggingOut ? <CircularProgress size={16} /> : <LogoutIcon />}
            color={color}
            size={size}
            fullWidth
            sx={{ justifyContent: 'flex-start' }}
          >
            {isLoggingOut ? 'Cerrando sesión...' : 'Cerrar Sesión'}
          </Button>
        );

      default: // 'button'
        return (
          <Button
            variant="contained"
            color={color}
            onClick={handleLogoutClick}
            disabled={isDisabled}
            startIcon={isLoggingOut ? <CircularProgress size={16} color="inherit" /> : <LogoutIcon />}
            size={size}
          >
            {isLoggingOut ? 'Cerrando...' : 'Cerrar Sesión'}
          </Button>
        );
    }
  };

  return (
    <>
      {renderButton()}
      
      {/* Dialog de confirmación */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
      >
        <DialogTitle id="logout-dialog-title">
          Confirmar Cierre de Sesión
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="logout-dialog-description">
            ¿Estás seguro de que deseas cerrar tu sesión? 
            Tendrás que volver a iniciar sesión para acceder a la aplicación.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmLogout} 
            color="error" 
            variant="contained"
            autoFocus
          >
            Cerrar Sesión
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LogoutButton;
