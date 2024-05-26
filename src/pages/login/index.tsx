import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PasswordIcon from "@mui/icons-material/Password";
import KeyIcon from "@mui/icons-material/Key";


import {
  Container,
  Paper,
  Alert,
  Grid,
  TextField,
  InputAdornment,
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { useEffect, useState } from "react";

import LogoCente from "../../assets/img/elcentenario.png";
import { useFormik } from "formik";
import { Login } from "../../types/login.interface";
import { LoginSchema } from "../../utils/validateForm";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useTokenSunat } from "../../context/token.context";
// import CryptoJS from 'crypto-js';



const button = {
  backgroundColor: "#F32323",
  "&:hover": {
    backgroundColor: "#F38223",
  },
};

const InitialValues: Login = {
  nrodoc: "",
  password: "",
  empresa:"",
  vehiculo:"",
};

const LoginForm = () => {
  

  

  const API_GUIAS = import.meta.env.VITE_API_URL_GUIAS
  
  
  let location = useLocation();
  let navigate = useNavigate();

  const mensaje = location.state ? location.state.message : "";

  const [listVehicles, setListVehicles] = useState<[]>([]);

  const [message, setMessage] = useState(mensaje);

  const { fetchGetToken } = useTokenSunat();
  // console.log(token);

  const formik = useFormik({
    initialValues: InitialValues,
    validationSchema: LoginSchema,
    onSubmit: (values) => {
      LogInUser(values);
    },
  });

  const LogInUser = ({ nrodoc, password,empresa,vehiculo }: Login) => {
    const Url = `${API_GUIAS}Login`;
    const dato = { nrodoc, password,empresa,vehiculo };
  
    //console.log(dato);
    const requestapi = {
      method: "POST",
      header: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dato),
    };
    fetch(Url, requestapi)
      .then((response) => {
        // console.log(response);
        if (response.ok) {
          // console.log(response);
          return response.json();
        } else {
          throw new Error("Login inválido...");
        }
      })
      .then((response) => {
        // console.log(response);
        if (response.status) {
          // console.log(response);
          // console.log(response.user);
          const userFull = {...response.user,vehiculo}
          // console.log(userFull);
          localStorage.setItem("userlogin", JSON.stringify(userFull));

          // localStorage.setItem("userHashed", JSON.stringify(response.user));

          // const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(response.user), 'SECRET_2023CENTE').toString();
          // localStorage.setItem('userHashed', ciphertext);

          fetchGetToken(parseInt(empresa))
          // .then(res =>{
          //   localStorage.setItem("user", JSON.stringify(response.user));
          // })
          // .then(res => {
          //     // console.log(res);
          //   localStorage.setItem("token", JSON.stringify(res));
          // })
          // localStorage.setItem("token", response.usuario.alias);
          // localStorage.setItem("estacion", estacion);
          // history.push("/admin");
          navigate("despatch");
        } else {
          setMessage(response.message);
        }
      })
      .catch((e) => console.log(e));
  };

  const getVehiclesByCompany=async (company: string)=>{

    const url = `${API_GUIAS}vehicles/${parseInt(company)}`;
    // console.log(url);

    const response =  await fetch(url);

    const json = await response.json();
    
    setListVehicles(json.response);

  }


  useEffect(()=>{
    if(formik.values.empresa!==''){
      getVehiclesByCompany(formik.values.empresa);
    }

  },[formik.values.empresa])

 
  // const classes = useStyles();
  return (
    <Container style={{ marginTop: "3rem" }} maxWidth="xs">
      <Paper className="login-background" variant="elevation" elevation={2}>
        <div style={{ marginBottom: "2rem", width: "100%" }}>
          {message !== "" ? <Alert severity="error">{message}</Alert> : ""}
        </div>

        <Grid container spacing={1} justifyContent="center">
          <img
            style={{ maxWidth: "350px" }}
            src={LogoCente}
            alt="logocente"
          ></img>
        </Grid>

        <form onSubmit={formik.handleSubmit}>
          <Grid
            container
            style={{ marginTop: "3rem" }}
            spacing={1}
            alignItems="flex-end"
          >
            <TextField
              label="Usuario"
              value={formik.values.nrodoc}
              // onChange={handleUserChange}

              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              helperText={formik.touched.nrodoc && formik.errors.nrodoc}
              error={formik.touched.nrodoc && Boolean(formik.errors.nrodoc)}
              name="nrodoc"
              fullWidth
              required
              autoComplete="off"
              placeholder="Introduzca su Usuario/Nro. Documento"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountCircleIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid
            container
            style={{ marginTop: "1rem" }}
            spacing={1}
            alignItems="flex-end"
          >
            <TextField
              label="Contraseña"
              type="password"
              value={formik.values.password}
              // onChange={handlePasswordChange}

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
          </Grid>
          <Grid
            container
            style={{ marginTop: "1rem" }}
            spacing={1}
            alignItems="flex-end"
          >
            <FormControl style={{ minWidth: "100%" }}>
              <InputLabel id="">Empresa</InputLabel>
              <Select
                labelId="idEstacion"
                id="idEstacion"
                name="empresa"
                value={formik.values.empresa}
                onBlur={formik.handleBlur}
                error={formik.touched.empresa && Boolean(formik.errors.empresa)}
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
          </Grid>
          <Grid
            container
            style={{ marginTop: "1rem" }}
            spacing={1}
            alignItems="flex-end"
          >
            <FormControl style={{ minWidth: "100%" }}>
              <InputLabel id="">Vehiculo</InputLabel>
              <Select
                labelId=""
                id=""
                name="vehiculo"
                value={formik.values.vehiculo}
                onBlur={formik.handleBlur}
                error={formik.touched.vehiculo && Boolean(formik.errors.vehiculo)}
                onChange={formik.handleChange}
                // onChange={handleSelectChange}
                // required
              >
                {
                  listVehicles.map((vehiculo:any) => (
                    <MenuItem key={vehiculo.placa} value={vehiculo.placa}>{vehiculo.placa}</MenuItem>
                  ))
                }
              
              </Select>
              <FormHelperText>
                Seleccione el vehiculo de la empresa seleccionada
              </FormHelperText>
            </FormControl>
          </Grid>
          <Grid container spacing={1}>
            <Button
              variant="contained"
              color="error"
              sx={button}
              endIcon={<KeyIcon>login</KeyIcon>}
              style={{ width: "100%", marginTop: "2rem" }}
              type="submit"
              // onClick={Log_in}
            >
              Acceder
            </Button>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default LoginForm;
