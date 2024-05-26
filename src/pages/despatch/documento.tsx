import React, { useEffect, useState } from "react";
import {
  Doc,
  Company,
  Client,
  Envio,
  //AddDoc,
  Detail,
  Address,
  Direccion,
  Vehiculo,
  Puerto,
  AddDoc,
  Choferes,
  //Transportista,
  // Choferes,
} from "../../types/doc.interface";
import {
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  SelectChangeEvent,
  Button,
  Paper,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
  Box,
  CircularProgress,
  FormHelperText,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
//import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
//import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
//import { es } from "date-fns/locale";
import dayjs from "dayjs";
//import Destinatario from "./destinatario";
import Details from "../details";
import FormDetail from "../details/formDetails";
// import { useDialog } from "../../context/dialog.context";
import FormAddDocs from "../adicionaldocs/formDocs";
import AddDocs from "../adicionaldocs";
import Cliente from "../Cliente/formCliente";
import EnvioForm from "../envio";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// import { useParamsSunat } from "../../context/params.context";
import { useTokenSunat } from "../../context/token.context";
import { DialogComponentCustom } from "../../components";
import { isObject, useFormik } from "formik";
import { useNotification } from "../../context/notification.context";
import {
  CompradorSchema,
  DocumentValidateSchema,
} from "../../utils/validateForm";
import { DataArray } from "@mui/icons-material";
import { UserLogin } from "../../types/login.interface";

//import { client } from "../../api/client";



/* const TransportistaValues: Transportista = {
  id: "",
  nroMtc: "",
  numDoc: "",
  tipoDoc: "",
  rznSocial: "",
}; */

type ModalsProps = {
  open: boolean;
  form: React.ReactNode | null;
  title: string;
};

const DocumentoElectronico: React.FC = () => {
  // const { data, isLoading } = useParamsSunat();
  // console.log(data);
  const { token } = useTokenSunat();
  const {sunatParams:data} = token

  const dataUser:UserLogin = JSON.parse(localStorage.getItem('userlogin'));
  // console.log(dataUser.clientes);

  const serie = dataUser.sercor.serie
  const correlativo = parseInt(dataUser.sercor.correlativo)+1

  const PrincipalDriver = dataUser.driver;


  const { getError, getSuccess } = useNotification();

  const DireccionValues: Direccion = {
    codlocal: "",
    direccion: "",
    ruc: "",
    ubigeo: "",
  };
  
  const ClientValues: Client = {
    numDoc: "",
    rznSocial: "",
    tipoDoc: "",
  };
  
  const PuertoValues: Puerto = {
    codigo: "",
    nombre: "",
  };

  const ChoferValues: Choferes = {
    tipo: "",
    tipoDoc: "",
    apellidos: "",
    licencia: "",
    nombres: "",
    nroDoc: "",
  };
  
  const VehiculoValues: Vehiculo = {
    placa: dataUser.vehiculo,
    codEmisor: "",
    nroAutorizacion: "",
    nroCirculacion: "",
    secundarios: null,
  };
  
  const EnvioValues: Envio = {
    codTraslado: "02",
    contenedores: [],
    desTraslado: "COMPRA",
    fecTraslado: dayjs().format("YYYY-MM-DDTHH:mm"),
  
    indicadores: [],
    indTransbordo: "",
    llegada: DireccionValues,
    // llegada: {
    //   codlocal: "0000",
    //   direccion: "MI CASA",
    //   ruc: "20519666601",
    //   ubigeo: "230101",
    // },
    modTraslado: "02",
    numBultos: 0,
    partida: DireccionValues,
    // partida: {
    //   codlocal: "0000",
    //   direccion: "MI CASA",
    //   ruc: "20519666601",
    //   ubigeo: "230102",
    // },
    pesoTotal: 2000,
    undPesoTotal: "KGM",
    vehiculo: VehiculoValues,
    aeropuerto: null,
    puerto: null,
    choferes: [ PrincipalDriver?PrincipalDriver:ChoferValues ],
  };
  const AddressValues: Address = {
    codigoPais: "PE",
    codLocal: "",
    createdAt: new Date(),
    departamento: "",
    distrito: "",
    direccion: "",
    id: "",
    provincia: "",
    ubigeo: "",
    urbanizacion: "",
  };

  const CompanyValues: Company = {
    address: AddressValues,
    createdAt: new Date(),
    email: "",
    nombreComercial: "",
    razonSocial: "",
    ruc: "",
    telephone: "",
  };

  const initialValues: Doc = {
    version: "2.0",
    tipoDoc: "09",
    serie: serie,
    correlativo: correlativo.toString(),
    observacion: "",
    fechaEmision: dayjs().format("YYYY-MM-DDTHH:mm"),
    company: CompanyValues,
    destinatario: {
      numDoc: "",
      rznSocial: "",
      tipoDoc: "6",
      direccion:'',
      ubigeo:''
    },
    comprador: null,
    // tercero: ClientValues,
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
      codigo:'PRO0001',
      codProdSunat:'15101505',
      descripcion:'PRODUCTO 1',
      cantidad:10,
      unidad:'NIU',
    }],
  };

  const [modalsForm, setModalsForms] = useState<ModalsProps>({
    open: false,
    form: null,
    title: "",
  });

  const handleOpenModalForm = (form: React.ReactNode, title: string) => {
    setModalsForms({ open: true, form, title });
  };

  const handleCloseModalForm = () => {
    // Cierra el modal en la posición especificada
    setModalsForms((prev) => ({ ...prev, open: false }));
  };

  /* const [openModal, setOpenModal] = useState<boolean>(false);

  const [openModalAdd, setOpenModalAdd] = useState<boolean>(false);
  const [openModalDestinatario, setOpenModalDestinatario] =
    useState<boolean>(false);
  const [openModalTercero, setOpenModalTercero] = useState<boolean>(false);

  const { getModal } = useDialog(); */

  const formik = useFormik({
    initialValues: initialValues,
    validationSchema: DocumentValidateSchema,
    enableReinitialize: false,
    onSubmit: (values) => {
      // console.log(values);
      const doc = values;

      console.log(doc);

    return;

      const x = Promise.resolve();

      x
      .then((_x) => sendApi({ doc }, "GeneraXmlDespatch"))
      .then((res) =>
        {
          const {response} = res;
          if(data.certificado===''){
            getError('NO HAY UN TOKEN GENERADO');
            return;
          }
          // console.log(response);
          if(response.Exito){
            const sign ={
              'CertificadoDigital':data.certificado,
              'PasswordCertificado':data.clavecertificado,
              'TramaXmlSinFirma':res.response.TramaXmlSinFirma
            }
            return sign
          }
        }
      )
      .then(sign =>sendApi(sign,'FirmarXml'))
      .then(resSign=>{
        
        const {response} = resSign;

        if(token.access_token===''){
          getError('NO HAY UN TOKEN GENERADO');
          return;
        }
        if(response.Exito){
          const request ={
            'Ruc':'',
            'EndPointUrl':data.urlsend,
            'TramaXmlFirmado':response.TramaXmlFirmado,
            'TipoDocumento':formik.values.tipoDoc,
            'IdDocumento':formik.values.serie+'-'+formik.values.correlativo,
            'token':token.access_token
          }
          // console.log('request',request);
          return request
        }
      })
      .then(send => sendApi(send,'SendDespatch'))
      .then(resSend=>{
        if(resSend.exito){
          const consult = {
            "access_token":token.access_token,
            "EndPointUrl":`${data.urlconsult}${resSend.numTicket}`
          }
          // console.log(consult);
          return consult;
        }
      })
      .then(consult => sendApi(consult,'ConsultaGuia'))
      .then(resConsult => {

        getSuccess(JSON.stringify(resConsult.CdrResponse));
        console.log(resConsult)
      }
      )
      ;

      // getSuccess("Comprobante guardado con EXITO");

      // sendDocument(values)
      // .then(res=>{

      // })
    },
  });

  // const sendDocument = async (doc: Doc) => {
  //   const url = `http://192.168.30.199/apiguias/GeneraXmlDespatch`;

  //   const options = {
  //     method: "post",
  //     headers: {
  //       "Content-type": "application/json",
  //     },
  //     body: JSON.stringify({ doc }),
  //   };
  //   const resp = await fetch(url, options);
  //   return resp.json();
  // };

  const API_GUIAS = import.meta.env.VITE_API_URL_GUIAS


  const sendApi = async (param: any, api: string) => {
    const url = `${API_GUIAS}${api}`;

    const options = {
      method: "post",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify(param),
    };
    const resp = await fetch(url, options);
    return resp.json();
  };

  const [formData, setFormData] = useState<Doc | null>(initialValues);

  const [detalles, setDetalles] = useState<Detail[]>([]);

  const [adicionalDocs, setAdicionalDocs] = useState<AddDoc[]>([]);

  const handleNewDetail = (newDetail: Detail): void => {
    // console.log(newDetail);
    setDetalles((detalles) => [...detalles, newDetail]);
    // setFormData((prevData) => ({
    //   ...prevData,
    //   details: [...prevData.details, newDetail],
    // }));
    //setOpenModal(false);
    setModalsForms({ ...modalsForm, open: false });
  };
  // <Cliente cliente={formData.destinatario || ClientValues} onChange={handleDestinatarioChange}/>

  const handleNewAddDoc = (newAddDoc: AddDoc): void => {
    // console.log(newAddDoc);
    
    setAdicionalDocs((addDoc) => [...addDoc, newAddDoc]);
    // setFormData((prevData) => ({
    //   ...prevData,
    //   addDocs: [...prevData.addDocs, newAddDoc],
    // }));

    // formik.setFieldValue('addDocs',[newAddDoc]);

    //setOpenModalAdd(false);
    setModalsForms({ ...modalsForm, open: false });
  };

  useEffect(() => {
    // if (formik.values.addDocs.length === 0) {
      formik.setFieldValue("addDocs", adicionalDocs);
    // }
  }, [adicionalDocs]);

  useEffect(() => {
    // if (formik.values.details.length === 0) {
      formik.setFieldValue("details", detalles);
    // }
  }, [detalles]);

  /*   useEffect(() => {
    getModal(
      <FormDetail onNewDetail={handleNewDetail} />,
      "Agregar detalles",
      openModal,
      <Button
        variant="outlined"
        color="secondary"
        onClick={() => setOpenModal(false)}
      >
        Cancel
      </Button>
    );
  }, [openModal]);

  useEffect(() => {
    getModal(
      <FormAddDocs onNewAddDoc={handleNewAddDoc} />,
      "Agregar Documentos adicionales",
      openModalAdd,
      <Button
        variant="outlined"
        color="secondary"
        onClick={() => setOpenModalAdd(false)}
      >
        Cancel
      </Button>
    );
  }, [openModalAdd]);

  useEffect(() => {
    getModal(
      <Cliente
        initialValue={formData.destinatario}
        onChange={handleDestinatarioChange}
      />,
      "Destinatario",
      openModalDestinatario,
      <Button
        variant="outlined"
        color="secondary"
        onClick={() => setOpenModalDestinatario(false)}
      >
        Cancel
      </Button>
    );
  }, [openModalDestinatario]);

  useEffect(() => {
    getModal(
      <Cliente
        initialValue={formData.tercero}
        onChange={handleTerceroChange}
      />,
      "Tercero",
      openModalTercero,
      <Button
        variant="outlined"
        color="secondary"
        onClick={() => setOpenModalTercero(false)}
      >
        Cancel
      </Button>
    );
  }, [openModalTercero]); */

  const handleDestinatarioChange = (cliente: Client): void => {
    // setFormData((prevData) => ({
    //   ...prevData,
    //   destinatario: cliente,
    // }));
    //setOpenModalDestinatario(false);
    formik.setFieldValue("destinatario", cliente);
    setModalsForms({ ...modalsForm, open: false });
  };

  const handleCompradorChange = (cliente: Client) => {
    // setFormData((prevData) => ({
    //   ...prevData,
    //   comprador: cliente,
    // }));
    //setOpenModalTercero(false);
    formik.setFieldValue("comprador", cliente);
    setModalsForms({ ...modalsForm, open: false });
  };

  const handleEnvioChange = (envio: Envio) => {
    formik.setFieldValue("envio", envio);
  };

  // const handleChange = (
  //   evt: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  // ) => {
  //   const { name, value } = evt.target;
  //   setFormData((prevData) => ({ ...prevData, [name]: value }));
  // };

  // const SelectHandleChange = (evt: SelectChangeEvent<unknown>) => {
  //   const { name, value } = evt.target;
  //   setFormData((prevData) => ({ ...prevData, [name]: value }));
  //   //console.log(token);
  // };

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

  //styles

  const theme = useTheme();

  const paperClient = {
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
  };

  return (
    <>
      {/* {isLoading ? (
        <Container maxWidth="md" sx={{ height: "100vh" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <CircularProgress size={100} />
          </Box>
        </Container>
      ) : ( */}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Container maxWidth="md" sx={{ mt: 10 }}>
            <form onSubmit={formik.handleSubmit}>
              <Grid
                container
                justifyContent="space-between"
                alignContent="center"
                alignItems="center"
              >
                <Grid spacing={2} container item xs={12}>
                  <Grid item lg={4} xs={12}>
                    <FormControl fullWidth size="small">
                      <InputLabel id="demo-simple-select-label">
                        Tipo Documento
                      </InputLabel>
                      <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        label="Tipo Documento"
                        value={"G"}
                      >
                        <MenuItem value="G">
                          GUIA DE REMISION ELECTRONICA
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item lg={2} xs={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel id="demo-simple-select-label">
                        Serie
                      </InputLabel>
                      <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={formik.values.serie}
                        // value={formData?.serie}
                        label="Serie"
                        // onChange={(e: SelectChangeEvent): void =>
                        //   SelectHandleChange(e)
                        // }
                        onChange={formik.handleChange}
                        error={
                          formik.touched.serie && Boolean(formik.errors.serie)
                        }
                        onBlur={formik.handleBlur}
                        // helperText={formik.touched.serie && formik.errors.serie}
                        name="serie"
                      >
                        <MenuItem value={serie}>{serie}</MenuItem>
                        {/* <MenuItem value={"T002"}>T002</MenuItem>
                        <MenuItem value={"T003"}>T003</MenuItem> */}
                      </Select>
                      {/* <FormHelperText component={Typography} color="red">{formik.touched.serie && formik.errors.serie}</FormHelperText> */}
                    </FormControl>
                  </Grid>
                  <Grid item lg={2} xs={6}>
                    <TextField
                      size="small"
                      name="correlativo"
                      //value={formData?.correlativo}
                      value={formik.values.correlativo}
                      /* onChange={(
                        e: React.ChangeEvent<HTMLInputElement>
                      ): void => handleChange(e)} */
                      type="text"
                      label="Número Documento"
                      error={
                        formik.touched.correlativo &&
                        Boolean(formik.errors.correlativo)
                      }
                      onBlur={formik.handleBlur}
                      helperText={
                        formik.touched.correlativo && formik.errors.correlativo
                      }
                      onChange={formik.handleChange}
                    />
                  </Grid>
                  <Grid item lg={4} xs={12}>
                    <TextField
                      fullWidth
                      size="small"
                      id="datetime-local"
                      label="Fecha de Emision"
                      name="fechaEmision"
                      type="datetime-local"
                      // value={formData?.fechaEmision}
                      value={formik.values.fechaEmision}
                      /* onChange={(
                        e: React.ChangeEvent<HTMLInputElement>
                      ): void => handleChange(e)} */
                      style={{ colorScheme: "dark" }}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      error={
                        formik.touched.fechaEmision &&
                        Boolean(formik.errors.fechaEmision)
                      }
                      onBlur={formik.handleBlur}
                      helperText={
                        formik.touched.fechaEmision &&
                        formik.errors.fechaEmision
                      }
                      onChange={formik.handleChange}
                    />
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    margin="normal"
                    size="small"
                    fullWidth
                    name="observacion"
                    multiline
                    maxRows={2}
                    minRows={2}
                    label="Observaciones"
                    // value={formData?.observacion}
                    // onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
                    //   handleChange(e)
                    // }
                    sx={{ mt: 1.5, mb: 1.5 }}
                    value={formik.values.observacion}
                    // required
                    onChange={formik.handleChange}
                    error={
                      formik.touched.observacion &&
                      Boolean(formik.errors.observacion)
                    }
                    onBlur={formik.handleBlur}
                    helperText={
                      formik.touched.observacion && formik.errors.observacion
                    }
                  />
                </Grid>
                <Accordion sx={{ width: "100%" }}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel01a-content"
                    id="panel01a-header"
                  >
                    <Typography>Destinatario / Comprador</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
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
                  </AccordionDetails>
                </Accordion>
              </Grid>
              <Grid container>
                <Grid item container xs={12}>
                  <EnvioForm
                    onChange={handleEnvioChange}
                    EnvioValues={EnvioValues}
                  />
                </Grid>
              </Grid>
              <Stack>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={(_e) =>
                    handleOpenModalForm(
                      <FormAddDocs onNewAddDoc={handleNewAddDoc} />,
                      "Documentos adicionales"
                    )
                  }
                  sx={{ color: "whitesmoke", fontWeight: "bold", mb: 2 }}
                >
                  Agregar documentos adicionales
                </Button>
              </Stack>
              <Grid
                container
                justifyContent="space-between"
                alignContent="center"
                alignItems="center"
                textAlign="center"
                mb={2}
              >
                <Grid item xs={12}>
                  <AddDocs adicionales={formik.values.addDocs} />
                </Grid>
              </Grid>
              <Stack>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={(_e) =>
                    handleOpenModalForm(
                      <FormDetail onNewDetail={handleNewDetail} />,
                      "Agregar Detalles"
                    )
                  }
                  sx={{ fontWeight: "bold", mb: 2 }}
                >
                  Agregar detalles
                </Button>
              </Stack>
              <Grid
                container
                justifyContent="space-between"
                alignContent="center"
                alignItems="center"
                textAlign="center"
                mb={2}
              >
                <Grid item xs={12}>
                  <Details detalles={formik.values.details} />
                </Grid>
              </Grid>

              <Button
                sx={{ mt: 2, color: "white", fontWeight: "bold" }}
                fullWidth
                type="submit"
                variant="contained"
                color="warning"
              >
                Submit
              </Button>
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
      {/* )} */}
    </>
  );
};

export default DocumentoElectronico;
