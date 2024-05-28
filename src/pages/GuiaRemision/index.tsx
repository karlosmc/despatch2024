import React, { useEffect, useState } from 'react'
import { AddDoc, Client, DatosGenerales, Envio, EnvioChoferes, EnvioVehiculo, GuiaRemision } from '../../types/guias/guiaremision.interface';
import dayjs from 'dayjs';
import { useNotification } from '../../context/notification.context';
import { isObject, useFormik } from 'formik';
import { CompradorSchema, GuiaRemisionSchema } from '../../utils/validateGuiaRemision';
import { Button, Container, Grid, Paper, SxProps, Theme, useTheme } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DialogComponentCustom } from '../../components';
import DatosGeneralesForm from '../DatosGeneralesForm';
import Cliente from '../PersonaCliente';
import EnvioForm from '../DatosEnvioForm';
import DocumentosAdicionales from '../DocumentosAdicionales';
import DocumentoAdicional from '../DocumentosAdicionales/form';



const ChoferesValues: EnvioChoferes = {
  tipo: "",
  tipoDoc: "",
  apellidos: "",
  licencia: "",
  nombres: "",
  nroDoc: "",
};

const VehiculoValues: EnvioVehiculo = {
  placa: '',
  codEmisor: "",
  nroAutorizacion: "",
  nroCirculacion: "",
  secundarios: null,
};

const EnvioValues: Envio = {
  codTraslado: "02",
  desTraslado: "COMPRA",
  fecTraslado: dayjs().format("YYYY-MM-DDTHH:mm"),
  indicadores: [],
  indTransbordo: "",
  modTraslado: "02",
  numBultos: 0,
  pesoTotal: 2000,
  undPesoTotal: "KGM",
  // pesoItems:0,
  // sustentoPeso:''
};

const DatosGeneralesValues: DatosGenerales = {
  correlativo: '',
  fechaEmision: dayjs().format("YYYY-MM-DDTHH:mm"),
  serie: '',
  tipoDoc: '09',
  version: '2.0'
}

const initialValues: GuiaRemision = {
  datosGenerales: DatosGeneralesValues,
  destinatario: {
    numDoc: '',
    rznSocial: '',
    tipoDoc: '6'
  },
  comprador: {
    numDoc: '',
    rznSocial: '',
    tipoDoc: '6'
  },
  envio: EnvioValues,
  addDocs: [
    {
      emisor: "20318171701",
      nro: "F001-21",
      tipo: "01",
      tipoDesc: "FACTURA",
    },
  ],
  details: [{
    codigo: 'PRO0001',
    codProdSunat: '15101505',
    descripcion: 'PRODUCTO 1',
    cantidad: 10,
    unidad: 'NIU',
  }],
  choferes: ChoferesValues,
  vehiculo: VehiculoValues,
  observacion: '',
  partida: {
    codlocal: '',
    direccion: '',
    ruc: '',
    ubigeo: ''
  },
  llegada: {
    codlocal: '',
    direccion: '',
    ruc: '',
    ubigeo: ''
  },
};



type ModalsProps = {
  open: boolean;
  form: React.ReactNode | null;
  title: string;
};

