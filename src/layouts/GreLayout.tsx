
import { Box, CssBaseline, ThemeProvider} from '@mui/material'
import { Outlet } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { useThemeContext } from '../context/themeProvider';
// import Inicio from '../views/Inicio'


const Grelayout = () => {

  // const { isLoading } = useAuth({ middleware: 'auth', url: '' });

  useAuth({ middleware: 'auth', url: '/gre/guiaremision' });

  const {theme} = useThemeContext()

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline/>
      <Box component={'main'} >
          <Outlet />
      </Box>  
    </ThemeProvider>
  )
}

export default Grelayout
