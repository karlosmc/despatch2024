

import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,

  Stack,
  TextField,
  styled,
} from "@mui/material";

// import { dataFound } from "../../types/persona.interface";
import { useFormik } from "formik";
// import { EnvioTransportista } from "../../types/guias/guiaremision.interface";
import { TransportistaSchema } from "../../utils/validateGuiaRemision";
import { transportista } from "../../types/transportista.interface";
import { useEffect, useState } from "react";
import ModalTransportista from "../../components/Transportista";
import { DialogComponentCustom } from "../../components";
import SearchTransportista from "../../components/Transportista/SearchTransportista";
import { Transportista } from "../../types/guias/guiaremision.interface";
import clienteAxios from "../../config/axios";
import ChipFavoritos from "../../components/ChipFavoritos";
import { ChipInterface } from "../../types/general.interface";

const TransportistaValues: Transportista = {
  id: 0,
  numDoc: "",
  rznSocial: "",
  tipoDoc: "6",
  nroMtc: "",
};

interface TransportistaFormProps {
  onChange: (transportista: Transportista) => void;
  initialValue?: Transportista;
}

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


type ModalsProps = {
  open: boolean;
  form: React.ReactNode | null;
  title: string;
};

const DatosTransportista = ({
  initialValue,
  onChange,
}: TransportistaFormProps) => {

  const [modalsForm, setModalsForms] = useState<ModalsProps>({
    open: false,
    form: null,
    title: "",
  });

  const [dataFilter, setDataFilter] = useState<Transportista[]>([])

  const [isLoading, setIsLoading] = useState(true)

  const token = localStorage.getItem('AUTH_TOKEN');

  


  // console.log('initialvalues',initialValue)
  // const [dataTransportista, setDataTransportista] = useState<EnvioTransportista | null>(initialValue || TransportistaValues);

  const formik = useFormik({
    initialValues: initialValue,
    validationSchema: TransportistaSchema,
    onSubmit: (values) => {

      const newValues:Transportista={
        ...values,
        nroMtc:values?.nroMtc?.toUpperCase()||'',
        rznSocial:values.rznSocial.toUpperCase()
      }

      onChange(newValues)
    }
  })

  const filterFav = async () => {
    try {

      const { data, status } = await clienteAxios(`/api/transportistas/buscar?fav=1`, {
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

  const handleClean = () => {
    // setDataTransportista(TransportistaValues);
    onChange(TransportistaValues);
    // formik.resetForm();
  };

  const handleConfirm = (transportista: transportista): void => {
    // setDriver(conductor)
    formik.setFieldValue('id',transportista.id)
    formik.setFieldValue('numDoc',transportista.numDoc)
    formik.setFieldValue('rznSocial',transportista.rznSocial)
    formik.setFieldValue('tipoDoc',transportista.tipoDoc)
    formik.setFieldValue('nroMtc',transportista.nroMtc)
    handleCloseModalForm()
  }

  const handleSetFavorite = (item: ChipInterface): void => {
    const transportista = dataFilter.find(it => it.id === item.id);
    formik.setFieldValue('id',transportista.id)
    formik.setFieldValue('numDoc',transportista.numDoc)
    formik.setFieldValue('rznSocial',transportista.rznSocial)
    formik.setFieldValue('tipoDoc',transportista.tipoDoc)
    formik.setFieldValue('nroMtc',transportista.nroMtc)
    
  }

  const handleOpenModalForm = (form: React.ReactNode, title: string) => {
    setModalsForms({ open: true, form, title });
  };

  const handleCloseModalForm = () => {
    // Cierra el modal en la posición especificada
    setModalsForms((prev) => ({ ...prev, open: false }));
  };

  useEffect(()=>{
    filterFav()
  },[])


  return (
    <>
    <ChipFavoritos isLoading={isLoading} items={dataFilter} onPick={handleSetFavorite} title="Transportistas favoritos" />
      <Box component={'form'} onSubmit={formik.handleSubmit}>
        <Box display={'flex'} flexDirection={'row'} gap={2} my={2}>
          <StyledNewButton fullWidth variant="contained"
            onClick={() => {
              handleOpenModalForm(
                <ModalTransportista initialValue={null} edit={false} onConfirm={handleConfirm} />,
                'Crear Transportista'
              )
            }}
          >
            Crear
          </StyledNewButton>

          <StyledSearchButton fullWidth variant="contained" color="warning"
          onClick={() => {
            handleOpenModalForm(
              <SearchTransportista onCheck={handleConfirm} />,
              'Buscar Transportista'
            )
          }}
          >
            Buscar
          </StyledSearchButton>
        </Box>
        <FormControl fullWidth size="small">
          <InputLabel id="demo-simple-select-label">Tipo de documento</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={formik.values.tipoDoc}
            label="Tipo de documento"
            onChange={formik.handleChange}
            error={formik.touched.tipoDoc && Boolean(formik.errors.tipoDoc)}
            onBlur={formik.handleBlur}
            name="tipoDoc"
          >
            <MenuItem value={"6"}>RUC</MenuItem>
          </Select>
        </FormControl>

        <TextField
          margin="normal"
          size="small"
          fullWidth
          name={'numDoc'}
          label="Número de documento"
          value={formik.values.numDoc}
          error={formik.touched?.numDoc && Boolean(formik.errors?.numDoc)}
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          helperText={formik.touched.numDoc && formik.errors.numDoc}
          InputProps={{ readOnly: true}}
        />

        <TextField
          margin="normal"
          size="small"
          fullWidth
          name="rznSocial"
          label="Razón Social"
          value={formik.values?.rznSocial?.toUpperCase()}
          error={formik.touched?.rznSocial && Boolean(formik.errors?.rznSocial)}
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          helperText={formik.touched.rznSocial && formik.errors.rznSocial}
          inputProps={{ style: { textTransform: "uppercase" } }}
          InputProps={{ readOnly: true}}
        />

        <TextField
          margin="normal"
          size="small"
          fullWidth
          name="nroMtc"
          label="Nro. MTC (opcional)"
          value={formik.values?.nroMtc?.toUpperCase()||''}
          error={formik.touched?.nroMtc && Boolean(formik.errors?.nroMtc)}
          onBlur={formik.handleBlur}
          onChange={formik.handleChange}
          helperText={formik.touched.nroMtc && formik.errors.nroMtc}
          inputProps={{ style: { textTransform: "uppercase" } }}
          InputProps={{ readOnly: true}}
        />
        <Stack direction="row" spacing={2}>
          <Button fullWidth variant="contained" color="success" type="submit">
            Agregar
          </Button>
          <Button fullWidth variant="outlined" color="secondary" onClick={handleClean}>
            Limpiar
          </Button>
        </Stack>
      </Box>
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

export default DatosTransportista;
