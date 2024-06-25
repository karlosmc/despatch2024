import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { useEffect, useState } from 'react'


import { useFormik } from 'formik';
import clienteAxios from '../../config/axios';


import { VehiculoSchema } from '../../utils/validateForm';
import { useNotification } from '../../context/notification.context';
import { vehiculo } from '../../types/vehiculo.interface';




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

const VehiculoInitialValues: vehiculo = {
  placa: '',
  nroAutorizacion: '',
  nombreCorto: '',
  codEmisor: '',
  nroCirculacion: '',
  fav: false,
  isCompany: false,
  id: 0,
}

interface VehiculoFormProps {
  initialValue?: vehiculo;
  onConfirm: (vehiculo: vehiculo) => void;
  edit: Boolean,
}

const ModalVehiculo = ({ initialValue, onConfirm, edit }: VehiculoFormProps) => {

  // console.log(initialValue)
  const { getError } = useNotification()

  const [fav, setFav] = useState<boolean>(initialValue?.fav || false);
  const [isCompany, setIsCompany] = useState<boolean>(initialValue?.isCompany || false);




  const token = localStorage.getItem('AUTH_TOKEN');

  const storeVehiculo = async (values: vehiculo) => {


    try {
      const { data, status } = await clienteAxios.post('/api/vehiculos', {
        placa: values.placa,
        nroCirculacion: values.nroCirculacion,
        nroAutorizacion: values.nroAutorizacion,
        codEmisor: values.codEmisor,
        fav: values.fav,
        isCompany: values.isCompany,
        nombreCorto: values.nombreCorto,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      //  console.log(data)
      if (status === 200) {
        onConfirm(data.vehiculo);
      }
    }
    catch (error) {
      // console.log(error)

      getError(error?.response?.data?.message)


    }



  }

  const updateVehiculo = async (values: vehiculo) => {
    try {
      const { data, status } = await clienteAxios.put(`/api/vehiculos/${values.id}`, {

        placa: values.placa,
        nroCirculacion: values.nroCirculacion,
        nroAutorizacion: values.nroAutorizacion,
        codEmisor: values.codEmisor,
        fav: values.fav,
        isCompany: values.isCompany,
        nombreCorto: values.nombreCorto,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      // console.log(data)
      if (status === 200) {
        onConfirm(data.vehiculo);
      }
    }
    catch (error) {
      console.log(error)
    }
    // onConfirm();
  }




  const formik = useFormik({
    initialValues: initialValue || VehiculoInitialValues,
    validationSchema: VehiculoSchema,
    onSubmit: (values) => {
      if (edit) {
        updateVehiculo(values)
      } else {
        storeVehiculo(values)
      }
    },
  });

  useEffect(() => {
    formik.setFieldValue('fav', fav)
  }, [fav])
  useEffect(() => {
    formik.setFieldValue('isCompany', isCompany)
  }, [isCompany])

  return (
    <>

      <Box component={'form'} onSubmit={formik.handleSubmit}>
        <Box 
         display={"grid"}
         gridTemplateColumns={{ xs: "repeat(1fr)", sm: "repeat(2,1fr)" }}
         columnGap={1}
         >
          <TextField
            margin="normal"
            size="small"
            fullWidth
            name="placa"
            type="text"
            label="Placa"
            disabled={Boolean(edit)}
            value={formik.values.placa}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            helperText={formik.touched?.placa && formik.errors?.placa}
            error={formik.touched?.placa && Boolean(formik.errors?.placa)}
            inputProps={{ style: { textTransform: "uppercase" } }}
          />
          <TextField
            margin="normal"
            size="small"
            fullWidth
            name="nroCirculacion"
            type="text"
            label="Nro. Circulación"
            

            value={formik.values?.nroCirculacion}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            helperText={formik.touched.nroCirculacion && formik.errors.nroCirculacion}
            error={formik.touched.nroCirculacion && Boolean(formik.errors.nroCirculacion)}
            inputProps={{ style: { textTransform: "uppercase" } }}
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
            name="nombreCorto"
            type="text"
            label="Nombre corto de la persona"
            value={formik.values?.nombreCorto}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            helperText={formik.touched.nombreCorto && formik.errors.nombreCorto}
            error={formik.touched.nombreCorto && Boolean(formik.errors.nombreCorto)}
            inputProps={{ style: { textTransform: "uppercase" } }}
          />
        </Box>

        <Box textAlign={'center'}>
          <Button onClick={() => setFav(!fav)} variant={!fav ? 'outlined' : 'contained'} color='warning' sx={{ display: 'inline-block', mt: 2, width: '80%', letterSpacing: 20, fontWeight: 600 }}>
            FAVORITO
          </Button>
        </Box>

        <Box textAlign={'center'}>
          <Button onClick={() => setIsCompany(!isCompany)} variant={!isCompany ? 'outlined' : 'contained'} color='info' sx={{ display: 'inline-block', my: 2, width: '80%', letterSpacing: 5, fontWeight: 600 }}>
            Vehiculo de la empresa
          </Button>
        </Box>

        <Button type='submit' color='success' variant='contained' sx={{ width: '50%', alignItems: 'start', display: 'inline-block' }}>
          Guardar
        </Button>
      </Box>
    </>
  );
}

export default ModalVehiculo