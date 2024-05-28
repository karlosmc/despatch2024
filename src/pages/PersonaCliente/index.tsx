import {
  
  Button,
  FormControl,
  
  InputLabel,
  MenuItem,
  Select,
  
  Stack,
  TextField,
} from "@mui/material";

import { useFormik } from "formik";
import * as Yup from "yup";
import { DestinatarioSchema } from "../../utils/validateForm";
import { Client } from "../../types/guias/guiaremision.interface";


const ClientValues: Client = {
  numDoc: "",
  rznSocial: "",
  tipoDoc: "1",
};

interface ClienteFormProps {
  onChange: (cliente: Client) => void;
  initialValue: Client;
  schema?: Yup.AnyObjectSchema;
}

const Cliente = ({ initialValue, onChange, schema }: ClienteFormProps) => {

  const formik = useFormik({
    initialValues: initialValue,
    validationSchema: schema || DestinatarioSchema,
    onSubmit: (values) => {
      onChange(values);
    },
  });

  const handleClean = () => {

    onChange(ClientValues);
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
          <MenuItem selected value={"1"}>
            DNI
          </MenuItem>
          <MenuItem value={"6"}>RUC</MenuItem>
          <MenuItem value={"4"}>C.E.</MenuItem>
        </Select>
      </FormControl>

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
      <TextField
        margin="normal"
        size="small"
        multiline
        fullWidth
        name="rznSocial"
        label="Razón Social"
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
