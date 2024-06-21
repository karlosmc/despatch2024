// import {
//   Accordion,
//   AccordionDetails,
//   AccordionSummary,
//   Button,
//   Chip,
//   FormControl,
//   Grid,
//   InputLabel,
//   MenuItem,
//   Paper,
//   Select,
//   SelectChangeEvent,
//   Stack,
//   TextField,
//   Tooltip,
//   Typography,
//   useTheme,
// } from "@mui/material";
// import React, { MouseEvent, useEffect, useRef, useState } from "react";
// import {
//   Choferes,
//   Direccion,
//   Envio,
//   Puerto,
//   Transportista,
//   Vehiculo,
// } from "../../types/doc.interface";
// import InventoryIcon from "@mui/icons-material/Inventory";
// import DirectionsCarFilledIcon from "@mui/icons-material/DirectionsCarFilled";
// import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
// import TaxiAlertIcon from "@mui/icons-material/TaxiAlert";
// import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
// import LocalShippingIcon from "@mui/icons-material/LocalShipping";
// import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
// import CommuteIcon from "@mui/icons-material/Commute";
// import AirportShuttleIcon from "@mui/icons-material/AirportShuttle";
// import IconButton from "@mui/material/IconButton";
// import QueueIcon from "@mui/icons-material/Queue";
// import PersonPinCircleIcon from "@mui/icons-material/PersonPinCircle";
// import PinDropIcon from "@mui/icons-material/PinDrop";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

// import dayjs from "dayjs";

// //import { useDialog } from "../../context/dialog.context";

// import FormDireccion from "../direction/formDireccion";
// import FormPuerto from "../puerto/formPuerto";
// import VehiculoForm from "../vehiculo";
// import ListaVehiculos from "../vehiculo/lista";
// import ListaChoferes from "../chofer/lista";
// import TransportistaForm from "../transportista";

// import { DialogComponentCustom } from "../../components";

// //import TextSearch from "../../components/TextSearch";
// //import DireccionFormChat from "../direction/formDirectionChatGpt";

// import { isObject, useFormik } from "formik";

// import { useNotification } from "../../context/notification.context";
// import { AeropuertoSchema, EnvioSchema, LlegadaSchema } from "../../utils/validateForm";

// const _MOTIVO_TRASLADO = [
//   { id: "01", valor: "Venta" },
//   { id: "02", valor: "Compra" },
//   { id: "03", valor: "Venta con entrega a terceros" },
//   { id: "04", valor: "Traslado entre establecimientos de la misma empresa" },
//   { id: "05", valor: "Consignación" },
//   { id: "06", valor: "Devolución" },
//   { id: "07", valor: "Recojo de bienes transformados" },
//   { id: "08", valor: "Importación" },
//   { id: "09", valor: "Exportación" },
//   { id: "13", valor: "Otros" },
//   { id: "14", valor: "Venta sujeta a confirmación del comprador" },
//   { id: "17", valor: "Traslado de bienes para transformación" },
//   { id: "18", valor: "Traslado emisor itinerante CP" },
// ];

// const _INDICADORES_ESPECIALES = [
//   {
//     id: "SUNAT_Envio_IndicadorTrasladoVehiculoM1L",
//     name: "Traslado en vehiculos M1 o L",
//     tooltip: "Vehiculo M1 o L",
//     selected: false,
//     icon: <DirectionsCarFilledIcon />,
//   },
//   {
//     id: "SUNAT_Envio_IndicadorRetornoVehiculoEnvaseVacio",
//     name: "Retorno de vehiculos con envases o embalajes vacíos",
//     tooltip: "Envases o embalajes vacío",
//     selected: false,
//     icon: <DeleteOutlineIcon />,
//   },
//   {
//     id: "SUNAT_Envio_IndicadorRetornoVehiculoVacio",
//     name: "Retorno de vehículo vacío",
//     tooltip: "Vehículo vacío",
//     selected: false,
//     icon: <TaxiAlertIcon />,
//   },
//   {
//     id: "SUNAT_Envio_IndicadorTrasladoTotalDAMoDS",
//     name: "Traslado total de la DAM o DS",
//     tooltip: "Total de DAM o DS",
//     selected: false,
//     icon: <FormatListNumberedIcon />,
//   },
// ];
// type indicadoresType = {
//   id: string;
//   name: string;
//   tooltip: string;
//   selected: boolean;
//   icon: JSX.Element;
// };

