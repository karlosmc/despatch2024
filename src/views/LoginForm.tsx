import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PasswordIcon from "@mui/icons-material/Password";
import LoginIcon from "@mui/icons-material/Login";


import {

  Alert,
  Grid,
  TextField,
  InputAdornment,
  Button,
  // FormControl,
  // FormHelperText,
  // InputLabel,
  // MenuItem,
  // Select,
  Box,
  Typography,
  CircularProgress,
  Backdrop,
  Snackbar,
} from "@mui/material";


import { useFormik } from "formik";
import { LoginSchema } from "../utils/validateForm";
import { LoginUser } from "../types/user.interface";

import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

// import CryptoJS from 'crypto-js';



const button = {
  backgroundColor: "#F32323",
  "&:hover": {
    backgroundColor: "#F38223",
  },
};

const InitialValues: LoginUser = {
  documento: "",
  password: "",
  id_empresa: 1,
};

const LoginForm = () => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [ingresar, setIngresar] = useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const user = useAuthStore((state) => state.user);
  const login = useAuthStore((state) => state.login);

  const navigate = useNavigate();
  const location = useLocation();
  
  // Obtener la ruta desde donde vino el usuario
  const from = '/admin';
  
  // Verificar si viene de una sesión expirada
  const urlParams = new URLSearchParams(location.search);
  const expiredReason = urlParams.get('reason');
  const redirectPath = sessionStorage.getItem('redirectAfterLogin');

  const formik = useFormik({
    initialValues: InitialValues,
    validationSchema: LoginSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setIsLoggingIn(true);
        setMessage('');
        setErrorMessage('');
        setIngresar(true);

        const datos: LoginUser = {
          documento: values.documento,
          id_empresa: values.id_empresa,
          password: values.password,
        };

        await login(datos);
        
        console.log("Login exitoso, usuario obtenido");
        
        const currentUser = useAuthStore.getState().user;
        
        // Login exitoso
        setLoading(false);
        setIsLoggingIn(false);
        setIngresar(false);
        setMessage(`Bienvenido ${currentUser?.name || 'Usuario'}`);
        
        // Limpiar el redirectPath del sessionStorage
        sessionStorage.removeItem('redirectAfterLogin');
        
        // Determinar a dónde redirigir
        const targetPath = redirectPath || from;
        navigate(targetPath, { replace: true });
        
      } catch (error: any) {
        // Manejar errores del login
        let errorMsg = 'Error de conexión. Intente nuevamente.';
        
        console.error("Error completo en login:", error);
        
        // Manejar diferentes tipos de errores
        if (error?.response) {
          // Error de respuesta HTTP
          const status = error.response.status;
          const responseData = error.response.data;
          
          // console.log("Status:", status);
          // console.log("Response data:", responseData);
          
          switch (status) {
            case 422:
              errorMsg = responseData?.message || 'Datos de inicio de sesión inválidos';
              break;
            case 401:
              errorMsg = 'Credenciales incorrectas. Verifique su documento y contraseña.';
              break;
            case 404:
              errorMsg = 'Servicio no disponible. Contacte al administrador.';
              break;
            case 500:
              errorMsg = 'Error interno del servidor. Intente más tarde.';
              break;
            default:
              errorMsg = responseData?.message || `Error ${status}: ${error.response.statusText}`;
          }
        } else if (error?.message) {
          // Error de JavaScript o de red
          if (error.message.includes('Network Error')) {
            errorMsg = 'Error de conexión. Verifique su conexión a internet.';
          } else {
            errorMsg = error.message;
          }
        } else if (typeof error === 'string') {
          errorMsg = error;
        }
        
        setLoading(false);
        setIsLoggingIn(false);
        setIngresar(false);
        setErrorMessage(errorMsg);
        setMessage(errorMsg);
        setOpenSnackbar(true);
        
        console.error("Error en el inicio de sesión:", error);
        
        // Auto-dismiss error message after 3 seconds
        setTimeout(() => {
          setMessage('');
          setErrorMessage('');
        }, 3000);
      }
    },

  });

  // Auto-dismiss snackbar after 3 seconds
  useEffect(() => {
    if (openSnackbar) {
      const timer = setTimeout(() => {
        setOpenSnackbar(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [openSnackbar]);

  // Mostrar mensaje si viene de sesión expirada
  useEffect(() => {
    if (expiredReason === 'expired') {
      setErrorMessage('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      setMessage('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      setOpenSnackbar(true);
      
      // Limpiar el parámetro de la URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [expiredReason]);

  useEffect(() => {
    if (user) {
      const targetPath = redirectPath || from;
      sessionStorage.removeItem('redirectAfterLogin');
      navigate(targetPath, { replace: true });
    }
  }, [user, navigate, from, redirectPath]);

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setErrorMessage('');
  };

  // console.log(errores);

  // const formik = useFormik({
  //   initialValues: InitialValues,
  //   validationSchema: LoginSchema,
  //   onSubmit: async (values) => {
  //     // LogInUser(values);
  //     setMessage('')
  //     setIngresar(true)

  //     const datos: LoginUser = {
  //       documento: values.documento,
  //       id_empresa: values.id_empresa,
  //       password: values.password,

  //     }

  //     // login({ datos, setErrores })

  //     await login


  //   },
  // });




  // useEffect(() => {
  //   if(errores.length>0){
  //     setMessage(errores[0])
  //     setIngresar(false)
  //   }
  // }, [errores])

  // console.log(user)

  // const classes = useStyles();
  return (
    <>
      {/* Loading Backdrop */}
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          flexDirection: 'column',
          gap: 2
        }}
        open={isLoggingIn}
      >
        <CircularProgress 
          color="inherit" 
          size={60}
          sx={{
            animation: 'pulse 1.5s ease-in-out infinite',
            '@keyframes pulse': {
              '0%': {
                opacity: 1,
              },
              '50%': {
                opacity: 0.5,
              },
              '100%': {
                opacity: 1,
              },
            },
          }}
        />
        <Typography variant="h6" component="div" sx={{ mt: 2 }}>
          Iniciando sesión...
        </Typography>
        <Typography variant="body2" component="div" sx={{ opacity: 0.8 }}>
          Por favor espere un momento
        </Typography>
      </Backdrop>

      {/* Error Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="error" 
          sx={{ width: '100%' }}
          variant="filled"
        >
          {errorMessage}
        </Alert>
      </Snackbar>

      <Grid item md={6} xs={12}>
        <div style={{ marginBottom: "1.5rem", width: "100%" }}>
          {message !== "" && !openSnackbar ? (
            <Alert 
              severity={message.includes('Bienvenido') ? "success" : "error"}
              sx={{
                animation: message.includes('Error') || message.includes('Credenciales') ? 'shake 0.5s ease-in-out' : 'none',
                '@keyframes shake': {
                  '0%': { transform: 'translateX(0)' },
                  '25%': { transform: 'translateX(-5px)' },
                  '50%': { transform: 'translateX(5px)' },
                  '75%': { transform: 'translateX(-5px)' },
                  '100%': { transform: 'translateX(0)' },
                },
              }}
            >
              {message}
            </Alert>
          ) : ""}
        </div>
        
        {/* Loading indicator for legacy support */}
        {(!user && ingresar && !isLoggingIn) && (
          <Box display="flex" justifyContent="center" mb={2}>
            <CircularProgress color="error" />
          </Box>
        )}
        
        <Typography variant='h4' mb={2}>
          Inicio de Sesión
        </Typography>
        
        <Box 
          flexDirection={"column"} 
          gap={1} 
          display='flex' 
          justifyContent={"space-between"} 
          component='form' 
          onSubmit={formik.handleSubmit}
        >
          <TextField
            label="Nro. Documento"
            value={formik.values.documento}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            helperText={formik.touched.documento && formik.errors.documento}
            error={formik.touched.documento && Boolean(formik.errors.documento)}
            name="documento"
            fullWidth
            required
            autoComplete="off"
            placeholder="Introduzca su Nro. Documento"
            disabled={isLoggingIn || loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AccountCircleIcon />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="Contraseña"
            type="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            helperText={formik.touched.password && formik.errors.password}
            error={formik.touched.password && Boolean(formik.errors.password)}
            fullWidth
            required
            name="password"
            autoComplete="off"
            placeholder="Introduzca su Contraseña"
            disabled={isLoggingIn || loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PasswordIcon />
                </InputAdornment>
              ),
            }}
          />
          {/* <FormControl style={{ minWidth: "100%" }}>
            <InputLabel id="">Empresa</InputLabel>
            <Select
              labelId="idEstacion"
              id="idEstacion"
              name="id_empresa"
              value={formik.values.id_empresa}
              onBlur={formik.handleBlur}
              error={formik.touched.id_empresa && Boolean(formik.errors.id_empresa)}
              onChange={formik.handleChange}
              required
              disabled={isLoggingIn || loading}
            >
              <MenuItem value={""}>Seleccione la empresa</MenuItem>
              
              <MenuItem value={"1"}>Kankas</MenuItem>
            </Select>
            <FormHelperText>
              Seleccione la empresa dónde labora
            </FormHelperText>
          </FormControl> */}
          <Button
            variant="contained"
            color="error"
            sx={button}
            endIcon={isLoggingIn ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
            style={{ width: "100%", marginTop: "2rem" }}
            type="submit"
            disabled={isLoggingIn || loading || !formik.isValid}
          >
            {isLoggingIn ? 'Iniciando...' : 'Acceder'}
          </Button>
        </Box>

        <Box component={'div'} textAlign={'left'} mt={2} fontSize={12}>
          <Link 
            style={{ 
              color: isLoggingIn || loading ? '#ccc' : 'black',
              pointerEvents: isLoggingIn || loading ? 'none' : 'auto'
            }} 
            to="/auth/registro"
          >
            No tienes cuenta? crea una facilmente
          </Link>
        </Box>
      </Grid>
    </>
  );
};

export default LoginForm;
