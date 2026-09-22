import FavoritoToggle from '../components/FavoritoToggle';
import { TIPOS_FAVORITO } from '../service/FavoritoService';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import React, { useEffect, useMemo, useState } from 'react'

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';

import { DialogComponentCustom } from '../components';
import { vehiculo } from '../types/vehiculo.interface';
import ModalVehiculo from '../components/Vehiculo';
import { VehiculoService } from '../service/VehiculoService';

type ModalsProps = {
  open: boolean;
  form: React.ReactNode | null;
  title: string;
};

const soloAlfanumerico = (texto?: string | null) => (texto || '').toUpperCase().replace(/[^A-Z0-9]/g, '')

const Vehiculos = () => {
  const [modalsForm, setModalsForms] = useState<ModalsProps>({ open: false, form: null, title: '' });
  const [listaVehiculos, setListaVehiculos] = useState<vehiculo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorCarga, setErrorCarga] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);

  const handleOpenModalForm = (form: React.ReactNode, title: string) => {
    setModalsForms({ open: true, form, title });
  };

  const handleCloseModalForm = () => {
    setModalsForms((prev) => ({ ...prev, open: false }));
  };

  /** Tras crear o editar: se cierra el modal y se recarga la lista (antes al crear no se recargaba). */
  const handleConfirm = (): void => {
    handleCloseModalForm()
    getVehiculos()
  }

  const getVehiculos = async () => {
    try {
      setIsLoading(true)
      setErrorCarga(null)
      const { data } = await VehiculoService.get('');
      setListaVehiculos(Array.isArray(data) ? data : [])
    } catch (error) {
      setErrorCarga(typeof error === 'string' ? error : 'No se pudieron cargar los vehículos')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getVehiculos()
  }, [])

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toUpperCase()
    if (!texto) return listaVehiculos
    const placa = soloAlfanumerico(texto)
    return listaVehiculos.filter((v) =>
      (placa && soloAlfanumerico(v.placa).includes(placa)) ||
      (v.nombreCorto || '').toUpperCase().includes(texto)
    )
  }, [listaVehiculos, busqueda])

  useEffect(() => setPage(0), [busqueda])

  const handleEditVehiculo = (vehiculo: vehiculo) => {
    handleOpenModalForm(
      <ModalVehiculo initialValue={vehiculo} edit={true} onConfirm={handleConfirm} />,
      `Editar vehículo ${vehiculo.placa}`
    )
  }

  const visibles = filtrados.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

  return (
    <Container sx={{ py: 3 }}>
      <Box mb={2} display='flex' flexWrap='wrap' alignItems='center' justifyContent='space-between' gap={1.5}>
        <Box>
          <Typography variant='h5' fontWeight={700}>Vehículos</Typography>
          <Typography variant='body2' color='text.secondary'>
            {listaVehiculos.length} registrado(s)
          </Typography>
        </Box>
        <Button
          variant='contained'
          startIcon={<AddRoundedIcon />}
          onClick={() =>
            handleOpenModalForm(
              <ModalVehiculo initialValue={null} edit={false} onConfirm={handleConfirm} />,
              'Nuevo vehículo'
            )
          }
        >
          Agregar vehículo
        </Button>
      </Box>

      <Box display='flex' gap={1} mb={1.5}>
        <TextField
          size='small'
          fullWidth
          placeholder='Buscar por placa o nombre corto'
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <SearchRoundedIcon fontSize='small' />
              </InputAdornment>
            ),
          }}
        />
        <Tooltip title='Recargar'>
          <span>
            <IconButton onClick={getVehiculos} disabled={isLoading} aria-label='Recargar'>
              <RefreshRoundedIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      {errorCarga && (
        <Alert
          severity='error'
          sx={{ mb: 1.5 }}
          action={<Button color='inherit' size='small' onClick={getVehiculos}>Reintentar</Button>}
        >
          {errorCarga}
        </Alert>
      )}

      <TableContainer component={Paper} variant='outlined'>
        <Table aria-label='Vehículos' size='small'>
          <TableHead>
            <TableRow>
              <TableCell>Placa</TableCell>
              <TableCell>Nombre corto</TableCell>
              <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Nro. circulación</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell align='center'>Fav.</TableCell>
              <TableCell align='right' />
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align='center' sx={{ py: 6 }}><CircularProgress /></TableCell>
              </TableRow>
            ) : visibles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align='center' sx={{ py: 6, color: 'text.secondary' }}>
                  {busqueda ? 'Ningún vehículo coincide con la búsqueda' : 'No hay vehículos registrados'}
                </TableCell>
              </TableRow>
            ) : (
              visibles.map((fil) => (
                <TableRow key={fil.id} hover>
                  <TableCell sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{fil.placa}</TableCell>
                  <TableCell>{fil.nombreCorto || '—'}</TableCell>
                  <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{fil.nroCirculacion || '—'}</TableCell>
                  <TableCell>
                    <Box display='flex' flexWrap='wrap' gap={0.5}>
                      <Chip size='small' variant='outlined' label={fil.tracto ?? true ? 'Tracto' : 'Cisterna'} />
                      {fil.glp && <Chip size='small' color='warning' label='GLP' />}
                      {fil.isCompany && <Chip size='small' color='info' variant='outlined' label='Propio' />}
                    </Box>
                  </TableCell>
                  <TableCell align='center'>
                    <FavoritoToggle tipo={TIPOS_FAVORITO.vehiculo} id={fil.id} fav={fil.fav} />
                  </TableCell>
                  <TableCell align='right'>
                    <Tooltip title='Editar'>
                      <IconButton color='primary' size='small' onClick={() => handleEditVehiculo(fil)} aria-label={`Editar ${fil.placa}`}>
                        <EditRoundedIcon fontSize='small' />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component='div'
        count={filtrados.length}
        rowsPerPage={rowsPerPage}
        page={Math.min(page, Math.max(0, Math.ceil(filtrados.length / rowsPerPage) - 1))}
        onPageChange={(_e, nueva) => setPage(nueva)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        labelRowsPerPage='Filas'
      />
      <DialogComponentCustom
        closeButton={
          <Button color='inherit' onClick={handleCloseModalForm}>
            Cerrar
          </Button>
        }
        open={modalsForm.open}
        title={modalsForm.title}
        element={modalsForm.form}
      />
    </Container>
  )
}

export default Vehiculos
