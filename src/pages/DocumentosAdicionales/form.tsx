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
  
} from "@mui/material";

import { useFormik } from "formik";
// import * as Yup from 'yup';

import ButtonSearch from "../../components/ButtonSearch";
import { dataFound, persona } from "../../types/persona.interface";

import { AddDocSchema } from "../../utils/validateGuiaRemision";
import clienteAxios from "../../config/axios";
import ChipFavoritos from "../../components/ChipFavoritos";
import { ChipInterface } from "../../types/general.interface";

// import MaskedInput from "react-text-mask";

interface AddDocFormProps {
  onNewAddDoc: (newDetail: AddDoc) => void;
}

const AddDocValues: AddDoc = {
  emisor: "",
  nro: "",
  tipo: "01",
  tipoDesc: "FACTURA",
};

const TipoDocumentos = [
  { valor: "03", descripcion: "BOLETA" },
  { valor: "01", descripcion: "FACTURA" },
  { valor: "81", descripcion: "CODIGO DE AUTORIZACION EMITIDA POR EL SCOP" },
];

const DocumentoAdicional = ({ onNewAddDoc }: AddDocFormProps) => {
  const [chipRazonSocial, setChipRazonSocial] = useState("");
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
      onNewAddDoc(values);
    },
  });




  const handleSearch = (_data: dataFound): void => {
    // //setDataFoundIt(data);

    // var razonSocial: string = "";
    // if (data.dniData && formik.values.tipo === "03") {
    //   razonSocial =
    //     data.dniData.apellidoMaterno +
    //     " " +
    //     data.dniData.apellidoPaterno +
    //     " " +
    //     data.dniData.nombres;
    // } else if (data.rucData && formik.values.tipo === "01") {
    //   razonSocial = data.rucData.razonSocial;
    // } else {
    //   razonSocial = "NO ENCONTRADO";
    // }
    // //setDataCliente({ ...dataCliente, rznSocial: razonSocial });
    // setChipRazonSocial(razonSocial);
  };

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
      <Box component={'form'} onSubmit={formik.handleSubmit}>
        <Stack
          direction="row"
          justifyItems="center"
          alignItems="baseline"
          spacing={2}
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
            type={formik.values.tipo === "01" ? "6" : "1"}
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
          value={formik.values.nro}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          helperText={formik.touched.nro && formik.errors.nro}
          error={formik.touched.nro && Boolean(formik.errors.nro)}
          inputProps={{ style: { textTransform: "uppercase" } }}
          placeholder={ formik.values.tipo==='81'?'':`EJEMPLO: ${
            formik.values.tipo === "01" ? "F" : "B"
          }123-456789`}
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
    </>
  );
};

export default DocumentoAdicional;
