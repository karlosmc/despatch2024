import { TableContainer, Paper, Table, TableHead, TableRow, TableCell, TableBody,  Fab, FormControl, MenuItem, InputLabel, Box,  Select, Button, TextField, TablePagination, CircularProgress } from '@mui/material'
import React, { useState } from 'react'
import clienteAxios from '../../config/axios';



import PanToolAltIcon from '@mui/icons-material/PanToolAlt';


import { User } from '../../types/user.interface';



interface SearchUserProps {
  onCheck: (user: User) => void;
}

const SearchUser = ({ onCheck }: SearchUserProps) => {

  const token = localStorage.getItem('AUTH_TOKEN');

  const [foundUsers, setfoundUsers] = useState<User[]>([])

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
      const { data, status } = await clienteAxios(`/api/user/buscar?${searchField}=${inputQuery}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (status === 200) {
        setfoundUsers(data?.data)
        setIsLoading(false)
      }
      // console.log(data)


    }
    catch (error) {
      console.log(error)
    }
  }

  const handleCheck = (user: User) => {
    onCheck(user)
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

  foundUsers?.forEach((fil:User) => {
    rows.push(
      <TableRow
        key={fil.id}
      >
        <TableCell align="left">{fil.id}</TableCell>
        <TableCell align="left">{fil.name}</TableCell>
        <TableCell align="left">{fil.documento}</TableCell>
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
            <MenuItem value={'documento'}>Nro. Doc.</MenuItem>
            <MenuItem value={'name'}>Nombre</MenuItem>
            
            
          </Select>
        </FormControl>

      </Box>
      <TextField
        value={inputQuery.toUpperCase()}
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
              <TableCell width={'10%'} align="left">Nro.Doc.</TableCell>
              <TableCell width={'5%'} align="left">Nombre</TableCell>
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

export default SearchUser