// const _MODALIDAD_TRASLADO = [
//   { id: "01", valor: "Transporte público" },
//   { id: "02", valor: "Transporte privado" },
// ];

// const _UNIDAD_PESO_TOTAL = [
//   { id: "KGM", valor: "KILOGRAMOS" },
//   { id: "TNL", valor: "TONELADAS" },
// ];

// const DireccionValues: Direccion = {
//   codlocal: "",
//   direccion: "",
//   ruc: "",
//   ubigeo: "",
// };
// const VehiculoValues: Vehiculo = {
//   placa: "",
//   codEmisor: "",
//   nroAutorizacion: "",
//   nroCirculacion: "",
//   secundarios: null,
// };

// const PuertoValues: Puerto = {
//   codigo: "",
//   nombre: "",
// };

// const EnvioValues: Envio = {
//   codTraslado: "",
//   contenedores: [],
//   desTraslado: "",
//   fecTraslado: dayjs().format("YYYY-MM-DDTHH:mm"),
//   indicadores: [],
//   // indTransbordo: "",
//   llegada: DireccionValues,
//   modTraslado: "",
//   numBultos: 0,
//   partida: DireccionValues,
//   pesoTotal: 0,
//   undPesoTotal: "",
//   // vehiculo: VehiculoValues,
//   aeropuerto: PuertoValues,
//   puerto: PuertoValues,
//   // choferes: [],
// };

// interface EnvioFormProps {
//   onChange: (envio: Envio) => void;
// }

// type ModalsProps = {
//   open: boolean;
//   form: React.ReactNode | null;
//   title: string;
// };
// const EnvioForm = ({ onChange }: EnvioFormProps) => {
//   const [modalsForm, setModalsForms] = useState<ModalsProps>({
//     open: false,
//     form: null,
//     title: "",
//   });

//   const {getError,getSuccess } = useNotification();

//   const formik = useFormik({
//     initialValues: EnvioValues,
//     validationSchema: EnvioSchema,
//     onSubmit: (values) => {
//       console.log(values);
//       getSuccess('Comprobante guardado con EXITO')
//     },
    
//   });

//   const handleOpenModalForm = (form: React.ReactNode, title: string) => {
//     setModalsForms({ open: true, form, title });
//   };

//   const handleCloseModalForm = () => {
//     // Cierra el modal en la posición especificada
//     setModalsForms((prev) => ({ ...prev, open: false }));
//   };

//   const [expanded, setExpanded] = useState<string | false>(false);

//   const handleChangeAccordion =
//     (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
//       setExpanded(isExpanded ? panel : false);
//     };

//   const [container, setContainer] = useState<string[]>([]);

//   const [dataEnvio, setDataEnvio] = useState<Envio>(EnvioValues);

//   const [contenedor, setContenedor] = useState<string>("");

//   const [indicadores, setIndicadores] = useState<indicadoresType[]>(
//     _INDICADORES_ESPECIALES
//   );

//   const handleContenedor = (evt: React.ChangeEvent<HTMLInputElement>) => {
//     const { value } = evt.target;
//     setContenedor(value);
//   };

//   const containerRef = useRef<HTMLInputElement>(null);

 

//   useEffect(() => {
//     containerRef.current = document.getElementById(
//       "contenedor"
//     ) as HTMLInputElement;
//   }, [expanded]);

//   useEffect(()=>{
//     if(formik.values.codTraslado){
//       const desTraslado = _MOTIVO_TRASLADO.find(item => item.id=== formik.values.codTraslado).valor
//       formik.setFieldValue('desTraslado',desTraslado)
//     }
//   },[formik.values.codTraslado])
  
