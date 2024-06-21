// import React, { useState, useEffect } from "react";
// import Autocomplete from "@mui/material/Autocomplete";
// import TextField from "@mui/material/TextField";
// import { Direccion } from "../../types/doc.interface";
// import { Stack, Button } from "@mui/material";
// import { Departamentos, Provincias, Ubigeos } from "../../types/ubigeo";



// interface DireccionFormProps {
//   initialValue: Direccion;
//   onChange: (direccion: Direccion) => void;
// }

// const DireccionValues: Direccion = {
//   codlocal: "",
//   direccion: "",
//   ruc: "",
//   ubigeo: "",
// };

// const FormDireccion = ({ initialValue, onChange }: DireccionFormProps) => {
//   const [departamentos, setDepartamentos] = useState<Departamentos[]>([]);
//   const [provincias, setProvincias] = useState<Provincias[]>([]);
//   const [ubigeos, setUbigeos] = useState<Ubigeos[]>([]);

//   const [filteredProvincias, setFilteredProvincias] = useState<Provincias[]>([]);
//   const [filteredUbigeos, setFilteredUbigeos] = useState<Ubigeos[]>([]);

//   const [selectedDepartamento, setSelectedDepartamento] =
//     useState<Departamentos | null>(null);
//   const [selectedProvincia, setSelectedProvincia] = useState<Provincias | null>(
//     null
//   );
//   const [selectedUbigeo, setSelectedUbigeo] = useState<Ubigeos | null>(null);

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
//     // Filtrar provincias según el departamento seleccionado
//     if (selectedDepartamento) {
//       const filtered = provincias.filter(
//         (provincia) =>
//           provincia.Codigo.substring(0, 2) === selectedDepartamento.Codigo
//       );
//       setFilteredProvincias(filtered);
//       setSelectedProvincia(null);
//       setSelectedUbigeo(null);
//     } else {
//       setFilteredProvincias([]);
//       setFilteredUbigeos([]);
//       setSelectedProvincia(null);
//       setSelectedUbigeo(null);
//       if(initialValue.ubigeo.length === 0){
//         setSelectedUbigeo(null);
//       }
//     }
    
//   }, [selectedDepartamento]);

//   useEffect(() => {
//     // Filtrar ubigeos según la provincia seleccionada
//     if (selectedProvincia) {
//       const filtered = ubigeos.filter((ubigeo) =>
//         ubigeo.Codigo.startsWith(selectedProvincia.Codigo.substring(0, 4))
//       );
//       setFilteredUbigeos(filtered);
      
//       if(initialValue.ubigeo.length === 0){
//         setSelectedUbigeo(null);
//       }
//     } else {
//       setFilteredUbigeos([]);
//       setSelectedUbigeo(null);
      
//     }
//   }, [selectedProvincia]);

//   useEffect(() => {
//     // Carga inicial utilizando el código de ubigeo proporcionado por el componente padre
//     if (
//       initialValue.ubigeo.length > 0 &&
//       provincias.length > 0 &&
//       ubigeos.length > 0
//     ) {
//       const initialUbigeo = ubigeos.find(
//         (ubigeo) => ubigeo.Codigo === initialValue.ubigeo
//       );

//       if (initialUbigeo) {
//         setSelectedUbigeo(initialUbigeo);
//         const provinciaCodigo = initialUbigeo.Codigo.substring(0, 4);
//         const departamentoCodigo = provinciaCodigo.substring(0, 2);
//         const departamento = departamentos.find(
//           (dep) => dep.Codigo === departamentoCodigo
//         );
//         if (departamento) {
//           setSelectedDepartamento(departamento);
//           const provinciasFiltradas = provincias.filter((prov) =>
//             prov.Codigo.startsWith(departamento.Codigo.substring(0, 2))
//           );
//           const provincia = provinciasFiltradas.find(
//             (prov) => prov.Codigo === provinciaCodigo
//           );
//           if (provincia) {
//             setFilteredProvincias(provinciasFiltradas);
//             setSelectedProvincia(provincia);
//             const ubigeosFiltrados = ubigeos.filter((ubig) =>
//               ubig.Codigo.startsWith(provincia.Codigo.substring(0, 4))
//             );

//             //console.log(ubigeosFiltrados);
//             setFilteredUbigeos(ubigeosFiltrados);

//             /*          console.log(initialUbigeo);

//             setSelectedUbigeo(initialUbigeo); */

//             /*   const selectedUbigeoInitial = ubigeosFiltrados.find((ubig) =>ubig.Codigo === initialUbigeo.Codigo);
              
//               if (selectedUbigeoInitial) {
//                 setSelectedUbigeo(selectedUbigeoInitial);
//               } */
//           }
//         }
//       }
//     }
//   }, [initialValue.ubigeo, ubigeos, departamentos, provincias]);

