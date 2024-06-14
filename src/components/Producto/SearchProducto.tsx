import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Icon, Fab, FormControl, MenuItem, InputLabel, Box, SelectChangeEvent, Select, Button, TextField } from '@mui/material'
import React, { useState } from 'react'
import clienteAxios from '../../config/axios';
import { Producto } from '../../types/producto.interface';

import StarOutlineIcon from '@mui/icons-material/StarOutline';
import GradeIcon from '@mui/icons-material/Grade';


import PanToolAltIcon from '@mui/icons-material/PanToolAlt';


interface SearchProductoProps {
  onCheck : (producto:Producto)=>void;
}

const SearchProducto = ({onCheck}:SearchProductoProps) => {

  const token = localStorage.getItem('AUTH_TOKEN');

  const [foundProducts, setfoundProducts] = useState<Producto[]>([])

  const [searchField, setSearchField] = useState('')

  const [inputQuery, setInputQuery] = useState('')

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchField(event.target.value as string);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputQuery(event.target.value as string);
  }

  const handleSearch = async () => {
    try {
      const { data,status } = await clienteAxios(`/api/productos/buscar?${searchField}=${inputQuery}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if(status===200){
        setfoundProducts(data?.data)
      }
      // console.log(data)


    }
    catch (error) {
      console.log(error)
    }
  }

const handleCheck = (producto:Producto)=>{
  onCheck(producto)
}

  return (
    <>
      <Box display={'flex'} flexDirection={'row'}>
        <FormControl fullWidth margin='normal' size='small'>
          <InputLabel id="demo-simple-select-label">Búsqueda por:</InputLabel>
          <Select
            name='codigo'
            value={searchField}
            label="Búsqueda por"
            onChange={handleChange}
          >
            <MenuItem value={'codigo'}>Código</MenuItem>
            <MenuItem value={'descripcion'}>Descripción</MenuItem>
          </Select>
        </FormControl>

      </Box>
      <TextField
        value={inputQuery}
        onChange={handleInputChange}
        label='Texto a buscar'
        margin='normal'
        name='descripcion'
        size='small'
        fullWidth
        sx={{ mb: 1 }}

      />
      <Button fullWidth sx={{ my: 2 }} size='small' variant='contained' color='primary' onClick={handleSearch}>
        Buscar
      </Button>

      <TableContainer component={Paper} >
        <Table aria-label="simple table" size='small'>
          <TableHead>
            <TableRow>
              <TableCell>Id</TableCell>
              <TableCell align="left">Codigo</TableCell>
              <TableCell align="left">Descripción</TableCell>
              <TableCell align="left">Unidad</TableCell>
              <TableCell align="left">Fav</TableCell>
              <TableCell align="left">Seleccionar</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {foundProducts.map((row: Producto) => (
              <TableRow
                key={row.id}
              >
                <TableCell align="left">{row.id}</TableCell>
                <TableCell align="left">{row.codigo}</TableCell>
                <TableCell align="left">{row.descripcion}</TableCell>
                <TableCell align="left">{row.unidad}</TableCell>
                <TableCell align="left"><Icon color='warning' >{row.fav ? <GradeIcon /> : <StarOutlineIcon />}</Icon></TableCell>
                <TableCell align="center"><Fab color='success' size='small' onClick={()=>handleCheck(row)}><PanToolAltIcon sx={{color:'white'}} /></Fab></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  )
}

export default SearchProducto