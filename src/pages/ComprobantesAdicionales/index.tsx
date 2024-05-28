import { TableRow, TableCell, Typography, TableContainer, Paper, Table, TableHead, TableBody } from "@mui/material";
import { FormikProps } from "formik";
import { AddDoc, Guia } from "../../types/guias/guias.interface";
import ComprobantesAdicionalesForm from "./Form";
import { useEffect, useState } from "react";


interface ComprobantesAdicionalesProps {
  formik: FormikProps<Guia>
}

const ComprobantesAdicionalesStep = ({formik}:ComprobantesAdicionalesProps) => {

  const [adicionalDocs, setAdicionalDocs] = useState<AddDoc[]>(formik.values.addDocs);

  const handleNewAddDoc = (newAddDoc: AddDoc): void => {
    setAdicionalDocs((addDoc) => [...addDoc, newAddDoc]);
  };

  useEffect(() => {
    // if (formik.values.addDocs.length === 0) {
      formik.setFieldValue("addDocs", adicionalDocs);
    // }
  }, [adicionalDocs]);


  const adicionales = formik.values.addDocs;

  const renderList = (): JSX.Element[] => {
    return adicionales?.map((adic, index) => {
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
    <Typography mt={3}>
      Documentos adicionales
    </Typography>

    <ComprobantesAdicionalesForm  onNewAddDoc={handleNewAddDoc}/>
    <TableContainer component={Paper} sx={{marginTop:2}}>
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
  )
}

export default ComprobantesAdicionalesStep