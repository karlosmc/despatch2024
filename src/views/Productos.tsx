import { Box, Button, CircularProgress, Container, Fab, Icon, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography } from '@mui/material'
import React, { useState } from 'react'
import useSWR from 'swr';
import clienteAxios from '../config/axios';
import ModalProducto from '../components/Producto';
import { Producto } from '../types/producto.interface';

import StarOutlineIcon from '@mui/icons-material/StarOutline';
import GradeIcon from '@mui/icons-material/Grade';

import EditIcon from '@mui/icons-material/Edit';
import { DialogComponentCustom } from '../components';
import BuscarComponent from '../components/BuscarComponent';
import { BuscarOpcionesInterface } from '../types/buscar.interface';


type ModalsProps = {
  open: boolean;
  form: React.ReactNode | null;
  title: string;
};

const opciones: BuscarOpcionesInterface[] = [
  {
    codigo: 'codigo',
    valor: 'Código'
  },
  {
    codigo: 'descripcion',
    valor: 'Descripción'
  },
  {
    codigo: 'nombreCorto',
    valor: 'Nombre Corto'
  },   
  // {
  //   codigo: 'fav',
  //   valor: 'Favoritos'
  // },
]


const Productos = () => {

  const [modalsForm, setModalsForms] = useState<ModalsProps>({
    open: false,
    form: null,
    title: "",
  });

  const [inputQueryTemp, setInputQueryTemp] = useState<string>(''); // Valores temporales
  const [searchFieldTemp, setSearchFieldTemp] = useState<string>('');

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

  // const HandleSearchParams = (field:string,query:string) => {

  //   setInputQuery(query)
  //   setSearchField(field)
  // }

  const handleSearchParams = (field: string, query: string) => {
    setSearchFieldTemp(field);  // Guarda en los estados temporales
    setInputQueryTemp(query);
  };

  // Ejecutar búsqueda al presionar "Buscar"
  const handleSearch = () => {
    setSearchField(searchFieldTemp); // Actualiza los estados definitivos
    setInputQuery(inputQueryTemp);
  };


  // const [edit, setEdit] = useState<boolean>(false);

  const token = localStorage.getItem('AUTH_TOKEN');

  const fetcher = () => {
    let url = '/api/productos';
    if (searchField && inputQuery) {
      url += `/buscar?${searchField}=${inputQuery}`; // Agrega los parámetros si existen
    }
    return clienteAxios(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
  }

  const { data, isLoading } = useSWR(['/api/productos', searchField, inputQuery], fetcher);

  // if (isLoading) return <div>Cargando</div>

  const rows = [];

  data?.data?.data.forEach((fil: Producto) => {
    rows.push(
      <TableRow
        key={fil.id}
      >
        <TableCell align="left">{fil.id}</TableCell>
        <TableCell align="left">{fil.codigo}</TableCell>
        <TableCell align="left">{fil.descripcion}</TableCell>
        <TableCell align="left">{fil.unidad}</TableCell>
        <TableCell align="left"><Icon color='warning' >{fil.fav ? <GradeIcon /> : <StarOutlineIcon />}</Icon></TableCell>
        <TableCell align="left"><Fab color='primary' size='small' onClick={() => handleEditProduct(fil.id)} ><EditIcon /></Fab></TableCell>
      </TableRow>
    )
  })

  const handleEditProduct = (id: number) => {
    // setEdit(false);
    const selectedProducto = data.data.data.find(item => item.id === id);
    handleOpenModalForm(
      <ModalProducto initialValue={selectedProducto} edit={true} onConfirm={handleConfirm} />,
      'Editar Producto'
    )
  }

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  return (
    <Container>
      <Box my={3} display='flex' component='div' justifyContent='space-between'>
        <Typography>
          Productos
        </Typography>
        <Button
          color='primary'
          onClick={() => {
            handleOpenModalForm(
              <ModalProducto initialValue={null} edit={false} onConfirm={handleCloseModalForm} />,
              'Producto'
            )
          }}
          variant='outlined'>
          Agregar Producto
        </Button>
      </Box>
      <Box display={'flex'} flexDirection={{ xs: 'column', sm: 'row' }} my={1}>
        <BuscarComponent opciones={opciones} onSearchChange={handleSearchParams} />
      </Box>

      <Button onClick={handleSearch} size='small' fullWidth color='success' variant='contained' sx={{ mb: 1 }}>Buscar</Button>

      <TableContainer component={Paper} >
        <Table aria-label="simple table" size='small'>
          <TableHead>
            <TableRow>
              <TableCell width={'5%'}>Id</TableCell>
              <TableCell width={'15%'} align="left">Codigo</TableCell>
              <TableCell width={'60%'} align="left">Descripción</TableCell>
              <TableCell width={'10%'} align="left">Unidad</TableCell>
              <TableCell width={'10%'} align="left">Fav</TableCell>
              <TableCell width={'10%'} align="left">Accion</TableCell>
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

export default Productos