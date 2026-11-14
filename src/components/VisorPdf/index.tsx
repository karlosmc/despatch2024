import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  AppBar,
  Box,
  CircularProgress,
  Dialog,
  IconButton,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import IosShareRoundedIcon from "@mui/icons-material/IosShareRounded";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import ZoomInRoundedIcon from "@mui/icons-material/ZoomInRounded";
import ZoomOutRoundedIcon from "@mui/icons-material/ZoomOutRounded";

/**
 * Visor de PDF.
 *
 * - En PC: el visor del navegador dentro de un iframe.
 * - En celular/tablet: los navegadores móviles (Chrome Android sobre todo) no
 *   muestran un PDF dentro de la página, así que las páginas se dibujan con
 *   pdf.js. Se carga solo al abrir el primer PDF, para no pesar en el resto.
 *
 * Botones: compartir (WhatsApp, Drive, imprimir… si el teléfono lo permite),
 * descargar y, en PC, abrir en otra pestaña.
 */

export interface VisorPdfProps {
  abierto: boolean;
  onCerrar: () => void;
  archivo: Blob | null;
  nombre: string;
  cargando?: boolean;
  error?: string | null;
}

const ZOOMS = [1, 1.5, 2, 3];

/** pdf.js y su worker se piden recién la primera vez que se usan. */
const cargarPdfjs = async () => {
  const pdfjs = await import("pdfjs-dist");
  const { default: worker } = await import("pdfjs-dist/build/pdf.worker.min.js?url");
  pdfjs.GlobalWorkerOptions.workerSrc = worker;
  return pdfjs;
};

const nombrePdf = (nombre: string) => (/\.pdf$/i.test(nombre) ? nombre : `${nombre || "documento"}.pdf`);

