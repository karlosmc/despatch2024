// import React, { useState, useEffect } from "react";
// import { Direccion } from "../../types/doc.interface";
// import { Autocomplete, AutocompleteInputChangeReason, Box, Button, Stack, TextField } from "@mui/material";
// import { Departamentos, Provincias, Ubigeos } from "../../types/ubigeo";

// const DireccionValues: Direccion = {
//   codlocal: "",
//   direccion: "",
//   ruc: "",
//   ubigeo: "",
// };

// /* const depInitialValues: Departamentos = {
//   Id: 0,
//   Codigo: "",
//   Departamento: "",
// };
// const provInitialValues: Provincias = {
//   Id: 0,
//   Codigo: "",
//   Provincia: "",
// };
// const ubiInitialValues: Ubigeos = {
//   Id: 0,
//   Codigo: "",
//   Ubigeo: "",
// }; */

// interface DireccionFormProps {
//   onChange: (direccion: Direccion) => void;
//   initialValue: Direccion;
// }

// interface DepartamentoAutocompleteProps {
//   departamentos: Departamentos[];
//   onSelectDepartamento: (departamento: Departamentos | null) => void;
// }

// interface ProvinciaAutocompleteProps {
//   provincias: Provincias[];
//   onSelectProvincia: (provincia: Provincias | null) => void;
// }

// interface UbigeoAutocompleteProps {
//   ubigeos: Ubigeos[];
// }

// const DepartamentoAutocomplete: React.FC<DepartamentoAutocompleteProps> = ({
//   departamentos,
//   onSelectDepartamento,
// }) => {
//   const handleInputChange = (_event: React.ChangeEvent<{}>, _value: string, reason: AutocompleteInputChangeReason) => {
//     if (reason === 'reset') {
//         onSelectDepartamento(null); // Limpia la selección de la provincia
//     }
// };
//   return (
//     <Autocomplete
//       options={departamentos}
//       getOptionLabel={(departamento) => departamento.Departamento}
//       onChange={(_, value) => onSelectDepartamento(value)}
//       renderInput={(params) => <TextField {...params} label="Departamento" />}
//       isOptionEqualToValue={(option, value) => option.Codigo === value.Codigo}
//       onInputChange={handleInputChange}
//       renderOption={(props, departamentos) => (
//         <Box component="li" {...props} key={departamentos.Codigo}>
//           {departamentos.Departamento}
//         </Box>
//       )}
//     />
//   );
// };

// const ProvinciaAutocomplete: React.FC<ProvinciaAutocompleteProps> = ({
//   provincias,
//   onSelectProvincia,
// }) => {

//   const handleInputChange = (_event: React.ChangeEvent<{}>, _value: string, reason: AutocompleteInputChangeReason) => {
//     if (reason === 'reset') {
//         onSelectProvincia(null); // Limpia la selección de la provincia
//     }
// };
//   return (
//     <Autocomplete
//       options={provincias}
//       getOptionLabel={(provincia) => provincia.Provincia}
//       onChange={(_, value) => onSelectProvincia(value)}
//       renderInput={(params) => <TextField {...params} label="Provincia" />}
//       isOptionEqualToValue={(option, value) => option.Codigo === value.Codigo}
//       onInputChange={handleInputChange}
//       renderOption={(props, provincia) => (
//         <Box component="li" {...props} key={provincia.Codigo}>
//           {provincia.Provincia}
//         </Box>
//       )}
//     />
//   );
// };

// const UbigeoAutocomplete: React.FC<UbigeoAutocompleteProps> = ({ ubigeos }) => {
//   return (
//     <Autocomplete
//       options={ubigeos}
//       getOptionLabel={(ubigeo) => ubigeo.Ubigeo}
//       renderInput={(params) => <TextField {...params} label="Ubigeo" />}
//       isOptionEqualToValue={(option, value) => option.Codigo === value.Codigo}
//       renderOption={(props, ubigeo) => (
//         <Box component="li" {...props} key={ubigeo.Codigo}>
//           {ubigeo.Ubigeo}
//         </Box>
//       )}
//     />
//   );
// };

// const DireccionFormChat = ({ initialValue, onChange }: DireccionFormProps) => {


//   const [departamentos, setDepartamentos] = useState<Departamentos[]>([]);
//   const [provincias, setProvincias] = useState<Provincias[]>([]);
//   const [ubigeos, setUbigeos] = useState<Ubigeos[]>([]);

//   const initialDepartamento: Departamentos | null = departamentos.length > 0 ? departamentos[0] : null;
//   const initialProvincia: Provincias | null = provincias.length > 0 ? provincias[0] : null;


//   const [selectedDepartamento, setSelectedDepartamento] =
//     useState<Departamentos | null>(initialDepartamento);
//   const [selectedProvincia, setSelectedProvincia] = useState<Provincias | null>(initialProvincia);

//   const [selectedUbigeo, setSelectedUbigeo] = useState<Ubigeos | null>(null);


//   const [filteredProvincias, setFilteredProvincias] = useState<Provincias[]>(
//     []
//   );
//   const [filteredUbigeos, setFilteredUbigeos] = useState<Ubigeos[]>([]);

//   const [dataDireccion, setDataDireccion] = useState<Direccion | null>(
//     initialValue
//   );

//   useEffect(() => {
//     const loadData = async () => {
//       const loadDepartamento = await fetch("src/files/Departamentos.json");
//       const loadDepartamentoJson = await loadDepartamento.json();
//       setDepartamentos(loadDepartamentoJson);

//       const loadProvincia = await fetch("src/files/Provincias.json");
//       const loadProvinciaJson = await loadProvincia.json();
//       setProvincias(loadProvinciaJson);

