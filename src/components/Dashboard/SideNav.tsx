import { Menu, MenuItem, Sidebar } from 'react-pro-sidebar'
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';

// import { StyleOutlined } from '@mui/icons-material';

import { SourceOutlined } from '@mui/icons-material';
import { Avatar, Box, SxProps, Theme, Typography, css, styled, useTheme } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';



interface AppHeaderInterface {
  sidebarCollapsed: boolean
}

const MyMenu = styled(MenuItem)(({ theme })=>({
  '& .ps-menu-button:hover':css({
    background:`${theme.palette.secondary.main} !important`
  })
}))

const SideNav = ({ sidebarCollapsed }: AppHeaderInterface) => {

  // const {broken,collapseSidebar,toggleSidebar} = useProSidebar()

  const theme = useTheme();
  // const toolbarHeight = theme.mixins.toolbar;
  const location = useLocation();

  return (
    <Sidebar
      style={{
        height: '100%',
        top:'auto'
      }}
      breakPoint='md'
      backgroundColor='default'
      toggled={sidebarCollapsed}
      collapsed={sidebarCollapsed}

    >
      <Box sx={avatarContainer}>
        <Avatar sx={avatar} alt='Channel Name' src='/assets/img/avatars/avatar04.png' />
        {
          !sidebarCollapsed ?
            <Typography variant='body2' sx={yourChannel}>Usuario</Typography>
            : null
        }
        {
          !sidebarCollapsed ?
            <Typography variant='overline'>Guias Electrónicas</Typography>
            : null
        }
      </Box>
      <Menu
        menuItemStyles={{
          button: ({active})=>{
            return {
              backgroundColor:active?theme.palette.primary.main: undefined
            }
          }
        }}
      
      >
        <MyMenu active={location.pathname==='/'} component={<Link to="/"/>} icon={<DashboardOutlinedIcon />}>
          <Typography variant='body2'>Dashboard</Typography>
        </MyMenu>

        <MyMenu active={location.pathname==='/admin/productos'} component={<Link to="/admin/productos"/>} icon={<SourceOutlined />}>
          <Typography variant='body2'>Productos</Typography>
        </MyMenu>
        <MyMenu active={location.pathname==='/admin/puntos'} component={<Link to="/admin/puntos"/>} icon={<SourceOutlined />}>
          <Typography variant='body2'>Puntos de ubicación</Typography>
        </MyMenu>

        <MyMenu active={location.pathname==='/admin/personas'} component={<Link to="/admin/personas"/>} icon={<SourceOutlined />}>
          <Typography variant='body2'>Personas</Typography>
        </MyMenu>
        <MyMenu active={location.pathname==='/admin/transportista'} component={<Link to="/admin/transportista"/>} icon={<SourceOutlined />}>
          <Typography variant='body2'>Transportistas</Typography>
        </MyMenu>
        <MyMenu active={location.pathname==='/admin/conductores'} component={<Link to="/admin/conductores"/>} icon={<SourceOutlined />}>
          <Typography variant='body2'>Conductores</Typography>
        </MyMenu>

        <MyMenu active={location.pathname==='/admin/vehiculos'} component={<Link to="/admin/vehiculos"/>} icon={<SourceOutlined />}>
          <Typography variant='body2'>Vehiculos</Typography>
        </MyMenu>

        <MyMenu active={location.pathname==='/gre/guiaremision'} component={<a href="/gre/guiaremision"  target='_blank'rel='noopener noreferrer'/> } icon={<SourceOutlined />}>
          <Typography variant='body2'>Guias otra pestaña</Typography>
        </MyMenu>

        <MyMenu active={location.pathname==='/gre/guiaremision'} component={<Link to="/gre/guiaremision"/>} icon={<SourceOutlined />}>
          <Typography variant='body2'>Guias misma pestaña</Typography>
        </MyMenu>


        <MyMenu active={location.pathname==='/admin/reportes'} component={<Link to="/admin/reportes"/>} icon={<SourceOutlined />}>
          <Typography variant='body2'>Reportes</Typography>
        </MyMenu>

        <MyMenu active={location.pathname==='/admin/sunat'} component={<Link to="/admin/sunat"/>} icon={<SourceOutlined />}>
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
