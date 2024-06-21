import  { useEffect } from "react";
import { Puerto } from "../../types/doc.interface";
import {
  FormControl,
  InputLabel,
  Select,
  
  MenuItem,
} from "@mui/material";

import { useFormik } from "formik";

import * as Yup from 'yup';
import { PuertoSchema } from "../../utils/validateForm";

const Ports = [
  {
    codigo: "",
    nombre: "No seleccionado",
    opcion: "P",
  },
  {
    codigo: "",
    nombre: "No seleccionado",
    opcion: "A",
  },

  {
    codigo: "PUB",
    nombre: "BAYOVAR",
    opcion: "P",
  },
  {
    codigo: "CLL",
    nombre: "CALLAO",
    opcion: "P",
  },
  {
    codigo: "CON",
    nombre: "CONCHAN",
    opcion: "P",
  },
  {
    codigo: "CHY",
    nombre: "CHANCAY",
    opcion: "P",
  },
  {
    codigo: "CHM",
    nombre: "CHIMBOTE",
    opcion: "P",
  },
  {
    codigo: "EEN",
    nombre: "ETEN",
    opcion: "P",
  },
  {
    codigo: "HCO",
    nombre: "HUACHO",
    opcion: "P",
  },
  {
    codigo: "HUY",
    nombre: "HUARMEY",
    opcion: "P",
  },
  {
    codigo: "ILQ",
    nombre: "ILO",
    opcion: "P",
  },
  {
    codigo: "IQT",
    nombre: "IQUITOS",
    opcion: "P",
  },
  {
    codigo: "MRI",
    nombre: "MATARANI",
    opcion: "P",
  },
  {
    codigo: "PAI",
    nombre: "PAITA",
    opcion: "P",
  },
  {
    codigo: "PIO",
    nombre: "PISCO",
    opcion: "P",
  },
  {
    codigo: "PCL",
    nombre: "PUCALLPA",
    opcion: "P",
  },
  {
    codigo: "PUN",
    nombre: "PUNO",
    opcion: "P",
  },
  {
    codigo: "SVY",
    nombre: "SALAVERRY",
    opcion: "P",
  },
  {
    codigo: "SNX",
    nombre: "SAN NICOLAS",
    opcion: "P",
  },
  {
    codigo: "SUP",
    nombre: "SUPE",
    opcion: "P",
  },
  {
    codigo: "TYL",
    nombre: "TALARA",
    opcion: "P",
  },
  {
    codigo: "YMS",
    nombre: "YURIMAGUAS",
    opcion: "P",
  },
  {
    codigo: "ZOR",
    nombre: "ZORRITOS",
    opcion: "P",
  },
  {
    codigo: "AQP",
    nombre: "RODRIGUEZ BALLON",
    opcion: "A",
  },
  {
    codigo: "ANS",
    nombre: "ANDAHUAYLAS",
    opcion: "A",
  },
  {
    codigo: "ATA",
    nombre: "COMANDANTE FAP GERMAN ARIAS GRACIANI",
    opcion: "A",
  },
  {
    codigo: "AYP",
    nombre: "CORONEL FAP ALFREDO MENDIVIL DUARTE",
    opcion: "A",
  },
  {
    codigo: "CJA",
    nombre: "MAYOR GRAL. FAP ARMANDO REVOREDO IGLESIAS",
    opcion: "A",
  },
  {
    codigo: "CHM",
    nombre: "TNTE. FAP JAIME DE MONTRUIL M.",
    opcion: "A",
  },
  {
    codigo: "CUZ",
    nombre: "ALEJANDRO VELAZCO ASTETE",
    opcion: "A",
  },
  {
    codigo: "CHH",
    nombre: "CHACHAPOYAS",
    opcion: "A",
  },
  {
    codigo: "CIX",
    nombre: "CAPITAN FAP JOSE QUIÑONES G.",
    opcion: "A",
  },
  {
    codigo: "HUU",
    nombre: "ALFEREZ FAP DAVID FIGUEROA FERNANDINI",
    opcion: "A",
  },
  {
    codigo: "ILO",
    nombre: "ILO",
    opcion: "A",
  },
  {
    codigo: "IQT",
    nombre: "CORONEL FAP FRANCISCO SECADA VIGNETTA",
    opcion: "A",
  },
  {
    codigo: "JAE",
    nombre: "JAEN - SHUMBA",
    opcion: "A",
  },
  {
    codigo: "JJI",
    nombre: "JUANJUI",
    opcion: "A",
  },
  {
    codigo: "JUL",
    nombre: "MANCO CAPAC",
    opcion: "A",
  },
  {
    codigo: "JAU",
    nombre: "FRANCISCO CARLE",
    opcion: "A",
  },
  {
    codigo: "LIM",
    nombre: "INTERNACIONAL JORGE CHAVEZ",
    opcion: "A",
  },
  {
    codigo: "MBP",
    nombre: "MOYOBAMBA",
    opcion: "A",
  },
  {
    codigo: "PIO",
    nombre: "CAPITAN FAP RENAN ELIAS OLIVERA",
    opcion: "A",
  },
  {
    codigo: "PIU",
    nombre: "CAPITAN FAP CARLOS CONCHA IBERICO",
    opcion: "A",
  },
  {
    codigo: "PCL",
    nombre: "CAPITAN FAP DAVID ABENSUR RENGIFO",
    opcion: "A",
  },
  {
    codigo: "PEM",
    nombre: "PADRE ALDAMIZ",
    opcion: "A",
  },
  {
    codigo: "RIJ",
    nombre: "JUAN SIMONS VELA - RIOJA",
    opcion: "A",
  },
  {
    codigo: "TCQ",
    nombre: "CORONEL FAP CARLOS CIRIANI SANTA ROSA",
    opcion: "A",
  },
  {
    codigo: "TYL",
    nombre: "CAPITAN FAP MONTES ARIAS",
    opcion: "A",
  },
  {
    codigo: "TPP",
    nombre: "CADETE FAP GUILLERMO DEL CASTILLO PAREDES",
    opcion: "A",
  },
  {
    codigo: "TIG",
    nombre: "TINGO MARIA",
    opcion: "A",
  },
  {
    codigo: "TRU",
    nombre: "CAPITAN FAP CARLOS MARTINEZ PINILLOS",
    opcion: "A",
  },
  {
    codigo: "TBP",
    nombre: "CAPITAN FAP PEDRO CANGA RODRIGUEZ",
    opcion: "A",
  },
  {
    codigo: "ATG",
    nombre: "ATALAYA - TNTE. GRAL. GERARDO PEREZ PINEDO",
    opcion: "A",
  },
  {
    codigo: "YMS",
    nombre: "MOISES BENZAQUEN RENGIFO",
    opcion: "A",
  },
];

