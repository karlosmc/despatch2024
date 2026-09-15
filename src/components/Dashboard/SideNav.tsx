import { Dispatch, ReactNode, SetStateAction } from 'react'
import { Menu, MenuItem, Sidebar } from 'react-pro-sidebar'
import { Avatar, Box, Chip, Theme, Typography, alpha, useMediaQuery, useTheme } from '@mui/material'
import { Link, useLocation } from 'react-router-dom'

import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded'
import InventoryRoundedIcon from '@mui/icons-material/InventoryRounded'
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded'
import PeopleRoundedIcon from '@mui/icons-material/PeopleRounded'
import EngineeringRoundedIcon from '@mui/icons-material/EngineeringRounded'
import RecentActorsRoundedIcon from '@mui/icons-material/RecentActorsRounded'
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded'
import SpaceDashboardRoundedIcon from '@mui/icons-material/SpaceDashboardRounded'
import PostAddRoundedIcon from '@mui/icons-material/PostAddRounded'
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded'
import SettingsApplicationsRoundedIcon from '@mui/icons-material/SettingsApplicationsRounded'
import GpsFixedRoundedIcon from '@mui/icons-material/GpsFixedRounded'
import NumbersRoundedIcon from '@mui/icons-material/NumbersRounded'
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'

import { useAuthStore } from '../../store/authStore'
import { inicialesDe } from './AppHeader'

interface SideNavInterface {
  toggle: boolean;
  setToggle: Dispatch<SetStateAction<boolean>>
}

type Perfil = string | undefined

interface ItemMenu {
  to: string;
  label: string;
  icon: ReactNode;
  /** Por defecto la ruta exacta o cualquiera que cuelgue de ella. */
  coincide?: (pathname: string) => boolean;
}

interface SeccionMenu {
  titulo: string;
  visible?: (perfil: Perfil) => boolean;
  items: ItemMenu[];
}

const noOperador = (perfil: Perfil) => perfil !== 'operador'
const soloAdmin = (perfil: Perfil) => perfil === 'admin'

/** Mismas rutas y permisos que antes; lo más usado (guías) va primero. */
const SECCIONES: SeccionMenu[] = [
  {
    titulo: 'General',
    visible: noOperador,
    items: [
      { to: '/admin', label: 'Dashboard', icon: <DashboardRoundedIcon />, coincide: (p) => p === '/admin' },
    ],
  },
  {
    titulo: 'Guías',
    items: [
      { to: '/admin/guias', label: 'Panel de guías', icon: <SpaceDashboardRoundedIcon /> },
      { to: '/admin/guiaremision/nueva', label: 'Emitir guía', icon: <AutoAwesomeRoundedIcon /> },
      {
        to: '/admin/guiaremision',
        label: 'Emisión clásica',
        icon: <PostAddRoundedIcon />,
        coincide: (p) => p === '/admin/guiaremision' || p.startsWith('/admin/guiaremision/edit'),
      },
    ],
  },
  {
    titulo: 'Catálogos',
    visible: noOperador,
    items: [
      { to: '/admin/productos', label: 'Productos', icon: <InventoryRoundedIcon /> },
      { to: '/admin/puntos', label: 'Puntos de ubicación', icon: <LocationOnRoundedIcon /> },
      { to: '/admin/personas', label: 'Personas', icon: <PeopleRoundedIcon /> },
      { to: '/admin/transportista', label: 'Transportistas', icon: <EngineeringRoundedIcon /> },
      { to: '/admin/conductores', label: 'Conductores', icon: <RecentActorsRoundedIcon /> },
      { to: '/admin/vehiculos', label: 'Vehículos', icon: <LocalShippingRoundedIcon /> },
    ],
  },
  {
    titulo: 'Reportes',
    visible: noOperador,
    items: [{ to: '/admin/reportes', label: 'Reportes', icon: <BarChartRoundedIcon /> }],
  },
  {
    titulo: 'Configuración',
    visible: soloAdmin,
    items: [
      { to: '/admin/puntoemision', label: 'Puntos de emisión', icon: <GpsFixedRoundedIcon /> },
      { to: '/admin/numeracion', label: 'Numeración', icon: <NumbersRoundedIcon /> },
      { to: '/admin/sunat', label: 'Parámetros SUNAT', icon: <SettingsApplicationsRoundedIcon /> },
    ],
  },
]

const estaActivo = (item: ItemMenu, pathname: string) =>
  item.coincide ? item.coincide(pathname) : pathname === item.to || pathname.startsWith(`${item.to}/`)

const SideNav = ({ toggle, setToggle }: SideNavInterface) => {
  const theme = useTheme()
  const location = useLocation()
  const isMedium = useMediaQuery((t: Theme) => t.breakpoints.down('md'))

  const user = useAuthStore(state => state.user)
  const perfil: Perfil = user?.perfil

  const secciones = SECCIONES.filter((seccion) => !seccion.visible || seccion.visible(perfil))

  // En móvil el menú es un cajón: se cierra al elegir una opción.
  const alNavegar = () => {
    if (isMedium) setToggle(false)
  }

  return (
    <Sidebar
      style={{ height: '100%', top: 'auto', borderRightColor: theme.palette.divider }}
      onBackdropClick={() => setToggle(false)}
      breakPoint={isMedium ? 'all' : 'md'}
      backgroundColor={theme.palette.background.paper}
      toggled={toggle}
    >
      <Box display='flex' alignItems='center' gap={1.5} px={2.5} py={3}>
        <Avatar sx={{ width: 42, height: 42, fontWeight: 700, bgcolor: 'primary.main' }}>
          {inicialesDe(user?.name)}
        </Avatar>
        <Box minWidth={0}>
          <Typography variant='body2' fontWeight={700} noWrap>{user?.name || 'Usuario'}</Typography>
          <Typography variant='caption' color='text.secondary' noWrap display='block'>
            Guías electrónicas
          </Typography>
          {perfil && (
            <Chip size='small' label={perfil} sx={{ mt: 0.5, height: 20, fontSize: 11, textTransform: 'capitalize' }} />
          )}
        </Box>
      </Box>

      <Menu
        menuItemStyles={{
          button: ({ active }) => ({
            margin: '2px 10px',
            height: 42,
            borderRadius: 10,
            color: active ? theme.palette.primary.main : theme.palette.text.primary,
            fontWeight: active ? 700 : 500,
            backgroundColor: active ? alpha(theme.palette.primary.main, 0.14) : 'transparent',
            '&:hover': {
              backgroundColor: active
                ? alpha(theme.palette.primary.main, 0.2)
                : alpha(theme.palette.text.primary, 0.06),
            },
          }),
          icon: ({ active }) => ({
            color: active ? theme.palette.primary.main : theme.palette.text.secondary,
          }),
          label: { fontSize: 14 },
        }}
      >
        {secciones.map((seccion) => (
          <Box key={seccion.titulo} mb={1.5}>
            <Typography
              variant='overline'
              color='text.secondary'
              sx={{ px: 3, display: 'block', opacity: 0.7, letterSpacing: 1, lineHeight: 2.2 }}
            >
              {seccion.titulo}
            </Typography>
            {seccion.items.map((item) => (
              <MenuItem
                key={item.to}
                active={estaActivo(item, location.pathname)}
                component={<Link to={item.to} />}
                icon={item.icon}
                onClick={alNavegar}
              >
                {item.label}
              </MenuItem>
            ))}
          </Box>
        ))}
      </Menu>
    </Sidebar>
  )
}

export default SideNav