//   useEffect(() => {
//     onChange(formik.values);
//   }, [formik.values]);

//   useEffect(() =>{
//     const filterIndicadores = indicadores.filter(item => item.selected).map(filtrados=>filtrados.id)
//     formik.setFieldValue('indicadores',filterIndicadores)
//   },[indicadores])

//   useEffect(() =>{
//     formik.setFieldValue('contenedores',container)
//   },[container])

//   useEffect(() => {
//     console.log(formik.values.puerto);
//   }, [formik.values.puerto]);

// /*   useEffect(() => {
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
//             getError(`${Object.values(ErrorValuesSub)[0]}`)
//           }else{
//             //getError(`Error en la Seccion:${ErrorKeys.toUpperCase()}: ${ErrorValuesSub}`)
//             getError(ErrorValuesSub)
//           }
//         }else{
//           getError(ErrorValues);
//         }
//      }
//   }, [formik]);
//  */

//   const handlePartidaChange = (direccion: Direccion): void => {
//     // setDataEnvio((prevData) => ({
//     //   ...prevData,
//     //   partida: direccion,
//     // }));
//     formik.setFieldValue('partida',direccion);
//     setModalsForms({ ...modalsForm, open: false });
//   };

  

//   const handleLlegadaChange = (direccion: Direccion): void => {
//     // setDataEnvio((prevData) => ({
//     //   ...prevData,
//     //   llegada: direccion,
//     // }));
//     formik.setFieldValue('llegada',direccion);
//     //setOpenModalPartida(false);
//     setModalsForms({ ...modalsForm, open: false });
//   };

//   const handleVehiculoChange = (vehiculo: Vehiculo): void => {
//     setDataEnvio((prevData) => ({
//       ...prevData,
//       vehiculo: vehiculo,
//     }));
//     setModalsForms({ ...modalsForm, open: false });
//     //setOpenModalVehiculo(false);
//   };

//   const handleAddContainer = (evt: MouseEvent<HTMLButtonElement>) => {
//     evt.preventDefault();
//     const contenedorValor = containerRef.current.value;
    
//     setContainer([...container, contenedorValor]);
//     // setDataEnvio((prev) => ({
//     //   ...prev,
//     //   contenedores: [...prev.contenedores, contenedorValor],
//     // }));
//     setContenedor("");
//     containerRef.current.focus();
//   };

//   const handleDeleteContainer = (chipToDelete: string) => {
//     setContainer(container.filter((item) => item !== chipToDelete));
//     // setDataEnvio((prev) => ({
//     //   ...prev,
//     //   contenedores: prev.contenedores.filter((item) => item !== chipToDelete),
//     // }));
//   };

//   const handleClickIndicator = (evt: MouseEvent<HTMLDivElement>) => {
//     evt.preventDefault();
//     const spanChip = evt.currentTarget.id;
//     /*     setIndicadores(prevState => {
//       const newState = prevState.map(obj =>{
//         if(obj.tooltip===spanChip){
//           return {...obj,selected:!obj.selected}
//         }
//         return obj;
//       })
//       return newState
//     }) */

//     setIndicadores((prevState) =>
//       prevState.map((indi) =>
//         indi.id === spanChip ? { ...indi, selected: !indi.selected } : indi
//       )
//     );

    

//     //const seleccionados  = Object.values(indicadores).filter(item => item.selected)
//     // formik.setFieldValue('indicadores',[spanChip])
//     // .then( res => console.log(res))

//     // const arrayIndicadores = formik.values.indicadores
//     // console.log(arrayIndicadores);

//     // formik.setFieldValue('indicadores',Object.keys(indicadores))

//     // if (formik.values.indicadores.includes(spanChip)) {

        

//     //   setDataEnvio((prevEnvio) => ({
//     //     ...prevEnvio,
//     //     indicadores: prevEnvio.indicadores.filter((ind) => ind !== spanChip),
//     //   }));
//     // } else {
//     //   setDataEnvio((prev) => ({
//     //     ...prev,
//     //     indicadores: [...prev.indicadores, spanChip],
//     //   }));
//     // }
//   };

