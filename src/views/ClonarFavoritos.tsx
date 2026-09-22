import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  LinearProgress,
  Paper,
  TextField,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";

import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";

import { useAuthStore } from "../store/authStore";
import {
  FavoritoResumen,
  FavoritoService,
  ResultadoClonado,
  TIPOS_FAVORITO,
  TipoFavorito,
} from "../service/FavoritoService";
import { UserService, UsuarioResumen } from "../service/UserService";

const TIPOS: { tipo: TipoFavorito; etiqueta: string }[] = [
  { tipo: TIPOS_FAVORITO.cliente, etiqueta: "Personas / empresas" },
  { tipo: TIPOS_FAVORITO.producto, etiqueta: "Productos" },
  { tipo: TIPOS_FAVORITO.punto, etiqueta: "Puntos de ubicación" },
  { tipo: TIPOS_FAVORITO.conductor, etiqueta: "Conductores" },
  { tipo: TIPOS_FAVORITO.vehiculo, etiqueta: "Vehículos" },
  { tipo: TIPOS_FAVORITO.transportista, etiqueta: "Transportistas" },
];

type Seleccion = Record<TipoFavorito, number[]>;

const seleccionVacia = (): Seleccion =>
  TIPOS.reduce((acc, { tipo }) => ({ ...acc, [tipo]: [] }), {} as Seleccion);

interface ResultadoUsuario {
  usuario: UsuarioResumen;
  resultado?: ResultadoClonado;
  error?: string;
}

const coincide = (texto: string, ...campos: (string | null | undefined)[]) => {
  const buscado = texto.trim().toLowerCase();
  return !buscado || campos.some((c) => (c || "").toLowerCase().includes(buscado));
};

/** Tarjeta con título numerado. */
const Seccion = ({ paso, titulo, extra, children }: { paso: number; titulo: string; extra?: ReactNode; children: ReactNode }) => (
  <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 3, minWidth: 0 }}>
    <Box display="flex" alignItems="center" justifyContent="space-between" gap={1} mb={1.5}>
      <Box display="flex" alignItems="center" gap={1}>
        <Box
          sx={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            bgcolor: "primary.main",
            color: "primary.contrastText",
            display: "grid",
            placeItems: "center",
            fontSize: 13,
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {paso}
        </Box>
        <Typography variant="subtitle1" fontWeight={700}>
          {titulo}
        </Typography>
      </Box>
      {extra}
    </Box>
    {children}
  </Paper>
);

