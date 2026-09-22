import { useState, MouseEvent } from 'react'
import {
  Box,
  ButtonBase,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Popover,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material'

import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'

import { useOperacionStore } from '../../store/operacionStore'
import { useAuthStore } from '../../store/authStore'

const Dato = ({ etiqueta, valor }: { etiqueta: string; valor?: string | null }) => (
  <Box display='flex' justifyContent='space-between' gap={2} py={0.4}>
    <Typography variant='caption' color='text.secondary'>
      {etiqueta}
    </Typography>
    <Typography variant='caption' fontWeight={600} textAlign='right' sx={{ maxWidth: 210 }}>
      {valor || '—'}
    </Typography>
  </Box>
)

/**
 * Lo que el usuario tiene asignado para emitir: punto, serie, vehículos y chofer.
 * Se carga al entrar al sistema; aquí sólo se muestra.
 */
const DatosTrabajo = () => {
  const theme = useTheme()
  const user = useAuthStore((state) => state.user)
  const { estado, error, avisos, puntos, puntoId, serie, conductor } = useOperacionStore()

  const [ancla, setAncla] = useState<null | HTMLElement>(null)
  const abrir = (e: MouseEvent<HTMLElement>) => setAncla(e.currentTarget)
  const cerrar = () => setAncla(null)

  if (estado === 'vacio') return null

  const punto = puntos.find((p) => p.id === puntoId)
  const principal = serie?.primario?.placa || ''
  const secundarias = (serie?.secundario || []).map((v) => v?.placa).filter(Boolean) as string[]
  const placas = [principal, ...secundarias].filter(Boolean)
  const numero = serie?.serie ? `${serie.serie}-${Number(serie.numeroActual ?? 0) + 1}` : ''
  const hayProblema = estado === 'error' || avisos.length > 0

  const resumen = estado === 'cargando' ? 'Cargando…' : [numero, placas[0]].filter(Boolean).join(' · ') || 'Sin datos'

  return (
    <>
      <Tooltip title='Tus datos de emisión'>
        <ButtonBase
          onClick={abrir}
          aria-label='Ver tus datos de emisión'
          sx={{
            gap: 0.75,
            px: 1,
            py: 0.5,
            borderRadius: 999,
            border: `1px solid ${hayProblema ? theme.palette.warning.main : theme.palette.divider}`,
            maxWidth: { xs: 150, sm: 280 },
            '&:hover': { backgroundColor: alpha(theme.palette.text.primary, 0.05) },
          }}
        >
          {estado === 'cargando' ? (
            <CircularProgress size={16} />
          ) : hayProblema ? (
            <WarningAmberRoundedIcon fontSize='small' color='warning' />
          ) : (
            <LocalShippingRoundedIcon fontSize='small' color='primary' />
          )}
          <Typography variant='caption' fontWeight={700} noWrap>
            {resumen}
          </Typography>
        </ButtonBase>
      </Tooltip>

      <Popover
        open={Boolean(ancla)}
        anchorEl={ancla}
        onClose={cerrar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ sx: { mt: 1, p: 1.5, minWidth: 290, borderRadius: 2.5, border: `1px solid ${theme.palette.divider}` } }}
      >
        <Box display='flex' alignItems='center' justifyContent='space-between' mb={0.5}>
          <Typography variant='subtitle2' fontWeight={700}>
            Tus datos de emisión
          </Typography>
          <Tooltip title='Volver a cargar'>
            <span>
              <IconButton
                size='small'
                disabled={estado === 'cargando'}
                onClick={() => {
                  useOperacionStore.getState().clearAll()
                  useOperacionStore.getState().cargar(user)
                }}
                aria-label='Volver a cargar'
              >
                <RefreshRoundedIcon fontSize='small' />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
        <Divider sx={{ mb: 0.5 }} />

        <Dato etiqueta='Punto de emisión' valor={punto?.nombre} />
        <Dato etiqueta='Serie y correlativo' valor={numero} />
        <Dato etiqueta='Chofer' valor={conductor ? `${conductor.nombres} ${conductor.apellidos}` : ''} />
        <Dato etiqueta='Licencia' valor={conductor?.licencia} />

        <Box mt={0.75}>
          <Typography variant='caption' color='text.secondary'>
            Vehículos
          </Typography>
          <Box display='flex' flexWrap='wrap' gap={0.5} mt={0.5}>
            {placas.length === 0 && (
              <Typography variant='caption' fontWeight={600}>
                —
              </Typography>
            )}
            {placas.map((placa, i) => (
              <Chip key={placa} size='small' label={placa} color={i === 0 ? 'primary' : 'default'} variant={i === 0 ? 'filled' : 'outlined'} />
            ))}
          </Box>
        </Box>

        {(error || avisos.length > 0) && (
          <Box mt={1}>
            {error && (
              <Typography variant='caption' color='error.main' display='block'>
                {error}
              </Typography>
            )}
            {avisos.map((aviso) => (
              <Typography key={aviso} variant='caption' color='warning.main' display='block'>
                {aviso}
              </Typography>
            ))}
          </Box>
        )}

        <Typography variant='caption' color='text.secondary' display='block' mt={1}>
          En la guía rápida puedes cambiar el punto, la serie o los vehículos.
        </Typography>
      </Popover>
    </>
  )
}

export default DatosTrabajo
