import { KeyboardEvent, useState } from "react";
import { Box, Collapse, IconButton, Link, MenuItem, TextField, Tooltip, Typography } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import { PRODUCTOS_SCOP } from "../productosScop";
import { TipoDocRapido } from "../useGuiaRapida";

type Modo = TipoDocRapido | "producto";

interface AgregarManualProps {
  /** Sin consulta de SCOP es la única forma de cargar la guía: se muestra más visible. */
  principal?: boolean;
  /** Los documentos necesitan proveedor (es su emisor). */
  hayProveedor: boolean;
  onAgregarDoc: (tipo: TipoDocRapido, nro: string) => string | null;
  onAgregarProducto: (codigo: string, cantidad: number) => string | null;
}

const OPCIONES: { modo: Modo; texto: string; necesitaProveedor: boolean }[] = [
  { modo: "01", texto: "factura", necesitaProveedor: true },
  { modo: "81", texto: "SCOP", necesitaProveedor: true },
  { modo: "producto", texto: "producto", necesitaProveedor: false },
];

/**
 * Para cuando el SCOP no trae algo: una línea discreta con enlaces que abren
 * un mini formulario. Queda abierto para agregar varios seguidos.
 */
const AgregarManual = ({ principal = false, hayProveedor, onAgregarDoc, onAgregarProducto }: AgregarManualProps) => {
  const [modo, setModo] = useState<Modo | null>(null);
  const [nro, setNro] = useState("");
  const [codigo, setCodigo] = useState(PRODUCTOS_SCOP[0]?.codigo || "");
  const [cantidad, setCantidad] = useState("");
  const [error, setError] = useState<string | null>(null);

  const abrir = (siguiente: Modo) => {
    setModo((actual) => (actual === siguiente ? null : siguiente));
    setNro("");
    setCantidad("");
    setError(null);
  };

  const agregar = () => {
    if (!modo) return;
    const problema =
      modo === "producto" ? onAgregarProducto(codigo, Number(cantidad)) : onAgregarDoc(modo, nro);
    if (problema) {
      setError(problema);
      return;
    }
    setNro("");
    setCantidad("");
    setError(null);
  };

  const alTeclear = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      agregar();
    }
  };

  return (
    <Box mt={0.75}>
      <Typography
        variant={principal ? "body2" : "caption"}
        color={principal ? "text.secondary" : "text.disabled"}
        fontWeight={principal ? 600 : undefined}
        component="div"
      >
        {principal ? "Agregar:" : "¿Falta algo? agregar"}{" "}
        {OPCIONES.map((opcion, i) => {
          const deshabilitado = opcion.necesitaProveedor && !hayProveedor;
          return (
            <Box component="span" key={opcion.modo}>
              {i > 0 && " · "}
              {deshabilitado ? (
                <Tooltip title="Elige primero el proveedor">
                  <Box component="span" sx={{ textDecoration: "underline dotted" }}>
                    {opcion.texto}
                  </Box>
                </Tooltip>
              ) : (
                <Link
                  component="button"
                  type="button"
                  underline="hover"
                  color={modo === opcion.modo ? "primary" : "text.secondary"}
                  onClick={() => abrir(opcion.modo)}
                  sx={{ fontSize: "inherit", verticalAlign: "baseline" }}
                >
                  {opcion.texto}
                </Link>
              )}
            </Box>
          );
        })}
      </Typography>

      <Collapse in={Boolean(modo)} unmountOnExit>
        <Box display="flex" alignItems="flex-start" gap={0.75} mt={0.75}>
          {modo === "producto" ? (
            <>
              <TextField
                select
                label="Producto"
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                sx={{ flex: 1, minWidth: 0 }}
              >
                {PRODUCTOS_SCOP.map((p) => (
                  <MenuItem key={p.codigo} value={p.codigo}>
                    {p.descripcion} · {p.unidad === "KGM" ? "kg" : "gal"}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                type="number"
                label="Cantidad"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                onKeyDown={alTeclear}
                inputProps={{ min: 0, step: "any", onWheel: (e: React.WheelEvent<HTMLInputElement>) => e.currentTarget.blur() }}
                sx={{ width: 110, flexShrink: 0 }}
              />
            </>
          ) : (
            <TextField
              autoFocus
              label={modo === "01" ? "N° de factura" : "Código SCOP"}
              placeholder={modo === "01" ? "F001-123456" : "12760092030"}
              value={nro}
              onChange={(e) => setNro(e.target.value.toUpperCase())}
              onKeyDown={alTeclear}
              sx={{ flex: 1, minWidth: 0 }}
            />
          )}
          <IconButton onClick={agregar} color="primary" aria-label="Agregar" sx={{ mt: 0.25 }}>
            <AddRoundedIcon fontSize="small" />
          </IconButton>
          <IconButton onClick={() => setModo(null)} aria-label="Cerrar" sx={{ mt: 0.25 }}>
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Box>
        {error && (
          <Typography variant="caption" color="error.main" display="block" mt={0.25}>
            {error}
          </Typography>
        )}
      </Collapse>
    </Box>
  );
};

export default AgregarManual;
