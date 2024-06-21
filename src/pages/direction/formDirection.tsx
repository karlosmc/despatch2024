import React, { useState, useEffect } from "react";
import { Direccion } from "../../types/doc.interface";
import { Autocomplete, Box, Button, Stack, TextField } from "@mui/material";
import { Departamentos, Provincias, Ubigeos } from "../../types/ubigeo";

const DireccionValues: Direccion = {
  codLocal: "",
  direccion: "",
  ruc: "",
  ubigeo: "",
};

const depInitialValues: Departamentos = {
  Id: 1,
  Codigo: "01",
  Departamento: "AMAZONAS",
};
const provInitialValues: Provincias = {
  Id: 0,
  Codigo: "",
  Provincia: "",
};
const ubiInitialValues: Ubigeos = {
  Id: 0,
  Codigo: "",
  Ubigeo: "",
};

interface DireccionFormProps {
  onChange: (direccion: Direccion) => void;
  initialValue: Direccion;
}

const DireccionForm = ({ initialValue, onChange }: DireccionFormProps) => {
  const [chargePage, setChargePage] = useState<boolean>(true);
  useEffect(() => {
    setTimeout(() => {
      setChargePage(false);
    }, 2000);
  }, [chargePage]);

  useEffect(() => {
    const loadData = async () => {
      const loadDepartamento = await fetch("src/files/Departamentos.json");
      const loadDepartamentoJson = await loadDepartamento.json();
      setDataDepartamento(loadDepartamentoJson);

      const loadProvincia = await fetch("src/files/Provincias.json");
      const loadProvinciaJson = await loadProvincia.json();
      setDataProvincia(loadProvinciaJson);

      const loadUbigeo = await fetch("src/files/ubigeo.json");
      const loadUbigeoJson = await loadUbigeo.json();
      setDataUbigeo(loadUbigeoJson);
    };

    loadData();
  }, []);

  useEffect(() => {
    if(initialValue.ubigeo!==''){
      console.log('entro');
      setDataDepartamento(dataDepartamento.filter(dep=>dep.Codigo===initialValue.ubigeo.substring(0,2)))
      setDep(dataDepartamento.find(dep=>dep.Codigo===initialValue.ubigeo.substring(0,2)))
      setDataProvincia(dataProvincia.filter(pro=>pro.Codigo===initialValue.ubigeo.substring(0,2)))
      setProv(dataProvincia.find(pro=>pro.Codigo===initialValue.ubigeo.substring(0,4)))

      setDataUbigeo(dataUbigeo.filter(ubig=>ubig.Codigo===initialValue.ubigeo.substring(0,4)))
      setUbi(dataUbigeo.find(ubig=>ubig.Codigo===initialValue.ubigeo))
    }
  }, [initialValue]);

  const [dataDireccion, setDataDireccion] = useState<Direccion | null>(
    initialValue
  );

  const [_ro, setRo] = useState(initialValue.ubigeo===""?false:true);
  const [dataUbigeo, setDataUbigeo] = useState<Ubigeos[]>([]);
  const [dataDepartamento, setDataDepartamento] = useState<Departamentos[]>([]);
  const [dataProvincia, setDataProvincia] = useState<Provincias[]>([]);

  const [provincia, setProvincia] = useState<Provincias[]>([]);
  const [ubigeo, setUbigeo] = useState<Ubigeos[]>([]);

  /* const hola =dataDepartamento.find(depa=> depa.Codigo===initialValue.ubigeo.substring(0,2));
  console.log(hola); */
  const [dep, setDep] = useState<Departamentos>(depInitialValues);
/*   const [depInputValue, setDepInputValue] = useState<string>("");
  const [proInputValue, setproInputValue] = useState<string>("");
  const [ubiInputValue, setUbiInputValue] = useState<string>(""); */
  const [prov, setProv] = useState<Provincias | null>(provInitialValues);
  const [ubi, setUbi] = useState<Ubigeos | null>(ubiInitialValues);

  const handleDepartamentoChange = (
    evt: any,
    newValue: Departamentos | null
  ) => {
    evt.preventDefault();
    

    // if(initialValue.ubigeo!==""){
      setProv(null);
      setUbi(null);
      clearUbigeo();
      const newProvincias = dataProvincia.filter(
        (prov) => prov.Codigo.substring(0, 2) === newValue?.Codigo
      );
      setProvincia(newProvincias);
      setUbigeo([])
    // }else{

    // }
  };

  const handleProvinciaChange = (evt: any, newValue: Provincias | null) => {
    evt.preventDefault();
    setProv(newValue);
    setUbi(null);
    clearUbigeo();

    const newDistritos = dataUbigeo.filter(
      (ubi) => ubi.Codigo.substring(0, 4) === newValue?.Codigo
    );
    setUbigeo(newDistritos);
  };

  const handleUbigeoChange = (evt: any, newValue: Ubigeos | null) => {
    evt.preventDefault();
    setUbi(newValue);
    if (newValue) {
      setDataDireccion({ ...dataDireccion, ubigeo: newValue.Codigo });
    }
  };

  const handleOnInputChange = (
    _evt: React.ChangeEvent<{}>,
    _newValue: string,
    reason: string
  ) => {
    
    if (reason === "clear") {
      console.log('holi');
      clearUbigeo();
      setUbigeo(null)
    }
  };

  const handleOnInputChangeDep = (
    _evt: React.ChangeEvent<{}>,
    _newValue: string,
    reason: string
  ) => {
    if (reason === "clear") {
      clearUbigeo();
    } /* else {
      setDepInputValue(newValue);
    } */
  };

  const clearUbigeo = () => {
    setDataDireccion({ ...dataDireccion, ubigeo: "" });
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setDataDireccion({
      ...dataDireccion,
      [name]: value,
    });
  };

  const handleSubmit = () => {
    onChange(dataDireccion);
  };

  const handleClean = () => {
    setDataDireccion(DireccionValues);
    onChange(DireccionValues);
  };

  const handleCities = () =>{
      setRo(false)
      setDep(depInitialValues)
  }

  return (
    <>
      {!chargePage && (
        <>
          <TextField
            margin="normal"
            size="small"
            fullWidth
            name="codlocal"
            type="text"
            label="Código de Local"
            sx={{ mt: 1.5, mb: 1.5 }}
            value={dataDireccion.codLocal}
            onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
              handleChange(e)
            }
          />
          <TextField
            margin="normal"
            size="small"
            fullWidth
            name="direccion"
            type="text"
            label="Dirección"
            sx={{ mt: 1.5, mb: 1.5 }}
            value={dataDireccion.direccion}
            onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
              handleChange(e)
            }
          />
          <TextField
            margin="normal"
            size="small"
            fullWidth
            name="ruc"
            type="text"
            label="R.U.C."
            sx={{ mt: 1.5, mb: 1.5 }}
            value={dataDireccion.ruc}
            onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
              handleChange(e)
            }
          />
          <Autocomplete
            disablePortal
            id="combo-box-demo"
            fullWidth
            value={dep}
            options={dataDepartamento}
            onChange={handleDepartamentoChange}
            
            
            //inputValue={depInputValue}
            onInputChange={handleOnInputChangeDep}
            noOptionsText={"No hay datos que mostrar"}
            getOptionLabel={(departamentos) => departamentos.Departamento}
            isOptionEqualToValue={(option, value) =>
              option.Codigo === value.Codigo
            }
            renderInput={(params) => (
              <TextField {...params} label="Departamento" />
            )}
            renderOption={(props, departamentos) => (
              <Box component="li" {...props} key={departamentos.Codigo}>
                {departamentos.Departamento}
              </Box>
            )}
          />
          <Autocomplete
            disablePortal
            id="combo-box-demo"
            fullWidth
            
            value={prov || null}
            options={provincia}
            onChange={handleProvinciaChange}
            onInputChange={handleOnInputChange}
            noOptionsText={"No hay datos que mostrar"}
            getOptionLabel={(provincia) => `${provincia.Provincia}`}
            isOptionEqualToValue={(option, value) =>
              option.Codigo === value.Codigo
            }
            renderInput={(params) => (
              <TextField {...params} label="Provincia" />
            )}
            renderOption={(props, provincia) => (
              <Box component="li" {...props} key={provincia.Codigo}>
                {provincia.Provincia}
              </Box>
            )}
          />

          <Autocomplete
            disablePortal
            id="combo-box-demo"
            fullWidth
            
            options={ubigeo}
            value={ubi || ubiInitialValues}
            noOptionsText={"No hay datos que mostrar"}
            onChange={handleUbigeoChange}
            onInputChange={handleOnInputChange}
            getOptionLabel={(ubigeo) => `${ubigeo.Ubigeo}`}
            isOptionEqualToValue={(option, value) =>
              option.Codigo === value.Codigo
            }
            renderInput={(params) => <TextField {...params} label="Distrito" />}
            renderOption={(props, ubigeo) => (
              <Box component="li" {...props} key={ubigeo.Codigo}>
                {ubigeo.Ubigeo}
              </Box>
            )}
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
            // required
            value={dataDireccion.ubigeo}
            // required
            onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
              handleChange(e)
            }
          />

          <Stack direction="row" spacing={2}>
            <Button variant="outlined" color="success" onClick={handleSubmit}>
              Agregar
            </Button>

            <Button variant="outlined" color="error" onClick={handleClean}>
              Clean
            </Button>
            <Button variant="outlined" color="primary" onClick={handleCities} >GetCities</Button>
          </Stack>
        </>
      )}
    </>
  );
};

export default DireccionForm;