//   // const handleChange = (
//   //   event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
//   // ) => {
//   //   const { name, value } = event.target;
//   //   setDataEnvio({
//   //     ...dataEnvio,
//   //     [name]: value,
//   //   });
//   // };

//   const handleChange = (
//     event: React.ChangeEvent<any>
//   ) => {
//     const { name, value } = event.target;
//     console.log(name,value);
//     formik.setFieldValue(name,value)
  
//   };

//   const SelectHandleChange = (event: SelectChangeEvent<unknown>) => {
//     const { name, value } = event.target;
//     setDataEnvio({
//       ...dataEnvio,
//       [name]: value,
//     });
//   };

//   const handlePuertoChange = (puerto: Puerto): void => {
//     console.log('envio',puerto);
//     // setDataEnvio((prevData) => ({
//     //   ...prevData,
//     //   puerto: puerto,
//     // }));

//     formik.setFieldValue('puerto', puerto);
//     //setOpenModalPartida(false);
    
//   };


//   const handleAeroPuertoChange = (puerto: Puerto): void => {
//     // setDataEnvio((prevData) => ({
//     //   ...prevData,
//     //   aeropuerto: puerto,
//     // }));

//     formik.setFieldValue('aeropuerto',puerto);
//   };

//   const handleConfirmListVehiculo = (vehiculos: Vehiculo[]): void => {
//     setDataEnvio((prevData) => ({
//       ...prevData,
//       vehiculo: {
//         ...prevData.vehiculo,
//         secundarios: vehiculos,
//       },
//     }));

//     setModalsForms({ ...modalsForm, open: false });
//     //setOpenModalListaVehiculo(false);
//   };

//   const handleConfirmListaChoferes = (choferes: Choferes[]): void => {
//     setDataEnvio((prevData) => ({
//       ...prevData,
//       choferes: choferes,
//     }));
//     setModalsForms({ ...modalsForm, open: false });
//     //setOpenModalListaChoferes(false);
//   };


//   const handleTransportistaChange = (transportista: Transportista): void => {
//     setDataEnvio((prevData) => ({
//       ...prevData,
//       transportista: transportista,
//     }));
//     //setOpenModalTransportista(false);
//     setModalsForms({ ...modalsForm, open: false });
//   };

//   /*  Styles   */
//   const theme = useTheme();

//   const paperDirection = {
//     display: "flex",
//     justifyContent: "center",
//     flexWrap: "wrap",
//     borderRadius: 7,
//     py: 5,
//     mx: 10,

//     [theme.breakpoints.down("sm")]: {
//       mx: 0,
//     },
//   };

//   const BoxShadoWButton = {
//     boxShadow: "0 0 40px #949494",
//     "&:hover": {
//       animation: "animatedButton 1.5s ease-in-out",
//     },
//     "@keyframes animatedButton": {
//       "0%": {
//         transform: "scale(1)",
//       },
//       "50%": {
//         transform: "scale(1.2)",
//       },
//       "100%": {
//         transform: "scale(1)",
//       },
//     },
//   };



//   return (
//     <>
//       <Accordion 
//         expanded={expanded === 'panel1'} 
//         onChange={handleChangeAccordion('panel1')} sx={{ width: "100%" }}>
//         <AccordionSummary
//           expandIcon={<ExpandMoreIcon />}
//           aria-controls="panel13a-content"
//           id="panel13a-header"
//         >
//           <Typography>Datos del Traslado</Typography>
//         </AccordionSummary>
//         {
//           expanded==='panel1' &&
//         <AccordionDetails>
//           <Grid container item xs={12} spacing={2}>
//             <Grid item lg={6} xs={12}>
//               <FormControl fullWidth size="small">
//                 <InputLabel>Motivo de traslado</InputLabel>
//                 <Select
//                   //value={dataEnvio.codTraslado}
//                   value={formik.values.codTraslado}
//                   name="codTraslado"
//                   label="Motivo de traslado"
//                   error={formik.touched.codTraslado && Boolean(formik.errors.codTraslado)}
//                   onBlur={formik.handleBlur}
                  
                  
                  
