import { Box, Button, Container, Fab, Icon, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import React, { useState } from 'react'
import useSWR from 'swr';
import clienteAxios from '../config/axios';
import { useModal } from '../context/modal.context';
import { useModalComponent } from '../hooks/useModalComponent';
import ModalProducto from '../components/Producto';
import { Producto } from '../types/producto.interface';

import StarOutlineIcon from '@mui/icons-material/StarOutline';
import GradeIcon from '@mui/icons-material/Grade';

import EditIcon from '@mui/icons-material/Edit';




const Productos = () => {

  const token = localStorage.getItem('AUTH_TOKEN');
  const fetcher = () => clienteAxios('/api/productos', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  const { data, error, isLoading } = useSWR('/api/productos', fetcher);

  if (isLoading) return <div>Cargando</div>

  // console.log(data)
  // console.log(error)
  // console.log(isLoading)

  const {openModal,closeModal} = useModal();

  const [producto, setProducto] = useState<Producto>(null)

  const [edit, setEdit] = useState<boolean>(false);

  const ProductoFormModal = useModalComponent({
    content: <ModalProducto closeModal={closeModal} edit={edit} initialValue={producto} />,
    modalName:'prueba',
    title:'Probando',
    maxWidth:'xs'
  })

  const handleEditProduct=(id:number)=>{
    // setEdit(false);
    const selectedProducto = data.data.data.find(item=>item.id=== id);
    setProducto(selectedProducto)
    setEdit(true);
    openModal('prueba')
  }

  return (
    <Container>
      <Box my={3} display='flex'  component='div' justifyContent='space-between'>
        <Typography>
            Productos
        </Typography>
        <Button 
            color='primary' 
            onClick={()=>{
              setProducto(null)
              setEdit(false)
              openModal('prueba');
            }}
          variant='outlined'>
          Agregar Producto
        </Button>
      </Box>
      <TableContainer component={Paper} >
      <Table aria-label="simple table" size='small'>
        <TableHead>
          <TableRow>
            <TableCell>@</TableCell>
            <TableCell align="left">Codigo</TableCell>
            <TableCell align="left">Descripción</TableCell>
            <TableCell align="left">Unidad</TableCell>
            <TableCell align="left">Fav</TableCell>
            <TableCell align="left">Accion</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data?.data?.data.map((row:Producto) => (
            <TableRow
              key={row.id}
              
            >
              <TableCell align="left">{row.id}</TableCell>
              <TableCell align="left">{row.codigo}</TableCell>
              <TableCell align="left">{row.descripcion}</TableCell>
              <TableCell align="left">{row.unidad}</TableCell>
              <TableCell align="left"><Icon color='warning' >{row.fav?<GradeIcon/>:<StarOutlineIcon/>}</Icon></TableCell>
              <TableCell align="left"><Fab color='primary' size='small' onClick={()=>handleEditProduct(row.id)} ><EditIcon/></Fab></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    <ProductoFormModal/>
    </Container>
  )
}

export default Productos