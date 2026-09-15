import { useEffect, useState } from "react";
import {
  Box,
  IconButton,
  InputBase,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";

import { AddDoc, Detail } from "../../../types/guias/guiaremision.interface";

const VacioBox = ({ icono, texto }: { icono: JSX.Element; texto: string }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0.75,
        py: 3,
        borderRadius: 3,
        border: `1px dashed ${theme.palette.divider}`,
        color: "text.disabled",
      }}
    >
      {icono}
      <Typography variant="caption">{texto}</Typography>
    </Box>
  );
};

const BotonEliminar = ({ onClick, label }: { onClick: () => void; label: string }) => (
  <IconButton size="small" color="error" onClick={onClick} aria-label={label}>
    <DeleteOutlineRoundedIcon fontSize="small" />
  </IconButton>
);

/* ------------------------------------------------------------------ */
/* Bienes / detalles                                                    */
/* ------------------------------------------------------------------ */

interface PasoCantidadProps {
  valor: number;
  unidad?: string;
  onChange: (cantidad: number) => void;
}

/** Control +/- con edición directa, como el carrito de un punto de venta. */
const PasoCantidad = ({ valor, unidad, onChange }: PasoCantidadProps) => {
  const theme = useTheme();

  /**
   * Se escribe sobre un texto propio para poder vaciar el campo mientras se
   * reescribe la cantidad; sólo se propaga cuando el número es válido.
   */
  const [texto, setTexto] = useState<string>(String(valor));

  useEffect(() => {
    setTexto(String(valor));
  }, [valor]);

  const aplicar = (siguiente: number) => {
    if (isNaN(siguiente) || siguiente <= 0) return;
    onChange(siguiente);
  };

  const alEscribir = (entrada: string) => {
    setTexto(entrada);
    const numero = Number(entrada);
    if (entrada.trim() !== "" && !isNaN(numero) && numero > 0) onChange(numero);
  };

  /** Si quedó vacío o inválido, vuelve al último valor bueno. */
  const alSalir = () => {
    const numero = Number(texto);
    if (texto.trim() === "" || isNaN(numero) || numero <= 0) setTexto(String(valor));
  };

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        backgroundColor: alpha(theme.palette.secondary.main, 0.08),
        flexShrink: 0,
        
      }}
    >
      <IconButton
        size="small"
        onClick={() => aplicar(Number(valor) - 1)}
        disabled={Number(valor) <= 1}
        aria-label="Quitar una unidad"
      >
        <RemoveRoundedIcon fontSize="small" />
      </IconButton>

      <Box textAlign="center" minWidth={46}>
        <InputBase
          value={texto}
          onChange={(e) => alEscribir(e.target.value)}
          onBlur={alSalir}
          type="number"
          inputProps={{
            min: 0,
            step: "any",
            style: { textAlign: "center", fontWeight: 700, padding: 0 },
            onWheel: (e: React.WheelEvent<HTMLInputElement>) => e.currentTarget.blur(),
          }}
          sx={{ fontSize: 14, width: 70 }}
        />
        {unidad && (
          <Typography variant="caption" sx={{ fontSize: 9, lineHeight: 1, display: "block" }}>
            {unidad}
          </Typography>
        )}
      </Box>

      <IconButton
        size="small"
        onClick={() => aplicar(Number(valor) + 1)}
        aria-label="Agregar una unidad"
      >
        <AddRoundedIcon fontSize="small" />
      </IconButton>
    </Box>
  );
};

interface ListaDetallesProps {
  detalles: Detail[];
  onDelete: (item: Detail) => void;
  onCantidad?: (item: Detail, cantidad: number) => void;
}

