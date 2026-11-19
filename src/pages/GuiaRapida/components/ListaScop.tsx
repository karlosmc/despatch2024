import {
  Box,
  Checkbox,
  Skeleton,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";

import { PedidoScop } from "../../../types/scop.interface";
import { abreviarUnidad, productoScopDe, unidadCompatible } from "../productosScop";
import { claveScop } from "../useGuiaRapida";

export const formatoVolumen = (n: number) =>
  new Intl.NumberFormat("es-PE", { maximumFractionDigits: 2 }).format(n);

/** "15/09/2026 10:25:48" -> "15/09 10:25" */
const fechaCorta = (fecha: string) =>
  fecha.replace(/^(\d{2}\/\d{2})\/\d{4}\s+(\d{2}:\d{2}).*$/, "$1 $2");

interface ListaScopProps {
  pedidos: PedidoScop[];
  estaSeleccionado: (p: PedidoScop) => boolean;
  onAlternar: (p: PedidoScop) => void;
  habilitado: boolean;
  cargando: boolean;
  /** Número de SCOP -> guía donde ya está usado ("" si no se sabe cuál). */
  ocupados?: Record<string, string>;
  /** Motivo del traslado: decide si el GLP va en kilos (compra) o en galones. */
  motivo?: string;
  /** Texto cuando no hay pedidos (cambia según de dónde salen los SCOP). */
  textoVacio?: string;
}

/** Pedidos numerados en filas de dos líneas; se marcan tocando la fila. */
const ListaScop = ({
  pedidos,
  estaSeleccionado,
  onAlternar,
  habilitado,
  cargando,
  ocupados = {},
  textoVacio = "Sin pedidos disponibles (ni cerrados ni anulados) para esta placa y rango.",
  motivo,
}: ListaScopProps) => {
  const theme = useTheme();

  if (cargando) {
    return (
      <Box>
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} height={44} />
        ))}
      </Box>
    );
  }

  if (pedidos.length === 0) {
    return (
      <Typography
        variant="caption"
        color="text.secondary"
        display="block"
        textAlign="center"
        sx={{
          py: 1.5,
          border: `1px dashed ${theme.palette.divider}`,
          borderRadius: 2,
        }}
      >
        {textoVacio}
      </Typography>
    );
  }

  return (
    <Box display="flex" flexDirection="column" gap={0.5}>
      {pedidos.map((pedido, indice) => {
        const seleccionado = estaSeleccionado(pedido);
        const relacionado = Boolean(productoScopDe(pedido.producto, motivo));
        const usado = pedido.codigoAutorizacion in ocupados;
        const compatible = unidadCompatible(pedido, motivo);
        const deshabilitado = !habilitado || !relacionado || usado || !compatible;

        return (
          <Box
            key={claveScop(pedido)}
            component="label"
            sx={{
              display: "grid",
              gridTemplateColumns: "auto minmax(0,1fr) auto",
              alignItems: "center",
              columnGap: 0.75,
              px: 0.75,
              py: 0.4,
              borderRadius: 2,
              cursor: deshabilitado ? "not-allowed" : "pointer",
              opacity: deshabilitado && !seleccionado ? 0.55 : 1,
              border: `1px solid ${seleccionado ? theme.palette.primary.main : theme.palette.divider}`,
              backgroundColor: seleccionado
                ? alpha(theme.palette.primary.main, 0.1)
                : "transparent",
            }}
          >
            <Checkbox
              checked={seleccionado}
              disabled={deshabilitado && !seleccionado}
              onChange={() => onAlternar(pedido)}
              sx={{ p: 0.25 }}
              inputProps={{
                "aria-label": `Pedido ${indice + 1}, SCOP ${pedido.codigoAutorizacion}`,
              }}
            />

            <Box minWidth={0}>
              <Typography
                variant="body2"
                fontWeight={700}
                noWrap
                lineHeight={1.25}
              >
                <Box component="span" sx={{ color: "text.secondary", mr: 0.5 }}>
                  #{indice + 1}
                </Box>
                {pedido.codigoAutorizacion}
                {pedido.factura ? ` · ${pedido.factura}` : ""}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                noWrap
                display="block"
                lineHeight={1.2}
              >
                {pedido.producto} · {fechaCorta(pedido.fechaPedido)} -{" "}
                <Box
                  component="span"
                  className="badge"
                  sx={{
                    bgcolor: "primary.main",
                    color: "white",
                    borderRadius: 1,
                    px: 0.5,
                    
                  }}
                >
                  {pedido.estado}
                </Box>
                {relacionado && !compatible && (
                  <Box component="span" sx={{ color: "warning.main", fontWeight: 600 }}>
                    {" "}
                    · en {abreviarUnidad(pedido.unidad)}: este motivo registra en{" "}
                    {abreviarUnidad(productoScopDe(pedido.producto, motivo)?.unidad || "")}
                  </Box>
                )}
                {usado && (
                  <Box component="span" sx={{ color: "error.main", fontWeight: 600 }}>
                    {" "}
                    · usado{ocupados[pedido.codigoAutorizacion] ? ` en ${ocupados[pedido.codigoAutorizacion]}` : " en otra guía"}
                  </Box>
                )}
                {!relacionado && (
                  <Box component="span" sx={{ color: "warning.main" }}>
                    {" "}
                    · sin relacionar
                  </Box>
                )}
              </Typography>
            </Box>

            <Box textAlign="right">
              <Typography variant="body2" fontWeight={700} lineHeight={1.25}>
                {formatoVolumen(pedido.volumen)}
              </Typography>
              <Typography
                variant="caption"
                color={pedido.tipo === "glp" ? "info.main" : "text.secondary"}
                lineHeight={1.2}
              >
                {pedido.tipo === "glp" ? "GLP" : "Líq."}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default ListaScop;
