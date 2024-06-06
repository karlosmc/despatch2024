
import { TableRow, TableCell, Paper, Table, TableBody, TableContainer, TableHead, Typography, useTheme, SxProps, Theme, IconButton } from '@mui/material'
import { Detail } from '../../types/guias/guiaremision.interface'

import ClearIcon from '@mui/icons-material/Clear';


interface Props {
    detalles: Array<Detail>
    onDelete:(item:Detail)=>void
}

const DocumentosDetalles = ({detalles,onDelete}:Props) => {
  // console.log(detalles);

  const theme = useTheme()

  const colorStyles = theme.palette['secondary'] || theme.palette.success;

  const customTable: SxProps<Theme> = {
      border: `2px solid ${colorStyles.main}`,
      backgroundColor: colorStyles.light,
  };

  const customTableHeader: SxProps<Theme> = {
    backgroundColor: colorStyles.dark,
  }

  const customTableCell: SxProps<Theme> = {
    border: `1px solid ${colorStyles.main}`,
  }


    const renderList = ():JSX.Element[]=>{
        return detalles.map((detail,index) =>{
            return (
                <TableRow
                key={index}
              >
                <TableCell sx={customTableCell} align="center">{detail.codigo}</TableCell>
                <TableCell sx={customTableCell} align="center">{detail.codProdSunat}</TableCell>
                <TableCell sx={customTableCell} align="center">{detail.cantidad}</TableCell>
                <TableCell sx={customTableCell} align="center">{detail.descripcion}</TableCell>
                <TableCell sx={customTableCell} align="center">{detail.unidad}</TableCell>
                <TableCell sx={customTableCell} align="center"><IconButton onClick={()=>onDelete(detail)} sx={{background:theme.palette.warning.main,'&:hover':{background:theme.palette.warning.light}}}><ClearIcon sx={{color:'white'}} fontSize="small" /></IconButton></TableCell>
              </TableRow>
            )
        })
    }

  return (
    <>
    <Typography textAlign={'center'} my={1} fontWeight={800} color={theme.palette.secondary.light}>
        Detalles de documento
      </Typography>
      <TableContainer component={Paper}>
        <Table sx={customTable} size="small" aria-label="simple table">
          <TableHead sx={customTableHeader}>
            <TableRow>
              <TableCell component='th' style={{width:'10%',fontWeight:'bold'}} align="center">Codigo</TableCell>
              <TableCell component='th' style={{width:'10%',fontWeight:'bold'}} align="center">Cod.Sunat</TableCell>
              <TableCell component='th' style={{width:'5%',fontWeight:'bold'}} align="center">Cant.</TableCell>
              <TableCell component='th' style={{width:'50%',fontWeight:'bold'}} align="center">Descripcion</TableCell>
              <TableCell component='th' style={{width:'10%',fontWeight:'bold'}} align="center">Und.</TableCell>
              <TableCell component='th' style={{width:'5%',fontWeight:'bold'}} align="center">@</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{renderList()}</TableBody>
        </Table>
      </TableContainer>
    </>   
  )
}

export default DocumentosDetalles