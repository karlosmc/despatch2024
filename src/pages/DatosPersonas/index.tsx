import { Grid } from "@mui/material";
import { FormikProps } from "formik";
import PersonaForm from "../../components/Persona";
import { Guia } from "../../types/guias/guias.interface";



interface DatosPersonasProps {
  formik: FormikProps<Guia>;

}


const DatosPersonasStep = ({ formik }: DatosPersonasProps) => {

  return (
    <Grid
      container
      justifyContent="center"
      alignContent="center"
      alignItems="center"
      spacing={10}
      
    >
      <Grid item container xs={6}>
        {/* <PersonaForm title={'Destinatario'} formik={formik} fieldPrefix="destinatario" />
      </Grid>
      <Grid item container xs={6}>
        <PersonaForm title={'Comprador'} formik={formik} fieldPrefix="comprador" /> */}
      </Grid>

    </Grid>
  )
}

export default DatosPersonasStep