//       const loadUbigeo = await fetch("src/files/ubigeo.json");
//       const loadUbigeoJson = await loadUbigeo.json();
//       setUbigeos(loadUbigeoJson);
//     };

//     loadData();
//   }, []);

//   useEffect(() => {
//     // Cargar los datos iniciales y seleccionar automáticamente departamento y provincia
//     if (initialValue.ubigeo !== "") {
//       const codigoUbigeoInicial: string = initialValue.ubigeo;
//       const departamentoCodigo = codigoUbigeoInicial.substr(0, 2);
//       const provinciaCodigo = codigoUbigeoInicial.substr(0, 4);

//       const departamentoSeleccionado = departamentos.find(
//         (departamento) => departamento.Codigo === departamentoCodigo
//       );
//       const provinciaSeleccionada = provincias.find(
//         (provincia) => provincia.Codigo === provinciaCodigo
//       );

//       setSelectedDepartamento(departamentoSeleccionado || null);
//       setSelectedProvincia(provinciaSeleccionada || null);

//       setFilteredProvincias(
//         provincias.filter((provincia) =>
//           provincia.Codigo.startsWith(departamentoCodigo)
//         )
//       );
//       setFilteredUbigeos(
//         ubigeos.filter((ubigeo) => ubigeo.Codigo.startsWith(provinciaCodigo))
//       );
//     }
//   }, [departamentos, provincias, ubigeos, initialValue.ubigeo]);

//   useEffect(() => {
//     // Resetear provincia y ubigeo cuando se resetea el departamento
//     setSelectedProvincia(null);
//     setSelectedUbigeo(null);
// }, [selectedDepartamento]);

// useEffect(() => {
//     // Resetear ubigeo cuando se resetea la provincia
//     setSelectedUbigeo(null);
// }, [selectedProvincia]);

//   const handleSelectDepartamento = (departamento) => {
//     setSelectedDepartamento(departamento);

//     if(departamento){
//       const departamentoCodigo = departamento.Codigo.substr(0, 2);
//       const provinciasFiltradas = provincias.filter((provincia) =>
//         provincia.Codigo.startsWith(departamentoCodigo)
//       );
//       setFilteredProvincias(provinciasFiltradas);
  
//       setSelectedProvincia(provinciasFiltradas[0] || null);
//       setFilteredUbigeos([]);
//     }
//   };

//   const handleSelectProvincia = (provincia) => {
//     setSelectedProvincia(provincia);
//   if(provincia){
//     const provinciaCodigo = provincia.Codigo.substr(0, 4);
//     const ubigeosFiltrados = ubigeos.filter((ubigeo) =>
//       ubigeo.Codigo.startsWith(provinciaCodigo)
//     );
//     setFilteredUbigeos(ubigeosFiltrados);
//   }
//   };

//   const handleChange = (
//     event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
//   ) => {
//     const { name, value } = event.target;
//     setDataDireccion({
//       ...dataDireccion,
//       [name]: value,
//     });
//   };
//   const handleOnInputChange = (
//     _evt: React.ChangeEvent<{}>,
//     _newValue: string,
//     reason: string
//   ) => {
//     if (reason === "clear") {
//       clearUbigeo();
//     }
//   };

//   const handleSubmit = () => {
//     onChange(dataDireccion);
//   };

//   const handleClean = () => {
//     setDataDireccion(DireccionValues);
//     onChange(DireccionValues);
//   };

  
//   const clearUbigeo = () => {
//     setDataDireccion({ ...dataDireccion, ubigeo: "" });
//   };
//   return (
//     <>
//       <>
//         <TextField
//           margin="normal"
//           size="small"
//           fullWidth
//           name="codlocal"
//           type="text"
//           label="Código de Local"
//           sx={{ mt: 1.5, mb: 1.5 }}
//           value={dataDireccion.codlocal}
//           onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
//             handleChange(e)
//           }
//         />
//         <TextField
//           margin="normal"
//           size="small"
//           fullWidth
//           name="direccion"
//           type="text"
//           label="Dirección"
//           sx={{ mt: 1.5, mb: 1.5 }}
//           value={dataDireccion.direccion}
//           onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
//             handleChange(e)
//           }
//         />
//         <TextField
//           margin="normal"
//           size="small"
//           fullWidth
//           name="ruc"
//           type="text"
//           label="R.U.C."
//           sx={{ mt: 1.5, mb: 1.5 }}
//           value={dataDireccion.ruc}
//           onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
//             handleChange(e)
//           }
//         />
//         <DepartamentoAutocomplete
//           departamentos={departamentos}
//           onSelectDepartamento={handleSelectDepartamento}
//         />

//         <ProvinciaAutocomplete
//           provincias={filteredProvincias}
//           onSelectProvincia={handleSelectProvincia}
//         />
//         <UbigeoAutocomplete ubigeos={filteredUbigeos} />
//         <TextField
//             required
//             margin="normal"
//             inputProps={{
//               readOnly: true,
//             }}
//             size="small"
//             fullWidth
//             name="ubigeo"
//             type="text"
//             label="Ubigeo"
//             sx={{ mt: 1.5, mb: 1.5 }}
//             // required
//             value={dataDireccion.ubigeo}
//             // required
//             onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
//               handleChange(e)
//             }
//           />

//         <Stack direction="row" spacing={2}>
//           <Button variant="outlined" color="success" onClick={handleSubmit}>
//             Agregar
//           </Button>

//           <Button variant="outlined" color="error" onClick={handleClean}>
//             Clean
//           </Button>
//         </Stack>
//       </>
//     </>
//   );
// };

// export default DireccionFormChat;
