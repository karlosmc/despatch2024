import { useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  LinearProgress,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";

import SectionCard from "./components/SectionCard";
import { SECCIONES } from "./components/secciones.meta";
import { useContenidoSecciones } from "./SeccionesGuia";
import { GuiaRemisionFormApi } from "./useGuiaRemisionForm";

interface Props {
  api: GuiaRemisionFormApi;
}

const ALTO_BARRA = 76;

/** Los botones comparten el ancho y truncan antes que desbordar la barra. */
const BOTON_BARRA = {
  flex: 1,
  minWidth: 0,
  height: 48,
  px: 1,
  fontWeight: 700,
  whiteSpace: "nowrap",
  "& .MuiButton-startIcon": { mr: 0.5 },
  "& .MuiButton-endIcon": { ml: 0.5 },
} as const;

const MobileForm = ({ api }: Props) => {
  const theme = useTheme();
  const { contenidos, sheetElement } = useContenidoSecciones(api);

  const [paso, setPaso] = useState(0);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  const total = SECCIONES.length;
  const esUltimo = paso === total - 1;
  const seccion = SECCIONES[paso];

  const irA = (indice: number) => {
    setPaso(indice);
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.querySelector("main")?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const numero =
    api.formik.values.datosGenerales.serie !== ""
      ? `${api.formik.values.datosGenerales.serie}-${api.formik.values.datosGenerales.correlativo}`
      : null;

  const cerrarMenu = () => setMenuAnchor(null);

  return (
    <Box sx={{ pb: `${ALTO_BARRA + 16}px` }}>
      {/* Encabezado fijo */}
      <Paper
        elevation={0}
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          borderRadius: 0,
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: alpha(theme.palette.background.default, 0.95),
          backdropFilter: "blur(10px)",
          mx: -1,
          px: 1.5,
          pt: 1.25,
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Box flex={1} minWidth={0}>
            <Typography variant="caption" color="text.secondary">
              {api.modoEdicion ? "Editando · " : ""}Paso {paso + 1} de {total}
            </Typography>
            <Typography variant="subtitle1" fontWeight={800} noWrap lineHeight={1.2}>
              {seccion.titulo}
            </Typography>
          </Box>

          {numero && (
            <Chip
              size="small"
              label={numero}
              color={api.bloqueada ? "error" : "primary"}
              variant={api.bloqueada ? "outlined" : "filled"}
              sx={{ fontWeight: 700 }}
            />
          )}

          <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)} aria-label="Más acciones">
            <MoreVertRoundedIcon />
          </IconButton>
        </Box>

        <LinearProgress
          variant="determinate"
          value={api.progreso}
          color={api.progreso === 100 ? "success" : "primary"}
          sx={{ height: 5, borderRadius: 4, my: 1 }}
        />

        {/* Navegación rápida entre pasos */}
        <Box
          sx={{
            display: "flex",
            gap: 0.75,
            overflowX: "auto",
            pb: 1,
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {SECCIONES.map((s, i) => {
            const activo = i === paso;
            const listo = api.secciones[s.id];
            return (
              <Chip
                key={s.id}
                size="small"
                clickable
                onClick={() => irA(i)}
                icon={
                  listo ? (
                    <CheckCircleRoundedIcon sx={{ fontSize: 16 }} />
                  ) : (
                    <Box
                      sx={{
                        width: 16,
                        textAlign: "center",
                        fontSize: 11,
                        fontWeight: 700,
                        ml: "6px",
                      }}
                    >
                      {i + 1}
                    </Box>
                  )
                }
                label={s.tituloCorto}
                color={activo ? "primary" : listo ? "success" : "default"}
                variant={activo ? "filled" : "outlined"}
                sx={{ fontWeight: 700, flexShrink: 0 }}
              />
            );
          })}
        </Box>
      </Paper>

      {/* Contenido: todas las secciones montadas, sólo se muestra la activa */}
      <Box px={0.5} pt={2}>
        {SECCIONES.map((s, i) => (
          <Box key={s.id} sx={{ display: i === paso ? "block" : "none" }}>
            <SectionCard
              plano
              titulo={s.titulo}
              descripcion={s.descripcion}
              icono={s.icono}
              color={s.color}
              completo={api.secciones[s.id]}
              opcional={s.opcional}
            >
              {contenidos[s.id]}
            </SectionCard>
          </Box>
        ))}
      </Box>

      {/* Barra inferior fija */}
      <Paper
        elevation={8}
        sx={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 1.5,
          py: 1.25,
          borderRadius: 0,
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor: alpha(theme.palette.background.paper, 0.97),
          backdropFilter: "blur(10px)",
        }}
      >
        <Button
          variant="outlined"
          color="inherit"
          onClick={() => irA(Math.max(0, paso - 1))}
          disabled={paso === 0}
          sx={{ minWidth: 0, px: 2, height: 48 }}
          aria-label="Paso anterior"
        >
          <ArrowBackRoundedIcon />
        </Button>

        {esUltimo ? (
          <>
            <Button
              variant="outlined"
              color="success"
              startIcon={api.guardando ? <CircularProgress size={16} /> : <SaveRoundedIcon />}
              onClick={() => api.guardar("borrador")}
              disabled={api.guardando || api.bloqueada}
              sx={BOTON_BARRA}
            >
              Guardar
            </Button>
            <Button
              variant="contained"
              color="warning"
              startIcon={<SendRoundedIcon />}
              onClick={() => api.guardar("sunat")}
              disabled={api.guardando || api.bloqueada || api.enviadaSunat}
              sx={{ ...BOTON_BARRA, color: "common.white" }}
            >
              SUNAT
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            endIcon={<ArrowForwardRoundedIcon />}
            onClick={() => irA(Math.min(total - 1, paso + 1))}
            sx={{ ...BOTON_BARRA, color: "common.white" }}
          >
            Siguiente
          </Button>
        )}
      </Paper>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={cerrarMenu}>
        <MenuItem
          onClick={() => {
            cerrarMenu();
            api.previsualizarPdf();
          }}
          disabled={api.generandoPdf}
        >
          <ListItemIcon>
            <PictureAsPdfRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Descargar vista previa</ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            cerrarMenu();
            api.guardar("borrador");
          }}
          disabled={api.guardando || api.bloqueada}
        >
          <ListItemIcon>
            <SaveRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            {api.guardada ? "Actualizar sin enviar" : "Guardar sin enviar a SUNAT"}
          </ListItemText>
        </MenuItem>
        <MenuItem
          onClick={() => {
            cerrarMenu();
            api.guardar("sunat");
          }}
          disabled={api.guardando || api.bloqueada || api.enviadaSunat}
        >
          <ListItemIcon>
            <SendRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Guardar y enviar a SUNAT</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            cerrarMenu();
            api.solicitarSalida();
          }}
        >
          <ListItemIcon>
            <LogoutRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Salir</ListItemText>
        </MenuItem>
      </Menu>

      {sheetElement}
    </Box>
  );
};

export default MobileForm;
