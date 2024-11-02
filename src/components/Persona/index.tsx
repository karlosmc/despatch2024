import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { useEffect, useState } from 'react'


import { useFormik } from 'formik';
import clienteAxios from '../../config/axios';


import { persona, searchPersona } from '../../types/persona.interface';
import { PersonaSchema } from '../../utils/validateForm';
import { useNotification } from '../../context/notification.context';
import ButtonSearch from '../ButtonSearch';



const PersonaInitialValues: persona = {
  rznSocial: '',
  numDoc: '',
  email: '',
  telephone: '',
  tipoDoc: '6',
  fav: false,
  isCompany: false,
  id: 0,
  nombreCorto: ''
}

interface PersonaFormProps {
  initialValue?: persona;
  onConfirm: (puntos: any) => void;
  edit: boolean,
}

const ModalPersona = ({ initialValue, onConfirm, edit }: PersonaFormProps) => {


  const { getError } = useNotification()

  const [fav, setFav] = useState<boolean>(initialValue?.fav || false);

  const token = localStorage.getItem('AUTH_TOKEN');

  const handleSearch = (searchPerson: searchPersona): void => {

    if (!searchPerson){
      getError('Tiempo de espera terminado, intentelo otra vez o verifica el número')
      return;
    }
    if (searchPerson.status === 'error') {
      getError(searchPerson.message)
      return;
    }
    formik.setFieldValue('rznSocial', searchPerson.persona.nombreRazonSocial)
  }


  const storePersona = async (values: persona) => {


    try {
      const { data, status } = await clienteAxios.post('/api/clientes', {
        numDoc: values.numDoc,
        rznSocial: values.rznSocial,
        fav: values.fav,
        isCompany: values.isCompany,
        email: values.email,
        nombreCorto: values.nombreCorto,
        telephone: values.telephone,
        tipoDoc: values.tipoDoc,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      //  console.log(data)
      if (status === 200) {
        onConfirm(data.persona);
      }
    }
    catch (error) {
      // console.log(error)

      getError(error?.response?.data?.message)


    }



  }

  const updatePersona = async (values: persona) => {
    try {
      const { data, status } = await clienteAxios.put(`/api/clientes/${values.id}`, {
        numDoc: values.numDoc,
        rznSocial: values.rznSocial,
        fav: values.fav,
        email: values.email,
        nombreCorto: values.nombreCorto,
        telephone: values.telephone,
        tipoDoc: values.tipoDoc,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      // console.log(data)
      if (status === 200) {
        onConfirm(data.cliente);
      }
    }
    catch (error) {
      console.log(error)
    }
    // onConfirm();
  }

  const formik = useFormik({
    initialValues: initialValue || PersonaInitialValues,
    validationSchema: PersonaSchema,
    onSubmit: (values) => {

      const newValues:persona={
        ...values,
        rznSocial:values.rznSocial.toUpperCase(),
        nombreCorto:values?.nombreCorto?.toUpperCase()||'',
      }

      if (edit) {
        updatePersona(newValues)
      } else {
        storePersona(newValues)
      }

    },
  });

  useEffect(() => {
    formik.setFieldValue('fav', fav)
  }, [fav])

  return (
    <>

      <Box component={'form'} onSubmit={formik.handleSubmit}>
        <Box display={'flex'} flexDirection={{ xs: 'column', md: 'row' }} alignItems={'center'} gap={1}>
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
              readOnly={edit}
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
            type="text"
            label="Número de documento"
            sx={{ my: 1.5 }}
            value={formik.values.numDoc}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            helperText={formik.touched.numDoc && formik.errors.numDoc}
            error={formik.touched.numDoc && Boolean(formik.errors.numDoc)}
            disabled={edit}
          />
          <ButtonSearch type={formik.values.tipoDoc} valor={formik.values.numDoc} onSearch={handleSearch} />
        </Box>

        <TextField
          margin="normal"
          size="small"
          fullWidth
          name="rznSocial"
          type="text"
          label="Razón social"
          sx={{ my: 1.5 }}

          value={formik.values?.rznSocial?.toUpperCase()||''}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          helperText={formik.touched.rznSocial && formik.errors.rznSocial}
          error={formik.touched.rznSocial && Boolean(formik.errors.rznSocial)}
          
        />
        <TextField
          margin="normal"
          size="small"
          fullWidth
          name="email"
          type="text"
          label="Email"
          sx={{ my: 1.5 }}

          value={formik.values?.email || ''}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          helperText={formik.touched.email && formik.errors.email}
          error={formik.touched.email && Boolean(formik.errors.email)}
          inputProps={{ style: { textTransform: "uppercase" } }}
        />

        <Box display={'flex'} flexDirection={{ xs: 'column', md: 'row' }} alignItems={'center'} gap={1}>

          <TextField
            margin="normal"
            size="small"
            fullWidth
            name="telephone"
            type="text"
            label="Teléfono"
            sx={{ my: 1.5 }}

            value={formik.values?.telephone || ''}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            helperText={formik.touched.telephone && formik.errors.telephone}
            error={formik.touched.telephone && Boolean(formik.errors.telephone)}
            inputProps={{ style: { textTransform: "uppercase" } }}
          />

          <TextField
            margin="normal"
            size="small"
            fullWidth
            name="nombreCorto"
            type="text"
            label="Nombre corto de la persona"
            sx={{ my: 1.5 }}

            value={formik.values?.nombreCorto?.toUpperCase() || ''}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            helperText={formik.touched.nombreCorto && formik.errors.nombreCorto}
            error={formik.touched.nombreCorto && Boolean(formik.errors.nombreCorto)}
            inputProps={{ style: { textTransform: "uppercase" } }}
          />
        </Box>

        <Box textAlign={'center'}>
          <Button onClick={() => setFav(!fav)} variant={!fav ? 'outlined' : 'contained'} color='warning' sx={{ display: 'inline-block', my: 2, width: '80%', letterSpacing: 20, fontWeight: 600 }}>
            FAVORITO
          </Button>
        </Box>


        <Button type='submit' color='success' variant='contained' sx={{ width: '50%', alignItems: 'start', display: 'inline-block' }}>
          Guardar
        </Button>
      </Box>
    </>
  );
}

export default ModalPersona