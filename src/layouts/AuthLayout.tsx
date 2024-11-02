import { Container, Grid, Paper } from '@mui/material'
import { Outlet } from 'react-router-dom'

const AuthLayout = () => {
  return (
    <Container maxWidth="md">
      <Paper className="login-background" variant="elevation" elevation={2}>
        
        <Grid container sx={{ height: '90vh', padding: 2 }} alignItems="center" textAlign='center' >
          <Grid item md={6} xs={12}>
            <img
              style={{ maxWidth: "350px" }}
              // src={'/assets/img/elcentenario.png'}
              src={'/assets/img/logofafio.png'}
              // src={'/assets/img/logokankas.jpeg'}
              alt="logo"
            ></img>
          </Grid>
          <Outlet/>

        </Grid>
      </Paper>
    </Container>
  )
}

export default AuthLayout