import { ReactNode } from "react";
import { Box, ButtonBase, Collapse, Paper, Typography, alpha, useTheme } from "@mui/material";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";

import { SectionColor } from "../../GuiaRemisionNueva/components/SectionCard";

interface BloqueProps {
  titulo: string;
  icono: ReactNode;
  color?: SectionColor;
  /** Punto verde (completo) o naranja (falta algo); se omite si es undefined. */
  completo?: boolean;
  /** Se muestra en la cabecera cuando el bloque está plegado. */
  resumen?: ReactNode;
  abierto?: boolean;
  /** Si se pasa, la cabecera pliega y despliega el bloque. */
  onAlternar?: () => void;
  children: ReactNode;
}

/** Sección compacta: cabecera de una línea y contenido que puede plegarse. */
const Bloque = ({
  titulo,
  icono,
  color = "primary",
  completo,
  resumen,
  abierto = true,
  onAlternar,
  children,
}: BloqueProps) => {
  const theme = useTheme();
  const tono = theme.palette[color].main;

  const cabecera = (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%", minWidth: 0, textAlign: "left" }}>
      <Box
        sx={{
          display: "grid",
          placeItems: "center",
          width: 26,
          height: 26,
          flexShrink: 0,
          borderRadius: 1.5,
          color: tono,
          backgroundColor: alpha(tono, 0.15),
          "& svg": { fontSize: 17 },
        }}
      >
        {icono}
      </Box>
      <Typography variant="body2" fontWeight={700} noWrap sx={{ flexShrink: 0 }}>
        {titulo}
      </Typography>
      {completo !== undefined && (
        <Box
          aria-label={completo ? "Completo" : "Falta información"}
          sx={{ width: 7, height: 7, borderRadius: "50%", flexShrink: 0, bgcolor: completo ? "success.main" : "warning.main" }}
        />
      )}
      <Typography variant="caption" color="text.secondary" noWrap sx={{ flex: 1, minWidth: 0, textAlign: "right" }}>
        {!abierto ? resumen : null}
      </Typography>
      {onAlternar && (
        <ExpandMoreRoundedIcon
          fontSize="small"
          sx={{ color: "text.secondary", flexShrink: 0, transition: "transform .2s", transform: abierto ? "rotate(180deg)" : "none" }}
        />
      )}
    </Box>
  );

  return (
    <Paper
      elevation={0}
      sx={{ borderRadius: 2.5, border: `1px solid ${theme.palette.divider}`, overflow: "hidden", minWidth: 0 }}
    >
      {onAlternar ? (
        <ButtonBase onClick={onAlternar} aria-expanded={abierto} sx={{ width: "100%", px: 1.25, py: 0.9 }}>
          {cabecera}
        </ButtonBase>
      ) : (
        <Box sx={{ px: 1.25, py: 0.9 }}>{cabecera}</Box>
      )}
      <Collapse in={abierto} timeout="auto">
        <Box sx={{ px: 1.25, pb: 1.25, pt: 0.25, minWidth: 0 }}>{children}</Box>
      </Collapse>
    </Paper>
  );
};

export default Bloque;