export const ListaDetalles = ({ detalles, onDelete, onCantidad }: ListaDetallesProps) => {
  const theme = useTheme();
  const compacto = useMediaQuery(theme.breakpoints.down("md"));

  if (!detalles || detalles.length === 0) {
    return (
      <VacioBox
        icono={<Inventory2OutlinedIcon />}
        texto="Todavía no agregaste bienes a transportar"
      />
    );
  }

  const totalUnidades = detalles.reduce((suma, det) => suma + Number(det.cantidad || 0), 0);

  const Resumen = () => (
    <Box display="flex" justifyContent="space-between" px={0.5} pt={1}>
      <Typography variant="caption" color="text.secondary">
        {detalles.length} ítem{detalles.length === 1 ? "" : "s"}
      </Typography>
      <Typography variant="caption" fontWeight={700}>
        Total: {Number(totalUnidades.toFixed(4))}
      </Typography>
    </Box>
  );

  if (compacto) {
    return (
      <>
        <Box display="flex" flexDirection="column" gap={1}>
          {detalles.map((detail, index) => (
            <Paper
              key={`${detail.codigo}-${index}`}
              elevation={0}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                p: 1.25,
                borderRadius: 2.5,
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor: alpha(theme.palette.secondary.main, 0.06),
                minWidth: 0,
              }}
            >
              <Box flex={1} minWidth={0}>
                <Typography variant="body2" fontWeight={600} noWrap>
                  {detail.descripcion}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap display="block">
                  {detail.codigo}
                  {detail.codProdSunat ? ` · SUNAT ${detail.codProdSunat}` : ""}
                </Typography>
              </Box>

              {onCantidad ? (
                <PasoCantidad
                  valor={detail.cantidad}
                  unidad={detail.unidad}
                  onChange={(cantidad) => onCantidad(detail, cantidad)}
                />
              ) : (
                <Typography variant="body2" fontWeight={700}>
                  {detail.cantidad} {detail.unidad}
                </Typography>
              )}

              <BotonEliminar onClick={() => onDelete(detail)} label="Eliminar bien" />
            </Paper>
          ))}
        </Box>
        <Resumen />
      </>
    );
  }

  return (
    <>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ borderRadius: 2.5, border: `1px solid ${theme.palette.divider}` }}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: alpha(theme.palette.secondary.main, 0.14) }}>
              <TableCell sx={{ fontWeight: 700, width:'10%' }}>Código</TableCell>
              <TableCell sx={{ fontWeight: 700, width:'5%' }}>Cód. SUNAT</TableCell>
              <TableCell sx={{ fontWeight: 700, width:'60%' }}>Descripción</TableCell>
              <TableCell sx={{ fontWeight: 700, width:'20%' }} align="center">
                Cantidad
              </TableCell>
              <TableCell align="right" />
            </TableRow>
          </TableHead>
          <TableBody>
            {detalles.map((detail, index) => (
              <TableRow key={`${detail.codigo}-${index}`} hover>
                <TableCell>{detail.codigo}</TableCell>
                <TableCell>{detail.codProdSunat}</TableCell>
                <TableCell>{detail.descripcion}</TableCell>
                <TableCell align="center">
                  {onCantidad ? (
                    <PasoCantidad
                      valor={detail.cantidad}
                      unidad={detail.unidad}
                      onChange={(cantidad) => onCantidad(detail, cantidad)}
                    />
                  ) : (
                    <>
                      {detail.cantidad} {detail.unidad}
                    </>
                  )}
                </TableCell>
                <TableCell align="right">
                  <BotonEliminar onClick={() => onDelete(detail)} label="Eliminar bien" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Resumen />
    </>
  );
};

/* ------------------------------------------------------------------ */
/* Documentos adicionales                                               */
/* ------------------------------------------------------------------ */

interface ListaAddDocsProps {
  adicionales: AddDoc[];
  onDelete: (item: AddDoc) => void;
}

export const ListaAddDocs = ({ adicionales, onDelete }: ListaAddDocsProps) => {
  const theme = useTheme();
  const compacto = useMediaQuery(theme.breakpoints.down("md"));

  if (!adicionales || adicionales.length === 0) {
    return (
      <VacioBox
        icono={<DescriptionOutlinedIcon />}
        texto="Sin documentos adicionales (opcional)"
      />
    );
  }

  if (compacto) {
    return (
      <Box display="flex" flexDirection="column" gap={1}>
        {adicionales.map((adic, index) => (
          <Paper
            key={`${adic.emisor}-${adic.nro}-${index}`}
            elevation={0}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              p: 1.25,
              borderRadius: 2.5,
              border: `1px solid ${theme.palette.divider}`,
              backgroundColor: alpha(theme.palette.primary.main, 0.06),
              minWidth: 0,
            }}
          >
            <Box flex={1} minWidth={0}>
              <Typography variant="body2" fontWeight={600} noWrap>
                {adic.nro}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap display="block">
                {adic.tipoDesc} · RUC {adic.emisor}
              </Typography>
            </Box>
            <BotonEliminar onClick={() => onDelete(adic)} label="Eliminar documento" />
          </Paper>
        ))}
      </Box>
    );
  }

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{ borderRadius: 2.5, border: `1px solid ${theme.palette.divider}` }}
    >
      <Table size="small">
        <TableHead>
          <TableRow sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.14) }}>
            <TableCell sx={{ fontWeight: 700 }}>Emisor</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Número</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Tipo</TableCell>
            <TableCell align="right" />
          </TableRow>
        </TableHead>
        <TableBody>
          {adicionales.map((adic, index) => (
            <TableRow key={`${adic.emisor}-${adic.nro}-${index}`} hover>
              <TableCell>{adic.emisor}</TableCell>
              <TableCell>{adic.nro}</TableCell>
              <TableCell>{adic.tipoDesc}</TableCell>
              <TableCell align="right">
                <BotonEliminar onClick={() => onDelete(adic)} label="Eliminar documento" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
