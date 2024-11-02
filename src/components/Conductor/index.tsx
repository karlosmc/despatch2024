import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { useEffect, useState } from 'react'


import { useFormik } from 'formik';
import clienteAxios from '../../config/axios';


import { ConductorSchema } from '../../utils/validateForm';
import { useNotification } from '../../context/notification.context';
import { conductor } from '../../types/conductor.interface';
import ButtonSearch from '../ButtonSearch';
import { searchPersona } from '../../types/persona.interface';



const ConductorInitialValues: conductor = {
  nroDoc: '',
  nombres: '',
  apellidos: '',
  licencia: '',
  nombreCorto: '',
  tipoDoc: '1',
  fav: false,
  isCompany: false,
  id: 0,
}

interface ConductorFormProps {
  initialValue?: conductor;
  onConfirm: (conductor: conductor) => void;
  edit: Boolean,
}

const ModalConductor = ({ initialValue, onConfirm, edit }: ConductorFormProps) => {

  // console.log(initialValue)
  const { getError } = useNotification()

  const [fav, setFav] = useState<boolean>(initialValue?.fav || false);
  const [isCompany, setIsCompany] = useState<boolean>(initialValue?.isCompany || false);

  const token = localStorage.getItem('AUTH_TOKEN');

  const storeConductor = async (values: conductor) => {


    try {
      const { data, status } = await clienteAxios.post('/api/conductor', {
        nroDoc: values.nroDoc,
        nombres: values.nombres,
        fav: values.fav,
        isCompany: values.isCompany,
        apellidos: values.apellidos,
        nombreCorto: values.nombreCorto,
        licencia: values.licencia,
        tipoDoc: values.tipoDoc,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      //  console.log(data)
      if (status === 200) {
        onConfirm(data.conductor);
      }
    }
    catch (error) {
      // console.log(error)

      getError(error?.response?.data?.message)


    }



  }

  const updateConductor = async (values: conductor) => {
    try {
      const { data, status } = await clienteAxios.put(`/api/conductor/${values.id}`, {

        nroDoc: values.nroDoc,
        nombres: values.nombres,
        fav: values.fav,
        isCompany: values.isCompany,
        apellidos: values.apellidos,
        nombreCorto: values.nombreCorto,
        licencia: values.licencia,
        tipoDoc: values.tipoDoc,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      // console.log(data)
      if (status === 200) {
        onConfirm(data.conductor);
      }
    }
    catch (error) {
      console.log(error)
    }
    // onConfirm();
  }




  const formik = useFormik({
    initialValues: initialValue || ConductorInitialValues,
    validationSchema: ConductorSchema,
    onSubmit: (values) => {
      const newValues: conductor = {
        ...values,
        apellidos: values.apellidos.toUpperCase(),
        nombres: values.nombres.toUpperCase(),
        nombreCorto: values?.nombreCorto?.toUpperCase() || '',
        licencia: values.licencia.toUpperCase(),
      }

      if (edit) {
        updateConductor(newValues)
      } else {
        storeConductor(newValues)
      }

    },
  });

  const handleSearch = (searchPerson: searchPersona): void => {

    if (!searchPerson) {
      getError('Tiempo de espera terminado, intentelo otra vez o verifica el número')
      return;
    }
    if (searchPerson.status === 'error') {
      getError(searchPerson.message)
      return;
    }

    if (formik.values.tipoDoc === '6') {
      formik.setFieldValue('apellidos', searchPerson.persona.nombreRazonSocial)
      formik.setFieldValue('nombres', '-')
    } else {

      formik.setFieldValue('apellidos', searchPerson.persona.apellidos)
      formik.setFieldValue('nombres', searchPerson.persona.nombres)
    }
  }

  useEffect(() => {
    formik.setFieldValue('fav', fav)
  }, [fav])
  useEffect(() => {
    formik.setFieldValue('isCompany', isCompany)
  }, [isCompany])

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
              readOnly={Boolean(edit)}
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
            name="nroDoc"
            type="text"
            label="Número de documento"
            sx={{ my: 1.5 }}
            value={formik.values.nroDoc}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            helperText={formik.touched.nroDoc && formik.errors.nroDoc}
            error={formik.touched.nroDoc && Boolean(formik.errors.nroDoc)}
            disabled={Boolean(edit)}
          />
          <ButtonSearch type={formik.values.tipoDoc} valor={formik.values.nroDoc} onSearch={handleSearch} />
        </Box>

        <TextField
          margin="normal"
          size="small"
          fullWidth
          name="nombres"
          type="text"
          label="Nombres"
          sx={{ my: 1.5 }}

          value={formik.values?.nombres.toUpperCase()}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          helperText={formik.touched?.nombres && formik.errors?.nombres}
          error={formik.touched?.nombres && Boolean(formik.errors?.nombres)}
          inputProps={{ style: { textTransform: "uppercase" } }}
        />
        <TextField
          margin="normal"
          size="small"
          fullWidth
          name="apellidos"
          type="text"
          label="Apellidos"
          sx={{ my: 1.5 }}

          value={formik.values?.apellidos.toUpperCase()}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          helperText={formik.touched.apellidos && formik.errors.apellidos}
          error={formik.touched.apellidos && Boolean(formik.errors.apellidos)}
          inputProps={{ style: { textTransform: "uppercase" } }}
        />

        <Box display={'flex'} flexDirection={{ xs: 'column', md: 'row' }} alignItems={'center'} gap={1}>

          <TextField
            margin="normal"
            size="small"
            fullWidth
            name="licencia"
            type="text"
            label="Nro. Licencia"
            sx={{ my: 1.5 }}

            value={formik.values?.licencia?.toUpperCase()}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            helperText={formik.touched.licencia && formik.errors.licencia}
            error={formik.touched.licencia && Boolean(formik.errors.licencia)}
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
            value={formik.values?.nombreCorto?.toUpperCase()}
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
            Conductor de la empresa
          </Button>
        </Box>

        <Button type='submit' color='success' variant='contained' sx={{ width: '50%', alignItems: 'start', display: 'inline-block' }}>
          Guardar
        </Button>
      </Box>
    </>
  );
}

export default ModalConductor