import {
  Box,
  ButtonBase,
  Divider,
  LinearProgress,
  Paper,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";

import { GuiaRemision } from "../../../types/guias/guiaremision.interface";
import { SeccionId } from "../constants";
import { EstadoSecciones } from "../useGuiaRemisionForm";
import { SECCIONES } from "./secciones.meta";

interface ResumenGuiaProps {
  values: GuiaRemision;
  secciones: EstadoSecciones;
  progreso: number;
  seccionActiva?: SeccionId;
  onIrASeccion: (id: SeccionId) => void;
}

const Dato = ({ etiqueta, valor }: { etiqueta: string; valor: string }) => (
  <Box display="flex" justifyContent="space-between" gap={1} py={0.35}>
    <Typography variant="caption" color="text.secondary" noWrap>
      {etiqueta}
    </Typography>
    <Typography variant="caption" fontWeight={600} noWrap sx={{ maxWidth: "60%" }} textAlign="right">
      {valor}
    </Typography>
  </Box>
);

const ResumenGuia = ({
  values,
  secciones,
  progreso,
  seccionActiva,
  onIrASeccion,
}: ResumenGuiaProps) => {
  const theme = useTheme();

  const numero =
    values.datosGenerales.serie !== ""
      ? `${values.datosGenerales.serie}-${values.datosGenerales.correlativo}`
      : "Sin serie";

  const pesoTotal = `${values.envio.pesoTotal || 0} ${values.envio.undPesoTotal || ""}`.trim();
  const choferPrincipal = values.choferes.find((c) => c.tipo === "Principal") || values.choferes[0];

  return (
    <Paper
      elevation={0}
      sx={{
        position: "sticky",
        top: 16,
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        backgroundImage: "none",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 2,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.22)}, ${alpha(
            theme.palette.primary.main,
            0
          )})`,
        }}
      >
        <Typography variant="overline" color="text.secondary" letterSpacing={1}>
          Guía de remisión
        </Typography>
        <Typography variant="h6" fontWeight={800} lineHeight={1.2}>
          {numero}
        </Typography>

        <Box display="flex" alignItems="center" gap={1} mt={1.5}>
          <LinearProgress
            variant="determinate"
            value={progreso}
            sx={{ flex: 1, height: 7, borderRadius: 4 }}
            color={progreso === 100 ? "success" : "primary"}
          />
          <Typography variant="caption" fontWeight={700}>
            {progreso}%
          </Typography>
        </Box>
      </Box>

      <Divider />

      <Box py={0.5}>
        {SECCIONES.map((seccion) => {
          const completo = secciones[seccion.id];
          const activa = seccionActiva === seccion.id;
          return (
            <ButtonBase
              key={seccion.id}
              onClick={() => onIrASeccion(seccion.id)}
              sx={{
                width: "100%",
                justifyContent: "flex-start",
                gap: 1.25,
                px: 2,
                py: 1,
                textAlign: "left",
                borderLeft: `3px solid ${activa ? theme.palette.primary.main : "transparent"}`,
                backgroundColor: activa ? alpha(theme.palette.primary.main, 0.08) : "transparent",
                "&:hover": { backgroundColor: alpha(theme.palette.primary.main, 0.06) },
              }}
            >
              {completo ? (
                <CheckCircleRoundedIcon sx={{ fontSize: 18, color: "success.main" }} />
              ) : (
                <RadioButtonUncheckedRoundedIcon sx={{ fontSize: 18, color: "text.disabled" }} />
              )}
              <Box flex={1} minWidth={0}>
                <Typography variant="body2" fontWeight={activa ? 700 : 500} noWrap>
                  {seccion.titulo}
                </Typography>
              </Box>
              {seccion.opcional && (
                <Typography variant="caption" color="text.disabled">
                  opc.
                </Typography>
              )}
            </ButtonBase>
          );
        })}
      </Box>

      <Divider />

      <Box px={2} py={1.5}>
        <Typography variant="overline" color="text.secondary" letterSpacing={1}>
          Resumen
        </Typography>
        <Dato etiqueta="Destinatario" valor={values.destinatario?.rznSocial || "—"} />
        <Dato etiqueta="Partida" valor={values.partida?.direccion || "—"} />
        <Dato etiqueta="Llegada" valor={values.llegada?.direccion || "—"} />
        <Dato etiqueta="Bienes" valor={`${values.details?.length || 0} ítem(s)`} />
        <Dato etiqueta="Peso total" valor={pesoTotal} />
        <Dato etiqueta="Bultos" valor={String(values.envio.numBultos ?? 0)} />
        <Dato etiqueta="Placa" valor={values.vehiculo?.placa || "—"} />
        <Dato
          etiqueta="Chofer"
          valor={choferPrincipal ? `${choferPrincipal.nombres} ${choferPrincipal.apellidos}` : "—"}
        />
        <Dato etiqueta="Transportista" valor={values.transportista?.rznSocial || "—"} />
      </Box>
    </Paper>
  );
};

export default ResumenGuia;
