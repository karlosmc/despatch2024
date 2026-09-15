import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PasswordIcon from "@mui/icons-material/Password";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import HowToRegIcon from "@mui/icons-material/HowToReg";

import {
  Grid,
  TextField,
  InputAdornment,
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Backdrop,
  Snackbar,
} from "@mui/material";

import { useFormik } from "formik";
import { RegisterSchema } from "../utils/validateForm";
import { User } from "../types/user.interface";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

// import CryptoJS from 'crypto-js';



const button = {
  backgroundColor: "#F32323",
  "&:hover": {
    backgroundColor: "#F38223",
  },
};

const InitialValues: User = {
  documento: "",
  password: "",
  id_empresa: 1,
  email: "",
  name: "",
};

const RegisterForm = () => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const register = useAuthStore((state) => state.register);
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: InitialValues,
    validationSchema: RegisterSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        setIsRegistering(true);
        setMessage('');
        setErrorMessage('');

        const datos: User = {
          documento: values.documento,
          email: values.email,
          id_empresa: values.id_empresa,
          password: values.password,
          name: values.name,
        };

        await register(datos);
        
        console.log("Registro exitoso");
        
        // Registro exitoso
        setLoading(false);
        setIsRegistering(false);
        setMessage('Registro exitoso. Redirigiendo al login...');
        
        // Redirigir a login después de 2 segundos
        setTimeout(() => {
          navigate('/auth/login');
        }, 2000);
        
      } catch (error: any) {
        // Manejar errores del registro
        let errorMsg = 'Error de conexión. Intente nuevamente.';
        
        console.error("Error completo en registro:", error);
        
        // Manejar diferentes tipos de errores
        if (error?.response) {
          // Error de respuesta HTTP
          const status = error.response.status;
          const responseData = error.response.data;
          
          console.log("Status:", status);
          console.log("Response data:", responseData);
          
          switch (status) {
            case 422:
              errorMsg = responseData?.message || 'Datos de registro inválidos. Verifique la información ingresada.';
              break;
            case 400:
              errorMsg = responseData?.message || 'Solicitud inválida. Verifique los datos ingresados.';
              break;
            case 409:
              errorMsg = 'El usuario ya existe. Intente con otro documento o email.';
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
        setIsRegistering(false);
        setErrorMessage(errorMsg);
        setMessage(errorMsg);
        setOpenSnackbar(true);
        
        console.error("Error en el registro:", error);
        
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

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
    setErrorMessage('');
  };

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
        open={isRegistering}
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
          Registrando usuario...
        </Typography>
        <Typography variant="body2" component="div" sx={{ opacity: 0.8 }}>
          Por favor espere un momento
        </Typography>
      </Backdrop>

      {/* Error/Success Snackbar */}
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
            severity={message.includes('exitoso') ? "success" : "error"}
            sx={{
              animation: message.includes('Error') || message.includes('inválidos') ? 'shake 0.5s ease-in-out' : 'none',
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
      
      <Typography variant='h4' mb={2}>
        Registro
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
          disabled={isRegistering || loading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AccountCircleIcon />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          label="Nombre de Usuario"
          value={formik.values.name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          helperText={formik.touched.name && formik.errors.name}
          error={formik.touched.name && Boolean(formik.errors.name)}
          name="name"
          fullWidth
          required
          autoComplete="off"
          placeholder="Introduzca su nombre de Usuario"
          disabled={isRegistering || loading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonIcon />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label="Email"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          helperText={formik.touched.email && formik.errors.email}
          error={formik.touched.email && Boolean(formik.errors.email)}
          name="email"
          fullWidth
          required
          autoComplete="off"
          placeholder="Introduzca su Email"
          disabled={isRegistering || loading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon />
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
          disabled={isRegistering || loading}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PasswordIcon />
              </InputAdornment>
            ),
          }}
        />

        <FormControl style={{ minWidth: "100%" }}>
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
            disabled={isRegistering || loading}
          >
            <MenuItem value={""}>Seleccione la empresa</MenuItem>
            {/* <MenuItem value={"1"}>Fafio</MenuItem> */}
            <MenuItem value={"1"}>Kankas</MenuItem>
          </Select>
          <FormHelperText>
            Seleccione la empresa dónde labora
          </FormHelperText>
        </FormControl>

        <Button
          variant="contained"
          color="error"
          sx={button}
          endIcon={isRegistering ? <CircularProgress size={20} color="inherit" /> : <HowToRegIcon />}
          style={{ width: "100%", marginTop: "1rem" }}
          type="submit"
          disabled={isRegistering || loading || !formik.isValid}
        >
          {isRegistering ? 'Registrando...' : 'Registrarse'}
        </Button>
      </Box>
      
      <Box component={'div'} textAlign={'left'} mt={2} fontSize={12}>
          <Link 
            style={{
              color: isRegistering || loading ? '#ccc' : 'black',
              pointerEvents: isRegistering || loading ? 'none' : 'auto'
            }} 
            to="/auth/login"
          >
            Ya tienes una cuenta? Ingresa aquí
          </Link>
      </Box>
    </Grid>
    </>
  );
};

export default RegisterForm;
