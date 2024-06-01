import {
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  SxProps,
  Theme,
  useTheme,
} from "@mui/material";
import { AddDoc } from "../../types/guias/guiaremision.interface";



interface Props {
  adicionales: Array<AddDoc>;
}

const DocumentosAdicionales = ({ adicionales }: Props) => {

  const theme = useTheme()

  const colorStyles = theme.palette['primary'] || theme.palette.success;

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



//  console.log(adicionales);
  const renderList = (): JSX.Element[] => {
    return adicionales.map((adic, index) => {
      // console.log(index);
      return (
        
          <TableRow
            key={index}
            
          >
            <TableCell sx={customTableCell} align="center">{adic.emisor}</TableCell>
            <TableCell sx={customTableCell} align="center">{adic.nro}</TableCell>
            <TableCell sx={customTableCell} align="center">{adic.tipo}</TableCell>
            <TableCell sx={customTableCell} align="center">{adic.tipoDesc}</TableCell>
          </TableRow>

      );
    });
  };
  

  return (
    
    <>
      <Typography textAlign={'center'} my={1} fontWeight={800} color={theme.palette.primary.dark}>
        Lista de documentos
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small" aria-label="simple table"
          sx={customTable}
        >
          <TableHead sx={customTableHeader}>
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

export default DocumentosAdicionales;
