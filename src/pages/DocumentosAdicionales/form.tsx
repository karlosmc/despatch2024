import  { useEffect, useState } from "react";
import { AddDoc } from "../../types/doc.interface";
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
// import * as Yup from 'yup';

import ButtonSearch from "../../components/ButtonSearch";
import {  persona, searchPersona } from "../../types/persona.interface";

import { AddDocSchema } from "../../utils/validateGuiaRemision";
import clienteAxios from "../../config/axios";
import ChipFavoritos from "../../components/ChipFavoritos";
import { ChipInterface } from "../../types/general.interface";
import { useNotification } from "../../context/notification.context";
import SearchPersona from "../../components/Persona/SearchPersona";
import { DialogComponentCustom } from "../../components";

// import MaskedInput from "react-text-mask";

interface AddDocFormProps {
  onNewAddDoc: (newDetail: AddDoc) => void;
}

type ModalsProps = {
  open: boolean;
  form: React.ReactNode | null;
  title: string;
};

const AddDocValues: AddDoc = {
  emisor: "",
  nro: "",
  tipo: "01",
  tipoDesc: "FACTURA",
};

const TipoDocumentos = [
  { valor: "03", descripcion: "BOLETA" },
  { valor: "01", descripcion: "FACTURA" },
  { valor: "04", descripcion: "LIQUIDACION DE COMPRA"},
  { valor: "81", descripcion: "CODIGO DE AUTORIZACION EMITIDA POR EL SCOP" },
];

const StyledSearchButton = styled(Button)(({ }) => ({
  backgroundColor: '#00BC8C',
  color: 'white',
  '&:hover': {
    backgroundColor: '#00A077',
  }
}))

const DocumentoAdicional = ({ onNewAddDoc }: AddDocFormProps) => {
  const [chipRazonSocial, setChipRazonSocial] = useState("");
  const [dataFilter, setDataFilter] = useState<persona[]>([])

  const [isLoading, setIsLoading] = useState(true)

  const {getError} = useNotification()

  const token = localStorage.getItem('AUTH_TOKEN');

  const [modalsForm, setModalsForms] = useState<ModalsProps>({
    open: false,
    form: null,
    title: "",
  });

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


  // const dataUser: UserLogin = JSON.parse(localStorage.getItem("userlogin"));

  //  const DefaultClients: ClientCompany[] = [];

    // const AllClientes: ClientCompanyFav[] = ClientesCentenario ;

   


  // const serie = dataUser.sercor.serie
  // const correlativo = parseInt(dataUser.sercor.correlativo)+1

  // const PrincipalDriver = dataUser.driver;

  const formik = useFormik({
    initialValues: AddDocValues,
    validationSchema: AddDocSchema,
    onSubmit: (values) => {
      const tipoDesc = TipoDocumentos.find(
        (item) => item.valor === values.tipo
      ).descripcion;
      values.tipoDesc = tipoDesc;
      // console.log(values);
      // onChange(values);

      const newValues:AddDoc={
        ...values,
        nro:values.nro.toUpperCase()
      }  
      onNewAddDoc(newValues);
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
    // formik.setFieldValue('tipoDoc', persona.tipoDoc)
    // formik.setFieldValue('numDoc', persona.numDoc)
    formik.setFieldValue('emisor', persona.numDoc)
    setChipRazonSocial(persona.rznSocial)
    handleCloseModalForm()
  }



  const handleSearch = (searchPerson: searchPersona): void => {

    if (!searchPerson){
      getError('Tiempo de espera terminado, intentelo otra vez o verifica el número')
      return;
    }
    if (searchPerson.status === 'error') {
      getError(searchPerson.message)
      return;
    }
    // formik.setFieldValue('rznSocial', searchPerson.persona.nombreRazonSocial)
    setChipRazonSocial(searchPerson.persona.nombreRazonSocial)
  }


  const PlaceHolderTipoComprobante = (valor: string):string=>{

    let placeholder = ''
    switch (valor) {
      case '01':
        placeholder =`Ejemplo:F123-456789`;
        break;
      case '03':
        placeholder = `Ejemplo:B123-456789`;
        break;
      case '04':
        placeholder = `Ejemplo:E001-123456`;
        break;
    
      default:
        placeholder =''
        break;
    }

    return placeholder
  }

  const handleSetFavorite = (item: ChipInterface): void => {
    const persona = dataFilter.find(it => it.id === item.id);
    // formik.setFieldValue('tipoDoc', persona.tipoDoc)
    formik.setFieldValue('emisor', persona.numDoc)
    setChipRazonSocial(persona.rznSocial)
  }

  useEffect(() => {
    filterFav()
  }, [])

  return (
    <>
      <ChipFavoritos isLoading={isLoading} items={dataFilter} onPick={handleSetFavorite} title="Clientes favoritos" />
      <Box display={'flex'} flexDirection={'row'} gap={2} my={2}>

        <StyledSearchButton fullWidth variant="contained" color="warning" 
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
        <Stack
          direction="row"
          justifyItems="center"
          alignItems="baseline"
          spacing={1}
        >
          <TextField
            margin="normal"
            size="small"
            fullWidth
            name="emisor"
            label="Emisor"
            value={formik.values.emisor}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            helperText={formik.touched.emisor && formik.errors.emisor}
            error={formik.touched.emisor && Boolean(formik.errors.emisor)}
           
          />
          <ButtonSearch
            type={"6"}
            valor={formik.values.emisor}
            onSearch={handleSearch}
          />
        </Stack>

        <TextField
          margin="normal"
          size="small"
          fullWidth
          name="chipRazonSocial"
          label="Razón Social"
          value={chipRazonSocial}
          InputProps={{
            readOnly: true,
          }}
        />

        <FormControl fullWidth size="small" margin="normal" sx={{ mb: 2 }}>
          <InputLabel>Tipo de comprobante</InputLabel>
          <Select
            label="Tipo de comprobante"
            name="tipo"
            value={formik.values.tipo}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.tipo && Boolean(formik.errors.tipo)}
          >
            {TipoDocumentos.map((doc) => (
              <MenuItem key={doc.valor} value={doc.valor}>
                {doc.descripcion}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {/* <InputLabel htmlFor="nro">{ formik.values.tipo==='81'? `Código de SCOP`:'Número de comprobante'}</InputLabel> */}
        <TextField
          margin="normal"
          type="text"
          size="small"
          label={ formik.values.tipo==='81'? `Código de SCOP`:'Número de comprobante'}
          fullWidth
          name="nro"
          value={formik.values.nro.toUpperCase()}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          helperText={formik.touched.nro && formik.errors.nro}
          error={formik.touched.nro && Boolean(formik.errors.nro)}
          inputProps={{ style: { textTransform: "uppercase" } }}
          placeholder={ PlaceHolderTipoComprobante(formik.values.tipo) }
        />

        <Button
          variant="contained"
          fullWidth
          color="success"
          type="submit"
        >
          Agregar Item
        </Button>
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

export default DocumentoAdicional;