//   /*   useEffect(() => {
//     // Seleccionar automáticamente el ubigeo inicial después de cargar los datos
//     if (selectedUbigeo && !filteredUbigeos.find(ubig => ubig.Codigo === selectedUbigeo.Codigo)) {
//         setSelectedUbigeo(null);
//     }
// }, [filteredUbigeos]); */

//   useEffect(() => {
//     // Filtrar ubigeos nuevamente cuando se cambia el departamento o provincia seleccionada
//     if (selectedDepartamento && selectedProvincia) {
//       const filtered = ubigeos.filter((ubigeo) =>
//         ubigeo.Codigo.startsWith(selectedProvincia.Codigo.substring(0, 4))
//       );
//       setFilteredUbigeos(filtered);
//     }
//   }, [selectedDepartamento, selectedProvincia]);

//   const handleChange = (
//     event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
//   ) => {
//     const { name, value } = event.target;
//     setDataDireccion({
//       ...dataDireccion,
//       [name]: value,
//     });
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

//   const handleUbigeoChange = (evt: any, newValue: Ubigeos | null) => {
//     evt.preventDefault();
//     if (newValue) {
//         setDataDireccion({ ...dataDireccion, ubigeo: newValue.Codigo });
//         setSelectedUbigeo(newValue);
//     }
//   };

//   const handleOnInputChange = (
//     _evt: React.ChangeEvent<{}>,
//     _newValue: string,
//     reason: string
//   ) => {
    
//     if (reason === "clear") {
//       clearUbigeo();
//       setSelectedUbigeo(null)
      
//     }
//   };

//   return (
//     <div>
//       <TextField
//         margin="normal"
//         size="small"
//         fullWidth
//         name="codlocal"
//         type="text"
//         label="Código de Local"
//         sx={{ mt: 1.5, mb: 1.5 }}
//         value={dataDireccion.codlocal}
//         onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
//           handleChange(e)
//         }
//       />
//       <TextField
//         margin="normal"
//         size="small"
//         fullWidth
//         name="direccion"
//         type="text"
//         label="Dirección"
//         sx={{ mt: 1.5, mb: 1.5 }}
//         value={dataDireccion.direccion}
//         onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
//           handleChange(e)
//         }
//       />
//       <TextField
//         margin="normal"
//         size="small"
//         fullWidth
//         name="ruc"
//         type="text"
//         label="R.U.C."
//         sx={{ mt: 1.5, mb: 1.5 }}
//         value={dataDireccion.ruc}
//         onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
//           handleChange(e)
//         }
//       />
//       <Autocomplete
//         options={departamentos}
//         getOptionLabel={(departamento) => departamento.Departamento}
//         value={selectedDepartamento || null}
//         onInputChange={handleOnInputChange}
//         onChange={(_, value) => setSelectedDepartamento(value)}
//         renderInput={(params) => <TextField {...params} label="Departamento" />}
//         isOptionEqualToValue={(option, value) => option.Codigo === value.Codigo}
//       />

//       <Autocomplete
//         options={filteredProvincias}
//         getOptionLabel={(provincia) => provincia.Provincia}
//         value={selectedProvincia || null}
//         onInputChange={handleOnInputChange}
//         onChange={(_, value) => setSelectedProvincia(value)}
//         renderInput={(params) => <TextField {...params} label="Provincia" />}
//         disabled={!selectedDepartamento} // Deshabilitar si no hay departamento seleccionado
//         isOptionEqualToValue={(option, value) => option.Codigo === value.Codigo}
//       />

//       <Autocomplete
//         options={filteredUbigeos}
//         getOptionLabel={(ubigeo) => ubigeo.Ubigeo}
//         value={selectedUbigeo || null}
//         onChange={handleUbigeoChange}
//         onInputChange={handleOnInputChange}
//         //onChange={(_, value) => setSelectedUbigeo(value)}
//         renderInput={(params) => <TextField {...params} label="Ubigeo" />}
//         //disabled={!selectedProvincia} // Deshabilitar si no hay provincia seleccionada
//         disabled={!selectedProvincia || !filteredProvincias.length}
//         isOptionEqualToValue={(option, value) => option.Codigo === value.Codigo}
//       />
//       <TextField
//         required
//         margin="normal"
//         inputProps={{
//           readOnly: true,
//         }}
//         size="small"
//         fullWidth
//         name="ubigeo"
//         type="text"
//         label="Ubigeo"
//         sx={{ mt: 1.5, mb: 1.5 }}
//         // required
//         value={dataDireccion.ubigeo}
//         // required
//         onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
//           handleChange(e)
//         }
//       />
//       <Stack direction="row" spacing={2}>
//         <Button variant="outlined" color="success" onClick={handleSubmit}>
//           Agregar
//         </Button>

//         <Button variant="outlined" color="error" onClick={handleClean}>
//           Clean
//         </Button>
//       </Stack>
//     </div>
//   );
// };

// export default FormDireccion;
