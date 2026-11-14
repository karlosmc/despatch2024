import React from "react";
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  LinearProgress,
  Link,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  AccessTime,
  CheckCircle,
  Description,
  Error as ErrorIcon,
  FolderZip,
  PictureAsPdf,
  Refresh,
  Send,
} from "@mui/icons-material";
import {
  EmisionService,
  ElectronicoEnvio,
  ResultadoEnvio,
  enProceso,
  esFinal,
  etiquetaFeEstado,
  FormatoPdf,
  TipoArchivo,
} from "../../service/EmisionService";
import { useNotification } from "../../context/notification.context";
import VisorPdf from "../../components/VisorPdf";
import { useVisorPdf } from "../../hooks/useVisorPdf";

/**
 * Envío de una guía guardada a SUNAT a través de guiasapi.
 *
 * Mismas props que el modal anterior (ProcesarGuiaModal) para poder cambiar uno
 * por otro. Lo único que necesita es `idDespatch`: guiasapi arma la guía desde
 * la base, la API de facturación la firma y la envía, y el resultado de SUNAT
 * llega a guiasapi por webhook. Mientras SUNAT no responde, aquí se consulta
 * cada pocos segundos.
 */

interface EnviarGuiaModalProps {
  open: boolean;
  onClose: () => void;
  /** No se usa: guiasapi lee la guía guardada. Se mantiene por compatibilidad. */
  datosGuia?: any;
  idElectronico?: number | null;
  idDespatch?: number | null;
  /** Al cerrar, si la guía quedó enviada (en SUNAT o aceptada). */
  onSuccess?: (resultado: ResultadoEnvio) => void;
  onError?: (error: any) => void;
}

type Fase = "enviando" | "esperando" | "aceptada" | "rechazada" | "fallo";

/** Cada cuánto y hasta cuándo se pregunta mientras SUNAT procesa. */
const INTERVALO_MS = 3000;
const MAX_CONSULTAS = 5;

const faseDe = (resultado: ResultadoEnvio): Fase => {
  const fe = resultado.electronico?.feEstado;
  if (esFinal(fe)) return "aceptada";
  if (enProceso(fe)) return "esperando";
  if (fe === "rejected") return "rechazada";
  return "fallo";
};

const listaDeErrores = (errors?: Record<string, string[]> | null): string[] =>
  Array.from(
    new Set(
      Object.values(errors || {})
        .flatMap((valor) => (Array.isArray(valor) ? valor : [valor]))
        .map((valor) => String(valor ?? "").trim())
        .filter(Boolean)
    )
  );