//                   /* onChange={(e: SelectChangeEvent): void =>
//                     SelectHandleChange(e)
//                   } */
//                    onChange={formik.handleChange}
//                   // onChange={handleChange}
//                 >
//                   {_MOTIVO_TRASLADO.map((motivo) => (
                    
//                     <MenuItem key={motivo.id} value={motivo.id}>
                      
//                       {motivo.valor}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </Grid>
//             <Grid item lg={6} xs={12}>
//               <FormControl fullWidth size="small">
//                 <InputLabel>Modalidad de traslado</InputLabel>
//                 <Select
//                   //value={dataEnvio.modTraslado}
//                   value={formik.values.modTraslado}
//                   name="modTraslado"
//                   label="Modalidad de traslado"
//                   // onChange={(e: SelectChangeEvent): void =>
//                   //   SelectHandleChange(e)
//                   // }
//                   onChange={formik.handleChange}
//                   error={formik.touched.modTraslado && Boolean(formik.errors.modTraslado)}
//                   onBlur={formik.handleBlur}
//                   // onChange={handleChange}
//                 >
//                   {_MODALIDAD_TRASLADO.map((modalidad) => (
//                     <MenuItem key={modalidad.id} value={modalidad.id}>
//                       {modalidad.valor}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </Grid>
//           </Grid>
//           <Grid my={1} container item xs={12} spacing={2}>
//             <Grid item lg={5} xs={12}>
//               <TextField
//                 fullWidth
//                 size="small"
//                 // value={dataEnvio.fecTraslado}
//                 value={formik.values.fecTraslado}
//                 name="fecTraslado"
//                 // onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
//                 //   handleChange(e)
//                 // }
//                 onChange={formik.handleChange}
//                 // onChange={handleChange}
//                 label="Fecha de traslado"
//                 type="datetime-local"
//                 style={{ colorScheme: "dark" }}
//                 error={formik.touched.fecTraslado && Boolean(formik.errors.fecTraslado)}
//                 onBlur={formik.handleBlur}
//                 helperText={formik.touched.fecTraslado && formik.errors.fecTraslado}
//                 InputLabelProps={{
//                   shrink: true,
//                 }}
//               />
//             </Grid>
//             <Grid item lg={2} xs={4}>
//               <TextField
//                 fullWidth
//                 size="small"
//                 // value={dataEnvio.pesoTotal}
//                 value={formik.values.pesoTotal}
//                 name="pesoTotal"
//                 // onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
//                 //   handleChange(e)
//                 // }

