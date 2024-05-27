
import {

  FormControl,

  InputLabel,
  MenuItem,
  Select,

  TextField,
  Typography,
} from "@mui/material";


import { DatosPersonas, Guia, Persona } from "../../types/guias/guias.interface";
import { FormikProps, FormikValues } from "formik";
import { CloseFullscreen } from "@mui/icons-material";


// const PersonaValues: Persona = {
//   numDoc: "",
//   rznSocial: "",
//   tipoDoc: "1",
//   direccion: "",
//   ubigeo: "",
// };

interface PersonaFormProps {
  // onChange: (cliente: Client) => void;
  // initialValue: Client;
  // schema?: Yup.AnyObjectSchema;
  formik: FormikProps<Guia>,
  title: string,
  fieldPrefix:  keyof DatosPersonas;
  // persona: Persona
}

const PersonaForm = ({ title, formik,  fieldPrefix }: PersonaFormProps) => {



  // console.log(formik)
  // const [dataCliente, setDataCliente] = useState<Client | null>(initialValue);

  // console.log(persona)


  // const handleClean = () => {
  //   setDataCliente(ClientValues);
  //   onChange(ClientValues);
  // };

  return (
    <>
            <Typography my={3}>{title}</Typography>

            <FormControl fullWidth size="small">
              <InputLabel id="demo-simple-select-label">Tipo de documento</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={formik.values[fieldPrefix].tipoDoc}
                // value={dataCliente.tipoDoc}
                label="Tipo de documento"
                // onChange={(e: SelectChangeEvent): void => SelectHandleChange(e)}
                error={formik.touched[fieldPrefix]?.tipoDoc && Boolean(formik.errors[fieldPrefix]?.tipoDoc)}
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                name={`${fieldPrefix}.tipoDoc`}
              >
                <MenuItem selected value={"1"}>DNI</MenuItem>
                <MenuItem value={"6"}>RUC</MenuItem>
                <MenuItem value={"4"}>C.E.</MenuItem>
              </Select>
            </FormControl>
            <TextField
              margin="normal"
              size="small"
              fullWidth
              name={`${fieldPrefix}.numDoc`}
              label="Número de documento"
              value={formik.values[fieldPrefix].numDoc}
              error={formik.touched[fieldPrefix]?.numDoc && Boolean(formik.errors[fieldPrefix]?.numDoc)}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
            // helperText={formik.touched.numDoc && formik.errors.numDoc}
            />

            <TextField
              margin="normal"
              size="small"
              multiline
              fullWidth
              name={`${fieldPrefix}.rznSocial`}
              label="Razón Social"
              value={formik.values[fieldPrefix].rznSocial}
              error={formik.touched[fieldPrefix]?.rznSocial && Boolean(formik.errors[fieldPrefix]?.rznSocial)}
              // helperText={formik.touched.rznSocial && formik.errors.rznSocial}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
            />

    </>
    )
  }

export default PersonaForm;


// return (
//   <>
//     <Typography my={3}>{title}</Typography>
//     {
//       personas.map((persona, index) => (
//         <>
//           <FormControl fullWidth size="small">
//             <InputLabel id="demo-simple-select-label">Tipo de documento</InputLabel>
//             <Select
//               labelId="demo-simple-select-label"
//               id="demo-simple-select"
//               value={persona.tipoDoc}
//               // value={dataCliente.tipoDoc}
//               label="Tipo de documento"
//               // onChange={(e: SelectChangeEvent): void => SelectHandleChange(e)}
//               error={formik.touched[fieldPrefix]?.[index]?.tipoDoc && Boolean(formik.errors[fieldPrefix]?.[index]?.tipoDoc)}
//               onBlur={formik.handleBlur}
//               onChange={formik.handleChange}
//               name={`${fieldPrefix}[${index}].tipoDoc`}
//             >
//               <MenuItem selected value={"1"}>DNI</MenuItem>
//               <MenuItem value={"6"}>RUC</MenuItem>
//               <MenuItem value={"4"}>C.E.</MenuItem>
//             </Select>
//           </FormControl>
//           <TextField
//             margin="normal"
//             size="small"
//             fullWidth
//             name={`${fieldPrefix}[${index}].numDoc`}
//             label="Número de documento"
//             value={persona.numDoc}
//             error={formik.touched[fieldPrefix]?.[index]?.numDoc && Boolean(formik.errors[fieldPrefix]?.[index]?.numDoc)}
//             onBlur={formik.handleBlur}
//             onChange={formik.handleChange}
//           // helperText={formik.touched.numDoc && formik.errors.numDoc}
//           />

//           <TextField
//             margin="normal"
//             size="small"
//             multiline
//             fullWidth
//             name={`${fieldPrefix}[${index}].rznSocial`}
//             label="Razón Social"
//             value={persona.rznSocial}
//             error={formik.touched[fieldPrefix]?.[index]?.rznSocial && Boolean(formik.errors[fieldPrefix]?.[index]?.rznSocial)}
//             // helperText={formik.touched.rznSocial && formik.errors.rznSocial}
//             onBlur={formik.handleBlur}
//             onChange={formik.handleChange}
//           />
//         </>
//       ))
//     }
//   </>
// );