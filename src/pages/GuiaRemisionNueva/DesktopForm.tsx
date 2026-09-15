import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";

import SectionCard from "./components/SectionCard";
import ResumenGuia from "./components/ResumenGuia";
import { SECCIONES } from "./components/secciones.meta";
import { SeccionId } from "./constants";
import { useContenidoSecciones } from "./SeccionesGuia";
import { GuiaRemisionFormApi } from "./useGuiaRemisionForm";

interface Props {
  api: GuiaRemisionFormApi;
}

const DesktopForm = ({ api }: Props) => {
  const theme = useTheme();
  const { contenidos, sheetElement } = useContenidoSecciones(api);
  const [seccionActiva, setSeccionActiva] = useState<SeccionId>("generales");
  const contenedorRef = useRef<HTMLDivElement | null>(null);

  /* Marca en el índice lateral la sección visible. */
  useEffect(() => {
    const nodos = SECCIONES.map((s) => document.getElementById(`seccion-${s.id}`)).filter(
      Boolean
    ) as HTMLElement[];

    if (nodos.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) {
          setSeccionActiva(visible.target.id.replace("seccion-", "") as SeccionId);
        }
      },
      { rootMargin: "-96px 0px -55% 0px", threshold: 0.01 }
    );

    nodos.forEach((nodo) => observer.observe(nodo));
    return () => observer.disconnect();
  }, []);

  const irASeccion = (id: SeccionId) => {
    setSeccionActiva(id);
    document.getElementById(`seccion-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const numero =
    api.formik.values.datosGenerales.serie !== ""
      ? `${api.formik.values.datosGenerales.serie}-${api.formik.values.datosGenerales.correlativo}`
      : null;

  return (
    <Box ref={contenedorRef} sx={{ maxWidth: 1400, mx: "auto", px: { md: 2 }, pb: 4 }}>
      {/* Encabezado */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 3,
          mt: 1,
          px: 2,
          py: 2.5,
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          background: `linear-gradient(120deg, ${alpha(
            theme.palette.primary.main,
            0.18
          )}, ${alpha(theme.palette.secondary.main, 0.06)})`,
        }}
      >
        <Box flex={1} minWidth={0}>
          <Typography variant="overline" color="text.secondary" letterSpacing={1.5}>
            {api.modoEdicion ? "Edición de guía" : "Emisión electrónica"}
          </Typography>
          <Typography variant="h5" fontWeight={800} lineHeight={1.15}>
            Guía de remisión remitente
          </Typography>
        </Box>
        {numero && <Chip label={numero} color="primary" sx={{ fontWeight: 700 }} />}
        {api.bloqueada ? (
          <Chip label="Sólo lectura" color="error" variant="outlined" />
        ) : (
          api.guardada && <Chip label="Guardada" color="success" variant="outlined" />
        )}
        <Button
          variant="text"
          color="inherit"
          startIcon={<LogoutRoundedIcon />}
          onClick={api.solicitarSalida}
        >
          Salir
        </Button>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { md: "minmax(0,1fr) 320px" },
          alignItems: "start",
          gap: 3,
        }}
      >
        {/* Secciones */}
        <Box display="flex" flexDirection="column" gap={2} minWidth={0}>
          {SECCIONES.map((seccion) => (
            <SectionCard
              key={seccion.id}
              id={`seccion-${seccion.id}`}
              titulo={seccion.titulo}
              descripcion={seccion.descripcion}
              icono={seccion.icono}
              color={seccion.color}
              completo={api.secciones[seccion.id]}
              opcional={seccion.opcional}
            >
              {contenidos[seccion.id]}
            </SectionCard>
          ))}

          {/* Barra de acciones */}
          <Paper
            elevation={0}
            sx={{
              position: "sticky",
              bottom: 8,
              display: "flex",
              flexWrap: "wrap",
              gap: 1.5,
              p: 1.5,
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: alpha(theme.palette.background.paper, 0.94),
              backdropFilter: "blur(10px)",
            }}
          >
            <Button
              variant="outlined"
              startIcon={
                api.generandoPdf ? <CircularProgress size={16} /> : <PictureAsPdfRoundedIcon />
              }
              onClick={api.previsualizarPdf}
              disabled={api.generandoPdf}
            >
              Vista previa
            </Button>

            <Box flex={1} />

            <Button
              variant="outlined"
              color="success"
              startIcon={api.guardando ? <CircularProgress size={16} /> : <SaveRoundedIcon />}
              onClick={() => api.guardar("borrador")}
              disabled={api.guardando || api.bloqueada}
            >
              {api.guardada ? "Actualizar sin enviar" : "Guardar sin enviar"}
            </Button>

            <Button
              variant="contained"
              color="warning"
              startIcon={<SendRoundedIcon />}
              onClick={() => api.guardar("sunat")}
              disabled={api.guardando || api.bloqueada || api.enviadaSunat}
              sx={{ color: "common.white", fontWeight: 700 }}
            >
              {api.guardada ? "Actualizar y enviar a SUNAT" : "Guardar y enviar a SUNAT"}
            </Button>
          </Paper>
        </Box>

        {/* Resumen lateral */}
        <Box sx={{ display: { xs: "none", md: "block" } }}>
          <ResumenGuia
            values={api.formik.values}
            secciones={api.secciones}
            progreso={api.progreso}
            seccionActiva={seccionActiva}
            onIrASeccion={irASeccion}
          />
        </Box>
      </Box>

      {sheetElement}
    </Box>
  );
};

export default DesktopForm;
