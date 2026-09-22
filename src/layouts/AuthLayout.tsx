import { Box, Paper, Typography, alpha, useTheme } from '@mui/material'
import { Outlet } from 'react-router-dom'

const AuthLayout = () => {
  const theme = useTheme()
  const logo = import.meta.env.VITE_API_LOGO

  return (
    <Box
      sx={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
        py: { xs: 3, sm: 6 },
        bgcolor: 'background.default',
        backgroundImage: `radial-gradient(circle at 15% 10%, ${alpha(theme.palette.primary.main, 0.14)}, transparent 45%),
          radial-gradient(circle at 85% 90%, ${alpha(theme.palette.error.main, 0.1)}, transparent 40%)`,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 880,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          overflow: 'hidden',
          borderRadius: 4,
          border: 1,
          borderColor: 'divider',
          boxShadow: `0 24px 60px ${alpha(theme.palette.common.black, theme.palette.mode === 'dark' ? 0.5 : 0.08)}`,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: { xs: 1, md: 2 },
            p: { xs: 3, md: 5 },
            pb: { xs: 0, md: 5 },
            bgcolor: { md: alpha(theme.palette.primary.main, 0.06) },
            textAlign: 'center',
          }}
        >
          {logo && (
            <Box
              component='img'
              src={`/assets/img/${logo}`}
              alt='Logo de la empresa'
              sx={{ width: '100%', maxWidth: { xs: 180, md: 300 }, objectFit: 'contain' }}
            />
          )}
          <Typography variant='body2' color='text.secondary' sx={{ display: { xs: 'none', md: 'block' } }}>
            Guías de remisión electrónicas
          </Typography>
        </Box>

        <Box sx={{ p: { xs: 3, sm: 5 } }}>
          <Outlet />
        </Box>
      </Paper>
    </Box>
  )
}

export default AuthLayout
