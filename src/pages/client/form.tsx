// import {
//   Dispatch,
//   FC,
//   SetStateAction,
//   useRef,
//   useEffect,
//   useState,
// } from "react";
// import { ClientInterface, data } from "../../types/client.interface";
// import {
//   Grid,
//   Paper,
//   Box,
//   TextField,
//   Button,
//   FormControl,
//   InputLabel,
//   MenuItem,
//   Select,
//   Autocomplete,
// } from "@mui/material";
// import { LoginValidate } from "../../utils/validateForm";
// import { useNotification } from "../../context/notification.context";
// import { useFormik } from "formik";
// import { client } from "../../api/client";
// import { AxiosResponse } from "axios";
// import { Ubigeos, Departamentos, Provincias } from "../../types/ubigeo";

// type FormProps = {
//   setOpenModal: Dispatch<SetStateAction<boolean>>;
//   setRefresh: Dispatch<SetStateAction<boolean>>;
// };

// export const FormClient: FC<FormProps> = ({ setOpenModal, setRefresh }) => {
//   const initialValues: ClientInterface = {
//     email: "",
//     id: "",
//     rznSocial: "",
//     numDoc: "",
//     telephone: "",
//     tipoDoc: "",
//     address: {
//       direccion: "",
//       isMain: true,
//       ubigeo: "",
//     },
//   };

//   const onSubmit = (values: ClientInterface) => {

    
//     if(values.address?.ubigeo===''){
//       getError('Debe seleccionar el ubigeo');
//       return
//     }
//     client
//       .save(values)
//       .then((r: AxiosResponse) => {
//         const datos: data = r.data;
//         if (datos.result.success) {
//           setOpenModal(false);
//           getSuccess(datos.result.message);
//           setRefresh(true);
//         } else {
//           getError(datos.result.message);
//         }
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   };

//   const formik = useFormik({
//     initialValues,
//     enableReinitialize: true,
//     validationSchema: LoginValidate,
//     onSubmit,
    
//   });

//   const timer = useRef();
//   const { getError, getSuccess } = useNotification();

//   useEffect(() => {
//     if (!formik.isSubmitting) return;
//     console.log(Object.keys(formik.errors));
//     if (Object.keys(formik.errors).length > 0) {
      
//       let nameElement:string =Object.keys(formik.errors)[0];
//       const valuesError = Object.values(formik.errors)[0];

//       if(typeof valuesError==='object'){
//         nameElement=nameElement+'.'+ Object.keys(valuesError)[0];
//       }
//       getError(JSON.stringify(Object.values(formik.errors)[0]));
//       document
//         .getElementsByName(nameElement)[0]
//         .scrollIntoView({ behavior: "smooth", block: "center" });
//       setTimeout(() => {
//         document.getElementsByName(nameElement)[0].focus();
//       }, 1500);
//     }
//   }, [formik]);

//   useEffect(() => {
//     return () => {
//       clearTimeout(timer.current);
//     };
//   }, []);

//   const [dataUbigeo, setDataUbigeo] = useState<Ubigeos[]>([]);
//   const [dataDepartamento, setDataDepartamento] = useState<Departamentos[]>([]);
//   const [dataProvincia, setDataProvincia] = useState<Provincias[]>([]);

//   //const [departamentos, setDepartamentos] = useState<Departamentos[]>([]);
//   const [provincia, setProvincia] = useState<Provincias[]>([]);

//   const [ubigeo, setUbigeo] = useState<Ubigeos[]>([]);
//   const provInitialValues: Provincias = {
//     Id: 0,
//     Codigo: "",
//     Provincia: "",
//   };
//   const ubiInitialValues: Ubigeos = {
//     Id: 0,
//     Codigo: "",
//     Ubigeo: "",
//   };

//   const [prov, setProv] = useState<Provincias | null>(provInitialValues);

//   const [ubi, setUbi] = useState<Ubigeos | null>(ubiInitialValues);

