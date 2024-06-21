import { useEffect, useState } from 'react';
import { useFormik,  FormikProvider, isObject } from 'formik';

import { Box, Stepper, Step, StepLabel, Button, Grid, Typography } from '@mui/material';
import { AddDocsSchema, DatosEnvioSchema, DatosPersonasSchema, DocumentosGeneralesSchema } from '../../utils/validateGuias';
import { Guia } from '../../types/guias/guias.interface';
import { useNotification } from '../../context/notification.context';

import DatosGeneralesStep from '../DatosGenerales';
import DatosPersonasStep from '../DatosPersonas';

import DatosEnvioStep from '../DatosEnvio';
import ComprobantesAdicionalesStep from '../ComprobantesAdicionales';



const steps = ['Documentos Generales','Datos personas','Datos de envío','Comprobantes Adicionales'];

const InitialValuesGuias:Guia = {
  version:      '2.1',
  tipoDoc:      '09',
  serie:        '',
  correlativo:  '',
  observacion:  '',
  fechaEmision: '',
  codTraslado:   '',
  desTraslado:   '',
  modTraslado:   '',
  // fecTraslado:   '',
  destinatario:{
    numDoc:'',
    tipoDoc:'',
    rznSocial:''
  },
  comprador:{
    numDoc:'',
    tipoDoc:'',
    rznSocial:''
  },
  fecTraslado:'',
  indicadores:[],
  pesoItems:0,
  sustentoPeso:'',
  pesoTotal:0,
  undPesoTotal:'KGM',
  numBultos:0,
  indTransbordo:'',
  addDocs:[]

}


const validationSchemas = [
  DocumentosGeneralesSchema,
  DatosPersonasSchema,
  DatosEnvioSchema,
  AddDocsSchema

];

const CustomStepper = () => {

  const { getError } = useNotification();
  const [activeStep, setActiveStep] = useState(0);
  const [submitError, _] = useState<string | null>(null);

  const isLastStep = activeStep === steps.length - 1;

  const formik = useFormik({
    initialValues:InitialValuesGuias,
    validationSchema: validationSchemas[activeStep],
    validateOnChange: false,
    validateOnBlur: true,
    onSubmit: (values, { setSubmitting }) => {
      if (isLastStep) {
        console.log('Form Submitted:', values);
      } else {
        setActiveStep((prev) => prev + 1);
      }
      setSubmitting(false);
    },
  });

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const formContent = (step: number) => {
    switch (step) {
      case 0:
        return <DatosGeneralesStep formik={formik} />;
      case 1:
        return <DatosPersonasStep formik={formik}/>;
      case 2:
        return <DatosEnvioStep formik={formik}/>;
      case 3:
        return <ComprobantesAdicionalesStep formik={formik}/>;
      
      default:
        return <Typography variant="h6">Not Found</Typography>;
    }
  };


  useEffect(() => {
    if (!formik.isSubmitting) return;
    
    if (Object.keys(formik.errors).length > 0) {
      const ErrorValues = Object.values(formik.errors)[0];
      // console.log(ErrorValues);
      //const ErrorKeys = Object.keys(formik.errors)[0]
      if (isObject(ErrorValues)) {
        // console.log(Object.values(ErrorValues)[0])
        const ErrorValuesSub = Object.values(ErrorValues)[0];
        // const ErrorKeySub = Object.keys(ErrorKeys)[0]
        if (isObject(ErrorValuesSub)) {
          //getError(`Error en la Seccion:${Object.keys(ErrorKeySub)[0]}: ${Object.values(ErrorValuesSub)[0]}`)
          getError(`${Object.values(ErrorValuesSub)[0]}`);
        } else {
          //getError(`Error en la Seccion:${ErrorKeys.toUpperCase()}: ${ErrorValuesSub}`)
          getError(ErrorValuesSub);
        }
      } else {
        getError(ErrorValues);
      }
    }
  }, [formik]);

  return (
    <Box sx={{ padding: 2 }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label, index) => (
          <Step key={index}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <FormikProvider  value={formik}>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              {formContent(activeStep)}
            </Grid>
            {submitError && (
              <Grid item xs={12}>
                <Typography color="error">error{submitError}</Typography>
              </Grid>
            )}
            <Grid item xs={12}>
              <Button disabled={activeStep === 0} onClick={handleBack}>
                Back
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={formik.isSubmitting}
              >
                {isLastStep ? 'Submit' : 'Next'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </FormikProvider>
    </Box>
  );
};

export default CustomStepper;