interface PuertoFormProps {
  onChange: (puerto: Puerto) => void;
  initialValue: Puerto;
  opcion: string;
  schema?: Yup.AnyObjectSchema;
}

const FormPuerto = ({ onChange, initialValue, opcion,schema }: PuertoFormProps) => {

  const formik = useFormik({
    initialValues: initialValue,
    validationSchema: schema || PuertoSchema,
    onSubmit: (values) => {
      console.log(values);
      onChange(values);
    },
  });

  const eleccion = opcion === "P" ? "Elija el Puerto" : "Elija el Aeropuerto";
  

  useEffect(() => {
    console.log(formik.values);
    onChange(formik.values);
  }, [formik.values]);

  // const SelectHandleChange = (event: SelectChangeEvent<string>) => {
  //   const { value } = event.target;
  //   const nombre = Ports.find(
  //     (puerto) => puerto.codigo === value && puerto.opcion === opcion
  //   ).nombre;
  //   setDataPuerto({
  //     ...dataPuerto,
  //     codigo: value,
  //     nombre: nombre,
  //   });
  // };

  return (
    <FormControl fullWidth size="small">
      <InputLabel id="demo-simple-select-label">{eleccion}</InputLabel>
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        value={formik.values.codigo}
        // value={dataPuerto?.codigo}
        label={eleccion}
        // onChange={(e: SelectChangeEvent): void => SelectHandleChange(e)}
        onChange={formik.handleChange}
        error={formik.touched.codigo && Boolean(formik.errors.codigo)}
        onBlur={formik.handleBlur}
        name="codigo"
      >
        {Ports.filter((puerto) => puerto.opcion === opcion).map(
          (port, index) => (
            <MenuItem key={index} value={port.codigo}>
              {port.nombre}
            </MenuItem>
          )
        )}
      </Select>
    </FormControl>
  );
};

export default FormPuerto;
