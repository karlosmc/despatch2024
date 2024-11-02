import { Vehiculo } from "../../types/doc.interface";
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  styled,
} from "@mui/material";



import { useFormik } from "formik";
import { VehiculoSchema } from "../../utils/validateGuiaRemision";
import { useEffect, useState } from "react";
import { vehiculo } from "../../types/vehiculo.interface";
import clienteAxios from "../../config/axios";
import ChipFavoritos from "../../components/ChipFavoritos";
import { DialogComponentCustom } from "../../components";
import { ChipInterface } from "../../types/general.interface";
import ModalVehiculo from "../../components/Vehiculo";
import SearchVehiculo from "../../components/Vehiculo/SearchVehiculo";


const VehiculoValues: Vehiculo = {
  placa: "",
  codEmisor: "",
  nroAutorizacion: "",
  nroCirculacion: "",
  secundarios: null,
};

type ModalsProps = {
  open: boolean;
  form: React.ReactNode | null;
  title: string;
};

const StyledNewButton = styled(Button)(({ }) => ({
  backgroundColor: '#375A7F',
  color: 'white',
  '&:hover': {
    backgroundColor: '#2F4D6C',
  }
}))

const StyledSearchButton = styled(Button)(({ }) => ({
  backgroundColor: '#00BC8C',
  color: 'white',
  '&:hover': {
    backgroundColor: '#00A077',
  }
}))

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


  const [modalsForm, setModalsForms] = useState<ModalsProps>({
    open: false,
    form: null,
    title: "",
  });

  const [dataFilter, setDataFilter] = useState<vehiculo[]>([])

  const [isLoading, setIsLoading] = useState(true)

  const token = localStorage.getItem('AUTH_TOKEN');

  const [criterio, setCriterio] = useState('isCompany');

  const handleChangeCriterio = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCriterio((event.target as HTMLInputElement).value);
  };


  const filterFav = async () => {
    try {

      const { data, status } = await clienteAxios(`/api/vehiculos/buscar?${criterio}=1`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (status === 200) {
        setIsLoading(false)
        setDataFilter(data?.data)
      }
    }
    catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    filterFav()
  }, [criterio])

  const formik = useFormik({
    initialValues: initialValue,
    validationSchema: VehiculoSchema,
    onSubmit: (_values) => {
      // onChange(values);
    },
  });



  const handleChange = () => {
    // console.log(formik.values)

    formik.handleSubmit();
    if (formik.values.placa === '') {
      return;
    }
    if (Object.keys(formik.errors).length > 0) {

      return;
    }

    const newValues:Vehiculo={
      ...formik.values,
      placa:formik.values.placa.toUpperCase(),
      nroAutorizacion:formik?.values?.nroAutorizacion ||'',
      nroCirculacion:formik?.values?.nroCirculacion ||'',
    }

    onChange(newValues);

    // formik.resetForm();
  };


  const handleOpenModalForm = (form: React.ReactNode, title: string) => {
    setModalsForms({ open: true, form, title });
  };

  const handleCloseModalForm = () => {
    // Cierra el modal en la posición especificada
    setModalsForms((prev) => ({ ...prev, open: false }));
  };

  const handleConfirm = (vehiculo: vehiculo): void => {
    formik.setFieldValue('id', vehiculo.id)
    formik.setFieldValue('placa', vehiculo.placa)
    formik.setFieldValue('nroCirculacion', vehiculo.nroCirculacion)
    formik.setFieldValue('nroAutorizacion', vehiculo.nroAutorizacion)
    formik.setFieldValue('codEmisor', vehiculo.codEmisor)
    formik.setFieldValue('nombreCorto', vehiculo.nombreCorto)
    handleCloseModalForm()
  }


  const handleSetFavorite = (item: ChipInterface): void => {
    const vehiculo = dataFilter.find(it => it.id === item.id);
    formik.setFieldValue('id', vehiculo.id)
    formik.setFieldValue('placa', vehiculo.placa)
    formik.setFieldValue('nroCirculacion', vehiculo.nroCirculacion)
    formik.setFieldValue('nroAutorizacion', vehiculo.nroAutorizacion)
    formik.setFieldValue('codEmisor', vehiculo.codEmisor)
    formik.setFieldValue('nombreCorto', vehiculo.nombreCorto)
  }

  const handleClean = () => {

    onChange(VehiculoValues);
    // formik.resetForm();
  };

  return (
    <>
      <Box component={FormControl} display={"flex"} border={1} sx={{ borderColor: '#918b8b' }} borderRadius={2} mb={1}>
        <FormLabel sx={{ fontSize: 15, textAlign: 'center' }} id="demo-controlled-radio-buttons-group">Filtrar por:</FormLabel>
        <RadioGroup
          aria-labelledby="demo-controlled-radio-buttons-group"
          name="controlled-radio-buttons-group"
          value={criterio}
          onChange={handleChangeCriterio}

          sx={{
            '& .MuiSvgIcon-root': {
              fontSize: 15,
            },
          }}
        >
          <Box display={"flex"} flexDirection={'row'} justifyContent={'center'} textAlign={'center'}>
            <FormControlLabel value="isCompany" control={<Radio />} label="Empresa" />
            <FormControlLabel value="fav" control={<Radio />} label="Favoritos" />
          </Box>
        </RadioGroup>
      </Box>

      <ChipFavoritos isLoading={isLoading} items={dataFilter} onPick={handleSetFavorite} title="Vehiculos favoritos" />
      <Box display={'flex'} flexDirection={'row'} gap={2} my={2}>
        <StyledNewButton fullWidth variant="contained" color="success"
          onClick={() => {
            handleOpenModalForm(
              <ModalVehiculo initialValue={null} edit={false} onConfirm={handleConfirm} />,
              'Crear Vehiculo'
            )
          }}
        >
          Crear
        </StyledNewButton>

        <StyledSearchButton fullWidth variant="contained" color="warning"
          onClick={() => {
            handleOpenModalForm(
              <SearchVehiculo onCheck={handleConfirm} />,
              'Buscar Vehiculo'
            )
          }}
        >
          Buscar
        </StyledSearchButton>
      </Box>
      <Box
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
          value={formik.values?.placa?.toUpperCase()}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          helperText={formik.touched.placa && formik.errors.placa}
          error={formik.touched.placa && Boolean(formik.errors.placa)}
          InputProps={{ readOnly: true }}
        />
        <TextField
          margin="normal"
          size="small"
          fullWidth
          name="nroCirculacion"
          label="Nro. Circulación (Opcional)"
          value={formik.values?.nroCirculacion?.toUpperCase()}
          onChange={formik.handleChange}
          InputProps={{ readOnly: true }}
        />
        <FormControl fullWidth size="small" margin="normal">
          <InputLabel>Emisores autorizados (opcional)</InputLabel>
          <Select
            value={formik.values.codEmisor}
            name="codEmisor"
            label="Emisores autorizados (Opcional)"
            onChange={formik.handleChange}
            readOnly={true}
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
          value={formik.values?.nroAutorizacion?.toUpperCase()||''}
          onChange={formik.handleChange}
          InputProps={{ readOnly: true }}
        />
      </Box>
      <Stack direction="row" spacing={2} justifyContent={'center'}>
        <Button sx={{width:'30%'}} variant="contained" color="success" onClick={handleChange}>
          Agregar
        </Button>
        <Button sx={{width:'30%'}} variant="outlined" color="secondary" onClick={handleClean}>
          Limpiar
        </Button>
      </Stack>
      <DialogComponentCustom
        closeButton={
          <Button
            variant="contained"
            color="error"
            onClick={() => handleCloseModalForm()}
          >
            Cerrar
          </Button>
        }
        open={modalsForm.open}
        title={modalsForm.title}
        element={modalsForm.form}

      />
    </>
  );
};

export default DatosVehiculo;
