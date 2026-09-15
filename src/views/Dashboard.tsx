import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  ButtonBase,
  Card,
  CardContent,
  Chip,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import SpaceDashboardRoundedIcon from '@mui/icons-material/SpaceDashboardRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import InventoryRoundedIcon from '@mui/icons-material/InventoryRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import ScheduleSendRoundedIcon from '@mui/icons-material/ScheduleSendRounded';
import EditNoteRoundedIcon from '@mui/icons-material/EditNoteRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';

import { useAuthStore } from '../store/authStore';
import { useMiscStore } from '../store/miscStore';
import { useTokenParamsStore } from '../store/tokenParamsStore';
import { GuiaServices } from '../service/GuiaServices';
import { panelguia } from '../types/panelguia.interface';

type Periodo = 'hoy' | 'semana' | 'mes';
type Color = 'success' | 'info' | 'warning' | 'error' | 'primary';

/** Estados electrónicos (los mismos del Panel de guías, más B de baja). */
const ETIQUETA_ESTADO: Record<string, { texto: string; color: Color }> = {
  G: { texto: 'Generada', color: 'warning' },
  S: { texto: 'Firmada', color: 'warning' },
  E: { texto: 'Enviada', color: 'info' },
  P: { texto: 'Pendiente', color: 'info' },
  F: { texto: 'Aceptada', color: 'success' },
  B: { texto: 'Anulada', color: 'error' },
};
const CODIGOS = Object.keys(ETIQUETA_ESTADO);

interface Resumen {
  total: number;
  porEstado: Record<string, number>;
  recientes: panelguia[];
  parcial: boolean;
}

const rangoDe = (periodo: Periodo) => {
  const hoy = dayjs();
  const desde =
    periodo === 'hoy' ? hoy : periodo === 'semana' ? hoy.subtract(6, 'day') : hoy.startOf('month');
  const hasta = periodo === 'mes' ? hoy.endOf('month') : hoy;
  return { desde: desde.format('YYYY-MM-DD'), hasta: hasta.format('YYYY-MM-DD') };
};

const saludo = () => {
  const hora = dayjs().hour();
  if (hora < 12) return 'Buenos días';
  if (hora < 19) return 'Buenas tardes';
  return 'Buenas noches';
};

/** Una consulta con `per_page=1` basta para leer el total de cada estado. */
const consultar = async (base: URLSearchParams, extra: Record<string, string>) => {
  const qs = new URLSearchParams(base);
  Object.entries(extra).forEach(([clave, valor]) => qs.set(clave, valor));
  return GuiaServices.guias(`buscar?${qs.toString()}`);
};

/* ------------------------------------------------------------------ */

interface KpiProps {
  titulo: string;
  valor?: number;
  descripcion: string;
  icono: ReactNode;
  color: Color;
  cargando: boolean;
  onClick: () => void;
}

const Kpi = ({ titulo, valor, descripcion, icono, color, cargando, onClick }: KpiProps) => {
  const theme = useTheme();
  const tono = theme.palette[color].main;
  return (
    <Card sx={{ height: '100%' }}>
      <ButtonBase onClick={onClick} sx={{ width: '100%', height: '100%', textAlign: 'left', display: 'block' }}>
        <CardContent sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <Box
            sx={{
              display: 'grid',
              placeItems: 'center',
              width: 44,
              height: 44,
              flexShrink: 0,
              borderRadius: 2.5,
              color: tono,
              backgroundColor: alpha(tono, 0.14),
            }}
          >
            {icono}
          </Box>
          <Box minWidth={0}>
            <Typography variant='body2' color='text.secondary' fontWeight={600}>{titulo}</Typography>
            {cargando ? (
              <Skeleton width={56} height={40} />
            ) : (
              <Typography variant='h4' fontWeight={800} lineHeight={1.2}>{valor ?? '—'}</Typography>
            )}
            <Typography variant='caption' color='text.secondary'>{descripcion}</Typography>
          </Box>
        </CardContent>
      </ButtonBase>
    </Card>
  );
};

interface AccionProps {
  titulo: string;
  descripcion: string;
  icono: ReactNode;
  destacado?: boolean;
  onClick: () => void;
}

