import { KeyboardEvent, useState } from "react";
import { Box, IconButton, TextField, Tooltip, Typography, useTheme } from "@mui/material";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";

import { DocRapido } from "../useGuiaRapida";

const ETIQUETA = { "81": "SCOP", "01": "Factura" } as const;

interface DocsRapidosProps {
  docs: DocRapido[];
  /** Devuelve un mensaje si el número no es válido. */
  onCorregir: (clave: string, nro: string) => string | null;
  onQuitar: (clave: string) => void;
  emisor?: string;
}

/**
 * Documentos adicionales en filas de una línea. Corregir o quitar se hace con
 * íconos tenues, para no distraer cuando todo está bien.
 */
const DocsRapidos = ({ docs, onCorregir, onQuitar, emisor }: DocsRapidosProps) => {
  const theme = useTheme();
  const [editando, setEditando] = useState<string | null>(null);
  const [texto, setTexto] = useState("");
  const [error, setError] = useState<string | null>(null);

  const empezar = (doc: DocRapido) => {
    setEditando(doc.clave);
    setTexto(doc.nro);
    setError(null);
  };

  const confirmar = () => {
    if (!editando) return;
    const problema = onCorregir(editando, texto);
    if (problema) {
      setError(problema);
      return;
    }
    setEditando(null);
  };

  const alTeclear = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      confirmar();
    } else if (event.key === "Escape") {
      setEditando(null);
    }
  };

  const iconoTenue = {
    opacity: 0.45,
    "&:hover, &:focus-visible": { opacity: 1 },
  };

  if (docs.length === 0) {
    return (
      <Typography variant="caption" color="text.secondary" display="block" py={0.5}>
        Sin documentos.
      </Typography>
    );
  }

  return (
    <Box display="flex" flexDirection="column">
      {emisor && (
        <Typography variant="caption" color="text.secondary" display="block" mb={0.25}>
          Emisor: RUC {emisor}
        </Typography>
      )}
      {docs.map((doc) => (
        <Box
          key={doc.clave}
          sx={{
            display: "grid",
            gridTemplateColumns: "52px minmax(0,1fr) auto",
            alignItems: "center",
            columnGap: 0.75,
            minHeight: 30,
            borderBottom: `1px solid ${theme.palette.divider}`,
            "&:last-of-type": { borderBottom: "none" },
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {ETIQUETA[doc.tipo]}
          </Typography>

          {editando === doc.clave ? (
            <TextField
              autoFocus
              value={texto}
              onChange={(e) => setTexto(e.target.value.toUpperCase())}
              onKeyDown={alTeclear}
              error={Boolean(error)}
              helperText={error || undefined}
              placeholder={doc.tipo === "01" ? "F001-123456" : "Código SCOP"}
              inputProps={{ "aria-label": `Corregir ${ETIQUETA[doc.tipo]}` }}
              sx={{ my: 0.25 }}
            />
          ) : (
            <Typography variant="body2" fontWeight={600} noWrap>
              {doc.nro}
            </Typography>
          )}

          <Box display="flex">
            {editando === doc.clave ? (
              <>
                <IconButton onClick={confirmar} aria-label="Guardar corrección">
                  <CheckRoundedIcon sx={{ fontSize: 17 }} />
                </IconButton>
                <IconButton onClick={() => setEditando(null)} aria-label="Cancelar corrección">
                  <CloseRoundedIcon sx={{ fontSize: 17 }} />
                </IconButton>
              </>
            ) : (
              <>
                <Tooltip title="Corregir número">
                  <IconButton onClick={() => empezar(doc)} aria-label={`Corregir ${doc.nro}`} sx={iconoTenue}>
                    <EditRoundedIcon sx={{ fontSize: 15 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Quitar">
                  <IconButton onClick={() => onQuitar(doc.clave)} aria-label={`Quitar ${doc.nro}`} sx={iconoTenue}>
                    <CloseRoundedIcon sx={{ fontSize: 15 }} />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default DocsRapidos;
