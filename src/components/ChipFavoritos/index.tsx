import { Typography, Paper, CircularProgress, Chip, IconButton, Box, useTheme } from '@mui/material';

import { ChipInterface } from '../../types/general.interface';

import { useEffect, useRef, useState } from 'react';

import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
// import ArrowForwardIos from '@mui/icons-material/ArrowForwardIos';


interface ChipFavoritosProps<T extends ChipInterface> {
  isLoading: boolean;
  items: T[];
  onPick: (favorito: ChipInterface) => void;
  title: string;
  activo?: boolean;
}


const ITEMS_PER_PAGE = 8;

const ChipFavoritos = <T extends ChipInterface>({ isLoading, items, onPick, title, activo = false }: ChipFavoritosProps<T>) => {


  const theme = useTheme()

  const chipStyle = {
    height: "50px",
    margin: '4px',
    py: 1,
    width: 100,
    "& .MuiChip-label": {
      display: "block",
      whiteSpace: "normal",
      textAlign: "center",
      fontWeight: "bold",
    },
    [theme.breakpoints.down("sm")]: {
      width: 80,
    },
  }

  
  const [chipSelected, setChipSelected] = useState(null)

  const [page, setPage] = useState(0);
  const chipRefs = useRef<any[]>([]);

  const handleSetFavorite = (favorito: ChipInterface) => {
    setChipSelected(favorito.id)
    onPick(favorito)
  }

  const handleNextPage = () => {
    setPage(prevPage => Math.min(prevPage + 1, Math.floor(items.length / ITEMS_PER_PAGE)));
  };

  const handlePrevPage = () => {
    setPage(prevPage => Math.max(prevPage - 1, 0));
  };

  const paginatedItems = items.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE);

  useEffect(() => {
    chipRefs.current.forEach(chip => {
      if (chip) {
        const label = chip.querySelector('.MuiChip-label');
        if (label.scrollWidth > label.clientWidth) {
          label.style.fontSize = '12px';
          if (label.scrollWidth > label.clientWidth) {
            label.style.fontSize = '10px';
          }
        }
      }
    });
  }, [paginatedItems]);

  return (
    <>
      <Typography sx={{ textAlign: "center" }}>{title}</Typography>
      <Paper
        elevation={15}
        sx={{
          display: "flex",
          // justifyContent: "center",
          // flexWrap: "wrap",
          flexDirection: 'row',
          justifyContent:'space-between',
          mb: 2,
          mt: 1,
          py: 1,
          background: '#464646',
          borderRadius: 5,
          width: "100%",
          // height:150
        }}
      >
        <IconButton onClick={handlePrevPage} disabled={page === 0}>
          <ArrowBackIosNewIcon />
        </IconButton>
        {isLoading ?
          <CircularProgress />
          : items?.length === 0 ?
            <Typography color='secondary'>No hay favoritos para mostrar</Typography>
            :

            <Box display={'flex'} flexWrap={'wrap'} >

              {paginatedItems?.map((favorito, index) => {
                return (

                  <Chip
                    ref={el => chipRefs.current[index] = el}
                    variant={chipSelected === favorito.id ? 'filled' : 'outlined'}
                    color='secondary'
                    sx={chipStyle}
                    clickable
                    key={index}
                    label={favorito.nombreCorto}
                    onClick={() => handleSetFavorite(favorito)}
                    disabled={activo}

                  />

                );
              })}
            </Box>
        }
        <IconButton onClick={handleNextPage} disabled={(page + 1) * ITEMS_PER_PAGE >= items.length}>
          <ArrowForwardIosIcon />
        </IconButton>

      </Paper>
    </>
  )
}

export default ChipFavoritos