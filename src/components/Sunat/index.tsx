import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import {  useState } from 'react'


import { useFormik } from 'formik';
import clienteAxios from '../../config/axios';


import { SunatParamsSchema } from '../../utils/validateForm';
import { useNotification } from '../../context/notification.context';


import { SunatParams } from '../../types/sunatparameters.interface';



const SunatInitialValues: SunatParams = {
  id: 0,
  certificado: '',
  clavecertificado: '',
  client_id: '',
  client_secret: '',
  endpointurl: '',
  env: 'DEV',
  grant_type: '',
  password: '',
  scope: '',
  urlconsult: '',
  urlsend: '',
  username: '',

}

interface SunatFormProps {
  initialValue?: SunatParams;
  onConfirm: (SunatParams: SunatParams) => void;
  edit: Boolean,
}

const ModalSunat = ({ initialValue, onConfirm, edit }: SunatFormProps) => {

  // console.log(initialValue)
  const { getError } = useNotification()

  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const token = localStorage.getItem('AUTH_TOKEN');

  const storeSunat = async (values: SunatParams) => {

    if (!file) {
      getError('Debe elegir un archivo PFX');
      return;
    }
    try {

      const formData = new FormData();

      formData.append('file', file);
      formData.append('client_id', values.client_id)
      formData.append('client_secret', values.client_secret)
      formData.append('username', values.username)
      formData.append('password', values.password)
      formData.append('grant_type', values.grant_type)
      formData.append('scope', values.scope)
      formData.append('urlconsult', values.urlconsult)
      formData.append('endpointurl', values.endpointurl)
      formData.append('certificado', values.certificado)
      formData.append('clavecertificado', values.clavecertificado)
      formData.append('env', values.env)
      formData.append('urlsend', values.urlsend)

      const { data, status } = await clienteAxios.post('/api/sunat', formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type':'multipart/form-data'
          }
        })
      //  console.log(data)
      if (status === 200) {
        onConfirm(data.sunat);
      }
    }
    catch (error) {
      // console.log(error)

      getError(error?.response?.data?.message)


    }
  }

  const updateSunat = async (values: SunatParams) => {

    
    try {

      const formData = new FormData();

      formData.append('file', file);
      formData.append('client_id', values.client_id)
      formData.append('client_secret', values.client_secret)
      formData.append('username', values.username)
      formData.append('password', values.password)
      formData.append('grant_type', values.grant_type)
      formData.append('scope', values.scope)
      formData.append('urlconsult', values.urlconsult)
      formData.append('endpointurl', values.endpointurl)
      formData.append('certificado', values.certificado)
      formData.append('clavecertificado', values.clavecertificado)
      formData.append('env', values.env)
      formData.append('urlsend', values.urlsend)

      const { data, status } = await clienteAxios.post(`/api/sunat/${values.id}?_method=PUT`, formData , {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type':'multipart/form-data'
        }
      })

      if (status === 200) {
        onConfirm(data.sunat);
      }
    }
    catch (error) {
      console.log(error)
    }
    // onConfirm();
  }




  const formik = useFormik({
    initialValues: initialValue || SunatInitialValues,
    validationSchema: SunatParamsSchema,
    onSubmit: (values) => {

      if (edit) {
        updateSunat(values)
      } else {
        storeSunat(values)
      }
    },
  });



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
            name="client_id"
            type="text"
            label="Client ID de la clave sol"
            sx={{ my: 1.5 }}
            value={formik.values.client_id}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            helperText={formik.touched.client_id && formik.errors.client_id}
            error={formik.touched.client_id && Boolean(formik.errors.client_id)}
          />

          <TextField
            margin="normal"
            size="small"
            fullWidth
            name="client_secret"
            type="text"
            label="Client Secret de la clave SOL"
            sx={{ my: 1.5 }}

            value={formik.values?.client_secret}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            helperText={formik.touched?.client_secret && formik.errors?.client_secret}
            error={formik.touched?.client_secret && Boolean(formik.errors?.client_secret)}
          />

          <TextField
            margin="normal"
            size="small"
            fullWidth
            name="username"
            type="text"
            label="Usuario"
            sx={{ my: 1.5 }}

            value={formik.values?.username || ''}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            helperText={formik.touched?.username && formik.errors?.username}
            error={formik.touched?.username && Boolean(formik.errors.username)}
          />

          <TextField
            margin="normal"
            size="small"
            fullWidth
            name="password"
            type="password"
            label="Password"
            sx={{ my: 1.5 }}

            value={formik.values?.password || ''}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            helperText={formik.touched?.password && formik.errors?.password}
            error={formik.touched?.password && Boolean(formik.errors.password)}
          />

          <TextField
            margin="normal"
            size="small"
            fullWidth
            name="scope"
            type="text"
            label="SCOPE"
            sx={{ my: 1.5 }}

            value={formik.values?.scope || ''}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            helperText={formik.touched?.scope && formik.errors?.scope}
            error={formik.touched?.scope && Boolean(formik.errors.scope)}
          />

          <FormControl fullWidth size="small" sx={{ my: 1.5 }}>
            <InputLabel id="demo-simple-select-label">Tipo de ambiente</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={formik.values.env}
              // value={dataCliente.env}
              label="Tipo de ambiente"
              // onChange={(e: SelectChangeEvent): void => SelectHandleChange(e)}
              error={formik.touched.env && Boolean(formik.errors.env)}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              name="env"
            >
              <MenuItem value={"DEV"}>DESARROLLO</MenuItem>
              <MenuItem value={"PRO"}>PRODUCCION</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="normal"
            size="small"
            fullWidth
            name="grant_type"
            type="text"
            label="Grant Type"
            sx={{ my: 1.5 }}

            value={formik.values?.grant_type || ''}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            helperText={formik.touched?.grant_type && formik.errors?.grant_type}
            error={formik.touched?.grant_type && Boolean(formik.errors.grant_type)}
          />



          <TextField
            margin="normal"
            size="small"
            fullWidth
            name="clavecertificado"
            type="password"
            label="Clave del certificado"
            sx={{ my: 1.5 }}

            value={formik.values?.clavecertificado || ''}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            helperText={formik.touched?.clavecertificado && formik.errors?.clavecertificado}
            error={formik.touched?.clavecertificado && Boolean(formik.errors.clavecertificado)}
          />

        </Box>

        <TextField
          margin="normal"
          size="small"
          fullWidth
          name="file"
          type="file"
          label="Certificado .PFX"
          sx={{ my: 1.5 }}
          onChange={handleFileChange}
          InputLabelProps={{
            shrink: true,
          }}
          inputProps={{ accept: ".pfx" }}

        />

        <TextField
          margin="normal"
          size="small"
          fullWidth
          name="endpointurl"
          type="text"
          label="Endpoint"
          sx={{ my: 1.5 }}

          value={formik.values?.endpointurl || ''}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          helperText={formik.touched?.endpointurl && formik.errors?.endpointurl}
          error={formik.touched?.endpointurl && Boolean(formik.errors.endpointurl)}
        />
        <TextField
          margin="normal"
          size="small"
          fullWidth
          name="urlsend"
          type="text"
          label="Url de envío"
          sx={{ my: 1.5 }}

          value={formik.values?.urlsend || ''}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          helperText={formik.touched?.urlsend && formik.errors?.urlsend}
          error={formik.touched?.urlsend && Boolean(formik.errors.urlsend)}
        />

        <TextField
          margin="normal"
          size="small"
          fullWidth
          name="urlconsult"
          type="text"
          label="Url de consulta"
          sx={{ my: 1.5 }}

          value={formik.values?.urlconsult || ''}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          helperText={formik.touched?.urlconsult && formik.errors?.urlconsult}
          error={formik.touched?.urlconsult && Boolean(formik.errors.urlconsult)}
        />


        <Button type='submit' color='success' variant='contained' sx={{ width: '50%', alignItems: 'start', display: 'inline-block' }}>
          Guardar
        </Button>
      </Box>
    </>
  );
}

export default ModalSunat