import React, { useState } from "react";
import { Choferes } from "../../types/doc.interface";
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
import { dataFound } from "../../types/persona.interface";
import TextSearch from "../../components/TextSearch";
/* import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import { useDialog } from "../../context/dialog.context"; */

const ChoferValues: Choferes = {
  tipo: "",
  tipoDoc: "",
  apellidos: "",
  licencia: "",
  nombres: "",
  nroDoc: "",
};

interface ChoferFormProps {
  onChange: (chofer: Choferes) => void;
  initialValue: Choferes;
}

const ChoferForm = ({ onChange, initialValue }: ChoferFormProps) => {
  const [dataChofer, setDataChofer] = useState<Choferes | null>(initialValue);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setDataChofer({
      ...dataChofer,
      [name]: value,
    });
  };

  const SelectHandleChange = (event: SelectChangeEvent<unknown>) => {
    const { name, value } = event.target;
    setDataChofer({
      ...dataChofer,
      [name]: value,
    });
  };

  const handleSearch = (data: dataFound): void => {
    var apellidos: string = "";
    var nombres: string = "";

    if (data.dniData && dataChofer.tipoDoc === "1") {
      apellidos =
        data.dniData.apellidoMaterno + " " + data.dniData.apellidoPaterno;
      nombres = data.dniData.nombres;
    } else if (data.rucData && dataChofer.tipoDoc === "6") {
      apellidos = data.rucData.razonSocial;
      nombres = "";
    } else {
      apellidos = "NO ENCONTRADO";
      nombres = "";
    }
    setDataChofer({ ...dataChofer, apellidos, nombres });
  };

  const handleSubmit = () => {
    onChange(dataChofer);
  };

  const handleClean = () => {
    setDataChofer(ChoferValues);
    onChange(ChoferValues);
  };
  return (
    <>
      <FormControl fullWidth size="small">
        <InputLabel id="demo-simple-select-label">Tipo de conductor</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          //value={formik.values.tipoDoc}
          value={dataChofer.tipo}
          label="Tipo de documento"
          onChange={(e: SelectChangeEvent): void => SelectHandleChange(e)}
          //error={formik.touched.tipoDoc && Boolean(formik.errors.tipoDoc)}
          //onBlur={formik.handleBlur}
          name="tipo"
        >
          <MenuItem value={"Principal"}>Principal</MenuItem>
          <MenuItem value={"Secundario"}>Secundario</MenuItem>
        </Select>
      </FormControl>
      <FormControl fullWidth size="small">
        <InputLabel id="demo-simple-select-label">Tipo de documento</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          //value={formik.values.tipoDoc}
          value={dataChofer.tipoDoc}
          label="Tipo de documento"
          onChange={(e: SelectChangeEvent): void => SelectHandleChange(e)}
          //error={formik.touched.tipoDoc && Boolean(formik.errors.tipoDoc)}
          //onBlur={formik.handleBlur}
          name="tipoDoc"
        >
          <MenuItem value={"1"}>DNI</MenuItem>
          <MenuItem value={"6"}>RUC</MenuItem>
          <MenuItem value={"4"}>C.E.</MenuItem>
        </Select>
      </FormControl>
      <TextSearch
        onSearch={handleSearch}
        valor={dataChofer.nroDoc}
        type={dataChofer.tipoDoc === "1" ? "dni2" : "ruc"}
        onChangeValue={(e: React.ChangeEvent<HTMLInputElement>): void =>
          handleChange(e)
        }
        variant="outlined"
        size="small"
        color="success"
        fullWidth
        name="nroDoc"
        label="Número de documento"
        margin="normal"
      />

      <TextField
        margin="normal"
        size="small"
        fullWidth
        name="nombres"
        label="Nombres"
        value={dataChofer.nombres}
        onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
          handleChange(e)
        }
      />
      <TextField
        margin="normal"
        size="small"
        fullWidth
        name="apellidos"
        label="Apellidos"
        value={dataChofer.apellidos}
        onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
          handleChange(e)
        }
      />
      <TextField
        margin="normal"
        size="small"
        fullWidth
        name="licencia"
        label="Nro. Licencia"
        value={dataChofer.licencia}
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

export default ChoferForm;
