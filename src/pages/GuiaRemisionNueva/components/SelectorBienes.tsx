import { KeyboardEvent, useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";
import AddCircleRoundedIcon from "@mui/icons-material/AddCircleRounded";

import { Detail } from "../../../types/guias/guiaremision.interface";
import { Producto } from "../../../types/producto.interface";
import { ProductoService } from "../../../service/ProductoService";
import ModalProducto from "../../../components/Producto";
import FormSheet from "./FormSheet";
import FilaDeslizable from "./FilaDeslizable";

interface SelectorBienesProps {
  onAgregar: (detalle: Detail) => void;
  /** Abre el formulario completo, para bienes que no están en el catálogo. */
  onAbrirManual: () => void;
  disabled?: boolean;
}

const MIN_CARACTERES = 2;
const RETARDO_BUSQUEDA = 300;
const MAX_RESULTADOS = 20;

const aDetalle = (producto: Producto, cantidad: number): Detail => ({
  id: producto.id,
  codigo: (producto.codigo || "").toUpperCase(),
  descripcion: (producto.descripcion || "").toUpperCase(),
  unidad: producto.unidad,
  codProdSunat: producto.codProdSunat || "",
  cantidad,
  atributos: null,
});

/**
 * Alta rápida de bienes al estilo de un punto de venta: se escribe o escanea,
 * se elige de la lista (o Enter) y el ítem entra con la cantidad indicada.
 * El formulario completo sigue disponible para lo que no está en el catálogo.
 */
const SelectorBienes = ({ onAgregar, onAbrirManual, disabled = false }: SelectorBienesProps) => {
  const theme = useTheme();

  const [query, setQuery] = useState("");
  const [cantidad, setCantidad] = useState<string>("1");
  const [resultados, setResultados] = useState<Producto[]>([]);
  const [buscando, setBuscando] = useState(false);

  const [favoritos, setFavoritos] = useState<Producto[]>([]);
  const [creando, setCreando] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  /** Descarta respuestas de búsquedas que ya quedaron obsoletas. */
  const busquedaActual = useRef(0);

  /* ---------------- Favoritos ---------------- */
  useEffect(() => {
    let cancelado = false;
    const cargar = async () => {
      try {
        const { data } = await ProductoService.get("fav=1");
        if (!cancelado) setFavoritos(data || []);
      } catch (error) {
        console.log("No se pudieron cargar los productos favoritos", error);
      }
    };
    cargar();
    return () => {
      cancelado = true;
    };
  }, []);

  /* ---------------- Búsqueda ---------------- */
  const buscar = useCallback(async (texto: string) => {
    const ticket = ++busquedaActual.current;
    setBuscando(true);

    try {
      // La API filtra por un campo a la vez: se consultan ambos y se fusionan.
      const [porCodigo, porDescripcion] = await Promise.allSettled([
        ProductoService.get(`codigo=${encodeURIComponent(texto)}`),
        ProductoService.get(`descripcion=${encodeURIComponent(texto)}`),
      ]);

      if (ticket !== busquedaActual.current) return;

      const juntos: Producto[] = [
        ...(porCodigo.status === "fulfilled" ? porCodigo.value?.data || [] : []),
        ...(porDescripcion.status === "fulfilled" ? porDescripcion.value?.data || [] : []),
      ];

      const unicos = new Map<number | string, Producto>();
      juntos.forEach((p) => unicos.set(p.id ?? p.codigo, p));

      setResultados(Array.from(unicos.values()).slice(0, MAX_RESULTADOS));
    } catch (error) {
      if (ticket === busquedaActual.current) setResultados([]);
      console.log("Error al buscar productos", error);
    } finally {
      if (ticket === busquedaActual.current) setBuscando(false);
    }
  }, []);

  useEffect(() => {
    const texto = query.trim();
    if (texto.length < MIN_CARACTERES) {
      busquedaActual.current++;
      setResultados([]);
      setBuscando(false);
      return;
    }

    const temporizador = setTimeout(() => buscar(texto), RETARDO_BUSQUEDA);
    return () => clearTimeout(temporizador);
  }, [query, buscar]);

  /* ---------------- Alta ---------------- */
  const agregar = (producto: Producto) => {
    const cant = Number(cantidad);
    onAgregar(aDetalle(producto, cant > 0 ? cant : 1));

    // Listo para el siguiente: se limpia y el foco vuelve al buscador.
    setQuery("");
    setResultados([]);
    setCantidad("1");
    inputRef.current?.focus();
  };

  /** Enter agrega la coincidencia exacta de código, o el primer resultado. */
  const onEnter = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    if (resultados.length === 0) return;

    const texto = query.trim().toUpperCase();
    const exacto = resultados.find((p) => (p.codigo || "").toUpperCase() === texto);
    agregar(exacto || resultados[0]);
  };

  const hayQuery = query.trim().length >= MIN_CARACTERES;

  return (
    <Box display="grid" gridTemplateColumns="minmax(0, 1fr)" gap={1.5} minWidth={0}>
      {/* Buscador + cantidad */}
      <Box display="flex" gap={1} alignItems="flex-start" minWidth={0}>
        <TextField
          inputRef={inputRef}
          fullWidth
          size="small"
          autoComplete="off"
          disabled={disabled}
          label="Buscar o escanear"
          placeholder="Código o descripción…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onEnter}
          inputProps={{ style: { textTransform: "uppercase" } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                {buscando ? <CircularProgress size={18} /> : <SearchRoundedIcon fontSize="small" />}
              </InputAdornment>
            ),
            endAdornment: query ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setQuery("")} aria-label="Limpiar">
                  <ClearRoundedIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />
        <TextField
          size="small"
          type="number"
          label="Cant."
          disabled={disabled}
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          onKeyDown={onEnter}
          inputProps={{
            min: 0,
            step: "any",
            onWheel: (e: React.WheelEvent<HTMLInputElement>) => e.currentTarget.blur(),
          }}
          sx={{ width: 92, flexShrink: 0 }}
        />
      </Box>

      {/* Resultados */}
      {hayQuery && (
        <Paper
          elevation={0}
          sx={{
            borderRadius: 2.5,
            border: `1px solid ${theme.palette.divider}`,
            maxHeight: 260,
            overflowY: "auto",
          }}
        >
          {resultados.length === 0 ? (
            <Box p={2} textAlign="center">
              <Typography variant="caption" color="text.secondary" display="block">
                {buscando ? "Buscando…" : "Sin coincidencias en el catálogo"}
              </Typography>
              {!buscando && (
                <Button
                  size="small"
                  startIcon={<AddRoundedIcon />}
                  onClick={() => setCreando(true)}
                  sx={{ mt: 1 }}
                >
                  Crear "{query.trim().toUpperCase()}"
                </Button>
              )}
            </Box>
          ) : (
            resultados.map((producto) => (
              <Box
                key={producto.id ?? producto.codigo}
                onClick={() => agregar(producto)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 1.5,
                  py: 1,
                  cursor: "pointer",
                  minHeight: 52,
                  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                  "&:last-of-type": { borderBottom: "none" },
                  "&:hover": { backgroundColor: alpha(theme.palette.secondary.main, 0.12) },
                }}
              >
                <Box flex={1} minWidth={0}>
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {producto.descripcion}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap display="block">
                    {producto.codigo} · {producto.unidad}
                    {producto.codProdSunat ? ` · SUNAT ${producto.codProdSunat}` : ""}
                  </Typography>
                </Box>
                <AddCircleRoundedIcon color="secondary" />
              </Box>
            ))
          )}
        </Paper>
      )}

      {/* Favoritos: un toque los agrega */}
      {favoritos.length > 0 && (
        <Box minWidth={0}>
          <Typography variant="caption" color="text.secondary">
            Favoritos
          </Typography>
          <FilaDeslizable>
            {favoritos.map((producto) => (
              <Chip
                key={producto.id}
                clickable
                disabled={disabled}
                color="secondary"
                variant="outlined"
                icon={<AddRoundedIcon />}
                label={producto.nombreCorto || producto.codigo}
                onClick={() => agregar(producto)}
                sx={{ flexShrink: 0, fontWeight: 700, height: 34 }}
              />
            ))}
          </FilaDeslizable>
        </Box>
      )}

      {/* Salidas para lo que no está en el catálogo */}
      <Box display="flex" gap={1} flexWrap="wrap">
        <Button
          size="small"
          variant="outlined"
          startIcon={<AddRoundedIcon />}
          onClick={() => setCreando(true)}
          disabled={disabled}
        >
          Crear producto
        </Button>
        <Button
          size="small"
          variant="text"
          startIcon={<EditNoteRoundedIcon />}
          onClick={onAbrirManual}
          disabled={disabled}
        >
          Carga manual
        </Button>
      </Box>

      <FormSheet
        open={creando}
        title="Nuevo producto"
        subtitle="Se agrega al catálogo y a esta guía"
        icon={<AddRoundedIcon />}
        onClose={() => setCreando(false)}
      >
        <ModalProducto
          initialValue={null}
          edit={false}
          onConfirm={(producto: Producto) => {
            setCreando(false);
            agregar(producto);
          }}
        />
      </FormSheet>
    </Box>
  );
};

export default SelectorBienes;
