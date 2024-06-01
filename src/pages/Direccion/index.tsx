import React, { useState, useEffect, MouseEvent } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { Stack, Button, Chip, Paper } from "@mui/material";
import { Departamentos, Provincias, Ubigeos } from "../../types/ubigeo";
import { useFormik } from "formik";

import * as Yup from "yup";
import { DirectionsUser, UserLogin } from "../../types/login.interface";
import { Direccion } from "../../types/guias/guiaremision.interface";
import { PartidaSchema } from "../../utils/validateGuiaRemision";

interface DireccionFormProps {
  initialValue: Direccion;
  onChange: (direccion: Direccion) => void;
  schema?: Yup.AnyObjectSchema;
  codTraslado:string;
}

const DireccionValues: Direccion = {
  codlocal: "",
  direccion: "",
  ruc: "",
  ubigeo: "",
};

const DireccionUserValues: DirectionsUser = {
  alias: "",
  company: "",
  direction: "",
  id: "",
  isconcurrent: "",
  tipo: "",
  codlocal: "",
  direccion: "",
  ruc: "",
  ubigeo: "",
};

const DatosDireccion = ({
  initialValue,
  onChange,
  schema,
  codTraslado
}: DireccionFormProps) => {
  if (codTraslado!=='04'){
    initialValue.codlocal='0000'
  }
  const formik = useFormik({
    initialValues: initialValue,
    validationSchema: schema || PartidaSchema,
    onSubmit: (values) => {
      onChange(values);
    },
  });


  const [directionChip, setDirectionChip] = useState<DirectionsUser>(DireccionUserValues)

  const [ubigeoInicial, setUbigeoInicial] = useState<string>(initialValue.ubigeo || '')

  // const dataUser: UserLogin = JSON.parse(localStorage.getItem('userlogin'));
  // console.log(dataUser);

  // if(schema=== undefined){

  // }
  // const listDirections: DirectionsUser[] = dataUser.directions.filter(item => schema === undefined ? item.tipo === 'P' : item.tipo === 'L');
  const listDirections: DirectionsUser[] = [];
  // const correlativo = parseInt(dataUser.sercor.correlativo)+1

  const [departamentos, setDepartamentos] = useState<Departamentos[]>([]);
  const [provincias, setProvincias] = useState<Provincias[]>([]);
  const [ubigeos, setUbigeos] = useState<Ubigeos[]>([]);

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


  /*  Carga inicial utilizando el código de ubigeo proporcionado por el componente padre */
  useEffect(() => {
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

          }
        }
      }
    }
  }, [ubigeoInicial, ubigeos, departamentos, provincias, filteredUbigeos]);

  // }, [ubigeoInicial, ubigeos, departamentos, provincias,filteredUbigeos]);

  /* establecer valores dando click a los valores por defecto */
  useEffect(() => {
    if (directionChip.alias !== '') {

      formik.setFieldValue('codlocal', directionChip.codlocal)
      formik.setFieldValue('direccion', directionChip.direccion)
      formik.setFieldValue('ruc', directionChip.ruc)
      formik.setFieldValue('ubigeo', directionChip.ubigeo)
      // initialValue.ubigeo=directionChip.ubigeo
      setUbigeoInicial(directionChip.ubigeo)
    }
  }, [directionChip])



  useEffect(() => {
    // Filtrar ubigeos nuevamente cuando se cambia el departamento o provincia seleccionada
    if (selectedDepartamento && selectedProvincia) {
      const filtered = ubigeos.filter((ubigeo) =>
        ubigeo.Codigo.startsWith(selectedProvincia.Codigo.substring(0, 4))
      );
      setFilteredUbigeos(filtered);
    }
  }, [selectedDepartamento, selectedProvincia]);



  const handleClean = () => {
    // setDataDireccion(DireccionValues);
    onChange(DireccionValues);
  };

  const handleUbigeoChange = (evt: any, newValue: Ubigeos | null) => {
    evt.preventDefault();
    if (newValue) {
      setSelectedUbigeo(newValue);
      formik.setFieldValue("ubigeo", newValue.Codigo);
    };
  }

  const handleClickDirection = (evt: MouseEvent<HTMLDivElement>) => {
    evt.preventDefault();
    const spanChip = evt.currentTarget.id;
    setDirectionChip(listDirections.find(item => item.id === spanChip));
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
      <Paper
        elevation={15}
        sx={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          my: 2,
          py: 2,
          borderRadius: 10,
          width: "100%",
        }}
      >
        {listDirections.map((direc) => {
          return (
            <Chip
              sx={{
                height: "auto",
                margin: 1,
                py: 1,
                width: 180,
                "& .MuiChip-label": {
                  display: "block",
                  whiteSpace: "normal",
                  textAlign: "center",
                  fontWeight: "bold",
                },
                color: "white",
              }}
              id={direc.id}
              label={direc.alias}
              key={direc.id}
              // color={indicador.selected ? "success" : "default"}
              clickable={true}
              onClick={handleClickDirection}
            // icon={indicador.icon}
            />
          );
        })}
      </Paper>
      <form onSubmit={formik.handleSubmit}>
        <TextField
          margin="normal"
          size="small"
          fullWidth
          name="codlocal"
          type="text"
          label="Código de Local"
          sx={{ my:1.5 }}
          value={formik.values.codlocal}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          helperText={formik.touched.codlocal && formik.errors.codlocal}
          error={formik.touched.codlocal && Boolean(formik.errors.codlocal)}
        />
        <TextField
          margin="normal"
          size="small"
          fullWidth
          name="direccion"
          type="text"
          label="Dirección"
          sx={{ my:1.5 }}
       
          value={formik.values.direccion}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          helperText={formik.touched.direccion && formik.errors.direccion}
          error={formik.touched.direccion && Boolean(formik.errors.direccion)}
        />
        <TextField
          margin="normal"
          size="small"
          fullWidth
          name="ruc"
          type="text"
          label="R.U.C."
          sx={{ my:1.5 }}
        
          value={formik.values.ruc}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          helperText={formik.touched.ruc && formik.errors.ruc}
          error={formik.touched.ruc && Boolean(formik.errors.ruc)}
        />
        <Autocomplete
          options={departamentos}
          getOptionLabel={(departamento) => departamento.Departamento}
          value={selectedDepartamento || null}
          onInputChange={handleOnInputChange}
          onChange={(_, value) => setSelectedDepartamento(value)}
          size="small"
          renderInput={(params) => (
            <TextField margin="normal" {...params} label="Departamento" />
          )}
          isOptionEqualToValue={(option, value) =>
            option.Codigo === value.Codigo
          }
        />

        <Autocomplete
          options={filteredProvincias}
          getOptionLabel={(provincia) => provincia.Provincia}
          value={selectedProvincia || null}
          onInputChange={handleOnInputChange}
          onChange={(_, value) => setSelectedProvincia(value)}
          size="small"
          renderInput={(params) => <TextField margin="normal" {...params} label="Provincia" />}
          disabled={!selectedDepartamento} // Deshabilitar si no hay departamento seleccionado
          isOptionEqualToValue={(option, value) =>
            option.Codigo === value.Codigo
          }
        />

        <Autocomplete
          options={filteredUbigeos}
          getOptionLabel={(ubigeo) => ubigeo.Ubigeo}
          value={selectedUbigeo || null}
          onChange={handleUbigeoChange}
          size="small"
          
          onInputChange={handleOnInputChange}
          //onChange={(_, value) => setSelectedUbigeo(value)}
          renderInput={(params) => <TextField margin="normal" {...params} label="Distrito" />}
          //disabled={!selectedProvincia} // Deshabilitar si no hay provincia seleccionada
          disabled={!selectedProvincia || !filteredProvincias.length}
          isOptionEqualToValue={(option, value) =>
            option.Codigo === value.Codigo
          }
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
          sx={{ my:1.5 }}
       

          value={formik.values.ubigeo}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          helperText={formik.touched.ubigeo && formik.errors.ubigeo}
          error={formik.touched.ubigeo && Boolean(formik.errors.ubigeo)}
        />
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" color="success" type="submit">
            Agregar
          </Button>

          <Button variant="outlined" color="error" onClick={handleClean}>
            Clean
          </Button>
        </Stack>
      </form>
    </>
  );
};


export default DatosDireccion;
