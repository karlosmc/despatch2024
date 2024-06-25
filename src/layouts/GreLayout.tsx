
import { Box} from '@mui/material'
import { Outlet } from 'react-router'
import { useAuth } from '../hooks/useAuth'
// import Inicio from '../views/Inicio'


const Grelayout = () => {

  // const { isLoading } = useAuth({ middleware: 'auth', url: '' });

  useAuth({ middleware: 'auth', url: '/gre/guiaremision' });

  return (
      <Box component={'main'} >
          <Outlet />
      </Box>  
  )
}

export default Grelayout
