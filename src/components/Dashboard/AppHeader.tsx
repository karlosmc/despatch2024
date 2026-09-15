import { Dispatch, MouseEvent, SetStateAction, useState } from 'react'
import {
  AppBar,
  Avatar,
  Box,
  ButtonBase,
  Chip,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'

import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded'
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded'
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded'
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded'
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded'

import { useThemeContext } from '../../context/themeProvider'
import { useAuthStore } from '../../store/authStore'

interface AppHeaderInterface {
  toggle: boolean;
  setToggle: Dispatch<SetStateAction<boolean>>
}

/** Título de la barra según la ruta (el más específico primero). */
const TITULOS: [string, string][] = [
  ['/admin/guiaremision/nueva/', 'Editar guía'],
  ['/admin/guiaremision/nueva', 'Emitir guía'],
  ['/admin/guiaremision/edit', 'Editar guía'],
  ['/admin/guiaremision', 'Emisión clásica'],
  ['/admin/guias', 'Panel de guías'],
  ['/admin/productos', 'Productos'],
  ['/admin/puntos', 'Puntos de ubicación'],
  ['/admin/personas', 'Personas'],
  ['/admin/transportista', 'Transportistas'],
  ['/admin/conductores', 'Conductores'],
  ['/admin/vehiculos', 'Vehículos'],
  ['/admin/reportes', 'Reportes'],
  ['/admin/puntoemision', 'Puntos de emisión'],
  ['/admin/numeracion', 'Numeración'],
  ['/admin/sunat', 'Parámetros SUNAT'],
  ['/admin/migraciones', 'Migraciones'],
  ['/admin', 'Dashboard'],
];

const logo = import.meta.env.VITE_API_LOGO

const tituloDeRuta = (pathname: string) =>
  TITULOS.find(([prefijo]) => pathname === prefijo || pathname.startsWith(prefijo))?.[1] || ''

export const inicialesDe = (nombre?: string) =>
  (nombre || 'U')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() || '')
    .join('') || 'U'

const etiquetaPerfil = (perfil?: string) =>
  perfil ? perfil.charAt(0).toUpperCase() + perfil.slice(1) : ''

const AppHeader = ({ toggle, setToggle }: AppHeaderInterface) => {
  const theme = useTheme()
  const location = useLocation()
  const navigate = useNavigate()

  const user = useAuthStore(state => state.user)
  const logout = useAuthStore(state => state.logout)
  const { mode, toggleColorMode } = useThemeContext()

  const [anclaMenu, setAnclaMenu] = useState<null | HTMLElement>(null)
  const abrirMenu = (event: MouseEvent<HTMLElement>) => setAnclaMenu(event.currentTarget)
  const cerrarMenu = () => setAnclaMenu(null)

  const titulo = tituloDeRuta(location.pathname)

  return (
    <AppBar
      position='sticky'
      color='inherit'
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        backgroundColor: alpha(theme.palette.background.paper, 0.85),
        backdropFilter: 'blur(10px)',
        borderBottom: `1px solid ${theme.palette.divider}`,
        color: 'text.primary',
      }}
    >
      <Toolbar sx={{ gap: 1 }}>
        <IconButton onClick={() => setToggle(!toggle)} aria-label='Abrir o cerrar el menú' edge='start'>
          <MenuRoundedIcon />
        </IconButton>

        <Box
          component='img'
          alt='Logo de la empresa'
          src={`/assets/img/${logo}`}
          onClick={() => navigate('/')}
          sx={{ borderRadius: 2, height: { xs: 32, sm: 38 }, cursor: 'pointer', ml: 0.5 }}
        />

        {titulo && (
          <>
            <Divider orientation='vertical' flexItem sx={{ mx: 1, my: 1.5, display: { xs: 'none', sm: 'block' } }} />
            <Typography variant='subtitle1' fontWeight={700} noWrap sx={{ display: { xs: 'none', sm: 'block' } }}>
              {titulo}
            </Typography>
          </>
        )}

        <Box sx={{ flexGrow: 1 }} />

        <Tooltip title={mode === 'dark' ? 'Cambiar a colores claros' : 'Cambiar a colores oscuros'}>
          <IconButton onClick={toggleColorMode} aria-label='Cambiar tema'>
            {mode === 'dark' ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
          </IconButton>
        </Tooltip>

        <ButtonBase
          onClick={abrirMenu}
          aria-label='Menú de usuario'
          sx={{
            gap: 1,
            pl: 0.5,
            pr: { xs: 0.5, sm: 1 },
            py: 0.5,
            borderRadius: 999,
            border: `1px solid ${theme.palette.divider}`,
            '&:hover': { backgroundColor: alpha(theme.palette.text.primary, 0.05) },
          }}
        >
          <Avatar sx={{ width: 32, height: 32, fontSize: 13, fontWeight: 700, bgcolor: 'primary.main' }}>
            {inicialesDe(user?.name)}
          </Avatar>
          <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'left', maxWidth: 160 }}>
            <Typography variant='body2' fontWeight={700} noWrap lineHeight={1.2}>
              {user?.name || 'Usuario'}
            </Typography>
            <Typography variant='caption' color='text.secondary' noWrap display='block' lineHeight={1.2}>
              {etiquetaPerfil(user?.perfil)}
            </Typography>
          </Box>
          <KeyboardArrowDownRoundedIcon fontSize='small' sx={{ display: { xs: 'none', sm: 'block' }, color: 'text.secondary' }} />
        </ButtonBase>

        <Menu
          anchorEl={anclaMenu}
          open={Boolean(anclaMenu)}
          onClose={cerrarMenu}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{ sx: { mt: 1, minWidth: 240, borderRadius: 2.5, border: `1px solid ${theme.palette.divider}` } }}
        >
          <Box px={2} py={1.5}>
            <Typography variant='subtitle2' fontWeight={700}>{user?.name || 'Usuario'}</Typography>
            {(user?.email || user?.documento) && (
              <Typography variant='caption' color='text.secondary' display='block'>
                {user?.email || user?.documento}
              </Typography>
            )}
            {user?.perfil && (
              <Chip size='small' label={etiquetaPerfil(user.perfil)} color='primary' variant='outlined' sx={{ mt: 1 }} />
            )}
          </Box>
          <Divider />
          {user?.perfil === 'admin' && (
            <MenuItem onClick={() => { cerrarMenu(); navigate('/admin/sunat') }}>
              <ListItemIcon><SettingsRoundedIcon fontSize='small' /></ListItemIcon>
              <ListItemText>Parámetros SUNAT</ListItemText>
            </MenuItem>
          )}
          <MenuItem onClick={() => { cerrarMenu(); logout() }}>
            <ListItemIcon><LogoutRoundedIcon fontSize='small' color='error' /></ListItemIcon>
            <ListItemText primaryTypographyProps={{ color: 'error' }}>Cerrar sesión</ListItemText>
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  )
}

export default AppHeader
