import { Autocomplete, TextField } from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { Departamentos, Provincias, Ubigeos } from "../../types/ubigeo";


interface UbigeoComponentProps {
  initialValue:string;
  onChange:(ubigeo:string)=>void;
}

const UbigeoComponent = ({initialValue, onChange }:UbigeoComponentProps) => {
  
  
  const [ubigeoInicial, setUbigeoInicial] = useState<string>(initialValue)

  const [departamentos, setDepartamentos] = useState<Departamentos[]>([]);
  const [provincias, setProvincias] = useState<Provincias[]>([]);
  const [ubigeos, setUbigeos] = useState<Ubigeos[]>([]);

  // const [ubig, setUbig] = useState<string>(initialValue||'')

  const [filteredProvincias, setFilteredProvincias] = useState<Provincias[]>(
    []
  );
  
  const [filteredUbigeos, setFilteredUbigeos] = useState<Ubigeos[]>([]);

  const [selectedDepartamento, setSelectedDepartamento] =
    useState<Departamentos | null>(null);
  const [selectedProvincia, setSelectedProvincia] = useState<Provincias | null>(
    null
  );
  const [selectedUbigeo, setSelectedUbigeo] = useState<Ubigeos | null>(null);

    /* cargar json */

    useEffect(() => {
      const loadData = async () => {
        const loadDepartamento = await fetch("src/files/Departamentos.json");
        const loadDepartamentoJson = await loadDepartamento.json();
        setDepartamentos(loadDepartamentoJson);
  
        const loadProvincia = await fetch("src/files/Provincias.json");
        const loadProvinciaJson = await loadProvincia.json();
        setProvincias(loadProvinciaJson);
  
        const loadUbigeo = await fetch("src/files/ubigeo.json");
        const loadUbigeoJson = await loadUbigeo.json();
        setUbigeos(loadUbigeoJson);
      };
  
      loadData();
    }, []);
  
    /* Filtrar provincias según el departamento seleccionado */
    useEffect(() => {
      // Filtrar provincias según el departamento seleccionado
      if (selectedDepartamento) {
        const filtered = provincias.filter(
          (provincia) =>
            provincia.Codigo.substring(0, 2) === selectedDepartamento.Codigo
        );
        setFilteredProvincias(filtered);
        setSelectedProvincia(null);
        setSelectedUbigeo(null);
      } else {
        setFilteredProvincias([]);
        setFilteredUbigeos([]);
        setSelectedProvincia(null);
        setSelectedUbigeo(null);
        if (ubigeoInicial.length === 0) {
          setSelectedUbigeo(null);
        }
      }
    }, [selectedDepartamento]);
  
    /* Filtrar ubigeos según la provincia seleccionada */
    useEffect(() => {
      // Filtrar ubigeos según la provincia seleccionada
      if (selectedProvincia) {
        const filtered = ubigeos.filter((ubigeo) =>
          ubigeo.Codigo.startsWith(selectedProvincia.Codigo.substring(0, 4))
        );
        setFilteredUbigeos(filtered);
  
        if (ubigeoInicial.length === 0) {
          setSelectedUbigeo(null);
        }
      } else {
        setFilteredUbigeos([]);
        setSelectedUbigeo(null);
      }
    }, [selectedProvincia]);


  useEffect(() => {
    // console.log(ubigeoInicial);
    // Carga inicial utilizando el código de ubigeo proporcionado por el componente padre
    if (
      ubigeoInicial.length > 0 &&
      provincias.length > 0 &&
      ubigeos.length > 0
    ) {
      const initialUbigeo = ubigeos.find(
        (ubigeo) => ubigeo.Codigo === ubigeoInicial
      );

      if (initialUbigeo) {
        setSelectedUbigeo(initialUbigeo);
        const provinciaCodigo = initialUbigeo.Codigo.substring(0, 4);
        const departamentoCodigo = provinciaCodigo.substring(0, 2);
        const departamento = departamentos.find(
          (dep) => dep.Codigo === departamentoCodigo
        );
        if (departamento) {
          setSelectedDepartamento(departamento);
          const provinciasFiltradas = provincias.filter((prov) =>
            prov.Codigo.startsWith(departamento.Codigo.substring(0, 2))
          );
          const provincia = provinciasFiltradas.find(
            (prov) => prov.Codigo === provinciaCodigo
          );
          if (provincia) {
            setFilteredProvincias(provinciasFiltradas);
            setSelectedProvincia(provincia);
            // const ubigeosFiltrados = ubigeos.filter((ubig) =>
            //   ubig.Codigo.startsWith(provincia.Codigo.substring(0, 4))
            // );

            // //console.log(ubigeosFiltrados);
            // setFilteredUbigeos(ubigeosFiltrados);

            /*          console.log(initialUbigeo);

            setSelectedUbigeo(initialUbigeo); */

            /*   const selectedUbigeoInitial = ubigeosFiltrados.find((ubig) =>ubig.Codigo === initialUbigeo.Codigo);
              
              if (selectedUbigeoInitial) {
                setSelectedUbigeo(selectedUbigeoInitial);
              } */
          }
        }
      }
    }
  }, [ubigeoInicial, ubigeos, departamentos, provincias,filteredUbigeos]);

  // useEffect(()=>{
  //   console.log(initialValue);
  //   setUbigeoInicial(initialValue)
  // },[initialValue])
  useEffect(() => {
    // Filtrar ubigeos nuevamente cuando se cambia el departamento o provincia seleccionada
    if (selectedDepartamento && selectedProvincia) {
      const filtered = ubigeos.filter((ubigeo) =>
        ubigeo.Codigo.startsWith(selectedProvincia.Codigo.substring(0, 4))
      );
      setFilteredUbigeos(filtered);
    }
  }, [selectedDepartamento, selectedProvincia]);

  const handleUbigeoChange = (evt: any, newValue: Ubigeos | null) => {
    evt.preventDefault();
    if (newValue) {
      
      setSelectedUbigeo(newValue);
      // setUbig(newValue.Codigo)
      // setUbigeoInicial('')
      onChange(newValue.Codigo)

      // formik.setFieldValue("ubigeo", newValue.Codigo);
      // setSelectedUbigeo(newValue);
    }
   
  };


  const handleOnInputChange = (
    _evt: React.ChangeEvent<{}>,
    _newValue: string,
    reason: string
  ) => {
    if (reason === "clear") {
      // clearUbigeo();
      setSelectedUbigeo(null);
    }
  };


  return (
    <>
      <Autocomplete
        options={departamentos}
        getOptionLabel={(departamento) => departamento.Departamento}
        value={selectedDepartamento || null}
        onInputChange={handleOnInputChange}
        onChange={(_, value) => setSelectedDepartamento(value)}
        renderInput={(params) => <TextField {...params} label="Departamento" />}
        isOptionEqualToValue={(option, value) => option.Codigo === value.Codigo}
      />

      <Autocomplete
        options={filteredProvincias}
        getOptionLabel={(provincia) => provincia.Provincia}
        value={selectedProvincia || null}
        onInputChange={handleOnInputChange}
        onChange={(_, value) => setSelectedProvincia(value)}
        renderInput={(params) => <TextField {...params} label="Provincia" />}
        disabled={!selectedDepartamento} // Deshabilitar si no hay departamento seleccionado
        isOptionEqualToValue={(option, value) => option.Codigo === value.Codigo}
      />

      <Autocomplete
        options={filteredUbigeos}
        getOptionLabel={(ubigeo) => ubigeo.Ubigeo}
        value={selectedUbigeo || null}
        onChange={handleUbigeoChange}
        onInputChange={handleOnInputChange}
        //onChange={(_, value) => setSelectedUbigeo(value)}
        renderInput={(params) => <TextField {...params} label="Ubigeo" />}
        //disabled={!selectedProvincia} // Deshabilitar si no hay provincia seleccionada
        disabled={!selectedProvincia || !filteredProvincias.length}
        isOptionEqualToValue={(option, value) => option.Codigo === value.Codigo}
      />
      <TextField
        required
        margin="normal"
        inputProps={{
          readOnly: true,
        }}
        size="small"
        fullWidth
        name="ubigeo"
        type="text"
        label="Ubigeo"
        sx={{ mt: 1.5, mb: 1.5 }}
        value={selectedUbigeo?.Codigo||''}
        // required
        // value={dataDireccion.ubigeo}
        // // required
        // onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
        //   handleChange(e)
        // }

        // value={formik.values.ubigeo}
        // onChange={formik.handleChange}
        // onBlur={formik.handleBlur}
        // helperText={formik.touched.ubigeo && formik.errors.ubigeo}
        // error={formik.touched.ubigeo && Boolean(formik.errors.ubigeo)}
      />
    </>
  );
};

export default React.memo(UbigeoComponent);