//   const handleDepartamentoChange = (
//     evt: any,
//     newValue: Departamentos | null
//   ) => {
//     evt.preventDefault();

//     setProv(null);

//     const newProvincias = dataProvincia.filter(
//       (prov) => prov.Codigo.substring(0, 2) === newValue?.Codigo
//     );
//     setProvincia(newProvincias);
//   };

//   const handleProvinciaChange = (evt: any, newValue: Provincias | null) => {
//     evt.preventDefault();
//     setProv(newValue);
//     setUbi(null);
//     const newDistritos = dataUbigeo.filter(
//       (ubi) => ubi.Codigo.substring(0, 4) === newValue?.Codigo
//     );
//     setUbigeo(newDistritos);
//   };

//   const handleUbigeoChange = (evt: any, newValue: Ubigeos | null) => {
//     evt.preventDefault();
//     setUbi(newValue);
//     if(newValue){
//       formik.setFieldValue('address.ubigeo', newValue?.Codigo, false)
//     }
//   };

//   const handleUbigeoInputChange=(evt: any, newValue: string,reason:string) => { 
    
//     if(reason ==='clear'){
//       formik.setFieldValue('address.ubigeo', '', true)
//     }
//   }

//   const handleProvinciaInputChange=(evt: any, newValue: string,reason:string) => { 
    
//     if(reason ==='clear'){
      
//       formik.setFieldValue('address.ubigeo', '', true)
//     }
    
//   }
//   const handleDepartamentoInputChange=(evt: any, newValue: string,reason:string) => { 
    
//     if(reason ==='clear'){
      
//       formik.setFieldValue('address.ubigeo', '', true)
//     }
    
//   }

//   useEffect(() => {
//     fetch("src/files/ubigeo.json")
//       .then((res) => res.json())
//       .then((res) => setDataUbigeo(res));

//     fetch("src/files/Departamentos.json")
//       .then((res) => res.json())
//       .then((res) => setDataDepartamento(res));
//     fetch("src/files/Provincias.json")
//       .then((res) => res.json())
//       .then((res) => setDataProvincia(res));
//   }, []);

//   return (
//     <Grid container direction="row" alignItems="center" justifyContent="center">
//       <Grid item>
//         <Paper sx={{ padding: "1.2em", borderRadius: "0.5em" }}>
//           <Box component="form" onSubmit={formik.handleSubmit} autoComplete="off">
//             <FormControl fullWidth>
//               <InputLabel id="demo-simple-select-label">T. Doc.</InputLabel>
//               <Select
//                 labelId="demo-simple-select-label"
//                 id="demo-simple-select"
//                 value={formik.values.tipoDoc}
//                 label="Tipo Documento"
//                 onChange={formik.handleChange}
//                 error={formik.touched.tipoDoc && Boolean(formik.errors.tipoDoc)}
//                 onBlur={formik.handleBlur}
//                 name="tipoDoc"
//               >
//                 <MenuItem value={"1"}>DNI</MenuItem>
//                 <MenuItem value={"6"}>RUC</MenuItem>
//                 <MenuItem value={"4"}>C.E.</MenuItem>
//               </Select>
//             </FormControl>
//             <TextField
//               margin="normal"
//               size="small"
//               fullWidth
//               name="numDoc"
//               type="text"
//               label="Número Documento"
//               sx={{ mt: 1.5, mb: 1.5 }}
//               value={formik.values.numDoc}
//               // required
//               onChange={formik.handleChange}
//               error={formik.touched.numDoc && Boolean(formik.errors.numDoc)}
//               onBlur={formik.handleBlur}
//             />
//             <TextField
//               margin="normal"
//               size="small"
//               fullWidth
//               name="rznSocial"
//               type="text"
//               label="Razón Social"
//               sx={{ mt: 1.5, mb: 1.5 }}
//               // required
//               value={formik.values.rznSocial}
//               // required
//               onChange={formik.handleChange}
//               error={
//                 formik.touched.rznSocial && Boolean(formik.errors.rznSocial)
//               }
//               onBlur={formik.handleBlur}
//             />
//             <TextField
//               margin="normal"
//               size="small"
//               fullWidth
//               name="telephone"
//               type="text"
//               label="Teléfono"
//               sx={{ mt: 1.5, mb: 1.5 }}
//               // required
//               value={formik.values.telephone}
//               // required
//               onChange={formik.handleChange}
//             />
//             <TextField
//               margin="normal"
//               size="small"
//               fullWidth
//               name="email"
//               type="text"
//               label="E-mail"
//               sx={{ mt: 1.5, mb: 1.5 }}
//               // required
//               value={formik.values.email}
//               // required
//               onChange={formik.handleChange}
//             />

