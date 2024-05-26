import React, { useState } from "react";
import { Transportista } from "../../types/doc.interface";
import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
} from "@mui/material";
import TextSearch from "../../components/TextSearch";
import { dataFound } from "../../types/persona.interface";

const TransportistaValues: Transportista = {
  id: "",
  numDoc: "",
  rznSocial: "",
  tipoDoc: "1",
  nroMtc: "",
};

interface TransportistaFormProps {
  onChange: (transportista: Transportista) => void;
  initialValue?: Transportista;
}

const TransportistaForm = ({
  initialValue,
  onChange,
}: TransportistaFormProps) => {
  const [dataTransportista, setDataTransportista] =
    useState<Transportista | null>(initialValue || TransportistaValues);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setDataTransportista({
      ...dataTransportista,
      [name]: value,
    });
  };

  const SelectHandleChange = (event: SelectChangeEvent<unknown>) => {
    const { name, value } = event.target;
    setDataTransportista({
      ...dataTransportista,
      [name]: value,
    });
  };

  const handleSubmit = () => {
    onChange(dataTransportista);
  };

  const handleClean = () => {
    setDataTransportista(TransportistaValues);
    onChange(TransportistaValues);
  };

  //const [_, setDataFoundIt] = useState<dataFound>(null);
  //const [searchValue, setSearchValue] = useState<string>("");

  const handleSearch = (data: dataFound): void => {
    //setDataFoundIt(data);
    var razonSocial: string = "";

    if (data.dniData && dataTransportista.tipoDoc === "1") {
      razonSocial =
        data.dniData.apellidoMaterno +
        " " +
        data.dniData.apellidoPaterno +
        " " +
        data.dniData.nombres;
    } else if (data.rucData && dataTransportista.tipoDoc === "6") {
      razonSocial = data.rucData.razonSocial;
    } else {
      razonSocial = "NO ENCONTRADO";
    }
    setDataTransportista({ ...dataTransportista, rznSocial: razonSocial });
  };
  /*  const handleSearchValue = (query: string) => {
    setDataCliente({ ...dataCliente, numDoc: query });
    //setSearchValue(query);
  }; */

  return (
    <>
      <FormControl fullWidth size="small">
        <InputLabel id="demo-simple-select-label">Tipo de documento</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          //value={formik.values.tipoDoc}
          value={dataTransportista.tipoDoc}
          label="Tipo de documento"
          onChange={(e: SelectChangeEvent): void => SelectHandleChange(e)}
          //error={formik.touched.tipoDoc && Boolean(formik.errors.tipoDoc)}
          //onBlur={formik.handleBlur}
          name="tipoDoc"
        >
          <MenuItem value={""}>...</MenuItem>
          <MenuItem value={"1"}>DNI</MenuItem>
          <MenuItem value={"6"}>RUC</MenuItem>
          <MenuItem value={"4"}>C.E.</MenuItem>
        </Select>
      </FormControl>
      <TextSearch
        onSearch={handleSearch}
        valor={dataTransportista.numDoc}
        type={dataTransportista.tipoDoc === "1" ? "dni2" : "ruc"}
        onChangeValue={(e: React.ChangeEvent<HTMLInputElement>): void =>
          handleChange(e)
        }
        variant="outlined"
        size="small"
        color="success"
        fullWidth
        name="numDoc"
        label="Número de documento"
        margin="normal"
      />

      <TextField
        margin="normal"
        size="small"
        fullWidth
        name="rznSocial"
        label="Razón Social"
        value={dataTransportista.rznSocial}
        onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
          handleChange(e)
        }
      />

      <TextField
        margin="normal"
        size="small"
        fullWidth
        name="nroMtc"
        label="Nro. MTC"
        value={dataTransportista.nroMtc}
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
  );
};

export default TransportistaForm;
