import React, { useState } from "react";

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
import { useFormik } from "formik";
import { EnvioTransportista } from "../../types/guias/guiaremision.interface";
import { TransportistaSchema } from "../../utils/validateGuiaRemision";

const TransportistaValues: EnvioTransportista = {
  id: "",
  numDoc: "",
  rznSocial: "",
  tipoDoc: "6",
  nroMtc: "",
};

interface TransportistaFormProps {
  onChange: (transportista: EnvioTransportista) => void;
  initialValue?: EnvioTransportista;
}

const DatosTransportista = ({
  initialValue,
  onChange,
}: TransportistaFormProps) => {

  // console.log('initialvalues',initialValue)
  // const [dataTransportista, setDataTransportista] = useState<EnvioTransportista | null>(initialValue || TransportistaValues);

  const formik = useFormik({
    initialValues: initialValue,
    validationSchema: TransportistaSchema,
    onSubmit: (values) => {

      onChange(values)

    }

  })

  const handleClean = () => {
    // setDataTransportista(TransportistaValues);
    onChange(TransportistaValues);
    // formik.resetForm();
  };

  //const [_, setDataFoundIt] = useState<dataFound>(null);
  //const [searchValue, setSearchValue] = useState<string>("");

  const handleSearch = (data: dataFound): void => {
    //setDataFoundIt(data);
    // var razonSocial: string = "";

    // if (data.dniData && dataTransportista.tipoDoc === "1") {
    //   razonSocial =
    //     data.dniData.apellidoMaterno +
    //     " " +
    //     data.dniData.apellidoPaterno +
    //     " " +
    //     data.dniData.nombres;
    // } else if (data.rucData && dataTransportista.tipoDoc === "6") {
    //   razonSocial = data.rucData.razonSocial;
    // } else {
    //   razonSocial = "NO ENCONTRADO";
    // }
    // setDataTransportista({ ...dataTransportista, rznSocial: razonSocial });
  };
  /*  const handleSearchValue = (query: string) => {
    setDataCliente({ ...dataCliente, numDoc: query });
    //setSearchValue(query);
  }; */

  return (
    <form onSubmit={formik.handleSubmit}>
      <FormControl fullWidth size="small">
        <InputLabel id="demo-simple-select-label">Tipo de documento</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={formik.values.tipoDoc}
          label="Tipo de documento"
          onChange={formik.handleChange}
          error={formik.touched.tipoDoc && Boolean(formik.errors.tipoDoc)}
          onBlur={formik.handleBlur}
          name="tipoDoc"
        >
          <MenuItem value={"6"}>RUC</MenuItem>
        </Select>
      </FormControl>

      <TextField
        margin="normal"
        size="small"
        fullWidth
        name={'numDoc'}
        label="Número de documento"
        value={formik.values.numDoc}
        error={formik.touched?.numDoc && Boolean(formik.errors?.numDoc)}
        onBlur={formik.handleBlur}
        onChange={formik.handleChange}
        helperText={formik.touched.numDoc && formik.errors.numDoc}
      />

      <TextField
        margin="normal"
        size="small"
        fullWidth
        name="rznSocial"
        label="Razón Social"
        value={formik.values.rznSocial}
        error={formik.touched?.rznSocial && Boolean(formik.errors?.rznSocial)}
        onBlur={formik.handleBlur}
        onChange={formik.handleChange}
        helperText={formik.touched.rznSocial && formik.errors.rznSocial}
       
      />

      <TextField
        margin="normal"
        size="small"
        fullWidth
        name="nroMtc"
        label="Nro. MTC (opcional)"
        value={formik.values.nroMtc}
        error={formik.touched?.nroMtc && Boolean(formik.errors?.nroMtc)}
        onBlur={formik.handleBlur}
        onChange={formik.handleChange}
        helperText={formik.touched.nroMtc && formik.errors.nroMtc}
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
  );
};

export default DatosTransportista;
