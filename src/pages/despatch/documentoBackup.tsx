// import React, { useState } from "react";
// import {
//   Doc,
//   Company,
//   Client,
//   Envio,
//   //AddDoc,
//   Detail,
//   Address,
//   Direccion,
//   Vehiculo,
//   Puerto,
//   AddDoc,
//   //Transportista,
//   // Choferes,
// } from "../../types/doc.interface";
// import {
//   Container,
//   FormControl,
//   Grid,
//   InputLabel,
//   MenuItem,
//   Select,
//   Stack,
//   TextField,
//   SelectChangeEvent,
//   Button,
//   Paper,
//   Accordion,
//   AccordionDetails,
//   AccordionSummary,
//   Typography,
//   Box,
//   CircularProgress,
// } from "@mui/material";
// import { useTheme } from "@mui/material/styles";
// //import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
// import { LocalizationProvider } from "@mui/x-date-pickers";
// //import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// //import { es } from "date-fns/locale";
// import dayjs from "dayjs";
// //import Destinatario from "./destinatario";
// import Details from "../details";
// import FormDetail from "../details/formDetails";
// // import { useDialog } from "../../context/dialog.context";
// import FormAddDocs from "../adicionaldocs/formDocs";
// import AddDocs from "../adicionaldocs";
// import Cliente from "../Cliente/formCliente";
// import EnvioForm from "../envio";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// import { useParamsSunat } from "../../context/params.context";
// import { useTokenSunat } from "../../context/token.context";
// import { DialogComponentCustom } from "../../components";

// //import { client } from "../../api/client";


// const DireccionValues: Direccion = {
//   codlocal: "",
//   direccion: "",
//   ruc: "",
//   ubigeo: "",
// };

// const ClientValues: Client = {
  
//   numDoc: "",
//   rznSocial: "",
//   tipoDoc: "",
// };

// const PuertoValues: Puerto = {
//   codigo: "",
//   nombre: "",
// };

// const VehiculoValues: Vehiculo = {
//   placa: "",
//   codEmisor: "",
//   nroAutorizacion: "",
//   nroCirculacion: "",
//   secundarios: null,
// };

// const EnvioValues: Envio = {
//   codTraslado: "",
//   contenedores: [],
//   desTraslado: "",
//   fecTraslado: "",
//   indicadores: [],
//   indTransbordo: "",
//   llegada: DireccionValues,
//   modTraslado: "",
//   numBultos: 0,
//   partida: DireccionValues,
//   pesoTotal: 0,
//   undPesoTotal: "",
//   vehiculo: VehiculoValues,
//   aeropuerto: PuertoValues,
//   puerto: PuertoValues,
//   choferes: [],
// };

// /* const TransportistaValues: Transportista = {
//   id: "",
//   nroMtc: "",
//   numDoc: "",
//   tipoDoc: "",
//   rznSocial: "",
// }; */

// type ModalsProps = {
//   open: boolean;
//   form: React.ReactNode | null;
//   title: string;
// };

// const DocumentoElectronico: React.FC = () => {

//   const { data, isLoading } = useParamsSunat(); 
//   const { token } = useTokenSunat();

//   const AddressValues: Address = {
//     codigoPais: data.client_id,
//     codLocal: "",
//     createdAt: new Date(),
//     departamento: "",
//     distrito: "",
//     direccion: "",
//     id: "",
//     provincia: "",
//     ubigeo: "",
//     urbanizacion: "",
//   };
  
//   const CompanyValues: Company = {
//     address: AddressValues,
//     createdAt: new Date(),
//     email: "",
//     nombreComercial: "",
//     razonSocial: "",
//     ruc: "",
//     telephone: "",
//   };

//   const initialValues: Doc = {
//     version: "2.0",
//     tipoDoc: "09",
//     serie: "",
//     correlativo: "",
//     observacion: "",
//     fechaEmision: dayjs().format("YYYY-MM-DDTHH:mm"),
//     company: CompanyValues,
//     destinatario: ClientValues,
//     tercero: ClientValues,
//     comprador: ClientValues,
//     envio: EnvioValues,
//     addDocs: [],
//     details: [],
//   };



  

//   const [modalsForm, setModalsForms] = useState<ModalsProps>({
//     open: false,
//     form: null,
//     title: "",
//   });

