import  { MouseEvent, useEffect, useState } from "react";
import { AddDoc } from "../../types/doc.interface";
import {
  Button,
  Chip,
  FormControl,
  
  InputLabel,
  MenuItem,
  Paper,
  Select,
  
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { useFormik } from "formik";
// import * as Yup from 'yup';
import { AddDocSchema } from "../../utils/validateForm";
import ButtonSearch from "../../components/ButtonSearch";
import { dataFound } from "../../types/persona.interface";
import { ClientCompany, UserLogin } from "../../types/login.interface";

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

const ClientCompanyValues: ClientCompany = {
  alias: "",
  client: "",
  id: "",
  numDoc: "",
  rznSocial: "",
  tipoDoc: "",
};

const TipoDocumentos = [
  { valor: "03", descripcion: "BOLETA" },
  { valor: "01", descripcion: "FACTURA" },
];

const FormAddDocs = ({ onNewAddDoc }: AddDocFormProps) => {
  const [chipRazonSocial, setChipRazonSocial] = useState("");

  const [chipClientDefault, setChipClientDefault] = useState<ClientCompany>(
    ClientCompanyValues || null
  );

  const dataUser: UserLogin = JSON.parse(localStorage.getItem("userlogin"));

  const DefaultClients: ClientCompany[] = dataUser.clientes;

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

  const handleClickClientsDefault = (evt: MouseEvent<HTMLDivElement>) => {
    evt.preventDefault();
    const spanChip = evt.currentTarget.id;
    // console.log(spanChip);

    const DefaultClient = DefaultClients.find((item) => item.id === spanChip);
    // console.log(DefaultClient);
    setChipRazonSocial(DefaultClient.rznSocial);
    setChipClientDefault(DefaultClient);

    // setIndicadores((prevState) =>
    //   prevState.map((indi) =>
    //     indi.id === spanChip ? { ...indi, selected: !indi.selected } : indi
    //   )
    // );
  };

  useEffect(() => {
    if (chipClientDefault.alias !== "") {
      // console.log(chipClientDefault);

      // emisor: "",
      // nro: "",
      // tipo: "01",
      // tipoDesc: "FACTURA",
      // console.log(chipClientDefault.numDoc);
      formik.setFieldValue("emisor", chipClientDefault.numDoc);
      // setChipRazonSocial(chipClientDefault.rznSocial);
    }
  }, [chipClientDefault]);

  const handleSearch = (data: dataFound): void => {
    //setDataFoundIt(data);

    var razonSocial: string = "";
    if (data.dniData && formik.values.tipo === "03") {
      razonSocial =
        data.dniData.apellidoMaterno +
        " " +
        data.dniData.apellidoPaterno +
        " " +
        data.dniData.nombres;
    } else if (data.rucData && formik.values.tipo === "01") {
      razonSocial = data.rucData.razonSocial;
    } else {
      razonSocial = "NO ENCONTRADO";
    }
    //setDataCliente({ ...dataCliente, rznSocial: razonSocial });
    setChipRazonSocial(razonSocial);
  };

  // const [detalle, setDetalle] = useState<AddDoc>(AddDocValues);

  // const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const { name, value } = event.target;
  //   setDetalle({
  //     ...detalle,
  //     [name]: value,
  //   });
  // };

  // const SelectHandleChange = (event: SelectChangeEvent<string>) => {
  //   const { value } = event.target;
  //   const tipoDesc = TipoDocumentos.find((item) => item.valor === value).descripcion;

  //   setDetalle({
  //     ...detalle,
  //     tipo: value,
  //     tipoDesc
  //   });

  // };

  // const handleSubmit = () => {
  //   onNewAddDoc(detalle);
  // };

  return (
    <>
      <Typography sx={{ textAlign: "center" }}>Clientes por Defecto</Typography>
      <Paper
        elevation={15}
        sx={{
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          my: 2,
          py: 2,
          borderRadius: 10,
          width: "100%",
        }}
      >
        {DefaultClients.map((cli) => {
          return (
            <Chip
              sx={{
                height: "auto",
                margin: 1,
                py: 1,
                width: 180,
                "& .MuiChip-label": {
                  display: "block",
                  whiteSpace: "normal",
                  textAlign: "center",
                  fontWeight: "bold",
                },
                color: "white",
              }}
              id={cli.id}
              label={cli.alias}
              key={cli.id}
              // color={indicador.selected ? "success" : "default"}
              clickable={true}
              onClick={handleClickClientsDefault}
              // icon={indicador.icon}
            />
          );
        })}
      </Paper>
      <form onSubmit={formik.handleSubmit}>
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
            // onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
            //   handleChange(e)
            // }
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

          // value={formik.values.emisor}
          // onChange={formik.handleChange}
          // onBlur={formik.handleBlur}
          // helperText={formik.touched.emisor && formik.errors.emisor}
          // error={formik.touched.emisor && Boolean(formik.errors.emisor)}
          // onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
          //   handleChange(e)
          // }
        />

        <FormControl fullWidth size="small" margin="normal" sx={{ mb: 2 }}>
          <InputLabel>Tipo de comprobante</InputLabel>
          <Select
            label="Tipo de comprobante"
            name="tipo"
            // value={detalle.tipo}

            value={formik.values.tipo}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.tipo && Boolean(formik.errors.tipo)}

            // onChange={(e: SelectChangeEvent): void => SelectHandleChange(e)}
          >
            {TipoDocumentos.map((doc) => (
              <MenuItem key={doc.valor} value={doc.valor}>
                {doc.descripcion}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          margin="normal"
          type="text"
          size="small"
          fullWidth
          name="nro"
          // label="Numero Comprobante"
          value={formik.values.nro}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          helperText={formik.touched.nro && formik.errors.nro}
          error={formik.touched.nro && Boolean(formik.errors.nro)}
          inputProps={{ style: { textTransform: "uppercase" } }}
          placeholder={`EJEMPLO: ${
            formik.values.tipo === "01" ? "F" : "B"
          }123-456789`}
          // value={detalle.nro}
          // onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
          //   handleChange(e)
          // }
        />

        <Button
          variant="outlined"
          color="success"
          type="submit"
          // onClick={handleSubmit}
        >
          Agregar Item
        </Button>
      </form>
    </>
  );
};

export default FormAddDocs;
