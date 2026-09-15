import { ReactNode } from "react";
import { Box, ButtonBase, Chip, Typography, alpha, useTheme } from "@mui/material";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

import { SectionColor } from "./SectionCard";

interface PickerCardProps {
  icono: ReactNode;
  titulo: string;
  /** Línea principal del valor elegido (RUC, placa, dirección…). */
  valor?: string;
  /** Líneas secundarias del valor elegido. */
  detalle?: (string | undefined | null)[];
  textoVacio?: string;
  color?: SectionColor;
  disabled?: boolean;
  badge?: string;
  onClick: () => void;
}

/**
 * Botón grande (mínimo 72px de alto) que abre el formulario de una entidad
 * y muestra en sitio lo que ya se eligió. Pensado para el dedo, no el mouse.
 */
const PickerCard = ({
  icono,
  titulo,
  valor,
  detalle = [],
  textoVacio = "Sin registrar",
  color = "primary",
  disabled = false,
  badge,
  onClick,
}: PickerCardProps) => {
  const theme = useTheme();
  const tono = theme.palette[color].main;
  const lleno = Boolean(valor);
  const lineas = detalle.filter(Boolean) as string[];

  return (
    <ButtonBase
      onClick={onClick}
      disabled={disabled}
      sx={{
        width: "100%",
        // Sin esto el texto `noWrap` fija el min-content del botón y desborda
        // la columna del grid (se rompía en Partida/Llegada con direcciones largas).
        minWidth: 0,
        maxWidth: "100%",
        overflow: "hidden",
        minHeight: 76,
        px: 1.75,
        py: 1.5,
        gap: 1.5,
        borderRadius: 3,
        textAlign: "left",
        justifyContent: "flex-start",
        alignItems: "center",
        border: `1px solid ${lleno ? alpha(tono, 0.55) : theme.palette.divider}`,
        backgroundColor: lleno ? alpha(tono, 0.08) : alpha(theme.palette.action.hover, 0.5),
        opacity: disabled ? 0.45 : 1,
        transition: "all .18s ease",
        "&:hover": { borderColor: tono, backgroundColor: alpha(tono, 0.12) },
      }}
    >
      <Box
        sx={{
          display: "grid",
          placeItems: "center",
          width: 44,
          height: 44,
          flexShrink: 0,
          borderRadius: 2.5,
          color: lleno ? tono : "text.secondary",
          backgroundColor: alpha(lleno ? tono : theme.palette.text.primary, 0.12),
        }}
      >
        {icono}
      </Box>

      <Box flex={1} minWidth={0} sx={{ overflow: "hidden" }}>
        <Box display="flex" alignItems="center" gap={0.75} minWidth={0}>
          <Typography variant="body2" fontWeight={700} noWrap>
            {titulo}
          </Typography>
          {lleno && <CheckCircleRoundedIcon sx={{ fontSize: 15, color: "success.main" }} />}
          {badge && (
            <Chip
              size="small"
              label={badge}
              sx={{ height: 18, fontSize: 10, fontWeight: 700 }}
              color={color}
            />
          )}
        </Box>

        {lleno ? (
          <>
            {/* Hasta 2 líneas: las direcciones largas se leen completas y aun así
                no empujan el ancho de la columna. */}
            <Typography
              variant="body2"
              color="text.primary"
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                overflowWrap: "anywhere",
              }}
            >
              {valor}
            </Typography>
            {lineas.map((linea, i) => (
              <Typography key={i} variant="caption" color="text.secondary" noWrap display="block">
                {linea}
              </Typography>
            ))}
          </>
        ) : (
          <Typography variant="caption" color="text.secondary">
            {textoVacio}
          </Typography>
        )}
      </Box>

      <ChevronRightRoundedIcon sx={{ color: "text.disabled", flexShrink: 0 }} />
    </ButtonBase>
  );
};

export default PickerCard;
