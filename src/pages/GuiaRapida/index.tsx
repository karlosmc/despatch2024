import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  ButtonBase,
  Chip,
  CircularProgress,
  Collapse,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import dayjs from "dayjs";

import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import LocalGasStationRoundedIcon from "@mui/icons-material/LocalGasStationRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import DateRangeRoundedIcon from "@mui/icons-material/DateRangeRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";

import { ListaDetalles } from "../GuiaRemisionNueva/components/Listas";
import DialogosGuia from "../GuiaRemisionNueva/components/DialogosGuia";
import AgregarManual from "./components/AgregarManual";
import Bloque from "./components/Bloque";
import CampoSelect, { conActual } from "./components/CampoSelect";
import CargaInicial from "./components/CargaInicial";
import DocsRapidos from "./components/DocsRapidos";
import ListaScop, { formatoVolumen } from "./components/ListaScop";
import ResumenRapido from "./components/ResumenRapido";
import TemaCompacto from "./components/TemaCompacto";
import { MODALIDADES_TRASLADO, MOTIVOS_TRASLADO, useGuiaRapida } from "./useGuiaRapida";

/** Dos columnas desde el celular; tres en pantallas medianas. */
const GRID = {
  display: "grid",
  gridTemplateColumns: { xs: "repeat(2, minmax(0,1fr))", md: "repeat(3, minmax(0,1fr))" },
  gap: 1,
};
const FILA_COMPLETA = { gridColumn: { xs: "span 2", md: "span 1" } };

const formatoKilos = (n: number) => new Intl.NumberFormat("es-PE").format(n);

const opcionPunto = (p: { id?: number; nombreCorto?: string; direccion: string; rznSocial?: string }) => ({
  value: p.id,
  label: p.nombreCorto || p.direccion,
  detalle: p.nombreCorto ? p.direccion : p.rznSocial,
});

