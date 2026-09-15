import FavoritoToggle from '../components/FavoritoToggle';
import { TIPOS_FAVORITO } from '../service/FavoritoService';
import { Box, Button, CircularProgress, Container, Fab, Icon, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'

import StoreIcon from '@mui/icons-material/Store';
import StoreOutlinedIcon from '@mui/icons-material/StoreOutlined';

import EditIcon from '@mui/icons-material/Edit';
import { DialogComponentCustom } from '../components';
import { puntoUbicacion } from '../types/puntoubicacion.interface';
import ModalPuntoUbicacion from '../components/Puntos';
import BuscarComponent from '../components/BuscarComponent';
import { BuscarOpcionesInterface } from '../types/buscar.interface';
import { PuntoUbicacionService } from '../service/PuntoUbicacionService';


type ModalsProps = {
  open: boolean;
  form: React.ReactNode | null;
  title: string;
};

const opciones: BuscarOpcionesInterface[] = [
  {
    codigo: 'ubigeo',
    valor: 'Ubigeo'
  },
  {
    codigo: 'fullubigeo',
    valor: 'Full ubigeo'
  },
  {
    codigo: 'direccion',
    valor: 'Dirección'
  },
  {
    codigo: 'rznSocial',
    valor: 'Razón Social'
  },
  {
    codigo: 'ruc',
    valor: 'RUC'
  },

  // {
  //   codigo: 'fav',
  //   valor: 'Favoritos'
  // },
]

const PuntoUbicacion = () => {

  const [modalsForm, setModalsForms] = useState<ModalsProps>({
    open: false,
    form: null,
    title: "",
  });


  const [puntosUbicacion, setPuntosUbicacion] = useState<puntoUbicacion[]>([])

  const [isLoading, setIsLoading] = useState(false)

  const [inputQuery, setInputQuery] = useState<string>('')

  const [searchField, setSearchField] = useState<string>('')

  const handleOpenModalForm = (form: React.ReactNode, title: string) => {
    setModalsForms({ open: true, form, title });
  };

  const handleCloseModalForm = () => {
    // Cierra el modal en la posición especificada
    setModalsForms((prev) => ({ ...prev, open: false }));
  };


  const handleConfirm = (): void => {
    handleCloseModalForm()
    setPage(0)
    getPuntosUbicacion()
  }

  const handleSearchParams = (field: string, query: string) => {
    setInputQuery(query)
    setSearchField(field)
  };

  // Ejecutar búsqueda al presionar "Buscar"
  const handleSearch = () => {
    getPuntosUbicacion()
    setPage(0)
  };

  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };


  // const [edit, setEdit] = useState<boolean>(false);



  const getPuntosUbicacion = async () => {

    setIsLoading(true)
    const params = new URLSearchParams();
    if (searchField && inputQuery) {
      params.append(searchField, inputQuery);
    }

    try {
      const { data } = await PuntoUbicacionService.get(params.toString());

      setPuntosUbicacion(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }

  }

  useEffect(() => {

    getPuntosUbicacion();

  }, [])


  // if (isLoading) return <div>Cargando</div>

  const rows = [];

  puntosUbicacion?.forEach((fil: puntoUbicacion) => {
    rows.push(
      <TableRow
        key={fil.id}
      >
        <TableCell align="left">{fil.id}</TableCell>
        <TableCell align="left">{fil.ruc}</TableCell>
        <TableCell align="left">{fil.codLocal}</TableCell>
        <TableCell align="left">{fil.direccion}</TableCell>
        <TableCell align="left">{fil.fullubigeo}</TableCell>
        <TableCell align="left">{fil.rznSocial}</TableCell>
        <TableCell align="left"><FavoritoToggle tipo={TIPOS_FAVORITO.punto} id={fil.id} fav={fil.fav} /></TableCell>
        <TableCell align="left"><Icon color={fil.isCompany ? 'info' : 'action'} >{fil.isCompany ? <StoreIcon /> : <StoreOutlinedIcon />}</Icon></TableCell>
        <TableCell align="left"><Fab color='primary' size='small' onClick={() => handleEditPunto(fil.id)} ><EditIcon /></Fab></TableCell>
      </TableRow>
    )
  })



  const handleEditPunto = (id: number) => {
    // setEdit(false);
    const selectedPunto = puntosUbicacion?.find(item => item.id === id);
    handleOpenModalForm(
      <ModalPuntoUbicacion initialValue={selectedPunto} edit={true} onConfirm={handleConfirm} />,
      'Editar Punto de Ubicacion'
    )
  }

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  return (
    <Container>
      <Box my={3} display='flex' component='div' justifyContent='space-between'>
        <Typography>
          Puntos de ubicación
        </Typography>
        <Button
          color='primary'
          onClick={() => {
            handleOpenModalForm(
              <ModalPuntoUbicacion initialValue={null} edit={false} onConfirm={handleCloseModalForm} />,
              'Nuevo Punto de Ubicacion'
            )
          }}
          variant='outlined'>
          Agregar Punto de Ubicación
        </Button>
      </Box>
      <Box display={'flex'} flexDirection={{ xs: 'column', sm: 'row' }} columnGap={1} my={1}>
        <BuscarComponent opciones={opciones} onSearchChange={handleSearchParams} />
      </Box>

      <Button onClick={handleSearch} size='small' fullWidth color='success' variant='contained' sx={{ mb: 1 }}>Buscar</Button>

      <TableContainer component={Paper} >
        <Table aria-label="simple table" size='small'>
          <TableHead>
            <TableRow>
              <TableCell width={'5%'}>Id</TableCell>
              <TableCell width={'10%'} align="left">Ruc</TableCell>
              <TableCell width={'5%'} align="left">Cod. Local</TableCell>
              <TableCell width={'40%'} align="left">Dirección</TableCell>
              <TableCell width={'30%'} align="left">Ubigeo</TableCell>
              <TableCell width={'20%'} align="left">Rzn.Social</TableCell>
              <TableCell width={'5%'} align="left">Fav?</TableCell>
              <TableCell width={'10%'} align="left">Propio?</TableCell>
              <TableCell width={'10%'} align="left">Editar</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {
              isLoading ? (<TableRow style={{ height: 53 * rowsPerPage }}><TableCell colSpan={11} align="center"><CircularProgress /></TableCell></TableRow>) :
                rows.length > 0 ? rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  :
                  <TableRow style={{ height: 53 * rowsPerPage }}><TableCell colSpan={11} align="center"><h2>No hay resultados</h2></TableCell></TableRow>
            }

            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}><TableCell colSpan={11} /></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
      {/* <ProductoFormModal/> */}
      <DialogComponentCustom
        closeButton={
          <Button
            variant="contained"
            color="error"
            onClick={() => handleCloseModalForm()}
          >
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

export default PuntoUbicacion