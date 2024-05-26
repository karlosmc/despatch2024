import { AppBar, Badge, Box, IconButton, SxProps, Theme, Toolbar } from '@mui/material'
import React from 'react'

import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';


interface AppHeaderInterface{
  sidebarCollapsed:boolean,
  setSidebarCollapsed:React.Dispatch<React.SetStateAction<Boolean>>
}
const AppHeader = ({sidebarCollapsed,setSidebarCollapsed}:AppHeaderInterface) => {

  


  return (
    <AppBar
      position='static'
    >
      <Toolbar>
        <IconButton onClick={() => setSidebarCollapsed(!sidebarCollapsed) } color='secondary'>
          <MenuIcon />
        </IconButton>

        <Box
          component='img'
          sx={appLogo}
          src='/assets/img/elcentenario.png'
        />
        <Box sx={{flexGrow:1}}/>
        <IconButton title='Notificaciones' color='secondary'>
          <Badge badgeContent={10} color='error'>
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <IconButton title='Settings' color='secondary'>
            <SettingsIcon/>
        </IconButton>
        <IconButton title='Settings' color='secondary'>
            <LogoutIcon/>
        </IconButton>
      </Toolbar>

    </AppBar>
  )
}

export default AppHeader

// /** @type {import("@mui/material").SxProps}  */
const appLogo:SxProps<Theme> = {
    borderRadius:2,
    width:80,
    ml:2,
    cursor:'pointer'

}