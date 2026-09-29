import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'

import EditRoundedIcon from '@mui/icons-material/EditRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded'

import { useAuthStore } from '../store/authStore'
import { useOperacionStore } from '../store/operacionStore'
import { useNotification } from '../context/notification.context'
import { NumeracionService } from '../service/NumeracionService'
import { PuntoEmisionService } from '../service/PuntoEmisionService'
import { VehiculoService } from '../service/VehiculoService'
import { UserService, UsuarioResumen } from '../service/UserService'
import { numeracion } from '../types/numeracion.interface'
import { puntoEmision } from '../types/puntoemision.interface'
import { vehiculo } from '../types/vehiculo.interface'
import { User } from '../types/user.interface'

/**
 * Punto de emisión, usuarios, serie y vehículos son una sola cadena: el usuario
 * entra por su punto, el punto tiene series y cada serie lleva su tracto y su
 * cisterna. Esta pantalla los muestra juntos y deja cambiarlos o intercambiarlos
 * sin ir a tres formularios distintos.
 */

type Vista = 'series' | 'usuarios'

interface Fila {
  serie: numeracion
  punto?: puntoEmision
  usuarios: User[]
  primaria: string
  secundaria: string
}

const placaDe = (v?: { placa?: string } | null) => (v?.placa || '').toUpperCase()

