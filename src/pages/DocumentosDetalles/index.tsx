
import { TableRow, TableCell, Paper, Table, TableBody, TableContainer, TableHead, Typography } from '@mui/material'
import { Detail } from '../../types/guias/guiaremision.interface'


interface Props {
    detalles: Array<Detail>
}

const DocumentosDetalles = ({detalles}:Props) => {
  // console.log(detalles);

    const renderList = ():JSX.Element[]=>{
        return detalles.map((detail,index) =>{
            return (
                <TableRow
                key={index}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell align="center">{detail.codigo}</TableCell>
                <TableCell align="center">{detail.codProdSunat}</TableCell>
                <TableCell align="center">{detail.cantidad}</TableCell>
                <TableCell align="center">{detail.descripcion}</TableCell>
                <TableCell align="center">{detail.unidad}</TableCell>
              </TableRow>
            )
        })
    }

  return (
    <>
    <Typography>
        Detalles de documento
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small" aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell component='th' style={{width:'25%',fontWeight:'bold'}} align="center">Codigo</TableCell>
              <TableCell component='th' style={{width:'25%',fontWeight:'bold'}} align="center">Cod.Sunat</TableCell>
              <TableCell component='th' style={{width:'20%',fontWeight:'bold'}} align="center">Cant.</TableCell>
              <TableCell component='th' style={{width:'30%',fontWeight:'bold'}} align="center">Descripcion</TableCell>
              <TableCell component='th' style={{width:'30%',fontWeight:'bold'}} align="center">Und.</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{renderList()}</TableBody>
        </Table>
      </TableContainer>
    </>   
  )
}

export default DocumentosDetalles