import { Vehiculo } from "../../types/doc.interface";
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



import { useFormik } from "formik";
import { VehiculoSchema } from "../../utils/validateGuiaRemision";


const VehiculoValues: Vehiculo = {
  placa: "",
  codEmisor: "",
  nroAutorizacion: "",
  nroCirculacion: "",
  secundarios: null,
};

const EMISORES = [
  {
    Codigo: "",
    Nombre: "Elija un emisor autorizado (Opcional)",
    Abreviatura: "",
  },
  {
    Codigo: "01",
    Nombre:
      "Superintendencia Nacional de Control de Servicios de Seguridad, Armas, Municiones y Explosivos de Uso Civil",
    Abreviatura: "SUCAMEC",
  },
  {
    Codigo: "02",
    Nombre: "Dirección General de Medicamentos Insumos y Drogas",
    Abreviatura: "DIGEMID",
  },
  {
    Codigo: "03",
    Nombre: "Dirección General de Salud Ambiental",
    Abreviatura: "DIGESA",
  },
  {
    Codigo: "04",
    Nombre: "Servicio Nacional de Sanidad Agraria",
    Abreviatura: "SENASA",
  },
  {
    Codigo: "05",
    Nombre: "Servicio Nacional Forestal y de Fauna Silvestre",
    Abreviatura: "SERFOR",
  },
  {
    Codigo: "06",
    Nombre: "Ministerio de Transportes y Comunicaciones",
    Abreviatura: "MTC",
  },
  {
    Codigo: "07",
    Nombre: "Ministerio de la Producción",
    Abreviatura: "PRODUCE",
  },
  {
    Codigo: "08",
    Nombre: "Ministerio del Ambiente",
    Abreviatura: "MIN. AMBIENTE",
  },
  {
    Codigo: "09",
    Nombre: "Organismo Nacional de Sanidad Pesquera",
    Abreviatura: "SANIPES",
  },
  {
    Codigo: "10",
    Nombre: "Municipalidad Metropolitana de Lima",
    Abreviatura: "MML",
  },
  {
    Codigo: "11",
    Nombre: "Ministerio de Salud",
    Abreviatura: "MINSA",
  },
  {
    Codigo: "12",
    Nombre: "Gobierno Regional",
    Abreviatura: "GR",
  },
];

interface VehiculoFormProps {
  onChange: (vehiculo: Vehiculo) => void;
  initialValue: Vehiculo;
}

const DatosVehiculo = ({ onChange, initialValue }: VehiculoFormProps) => {

  const formik = useFormik({
    initialValues: initialValue,
    validationSchema: VehiculoSchema,
    onSubmit: (values) => {
      onChange(values);
    },
  });

 
  const handleClean = () => {
    
    onChange(VehiculoValues);
  };

  return (
    
      <Box 
        component={'form'} 
        onSubmit={formik.handleSubmit} 
        display={'grid'} 
        gridTemplateColumns={{ xs: "repeat(1fr)", sm: "repeat(2,1fr)" }} 
        columnGap={1}
      >
        <TextField
          margin="normal"
          size="small"
          fullWidth
          name="placa"
          label="Placa de vehiculo"
          value={formik.values.placa}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          helperText={formik.touched.placa && formik.errors.placa}
          error={formik.touched.placa && Boolean(formik.errors.placa)}
        />
        <TextField
          margin="normal"
          size="small"
          fullWidth
          name="nroCirculacion"
          label="Nro. Circulación (Opcional)"
          value={formik.values.nroCirculacion}
          onChange={formik.handleChange}
        />
        <FormControl fullWidth size="small" margin="normal">
          <InputLabel>Emisores autorizados (opcional)</InputLabel>
          <Select
            value={formik.values.codEmisor}
            name="codEmisor"
            label="Emisores autorizados (Opcional)"
            onChange={formik.handleChange}
          >
            {EMISORES.map((emisor) => (
              <MenuItem key={emisor.Codigo} value={emisor.Abreviatura}>
                {emisor.Nombre}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          margin="normal"
          size="small"
          fullWidth
          name="nroAutorizacion"
          label="Nro. Autorización (opcional)"
          value={formik.values.nroAutorizacion}
          onChange={formik.handleChange}
        />
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" color="success" type="submit">
            Agregar
          </Button>
          <Button variant="outlined" color="error" onClick={handleClean}>
            Clean
          </Button>
        </Stack>
      </Box>
    
  );
};

export default DatosVehiculo;