export const EnviarGuiaModal = ({
  open,
  onClose,
  idDespatch,
  onSuccess,
  onError,
}: EnviarGuiaModalProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { getError } = useNotification();

  const [fase, setFase] = React.useState<Fase>("enviando");
  const [resultado, setResultado] = React.useState<ResultadoEnvio | null>(null);
  const [consultando, setConsultando] = React.useState(false);
  const [consultas, setConsultas] = React.useState(0);
  const [descargando, setDescargando] = React.useState<string | null>(null);
  const visor = useVisorPdf({ onError: getError });

  /** Evita dos envíos si el efecto corre dos veces (StrictMode) o hay doble clic. */
  const enCurso = React.useRef(false);
  const abierto = React.useRef(open);
  abierto.current = open;
  /** El modal tarda ~200 ms en cerrarse: un doble clic en Finalizar no repite onSuccess. */
  const cerrando = React.useRef(false);

  const electronico: ElectronicoEnvio | null | undefined = resultado?.electronico;

  /**
   * El proceso sigue vivo: enviando, consultando o con consultas automáticas
   * pendientes. Mientras tanto no se puede cerrar, consultar a mano ni finalizar.
   */
  const procesando =
    fase === "enviando" ||
    consultando ||
    (fase === "esperando" && consultas < MAX_CONSULTAS);

  // F5 / cerrar pestaña mientras el proceso sigue: el navegador pide confirmación
  React.useEffect(() => {
    if (!open || !procesando) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [open, procesando]);

  const aplicar = React.useCallback((r: ResultadoEnvio) => {
    // Una consulta fallida (red, API caída) no borra lo que ya se sabía
    setResultado((anterior) => (r.electronico || !anterior ? r : { ...anterior, message: r.message }));
    if (r.electronico) setFase(faseDe(r));
    return r;
  }, []);

  const enviar = React.useCallback(async () => {
    if (enCurso.current) return;
    if (!idDespatch) {
      setFase("fallo");
      setResultado({
        exito: false,
        message: "No se conoce el número interno de la guía. Guárdala y envíala desde el Panel de Guías.",
      });
      return;
    }

    enCurso.current = true;
    setFase("enviando");
    setConsultas(0);
    try {
      let r = await EmisionService.enviar(idDespatch);

      // 409: ya fue aceptada (o es de baja). Se muestra su estado real.
      if (r.http === 409 && !r.electronico) {
        const consulta = await EmisionService.consultar(idDespatch);
        if (consulta.electronico) r = { ...consulta, message: r.message };
      }

      if (!abierto.current) return;
      setResultado(r);
      const nuevaFase = r.electronico ? faseDe(r) : "fallo";
      setFase(nuevaFase);
      if (nuevaFase === "fallo" || nuevaFase === "rechazada") {
        onError?.(r.message || "No se pudo enviar la guía");
      }
    } finally {
      enCurso.current = false;
    }
  }, [idDespatch, onError]);

  const consultar = React.useCallback(async () => {
    if (!idDespatch) return;
    setConsultando(true);
    try {
      aplicar(await EmisionService.consultar(idDespatch));
    } finally {
      setConsultando(false);
      setConsultas((n) => n + 1);
    }
  }, [idDespatch, aplicar]);

  // Al abrir: enviar
  React.useEffect(() => {
    if (open) {
      cerrando.current = false;
      setResultado(null);
      enviar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, idDespatch]);

  // Mientras SUNAT procesa: preguntar cada pocos segundos, con un tope
  React.useEffect(() => {
    if (!open || fase !== "esperando" || consultando || consultas >= MAX_CONSULTAS) return;
    const id = setTimeout(consultar, INTERVALO_MS);
    return () => clearTimeout(id);
  }, [open, fase, consultando, consultas, consultar]);

  const descargar = async (tipo: TipoArchivo, formato: FormatoPdf = "a4") => {
    if (!idDespatch) return;
    if (tipo === "pdf") {
      visor.abrir(formato === "sunat" ? "PDF SUNAT" : "Guía", (signal) => EmisionService.archivo(idDespatch, "pdf", formato, signal));
      return;
    }
    const clave = `${tipo}-${formato}`;
    setDescargando(clave);
    try {
      await EmisionService.abrirArchivo(idDespatch, tipo, formato);
    } catch (error) {
      getError(typeof error === "string" ? error : `No se pudo obtener el ${tipo.toUpperCase()}`);
    } finally {
      setDescargando(null);
    }
  };

  const cerrar = () => {
    if (procesando || cerrando.current) return;
    cerrando.current = true;
    if (resultado && (fase === "aceptada" || fase === "esperando")) {
      onSuccess?.(resultado);
    }
    onClose();
  };

  const errores = listaDeErrores(resultado?.errors);

  const titulo = {
    enviando: { icono: <CircularProgress size={22} />, texto: "Enviando guía a SUNAT…" },
    esperando: { icono: <AccessTime color="info" />, texto: "Guía enviada, esperando a SUNAT" },
    aceptada: { icono: <CheckCircle color="success" />, texto: etiquetaFeEstado(electronico?.feEstado) },
    rechazada: { icono: <ErrorIcon color="error" />, texto: "SUNAT rechazó la guía" },
    fallo: { icono: <ErrorIcon color="error" />, texto: "No se pudo enviar la guía" },
  }[fase];

  const BotonArchivo = ({
    tipo,
    formato = "a4",
    icono,
    texto,
  }: {
    tipo: TipoArchivo;
    formato?: FormatoPdf;
    icono: React.ReactNode;
    texto: string;
  }) => (
    <Button
      size="small"
      variant="outlined"
      startIcon={descargando === `${tipo}-${formato}` ? <CircularProgress size={16} /> : icono}
      disabled={descargando !== null}
      onClick={() => descargar(tipo, formato)}
    >
      {texto}
    </Button>
  );

  return (
    <Dialog
      open={open}
      onClose={(_, reason) => {
        // Ni clic fuera ni Escape cierran el diálogo: solo el botón Finalizar/Cerrar
        if (reason === "backdropClick" || reason === "escapeKeyDown") return;
        cerrar();
      }}
      disableEscapeKeyDown
      fullWidth
      maxWidth="sm"
      fullScreen={isMobile}
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {titulo.icono}
        {titulo.texto}
      </DialogTitle>

      <DialogContent dividers>
        {fase === "enviando" && (
          <Box py={2}>
            <Typography variant="body2" color="text.secondary" mb={1}>
              Se está firmando la guía y enviándola a SUNAT. No cierres esta ventana.
            </Typography>
            <LinearProgress />
          </Box>
        )}

        {fase === "esperando" && (
          <Alert severity="info" icon={false}>
            <Typography variant="body2" mb={1}>
              SUNAT recibió la guía y la está procesando. Suele tardar unos segundos, a veces unos minutos.
            </Typography>
            {consultas < MAX_CONSULTAS ? (
              <Box display="flex" alignItems="center" gap={1}>
                <CircularProgress size={14} />
                <Typography variant="caption">
                  Consultando automáticamente ({consultas}/{MAX_CONSULTAS})… No cierres ni recargues esta
                  ventana.
                </Typography>
              </Box>
            ) : (
              <Typography variant="caption">
                Aún sin respuesta. Puedes cerrar: el estado se actualizará solo en el Panel de Guías.
              </Typography>
            )}
          </Alert>
        )}

        {fase === "aceptada" && (
          <Alert severity={electronico?.feEstado === "observed" ? "warning" : "success"}>
            <AlertTitle>{electronico?.descripcion || etiquetaFeEstado(electronico?.feEstado)}</AlertTitle>
            La guía quedó registrada en SUNAT y ya no se puede editar.
          </Alert>
        )}

        {fase === "rechazada" && (
          <Alert severity="error">
            <AlertTitle>
              {electronico?.codigoSunat ? `Código ${electronico.codigoSunat}` : "Rechazada"}
            </AlertTitle>
            {electronico?.descripcion || resultado?.message}
            <Typography variant="body2" mt={1}>
              Corrige la guía (Editar) y vuelve a enviarla: se mantiene el mismo número.
            </Typography>
          </Alert>
        )}

        {fase === "fallo" && (
          <Alert severity={resultado?.http === 409 ? "warning" : "error"}>
            <AlertTitle>{resultado?.message || "Error al enviar"}</AlertTitle>
            {errores.length > 0 && (
              <Box component="ul" sx={{ m: 0, pl: 2 }}>
                {errores.map((texto) => (
                  <li key={texto}>
                    <Typography variant="body2">{texto}</Typography>
                  </li>
                ))}
              </Box>
            )}
            {resultado?.http === 422 && (
              <Typography variant="body2" mt={1}>
                La guía quedó guardada. Corrige esos datos y vuelve a enviarla.
              </Typography>
            )}
            {(resultado?.http === 502 || resultado?.http === 503) && (
              <Typography variant="body2" mt={1}>
                La guía quedó guardada. Puedes reintentar en unos minutos o avisar al administrador.
              </Typography>
            )}
          </Alert>
        )}

        {electronico && fase !== "enviando" && (
          <>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={0.5}>
              <Typography variant="body2">
                <strong>Estado:</strong> {etiquetaFeEstado(electronico.feEstado)}
                {electronico.estadoSunat ? ` (${electronico.estadoSunat})` : ""}
              </Typography>
              {electronico.ticket && (
                <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
                  <strong>Ticket:</strong> {electronico.ticket}
                </Typography>
              )}
              {electronico.feQrUrl && (
                <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
                  <strong>Consulta SUNAT:</strong>{" "}
                  <Link href={electronico.feQrUrl} target="_blank" rel="noopener noreferrer">
                    abrir enlace del QR
                  </Link>
                </Typography>
              )}
            </Stack>
          </>
        )}

        {fase === "aceptada" && (
          <Box mt={2} display="flex" flexWrap="wrap" gap={1}>
            <BotonArchivo tipo="pdf" formato="a4" icono={<PictureAsPdf />} texto="Ver PDF" />
            <BotonArchivo tipo="pdf" formato="sunat" icono={<PictureAsPdf />} texto="PDF SUNAT" />
            <BotonArchivo tipo="xml" icono={<Description />} texto="XML" />
            <BotonArchivo tipo="cdr" icono={<FolderZip />} texto="CDR" />
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        {fase === "esperando" && (
          <Button
            startIcon={consultando ? <CircularProgress size={16} /> : <Refresh />}
            disabled={procesando}
            onClick={consultar}
          >
            Consultar ahora
          </Button>
        )}
        {/* Rechazada no: reenviarla igual daría el mismo rechazo, primero hay que corregirla */}
        {fase === "fallo" && resultado?.http !== 409 && (
          <Button startIcon={<Send />} onClick={enviar} disabled={procesando}>
            Reintentar envío
          </Button>
        )}
        <Button
          variant="contained"
          onClick={cerrar}
          disabled={procesando}
          startIcon={procesando ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {fase === "aceptada" || fase === "esperando" ? "Finalizar" : "Cerrar"}
        </Button>
      </DialogActions>
      <VisorPdf {...visor.props} />
    </Dialog>
  );
};

export default EnviarGuiaModal;
