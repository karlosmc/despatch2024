import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { useEffect, useState } from 'react'


import { useFormik } from 'formik';
import clienteAxios from '../../config/axios';


import {  TransportistaSchema } from '../../utils/validateForm';
import { useNotification } from '../../context/notification.context';

import { transportista } from '../../types/transportista.interface';



const TransportistaInitialValues: transportista = {
  numDoc: '',
  nombreCorto: '',
  tipoDoc: '6',
  fav: false,
  rznSocial:'',
  nroMtc:'',
  id: 0,
}

interface TransportistaFormProps {
  initialValue?: transportista;
  onConfirm: (transportista: transportista) => void;
  edit: Boolean,
}

const ModalTransportista = ({ initialValue, onConfirm, edit }: TransportistaFormProps) => {

// console.log(initialValue)
  const { getError } = useNotification()

  const [fav, setFav] = useState<boolean>(initialValue?.fav || false);

  const token = localStorage.getItem('AUTH_TOKEN');

  const storeTransportista = async (values: transportista) => {


    try {
      const { data, status } = await clienteAxios.post('/api/transportistas', {
        numDoc: values.numDoc,
        rznSocial: values.rznSocial,
        fav: values.fav,
        nombreCorto: values.nombreCorto,
        nroMtc: values.nroMtc,
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

  const updateTransportista = async (values: transportista) => {
    try {
      const { data, status } = await clienteAxios.put(`/api/transportistas/${values.id}`, {
        numDoc: values.numDoc,
        rznSocial: values.rznSocial,
        fav: values.fav,
        nombreCorto: values.nombreCorto,
        nroMtc: values.nroMtc,
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
    initialValues: initialValue || TransportistaInitialValues,
    validationSchema: TransportistaSchema,
    onSubmit: (values) => {

      if (edit) {
        updateTransportista(values)
      } else {
        storeTransportista(values)
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
            >
              <MenuItem value={"6"}>RUC</MenuItem>
              
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
          />
        </Box>

        <TextField
          margin="normal"
          size="small"
          fullWidth
          name="rznSocial"
          type="text"
          label="Razón Social"
          sx={{ my: 1.5 }}

          value={formik.values?.rznSocial}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          helperText={formik.touched?.rznSocial && formik.errors?.rznSocial}
          error={formik.touched?.rznSocial && Boolean(formik.errors?.rznSocial)}
        />


        <Box display={'flex'} flexDirection={{ xs: 'column', md: 'row' }} alignItems={'center'} gap={1}>
          <TextField
            margin="normal"
            size="small"
            fullWidth
            name="nroMtc"
            type="text"
            label="Nro. MTC"
            sx={{ my: 1.5 }}

            value={formik.values?.nroMtc||''}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            helperText={formik.touched?.nroMtc && formik.errors?.nroMtc}
            error={formik.touched?.nroMtc && Boolean(formik.errors.nroMtc)}
          />
          <TextField
            margin="normal"
            size="small"
            fullWidth
            name="nombreCorto"
            type="text"
            label="Nombre corto"
            sx={{ my: 1.5 }}
            value={formik.values?.nombreCorto}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            helperText={formik.touched.nombreCorto && formik.errors.nombreCorto}
            error={formik.touched.nombreCorto && Boolean(formik.errors.nombreCorto)}
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

export default ModalTransportista