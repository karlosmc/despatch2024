import { Box, Button, CircularProgress, Container, Fab,  Paper, SxProps, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Theme, Typography, useMediaQuery, useTheme } from '@mui/material'
import React, { useState } from 'react'
import useSWR from 'swr';
import clienteAxios from '../config/axios';



import EditIcon from '@mui/icons-material/Edit';
import { DialogComponentCustom } from '../components';

import { numeracion } from '../types/numeracion.interface';
import ModalNumeracion from '../components/Numeracion';


type ModalsProps = {
  open: boolean;
  form: React.ReactNode | null;
  title: string;
};

const Numeracion = () => {

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
  const fetcher = () => clienteAxios('/api/numeracion', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  const { data,  isLoading } = useSWR('/api/numeracion', fetcher);

  const TableCellStyles = {
    // padding: '8px',
    fontSize: !isMobile?'0.875rem':'0.60rem', // Adjust font size here


  }

  // if (isLoading) return <div>Cargando</div>

  const rows = [];

  data?.data?.data.forEach((fil:numeracion) => {
    rows.push(
      <TableRow
        key={fil.id}
      >
        <TableCell sx={TableCellStyles} align="left">{fil.id}</TableCell>
        <TableCell sx={TableCellStyles} align="left">{fil.nombre}</TableCell>
        <TableCell sx={TableCellStyles} align="left">{fil.numeroActual}</TableCell>
        <TableCell sx={TableCellStyles} align="left">{fil.primario?.placa}</TableCell>
        <TableCell sx={TableCellStyles} align="left">{fil.secundario[0]?.placa}</TableCell>
        <TableCell sx={TableCellStyles} align="left">{fil.puntoemision.nombre}</TableCell>
        <TableCell sx={TableCellStyles} align="left"><Fab color='primary' size='small' onClick={() => handleEditNumeracion(fil)} ><EditIcon /></Fab></TableCell>
      </TableRow>
    )
  })



  const handleEditNumeracion= (numeracion:numeracion) => {
    
    handleOpenModalForm(
      <ModalNumeracion initialValue={numeracion} edit={true} onConfirm={handleConfirm} />,
      'Editar Numeracion'
    )
  }

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  return (
    <Container>
      <Box my={3} display='flex' component='div' justifyContent='space-between' flexDirection={{sm:'row',xs:'column'}}>
        <Typography variant='h5' textAlign={{sm:'left',xs:'center'}} mb={{sm:0,xs:1}}>
          Numeración
        </Typography>
        <Button
          color='primary'
          onClick={() => {
            handleOpenModalForm(
              <ModalNumeracion initialValue={null} edit={false} onConfirm={handleCloseModalForm} />,
              'Nuevo numeración'
            )
          }}
          variant='outlined'>
          Agregar Numeración
        </Button>
      </Box>

      <TableContainer component={Paper} >
        <Table aria-label="simple table" size='small'>
          <TableHead sx={customTableHeader}>
            <TableRow>
              <TableCell sx={{...TableCellStyles,fontWeight:'bold',color:'whitesmoke'}} width={'5%'}>Id</TableCell>
              <TableCell sx={{...TableCellStyles,fontWeight:'bold',color:'whitesmoke'}} width={'20%'} align="left">Codigo</TableCell>
              <TableCell sx={{...TableCellStyles,fontWeight:'bold',color:'whitesmoke'}} width={'10%'} align="left"># Actual</TableCell>
              <TableCell sx={{...TableCellStyles,fontWeight:'bold',color:'whitesmoke'}} width={'20%'} align="left">Placa Primario</TableCell>
              <TableCell sx={{...TableCellStyles,fontWeight:'bold',color:'whitesmoke'}} width={'20%'} align="left">Placa Secundario</TableCell>
              <TableCell sx={{...TableCellStyles,fontWeight:'bold',color:'whitesmoke'}} width={'25%'} align="left">Punto Emisión</TableCell>
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

export default Numeracion