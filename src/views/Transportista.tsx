import { Box, Button, CircularProgress, Container, Fab, Icon, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography } from '@mui/material'
import React, { useState } from 'react'
import useSWR from 'swr';
import clienteAxios from '../config/axios';


import StarOutlineIcon from '@mui/icons-material/StarOutline';
import GradeIcon from '@mui/icons-material/Grade';

import EditIcon from '@mui/icons-material/Edit';
import { DialogComponentCustom } from '../components';

import { transportista } from '../types/transportista.interface';
import ModalTransportista from '../components/Transportista';


type ModalsProps = {
  open: boolean;
  form: React.ReactNode | null;
  title: string;
};

const Transportistas = () => {

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
  const fetcher = () => clienteAxios('/api/transportistas', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  const { data,  isLoading } = useSWR('/api/transportistas', fetcher);

  // if (isLoading) return <div>Cargando</div>

  const rows = [];

  data?.data?.data.forEach((fil:transportista) => {
    rows.push(
      <TableRow
        key={fil.id}
      >
        <TableCell align="left">{fil.id}</TableCell>
        <TableCell align="left">{fil.numDoc}</TableCell>
        <TableCell align="left">{fil.rznSocial}</TableCell>
        <TableCell align="left">{fil.tipodocumento}</TableCell>
        <TableCell align="left"><Icon color='warning' >{fil.fav ? <GradeIcon /> : <StarOutlineIcon />}</Icon></TableCell>
        <TableCell align="left"><Fab color='primary' size='small' onClick={() => handleEditTransportista(fil)} ><EditIcon /></Fab></TableCell>
      </TableRow>
    )
  })



  const handleEditTransportista = (transportista:transportista) => {
    // setEdit(false);
    // const selectedPunto = data.data.data.find(item => item.id === id);
    handleOpenModalForm(
      <ModalTransportista initialValue={transportista} edit={true} onConfirm={handleConfirm} />,
      'Editar Transportista'
    )
  }

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  return (
    <Container>
      <Box my={3} display='flex' component='div' justifyContent='space-between'>
        <Typography>
          Transportistas
        </Typography>
        <Button
          color='primary'
          onClick={() => {
            handleOpenModalForm(
              <ModalTransportista initialValue={null} edit={false} onConfirm={handleCloseModalForm} />,
              'Nuevo Transportista'
            )
          }}
          variant='outlined'>
          Agregar Conductor
        </Button>
      </Box>

      <TableContainer component={Paper} >
        <Table aria-label="simple table" size='small'>
          <TableHead>
            <TableRow>
              <TableCell width={'5%'}>Id</TableCell>
              <TableCell width={'10%'} align="left">Nro.Doc.</TableCell>
              <TableCell width={'50%'} align="left">Razón Social</TableCell>
              <TableCell width={'5%'} align="left">Tipo.Doc.</TableCell>
              <TableCell width={'10%'} align="left">Fav?</TableCell>
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

export default Transportistas