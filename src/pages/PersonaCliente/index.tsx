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

import { useFormik } from "formik";
import * as Yup from "yup";

import { Client } from "../../types/guias/guiaremision.interface";
import { DestinatarioSchema } from "../../utils/validateGuiaRemision";
import { useEffect, useState } from "react";
import ModalPersona from "../../components/Persona";
import { persona } from "../../types/persona.interface";
import SearchPersona from "../../components/Persona/SearchPersona";
import { DialogComponentCustom } from "../../components";
import clienteAxios from "../../config/axios";
import ChipFavoritos from "../../components/ChipFavoritos";
import { ChipInterface } from "../../types/general.interface";





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

const ClientValues: Client = {
  id:0,
  numDoc: "",
  rznSocial: "",
  tipoDoc: "1",
};

interface ClienteFormProps {
  onChange: (cliente: Client) => void;
  initialValue: Client;
  schema?: Yup.AnyObjectSchema;
  tipo?: string;
}



const Cliente = ({ initialValue, onChange, schema, tipo = '' }: ClienteFormProps) => {

  const [modalsForm, setModalsForms] = useState<ModalsProps>({
    open: false,
    form: null,
    title: "",
  });

  const [dataFilter, setDataFilter] = useState<persona[]>([])

  const [isLoading, setIsLoading] = useState(true)

  const token = localStorage.getItem('AUTH_TOKEN');

  const filterFav = async () => {
    try {

      const { data, status } = await clienteAxios(`/api/clientes/buscar?fav=1`, {
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
  }, [])

  const formik = useFormik({
    initialValues: initialValue,
    validationSchema: schema || DestinatarioSchema,
    onSubmit: (values) => {
      onChange(values);
    },
  });

  const handleOpenModalForm = (form: React.ReactNode, title: string) => {
    setModalsForms({ open: true, form, title });
  };

  const handleCloseModalForm = () => {
    // Cierra el modal en la posición especificada
    setModalsForms((prev) => ({ ...prev, open: false }));
  };

  const handleConfirm = (persona: persona): void => {
    formik.setFieldValue('tipoDoc', persona.tipoDoc)
    formik.setFieldValue('numDoc', persona.numDoc)
    formik.setFieldValue('rznSocial', persona.rznSocial)
    handleCloseModalForm()
  }

  const handleSetFavorite = (item: ChipInterface): void => {
    const persona = dataFilter.find(it => it.id === item.id);
    formik.setFieldValue('id', persona.id)
    formik.setFieldValue('tipoDoc', persona.tipoDoc)
    formik.setFieldValue('numDoc', persona.numDoc)
    formik.setFieldValue('rznSocial', persona.rznSocial)
  }

  const handleClean = () => {
    onChange(ClientValues);
  };

  useEffect(() => {

    if (tipo === 'default') {
      if (dataFilter.length > 0) {
        // console.log(dataFilter)
        const defaultPersona = dataFilter.find(it => Number(it.isCompany) === 1);
        // console.log(defaultPersona)
        formik.setFieldValue('id', defaultPersona.id)
        formik.setFieldValue('tipoDoc', defaultPersona.tipoDoc)
        formik.setFieldValue('numDoc', defaultPersona.numDoc)
        formik.setFieldValue('rznSocial', defaultPersona.rznSocial)
      }
    // } else {
    //   formik.setFieldValue('tipoDoc', '')
    //   formik.setFieldValue('numDoc', '')
    //   formik.setFieldValue('rznSocial', '')
    }

  }, [tipo, dataFilter])

  return (
    <>
      <ChipFavoritos activo={tipo === 'default'} isLoading={isLoading} items={dataFilter} onPick={handleSetFavorite} title="Clientes favoritos" />
      <Box display={'flex'} flexDirection={'row'} gap={2} my={2}>
        <StyledNewButton fullWidth variant="contained" color="success" disabled={tipo === 'default'}
          onClick={() => {
            handleOpenModalForm(
              <ModalPersona initialValue={null} edit={false} onConfirm={handleConfirm} />,
              'Crear persona'
            )
          }}
        >
          Crear
        </StyledNewButton>

        <StyledSearchButton fullWidth variant="contained" color="warning" disabled={tipo === 'default'}
          onClick={() => {
            handleOpenModalForm(
              <SearchPersona onCheck={handleConfirm} />,
              'Buscar Persona'
            )
          }}
        >
          Buscar
        </StyledSearchButton>
      </Box>
      <Box component={'form'} onSubmit={formik.handleSubmit}>
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
            // readOnly={tipo === 'default' ? true : false}
            readOnly={true}

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
          // InputProps={{ readOnly: tipo === 'default' ? true : false }}
          InputProps={{ readOnly: true }}

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
          // InputProps={{ readOnly: tipo === 'default' ? true : false }}
          InputProps={{ readOnly: true }}
          inputProps={{ style: { textTransform: "uppercase" } }}
        />

        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            fullWidth
            color="success"
            type="submit"
          >
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

export default Cliente;