//   const handleOpenModalForm = (form: React.ReactNode, title: string) => {
//     setModalsForms({ open: true, form, title });
//   };

//   const handleCloseModalForm = () => {
//     // Cierra el modal en la posición especificada
//     setModalsForms((prev) => ({ ...prev, open: false }));
//   };


//   /* const [openModal, setOpenModal] = useState<boolean>(false);

//   const [openModalAdd, setOpenModalAdd] = useState<boolean>(false);
//   const [openModalDestinatario, setOpenModalDestinatario] =
//     useState<boolean>(false);
//   const [openModalTercero, setOpenModalTercero] = useState<boolean>(false);

//   const { getModal } = useDialog(); */

//   const [formData, setFormData] = useState<Doc | null>(initialValues);

//   const [detalles, setDetalles] = useState<Detail[]>([]);

//   const [adicionalDocs, setAdicionalDocs] = useState<AddDoc[]>([]);

//   const handleNewDetail = (newDetail: Detail): void => {
//     setDetalles((detalles) => [...detalles, newDetail]);
//     setFormData((prevData) => ({
//       ...prevData,
//       details: [...prevData.details, newDetail],
//     }));
//     //setOpenModal(false);
//     setModalsForms({...modalsForm,open:false})
//   };
//   // <Cliente cliente={formData.destinatario || ClientValues} onChange={handleDestinatarioChange}/>

//   const handleNewAddDoc = (newAddDoc: AddDoc): void => {
//     setAdicionalDocs((addDoc) => [...addDoc, newAddDoc]);
//     setFormData((prevData) => ({
//       ...prevData,
//       addDocs: [...prevData.addDocs, newAddDoc],
//     }));
//     //setOpenModalAdd(false);
//     setModalsForms({...modalsForm,open:false})
//   };

// /*   useEffect(() => {
//     getModal(
//       <FormDetail onNewDetail={handleNewDetail} />,
//       "Agregar detalles",
//       openModal,
//       <Button
//         variant="outlined"
//         color="secondary"
//         onClick={() => setOpenModal(false)}
//       >
//         Cancel
//       </Button>
//     );
//   }, [openModal]);

//   useEffect(() => {
//     getModal(
//       <FormAddDocs onNewAddDoc={handleNewAddDoc} />,
//       "Agregar Documentos adicionales",
//       openModalAdd,
//       <Button
//         variant="outlined"
//         color="secondary"
//         onClick={() => setOpenModalAdd(false)}
//       >
//         Cancel
//       </Button>
//     );
//   }, [openModalAdd]);

//   useEffect(() => {
//     getModal(
//       <Cliente
//         initialValue={formData.destinatario}
//         onChange={handleDestinatarioChange}
//       />,
//       "Destinatario",
//       openModalDestinatario,
//       <Button
//         variant="outlined"
//         color="secondary"
//         onClick={() => setOpenModalDestinatario(false)}
//       >
//         Cancel
//       </Button>
//     );
//   }, [openModalDestinatario]);

//   useEffect(() => {
//     getModal(
//       <Cliente
//         initialValue={formData.tercero}
//         onChange={handleTerceroChange}
//       />,
//       "Tercero",
//       openModalTercero,
//       <Button
//         variant="outlined"
//         color="secondary"
//         onClick={() => setOpenModalTercero(false)}
//       >
//         Cancel
//       </Button>
//     );
//   }, [openModalTercero]); */

//   const handleDestinatarioChange = (cliente: Client): void => {
//     setFormData((prevData) => ({
//       ...prevData,
//       destinatario: cliente,
//     }));
//     //setOpenModalDestinatario(false);
//     setModalsForms({...modalsForm,open:false})
//   };

//   const handleCompradorChange = (cliente: Client) => {
//     setFormData((prevData) => ({
//       ...prevData,
//       comprador: cliente,
//     }));
//     //setOpenModalTercero(false);
//     setModalsForms({...modalsForm,open:false})
//   };

//   const handleEnvioChange = (envio: Envio) => {
//     setFormData((prevData) => ({
//       ...prevData,
//       envio: envio,
//     }));
//   };

//   const handleChange = (
//     evt: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
//   ) => {
//     const { name, value } = evt.target;
//     setFormData((prevData) => ({ ...prevData, [name]: value }));
//   };