const Accion = ({ titulo, descripcion, icono, destacado, onClick }: AccionProps) => {
  const theme = useTheme();
  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        width: '100%',
        p: 1.75,
        textAlign: 'left',
        borderRadius: 3,
        border: `1px solid ${destacado ? 'transparent' : theme.palette.divider}`,
        background: destacado
          ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.75)})`
          : theme.palette.background.paper,
        color: destacado ? theme.palette.primary.contrastText : 'text.primary',
        transition: 'transform .15s ease, border-color .15s ease',
        '&:hover': { transform: 'translateY(-1px)', borderColor: destacado ? 'transparent' : theme.palette.primary.main },
      }}
    >
      <Box sx={{ display: 'grid', placeItems: 'center', opacity: destacado ? 1 : 0.85 }}>{icono}</Box>
      <Box flex={1} minWidth={0}>
        <Typography variant='body2' fontWeight={700}>{titulo}</Typography>
        <Typography variant='caption' sx={{ opacity: 0.8 }} display='block' noWrap>{descripcion}</Typography>
      </Box>
      <ChevronRightRoundedIcon sx={{ opacity: 0.6 }} />
    </ButtonBase>
  );
};

/* ------------------------------------------------------------------ */

const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const series = useMiscStore((state) => state.series);
  const params = useTokenParamsStore((state) => state.params);

  const esOperador = user?.perfil === 'operador';

  const [periodo, setPeriodo] = useState<Periodo>('mes');
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /** Descarta respuestas de un período anterior si el usuario cambió rápido. */
  const consultaActual = useRef(0);

  const cargar = useCallback(async () => {
    const ticket = ++consultaActual.current;
    setCargando(true);
    setError(null);

    const { desde, hasta } = rangoDe(periodo);
    const base = new URLSearchParams({ fecha_inicio: desde, fecha_fin: hasta, page: '1' });

    const [recientes, ...porCodigo] = await Promise.allSettled([
      consultar(base, { per_page: '6' }),
      ...CODIGOS.map((codigo) => consultar(base, { estado: codigo, per_page: '1' })),
    ]);

    if (ticket !== consultaActual.current) return;

    const fallidas = [recientes, ...porCodigo].filter((r) => r.status === 'rejected').length;
    if (fallidas === porCodigo.length + 1) {
      setError('No se pudo obtener el resumen de guías.');
      setResumen(null);
      setCargando(false);
      return;
    }

    const porEstado: Record<string, number> = {};
    CODIGOS.forEach((codigo, i) => {
      const r = porCodigo[i];
      porEstado[codigo] = r.status === 'fulfilled' ? Number(r.value?.pagination?.total ?? 0) : 0;
    });

    const datosRecientes = recientes.status === 'fulfilled' ? recientes.value : null;
    const lista: panelguia[] = Array.isArray(datosRecientes?.data) ? [...datosRecientes.data] : [];
    // Las más nuevas primero, sin depender del orden que devuelva el backend.
    lista.sort((a, b) => (b.fecha || '').localeCompare(a.fecha || '') || (b.id || 0) - (a.id || 0));

    const conocidos = Object.values(porEstado).reduce((suma, n) => suma + n, 0);
    const total = datosRecientes ? Number(datosRecientes?.pagination?.total ?? conocidos) : conocidos;

    setResumen({ total, porEstado, recientes: lista, parcial: fallidas > 0 });
    setCargando(false);
  }, [periodo]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  /* Agrupaciones que le importan a quien opera: qué salió, qué falta y qué está en SUNAT. */
  const grupos = useMemo(() => {
    const e = resumen?.porEstado || {};
    const conocidos = CODIGOS.reduce((suma, c) => suma + (e[c] || 0), 0);
    // Lo que no está en ningún estado conocido son guías guardadas sin procesar.
    const sinEstado = Math.max(0, (resumen?.total || 0) - conocidos);
    return {
      aceptadas: e.F || 0,
      enSunat: (e.E || 0) + (e.P || 0),
      sinEnviar: (e.G || 0) + (e.S || 0) + sinEstado,
      anuladas: e.B || 0,
    };
  }, [resumen]);

  const segmentos = [
    { clave: 'aceptadas', valor: grupos.aceptadas, color: theme.palette.success.main, texto: 'Aceptadas' },
    { clave: 'enSunat', valor: grupos.enSunat, color: theme.palette.info.main, texto: 'En SUNAT' },
    { clave: 'sinEnviar', valor: grupos.sinEnviar, color: theme.palette.warning.main, texto: 'Sin enviar' },
    { clave: 'anuladas', valor: grupos.anuladas, color: theme.palette.error.main, texto: 'Anuladas' },
  ];
  const sumaSegmentos = segmentos.reduce((s, x) => s + x.valor, 0);

  const irAlPanel = () => navigate('/admin/guias');
  const fecha = dayjs().locale('es').format('dddd, D [de] MMMM');

  return (
    <Box sx={{ maxWidth: 1300, mx: 'auto', px: { xs: 0.5, md: 1 }, py: { xs: 1, md: 2 } }}>
      {/* Encabezado */}
      <Box display='flex' flexWrap='wrap' alignItems='flex-end' justifyContent='space-between' gap={2} mb={3}>
        <Box>
          <Typography variant='body2' color='text.secondary' sx={{ textTransform: 'capitalize' }}>{fecha}</Typography>
          <Typography variant='h5' fontWeight={800}>
            {saludo()}, {user?.name?.split(' ')[0] || 'Usuario'}
          </Typography>
        </Box>
        <Box display='flex' alignItems='center' gap={1}>
          <ToggleButtonGroup
            size='small'
            exclusive
            value={periodo}
            onChange={(_, valor: Periodo | null) => valor && setPeriodo(valor)}
            aria-label='Período del resumen'
          >
            <ToggleButton value='hoy'>Hoy</ToggleButton>
            <ToggleButton value='semana'>7 días</ToggleButton>
            <ToggleButton value='mes'>Este mes</ToggleButton>
          </ToggleButtonGroup>
          <Tooltip title='Actualizar'>
            <span>
              <Button variant='outlined' size='small' onClick={cargar} disabled={cargando} sx={{ minWidth: 0, px: 1 }} aria-label='Actualizar'>
                <RefreshRoundedIcon fontSize='small' />
              </Button>
            </span>
          </Tooltip>
        </Box>
      </Box>

      {/* Acciones rápidas */}
      <Box
        display='grid'
        gridTemplateColumns={{ xs: 'minmax(0,1fr)', sm: 'repeat(2, minmax(0,1fr))', lg: 'repeat(4, minmax(0,1fr))' }}
        gap={1.5}
        mb={3}
      >
        <Accion destacado titulo='Emitir guía' descripcion='Nueva guía de remisión' icono={<AutoAwesomeRoundedIcon />} onClick={() => navigate('/admin/guiaremision/nueva')} />
        <Accion titulo='Panel de guías' descripcion='Estados, PDF y reenvíos' icono={<SpaceDashboardRoundedIcon />} onClick={irAlPanel} />
        {!esOperador && (
          <Accion titulo='Reportes' descripcion='Exportar y consultar' icono={<BarChartRoundedIcon />} onClick={() => navigate('/admin/reportes')} />
        )}
        {!esOperador && (
          <Accion titulo='Productos' descripcion='Catálogo y favoritos' icono={<InventoryRoundedIcon />} onClick={() => navigate('/admin/productos')} />
        )}
      </Box>

      {error && (
        <Alert
          severity='error'
          sx={{ mb: 3, borderRadius: 2 }}
          action={<Button color='inherit' size='small' onClick={cargar}>Reintentar</Button>}
        >
          {error}
        </Alert>
      )}
      {resumen?.parcial && !error && (
        <Alert severity='warning' sx={{ mb: 3, borderRadius: 2 }}>
          Algunos totales no se pudieron cargar; los números pueden estar incompletos.
        </Alert>
      )}

      {/* Indicadores */}
      <Box
        display='grid'
        gridTemplateColumns={{ xs: 'minmax(0,1fr)', sm: 'repeat(2, minmax(0,1fr))', lg: 'repeat(4, minmax(0,1fr))' }}
        gap={1.5}
        mb={3}
      >
        <Kpi titulo='Aceptadas' valor={resumen ? grupos.aceptadas : undefined} descripcion='Con CDR de SUNAT' icono={<TaskAltRoundedIcon />} color='success' cargando={cargando} onClick={irAlPanel} />
        <Kpi titulo='En SUNAT' valor={resumen ? grupos.enSunat : undefined} descripcion='Enviadas o con ticket pendiente' icono={<ScheduleSendRoundedIcon />} color='info' cargando={cargando} onClick={irAlPanel} />
        <Kpi titulo='Sin enviar' valor={resumen ? grupos.sinEnviar : undefined} descripcion='Guardadas, generadas o firmadas' icono={<EditNoteRoundedIcon />} color='warning' cargando={cargando} onClick={irAlPanel} />
        <Kpi titulo='Anuladas' valor={resumen ? grupos.anuladas : undefined} descripcion='Dadas de baja' icono={<BlockRoundedIcon />} color='error' cargando={cargando} onClick={irAlPanel} />
      </Box>

      <Box display='grid' gridTemplateColumns={{ xs: 'minmax(0,1fr)', md: 'minmax(0,2fr) minmax(0,1fr)' }} gap={2}>
        {/* Últimas guías */}
        <Card>
          <CardContent>
            <Box display='flex' justifyContent='space-between' alignItems='center' mb={1.5}>
              <Box>
                <Typography variant='subtitle1' fontWeight={700}>Últimas guías</Typography>
                <Typography variant='caption' color='text.secondary'>
                  {resumen ? `${resumen.total} en el período` : 'Del período elegido'}
                </Typography>
              </Box>
              <Button size='small' endIcon={<ChevronRightRoundedIcon />} onClick={irAlPanel}>Ver todas</Button>
            </Box>

            {/* Distribución por estado */}
            {!cargando && sumaSegmentos > 0 && (
              <Box mb={2}>
                <Box sx={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', bgcolor: alpha(theme.palette.text.primary, 0.08) }}>
                  {segmentos.filter((s) => s.valor > 0).map((s) => (
                    <Tooltip key={s.clave} title={`${s.texto}: ${s.valor}`}>
                      <Box sx={{ width: `${(s.valor / sumaSegmentos) * 100}%`, bgcolor: s.color }} />
                    </Tooltip>
                  ))}
                </Box>
                <Box display='flex' flexWrap='wrap' gap={1.5} mt={1}>
                  {segmentos.map((s) => (
                    <Box key={s.clave} display='flex' alignItems='center' gap={0.75}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: s.color }} />
                      <Typography variant='caption' color='text.secondary'>{s.texto} · {s.valor}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}

            {cargando ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} height={52} />)
            ) : !resumen || resumen.recientes.length === 0 ? (
              <Box py={4} textAlign='center' color='text.secondary'>
                <ReceiptLongRoundedIcon sx={{ fontSize: 40, opacity: 0.4 }} />
                <Typography variant='body2' mt={1}>No hay guías en este período.</Typography>
                <Button sx={{ mt: 1.5 }} variant='contained' startIcon={<AutoAwesomeRoundedIcon />} onClick={() => navigate('/admin/guiaremision/nueva')}>
                  Emitir la primera
                </Button>
              </Box>
            ) : (
              resumen.recientes.map((guia) => {
                const estado = ETIQUETA_ESTADO[guia.estado] || { texto: 'Sin enviar', color: 'warning' as Color };
                return (
                  <ButtonBase
                    key={guia.id ?? `${guia.serie}-${guia.numero}`}
                    onClick={() => guia.id_despatch && navigate(`/admin/guiaremision/nueva/${guia.id_despatch}`)}
                    sx={{
                      display: 'flex',
                      width: '100%',
                      gap: 1.5,
                      alignItems: 'center',
                      textAlign: 'left',
                      px: 1,
                      py: 1.25,
                      borderRadius: 2,
                      '&:hover': { backgroundColor: alpha(theme.palette.text.primary, 0.05) },
                    }}
                  >
                    <Box flex={1} minWidth={0}>
                      <Typography variant='body2' fontWeight={700}>{guia.serie}-{guia.numero}</Typography>
                      <Typography variant='caption' color='text.secondary' noWrap display='block'>
                        {guia.fecha ? dayjs(guia.fecha).format('DD/MM/YYYY') : ''}
                        {guia.descripcion ? ` · ${guia.descripcion}` : ''}
                      </Typography>
                    </Box>
                    <Chip size='small' label={estado.texto} color={estado.color} variant='outlined' />
                  </ButtonBase>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Estado del entorno */}
        <Card>
          <CardContent>
            <Typography variant='subtitle1' fontWeight={700} mb={1.5}>Tu entorno</Typography>
            {[
              {
                ok: Boolean(params),
                titulo: 'Parámetros SUNAT',
                detalle: params ? 'Cargados y listos para enviar' : 'No disponibles: no se podrán enviar guías',
              },
              {
                ok: (series?.length || 0) > 0,
                titulo: 'Series habilitadas',
                detalle: (series?.length || 0) > 0 ? `${series.length} serie(s) para tu usuario` : 'No tienes series asignadas',
              },
            ].map((item) => (
              <Box key={item.titulo} display='flex' gap={1.5} alignItems='flex-start' py={1}>
                {item.ok ? (
                  <CheckCircleRoundedIcon color='success' fontSize='small' sx={{ mt: 0.25 }} />
                ) : (
                  <ErrorOutlineRoundedIcon color='warning' fontSize='small' sx={{ mt: 0.25 }} />
                )}
                <Box>
                  <Typography variant='body2' fontWeight={600}>{item.titulo}</Typography>
                  <Typography variant='caption' color='text.secondary'>{item.detalle}</Typography>
                </Box>
              </Box>
            ))}
            {user?.perfil && (
              <Box mt={1.5}>
                <Chip size='small' label={`Perfil: ${user.perfil}`} sx={{ textTransform: 'capitalize' }} />
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Dashboard;