const GuiaRemisionMain = () => {

  const { getError, getSuccess } = useNotification();


  const [modalsForm, setModalsForms] = useState<ModalsProps>({
    open: false,
    form: null,
    title: "",
  });

  const [adicionalDocs, setAdicionalDocs] = useState<AddDoc[]>([]);

  const handleOpenModalForm = (form: React.ReactNode, title: string) => {
    setModalsForms({ open: true, form, title });
  };

  const handleCloseModalForm = () => {
    // Cierra el modal en la posición especificada
    setModalsForms((prev) => ({ ...prev, open: false }));
  };

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: GuiaRemisionSchema,
    enableReinitialize: false,
    onSubmit: (values) => {
      // console.log(values);
      const doc = values;

      console.log(doc);
    }
  })




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


  /* ESTILOS */

  const theme = useTheme();

  const paperClient: SxProps<Theme> = {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    borderRadius: 7,
    py: 5,
    mx: 10,
    my: 2,
    [theme.breakpoints.down("sm")]: {
      mx: 0,
    },

  }

  const onHandleDatosGeneralesChange = (datosGenerales: DatosGenerales) => {
    formik.setFieldValue("datosGenerales", datosGenerales);
  }

  const handleDestinatarioChange = (cliente: Client): void => {

    formik.setFieldValue("destinatario", cliente);
    setModalsForms({ ...modalsForm, open: false });
  };

  const handleCompradorChange = (cliente: Client) => {

    formik.setFieldValue("comprador", cliente);
    setModalsForms({ ...modalsForm, open: false });
  };

  const handleEnvioChange = (envio: Envio) => {
    formik.setFieldValue("envio", envio);
  };

  const handleNewAddDoc = (newAddDoc: AddDoc): void => {
    
    setAdicionalDocs((addDoc) => [...addDoc, newAddDoc]);
    setModalsForms({ ...modalsForm, open: false });
  };

  useEffect(() => {
    // if (formik.values.addDocs.length === 0) {
      formik.setFieldValue("addDocs", adicionalDocs);
    // }
  }, [adicionalDocs]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="md" sx={{ mt: 10 }}>
        <form onSubmit={formik.handleSubmit}>
          <Grid
            container
            justifyContent="space-between"
            alignContent="center"
            alignItems="center"
          >
            {/* Datos generales */}
            <Grid spacing={2} container item xs={12}>
              <DatosGeneralesForm onChange={onHandleDatosGeneralesChange} datosGeneralesValues={formik.values.datosGenerales} />
            </Grid>
            {/* Datos generales */}

            {/* Destinatario y comprador */}
            <Grid
              mb={1}
              container
              item
              xs={12}
              textAlign="center"
              spacing={2}
            >
              <Grid item xs={6}>
                <Paper elevation={5} sx={paperClient}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={(_e) =>
                      handleOpenModalForm(
                        <Cliente
                          // initialValue={formData.destinatario}
                          initialValue={formik.values.destinatario}
                          onChange={handleDestinatarioChange}
                        />,
                        "Destinatario"
                      )
                    }
                    sx={{ height: 80, width: 100 }}
                  >
                    Destinatario
                  </Button>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper elevation={5} sx={paperClient}>
                  <Button
                    variant="outlined"
                    color="warning"
                    onClick={(_e) =>
                      handleOpenModalForm(
                        <Cliente
                          // initialValue={formData.comprador}
                          initialValue={formik.values.comprador}
                          onChange={handleCompradorChange}
                          schema={CompradorSchema}
                        />,
                        "Comprador"
                      )
                    }
                    sx={{ height: 80, width: 100 }}
                  >
                    Comprador
                  </Button>
                </Paper>
              </Grid>
            </Grid>
            {/* Destinatario y comprador */}
            {/* Envio */}
            <Grid item container xs={12}>
              <EnvioForm
                onChange={handleEnvioChange}
                EnvioValues={EnvioValues}
              />
            </Grid>
            {/* Envio */}
            {/* Documentos Adicionales */}
            <Grid item container xs={12} textAlign={'center'} justifyContent={'center'}>
              <Button
                variant="contained"
                color="secondary"
                onClick={(_e) =>
                  handleOpenModalForm(
                    <DocumentoAdicional onNewAddDoc={handleNewAddDoc} />,
                    "Documentos adicionales"
                  )
                }
                sx={{ color: "whitesmoke", fontWeight: "bold", mb: 2 }}
              >
                Agregar documentos adicionales
              </Button>

            </Grid>
            <Grid item xs={12}>
              <DocumentosAdicionales adicionales={formik.values.addDocs} />
            </Grid>

          </Grid>

        </form>
        <DialogComponentCustom
          closeButton={
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => handleCloseModalForm()}
            >
              Close
            </Button>
          }
          open={modalsForm.open}
          title={modalsForm.title}
          element={modalsForm.form}
        />
      </Container>
    </LocalizationProvider>
  )


}

export default GuiaRemisionMain