//             <Autocomplete
//               disablePortal
//               id="combo-box-demo"
//               fullWidth
//               options={dataDepartamento}
//               onChange={handleDepartamentoChange}
//               onInputChange={handleDepartamentoInputChange}
//               noOptionsText={"No hay datos que mostrar"}
//               getOptionLabel={(dataDepartamento) =>
//                 `${dataDepartamento.Departamento}`
//               }
//               isOptionEqualToValue={(option, value) =>
//                 option.Codigo === value.Codigo
//               }
//               renderInput={(params) => (
//                 <TextField {...params} label="Departamento" />
//               )}
//               renderOption={(props, dataDepartamento) => (
//                 <Box component="li" {...props} key={dataDepartamento.Codigo}>
//                   {dataDepartamento.Departamento}
//                 </Box>
//               )}
//             />
//             <Autocomplete
//               disablePortal
//               id="combo-box-demo"
//               fullWidth
//               value={prov}
//               options={provincia}
//               onChange={handleProvinciaChange}
//               onInputChange={handleProvinciaInputChange}
//               noOptionsText={"No hay datos que mostrar"}
//               getOptionLabel={(provincia) => `${provincia.Provincia}`}
//               isOptionEqualToValue={(option, value) =>
//                 option.Codigo === value.Codigo
//               }
//               renderInput={(params) => (
//                 <TextField {...params} label="Provincia" />
//               )}
//               renderOption={(props, provincia) => (
//                 <Box component="li" {...props} key={provincia.Codigo}>
//                   {provincia.Provincia}
//                 </Box>
//               )}
//             />

//             <Autocomplete
//               disablePortal
//               id="combo-box-demo"
//               fullWidth
//               options={ubigeo}
              
//               value={ubi}
//               noOptionsText={"No hay datos que mostrar"}
//               onChange={handleUbigeoChange}
//               onInputChange={handleUbigeoInputChange}
//               getOptionLabel={(ubigeo) => `${ubigeo.Ubigeo}`}
//               isOptionEqualToValue={(option, value) =>
//                 option.Codigo === value.Codigo
//               }
//               renderInput={(params) => (
//                 <TextField {...params} label="Distrito" />
//               )}
//               renderOption={(props, ubigeo) => (
//                 <Box component="li" {...props} key={ubigeo.Codigo}>
//                   {ubigeo.Ubigeo}
//                 </Box>
//               )}
//             />
//                <TextField
//                 required
//                 margin="normal"
//                 inputProps={{
//                   readOnly:true
//                 }}
//                 size="small"
//                 fullWidth
//                 name="address.ubigeo"
//                 type="text"
//                 label="Ubigeo"
//                 sx={{ mt: 1.5, mb: 1.5 }}
//                 // required
//                 value={formik.values.address?.ubigeo}
//                 // required
//                 onChange={formik.handleChange}
//               />
//             <Button
//               fullWidth
//               type="submit"
//               variant="contained"
//               sx={{ mt: 1.5, mb: 3 }}
//             >
           
//               Save
//             </Button>
//           </Box>
//         </Paper>
//       </Grid>
//     </Grid>
//   );
// };
