import {
  CircularProgress,
  InputAdornment,
  MenuItem,
  SxProps,
  TextField,
  Theme,
  Typography,
} from "@mui/material";

export interface Opcion {
  value: string | number;
  label: string;
  detalle?: string;
}

interface CampoSelectProps {
  label: string;
  value: string | number | null | undefined;
  opciones: Opcion[];
  onChange: (valor: string | number) => void;
  disabled?: boolean;
  helperText?: string;
  error?: boolean;
  /** Texto de la opción vacía; si se omite, no hay opción vacía. */
  vacio?: string;
  /** Para listas que se piden recién al abrir el selector. */
  onOpen?: () => void;
  /** Muestra un indicador en el campo y "Cargando…" en lugar del texto vacío. */
  cargando?: boolean;
  sx?: SxProps<Theme>;
}

/**
 * Lista desplegable compacta: la guía rápida sólo deja elegir entre lo que ya
 * existe, sin buscar ni crear.
 */
const CampoSelect = ({
  label,
  value,
  opciones,
  onChange,
  disabled,
  helperText,
  error,
  vacio,
  onOpen,
  cargando,
  sx,
}: CampoSelectProps) => {
  const valorVisible = opciones.some((o) => String(o.value) === String(value)) ? value : "";

  return (
    <TextField
      select
      fullWidth
      size="small"
      label={label}
      value={valorVisible}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      helperText={helperText}
      error={error}
      sx={sx}
      SelectProps={{
        onOpen,
        renderValue: (seleccionado) =>
          opciones.find((o) => String(o.value) === String(seleccionado))?.label ??
          (cargando ? "Cargando…" : vacio) ??
          "",
        // El indicador va antes de la flecha del desplegable.
        endAdornment: cargando ? (
          <InputAdornment position="end" sx={{ mr: 2.5 }}>
            <CircularProgress size={14} />
          </InputAdornment>
        ) : undefined,
        displayEmpty: vacio !== undefined,
        MenuProps: { PaperProps: { sx: { maxHeight: 320 } } },
      }}
      InputLabelProps={vacio !== undefined ? { shrink: true } : undefined}
    >
      {vacio !== undefined && (
        <MenuItem value="">
          <Typography variant="body2" color="text.secondary">{vacio}</Typography>
        </MenuItem>
      )}
      {opciones.map((opcion) => (
        <MenuItem key={opcion.value} value={opcion.value} sx={{ display: "block" }}>
          <Typography variant="body2">{opcion.label}</Typography>
          {opcion.detalle && (
            <Typography variant="caption" color="text.secondary" display="block">
              {opcion.detalle}
            </Typography>
          )}
        </MenuItem>
      ))}
      {cargando && (
        <MenuItem disabled value="__cargando__">
          <Typography variant="caption" color="text.secondary">Cargando lista…</Typography>
        </MenuItem>
      )}
    </TextField>
  );
};

/** Asegura que el valor actual aparezca aunque no venga en la lista cargada. */
export const conActual = (opciones: Opcion[], actual: Opcion | null): Opcion[] =>
  actual && !opciones.some((o) => String(o.value) === String(actual.value))
    ? [actual, ...opciones]
    : opciones;

export default CampoSelect;