const ClonarFavoritos = () => {
  const theme = useTheme();
  const user = useAuthStore((state) => state.user);
  const esAdmin = user?.perfil === "admin";

  /* ---------- Favoritos propios ---------- */
  const [favoritos, setFavoritos] = useState<Record<TipoFavorito, FavoritoResumen[]> | null>(null);
  const [cargandoFavoritos, setCargandoFavoritos] = useState(false);
  const [errorFavoritos, setErrorFavoritos] = useState<string | null>(null);
  const [seleccion, setSeleccion] = useState<Seleccion>(seleccionVacia);
  const [filtroFavoritos, setFiltroFavoritos] = useState("");

  const cargarFavoritos = async () => {
    if (!user?.id) return;
    setCargandoFavoritos(true);
    setErrorFavoritos(null);
    try {
      const { favoritos: lista } = await FavoritoService.deUsuario(user.id);
      setFavoritos(lista);
      setSeleccion(seleccionVacia());
    } catch (error) {
      setErrorFavoritos(typeof error === "string" ? error : "No se pudieron cargar tus favoritos");
    } finally {
      setCargandoFavoritos(false);
    }
  };

  /* ---------- Usuarios destino ---------- */
  const [busquedaUsuario, setBusquedaUsuario] = useState("");
  const [usuarios, setUsuarios] = useState<UsuarioResumen[]>([]);
  const [cargandoUsuarios, setCargandoUsuarios] = useState(false);
  const [errorUsuarios, setErrorUsuarios] = useState<string | null>(null);
  const [destinos, setDestinos] = useState<UsuarioResumen[]>([]);

  useEffect(() => {
    if (esAdmin) cargarFavoritos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [esAdmin, user?.id]);

  // Búsqueda con una pequeña espera para no consultar en cada tecla.
  useEffect(() => {
    if (!esAdmin) return;
    let vigente = true;
    const temporizador = setTimeout(async () => {
      setCargandoUsuarios(true);
      setErrorUsuarios(null);
      try {
        const lista = await UserService.buscar(busquedaUsuario);
        if (vigente) setUsuarios(lista.filter((u) => u.id !== user?.id));
      } catch (error) {
        if (vigente) setErrorUsuarios(typeof error === "string" ? error : "No se pudieron cargar los usuarios");
      } finally {
        if (vigente) setCargandoUsuarios(false);
      }
    }, 350);
    return () => {
      vigente = false;
      clearTimeout(temporizador);
    };
  }, [busquedaUsuario, esAdmin, user?.id]);

  /* ---------- Clonado ---------- */
  const [confirmando, setConfirmando] = useState(false);
  const [progreso, setProgreso] = useState<{ actual: number; total: number } | null>(null);
  const [resultados, setResultados] = useState<ResultadoUsuario[]>([]);

  const totalFavoritos = useMemo(
    () => (favoritos ? TIPOS.reduce((n, { tipo }) => n + favoritos[tipo].length, 0) : 0),
    [favoritos]
  );
  const totalElegidos = TIPOS.reduce((n, { tipo }) => n + seleccion[tipo].length, 0);
  const tiposElegidos = TIPOS.filter(({ tipo }) => seleccion[tipo].length > 0);
  const clonando = progreso !== null;

  if (!esAdmin) return <Navigate to="/admin/guias" replace />;

  /* ---------- Selección de favoritos ---------- */
  const alternarFavorito = (tipo: TipoFavorito, id: number) =>
    setSeleccion((previa) => ({
      ...previa,
      [tipo]: previa[tipo].includes(id) ? previa[tipo].filter((x) => x !== id) : [...previa[tipo], id],
    }));

  const alternarTipo = (tipo: TipoFavorito) =>
    setSeleccion((previa) => ({
      ...previa,
      [tipo]: previa[tipo].length === (favoritos?.[tipo].length ?? 0) ? [] : (favoritos?.[tipo] ?? []).map((f) => f.id),
    }));

  const todoElegido = totalFavoritos > 0 && totalElegidos === totalFavoritos;
  const alternarTodo = () =>
    setSeleccion(
      todoElegido || !favoritos
        ? seleccionVacia()
        : TIPOS.reduce((acc, { tipo }) => ({ ...acc, [tipo]: favoritos[tipo].map((f) => f.id) }), {} as Seleccion)
    );

  /* ---------- Selección de usuarios ---------- */
  const estaElegido = (u: UsuarioResumen) => destinos.some((d) => d.id === u.id);
  const alternarUsuario = (u: UsuarioResumen) =>
    setDestinos((previa) => (previa.some((d) => d.id === u.id) ? previa.filter((d) => d.id !== u.id) : [...previa, u]));
  const todosMostradosElegidos = usuarios.length > 0 && usuarios.every(estaElegido);
  const alternarMostrados = () =>
    setDestinos((previa) =>
      todosMostradosElegidos
        ? previa.filter((d) => !usuarios.some((u) => u.id === d.id))
        : [...previa, ...usuarios.filter((u) => !previa.some((d) => d.id === u.id))]
    );

  /* ---------- Ejecutar ---------- */
  const clonar = async (para: UsuarioResumen[]) => {
    if (!user?.id || para.length === 0 || totalElegidos === 0) return;
    setConfirmando(false);

    const favoritosElegidos: Partial<Record<TipoFavorito, number[]>> = {};
    tiposElegidos.forEach(({ tipo }) => {
      favoritosElegidos[tipo] = seleccion[tipo];
    });

    // Uno por uno: cada usuario es una petición y así se ve el avance y qué falló.
    const nuevos: ResultadoUsuario[] = [];
    setProgreso({ actual: 0, total: para.length });
    for (let i = 0; i < para.length; i++) {
      const usuario = para[i];
      try {
        const resultado = await FavoritoService.clonar(user.id, usuario.id, favoritosElegidos);
        nuevos.push({ usuario, resultado });
      } catch (error) {
        nuevos.push({ usuario, error: typeof error === "string" ? error : "Error desconocido" });
      }
      setProgreso({ actual: i + 1, total: para.length });
    }
    setProgreso(null);
    setResultados(nuevos);
  };

  const fallidos = resultados.filter((r) => r.error).map((r) => r.usuario);

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", px: { xs: 1.5, sm: 3 }, py: { xs: 2, sm: 3 } }}>
      <Box mb={2}>
        <Typography variant="h5" fontWeight={700}>
          Clonar favoritos
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Copia tus favoritos a otros usuarios. Solo se agrega lo que no tienen: sus favoritos y nombres cortos no se
          sobrescriben.
        </Typography>
      </Box>

      <Box display="grid" gridTemplateColumns={{ xs: "1fr", md: "minmax(0,1.2fr) minmax(0,1fr)" }} gap={2}>
        {/* 1. Qué copiar */}
        <Seccion
          paso={1}
          titulo="Qué favoritos copiar"
          extra={
            <Chip
              size="small"
              color={totalElegidos > 0 ? "primary" : "default"}
              label={`${totalElegidos} de ${totalFavoritos}`}
            />
          }
        >
          {errorFavoritos && (
            <Alert
              severity="error"
              sx={{ mb: 1.5 }}
              action={<Button color="inherit" size="small" onClick={cargarFavoritos}>Reintentar</Button>}
            >
              {errorFavoritos}
            </Alert>
          )}

          {cargandoFavoritos ? (
            <Box py={6} textAlign="center">
              <CircularProgress />
            </Box>
          ) : favoritos && totalFavoritos === 0 ? (
            <Alert severity="info">Todavía no tienes favoritos marcados.</Alert>
          ) : favoritos ? (
            <>
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Checkbox
                  checked={todoElegido}
                  indeterminate={totalElegidos > 0 && !todoElegido}
                  onChange={alternarTodo}
                  disabled={clonando}
                  inputProps={{ "aria-label": "Elegir todos los favoritos" }}
                />
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Filtrar por nombre, documento, placa…"
                  value={filtroFavoritos}
                  onChange={(e) => setFiltroFavoritos(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRoundedIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {TIPOS.map(({ tipo, etiqueta }) => {
                const lista = favoritos[tipo];
                const visibles = lista.filter((f) => coincide(filtroFavoritos, f.nombreCorto, f.descripcion));
                const elegidos = seleccion[tipo].length;
                const vacio = lista.length === 0;
                if (filtroFavoritos && visibles.length === 0) return null;

                return (
                  <Accordion
                    key={tipo}
                    disableGutters
                    disabled={vacio}
                    defaultExpanded={false}
                    elevation={0}
                    sx={{ border: 1, borderColor: "divider", "&:not(:last-of-type)": { mb: 0.75 }, borderRadius: 2, "&:before": { display: "none" } }}
                  >
                    <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />} sx={{ minHeight: 44, px: 1, "& .MuiAccordionSummary-content": { my: 0.5, alignItems: "center", gap: 0.5 } }}>
                      <Checkbox
                        size="small"
                        checked={!vacio && elegidos === lista.length}
                        indeterminate={elegidos > 0 && elegidos < lista.length}
                        disabled={vacio || clonando}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => alternarTipo(tipo)}
                        inputProps={{ "aria-label": `Elegir todos: ${etiqueta}` }}
                      />
                      <Typography variant="body2" fontWeight={600} flex={1} noWrap>
                        {etiqueta}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" mr={0.5}>
                        {vacio ? "sin favoritos" : `${elegidos}/${lista.length}`}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 0.5, pt: 0, maxHeight: 320, overflowY: "auto" }}>
                      {visibles.map((f) => {
                        const marcado = seleccion[tipo].includes(f.id);
                        return (
                          <Box
                            key={f.id}
                            component="label"
                            display="flex"
                            alignItems="center"
                            gap={0.5}
                            sx={{
                              px: 0.5,
                              py: 0.25,
                              borderRadius: 1.5,
                              cursor: clonando ? "default" : "pointer",
                              bgcolor: marcado ? alpha(theme.palette.primary.main, 0.08) : "transparent",
                            }}
                          >
                            <Checkbox size="small" checked={marcado} disabled={clonando} onChange={() => alternarFavorito(tipo, f.id)} />
                            <Box minWidth={0}>
                              <Typography variant="body2" fontWeight={600} noWrap>
                                {f.nombreCorto || f.descripcion}
                              </Typography>
                              {f.nombreCorto && (
                                <Typography variant="caption" color="text.secondary" noWrap display="block">
                                  {f.descripcion}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        );
                      })}
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </>
          ) : null}
        </Seccion>

        {/* 2. A quiénes */}
        <Seccion
          paso={2}
          titulo="A qué usuarios"
          extra={<Chip size="small" color={destinos.length > 0 ? "primary" : "default"} label={destinos.length} />}
        >
          <TextField
            size="small"
            fullWidth
            placeholder="Buscar por nombre o documento"
            value={busquedaUsuario}
            onChange={(e) => setBusquedaUsuario(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: cargandoUsuarios ? (
                <InputAdornment position="end">
                  <CircularProgress size={16} />
                </InputAdornment>
              ) : undefined,
            }}
          />

          {destinos.length > 0 && (
            <Box display="flex" flexWrap="wrap" gap={0.5} mt={1}>
              {destinos.map((d) => (
                <Chip key={d.id} size="small" label={d.name} onDelete={clonando ? undefined : () => alternarUsuario(d)} />
              ))}
            </Box>
          )}

          {errorUsuarios && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {errorUsuarios}
            </Alert>
          )}

          <Box mt={1} sx={{ border: 1, borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
            <Box
              component="label"
              display="flex"
              alignItems="center"
              gap={0.5}
              sx={{ px: 0.5, py: 0.25, bgcolor: "action.hover", cursor: "pointer" }}
            >
              <Checkbox
                size="small"
                checked={todosMostradosElegidos}
                indeterminate={!todosMostradosElegidos && usuarios.some(estaElegido)}
                onChange={alternarMostrados}
                disabled={usuarios.length === 0 || clonando}
              />
              <Typography variant="caption" fontWeight={600}>
                Elegir los {usuarios.length} mostrados
              </Typography>
            </Box>
            <Box sx={{ maxHeight: 380, overflowY: "auto" }}>
              {!cargandoUsuarios && usuarios.length === 0 && !errorUsuarios && (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
                  No se encontraron usuarios
                </Typography>
              )}
              {usuarios.map((u) => {
                const marcado = estaElegido(u);
                return (
                  <Box
                    key={u.id}
                    component="label"
                    display="flex"
                    alignItems="center"
                    gap={0.5}
                    sx={{
                      px: 0.5,
                      py: 0.25,
                      borderTop: 1,
                      borderColor: "divider",
                      cursor: clonando ? "default" : "pointer",
                      bgcolor: marcado ? alpha(theme.palette.primary.main, 0.08) : "transparent",
                    }}
                  >
                    <Checkbox size="small" checked={marcado} disabled={clonando} onChange={() => alternarUsuario(u)} />
                    <Box minWidth={0} flex={1}>
                      <Typography variant="body2" fontWeight={600} noWrap>
                        {u.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap display="block">
                        {[u.documento, u.email].filter(Boolean).join(" · ")}
                      </Typography>
                    </Box>
                    {u.perfil && <Chip size="small" variant="outlined" label={u.perfil} sx={{ textTransform: "capitalize" }} />}
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Seccion>
      </Box>

      {/* Resultados */}
      {resultados.length > 0 && (
        <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 3, mt: 2 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" gap={1} mb={1}>
            <Typography variant="subtitle1" fontWeight={700}>
              Resultado
            </Typography>
            {fallidos.length > 0 && (
              <Button size="small" onClick={() => clonar(fallidos)} disabled={clonando || totalElegidos === 0}>
                Reintentar {fallidos.length} fallido(s)
              </Button>
            )}
          </Box>
          <Box display="flex" flexDirection="column" gap={0.75}>
            {resultados.map(({ usuario, resultado, error }) => (
              <Box
                key={usuario.id}
                display="flex"
                flexWrap="wrap"
                alignItems="center"
                gap={0.75}
                sx={{ p: 1, borderRadius: 2, border: 1, borderColor: error ? "error.main" : "divider" }}
              >
                {error ? <ErrorRoundedIcon color="error" fontSize="small" /> : <CheckCircleRoundedIcon color="success" fontSize="small" />}
                <Typography variant="body2" fontWeight={600} sx={{ flex: { xs: "1 1 100%", sm: "1 1 auto" }, minWidth: 0 }} noWrap>
                  {usuario.name}
                </Typography>
                {error ? (
                  <Typography variant="caption" color="error.main">
                    {error}
                  </Typography>
                ) : (
                  resultado && (
                    <>
                      <Chip size="small" color="success" label={`${resultado.resumen.creados} agregados`} />
                      <Chip size="small" color="info" variant="outlined" label={`${resultado.resumen.marcados} marcados`} />
                      <Chip size="small" variant="outlined" label={`${resultado.resumen.omitidos} ya los tenía`} />
                      {resultado.resumen.no_encontrados > 0 && (
                        <Chip size="small" color="warning" label={`${resultado.resumen.no_encontrados} no encontrados`} />
                      )}
                    </>
                  )
                )}
              </Box>
            ))}
          </Box>
          <Typography variant="caption" color="text.secondary" display="block" mt={1}>
            "Marcados": el usuario ya tenía ese registro con nombre propio; se marcó como favorito y conservó su nombre.
          </Typography>
        </Paper>
      )}

      {/* Barra de acción fija */}
      <Paper
        elevation={8}
        sx={{
          // Pegada abajo dentro del contenido: no tapa el menú lateral en escritorio.
          position: "sticky",
          bottom: { xs: 8, sm: 16 },
          mt: 2,
          zIndex: (t) => t.zIndex.appBar,
          px: { xs: 1.5, sm: 2 },
          py: 1.25,
          borderRadius: 3,
          border: 1,
          borderColor: "divider",
        }}
      >
        {clonando && progreso && (
          <LinearProgress variant="determinate" value={(progreso.actual / progreso.total) * 100} sx={{ mb: 1 }} />
        )}
        <Box display="flex" alignItems="center" justifyContent="space-between" gap={1.5}>
          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 0 }}>
            {clonando && progreso
              ? `Clonando ${progreso.actual} de ${progreso.total}…`
              : `${totalElegidos} favorito(s) → ${destinos.length} usuario(s)`}
          </Typography>
          <Button
            variant="contained"
            startIcon={clonando ? <CircularProgress size={18} color="inherit" /> : <ContentCopyRoundedIcon />}
            disabled={clonando || totalElegidos === 0 || destinos.length === 0}
            onClick={() => setConfirmando(true)}
            sx={{ flexShrink: 0 }}
          >
            Clonar
          </Button>
        </Box>
      </Paper>

      <Dialog open={confirmando} onClose={() => setConfirmando(false)} fullWidth maxWidth="xs">
        <DialogTitle>¿Clonar favoritos?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Se copiarán <b>{totalElegidos}</b> favorito(s) a <b>{destinos.length}</b> usuario(s):
          </Typography>
          <Box component="ul" sx={{ pl: 2.5, my: 1 }}>
            {tiposElegidos.map(({ tipo, etiqueta }) => (
              <Typography component="li" variant="body2" key={tipo}>
                {etiqueta}: {seleccion[tipo].length}
              </Typography>
            ))}
          </Box>
          <Typography variant="caption" color="text.secondary">
            Lo que cada usuario ya tenga como favorito no se modifica.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmando(false)}>Cancelar</Button>
          <Button variant="contained" onClick={() => clonar(destinos)}>
            Clonar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClonarFavoritos;
