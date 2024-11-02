import {  FormControl, InputLabel, Select, TextField, MenuItem } from '@mui/material'
import React, { useState } from 'react'
import { BuscarOpcionesInterface } from '../../types/buscar.interface'



interface BuscarProps {
  opciones: BuscarOpcionesInterface[],
  onSearchChange: (field: string, query: string) => void;
}

const BuscarComponent = ({ opciones, onSearchChange }: BuscarProps) => {

  const [searchField, setSearchField] = useState<string>('');

  const [inputQuery, setInputQuery] = useState<string>('');

  const [typeInput, setTypeInput] = useState('text')

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {

    
    const newField = event.target.value as string;
    // console.log(newField);

    // console.log(opciones);
    const typeField = opciones.find(item=>item.codigo===newField).type;
    setTypeInput(typeField)
    
    setSearchField(newField);
    onSearchChange(newField, inputQuery);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // setInputQuery(event.target.value as string);

    const newQuery = event.target.value as string;
    setInputQuery(newQuery);
    onSearchChange(searchField, newQuery);
  }

  return (
    <>
      <FormControl fullWidth margin='normal' size='small'>
        <InputLabel id="demo-simple-select-label">Búsqueda por:</InputLabel>
        <Select
          name='codigo'
          value={searchField}
          label="Búsqueda por"
          onChange={handleChange}
        >
          {opciones.map(item => (
            <MenuItem key={item.codigo} value={item.codigo}>{item.valor}</MenuItem>
          ))}

        </Select>
      </FormControl>


      <TextField
        value={inputQuery.toUpperCase()}
        type={typeInput}
        onChange={handleInputChange}
        label='Texto a buscar'
        margin='normal'
        name='descripcion'
        size='small'
        InputLabelProps={{shrink:true}}
        fullWidth
        sx={{ mb: 1 }}

      />
    </>
  )
}

export default BuscarComponent