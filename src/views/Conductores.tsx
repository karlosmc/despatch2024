import FavoritoToggle from '../components/FavoritoToggle';
import { TIPOS_FAVORITO } from '../service/FavoritoService';
import { Box, Button, CircularProgress, Container, Fab, Icon, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'



import StoreIcon from '@mui/icons-material/Store';
import StoreOutlinedIcon from '@mui/icons-material/StoreOutlined';

import EditIcon from '@mui/icons-material/Edit';
import { DialogComponentCustom } from '../components';
import { conductor } from '../types/conductor.interface';
import ModalConductor from '../components/Conductor';
import { ConductoresService } from '../service/ConductoresServices';


type ModalsProps = {
  open: boolean;
  form: React.ReactNode | null;
  title: string;
};

const Conductores = () => {

  const [modalsForm, setModalsForms] = useState<ModalsProps>({
    open: false,
    form: null,
    title: "",
  });

  const [listaConductores, setListaConductores] = useState<conductor[]>([])

  const [isLoading, setIsLoading] = useState(false)

  const handleOpenModalForm = (form: React.ReactNode, title: string) => {
    setModalsForms({ open: true, form, title });
  };

  const handleCloseModalForm = () => {
    // Cierra el modal en la posición especificada
    setModalsForms((prev) => ({ ...prev, open: false }));
  };


  const handleConfirm = (): void => {
    handleCloseModalForm()
    getConductores()
    setPage(0)
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

  const getConductores = async () => {
    setIsLoading(true)
    try {

      const { data } = await ConductoresService.get('')
      setListaConductores(data)

    } catch (error) {
      console.log(error);
    }
    finally{
      setIsLoading(false)
    }
  }

  useEffect(()=>{
    getConductores()
  },[])

  const rows = [];

  listaConductores?.forEach((fil: conductor) => {
    rows.push(
      <TableRow
        key={fil.id}
      >
        <TableCell align="left">{fil.id}</TableCell>
        <TableCell align="left">{fil.nroDoc}</TableCell>
        <TableCell align="left">{fil.apellidos} {fil.nombres}</TableCell>
        <TableCell align="left">{fil.tipodocumento}</TableCell>
        <TableCell align="left"><FavoritoToggle tipo={TIPOS_FAVORITO.conductor} id={fil.id} fav={fil.fav} /></TableCell>
        <TableCell align="left"><Icon color={fil.isCompany ? 'info' : 'action'} >{fil.isCompany ? <StoreIcon /> : <StoreOutlinedIcon />}</Icon></TableCell>
        <TableCell align="left"><Fab color='primary' size='small' onClick={() => handleEditConductor(fil)} ><EditIcon /></Fab></TableCell>
      </TableRow>
    )
  })



  const handleEditConductor = (conductor: conductor) => {
    // setEdit(false);
    // const selectedPunto = data.data.data.find(item => item.id === id);
    handleOpenModalForm(
      <ModalConductor initialValue={conductor} edit={true} onConfirm={handleConfirm} />,
      'Editar conductor'
    )
  }

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  return (
    <Container>
      <Box my={3} display='flex' component='div' justifyContent='space-between'>
        <Typography>
          Conductores
        </Typography>
        <Button
          color='primary'
          onClick={() => {
            handleOpenModalForm(
              <ModalConductor initialValue={null} edit={false} onConfirm={handleCloseModalForm} />,
              'Nuevo conductor'
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
              <TableCell width={'50%'} align="left">Apellidos y nombres</TableCell>
              <TableCell width={'5%'} align="left">Tipo.Doc.</TableCell>
              <TableCell width={'10%'} align="left">Fav?</TableCell>
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

export default Conductores