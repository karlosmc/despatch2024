import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PasswordIcon from "@mui/icons-material/Password";
import KeyIcon from "@mui/icons-material/Key";


import {
  
  Grid,
  TextField,
  InputAdornment,
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Box,
  Typography,
} from "@mui/material";


import { useFormik } from "formik";
import {  RegisterSchema } from "../utils/validateForm";
import { User } from "../types/user.interface";
import { useAuth } from "../hooks/useAuth";
import { useState } from "react";
import { Link } from "react-router-dom";

// import CryptoJS from 'crypto-js';



const button = {
  backgroundColor: "#F32323",
  "&:hover": {
    backgroundColor: "#F38223",
  },
};

const InitialValues: User = {
  documento: "",
  password: "",
  id_empresa: 1,
  email: "",
  name: "",
};

const RegisterForm = () => {



  // const [message, setMessage] = useState(mensaje);


  const { registro } = useAuth({ middleware: 'guest', url: '/' });

  const [errores, setErrores] = useState([]);

  // console.log(errores);

  const formik = useFormik({
    initialValues: InitialValues,
    validationSchema: RegisterSchema,
    onSubmit: (values) => {
      // LogInUser(values);

      const datos: User = {
        documento: values.documento,
        email: values.email,
        id_empresa: values.id_empresa,
        password: values.password,
        name: values.name,
      }

      registro({ datos, setErrores })
    },
  });

  
  // const classes = useStyles();
  return (

    <Grid item md={6} xs={12}>
      <Typography variant='h4'>
        Registro
      </Typography>
      <Box flexDirection={"column"} gap={1} display='flex' justifyContent={"space-between"} component='form' onSubmit={formik.handleSubmit}>
        <TextField
          label="Nro. Documento"
          value={formik.values.documento}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          helperText={formik.touched.documento && formik.errors.documento}
          error={formik.touched.documento && Boolean(formik.errors.documento)}
          name="documento"
          fullWidth
          required
          autoComplete="off"
          placeholder="Introduzca su Nro. Documento"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AccountCircleIcon />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          label="Nombre de Usuario"
          value={formik.values.name}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          helperText={formik.touched.name && formik.errors.name}
          error={formik.touched.name && Boolean(formik.errors.name)}
          name="name"
          fullWidth
          required
          autoComplete="off"
          placeholder="Introduzca su nombre de Usuario"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AccountCircleIcon />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label="Email"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          helperText={formik.touched.email && formik.errors.email}
          error={formik.touched.email && Boolean(formik.errors.email)}
          name="email"
          fullWidth
          required
          autoComplete="off"
          placeholder="Introduzca su Email"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AccountCircleIcon />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          label="Contraseña"
          type="password"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          helperText={formik.touched.password && formik.errors.password}
          error={formik.touched.password && Boolean(formik.errors.password)}
          fullWidth
          required
          name="password"
          autoComplete="off"
          placeholder="Introduzca su Contraseña"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PasswordIcon />
              </InputAdornment>
            ),
          }}
        />

        <FormControl style={{ minWidth: "100%" }}>
          <InputLabel id="">Empresa</InputLabel>
          <Select
            labelId="idEstacion"
            id="idEstacion"
            name="id_empresa"
            value={formik.values.id_empresa}
            onBlur={formik.handleBlur}
            error={formik.touched.id_empresa && Boolean(formik.errors.id_empresa)}
            onChange={formik.handleChange}
            // onChange={handleSelectChange}
            required
          >
            <MenuItem value={""}>Seleccione la empresa</MenuItem>
            <MenuItem value={"1"}>Agropecuaria e Industrias Fafio S.A.</MenuItem>
            <MenuItem value={"2"}>Estación de energías el centenario S.A.C.</MenuItem>
          </Select>
          <FormHelperText>
            Seleccione la empresa dónde labora
          </FormHelperText>
        </FormControl>

        <Button
          variant="contained"
          color="error"
          sx={button}
          endIcon={<KeyIcon>login</KeyIcon>}
          style={{ width: "100%" }}
          type="submit"
        // onClick={Log_in}
        >
          Registrarse
        </Button>
      </Box>
      <Box component={'div'} textAlign={'left'} mt={2} fontSize={12}>
          <Link style={{color:'white'}} to="/auth/login">
            Ya tienes una cuenta? Ingresa aquí
          </Link>
      </Box>
    </Grid>
    
  );
};

export default RegisterForm;
