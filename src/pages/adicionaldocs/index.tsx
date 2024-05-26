import {
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
} from "@mui/material";
import { AddDoc } from "../../types/doc.interface";

interface Props {
  adicionales: Array<AddDoc>;
}

const AddDocs = ({ adicionales }: Props) => {


//  console.log(adicionales);
  const renderList = (): JSX.Element[] => {
    return adicionales.map((adic, index) => {
      // console.log(index);
      return (
        
          <TableRow
            key={index}
            sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
          >
            <TableCell align="center">{adic.emisor}</TableCell>
            <TableCell align="center">{adic.nro}</TableCell>
            <TableCell align="center">{adic.tipo}</TableCell>
            <TableCell align="center">{adic.tipoDesc}</TableCell>
          </TableRow>

      );
    });
  };

  return (
    
    <>
      <Typography>
        Documentos adicionales
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small" aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell component='th' style={{width:'25%',fontWeight:'bold'}} align="center">Emisor</TableCell>
              <TableCell component='th' style={{width:'25%',fontWeight:'bold'}} align="center">Nro.</TableCell>
              <TableCell component='th' style={{width:'20%',fontWeight:'bold'}} align="center">Tipo</TableCell>
              <TableCell component='th' style={{width:'30%',fontWeight:'bold'}} align="center">Descripcion</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{renderList()}</TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default AddDocs;
