import { ReactNode } from "react";
import { Box, Chip, Paper, Typography, alpha, useTheme } from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import RadioButtonUncheckedRoundedIcon from "@mui/icons-material/RadioButtonUncheckedRounded";

export type SectionColor = "primary" | "secondary" | "info" | "success" | "warning" | "error";

interface SectionCardProps {
  id?: string;
  titulo: string;
  descripcion?: string;
  icono: ReactNode;
  color?: SectionColor;
  completo?: boolean;
  opcional?: boolean;
  /** En móvil la tarjeta va sin marco para aprovechar el ancho. */
  plano?: boolean;
  children: ReactNode;
}

const SectionCard = ({
  id,
  titulo,
  descripcion,
  icono,
  color = "primary",
  completo = false,
  opcional = false,
  plano = false,
  children,
}: SectionCardProps) => {
  const theme = useTheme();
  const tono = theme.palette[color].main;

  return (
    <Paper
      id={id}
      elevation={0}
      sx={{
        scrollMarginTop: 96,
        borderRadius: 3,
        overflow: "hidden",
        minWidth: 0,
        border: plano ? "none" : `1px solid ${alpha(theme.palette.divider, 0.9)}`,
        backgroundColor: plano ? "transparent" : "background.paper",
        backgroundImage: "none",
        transition: "border-color .2s ease",
        "&:hover": plano ? undefined : { borderColor: alpha(tono, 0.5) },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: plano ? 0 : 2,
          py: plano ? 0 : 1.75,
          mb: plano ? 2 : 0,
          borderBottom: plano ? "none" : `1px solid ${theme.palette.divider}`,
          background: plano
            ? "none"
            : `linear-gradient(90deg, ${alpha(tono, 0.12)} 0%, ${alpha(tono, 0)} 65%)`,
        }}
      >
        <Box
          sx={{
            display: "grid",
            placeItems: "center",
            width: 42,
            height: 42,
            flexShrink: 0,
            borderRadius: 2.5,
            color: tono,
            backgroundColor: alpha(tono, 0.16),
          }}
        >
          {icono}
        </Box>

        <Box flex={1} minWidth={0}>
          <Typography variant="subtitle1" fontWeight={700} lineHeight={1.2}>
            {titulo}
          </Typography>
          {descripcion && (
            <Typography variant="caption" color="text.secondary">
              {descripcion}
            </Typography>
          )}
        </Box>

        <Chip
          size="small"
          variant={completo ? "filled" : "outlined"}
          color={completo ? "success" : opcional ? "default" : "warning"}
          icon={
            completo ? (
              <CheckCircleRoundedIcon fontSize="small" />
            ) : (
              <RadioButtonUncheckedRoundedIcon fontSize="small" />
            )
          }
          label={completo ? "Listo" : opcional ? "Opcional" : "Pendiente"}
          sx={{ fontWeight: 600, display: { xs: "none", sm: "inline-flex" } }}
        />
      </Box>

      <Box sx={{ px: plano ? 0 : 2, py: plano ? 0 : 2.25, minWidth: 0 }}>{children}</Box>
    </Paper>
  );
};

export default SectionCard;
