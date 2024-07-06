import { Typography, Paper, CircularProgress, Chip } from '@mui/material';

import { ChipInterface } from '../../types/general.interface';

import { useState } from 'react';



interface ChipFavoritosProps<T extends ChipInterface>  {
  isLoading:boolean;
  items:T[];
  onPick:(favorito:ChipInterface)=>void;
  title:string;
  activo?:boolean;
}

const chipStyle={
  height: "50px",
  margin: 1,
  py: 1,
  width: 100,
  "& .MuiChip-label": {
    display: "block",
    whiteSpace: "normal",
    textAlign: "center",
    fontWeight: "bold",
  },

}

const ChipFavoritos = <T extends ChipInterface>({isLoading,items,onPick,title,activo=false}: ChipFavoritosProps<T>) => {
  
  const [chipSelected, setChipSelected] = useState(null)
  
  const handleSetFavorite=(favorito:ChipInterface)=>{
    setChipSelected(favorito.id)
    onPick(favorito)
  }
  
  return (
    <>
      <Typography sx={{ textAlign: "center" }}>{title}</Typography>
      <Paper
        elevation={15}
        sx={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          mb: 2,
          mt:1,
          py: 1,
          background:'#464646',
          borderRadius: 5,
          width: "100%",
        }}
      >
        {isLoading ?
          <CircularProgress /> :
          items?.length===0?
          <Typography color='secondary'>No hay favoritos para mostrar</Typography>:
          items?.map((favorito,index) => {
            return (

              <Chip
                variant={ chipSelected===favorito.id?'filled':'outlined'}
                color='secondary'
                sx={chipStyle}
                clickable
                key={index}
                label={favorito.nombreCorto}
                onClick={() => handleSetFavorite(favorito)}
                disabled={activo}
                
              />

            );
          })
        }

      </Paper>
    </>
  )
}

export default ChipFavoritos