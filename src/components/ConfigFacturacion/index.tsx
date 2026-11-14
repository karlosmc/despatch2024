import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Save, NetworkCheck } from "@mui/icons-material";
import { ConfigFacturacion, EmisionService } from "../../service/EmisionService";
import { useNotification } from "../../context/notification.context";

/**
 * Conexión de guiasapi con la API de facturación (solo admin), guardada en la
 * empresa como en el ERP. El token y el secreto nunca se devuelven: solo se
 * muestra si están cargados. Un campo que se deja vacío no se toca.
 */
const origenTexto: Record<string, string> = {
  empresa: "guardado",
  env: "desde .env",
  falta: "falta",
};

const ChipOrigen = ({ origen }: { origen?: string }) => (
  <Chip
    size="small"
    label={origenTexto[origen ?? "falta"] ?? origen}
    color={origen === "falta" ? "error" : origen === "env" ? "warning" : "success"}
    variant="outlined"
  />
);

const ConfigFacturacionCard = () => {
  const { getError, getSuccess } = useNotification();

  const [config, setConfig] = useState<ConfigFacturacion | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [probando, setProbando] = useState(false);
  const [prueba, setPrueba] = useState<{ exito: boolean; message: string } | null>(null);

  const [apiUrl, setApiUrl] = useState("");
  const [token, setToken] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");

  const cargar = async () => {
    try {
      setCargando(true);
      const datos = await EmisionService.verConfiguracion();
      setConfig(datos);
      setApiUrl(datos.apiUrl || "");
    } catch (error) {
      getError(typeof error === "string" ? error : "No se pudo leer la configuración");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const secretoCorto = webhookSecret.trim() !== "" && webhookSecret.trim().length < 16;

  const guardar = async () => {
    try {
      setGuardando(true);
      const datos = await EmisionService.guardarConfiguracion({
        apiUrl: apiUrl !== (config?.apiUrl || "") ? apiUrl : undefined,
        token,
        webhookSecret,
      });
      setConfig(datos);
      setToken("");
      setWebhookSecret("");
      setPrueba(null);
      getSuccess(datos.message || "Configuración guardada");
    } catch (error) {
      getError(typeof error === "string" ? error : "No se pudo guardar");
    } finally {
      setGuardando(false);
    }
  };

  const probar = async () => {
    setProbando(true);
    setPrueba(await EmisionService.probarConexion());
    setProbando(false);
  };

  if (cargando) {
    return (
      <Paper sx={{ p: 3, mt: 3, textAlign: "center" }}>
        <CircularProgress size={28} />
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, mt: 3 }}>
      <Typography variant="h6">API de facturación (envío de guías)</Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        guiasapi envía las guías a SUNAT por esta API. RUC emisor: <strong>{config?.ruc || "sin empresa"}</strong>
      </Typography>

      <Stack spacing={2}>
        <Box display="flex" alignItems="center" gap={1}>
          <TextField
            label="URL de la API (con /api/v1)"
            placeholder="http://127.0.0.1:8090/api/v1"
            size="small"
            fullWidth
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
          />
          <ChipOrigen origen={config?.origen?.apiUrl} />
        </Box>

        <Box display="flex" alignItems="center" gap={1}>
          <TextField
            label="Token de la API"
            placeholder={config?.tieneToken ? "•••••• (dejar vacío para no cambiarlo)" : "php artisan fe:client:create"}
            size="small"
            fullWidth
            type="password"
            autoComplete="new-password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <ChipOrigen origen={config?.origen?.token} />
        </Box>

        <Box display="flex" alignItems="center" gap={1}>
          <TextField
            label="Secreto del webhook"
            placeholder={config?.tieneWebhookSecret ? "•••••• (dejar vacío para no cambiarlo)" : "mínimo 16 caracteres, el mismo que en la API"}
            size="small"
            fullWidth
            type="password"
            autoComplete="new-password"
            value={webhookSecret}
            onChange={(e) => setWebhookSecret(e.target.value)}
            error={secretoCorto}
            helperText={secretoCorto ? "Mínimo 16 caracteres" : " "}
          />
          <ChipOrigen origen={config?.origen?.webhookSecret} />
        </Box>

        <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
          <strong>webhookUrl a registrar en la API:</strong> {config?.webhookUrl}
        </Typography>

        {prueba && <Alert severity={prueba.exito ? "success" : "warning"}>{prueba.message}</Alert>}

        <Box display="flex" gap={1} justifyContent="flex-end" flexWrap="wrap">
          <Button
            variant="outlined"
            startIcon={probando ? <CircularProgress size={16} /> : <NetworkCheck />}
            disabled={probando || guardando}
            onClick={probar}
          >
            Probar conexión
          </Button>
          <Button
            variant="contained"
            startIcon={guardando ? <CircularProgress size={16} /> : <Save />}
            disabled={guardando || secretoCorto}
            onClick={guardar}
          >
            Guardar
          </Button>
        </Box>
      </Stack>
    </Paper>
  );
};

export default ConfigFacturacionCard;