//   const SelectHandleChange = (evt: SelectChangeEvent<unknown>) => {
//     const { name, value } = evt.target;
//     setFormData((prevData) => ({ ...prevData, [name]: value }));
//     //console.log(token);
//   };

//   //styles

//   const theme = useTheme();

//   const paperClient = {
//     display: "flex",
//     justifyContent: "center",
//     flexWrap: "wrap",
//     borderRadius: 7,
//     py: 5,
//     mx: 10,
//     my: 2,
//     [theme.breakpoints.down("sm")]: {
//       mx: 0,
//     },
//   };

//   return (
//     <>
//       {isLoading ? (
//         <Container maxWidth="md" sx={{ height: "100vh" }}>
//           <Box
//             sx={{
//               display: "flex",
//               justifyContent: "center",
//               alignItems: "center",
//               height: "100%",
//             }}
//           >
//             <CircularProgress size={100} />
//           </Box>
//         </Container>
//       ) : (
//         <LocalizationProvider dateAdapter={AdapterDayjs}>
//           <Container maxWidth="md" sx={{ mt: 2 }}>
//             <form action="">
//               <Grid
//                 container
//                 justifyContent="space-between"
//                 alignContent="center"
//                 alignItems="center"
//               >
//                 <Grid spacing={2} container item xs={12}>
//                   <Grid item lg={4} xs={12}>
//                     <FormControl fullWidth size="small">
//                       <InputLabel id="demo-simple-select-label">
//                         Tipo Documento
//                       </InputLabel>
//                       <Select
//                         labelId="demo-simple-select-label"
//                         id="demo-simple-select"
//                         label="Tipo Documento"
//                         value={"G"}
//                       >
//                         <MenuItem value="G">
//                           GUIA DE REMISION ELECTRONICA
//                         </MenuItem>
//                       </Select>
//                     </FormControl>
//                   </Grid>
//                   <Grid item lg={2} xs={6}>
//                     <FormControl fullWidth size="small">
//                       <InputLabel id="demo-simple-select-label">
//                         Serie
//                       </InputLabel>
//                       <Select
//                         labelId="demo-simple-select-label"
//                         id="demo-simple-select"
//                         //value={formik.values.tipoDoc}
//                         value={formData?.serie}
//                         label="Serie"
//                         onChange={(e: SelectChangeEvent): void =>
//                           SelectHandleChange(e)
//                         }
//                         //error={formik.touched.tipoDoc && Boolean(formik.errors.tipoDoc)}
//                         //onBlur={formik.handleBlur}
//                         name="serie"
//                       >
//                         <MenuItem value="">...</MenuItem>
//                         <MenuItem value={"T001"}>T001</MenuItem>
//                         <MenuItem value={"T002"}>T002</MenuItem>
//                         <MenuItem value={"T003"}>T003</MenuItem>
//                       </Select>
//                     </FormControl>
//                   </Grid>
//                   <Grid item lg={2} xs={6}>
//                     <TextField
//                       size="small"
//                       name="correlativo"
//                       value={formData?.correlativo}
//                       onChange={(
//                         e: React.ChangeEvent<HTMLInputElement>
//                       ): void => handleChange(e)}
//                       type="text"
//                       label="Número Documento"
//                     />
//                   </Grid>
//                   <Grid item lg={4} xs={12}>
//                     <TextField
//                       fullWidth
//                       size="small"
//                       id="datetime-local"
//                       label="Fecha de Emision"
//                       name="fechaEmision"
//                       type="datetime-local"
//                       value={formData?.fechaEmision}
//                       onChange={(
//                         e: React.ChangeEvent<HTMLInputElement>
//                       ): void => handleChange(e)}
//                       style={{ colorScheme: "dark" }}
//                       InputLabelProps={{
//                         shrink: true,
//                       }}
//                     />
//                   </Grid>
//                 </Grid>
//                 <Grid item xs={12}>
//                   <TextField
//                     margin="normal"
//                     size="small"
//                     fullWidth
//                     name="observacion"
//                     multiline
//                     maxRows={2}
//                     minRows={2}
//                     label="Observaciones"
//                     value={formData?.observacion}
//                     onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
//                       handleChange(e)
//                     }
//                     //sx={{ mt: 1.5, mb: 1.5 }}
//                     // value={formik.values.numDoc}
//                     // // required
//                     // onChange={formik.handleChange}
//                     // error={formik.touched.numDoc && Boolean(formik.errors.numDoc)}
//                     // onBlur={formik.handleBlur}
//                   />
//                 </Grid>
//                 <Accordion sx={{ width: "100%" }}>
//                   <AccordionSummary
//                     expandIcon={<ExpandMoreIcon />}
//                     aria-controls="panel01a-content"
//                     id="panel01a-header"
//                   >
//                     <Typography>Cliente / Tercero</Typography>
//                   </AccordionSummary>
//                   <AccordionDetails>
//                     <Grid
//                       mb={1}
//                       container
//                       item
//                       xs={12}
//                       textAlign="center"
//                       spacing={2}
//                     >
//                       <Grid item xs={6}>
//                         <Paper elevation={5} sx={paperClient}>
//                           <Button
//                             variant="outlined"
//                             color="secondary"
//                             onClick={(_e) =>
//                               handleOpenModalForm(
//                                 <Cliente
//                                   initialValue={formData.destinatario}
//                                   onChange={handleDestinatarioChange}
//                                 />,
//                                 "Destinatario"
//                               )}
//                             sx={{ height: 80, width: 100 }}
//                           >
//                             Destinatario
//                           </Button>
//                         </Paper>
//                       </Grid>
//                       <Grid item xs={6}>
//                         <Paper elevation={5} sx={paperClient}>
//                           <Button
//                             variant="outlined"
//                             color="warning"
//                             onClick={(_e) =>
//                               handleOpenModalForm(
//                                 <Cliente
//                                   initialValue={formData.comprador}
//                                   onChange={handleCompradorChange}
//                                 />,
//                                 "Comprador"
//                               )}
//                             sx={{ height: 80, width: 100 }}
//                           >
//                             Comprador
//                           </Button>
//                         </Paper>
//                       </Grid>
//                     </Grid>
//                   </AccordionDetails>
//                 </Accordion>
//               </Grid>
//               <Grid container>
//                 <Grid item container xs={12}>
//                   <EnvioForm onChange={handleEnvioChange} />
//                 </Grid>
//               </Grid>
//               <Stack>
//                 <Button
//                   variant="contained"
//                   color="secondary"
//                   onClick={(_e) =>
//                     handleOpenModalForm(
//                       <FormAddDocs
//                         onNewAddDoc={handleNewAddDoc}
//                       />,
//                       "Documentos adicionales"
//                     )}
//                   sx={{ color: "whitesmoke", fontWeight: "bold", mb: 2 }}
//                 >
//                   Agregar documentos adicionales
//                 </Button>
//               </Stack>
//               <Grid
//                 container
//                 justifyContent="space-between"
//                 alignContent="center"
//                 alignItems="center"
//                 textAlign="center"
//                 mb={2}
//               >
//                 <Grid item xs={12}>
//                   <AddDocs adicionales={adicionalDocs} />
//                 </Grid>
//               </Grid>
//               <Stack>
//                 <Button
//                   variant="contained"
//                   color="primary"
//                   onClick={(_e) =>
//                     handleOpenModalForm(
//                       <FormDetail
//                         onNewDetail={handleNewDetail}
//                       />,
//                       "Agregar Detalles"
//                     )}
//                   sx={{ fontWeight: "bold", mb: 2 }}
//                 >
//                   Agregar detalles
//                 </Button>
//               </Stack>
//               <Grid
//                 container
//                 justifyContent="space-between"
//                 alignContent="center"
//                 alignItems="center"
//                 textAlign="center"
//                 mb={2}
//               >
//                 <Grid item xs={12}>
//                   <Details detalles={detalles} />
//                 </Grid>
//               </Grid>
//             </form>
//             <DialogComponentCustom
//               closeButton={
//                 <Button
//                   variant="outlined"
//                   color="secondary"
//                   onClick={() => handleCloseModalForm()}
//                 >
//                   Close
//                 </Button>
//               }
//               open={modalsForm.open}
//               title={modalsForm.title}
//               element={modalsForm.form}
//             />
//           </Container>
//         </LocalizationProvider>
//       )}
//     </>
//   );
// };

// export default DocumentoElectronico;
