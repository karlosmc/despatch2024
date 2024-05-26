import React, { useState, useEffect } from "react";
import { Direccion } from "../../types/doc.interface";
import { Autocomplete, Box, Button, Stack, TextField } from "@mui/material";
import { Departamentos, Provincias, Ubigeos } from "../../types/ubigeo";

const DireccionValues: Direccion = {
  codlocal: "",
  direccion: "",
  ruc: "",
  ubigeo: "",
};

const depInitialValues: Departamentos = {
  Id: 0,
  Codigo: "",
  Departamento: "",
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
    fetch("src/files/ubigeo.json")
      .then((res) => res.json())
      .then((res) => setDataUbigeo(res));

    fetch("src/files/Departamentos.json")
      .then((res) => res.json())
      .then((res) => setDataDepartamento(res));
    fetch("src/files/Provincias.json")
      .then((res) => res.json())
      .then((res) => setDataProvincia(res));
  }, []);

  useEffect(() => {
    /*  if(initialValue.ubigeo!==''){
            setDep(dataDepartamento.find(depa =>depa.Codigo===initialValue.ubigeo.substring(0,2)))
        } */
  }, []);

  const [dataDireccion, setDataDireccion] = useState<Direccion | null>(
    initialValue
  );

  const [dataUbigeo, setDataUbigeo] = useState<Ubigeos[]>([]);
  const [dataDepartamento, setDataDepartamento] = useState<Departamentos[]>([]);
  const [dataProvincia, setDataProvincia] = useState<Provincias[]>([]);

  const [provincia, setProvincia] = useState<Provincias[]>([]);
  const [ubigeo, setUbigeo] = useState<Ubigeos[]>([]);

  /* const hola =dataDepartamento.find(depa=> depa.Codigo===initialValue.ubigeo.substring(0,2));
  console.log(hola); */
  const [dep, setDep] = useState<Departamentos>(depInitialValues);
  const [depInputValue, setDepInputValue] = useState<string>("");
  const [proInputValue, setproInputValue] = useState<string>("");
  const [ubiInputValue, setUbiInputValue] = useState<string>("");
  const [prov, setProv] = useState<Provincias | null>(provInitialValues);
  const [ubi, setUbi] = useState<Ubigeos | null>(ubiInitialValues);

  const handleDepartamentoChange = (
    evt: any,
    newValue: Departamentos | null
  ) => {
    evt.preventDefault();
    setDep(newValue);
    setProv(null);
    setUbi(null);
    clearUbigeo();

    const newProvincias = dataProvincia.filter(
      (prov) => prov.Codigo.substring(0, 2) === newValue?.Codigo
    );
    setProvincia(newProvincias);
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
      clearUbigeo();
    }
  };

  const handleOnInputChangeDep = (
    _evt: React.ChangeEvent<{}>,
    newValue: string,
    reason: string
  ) => {
    if (reason === "clear") {
      clearUbigeo();
    } else {
      setDepInputValue(newValue);
    }
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
            value={dataDireccion.codlocal}
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
            //value={dep}
            value={dataDepartamento.find(depa => depa.Codigo===initialValue.ubigeo.substring(0,2))}
            options={dataDepartamento}
            onChange={handleDepartamentoChange}
            inputValue={depInputValue}
            onInputChange={handleOnInputChangeDep}
            noOptionsText={"No hay datos que mostrar"}
            getOptionLabel={(departamentos) => departamentos.Departamento}
            isOptionEqualToValue={(option) => option === option}
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
            value={prov}
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
            value={ubi}
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
          </Stack>
        </>
      )}
    </>
  );
};

export default DireccionForm;
