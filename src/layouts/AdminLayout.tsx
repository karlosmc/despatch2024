import { useState } from 'react'
import AppHeader from '../components/Dashboard/AppHeader'
import SideNav from '../components/Dashboard/SideNav'
import { Box, CssBaseline, SxProps, Theme, ThemeProvider } from '@mui/material'
import { Outlet } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { useThemeContext } from '../context/themeProvider'
// import Inicio from '../views/Inicio'


const AdminLayout = () => {

  // const { isLoading } = useAuth({ middleware: 'auth', url: '' });
  useAuth({ middleware: 'auth', url: '' });

  const { theme } = useThemeContext();
  const [toggle, setToggle] = useState<boolean>(false)
  return (

    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppHeader toggle={toggle} setToggle={setToggle} />
      <Box sx={container}>
        <SideNav toggle={toggle} setToggle={setToggle} />
        <Box component='main' sx={{ top: 100, ...mainSection }}>
          <Outlet />
        </Box>
      </Box>
    </ThemeProvider>

  )
}

export default AdminLayout

const container: SxProps<Theme> = {
  display: 'flex',
  height: 'calc(100%-64px)'
}

const mainSection: SxProps<Theme> = {
  p: 1,
  width: '100%',
  height: '100%',
  overflow: 'auto'

}


// const [collapsed, setCollapsed] = useState<boolean>(false)
// return (
//   <>
//     {
//       isLoading ? <Inicio />

//         :
//         <>
//           <AppHeader sidebarCollapsed={collapsed} setSidebarCollapsed={setCollapsed} />
//           <Box sx={container}>
//             <SideNav sidebarCollapsed={collapsed} />
//             <Box component='main' sx={{ top: 100, ...mainSection }}>
//               <Outlet />
//             </Box>
//           </Box>
//         </>
//     }

//   </>

// )
