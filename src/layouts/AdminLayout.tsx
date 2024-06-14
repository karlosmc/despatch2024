import { useState } from 'react'
import AppHeader from '../components/Dashboard/AppHeader'
import SideNav from '../components/Dashboard/SideNav'
import { Box, SxProps, Theme } from '@mui/material'
import { Outlet } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import Inicio from '../views/Inicio'


const AdminLayout = () => {

  const { isLoading } = useAuth({ middleware: 'auth', url: '' });




  const [collapsed, setCollapsed] = useState<boolean>(false)
  return (
    <>

      <AppHeader sidebarCollapsed={collapsed} setSidebarCollapsed={setCollapsed} />
      <Box sx={container}>
        <SideNav sidebarCollapsed={collapsed} />
        <Box component='main' sx={{ top: 100, ...mainSection }}>
          <Outlet />
        </Box>
      </Box>


    </>

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
