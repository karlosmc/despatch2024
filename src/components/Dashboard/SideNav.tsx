import { Menu, MenuItem, Sidebar } from 'react-pro-sidebar'


import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import EngineeringIcon from '@mui/icons-material/Engineering';
import RecentActorsIcon from '@mui/icons-material/RecentActors';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard';
import PostAddIcon from '@mui/icons-material/PostAdd';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';

// import { StyleOutlined } from '@mui/icons-material';


import { Avatar, Box, SxProps, Theme, Typography, css, styled, useMediaQuery, useTheme } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';




interface AppHeaderInterface {
  toggle: boolean;
  setToggle: React.Dispatch<React.SetStateAction<Boolean>>

}

const MyMenu = styled(MenuItem)(({ theme }) => ({
  '& .ps-menu-button:hover': css({
    background: `${theme.palette.secondary.main} !important`
  })
}))

const SideNav = ({ toggle, setToggle }: AppHeaderInterface) => {

  // const {broken,collapseSidebar,toggleSidebar} = useProSidebar()

  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  const isMedium = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));



  const theme = useTheme();
  // const toolbarHeight = theme.mixins.toolbar;
  const location = useLocation();

  const { user } = useAuth({ middleware: '', url: '' })


  return (
    <Sidebar
      style={{
        height: '100%',
        top: 'auto'
      }}

      onBackdropClick={() => setToggle(false)}
      breakPoint={isMedium ? 'all' : 'md'}
      backgroundColor={isMobile || isMedium ? 'rgb(195,193,193)' : 'default'}

      toggled={toggle}
    // collapsed={sidebarCollapsed}

    >
      <Box sx={avatarContainer}>
        <Avatar sx={avatar} alt='avatar' src='/assets/img/avatars/avatar04.png' />
        {
          !isMobile ?
            <Typography variant='body2' sx={yourChannel}>{user?.name}</Typography>
            : null
        }
        {
          !isMobile ?
            <Typography variant='overline'>Guias Electrónicas</Typography>
            : null
        }
      </Box>
      <Menu
        menuItemStyles={{
          button: ({ active }) => {
            return {
              backgroundColor: active ? theme.palette.primary.main : undefined
            }
          }
        }}
      >
        <div style={{ flex: 1, marginBottom: '10px' }}>
          <div style={{ padding: '0 24px', marginBottom: '8px' }}>
            <Typography
              variant="body2"
              fontWeight={600}
              style={{ opacity: 0.5, letterSpacing: '0.5px' }}
            >
              Dashboard
            </Typography>
          </div>
        </div>
        <MyMenu active={location.pathname === '/'} component={<Link to="/" />} icon={<DashboardIcon  />}>
          <Typography variant='body2'>Dashboard</Typography>
        </MyMenu>

        <div style={{ flex: 1, marginBottom: '10px', marginTop: '10px' }}>
          <div style={{ padding: '0 24px', marginBottom: '8px' }}>
            <Typography
              variant="body2"
              fontWeight={600}
              style={{ opacity: 0.5, letterSpacing: '0.5px' }}
            >
              Tablas
            </Typography>
          </div>
        </div>

        <MyMenu active={location.pathname === '/admin/productos'} component={<Link to="/admin/productos" />} icon={<InventoryIcon  />}>
          <Typography variant='body2'>Productos</Typography>
        </MyMenu>
        <MyMenu active={location.pathname === '/admin/puntos'} component={<Link to="/admin/puntos" />} icon={<LocationOnIcon  />}>
          <Typography variant='body2'>Puntos de ubicación</Typography>
        </MyMenu>

        <MyMenu active={location.pathname === '/admin/personas'} component={<Link to="/admin/personas" />} icon={<PeopleIcon  />}>
          <Typography variant='body2'>Personas</Typography>
        </MyMenu>
        <MyMenu active={location.pathname === '/admin/transportista'} component={<Link to="/admin/transportista" />} icon={<EngineeringIcon  />}>
          <Typography variant='body2'>Transportistas</Typography>
        </MyMenu>
        <MyMenu active={location.pathname === '/admin/conductores'} component={<Link to="/admin/conductores" />} icon={<RecentActorsIcon  />}>
          <Typography variant='body2'>Conductores</Typography>
        </MyMenu>

        <MyMenu active={location.pathname === '/admin/vehiculos'} component={<Link to="/admin/vehiculos" />} icon={<LocalShippingIcon  />}>
          <Typography variant='body2'>Vehiculos</Typography>
        </MyMenu>

        <div style={{ flex: 1, marginBottom: '10px', marginTop: '10px' }}>
          <div style={{ padding: '0 24px', marginBottom: '8px' }}>
            <Typography
              variant="body2"
              fontWeight={600}
              style={{ opacity: 0.5, letterSpacing: '0.5px' }}
            >
              Guías
            </Typography>
          </div>
        </div>
        <MyMenu active={location.pathname === '/admin/guias'} component={<Link to="/admin/guias" />} icon={<SpaceDashboardIcon  />}>
          <Typography variant='body2'>Panel Guias</Typography>
        </MyMenu>

        {/* <MyMenu active={location.pathname === '/gre/guiaremision'} component={<a href="/gre/guiaremision" target='_blank' rel='noopener noreferrer' />} icon={<SourceOutlined />}>
          <Typography variant='body2'>Guias otra pestaña</Typography>
        </MyMenu> */}

        <MyMenu active={location.pathname === '/gre/guiaremision'} component={<Link to="/gre/guiaremision" />} icon={<PostAddIcon  />}>
          <Typography variant='body2'>Formulario Guías</Typography>
        </MyMenu>
        <div style={{ flex: 1, marginBottom: '10px', marginTop: '10px' }}>
          <div style={{ padding: '0 24px', marginBottom: '8px' }}>
            <Typography
              variant="body2"
              fontWeight={600}
              style={{ opacity: 0.5, letterSpacing: '0.5px' }}
            >
              Reportes
            </Typography>
          </div>
        </div>

        <MyMenu active={location.pathname === '/admin/reportes'} component={<Link to="/admin/reportes" />} icon={<BarChartIcon  />}>
          <Typography variant='body2'>Reportes</Typography>
        </MyMenu>

        <div style={{ flex: 1, marginBottom: '10px', marginTop: '10px' }}>
          <div style={{ padding: '0 24px', marginBottom: '8px' }}>
            <Typography
              variant="body2"
              fontWeight={600}
              style={{ opacity: 0.5, letterSpacing: '0.5px' }}
            >
              Configuración
            </Typography>
          </div>
        </div>

        <MyMenu active={location.pathname === '/admin/sunat'} component={<Link to="/admin/sunat" />} icon={<SettingsApplicationsIcon  />}>
          <Typography variant='body2'>Sunat</Typography>
        </MyMenu>


      </Menu>

    </Sidebar>
  )
}

export default SideNav


const avatarContainer: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  flexDirection: 'column',
  my: 5,
}

const avatar: SxProps<Theme> = {
  width: '30%',
  height: 'auto',
}

const yourChannel: SxProps<Theme> = {
  mt: 1
}