//                 onChange={formik.handleChange}
//                 // onChange={handleChange}
//                 label="Peso Total"
//                 type="number"
//                 error={formik.touched.pesoTotal && Boolean(formik.errors.pesoTotal)}
//                 onBlur={formik.handleBlur}
//               />
//             </Grid>
//             <Grid item lg={2} xs={4}>
//               <TextField
//                 fullWidth
//                 size="small"
//                 // value={dataEnvio.numBultos}
//                 value={formik.values.numBultos}
//                 name="numBultos"
//                 // onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
//                 //   handleChange(e)
//                 // }
//                  onChange={formik.handleChange}
//                 // onChange={handleChange}
//                 label="Número de bultos"
//                 type="number"
//                 error={formik.touched.numBultos && Boolean(formik.errors.numBultos)}
//                 onBlur={formik.handleBlur}
//               />
//             </Grid>
//             <Grid item lg={3} xs={4}>
//               <FormControl fullWidth size="small">
//                 <InputLabel>Unidad de Peso Total</InputLabel>
//                 <Select
//                   // value={dataEnvio.undPesoTotal}
//                   value={formik.values.undPesoTotal}
//                   name="undPesoTotal"
//                   label="Unidad de Peso Total"
//                   // onChange={(e: SelectChangeEvent): void =>
//                   //   SelectHandleChange(e)
//                   // }
//                   onChange={formik.handleChange}
//                   // onChange={handleChange}
//                   error={formik.touched.undPesoTotal && Boolean(formik.errors.undPesoTotal)}
//                   onBlur={formik.handleBlur}
//                 >
//                   {_UNIDAD_PESO_TOTAL.map((unidad, index) => (
//                     <MenuItem key={index} value={unidad.id}>
//                       {unidad.valor}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </Grid>
//           </Grid>
//         </AccordionDetails>
//         }
//       </Accordion>
//       <Accordion 
//         expanded={expanded === 'panel2'} 
//         onChange={handleChangeAccordion('panel2')}  sx={{ width: "100%" }}>
//         <AccordionSummary
//           expandIcon={<ExpandMoreIcon />}
//           aria-controls="panel11a-content"
//           id="panel11a-header"
//         >
//           <Typography>Indicadores de traslado</Typography>
//         </AccordionSummary>
//         {
//           expanded==='panel2' &&
//         <AccordionDetails>
//           <Paper
//             elevation={15}
//             sx={{
//               display: "flex",
//               justifyContent: "center",
//               flexWrap: "wrap",
//               my: 2,
//               py: 2,
//               borderRadius: 10,
//               width: "100%",
//             }}
//           >
//             {indicadores.map((indicador) => {
//               return (
//                 <Tooltip title={indicador.name} key={indicador.id}>
//                   <Chip
//                     sx={{
//                       height: "auto",
//                       margin: 1,
//                       py: 1,
//                       width: 180,
//                       "& .MuiChip-label": {
//                         display: "block",
//                         whiteSpace: "normal",
//                         textAlign: "center",
//                         fontWeight: "bold",
//                       },
//                       color: "white",
//                     }}
//                     id={indicador.id}
//                     label={indicador.tooltip}
//                     key={indicador.id}
//                     color={indicador.selected ? "success" : "default"}
//                     clickable={true}
//                     onClick={handleClickIndicator}
//                     icon={indicador.icon}
//                   />
//                 </Tooltip>
//               );
//             })}
//           </Paper>
//         </AccordionDetails>
//         }
//       </Accordion>

//       <Accordion  
//         expanded={expanded === 'panel3'} 
//         onChange={handleChangeAccordion('panel3')} sx={{ width: "100%" }}>
//         <AccordionSummary
//           expandIcon={<ExpandMoreIcon />}
//           aria-controls="panel1a-content"
//           id="panel1a-header"
//         >
//           <Typography>Partida y Llegada</Typography>
//         </AccordionSummary>
//         {
//           expanded==='panel3' &&
//           <AccordionDetails>
//             <Grid
//               item
//               container
//               justifyContent="space-between"
//               textAlign="center"
//               mb={2}
//               spacing={2}
//             >
//               <Grid item xs={6}>
//                 <Paper elevation={5} sx={paperDirection}>
//                   <Button
//                     variant="outlined"
//                     onClick={(_e) =>
//                       handleOpenModalForm(
//                         <FormDireccion
//                           initialValue={formik.values.partida}
//                           onChange={handlePartidaChange}
//                         />,
//                         "Partida"
//                       )
//                     }
//                     color="info"
//                     startIcon={<PersonPinCircleIcon />}
//                     sx={{ height: 80, width: 100 }}
//                   >
//                     Partida
//                   </Button>
//                 </Paper>
//               </Grid>
//               <Grid item xs={6}>
//                 <Paper elevation={5} sx={paperDirection}>
//                   <Button
//                     variant="outlined"
//                     onClick={(_e) =>
//                       handleOpenModalForm(
//                         <FormDireccion
//                           initialValue={formik.values.llegada}
//                           onChange={handleLlegadaChange}
//                           schema={LlegadaSchema}
//                         />,
//                         "Llegada"
//                       )
//                     }
//                     color="info"
//                     startIcon={<PinDropIcon />}
//                     sx={{ height: 80, width: 100 }}
//                   >
//                     Llegada
//                   </Button>
//                 </Paper>
//               </Grid>
//             </Grid>
//           </AccordionDetails>
//         }
//       </Accordion>
//       {/* <Accordion  
//         expanded={expanded === 'panel4'} 
//          onChange={handleChangeAccordion('panel4')}  sx={{ width: "100%" }}>
//         <AccordionSummary
//           expandIcon={<ExpandMoreIcon />}
//           aria-controls="panel12a-content"
//           id="panel12a-header"
//         >
//           <Typography>Contenedores (Exportación)</Typography>
//         </AccordionSummary>
//         {
//           expanded==='panel4' &&
//         <AccordionDetails>
//           <Paper
//             elevation={3}
//             sx={{
//               p: 3,
//               width: "100%",
//               flexWrap: "wrap",
//               my: 2,
//               borderRadius: 5,
//               position: "relative",
//             }}
//           >
//             <Typography
//               variant="subtitle2"
//               style={{
//                 position: "absolute",
//                 top: 0,
//                 left: 0,
//                 color: "#ffffffd3",
//                 padding: "0px 16px",
//               }}
//             >
//               Contenedores
//             </Typography>
//             <Grid
//               container
//               spacing={3}
//               item
//               xs={12}
//               justifyContent="center"
//               alignContent="center"
//               alignItems="center"
//               textAlign="center"
//             >
//               <Grid item lg={3} xs={6}>
//                 <TextField
//                   ref={containerRef}
//                   fullWidth
//                   id="contenedor"
//                   onChange={handleContenedor}
//                   placeholder="0001"
//                   value={contenedor}
//                   name=""
//                   label="Nro. de contenedor"
//                   size="small"
//                 />
//               </Grid>
//               <Grid item lg={2} xs={6}>
//                 <Button
//                   variant="outlined"
//                   onClick={handleAddContainer}
//                   startIcon={<QueueIcon />}
//                 ></Button>
//               </Grid>

