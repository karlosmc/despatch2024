
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
// import { dataFound } from "../../types/persona.interface";

/* import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import { useDialog } from "../../context/dialog.context"; */

import { useFormik } from "formik";
import { EnvioChoferes } from "../../types/guias/guiaremision.interface";
import { ChoferSchema } from "../../utils/validateGuiaRemision";
import { conductor } from "../../types/conductor.interface";
import { useEffect } from "react";

// const ChoferValues: EnvioChoferes = {
//   tipo: "",
//   tipoDoc: "",
//   apellidos: "",
//   licencia: "",
//   nombres: "",
//   nroDoc: "",
// };

interface ChoferFormProps {
  onChange: (chofer: EnvioChoferes) => void;
  conductor?:conductor 
  initialValue: EnvioChoferes;
}

const ConductorForm = ({ onChange, initialValue,conductor }: ChoferFormProps) => {
  // const [dataChofer, setDataChofer] = useState<EnvioChoferes | null>(
  //   initialValue
  // );
 
  const formik = useFormik({
    initialValues: initialValue,
    validationSchema: ChoferSchema,
    onSubmit: (_values) => {
      // onChange(values);
    },
  });

  const handleChange = () => {
    // console.log(formik.values)
    formik.handleSubmit();
    if (Object.keys(formik.errors).length > 0) {
      return;
    }
    onChange(formik.values);

    // formik.resetForm();
  };

  // const handleSearch = (data: dataFound): void => {
  //   var apellidos: string = "";
  //   var nombres: string = "";

  //   if (data.dniData && formik.values.tipoDoc === "1") {
  //     apellidos =
  //       data.dniData.apellidoMaterno + " " + data.dniData.apellidoPaterno;
  //     nombres = data.dniData.nombres;
  //   } else if (data.rucData && formik.values.tipoDoc === "6") {
  //     apellidos = data.rucData.razonSocial;
  //     nombres = "RUC";
  //   } else {
  //     apellidos = "NO ENCONTRADO";
  //     nombres = "";
  //   }
  //   setDataChofer({ ...dataChofer, apellidos, nombres });

  //   formik.setFieldValue("apellidos", apellidos);
  //   formik.setFieldValue("nombres", nombres);
  // };

  const handleClean = () => {
    formik.resetForm();
  };

  useEffect(() => {
    if(conductor){
      formik.setFieldValue('tipoDoc', conductor.tipoDoc.toUpperCase())
      formik.setFieldValue('nroDoc', conductor.nroDoc.toUpperCase())
      formik.setFieldValue('nombres', conductor.nombres.toUpperCase())
      formik.setFieldValue('apellidos', conductor.apellidos.toUpperCase())
      formik.setFieldValue('licencia', conductor.licencia.toUpperCase())
    }
  }, [conductor])
  

  return (
    <Box border={1} borderColor={'gray'} borderRadius={2} p={1}>
      <Box
        display={"grid"}
        gridTemplateColumns={{ xs: "repeat(1fr)", sm: "repeat(3,1fr)" }}
        columnGap={1}
      >
        <FormControl fullWidth size="small" margin="normal">
          <InputLabel id="demo-simple-select-label">
            Tipo de conductor
          </InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={formik.values.tipo}
            label="Tipo de documento"
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
          <InputLabel id="demo-simple-select-label">
            Tipo de documento
          </InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={formik.values.tipoDoc}
            label="Tipo de documento"
            error={formik.touched.tipoDoc && Boolean(formik.errors.tipoDoc)}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            name="tipoDoc"
            readOnly={true}
          >
            <MenuItem value={"1"}>DNI</MenuItem>
            <MenuItem value={"6"}>RUC</MenuItem>
            <MenuItem value={"4"}>C.E.</MenuItem>
          </Select>
        </FormControl>
        {/* <Stack direction="row" justifyItems="center" alignItems="baseline" spacing={2}> */}
        <TextField
          margin="normal"
          size="small"
          fullWidth
          name="nroDoc"
          label="Nro. de documento"
          value={formik.values.nroDoc}
          error={formik.touched.nroDoc && Boolean(formik.errors.nroDoc)}
          helperText={formik.touched.nroDoc && formik.errors.nroDoc}
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          InputProps={{ readOnly: true}}
        />
        {/* <ButtonSearch type={formik.values.tipoDoc} valor={formik.values.nroDoc} onSearch={handleSearch}/> */}
        {/* </Stack> */}

        <TextField
          margin="normal"
          size="small"
          fullWidth
          name="nombres"
          label="Nombres"
          value={formik.values.nombres.toUpperCase()}
          onChange={formik.handleChange}
          error={formik.touched.nombres && Boolean(formik.errors.nombres)}
          helperText={formik.touched.nombres && formik.errors.nombres}
          onBlur={formik.handleBlur}
          inputProps={{ style: { textTransform: "uppercase" } }}
          InputProps={{ readOnly: true}}
        />
        <TextField
          margin="normal"
          size="small"
          fullWidth
          name="apellidos"
          label="Apellidos"
          value={formik.values.apellidos.toUpperCase()}
          onChange={formik.handleChange}
          error={formik.touched.apellidos && Boolean(formik.errors.apellidos)}
          helperText={formik.touched.apellidos && formik.errors.apellidos}
          onBlur={formik.handleBlur}
          inputProps={{ style: { textTransform: "uppercase" } }}
          InputProps={{ readOnly: true}}
        />
        <TextField
          margin="normal"
          size="small"
          fullWidth
          name="licencia"
          label="Nro. Licencia"
          value={formik.values.licencia.toUpperCase()}
          onChange={formik.handleChange}
          error={formik.touched.licencia && Boolean(formik.errors.licencia)}
          helperText={formik.touched.licencia && formik.errors.licencia}
          onBlur={formik.handleBlur}
          inputProps={{ style: { textTransform: "uppercase" } }}
          InputProps={{ readOnly: true}}
        />
      </Box>
      <Stack direction="row" spacing={2} sx={{my:1}}>
        <Button
          fullWidth
          variant="contained"
          size="small"
          color="success"
          type="button"
          onClick={handleChange}
        >
          Agregar a lista
        </Button>
        <Button
          fullWidth
          variant="outlined"
          size="small"
          color="secondary"
          onClick={handleClean}
        >
          Limpiar formulario
        </Button>
      </Stack>
    </Box>   
  );
};

export default ConductorForm;
