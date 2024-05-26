import React, { useState } from "react";
import { Client } from "../../types/doc.interface";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
} from "@mui/material";
import TextSearch from "../../components/TextSearch";
import { dataFound } from "../../types/persona.interface";
import { useFormik} from "formik";
import { DestinatarioSchema } from "../../utils/validateForm";
import VehiculoForm from "../vehiculo";
import SearchIcon from '@mui/icons-material/Search';
import ButtonSearch from "../../components/ButtonSearch";
import * as Yup from 'yup';

const ClientValues: Client = {
  numDoc: "",
  rznSocial: "",
  tipoDoc: "1",
};

interface ClienteFormProps {
  onChange: (cliente: Client) => void;
  initialValue: Client;
  schema?: Yup.AnyObjectSchema
}

const Cliente = ({ initialValue, onChange, schema }: ClienteFormProps) => {
  const [dataCliente, setDataCliente] = useState<Client | null>(initialValue);
  
  const formik = useFormik({
    initialValues: initialValue,
    validationSchema: schema || DestinatarioSchema,
    onSubmit: (values) => {
      onChange(values);
    },
  });

  
  

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setDataCliente({
      ...dataCliente,
      [name]: value,
    });
  };

  const SelectHandleChange = (event: SelectChangeEvent<unknown>) => {
    const { name, value } = event.target;
    setDataCliente({
      ...dataCliente,
      [name]: value,
    });
  };

  const handleSubmit = (values) => {
    console.log(values);
    onChange(dataCliente);
  };

  const handleClean = () => {
    setDataCliente(ClientValues);
    onChange(ClientValues);
  };

  const handleSearch = (data: dataFound): void => {
    //setDataFoundIt(data);
    
    var razonSocial: string = "";

    console.log(data);
    if (data.dniData && formik.values.tipoDoc === "1") {
      razonSocial =
        data.dniData.apellidoMaterno +
        " " +
        data.dniData.apellidoPaterno +
        " " +
        data.dniData.nombres;
    } else if (data.rucData && formik.values.tipoDoc === "6") {
      razonSocial = data.rucData.razonSocial;
    } else {
      razonSocial = "NO ENCONTRADO";
    }
    //setDataCliente({ ...dataCliente, rznSocial: razonSocial });
    formik.setFieldValue('rznSocial',razonSocial)
  };

  return (
    <form onSubmit={formik.handleSubmit}>
      <FormControl fullWidth size="small">
        <InputLabel id="demo-simple-select-label">Tipo de documento</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={formik.values.tipoDoc}
          // value={dataCliente.tipoDoc}
          label="Tipo de documento"
          // onChange={(e: SelectChangeEvent): void => SelectHandleChange(e)}
          error={formik.touched.tipoDoc && Boolean(formik.errors.tipoDoc)}
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          
          name="tipoDoc"
        >
          <MenuItem  selected value={"1"}>DNI</MenuItem>
          <MenuItem value={"6"}>RUC</MenuItem>
          <MenuItem value={"4"}>C.E.</MenuItem>
        </Select>
      </FormControl>

      <Stack direction="row" justifyItems="center" alignItems="baseline" spacing={2}>
        <TextField
         margin="normal"
         size="small"
         fullWidth
         name="numDoc"
         label="Número de documento"
         value={formik.values.numDoc}
         error={formik.touched.numDoc && Boolean(formik.errors.numDoc)}
         onBlur={formik.handleBlur}
         onChange={formik.handleChange}
         helperText={formik.touched.numDoc && formik.errors.numDoc}
        />
       <ButtonSearch type={formik.values.tipoDoc} valor={formik.values.numDoc} onSearch={handleSearch}/>
      </Stack>
      <TextField
        margin="normal"
        size="small"
        fullWidth
        name="rznSocial"
        label="Razón Social"
        /* value={dataCliente.rznSocial}
        onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
          handleChange(e)
        } */
        value={formik.values.rznSocial}
        error={formik.touched.rznSocial && Boolean(formik.errors.rznSocial)}
        helperText={formik.touched.rznSocial && formik.errors.rznSocial}
        onBlur={formik.handleBlur}
        onChange={formik.handleChange}
      />

      <Stack direction="row" spacing={2}>
        <Button
          variant="outlined"
          color="success"
          type="submit"
          //onClick={handleSubmit}
        >
          Agregar
        </Button>

        <Button variant="outlined" color="error" onClick={handleClean}>
          Clean
        </Button>
      </Stack>
    </form>
  );
};

export default Cliente;