const VisorPdf = ({ abierto, onCerrar, archivo, nombre, cargando = false, error = null }: VisorPdfProps) => {
  const theme = useTheme();
  const pantallaChica = useMediaQuery(theme.breakpoints.down("md"));
  const tactil = useMediaQuery("(pointer: coarse)");
  /** Dibujar con pdf.js en vez de usar el visor del navegador. */
  const usarCanvas = pantallaChica || tactil;

  const [contenedor, setContenedor] = useState<HTMLDivElement | null>(null);
  const [zoom, setZoom] = useState(0);
  const [dibujando, setDibujando] = useState(false);
  const [errorDibujo, setErrorDibujo] = useState<string | null>(null);
  const [paginas, setPaginas] = useState(0);

  const url = useMemo(() => (archivo ? URL.createObjectURL(archivo) : ""), [archivo]);
  useEffect(() => () => {
    if (url) URL.revokeObjectURL(url);
  }, [url]);

  const fichero = useMemo(
    () => (archivo ? new File([archivo], nombrePdf(nombre), { type: "application/pdf" }) : null),
    [archivo, nombre]
  );
  const puedeCompartir = Boolean(
    fichero && typeof navigator !== "undefined" && navigator.canShare?.({ files: [fichero] })
  );

  useEffect(() => {
    if (abierto) {
      setZoom(0);
      setErrorDibujo(null);
    }
  }, [abierto, archivo]);

  // Páginas dibujadas con pdf.js (solo celular/tablet)
  useEffect(() => {
    if (!abierto || !usarCanvas || !archivo || !contenedor) return;

    let cancelado = false;
    let documento: { destroy: () => Promise<void> } | null = null;

    const dibujar = async () => {
      setDibujando(true);
      setErrorDibujo(null);
      contenedor.innerHTML = "";
      try {
        const pdfjs = await cargarPdfjs();
        const pdf = await pdfjs.getDocument({
          data: new Uint8Array(await archivo.arrayBuffer()),
          // Sin eval: cierra el CVE-2024-4367 de pdf.js 3.x (código en fuentes de un PDF malicioso)
          isEvalSupported: false,
        }).promise;
        documento = pdf;
        if (cancelado) return;
        setPaginas(pdf.numPages);

        const ancho = Math.max(contenedor.clientWidth - 16, 200) * ZOOMS[zoom];
        const nitidez = Math.min(window.devicePixelRatio || 1, 2.5);

        for (let numero = 1; numero <= pdf.numPages && !cancelado; numero++) {
          const pagina = await pdf.getPage(numero);
          const base = pagina.getViewport({ scale: 1 });
          const vista = pagina.getViewport({ scale: (ancho / base.width) * nitidez });

          const canvas = document.createElement("canvas");
          canvas.width = Math.floor(vista.width);
          canvas.height = Math.floor(vista.height);
          canvas.style.width = `${Math.floor(ancho)}px`;
          canvas.style.height = `${Math.floor(vista.height / nitidez)}px`;
          canvas.style.display = "block";
          canvas.style.margin = "0 auto 12px";
          canvas.style.background = "#fff";
          canvas.style.boxShadow = "0 1px 4px rgba(0,0,0,.25)";
          contenedor.appendChild(canvas);

          const contexto = canvas.getContext("2d");
          if (contexto) await pagina.render({ canvasContext: contexto, viewport: vista }).promise;
        }
      } catch (e) {
        console.error("No se pudo dibujar el PDF", e);
        if (!cancelado) setErrorDibujo("No se pudo mostrar el PDF aquí. Usa Descargar o Compartir.");
      } finally {
        if (!cancelado) setDibujando(false);
      }
    };

    dibujar();

    return () => {
      cancelado = true;
      documento?.destroy();
    };
  }, [abierto, usarCanvas, archivo, contenedor, zoom]);

  const descargar = () => {
    if (!url) return;
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = nombrePdf(nombre);
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
  };

  const compartir = async () => {
    if (!fichero) return;
    try {
      await navigator.share({ files: [fichero], title: nombrePdf(nombre) });
    } catch (e) {
      // Cancelar el menú de compartir no es un error
      if ((e as Error)?.name !== "AbortError") descargar();
    }
  };

  const listo = Boolean(archivo) && !cargando && !error;

  return (
    <Dialog
      open={abierto}
      onClose={onCerrar}
      fullScreen={pantallaChica}
      fullWidth
      maxWidth="lg"
      PaperProps={{ sx: { height: pantallaChica ? "100%" : "90vh", display: "flex", flexDirection: "column" } }}
    >
      <AppBar position="relative" color="default" elevation={1}>
        <Toolbar variant="dense" sx={{ gap: 0.5, px: 1 }}>
          <IconButton edge="start" onClick={onCerrar} aria-label="Cerrar">
            <CloseRoundedIcon />
          </IconButton>
          <Typography variant="subtitle2" noWrap sx={{ flex: 1, minWidth: 0 }}>
            {nombrePdf(nombre)}
            {usarCanvas && paginas > 1 ? ` · ${paginas} págs.` : ""}
          </Typography>

          {usarCanvas && listo && (
            <>
              <IconButton size="small" disabled={zoom === 0} onClick={() => setZoom((z) => Math.max(0, z - 1))} aria-label="Alejar">
                <ZoomOutRoundedIcon />
              </IconButton>
              <IconButton
                size="small"
                disabled={zoom === ZOOMS.length - 1}
                onClick={() => setZoom((z) => Math.min(ZOOMS.length - 1, z + 1))}
                aria-label="Acercar"
              >
                <ZoomInRoundedIcon />
              </IconButton>
            </>
          )}
          {puedeCompartir && listo && (
            <Tooltip title="Compartir">
              <IconButton onClick={compartir} aria-label="Compartir">
                <IosShareRoundedIcon />
              </IconButton>
            </Tooltip>
          )}
          {!usarCanvas && listo && (
            <Tooltip title="Abrir en otra pestaña">
              <IconButton onClick={() => window.open(url, "_blank")} aria-label="Abrir en otra pestaña">
                <OpenInNewRoundedIcon />
              </IconButton>
            </Tooltip>
          )}
          {listo && (
            <Tooltip title="Descargar">
              <IconButton edge="end" onClick={descargar} aria-label="Descargar">
                <DownloadRoundedIcon />
              </IconButton>
            </Tooltip>
          )}
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, overflow: "auto", bgcolor: theme.palette.mode === "dark" ? "grey.900" : "grey.200", position: "relative" }}>
        {cargando && (
          <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" gap={1.5} height="100%" p={3}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">Obteniendo el PDF…</Typography>
          </Box>
        )}

        {!cargando && error && (
          <Box p={2}>
            <Alert severity="warning">{error}</Alert>
          </Box>
        )}

        {listo && !usarCanvas && (
          <Box component="iframe" src={url} title={nombrePdf(nombre)} sx={{ width: "100%", height: "100%", border: 0, display: "block" }} />
        )}

        {listo && usarCanvas && (
          <>
            {errorDibujo && (
              <Box p={2}>
                <Alert severity="warning">{errorDibujo}</Alert>
              </Box>
            )}
            {dibujando && (
              <Box display="flex" justifyContent="center" p={2}>
                <CircularProgress size={28} />
              </Box>
            )}
            <Box ref={setContenedor} sx={{ p: 1, overflowX: "auto" }} />
          </>
        )}
      </Box>
    </Dialog>
  );
};

export default VisorPdf;
