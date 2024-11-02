import { AppBar,  Box,  IconButton, SxProps, Theme,  Toolbar } from '@mui/material'
import React from 'react'

import MenuIcon from '@mui/icons-material/Menu';

import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import DarkMode from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useAuth } from '../../hooks/useAuth';
import { useThemeContext } from '../../context/themeProvider';

interface AppHeaderInterface {
  toggle: boolean;
  setToggle:React.Dispatch<React.SetStateAction<Boolean>>
}
const AppHeader = ({ toggle, setToggle }: AppHeaderInterface) => {

  const { logout } = useAuth({ middleware: 'auth', url: '' });

  const {  mode, toggleColorMode } = useThemeContext();

  // useEffect(()=>{
  //   if(mode==='ligth'){
  //     toggleColor
  //   }
  // },[])


  // const [params, setParams] = useState<ParamsInterface>(null)

  return (
      <AppBar
        position='sticky'
        color='default'
      >
        <Toolbar>
          <IconButton onClick={() => setToggle(!toggle)} color='default'>
            <MenuIcon />
          </IconButton>

          <Box
            component='img'
            sx={appLogo}
            // src='/assets/img/logokankas.jpeg'
            src='/assets/img/logofafio.png'
            // src='/assets/img/elcentenario.png'
          />
          <Box sx={{ flexGrow: 1 }} />

          <IconButton onClick={toggleColorMode} title={mode==='dark'?'Cambiar a colores claros':'Cambiar a colores oscuros'} color='default'>
            {mode==='dark'?<LightModeIcon/>:<DarkMode />}
          </IconButton>
          {/* <IconButton title='Notificaciones' color='default'>
            <Badge badgeContent={10} color='primary'>
              <NotificationsIcon />
            </Badge>
          </IconButton> */}
          <IconButton title='Settings' color='default'>
            <SettingsIcon />
          </IconButton>
          <IconButton onClick={logout} title='Cerrar sesión' color='default'>
            <LogoutIcon />
          </IconButton>

        </Toolbar>

      </AppBar>
    
  )
}



export default AppHeader

// /** @type {import("@mui/material").SxProps}  */
const appLogo: SxProps<Theme> = {
  borderRadius: 2,
  width: 80,
  ml: 2,
  cursor: 'pointer'

}