const GuiaRapidaContenido = () => {
  const theme = useTheme();
  const r = useGuiaRapida();
  const { api } = r;
  const v = api.formik.values;

  const [datosAbiertos, setDatosAbiertos] = useState<boolean | null>(null);
  const [verFechas, setVerFechas] = useState(false);
  const [verDocs, setVerDocs] = useState(false);
  const [verAvisos, setVerAvisos] = useState(false);
  const [verResumen, setVerResumen] = useState(false);

  const numero = v.datosGenerales.serie ? `${v.datosGenerales.serie}-${v.datosGenerales.correlativo}` : null;
  const chofer = v.choferes[0];
  const listo = !r.cargaEnCurso;

  // Se pliega sólo cuando están todos, incluidos el vehículo 2 y el punto de llegada,
  // que elige el usuario. Con cisterna GLP la consulta del SCOP empieza antes, pero
  // el bloque sigue abierto hasta elegir la llegada.
  const datosListos = Boolean(
    v.datosGenerales.serie &&
      v.vehiculo?.placa &&
      r.placaScop &&
      chofer?.licencia &&
      v.destinatario?.numDoc &&
      v.llegada?.id &&
      v.llegada?.direccion
  );
  // Plegado cuando todo está bien; abierto si falta algo. El usuario puede cambiarlo.
  const abiertoDatos = datosAbiertos ?? (listo && !datosListos);

  const puntoLlegada = r.puntosLlegada.find((p) => p.id === v.llegada?.id);
  const nombreLlegada = puntoLlegada?.nombreCorto || v.llegada?.direccion;

  const placas = [v.vehiculo?.placa, r.placaScop].filter(Boolean).join(" + ");
  const resumenDatos = [numero, placas, chofer?.nombres?.split(" ")[0], nombreLlegada]
    .filter(Boolean)
    .join(" · ");

  const opcionesVehiculos = r.vehiculos.map((x) => ({ value: x.id, label: x.placa, detalle: x.nombreCorto }));

  /* Segundos de la consulta en curso: el portal puede tardar. */
  const [segundosScop, setSegundosScop] = useState(0);
  useEffect(() => {
    if (!r.cargandoScop) {
      setSegundosScop(0);
      return;
    }
    const inicio = Date.now();
    const temporizador = setInterval(() => setSegundosScop(Math.floor((Date.now() - inicio) / 1000)), 1000);
    return () => clearInterval(temporizador);
  }, [r.cargandoScop]);

  const mensajeScop = r.cargandoScop
    ? { color: "text.secondary", texto: `Consultando el portal SCOP… ${segundosScop} s` }
    : r.errorScop
    ? { color: "error.main", texto: r.errorScop }
    : !r.tipoScop
    ? { color: "warning.main", texto: "Marca Líquidos para consultar el SCOP." }
    : !r.sucursal
    ? { color: "warning.main", texto: "Elige el punto de llegada: su id es la sucursal del SCOP." }
    : !r.placaScop
    ? { color: "warning.main", texto: "Elige el vehículo secundario: se muestran los pedidos de su placa." }
    : !r.secundarioEsGlp && !r.consultaPedida
    ? { color: "info.main", texto: "Toca actualizar para traer los pedidos de esta llegada." }
    : !r.proveedor
    ? { color: "warning.main", texto: "Elige el proveedor para poder marcar pedidos." }
    : r.secundarioEsGlp
    ? { color: "text.secondary", texto: `Cisterna GLP: la sucursal del SCOP es la placa ${r.placaScop}.` }
    : r.desdeCache
    ? { color: "text.secondary", texto: "Resultados guardados de una consulta reciente. Actualiza para traer lo último del portal." }
    : r.modoScop === "fake"
    ? { color: "info.main", texto: "Datos de prueba: no hay VITE_API_SCOP configurado." }
    : null;

  const cantidadDocs = r.docsVista.length;
  const cantidadBienes = v.details?.length || 0;

  return (
    <Box sx={{ maxWidth: 960, mx: "auto", pb: 1 }}>
      {/* Encabezado en una línea */}
      <Box display="flex" alignItems="center" gap={0.75} mb={1} minWidth={0}>
        <Box
          sx={{
            display: "grid",
            placeItems: "center",
            width: 28,
            height: 28,
            flexShrink: 0,
            borderRadius: 1.5,
            color: "warning.main",
            backgroundColor: alpha(theme.palette.warning.main, 0.15),
            "& svg": { fontSize: 18 },
          }}
        >
          <BoltRoundedIcon />
        </Box>
        <Typography variant="subtitle2" fontWeight={800} noWrap>
          Guía rápida
        </Typography>
        {numero && <Chip label={numero} color="primary" sx={{ fontWeight: 700 }} />}
        {api.guardada && <Chip label="Guardada" color="success" variant="outlined" />}
        <Typography variant="caption" color="text.secondary" sx={{ display: { xs: "none", sm: "block" } }}>
          {dayjs().format("DD/MM/YYYY")}
        </Typography>
        <Box flex={1} />
        <Tooltip title="Salir">
          <IconButton onClick={api.solicitarSalida} aria-label="Salir">
            <LogoutRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {r.avisos.length > 0 && (
        <Alert
          severity="warning"
          sx={{ mb: 1, borderRadius: 2 }}
          action={
            r.avisos.length > 1 ? (
              <Button color="inherit" onClick={() => setVerAvisos((x) => !x)}>
                {verAvisos ? "Ocultar" : "Ver"}
              </Button>
            ) : undefined
          }
        >
          {r.avisos.length === 1 || !verAvisos
            ? r.avisos.length === 1
              ? r.avisos[0]
              : `${r.avisos.length} avisos sobre los datos precargados`
            : r.avisos.map((aviso) => (
                <Typography key={aviso} variant="caption" display="block">
                  • {aviso}
                </Typography>
              ))}
        </Alert>
      )}

      <Box display="flex" flexDirection="column" gap={1}>
        {/* 1. Datos precargados (plegable) */}
        <Bloque
          titulo="Datos de la guía"
          icono={<TuneRoundedIcon />}
          color="primary"
          completo={datosListos}
          resumen={resumenDatos}
          abierto={abiertoDatos}
          onAlternar={() => setDatosAbiertos(!abiertoDatos)}
        >
          <Box sx={GRID}>
            <CampoSelect
              label="Punto de emisión"
              value={api.puntoEmisionSelected || ""}
              opciones={r.puntosEmision.map((p) => ({ value: p.id, label: p.nombre }))}
              onChange={(valor) => r.elegirPuntoEmision(Number(valor))}
            />
            <CampoSelect
              label="Serie"
              value={v.datosGenerales.serie}
              opciones={r.series.map((s) => ({
                value: s.serie,
                label: `${s.serie}-${Number(s.numeroActual) + 1}`,
              }))}
              onChange={(valor) => r.elegirSerie(String(valor))}
            />
            <Box sx={{ display: { xs: "none", md: "block" } }} />

            <CampoSelect
              label="Motivo"
              value={v.envio.codTraslado}
              opciones={MOTIVOS_TRASLADO.map((m) => ({ value: m.id, label: m.valor }))}
              onChange={(valor) => r.elegirMotivo(String(valor))}
            />
            <TextField
              label="Transporte"
              value={MODALIDADES_TRASLADO[v.envio.modTraslado] || ""}
              InputProps={{ readOnly: true }}
            />
            <Box sx={{ display: { xs: "none", md: "block" } }} />

            <CampoSelect
              label={r.choferAutomatico ? "Chofer (por tu DNI)" : "Chofer"}
              value={chofer?.id ?? ""}
              opciones={conActual(
                r.conductores.map((c) => ({ value: c.id, label: `${c.nombres} ${c.apellidos}`, detalle: `Lic. ${c.licencia}` })),
                chofer?.id ? { value: chofer.id, label: `${chofer.nombres} ${chofer.apellidos}` } : null
              )}
              onChange={(valor) => r.elegirChofer(Number(valor))}
              onOpen={r.cargarConductores}
              cargando={r.cargandoConductores}
              error={listo && !chofer}
            />
            <TextField
              label="Licencia"
              value={chofer?.licencia || ""}
              InputProps={{ readOnly: true }}
              error={listo && Boolean(chofer) && !chofer?.licencia}
            />
            <Box sx={{ display: { xs: "none", md: "block" } }} />

            <CampoSelect
              label="Vehículo"
              value={v.vehiculo?.id || ""}
              opciones={conActual(opcionesVehiculos, v.vehiculo?.id ? { value: v.vehiculo.id, label: v.vehiculo.placa } : null)}
              onChange={(valor) => r.elegirVehiculoPrincipal(Number(valor))}
              onOpen={r.cargarVehiculos}
              cargando={r.cargandoVehiculos}
              error={listo && !v.vehiculo?.placa}
            />
            <CampoSelect
              label={r.secundarioEsGlp ? "Secundario · GLP" : "Secundario"}
              value={v.vehiculo?.secundarios?.[0]?.id ?? ""}
              vacio="Ninguno"
              opciones={conActual(
                opcionesVehiculos,
                v.vehiculo?.secundarios?.[0]?.id
                  ? { value: v.vehiculo.secundarios[0].id, label: v.vehiculo.secundarios[0].placa }
                  : null
              )}
              onChange={(valor) => r.elegirVehiculoSecundario(valor === "" ? null : Number(valor))}
              onOpen={r.cargarVehiculos}
              cargando={r.cargandoVehiculos}
              disabled={!v.vehiculo?.placa}
              error={listo && Boolean(v.vehiculo?.placa) && !r.placaScop}
            />

            <CampoSelect
              label="Punto de llegada"
              value={v.llegada?.id || ""}
              opciones={r.puntosLlegada.map(opcionPunto)}
              onChange={(valor) => r.elegirLlegada(Number(valor))}
              disabled={r.puntosLlegada.length === 0}
              error={listo && r.puntosLlegada.length === 0}
              sx={FILA_COMPLETA}
            />

            <Box sx={{ gridColumn: "1 / -1", minWidth: 0 }}>
              <Typography variant="caption" color="text.secondary" noWrap display="block">
                Destinatario:{" "}
                <Box component="span" sx={{ color: v.destinatario?.numDoc ? "text.primary" : "error.main", fontWeight: 700 }}>
                  {v.destinatario?.rznSocial || "sin empresa por defecto"}
                </Box>
                {v.destinatario?.numDoc ? ` · RUC ${v.destinatario.numDoc}` : ""}
              </Typography>
            </Box>
          </Box>
        </Bloque>

        {/* 2. Proveedor y pedidos SCOP */}
        <Bloque
          titulo="Proveedor y pedidos"
          icono={<LocalGasStationRoundedIcon />}
          color="warning"
          completo={r.seleccion.length > 0 || cantidadBienes > 0}
        >
          <Box sx={GRID}>
            <CampoSelect
              label="Proveedor (emite factura y SCOP)"
              value={r.proveedor?.id ?? ""}
              vacio="Elige el proveedor"
              opciones={r.personas.map((p) => ({ value: p.id, label: p.rznSocial, detalle: p.numDoc }))}
              onChange={(valor) => r.elegirProveedor(valor === "" ? null : Number(valor))}
              error={listo && !r.proveedor}
              sx={{ gridColumn: { xs: "span 2", md: "span 2" } }}
            />
            <CampoSelect
              label="Punto de partida"
              value={v.partida?.id || ""}
              opciones={r.puntosPartida.map(opcionPunto)}
              onChange={(valor) => r.elegirPartida(Number(valor))}
              cargando={r.cargandoPartida}
              disabled={!r.proveedor || r.puntosPartida.length === 0}
              error={Boolean(r.proveedor) && !r.cargandoPartida && r.puntosPartida.length === 0}
              helperText={
                Boolean(r.proveedor) && !r.cargandoPartida && r.puntosPartida.length === 0
                  ? "Sin puntos con el RUC del proveedor"
                  : undefined
              }
              sx={FILA_COMPLETA}
            />
          </Box>

          {/* Filtros del SCOP en una sola fila */}
          <Box display="flex" alignItems="center" gap={0.75} mt={1} minWidth={0}>
            <ToggleButtonGroup
              exclusive
              value={r.tipoScop}
              onChange={(_, nuevo: "liquido" | "glp" | null) => nuevo && r.setTipoScop(nuevo)}
              aria-label="Tipo de producto"
              sx={{ flexShrink: 0 }}
            >
              <ToggleButton value="liquido">Líquidos</ToggleButton>
              <ToggleButton value="glp">GLP</ToggleButton>
            </ToggleButtonGroup>
            <Box sx={{ width: 112, flexShrink: 0 }}>
              <CampoSelect
                label="Placa sec."
                value={r.placaScop}
                opciones={r.placasSecundarias.map((p) => ({ value: p, label: p }))}
                onChange={(valor) => r.setPlacaScop(String(valor))}
                disabled={r.placasSecundarias.length <= 1}
                error={listo && r.placasSecundarias.length === 0}
              />
            </Box>
            <Box flex={1} />
            <Tooltip title={`Rango: ${dayjs(r.rango.desde).format("DD/MM")} – ${dayjs(r.rango.hasta).format("DD/MM")}`}>
              <IconButton onClick={() => setVerFechas((x) => !x)} color={verFechas ? "primary" : "default"} aria-label="Rango de fechas">
                <DateRangeRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={r.consultaPedida || r.secundarioEsGlp ? "Volver a consultar" : "Consultar el SCOP"}>
              <span>
                <IconButton
                  onClick={r.recargarScop}
                  disabled={r.cargandoScop || !r.tipoScop || !r.sucursal}
                  color={!r.secundarioEsGlp && !r.consultaPedida ? "primary" : "default"}
                  aria-label="Consultar el SCOP"
                >
                  <RefreshRoundedIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Box>

          <Collapse in={verFechas}>
            <Box display="grid" gridTemplateColumns="repeat(2, minmax(0,1fr))" gap={1} mt={1}>
              <TextField
                type="date"
                label="Desde"
                value={r.rango.desde}
                onChange={(e) => r.cambiarRango("desde", e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ colorScheme: theme.palette.mode }}
              />
              <TextField
                type="date"
                label="Hasta"
                value={r.rango.hasta}
                onChange={(e) => r.cambiarRango("hasta", e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ colorScheme: theme.palette.mode }}
              />
            </Box>
            <Typography variant="caption" color="text.secondary" display="block" mt={0.25}>
              Máximo 7 días: al cambiar una fecha, la otra se ajusta sola.
            </Typography>
          </Collapse>

          {mensajeScop && (
            <Typography variant="caption" color={mensajeScop.color} display="block" mt={0.75}>
              {mensajeScop.texto}
            </Typography>
          )}

          {r.vendedores.length > 0 && (
            <Box display="flex" alignItems="center" flexWrap="wrap" gap={0.5} mt={0.75}>
              <Typography variant="caption" color="text.secondary">
                Proveedor del SCOP:
              </Typography>
              {r.vendedores.map((v) => (
                <Tooltip
                  key={v.nombre}
                  title={v.cliente ? `Cliente: ${v.cliente.rznSocial}` : "Sin cliente que coincida"}
                >
                  <Chip
                    size="small"
                    label={`${v.etiqueta} (${v.cantidad})`}
                    color={v.nombre === r.vendedorElegido ? "primary" : "default"}
                    variant={v.nombre === r.vendedorElegido ? "filled" : "outlined"}
                    onClick={() => r.elegirVendedor(v.nombre === r.vendedorElegido ? null : v.nombre)}
                    sx={{ maxWidth: 240 }}
                  />
                </Tooltip>
              ))}
            </Box>
          )}

          {r.avisoVendedor && (
            <Typography variant="caption" color="warning.main" display="block" mt={0.5}>
              {r.avisoVendedor}
            </Typography>
          )}

          <Box mt={0.75}>
            <ListaScop
              pedidos={r.pedidos}
              estaSeleccionado={r.estaSeleccionado}
              onAlternar={r.alternarPedido}
              habilitado={Boolean(r.proveedor)}
              cargando={r.cargandoScop && r.pedidos.length === 0}
              ocupados={r.ocupados}
              motivo={v.envio.codTraslado}
            />
          </Box>

          {r.avisoSeleccion && (
            <Alert severity="warning" onClose={r.cerrarAvisoSeleccion} sx={{ mt: 0.75, py: 0 }}>
              {r.avisoSeleccion}
            </Alert>
          )}

          {(r.noDisponibles > 0 || r.seleccion.length > 0) && (
            <Box display="flex" justifyContent="space-between" gap={1} mt={0.5}>
              <Typography variant="caption" color="text.secondary">
                {r.noDisponibles > 0 ? `${r.noDisponibles} cerrado(s) o anulado(s) ocultos` : ""}
              </Typography>
              {r.seleccion.length > 0 && (
                <Typography variant="caption" fontWeight={700}>
                  {r.seleccion.length} sel. ·{" "}
                  {r.totalesSeleccion.map((t) => `${formatoVolumen(t.total)}${t.unidad ? ` ${t.unidad}` : ""}`).join(" + ")}
                </Typography>
              )}
            </Box>
          )}

          <AgregarManual
            hayProveedor={Boolean(r.proveedor)}
            onAgregarDoc={r.agregarDocManual}
            onAgregarProducto={r.agregarProductoManual}
          />
        </Bloque>

        {/* 3. Bienes, peso y documentos */}
        {(cantidadBienes > 0 || cantidadDocs > 0) && (
          <Bloque
            titulo="Bienes y documentos"
            icono={<Inventory2RoundedIcon />}
            color="secondary"
            completo={cantidadBienes > 0}
          >
            <ListaDetalles detalles={v.details || []} onDelete={r.quitarBien} onCantidad={api.onCambiarCantidadDetalle} />

            <Box display="flex" alignItems="center" justifyContent="space-between" gap={1} mt={0.75}>
              <Typography variant="caption" color="text.secondary">
                Peso total
              </Typography>
              <TextField
                value={v.envio.pesoTotal ?? 0}
                onChange={(e) => r.editarPeso(e.target.value)}
                onFocus={(e) => e.target.select()}
                inputProps={{ inputMode: "numeric", style: { textAlign: "right", fontWeight: 800 } }}
                InputProps={{ endAdornment: <InputAdornment position="end">kg</InputAdornment> }}
                sx={{ width: 130 }}
                aria-label="Peso total en kilos"
              />
            </Box>
            {r.pesoManual && (
              <Box display="flex" alignItems="center" justifyContent="flex-end" gap={0.75}>
                <Typography variant="caption" color="warning.main">
                  Peso escrito a mano (calculado: {formatoKilos(r.pesoCalculado.peso)} kg)
                </Typography>
                <ButtonBase onClick={r.restaurarPeso} sx={{ borderRadius: 1, px: 0.5 }}>
                  <Typography variant="caption" fontWeight={700} color="primary.main">
                    Recalcular
                  </Typography>
                </ButtonBase>
              </Box>
            )}
            {r.pesoCalculado.sinFactor.length > 0 && (
              <Typography variant="caption" color="error.main" display="block">
                Sin factor de kilos: {r.pesoCalculado.sinFactor.join(", ")}
              </Typography>
            )}

            {cantidadDocs > 0 && (
              <>
                <ButtonBase
                  onClick={() => setVerDocs((x) => !x)}
                  aria-expanded={verDocs}
                  sx={{ width: "100%", justifyContent: "space-between", mt: 1, py: 0.5, borderRadius: 1 }}
                >
                  <Typography variant="caption" fontWeight={700}>
                    Documentos adicionales ({cantidadDocs})
                  </Typography>
                  <ExpandMoreRoundedIcon
                    fontSize="small"
                    sx={{ color: "text.secondary", transition: "transform .2s", transform: verDocs ? "rotate(180deg)" : "none" }}
                  />
                </ButtonBase>
                <Collapse in={verDocs}>
                  <DocsRapidos
                    docs={r.docsVista}
                    onCorregir={r.corregirDoc}
                    onQuitar={r.quitarDoc}
                    emisor={r.proveedor?.numDoc}
                  />
                </Collapse>
              </>
            )}
          </Bloque>
        )}

        {/* Acciones */}
        <Paper
          elevation={0}
          sx={{
            position: "sticky",
            bottom: 6,
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            p: 0.75,
            borderRadius: 2.5,
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: alpha(theme.palette.background.paper, 0.94),
            backdropFilter: "blur(10px)",
          }}
        >
          <Button
            startIcon={<FactCheckRoundedIcon />}
            onClick={() => setVerResumen(true)}
            sx={{ height: 34, whiteSpace: "nowrap" }}
          >
            Resumen
          </Button>
          <Box flex={1} />
          <Button
            variant="outlined"
            color="success"
            startIcon={api.guardando ? <CircularProgress size={14} /> : <SaveRoundedIcon />}
            onClick={() => api.guardar("borrador")}
            disabled={api.guardando}
            sx={{ height: 34, whiteSpace: "nowrap" }}
          >
            {api.guardada ? "Actualizar" : "Guardar"}
          </Button>
          <Button
            variant="contained"
            color="warning"
            startIcon={<SendRoundedIcon />}
            onClick={() => api.guardar("sunat")}
            disabled={api.guardando || api.enviadaSunat}
            sx={{ height: 34, whiteSpace: "nowrap", color: "common.white", fontWeight: 700 }}
          >
            Enviar a SUNAT
          </Button>
        </Paper>
      </Box>

      <ResumenRapido abierto={verResumen} onCerrar={() => setVerResumen(false)} r={r} />
      <CargaInicial
        abierto={r.cargaEnCurso || r.hayErroresCarga}
        pasos={r.pasosLista}
        hayErrores={r.hayErroresCarga && !r.cargaEnCurso}
        onReintentar={r.reintentarCarga}
        onSalir={api.solicitarSalida}
      />
      <DialogosGuia api={api} confirmacionesManuales={false} />
    </Box>
  );
};

/**
 * Guía rápida: todo viene precargado (punto de emisión, serie, vehículos de la
 * serie, chofer por DNI, destinatario y llegada) y los bienes, documentos y peso
 * se arman eligiendo el proveedor y sus pedidos SCOP. Sólo se elige entre lo existente.
 */
const GuiaRapida = () => (
  <TemaCompacto>
    <GuiaRapidaContenido />
  </TemaCompacto>
);

export default GuiaRapida;
