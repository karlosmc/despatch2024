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

import { useFormik } from "formik";
import * as Yup from 'yup';
import { ChoferSchema } from "../../utils/validateForm";
import ButtonSearch from "../../components/ButtonSearch";

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

  const formik = useFormik({
    initialValues: initialValue,
    validationSchema: ChoferSchema,
    onSubmit: (values) => {
      onChange(values);
    },
  });

  // const handleChange = (
  //   event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  // ) => {
  //   const { name, value } = event.target;
  //   setDataChofer({
  //     ...dataChofer,
  //     [name]: value,
  //   });
  // };

  // const SelectHandleChange = (event: SelectChangeEvent<unknown>) => {
  //   const { name, value } = event.target;
  //   setDataChofer({
  //     ...dataChofer,
  //     [name]: value,
  //   });
  // };

  const handleSearch = (data: dataFound): void => {
    var apellidos: string = "";
    var nombres: string = "";

    if (data.dniData && formik.values.tipoDoc === "1") {
      apellidos =
        data.dniData.apellidoMaterno + " " + data.dniData.apellidoPaterno;
      nombres = data.dniData.nombres;
    } else if (data.rucData && formik.values.tipoDoc === "6") {
      apellidos = data.rucData.razonSocial;
      nombres = "RUC";
    } else {
      apellidos = "NO ENCONTRADO";
      nombres = "";
    }
    setDataChofer({ ...dataChofer, apellidos, nombres });

    formik.setFieldValue('apellidos',apellidos)
    formik.setFieldValue('nombres',nombres)
    
  };

  // const handleSubmit = () => {
  //   onChange(dataChofer);
  // };

  const handleClean = () => {
    setDataChofer(ChoferValues);
    onChange(ChoferValues);
  };
  return (
    <form onSubmit={formik.handleSubmit}>
      <FormControl fullWidth size="small" margin="normal">
        <InputLabel id="demo-simple-select-label">Tipo de conductor</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          
          id="demo-simple-select"
          //value={formik.values.tipoDoc}
          value={formik.values.tipo}
          label="Tipo de documento"
          // onChange={(e: SelectChangeEvent): void => SelectHandleChange(e)}
          error={formik.touched.tipo && Boolean(formik.errors.tipo)}
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          name="tipo"
        >
          <MenuItem value={"Principal"}>Principal</MenuItem>
          <MenuItem value={"Secundario"}>Secundario</MenuItem>
        </Select>
      </FormControl>
      <FormControl fullWidth size="small" margin="normal">
        <InputLabel id="demo-simple-select-label">Tipo de documento</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={formik.values.tipoDoc}
          // value={dataChofer.tipoDoc}
          label="Tipo de documento"
          // onChange={(e: SelectChangeEvent): void => SelectHandleChange(e)}
          error={formik.touched.tipoDoc && Boolean(formik.errors.tipoDoc)}
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          name="tipoDoc"
        >
          <MenuItem value={"1"}>DNI</MenuItem>
          <MenuItem value={"6"}>RUC</MenuItem>
          <MenuItem value={"4"}>C.E.</MenuItem>
        </Select>
      </FormControl>
      <Stack direction="row" justifyItems="center" alignItems="baseline" spacing={2}>
        <TextField
         margin="normal"
         size="small"
         fullWidth
         name="nroDoc"
         label="Número de documento"
         value={formik.values.nroDoc}
         error={formik.touched.nroDoc && Boolean(formik.errors.nroDoc)}
         onBlur={formik.handleBlur}
         onChange={formik.handleChange}
        />
       <ButtonSearch type={formik.values.tipoDoc} valor={formik.values.nroDoc} onSearch={handleSearch}/>
      </Stack>

      <TextField
        margin="normal"
        size="small"
        fullWidth
        name="nombres"
        label="Nombres"
        value={formik.values.nombres}
        onChange={formik.handleChange}
        error={formik.touched.nombres && Boolean(formik.errors.nombres)}
        onBlur={formik.handleBlur}
        // onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
        //   handleChange(e)
        // }
      />
      <TextField
        margin="normal"
        size="small"
        fullWidth
        name="apellidos"
        label="Apellidos"
        value={formik.values.apellidos}
        onChange={formik.handleChange}
        error={formik.touched.apellidos && Boolean(formik.errors.apellidos)}
        onBlur={formik.handleBlur}
        // onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
        //   handleChange(e)
        // }
      />
      <TextField
        margin="normal"
        size="small"
        fullWidth
        name="licencia"
        label="Nro. Licencia"
        value={formik.values.licencia}
        onChange={formik.handleChange}
        error={formik.touched.licencia && Boolean(formik.errors.licencia)}
        onBlur={formik.handleBlur}
        
        // onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
        //   handleChange(e)
        // }
      />
      <Stack direction="row" spacing={2}>
        <Button variant="outlined" color="success" 
        // onClick={handleSubmit}
        type="submit"
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

export default ChoferForm;