//               <Grid item lg={7} xs={12}>
//                 <Stack direction="row" spacing={2}>
//                   {container.map((contain, index) => (
//                     <Chip
//                       icon={<InventoryIcon />}
//                       key={index}
//                       label={contain}
//                       onDelete={(_) => handleDeleteContainer(contain)}
//                       variant="outlined"
//                       color="warning"
//                       size="small"
//                     />
//                   ))}
//                 </Stack>
//               </Grid>
//             </Grid>
//           </Paper>
//         </AccordionDetails>
//         }
//       </Accordion> */}
//       {/* <Accordion  
//         expanded={expanded === 'panel5'} 
//         onChange={handleChangeAccordion('panel5')}  sx={{ width: "100%" }}>
//         <AccordionSummary
//           expandIcon={<ExpandMoreIcon />}
//           aria-controls="panel2a-content"
//           id="panel2a-header"
//         >
//           <Typography>Puerto y Aeropuerto (Exportación)</Typography>
//         </AccordionSummary>
//         {
//           expanded==='panel5' &&
//         <AccordionDetails>
//           <Paper
//             elevation={3}
//             sx={{
//               p: 3,
//               width: "100%",
//               flexWrap: "wrap",
//               my: 1,
//               borderRadius: 5,
//               position: "relative",
//             }}
//           >
//             <Typography
//               variant="subtitle2"
//               style={{
//                 position: "absolute",
//                 top: 0,
//                 left: 0,
//                 color: "#ffffffd3",
//                 padding: "0px 16px",
//               }}
//             >
//               Puertos / Aeropuertos
//             </Typography>
//             <Grid container item xs={12} spacing={2}>
//               <Grid item lg={6} xs={12}>
//                 <FormPuerto
//                   onChange={handlePuertoChange}
//                   initialValue={formik.values.puerto}
//                   opcion="P"
//                 />
//               </Grid>
//               <Grid item lg={6} xs={12}>
//                 <FormPuerto
//                   onChange={handleAeroPuertoChange}
//                   initialValue={formik.values.aeropuerto}
//                   opcion="A"
//                   schema={AeropuertoSchema}
//                 />
//               </Grid>
//             </Grid>
//           </Paper>
//         </AccordionDetails>
//         }
//       </Accordion> */}
//       <Accordion  
//         expanded={expanded === 'panel6'} 
//         onChange={handleChangeAccordion('panel6')}  sx={{ width: "100%" }}>
//         <AccordionSummary
//           expandIcon={<ExpandMoreIcon />}
//           aria-controls="panel3a-content"
//           id="panel3a-header"
//         >
//           <Typography>Transportista / Vehiculo / Chofer</Typography>
//         </AccordionSummary>
//         {
//           expanded==='panel6' &&
//         <AccordionDetails>
//           <Paper
//             elevation={10}
//             sx={{
//               display: "flex",
//               justifyContent: "center",
//               flexWrap: "wrap",
//               my: 4,
//               borderRadius: 20,
//               width: "100%",
//             }}
//           >
//             <Grid
//               my={2}
//               item
//               container
//               textAlign="center"
//               alignItems="flex-end"
//               alignContent="center"
//               xs={12}
//               spacing={1}
//             >
//               <Grid item lg={2} xs={12}>
//                 <Typography color="secondary">Vehiculo</Typography>
//                 <IconButton
//                   color="secondary"
//                   aria-label="add an alarm"
//                   sx={BoxShadoWButton}
//                   onClick={(_e) =>
//                     handleOpenModalForm(
//                       <VehiculoForm
//                         onChange={handleVehiculoChange}
//                         initialValue={dataEnvio.vehiculo}
//                       />,
//                       "Vehiculo"
//                     )
//                   }
//                 >
//                   <LocalShippingIcon fontSize="large" />
//                 </IconButton>
//               </Grid>
//               <Grid item lg={2} xs={12}>
//                 <Typography color="secondary">Vehiculos Secundarios</Typography>
//                 <IconButton
//                   color="secondary"
//                   aria-label="add an alarm"
//                   sx={BoxShadoWButton}
//                   onClick={(_e) =>
//                     handleOpenModalForm(
//                       <ListaVehiculos
//                         onConfirm={handleConfirmListVehiculo}
//                         vehiculos={dataEnvio.vehiculo.secundarios}
//                       />,
//                       "Vehiculo"
//                     )
//                   }
//                 >
//                   <AirportShuttleIcon fontSize="large" />
//                 </IconButton>
//               </Grid>
//               <Grid item lg={4} xs={12}>
//                 <Typography color="secondary">Chofer</Typography>
//                 <IconButton
//                   color="secondary"
//                   aria-label="add an alarm"
//                   sx={BoxShadoWButton}
//                   onClick={(_e) =>
//                     handleOpenModalForm(
//                       <ListaChoferes
//                         choferes={dataEnvio.choferes}
//                         onConfirm={handleConfirmListaChoferes}
//                       />,
//                       "Vehiculo"
//                     )
//                   }
//                 >
//                   <AssignmentIndIcon fontSize="large" />
//                 </IconButton>
//               </Grid>
//               <Grid item lg={4} xs={12}>
//                 <Typography color="primary">Transportista</Typography>
//                 <IconButton
//                   color="primary"
//                   aria-label="add an alarm"
//                   sx={BoxShadoWButton}
//                   onClick={(_e) =>
//                     handleOpenModalForm(
//                       <TransportistaForm
//                         initialValue={dataEnvio.transportista}
//                         onChange={handleTransportistaChange}
//                       />,
//                       "Transportista"
//                     )
//                   }
//                 >
//                   <CommuteIcon fontSize="large" />
//                 </IconButton>
//               </Grid>
//             </Grid>
//           </Paper>
//         </AccordionDetails>
//         }
//       </Accordion>

//       <DialogComponentCustom
//         closeButton={
//           <Button
//             variant="outlined"
//             color="secondary"
//             onClick={() => handleCloseModalForm()}
//           >
//             Close
//           </Button>
//         }
//         open={modalsForm.open}
//         title={modalsForm.title}
//         element={modalsForm.form}
//       />
//     </>
//   );
// };

// export default EnvioForm;
