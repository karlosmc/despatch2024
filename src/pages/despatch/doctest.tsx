// import React, { useEffect, useState } from "react";
// import {
//   Client,
//   DocTest,
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
//   TextField,
  
//   Button,
//   Paper,
//   Accordion,
//   AccordionDetails,
//   AccordionSummary,
//   Typography,
// } from "@mui/material";
// import { useTheme } from "@mui/material/styles";
// //import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
// import { LocalizationProvider } from "@mui/x-date-pickers";
// //import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// //import { es } from "date-fns/locale";
// import dayjs from "dayjs";
// //import Destinatario from "./destinatario";

// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

// import { DialogComponentCustom } from "../../components";
// import ClienteForm from "../Cliente/clienteForm";
// import { isObject, useFormik } from "formik";
// import { DocumentTesting } from "../../utils/validateForm";
// import { useNotification } from "../../context/notification.context";

// //import { client } from "../../api/client";

// const ClientValues: Client = {
  
//   numDoc: "",
//   rznSocial: "",
//   tipoDoc: "1",
// };

// type ModalsProps = {
//   open: boolean;
//   form: React.ReactNode | null;
//   title: string;
// };

// const DocumentoTest: React.FC = () => {
//   const initialValues: DocTest = {
//     serie: "",
//     correlativo: "",
//     observacion: "",
//     fechaEmision: dayjs().format("YYYY-MM-DDTHH:mm"),
//     destinatario: ClientValues,
//   };
//   const {getError } = useNotification();

//   const [modalsForm, setModalsForms] = useState<ModalsProps>({
//     open: false,
//     form: null,
//     title: "",
//   });

//   const handleOpenModalForm = (form: React.ReactNode, title: string) => {
//     setModalsForms({ open: true, form, title });
//   };

//   const handleCloseModalForm = () => {
//     setModalsForms((prev) => ({ ...prev, open: false }));
//   };

//   const [_formData, setFormData] = useState<DocTest | null>(initialValues);

//   const formik = useFormik({
//     initialValues: initialValues,
//     validationSchema: DocumentTesting,
//     onSubmit: (values) => {
//       console.log(values);
//     },
    
//   });

//   const handleDestinatarioChange = (cliente: Client): void => {
//     console.log('vino de cliente');
//     setFormData((prevData) => ({
//       ...prevData,
//       destinatario: cliente,
//     }));
//     formik.setFieldValue('destinatario',cliente)
//     setModalsForms({ ...modalsForm, open: false });
    
//   };

//   useEffect(() => {
//     if (!formik.isSubmitting) return;
//      if (Object.keys(formik.errors).length > 0) {
//         const ErrorValues = Object.values(formik.errors)[0]
//         // console.log(ErrorValues);
//         //const ErrorKeys = Object.keys(formik.errors)[0]
//         if(isObject(ErrorValues)){
//           // console.log(Object.values(ErrorValues)[0])
//           const ErrorValuesSub = Object.values(ErrorValues)[0];
//           // const ErrorKeySub = Object.keys(ErrorKeys)[0]
//           if(isObject(ErrorValuesSub)){
//             //getError(`Error en la Seccion:${Object.keys(ErrorKeySub)[0]}: ${Object.values(ErrorValuesSub)[0]}`)
//             getError(Object.values(ErrorValuesSub)[0])
//           }else{
//             //getError(`Error en la Seccion:${ErrorKeys.toUpperCase()}: ${ErrorValuesSub}`)
//             getError(ErrorValuesSub)
//           }
//         }else{
//           getError(ErrorValues);
//         }
//      }
//   }, [formik]);

//   // const handleChange = (
//   //   evt: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
//   // ) => {
//   //   const { name, value } = evt.target;
//   //   setFormData((prevData) => ({ ...prevData, [name]: value }));
//   // };

//   // const SelectHandleChange = (evt: SelectChangeEvent<unknown>) => {
//   //   const { name, value } = evt.target;
//   //   setFormData((prevData) => ({ ...prevData, [name]: value }));
//   // };

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
//       <LocalizationProvider dateAdapter={AdapterDayjs}>
//         <Container maxWidth="md" sx={{ mt: 15 }}>
          
//             <form onSubmit={formik.handleSubmit}>
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
//                         value={formik.values.serie}
//                         //value={formData?.serie}
//                         label="Serie"
//                         // onChange={(e: SelectChangeEvent): void =>
//                           // SelectHandleChange(e)
//                         // }
//                         onChange={formik.handleChange}
//                         error={formik.touched.serie && Boolean(formik.errors.serie)}
//                         onBlur={formik.handleBlur}
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
//                       value={formik.values.correlativo}
//                       onChange={formik.handleChange}
//                       error={formik.touched.correlativo && Boolean(formik.errors.correlativo)}
//                       onBlur={formik.handleBlur}
//                       /* value={formData?.correlativo}
//                       onChange={(
//                         e: React.ChangeEvent<HTMLInputElement>
//                       ): void => handleChange(e)} */
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
//                       // value={formData?.fechaEmision}
//                       // onChange={(
//                       //   e: React.ChangeEvent<HTMLInputElement>
//                       // ): void => handleChange(e)}
//                       value={formik.values.fechaEmision}
//                       onChange={formik.handleChange}
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
//                     // value={formData?.observacion}
//                     // onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
//                     //   handleChange(e)
//                     // }

//                     sx={{ mt: 1.5, mb: 1.5 }}
//                     value={formik.values.observacion}
//                     // // required
//                     onChange={formik.handleChange}
//                     error={formik.touched.observacion && Boolean(formik.errors.observacion)}
//                     onBlur={formik.handleBlur}
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
//                                 <ClienteForm
//                                   initialValue={formik.values.destinatario}
//                                   onChange={handleDestinatarioChange}
//                                 />,
//                                 "Destinatario"
//                               )
//                             }
//                             sx={{ height: 80, width: 100 }}
//                           >
//                             Destinatario
//                           </Button>
//                         </Paper>
//                       </Grid>
//                     </Grid>
//                   </AccordionDetails>
//                 </Accordion>
//               </Grid>
//               <Button variant="outlined" type="submit">
//                 Enviar
//               </Button>
//             </form>
          

//           <DialogComponentCustom
//             closeButton={
//               <Button
//                 variant="outlined"
//                 color="secondary"
//                 onClick={() => handleCloseModalForm()}
//               >
//                 Close
//               </Button>
//             }
//             open={modalsForm.open}
//             title={modalsForm.title}
//             element={modalsForm.form}
//           />
//         </Container>
//       </LocalizationProvider>
//     </>
//   );
// };

// export default DocumentoTest;
