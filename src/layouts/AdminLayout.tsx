import { useEffect, useState } from 'react'
import AppHeader from '../components/Dashboard/AppHeader'
import SideNav from '../components/Dashboard/SideNav'
import ConexionBanner from '../components/ConexionBanner'
import { Box, CssBaseline, SxProps, Theme, ThemeProvider } from '@mui/material'
import { Outlet } from 'react-router'

import { useThemeContext } from '../context/themeProvider'

import { useTokenParamsStore } from '../store/tokenParamsStore'
import { useMiscStore } from '../store/miscStore'



const AdminLayout = () => {

  const params = useTokenParamsStore(state => state.params);
  const series = useMiscStore(state => state.series);
  const ubigeos = useMiscStore(state => state.ubigeos);

  const { theme } = useThemeContext();
  const [toggle, setToggle] = useState<boolean>(false)

  useEffect(() => {
    const loadDataIfNeeded = async () => {
      const promises = [];

      // Verificar y cargar params si no existen (null)
      if (params === null) {
        promises.push(useTokenParamsStore.getState().getSunatParams());
      }
      // Verificar y cargar series si no existen (array vacío)
      if (!series || series.length === 0) {
        promises.push(useMiscStore.getState().getSeries());
      }

      // Verificar y cargar ubigeos si no existen (array vacío)
      if (!ubigeos || ubigeos.length === 0) {
        promises.push(useMiscStore.getState().getUbigeos());
      }

      // Ejecutar todas las peticiones necesarias en paralelo
      if (promises.length > 0) {
        try {
          await Promise.all(promises);
        } catch (error) {
          console.error('Error cargando datos:', error);
        }
      }
    };

    loadDataIfNeeded();
  }, [params, series, ubigeos]); // Dependencias para que se ejecute cuando cambien estos valores

  return (

    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppHeader toggle={toggle} setToggle={setToggle} />
      <Box sx={container}>
        <SideNav toggle={toggle} setToggle={setToggle} />
        <Box component='main' sx={mainSection}>
          <Box sx={bannerFijo}>
            <ConexionBanner />
          </Box>
          <Outlet />
        </Box>
      </Box>
    </ThemeProvider>

  )
}

export default AdminLayout

/**
 * Alto disponible bajo la barra superior (56px en móvil, 64px desde `sm`).
 * Antes era `calc(100%-64px)`: sin espacios alrededor del `-` es CSS inválido y
 * el navegador lo ignoraba, así que el menú lateral no llegaba hasta abajo.
 */
const container: SxProps<Theme> = {
  display: 'flex',
  height: { xs: 'calc(100% - 56px)', sm: 'calc(100% - 64px)' },
}

const mainSection: SxProps<Theme> = {
  p: { xs: 1, md: 2 },
  width: '100%',
  height: '100%',
  overflow: 'auto',
  bgcolor: 'background.default',
}

const bannerFijo: SxProps<Theme> = {
  position: 'sticky',
  top: 0,
  zIndex: (theme) => theme.zIndex.appBar,
}
