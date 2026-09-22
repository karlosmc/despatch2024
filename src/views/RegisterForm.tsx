import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import EmailRoundedIcon from "@mui/icons-material/EmailRounded";
import HowToRegRoundedIcon from "@mui/icons-material/HowToRegRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Link as MuiLink,
  TextField,
  TextFieldProps,
  Typography,
} from "@mui/material";

import { useFormik } from "formik";
import * as yup from "yup";
import { ReactNode, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { User } from "../types/user.interface";
import { useAuthStore } from "../store/authStore";

type Registro = User & { confirmar: string };

const InitialValues: Registro = {
  documento: "",
  password: "",
  confirmar: "",
  id_empresa: 1,
  email: "",
  name: "",
};

const RegistroSchema = yup.object().shape({
  documento: yup
    .string()
    .trim()
    .required("Escribe tu número de documento")
    .matches(/^[0-9A-Za-z]{8,12}$/, "El documento debe tener entre 8 y 12 caracteres, sin espacios"),
  name: yup.string().trim().required("Escribe tu nombre"),
  email: yup.string().trim().required("Escribe tu correo").email("El correo no es válido"),
  password: yup.string().required("Escribe una contraseña").min(6, "Usa al menos 6 caracteres"),
  confirmar: yup
    .string()
    .required("Repite la contraseña")
    .oneOf([yup.ref("password")], "Las contraseñas no coinciden"),
  id_empresa: yup.number().required("Debe elegir una empresa"),
});

const RegisterForm = () => {
  const register = useAuthStore((state) => state.register);
  const navigate = useNavigate();

  const [enviando, setEnviando] = useState(false);
  const [verClave, setVerClave] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formik = useFormik<Registro>({
    initialValues: InitialValues,
    validationSchema: RegistroSchema,
    onSubmit: async (values) => {
      if (enviando) return;
      setEnviando(true);
      setError(null);
      try {
        await register({
          documento: values.documento.trim(),
          email: values.email.trim(),
          id_empresa: values.id_empresa,
          password: values.password,
          name: values.name.trim(),
        });
        // El aviso se muestra en el login, que es donde el usuario sigue.
        navigate("/auth/login", {
          replace: true,
          state: {
            aviso: {
              tipo: "success",
              texto: "Cuenta creada. Podrás ingresar cuando el administrador la apruebe.",
            },
          },
        });
      } catch (motivo) {
        setError(typeof motivo === "string" ? motivo : "No se pudo completar el registro. Inténtalo de nuevo.");
      } finally {
        setEnviando(false);
      }
    },
  });

  const campo = (nombre: keyof Registro, icono: ReactNode): TextFieldProps => ({
    name: nombre,
    value: formik.values[nombre],
    onChange: formik.handleChange,
    onBlur: formik.handleBlur,
    error: Boolean(formik.touched[nombre] && formik.errors[nombre]),
    helperText: formik.touched[nombre] && formik.errors[nombre] ? String(formik.errors[nombre]) : undefined,
    fullWidth: true,
    size: "small",
    disabled: enviando,
    InputProps: {
      startAdornment: <InputAdornment position="start">{icono}</InputAdornment>,
    },
  });

  const botonVerClave = (
    <InputAdornment position="end">
      <IconButton
        onClick={() => setVerClave((x) => !x)}
        edge="end"
        aria-label={verClave ? "Ocultar contraseña" : "Mostrar contraseña"}
      >
        {verClave ? <VisibilityOffRoundedIcon fontSize="small" /> : <VisibilityRoundedIcon fontSize="small" />}
      </IconButton>
    </InputAdornment>
  );

  const conClave = (props: TextFieldProps): TextFieldProps => ({
    ...props,
    type: verClave ? "text" : "password",
    autoComplete: "new-password",
    InputProps: { ...props.InputProps, endAdornment: botonVerClave },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit} noValidate display="flex" flexDirection="column" gap={1.75}>
      <Box>
        <Typography variant="h5" fontWeight={700}>
          Crear cuenta
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Un administrador aprobará tu acceso
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} role="alert">
          {error}
        </Alert>
      )}

      <TextField
        {...campo("documento", <AccountCircleRoundedIcon fontSize="small" />)}
        label="Nro. documento"
        autoFocus
        autoComplete="username"
        inputMode="numeric"
      />
      <TextField {...campo("name", <PersonRoundedIcon fontSize="small" />)} label="Nombre completo" autoComplete="name" />
      <TextField
        {...campo("email", <EmailRoundedIcon fontSize="small" />)}
        label="Correo"
        type="email"
        autoComplete="email"
      />
      <TextField {...conClave(campo("password", <LockRoundedIcon fontSize="small" />))} label="Contraseña" />
      <TextField {...conClave(campo("confirmar", <LockRoundedIcon fontSize="small" />))} label="Repite la contraseña" />

      <Button
        type="submit"
        variant="contained"
        size="large"
        fullWidth
        disabled={enviando}
        endIcon={enviando ? <CircularProgress size={18} color="inherit" /> : <HowToRegRoundedIcon />}
        sx={{ mt: 1, py: 1.2, fontWeight: 700 }}
      >
        {enviando ? "Registrando…" : "Crear cuenta"}
      </Button>

      <Typography variant="body2" color="text.secondary" textAlign="center">
        ¿Ya tienes cuenta?{" "}
        <MuiLink component={Link} to="/auth/login" fontWeight={600} underline="hover">
          Inicia sesión
        </MuiLink>
      </Typography>
    </Box>
  );
};

export default RegisterForm;
