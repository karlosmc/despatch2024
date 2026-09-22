import AccountCircleRoundedIcon from "@mui/icons-material/AccountCircleRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";

import {
  Alert,
  AlertColor,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Link as MuiLink,
  TextField,
  Typography,
} from "@mui/material";

import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { LoginSchema } from "../utils/validateForm";
import { LoginUser } from "../types/user.interface";
import { useAuthStore } from "../store/authStore";

const InitialValues: LoginUser = {
  documento: "",
  password: "",
  id_empresa: 1,
};

/** Destino por defecto al entrar (el dashboard está desactivado). */
const DESTINO = "/admin/guias";

interface Aviso {
  tipo: AlertColor;
  texto: string;
}

const LoginForm = () => {
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const location = useLocation();

  const [enviando, setEnviando] = useState(false);
  const [verClave, setVerClave] = useState(false);

  /*
   * El aviso inicial viene de la URL (?reason=expired) o del registro recién hecho.
   * No se oculta solo: queda hasta que el usuario vuelva a intentar.
   */
  const [aviso, setAviso] = useState<Aviso | null>(() => {
    const estado = location.state as { aviso?: Aviso } | null;
    if (estado?.aviso) return estado.aviso;
    if (new URLSearchParams(location.search).get("reason") === "expired") {
      return { tipo: "warning", texto: "Tu sesión expiró. Vuelve a iniciar sesión." };
    }
    return null;
  });

  // Limpia ?reason=expired y el state del registro para que un F5 no repita el aviso.
  useEffect(() => {
    if (location.search || location.state) {
      navigate(location.pathname, { replace: true, state: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formik = useFormik({
    initialValues: InitialValues,
    validationSchema: LoginSchema,
    onSubmit: async (values) => {
      if (enviando) return;
      setEnviando(true);
      setAviso(null);
      try {
        await login({
          documento: values.documento.trim(),
          id_empresa: values.id_empresa,
          password: values.password,
        });
        const destino = sessionStorage.getItem("redirectAfterLogin") || DESTINO;
        sessionStorage.removeItem("redirectAfterLogin");
        navigate(destino, { replace: true });
      } catch (error) {
        setAviso({
          tipo: "error",
          texto: typeof error === "string" ? error : "No se pudo iniciar sesión. Inténtalo de nuevo.",
        });
        formik.setFieldValue("password", "", false);
      } finally {
        setEnviando(false);
      }
    },
  });

  const error = (campo: keyof LoginUser) =>
    formik.touched[campo] && formik.errors[campo] ? String(formik.errors[campo]) : undefined;

  return (
    <Box component="form" onSubmit={formik.handleSubmit} noValidate display="flex" flexDirection="column" gap={2}>
      <Box>
        <Typography variant="h5" fontWeight={700}>
          Iniciar sesión
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Ingresa con tu número de documento
        </Typography>
      </Box>

      {aviso && (
        <Alert severity={aviso.tipo} onClose={() => setAviso(null)} role="alert">
          {aviso.texto}
        </Alert>
      )}

      <TextField
        label="Nro. documento"
        name="documento"
        value={formik.values.documento}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={Boolean(error("documento"))}
        helperText={error("documento")}
        fullWidth
        autoFocus
        autoComplete="username"
        inputMode="numeric"
        disabled={enviando}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <AccountCircleRoundedIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      <TextField
        label="Contraseña"
        name="password"
        type={verClave ? "text" : "password"}
        value={formik.values.password}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={Boolean(error("password"))}
        helperText={error("password")}
        fullWidth
        autoComplete="current-password"
        disabled={enviando}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LockRoundedIcon fontSize="small" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setVerClave((x) => !x)}
                edge="end"
                aria-label={verClave ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {verClave ? <VisibilityOffRoundedIcon fontSize="small" /> : <VisibilityRoundedIcon fontSize="small" />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Button
        type="submit"
        variant="contained"
        size="large"
        fullWidth
        disabled={enviando}
        endIcon={enviando ? <CircularProgress size={18} color="inherit" /> : <LoginRoundedIcon />}
        sx={{ mt: 1, py: 1.2, fontWeight: 700 }}
      >
        {enviando ? "Ingresando…" : "Ingresar"}
      </Button>

      <Typography variant="body2" color="text.secondary" textAlign="center">
        ¿No tienes cuenta?{" "}
        <MuiLink component={Link} to="/auth/registro" fontWeight={600} underline="hover">
          Regístrate
        </MuiLink>
      </Typography>
    </Box>
  );
};

export default LoginForm;
