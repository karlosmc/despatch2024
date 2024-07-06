import { Box, Button, CircularProgress, Container, Fab, Icon, Paper, SxProps, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Theme, Typography, useMediaQuery, useTheme } from '@mui/material'
import React, { useState } from 'react'
import useSWR from 'swr';
import clienteAxios from '../config/axios';


import StarOutlineIcon from '@mui/icons-material/StarOutline';
import GradeIcon from '@mui/icons-material/Grade';
import StoreIcon from '@mui/icons-material/Store';
import StoreOutlinedIcon from '@mui/icons-material/StoreOutlined';

import EditIcon from '@mui/icons-material/Edit';
import { DialogComponentCustom } from '../components';
import { persona } from '../types/persona.interface';
import ModalPersona from '../components/Persona';


type ModalsProps = {
  open: boolean;
  form: React.ReactNode | null;
  title: string;
};

const Personas = () => {

  const [modalsForm, setModalsForms] = useState<ModalsProps>({
    open: false,
    form: null,
    title: "",
  });

  const theme = useTheme()

  const colorStyles = theme.palette['primary'];

  const customTableHeader: SxProps<Theme> = {
    backgroundColor: colorStyles.dark,
  }


  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

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
  const fetcher = () => clienteAxios('/api/clientes', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  const { data,  isLoading } = useSWR('/api/clientes', fetcher);

  const TableCellStyles = {
    // padding: '8px',
    fontSize: !isMobile?'0.875rem':'0.60rem', // Adjust font size here


  }

  // if (isLoading) return <div>Cargando</div>

  const rows = [];

  data?.data?.data.forEach((fil:persona) => {
    rows.push(
      <TableRow
        key={fil.id}
      >
        <TableCell sx={TableCellStyles} align="left">{fil.id}</TableCell>
        <TableCell sx={TableCellStyles} align="left">{fil.numDoc}</TableCell>
        <TableCell sx={TableCellStyles} align="left">{fil.rznSocial}</TableCell>
        <TableCell sx={TableCellStyles} align="left">{fil.tipodocumento}</TableCell>
        {!isMobile && <TableCell sx={TableCellStyles} align="left"><Icon color='warning' >{fil.fav ? <GradeIcon /> : <StarOutlineIcon />}</Icon></TableCell>}
        {!isMobile && <TableCell sx={TableCellStyles} align="left"><Icon color={fil.isCompany?'info':'action'} >{fil.isCompany ? <StoreIcon /> : <StoreOutlinedIcon />}</Icon></TableCell>}
        <TableCell sx={TableCellStyles} align="left"><Fab color='primary' size='small' onClick={() => handleEditPersona(fil)} ><EditIcon /></Fab></TableCell>
      </TableRow>
    )
  })



  const handleEditPersona = (persona:persona) => {
    // setEdit(false);
    // const selectedPunto = data.data.data.find(item => item.id === id);
    handleOpenModalForm(
      <ModalPersona initialValue={persona} edit={true} onConfirm={handleConfirm} />,
      'Editar Persona'
    )
  }

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  return (
    <Container>
      <Box my={3} display='flex' component='div' justifyContent='space-between' flexDirection={{sm:'row',xs:'column'}}>
        <Typography variant='h5' textAlign={{sm:'left',xs:'center'}} mb={{sm:0,xs:1}}>
          Personas
        </Typography>
        <Button
          color='primary'
          onClick={() => {
            handleOpenModalForm(
              <ModalPersona initialValue={null} edit={false} onConfirm={handleCloseModalForm} />,
              'Nuevo Punto de Ubicacion'
            )
          }}
          variant='outlined'>
          Agregar Persona
        </Button>
      </Box>

      <TableContainer component={Paper} >
        <Table aria-label="simple table" size='small'>
          <TableHead sx={customTableHeader}>
            <TableRow>
              <TableCell sx={{...TableCellStyles,fontWeight:'bold',color:'whitesmoke'}} width={'5%'}>Id</TableCell>
              <TableCell sx={{...TableCellStyles,fontWeight:'bold',color:'whitesmoke'}} width={'10%'} align="left">Nro.Doc.</TableCell>
              <TableCell sx={{...TableCellStyles,fontWeight:'bold',color:'whitesmoke'}} width={'50%'} align="left">Razón Social</TableCell>
              <TableCell sx={{...TableCellStyles,fontWeight:'bold',color:'whitesmoke'}} width={'5%'} align="left">Tipo.Doc.</TableCell>
              {!isMobile && <TableCell sx={{...TableCellStyles,fontWeight:'bold',color:'whitesmoke'}} width={'10%'} align="left">Fav?</TableCell>}
              {!isMobile && <TableCell sx={{...TableCellStyles,fontWeight:'bold',color:'whitesmoke'}} width={'10%'} align="left">Propio?</TableCell>}
              <TableCell sx={{...TableCellStyles,fontWeight:'bold',color:'whitesmoke'}} width={'10%'} align="left">Editar</TableCell>
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

export default Personas