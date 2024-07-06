import { Box, Button, CircularProgress, Container, Fab, Icon, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography } from '@mui/material'
import React, { useState } from 'react'
import useSWR from 'swr';
import clienteAxios from '../config/axios';


import StarOutlineIcon from '@mui/icons-material/StarOutline';
import GradeIcon from '@mui/icons-material/Grade';
import StoreIcon from '@mui/icons-material/Store';
import StoreOutlinedIcon from '@mui/icons-material/StoreOutlined';

import EditIcon from '@mui/icons-material/Edit';
import { DialogComponentCustom } from '../components';
import { puntoUbicacion } from '../types/puntoubicacion.interface';
import ModalPuntoUbicacion from '../components/Puntos';


type ModalsProps = {
  open: boolean;
  form: React.ReactNode | null;
  title: string;
};

const PuntoUbicacion = () => {

  const [modalsForm, setModalsForms] = useState<ModalsProps>({
    open: false,
    form: null,
    title: "",
  });

  const handleOpenModalForm = (form: React.ReactNode, title: string) => {
    setModalsForms({ open: true, form, title });
  };

  const handleCloseModalForm = () => {
    // Cierra el modal en la posición especificada
    setModalsForms((prev) => ({ ...prev, open: false }));
  };


  const handleConfirm = (): void => {
    handleCloseModalForm()
  }

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

  const token = localStorage.getItem('AUTH_TOKEN');
  const fetcher = () => clienteAxios('/api/puntos', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  const { data,  isLoading } = useSWR('/api/puntos', fetcher);

  // if (isLoading) return <div>Cargando</div>

  const rows = [];

  data?.data?.data.forEach((fil:puntoUbicacion) => {
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
        <TableCell align="left"><Icon color='warning' >{fil.fav ? <GradeIcon /> : <StarOutlineIcon />}</Icon></TableCell>
        <TableCell align="left"><Icon color={fil.isCompany?'info':'action'} >{fil.isCompany ? <StoreIcon /> : <StoreOutlinedIcon />}</Icon></TableCell>
        <TableCell align="left"><Fab color='primary' size='small' onClick={() => handleEditPunto(fil.id)} ><EditIcon /></Fab></TableCell>
      </TableRow>
    )
  })



  const handleEditPunto = (id: number) => {
    // setEdit(false);
    const selectedPunto = data.data.data.find(item => item.id === id);
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