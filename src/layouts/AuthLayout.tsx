import { Box, Container, Grid } from '@mui/material'
import { Outlet } from 'react-router-dom'

const AuthLayout = () => {


  const logo = import.meta.env.VITE_API_LOGO
  return (
    <Container maxWidth="md">
      <Grid container sx={{ height: '90vh', padding: 2 }} alignItems="center" textAlign='center' >
        <Grid item md={6} xs={12}>
          <Box
            component="img"
            sx={{maxWidth:350}}
            src={`/assets/img/${logo}`}
            alt="logo"
          />
        </Grid>
        <Outlet />

      </Grid>
    </Container>
  )
}

export default AuthLayout