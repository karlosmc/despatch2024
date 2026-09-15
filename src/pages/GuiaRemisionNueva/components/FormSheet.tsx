import { ReactNode } from "react";
import {
  Box,
  Dialog,
  DialogContent,
  IconButton,
  Slide,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface FormSheetProps {
  open: boolean;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Contenedor de formularios: hoja a pantalla completa en móvil y diálogo
 * centrado en escritorio. Reemplaza al DialogComponentCustom sólo en la
 * pantalla nueva, sin tocar el resto de la aplicación.
 */
const FormSheet = ({ open, title, subtitle, icon, onClose, children }: FormSheetProps) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="sm"
      scroll="paper"
      TransitionComponent={fullScreen ? Slide : undefined}
      TransitionProps={fullScreen ? ({ direction: "up" } as any) : undefined}
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? 0 : 3,
          backgroundImage: "none",
        },
      }}
    >
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 2,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: 2,
          py: 1.5,
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: alpha(theme.palette.background.paper, 0.96),
          backdropFilter: "blur(8px)",
        }}
      >
        {icon && (
          <Box
            sx={{
              display: "grid",
              placeItems: "center",
              width: 38,
              height: 38,
              borderRadius: 2,
              color: theme.palette.primary.main,
              backgroundColor: alpha(theme.palette.primary.main, 0.14),
            }}
          >
            {icon}
          </Box>
        )}
        <Box flex={1} minWidth={0}>
          <Typography variant="subtitle1" fontWeight={700} noWrap>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary" noWrap display="block">
              {subtitle}
            </Typography>
          )}
        </Box>
        <IconButton onClick={onClose} aria-label="Cerrar" size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ pt: 2, pb: 3 }}>{children}</DialogContent>
    </Dialog>
  );
};

export default FormSheet;
