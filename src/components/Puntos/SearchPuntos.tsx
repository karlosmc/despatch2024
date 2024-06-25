import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody, Icon, Fab, FormControl, MenuItem, InputLabel, Box,  Select, Button, TextField, TablePagination, CircularProgress } from '@mui/material'
import React, { useState } from 'react'
import clienteAxios from '../../config/axios';

import StarOutlineIcon from '@mui/icons-material/StarOutline';
import GradeIcon from '@mui/icons-material/Grade';

import StoreIcon from '@mui/icons-material/Store';
import StoreOutlinedIcon from '@mui/icons-material/StoreOutlined';


import PanToolAltIcon from '@mui/icons-material/PanToolAlt';
import { puntoUbicacion } from '../../types/puntoubicacion.interface';



interface SearchProductoProps {
  onCheck: (puntos: puntoUbicacion) => void;
}

const SearchPuntos = ({ onCheck }: SearchProductoProps) => {

  const token = localStorage.getItem('AUTH_TOKEN');

  const [foundPuntos, setfoundPuntos] = useState<puntoUbicacion[]>([])

  const [searchField, setSearchField] = useState('')

  const [inputQuery, setInputQuery] = useState('')

  const [isLoading, setIsLoading] = useState(false);




  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchField(event.target.value as string);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputQuery(event.target.value as string);
  }

  const handleSearch = async () => {
    try {
      setIsLoading(true)
      const { data, status } = await clienteAxios(`/api/puntos/buscar?${searchField}=${inputQuery}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (status === 200) {
        setfoundPuntos(data?.data)
        setIsLoading(false)
      }
      // console.log(data)


    }
    catch (error) {
      console.log(error)
    }
  }

  const handleCheck = (puntos: puntoUbicacion) => {
    onCheck(puntos)
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

  const rows = [];

  foundPuntos?.forEach((fil:puntoUbicacion) => {
    rows.push(
      <TableRow
        key={fil.id}
      >
        <TableCell align="left">{fil.id}</TableCell>
        <TableCell align="left">{fil.ruc}</TableCell>
        <TableCell align="left">{fil.codLocal}</TableCell>
        <TableCell align="left">{fil.direccion}</TableCell>
        <TableCell align="left">{fil.fullubigeo}</TableCell>
        
        <TableCell align="left"><Icon color='warning' >{fil.fav ? <GradeIcon /> : <StarOutlineIcon />}</Icon></TableCell>
        <TableCell align="left"><Icon color={fil.isCompany?'info':'action'} >{fil.isCompany ? <StoreIcon /> : <StoreOutlinedIcon />}</Icon></TableCell>
        {/* <TableCell align="left"><Fab color='primary' size='small' onClick={() => handleEditPunto(fil.id)} ><EditIcon /></Fab></TableCell> */}
        <TableCell align="center"><Fab color='success' size='small' onClick={()=>handleCheck(fil)}><PanToolAltIcon sx={{color:'white'}} /></Fab></TableCell>
      </TableRow>
    )
  })

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

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
            <MenuItem value={'ruc'}>RUC</MenuItem>
            <MenuItem value={'ubigeo'}>UBIGEO</MenuItem>
            <MenuItem value={'direccion'}>Dirección</MenuItem>
            <MenuItem value={'fullubigeo'}>Ubigeo completo</MenuItem>
            <MenuItem value={'nombreCorto'}>Nombre corto</MenuItem>
            
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
        inputProps={{ style: { textTransform: "uppercase" } }}

      />
      <Button fullWidth sx={{ my: 2 }} size='small' variant='contained' color='primary' onClick={handleSearch}>
        Buscar
      </Button>

      <TableContainer component={Paper} >
        <Table aria-label="simple table" size='small'>
          <TableHead>
            <TableRow>
              <TableCell width={'5%'}>Id</TableCell>
              <TableCell width={'10%'} align="left">Ruc</TableCell>
              <TableCell width={'5%'} align="left">Cod. Local</TableCell>
              <TableCell width={'40%'} align="left">Dirección</TableCell>
              <TableCell width={'20%'} align="left">Ubigeo</TableCell>
              <TableCell width={'10%'} align="left">Fav?</TableCell>
              <TableCell width={'10%'} align="left">Propio?</TableCell>
              <TableCell width={'10%'} align="left">Seleccionar</TableCell>
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
    </>
  )
}

export default SearchPuntos