const textoFila = (f: Fila) =>
  [
    f.serie.serie,
    f.serie.nombre,
    f.punto?.nombre,
    f.punto?.codigo,
    f.primaria,
    f.secundaria,
    ...f.usuarios.map((u) => `${u.name} ${u.documento}`),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

const Asignaciones = () => {
  const theme = useTheme()
  const { getError, getSuccess } = useNotification()
  const user = useAuthStore((state) => state.user)
  const esAdmin = user?.perfil === 'admin'

  const [series, setSeries] = useState<numeracion[]>([])
  const [puntos, setPuntos] = useState<puntoEmision[]>([])
  const [vehiculos, setVehiculos] = useState<vehiculo[]>([])
  const [usuarios, setUsuarios] = useState<UsuarioResumen[]>([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [busqueda, setBusqueda] = useState('')
  const [vista, setVista] = useState<Vista>('series')

  const [editando, setEditando] = useState<Fila | null>(null)
  const [intercambio, setIntercambio] = useState(false)

  const cargar = async () => {
    setCargando(true)
    setError(null)
    try {
      // Una petición tras otra: el backend atiende de a una.
      const listaSeries = await NumeracionService.get()
      const listaPuntos = await PuntoEmisionService.get('')
      const listaVehiculos = await VehiculoService.get('')
      const listaUsuarios = await UserService.buscar('')

      setSeries(Array.isArray(listaSeries?.data) ? listaSeries.data : [])
      setPuntos(Array.isArray(listaPuntos?.data) ? listaPuntos.data : [])
      setVehiculos(Array.isArray(listaVehiculos?.data) ? listaVehiculos.data : [])
      setUsuarios(listaUsuarios)
    } catch (e) {
      setError(typeof e === 'string' ? e : 'No se pudieron cargar las asignaciones')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    if (esAdmin) cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [esAdmin])

  const filas = useMemo<Fila[]>(
    () =>
      series.map((serie) => {
        const punto = puntos.find((p) => p.id === serie.id_puntoemision)
        return {
          serie,
          punto,
          usuarios: punto?.users || [],
          primaria: placaDe(serie.primario),
          secundaria: placaDe(serie.secundario?.[0]),
        }
      }),
    [series, puntos]
  )

  const visibles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    if (!texto) return filas
    return filas.filter((f) => textoFila(f).includes(texto))
  }, [filas, busqueda])

  /** Mismo dato visto al revés: qué usa cada usuario. */
  const porUsuario = useMemo(() => {
    const mapa = new Map<number, { usuario: User; filas: Fila[] }>()
    visibles.forEach((fila) => {
      fila.usuarios.forEach((u) => {
        if (!u?.id) return
        const actual = mapa.get(u.id) || { usuario: u, filas: [] }
        actual.filas.push(fila)
        mapa.set(u.id, actual)
      })
    })
    return Array.from(mapa.values()).sort((a, b) => (a.usuario.name || '').localeCompare(b.usuario.name || ''))
  }, [visibles])

  if (!esAdmin) return <Navigate to="/admin/guias" replace />

  /** Tras cualquier cambio, los datos del header (serie y placas) quedan viejos. */
  const refrescarTodo = async () => {
    await cargar()
    void useOperacionStore.getState().refrescarSerie()
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 1.5, sm: 3 }, py: { xs: 2, sm: 3 } }}>
      <Box mb={2} display="flex" flexWrap="wrap" alignItems="center" justifyContent="space-between" gap={1.5}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Asignaciones
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Punto de emisión, usuarios, serie y vehículos en un solo lugar.
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={vista}
            onChange={(_, nueva: Vista | null) => nueva && setVista(nueva)}
          >
            <ToggleButton value="series">Por serie</ToggleButton>
            <ToggleButton value="usuarios">Por usuario</ToggleButton>
          </ToggleButtonGroup>
          <Button
            variant="outlined"
            startIcon={<SwapHorizRoundedIcon />}
            onClick={() => setIntercambio(true)}
            disabled={series.length < 2}
          >
            Intercambiar
          </Button>
        </Box>
      </Box>

      <Box display="flex" gap={1} mb={1.5}>
        <TextField
          size="small"
          fullWidth
          placeholder="Buscar por serie, punto, usuario o placa"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRoundedIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <Tooltip title="Recargar">
          <span>
            <IconButton onClick={cargar} disabled={cargando} aria-label="Recargar">
              <RefreshRoundedIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 1.5 }} action={<Button color="inherit" size="small" onClick={cargar}>Reintentar</Button>}>
          {error}
        </Alert>
      )}

      {cargando ? (
        <Box py={8} textAlign="center">
          <CircularProgress />
        </Box>
      ) : vista === 'series' ? (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small" aria-label="Asignaciones por serie">
            <TableHead>
              <TableRow>
                <TableCell>Serie</TableCell>
                <TableCell>Punto de emisión</TableCell>
                <TableCell>Usuarios</TableCell>
                <TableCell>Tracto</TableCell>
                <TableCell>Cisterna</TableCell>
                <TableCell align="right" />
              </TableRow>
            </TableHead>
            <TableBody>
              {visibles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    {busqueda ? 'Nada coincide con la búsqueda' : 'No hay series registradas'}
                  </TableCell>
                </TableRow>
              )}
              {visibles.map((fila) => (
                <TableRow key={fila.serie.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={700}>
                      {fila.serie.serie}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {fila.serie.nombre} · siguiente {Number(fila.serie.numeroActual ?? 0) + 1}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {fila.punto ? (
                      <>
                        <Typography variant="body2">{fila.punto.nombre}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {fila.punto.codigo}
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="caption" color="warning.main">
                        Sin punto
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                      {fila.usuarios.length === 0 && (
                        <Typography variant="caption" color="warning.main">
                          Sin usuarios
                        </Typography>
                      )}
                      {fila.usuarios.map((u) => (
                        <Chip key={u.id} size="small" variant="outlined" label={u.name} />
                      ))}
                    </Box>
                  </TableCell>
                  <TableCell>
                    {fila.primaria || <Typography variant="caption" color="warning.main">—</Typography>}
                  </TableCell>
                  <TableCell>
                    {fila.secundaria || <Typography variant="caption" color="warning.main">—</Typography>}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Cambiar asignación">
                      <IconButton color="primary" size="small" onClick={() => setEditando(fila)} aria-label={`Editar ${fila.serie.serie}`}>
                        <EditRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Box display="flex" flexDirection="column" gap={1}>
          {porUsuario.length === 0 && (
            <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
              Ningún usuario tiene puntos con series asignadas
            </Paper>
          )}
          {porUsuario.map(({ usuario, filas: suyas }) => (
            <Paper key={usuario.id} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
              <Box display="flex" alignItems="center" gap={1} mb={0.75}>
                <Typography variant="subtitle2" fontWeight={700}>
                  {usuario.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {usuario.documento}
                </Typography>
              </Box>
              <Box display="flex" flexDirection="column" gap={0.5}>
                {suyas.map((f) => (
                  <Box
                    key={f.serie.id}
                    display="flex"
                    flexWrap="wrap"
                    alignItems="center"
                    gap={0.75}
                    sx={{ p: 0.75, borderRadius: 1.5, bgcolor: alpha(theme.palette.text.primary, 0.04) }}
                  >
                    <Chip size="small" color="primary" label={f.serie.serie} />
                    <Typography variant="caption" color="text.secondary">
                      {f.punto?.nombre}
                    </Typography>
                    <Box flex={1} />
                    <Chip size="small" variant="outlined" label={f.primaria || 'sin tracto'} />
                    <Chip size="small" variant="outlined" color={f.secundaria ? 'default' : 'warning'} label={f.secundaria || 'sin cisterna'} />
                    <Tooltip title="Cambiar asignación">
                      <IconButton size="small" onClick={() => setEditando(f)} aria-label={`Editar ${f.serie.serie}`}>
                        <EditRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                ))}
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      {editando && (
        <DialogoAsignacion
          fila={editando}
          puntos={puntos}
          vehiculos={vehiculos}
          usuarios={usuarios}
          onCerrar={() => setEditando(null)}
          onGuardado={async (mensaje) => {
            setEditando(null)
            getSuccess(mensaje)
            await refrescarTodo()
          }}
          onError={getError}
        />
      )}

      {intercambio && (
        <DialogoIntercambio
          filas={filas}
          onCerrar={() => setIntercambio(false)}
          onHecho={async (mensaje) => {
            setIntercambio(false)
            getSuccess(mensaje)
            await refrescarTodo()
          }}
          onError={getError}
        />
      )}
    </Box>
  )
}

/* ------------------------------------------------------------------ */
/* Cambiar la asignación de una serie                                   */
/* ------------------------------------------------------------------ */

interface DialogoAsignacionProps {
  fila: Fila
  puntos: puntoEmision[]
  vehiculos: vehiculo[]
  usuarios: UsuarioResumen[]
  onCerrar: () => void
  onGuardado: (mensaje: string) => void
  onError: (mensaje: string) => void
}

const DialogoAsignacion = ({ fila, puntos, vehiculos, usuarios, onCerrar, onGuardado, onError }: DialogoAsignacionProps) => {
  const [idPunto, setIdPunto] = useState<number>(fila.serie.id_puntoemision || 0)
  const [idPrimario, setIdPrimario] = useState<number>(fila.serie.primario?.id || 0)
  const [idSecundario, setIdSecundario] = useState<number>(fila.serie.secundario?.[0]?.id || 0)
  const [elegidos, setElegidos] = useState<UsuarioResumen[]>(() =>
    usuarios.filter((u) => (fila.usuarios || []).some((x) => x.id === u.id))
  )
  const [guardando, setGuardando] = useState(false)

  const puntoOriginal = fila.serie.id_puntoemision
  const cambioDePunto = idPunto !== puntoOriginal
  // Los usuarios se guardan en el punto: si la serie se mueve, se editan los del punto nuevo.
  const puntoDeUsuarios = puntos.find((p) => p.id === idPunto)

  const tractos = vehiculos.filter((v) => v.tracto ?? true)
  const cisternas = vehiculos.filter((v) => !(v.tracto ?? true))

  const opcionVehiculo = (v: vehiculo) => `${v.placa}${v.nombreCorto ? ` · ${v.nombreCorto}` : ''}${v.glp ? ' · GLP' : ''}`

  const guardar = async () => {
    if (guardando) return
    setGuardando(true)
    try {
      const primario = vehiculos.find((v) => v.id === idPrimario)
      await NumeracionService.update(
        {
          ...fila.serie,
          id_puntoemision: idPunto,
          primario: primario ? { ...(fila.serie.primario || {}), id: primario.id, placa: primario.placa } : undefined,
        } as numeracion,
        idSecundario || null
      )

      // Usuarios: se guardan en el punto de emisión, no en la serie.
      const usuariosPrevios = (puntoDeUsuarios?.users || []).map((u) => u.id).sort()
      const usuariosNuevos = elegidos.map((u) => u.id).sort()
      const cambiaronUsuarios = JSON.stringify(usuariosPrevios) !== JSON.stringify(usuariosNuevos)

      if (puntoDeUsuarios && cambiaronUsuarios) {
        await PuntoEmisionService.update({ ...puntoDeUsuarios, users: elegidos as unknown as User[] })
      }

      onGuardado(`Asignación de ${fila.serie.serie} actualizada`)
    } catch (error) {
      onError(typeof error === 'string' ? error : 'No se pudo guardar la asignación')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <Dialog open onClose={guardando ? undefined : onCerrar} fullWidth maxWidth="sm">
      <DialogTitle>Serie {fila.serie.serie}</DialogTitle>
      <DialogContent dividers>
        <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: 'repeat(2, minmax(0,1fr))' }} gap={1.5} pt={0.5}>
          <TextField
            select
            size="small"
            label="Punto de emisión"
            value={idPunto || ''}
            onChange={(e) => setIdPunto(Number(e.target.value))}
            disabled={guardando}
            sx={{ gridColumn: '1 / -1' }}
          >
            {puntos.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.nombre} · {p.codigo}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            size="small"
            label="Tracto (vehículo 1)"
            value={idPrimario || ''}
            onChange={(e) => setIdPrimario(Number(e.target.value))}
            disabled={guardando}
          >
            <MenuItem value="">Sin asignar</MenuItem>
            {tractos.map((v) => (
              <MenuItem key={v.id} value={v.id}>
                {opcionVehiculo(v)}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            size="small"
            label="Cisterna (vehículo 2)"
            value={idSecundario || ''}
            onChange={(e) => setIdSecundario(Number(e.target.value))}
            disabled={guardando}
            helperText="Su placa es la que consulta el SCOP"
          >
            <MenuItem value="">Sin asignar</MenuItem>
            {cisternas.map((v) => (
              <MenuItem key={v.id} value={v.id}>
                {opcionVehiculo(v)}
              </MenuItem>
            ))}
          </TextField>

          <Box sx={{ gridColumn: '1 / -1' }}>
            <Divider sx={{ my: 0.5 }} />
            <Typography variant="caption" color="text.secondary" display="block" mb={0.75}>
              Usuarios del punto {puntoDeUsuarios?.nombre || ''} (entran con todas sus series)
            </Typography>
            <Autocomplete
              multiple
              size="small"
              options={usuarios}
              value={elegidos}
              onChange={(_, valor) => setElegidos(valor)}
              getOptionLabel={(u) => `${u.name}${u.documento ? ` · ${u.documento}` : ''}`}
              isOptionEqualToValue={(a, b) => a.id === b.id}
              disabled={guardando || !puntoDeUsuarios}
              renderInput={(params) => <TextField {...params} label="Usuarios" placeholder="Agregar" />}
            />
            {cambioDePunto && (
              <Alert severity="info" sx={{ mt: 1 }}>
                La serie pasa a otro punto de emisión: quienes entran con ella son los usuarios de ese punto.
              </Alert>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCerrar} disabled={guardando}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={guardar} disabled={guardando || !idPunto}>
          {guardando ? 'Guardando…' : 'Guardar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

/* ------------------------------------------------------------------ */
/* Intercambiar dos series                                              */
/* ------------------------------------------------------------------ */

type QueIntercambiar = 'vehiculos' | 'punto' | 'ambos'

interface DialogoIntercambioProps {
  filas: Fila[]
  onCerrar: () => void
  onHecho: (mensaje: string) => void
  onError: (mensaje: string) => void
}

const DialogoIntercambio = ({ filas, onCerrar, onHecho, onError }: DialogoIntercambioProps) => {
  const [idA, setIdA] = useState<number>(filas[0]?.serie.id || 0)
  const [idB, setIdB] = useState<number>(filas[1]?.serie.id || 0)
  const [que, setQue] = useState<QueIntercambiar>('vehiculos')
  const [guardando, setGuardando] = useState(false)

  const a = filas.find((f) => f.serie.id === idA)
  const b = filas.find((f) => f.serie.id === idB)

  const intercambiar = async () => {
    if (!a || !b || a.serie.id === b.serie.id || guardando) return
    setGuardando(true)
    try {
      const tocaVehiculos = que === 'vehiculos' || que === 'ambos'
      const tocaPunto = que === 'punto' || que === 'ambos'

      const nuevaA: numeracion = {
        ...a.serie,
        primario: tocaVehiculos ? b.serie.primario : a.serie.primario,
        id_puntoemision: tocaPunto ? b.serie.id_puntoemision : a.serie.id_puntoemision,
      }
      const nuevaB: numeracion = {
        ...b.serie,
        primario: tocaVehiculos ? a.serie.primario : b.serie.primario,
        id_puntoemision: tocaPunto ? a.serie.id_puntoemision : b.serie.id_puntoemision,
      }

      // Una tras otra: si la segunda falla, la primera ya quedó guardada y se avisa.
      await NumeracionService.update(nuevaA, (tocaVehiculos ? b : a).serie.secundario?.[0]?.id || null)
      await NumeracionService.update(nuevaB, (tocaVehiculos ? a : b).serie.secundario?.[0]?.id || null)

      onHecho(`${a.serie.serie} y ${b.serie.serie} intercambiadas`)
    } catch (error) {
      onError(
        typeof error === 'string'
          ? `${error}. Revisa cómo quedaron ambas series.`
          : 'No se pudo completar el intercambio. Revisa cómo quedaron ambas series.'
      )
    } finally {
      setGuardando(false)
    }
  }

  const resumen = (f?: Fila) =>
    f ? `${f.punto?.nombre || 'sin punto'} · ${f.primaria || 'sin tracto'} · ${f.secundaria || 'sin cisterna'}` : ''

  return (
    <Dialog open onClose={guardando ? undefined : onCerrar} fullWidth maxWidth="sm">
      <DialogTitle>Intercambiar asignaciones</DialogTitle>
      <DialogContent dividers>
        <ToggleButtonGroup
          exclusive
          fullWidth
          size="small"
          value={que}
          onChange={(_, valor: QueIntercambiar | null) => valor && setQue(valor)}
          sx={{ mb: 2 }}
          disabled={guardando}
        >
          <ToggleButton value="vehiculos">Vehículos</ToggleButton>
          <ToggleButton value="punto">Punto de emisión</ToggleButton>
          <ToggleButton value="ambos">Ambos</ToggleButton>
        </ToggleButtonGroup>

        <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr auto 1fr' }} alignItems="center" gap={1.5}>
          <TextField
            select
            size="small"
            label="Serie A"
            value={idA || ''}
            onChange={(e) => setIdA(Number(e.target.value))}
            disabled={guardando}
            helperText={resumen(a)}
          >
            {filas.map((f) => (
              <MenuItem key={f.serie.id} value={f.serie.id}>
                {f.serie.serie}
              </MenuItem>
            ))}
          </TextField>

          <SwapHorizRoundedIcon color="action" sx={{ justifySelf: 'center' }} />

          <TextField
            select
            size="small"
            label="Serie B"
            value={idB || ''}
            onChange={(e) => setIdB(Number(e.target.value))}
            disabled={guardando}
            helperText={resumen(b)}
          >
            {filas.map((f) => (
              <MenuItem key={f.serie.id} value={f.serie.id}>
                {f.serie.serie}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {idA === idB && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Elige dos series distintas.
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onCerrar} disabled={guardando}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={intercambiar} disabled={guardando || !a || !b || idA === idB}>
          {guardando ? 'Intercambiando…' : 'Intercambiar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default Asignaciones
