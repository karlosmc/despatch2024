import { Box, Button, CircularProgress, FormControl, IconButton, InputLabel, List, ListItem, MenuItem, Paper, Select, styled, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react'


import { useFormik } from 'formik';
import clienteAxios from '../../config/axios';



import { NumeracionSchema, } from '../../utils/validateForm';
import { useNotification } from '../../context/notification.context';

import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { puntoEmision } from '../../types/puntoemision.interface';

import { DialogComponentCustom } from '..';
import { numeracion } from '../../types/numeracion.interface';
import { EnvioVehiculo } from '../../types/guias/guiaremision.interface';
import SearchVehiculo from '../Vehiculo/SearchVehiculo';
import { vehiculo } from '../../types/vehiculo.interface';



const NumeracionInitialValues: numeracion = {
  id: 0,
  nombre: '',
  serie: '',
  numeroActual: 0,
  id_puntoemision: 0,
  primario: null,
  secundario: [],
  // puntoemision: null,
}

interface NumeracionFormProps {
  initialValue?: numeracion;
  onConfirm: (puntos: any) => void;
  edit: boolean,
}

type ModalsProps = {
  open: boolean;
  form: React.ReactNode | null;
  title: string;
};

const ModalNumeracion = ({ initialValue, onConfirm, edit }: NumeracionFormProps) => {

  const { getError } = useNotification()
  const [modalsForm, setModalsForms] = useState<ModalsProps>({
    open: false,
    form: null,
    title: "",
  });

  const [puntosEmision, setPuntosEmision] = useState<puntoEmision[]>([])

  const [primario, setPrimario] = useState<EnvioVehiculo>(initialValue?.primario || null)

  const [loading, setLoading] = useState<boolean>(true)

  const token = localStorage.getItem('AUTH_TOKEN');


  const [secundarios, setSecundarios] = useState<EnvioVehiculo[]>(initialValue?.secundario || []);



  const storeNumeracion = async (values: numeracion) => {
    try {
      const { data, status } = await clienteAxios.post('/api/numeracion', {
        nombre: values.nombre,
        numeroActual: values.numeroActual,
        id_puntoemision: values.id_puntoemision,
        primario: values.primario?.id|| null,
        secundarios: secundarios.length>0?secundarios[0].id:null,
        serie: values.serie
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      //  console.log(data)
      if (status === 200) {
        onConfirm(data.numeracion);
      }
    }
    catch (error) {
      getError(error?.response?.data?.message)
    }
  }

  const updateNumeracion = async (values: numeracion) => {

    // console.log(values);
    
    try {
      const { data, status } = await clienteAxios.put(`/api/numeracion/${values.id}`, {
        nombre: values.nombre,
        numeroActual: values.numeroActual,
        id_puntoemision: values.id_puntoemision,
        primario: values.primario?.id|| null,
        secundarios: secundarios.length>0?secundarios[0].id:null,
        serie: values.serie
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      // console.log(data)
      if (status === 200) {
        onConfirm(data.numeracion);
      }
    }
    catch (error) {
      console.log(error)
    }
    // onConfirm();
  }

  const formik = useFormik({
    initialValues: initialValue || NumeracionInitialValues,
    validationSchema: NumeracionSchema,
    onSubmit: (values) => {

      const newValues: numeracion={
        ...values,
        nombre:values.nombre.toUpperCase(),
        serie:values.serie.toUpperCase(),
      }
      if (edit) {
        updateNumeracion(newValues)
      } else {
        storeNumeracion(newValues)
      }
    },
  });


  const getPuntoEmision = async () => {
    try {
      const { data, status } = await clienteAxios('/api/puntoemision', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      //  console.log(data)
      if (status === 200) {
        setLoading(false)
        setPuntosEmision(data.data)
      }
    }
    catch (error) {
      getError(error?.response?.data?.message)
    }
  }

  const StyledListItem = styled(ListItem)(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: '8px',
    marginBottom: theme.spacing(1),
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[1],
    textAlign: 'center'
  }));

  const StyledSearchButton = styled(Button)(({ }) => ({
    backgroundColor: '#00BC8C',
    color: 'white',
    '&:hover': {
      backgroundColor: '#00A077',
    }
  }))

  const handleOpenModalForm = (form: React.ReactNode, title: string) => {
    setModalsForms({ open: true, form, title });
  };

  const handleCloseModalForm = () => {
    // Cierra el modal en la posición especificada
    setModalsForms((prev) => ({ ...prev, open: false }));
  };

  const handleConfirm = (vehiculo: vehiculo): void => {

    if(primario && secundarios.length===1){
      getError('Ya existe 1 vehiculos secundario para esta serie')
      return;
    }
    if(primario){
      if(primario.id === vehiculo.id){
        getError('Ya existe la placa como vehiculo primario')
        return;
      }
      const vehiculoFound= secundarios.find(item =>item.id === vehiculo.id)
      if(vehiculoFound){
        getError('Ya existe el vehiculo secundario en la lista')
        return;
      }else{
        setSecundarios((prev)=>[...prev,vehiculo])
      }
    }else{
      setPrimario(vehiculo)
    }
    // const userFound = userList.find(item => item.id === user.id);

    // if (userFound) {
    //   getError('Ya existe el Usuario en la Lista')
    //   return;
    // }
    // setUserList((prev) => [...prev, user])
    handleCloseModalForm()
  }

  const handleDeleteSecundario = (id: number): void => {

    const vehiculoUpdate = secundarios.filter(item => item.id !== id);

    setSecundarios(vehiculoUpdate)

    
  }
  const handleDelete = (): void => {

    // const usersUpdate = userList.filter(item => item.id !== id);

    // setUserList(usersUpdate)

    // handleCloseModalForm()

    setPrimario(null)
    setSecundarios([])
  }

  useEffect(() => {
    getPuntoEmision()
  }, [])

  if (loading) return (
    <Box display={'flex'} justifyContent={'center'} alignItems={'center'}>
      <CircularProgress size={40} />
    </Box>
  )

  return (
    <>

      <Box component={'form'} onSubmit={formik.handleSubmit}>
        <TextField
          margin="normal"
          size="small"
          fullWidth
          name="nombre"
          type="text"
          label="Nombre"
          value={formik.values?.nombre.toUpperCase() || ''}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          helperText={formik.touched.nombre && formik.errors.nombre}
          error={formik.touched.nombre && Boolean(formik.errors.nombre)}
          inputProps={{ style: { textTransform: "uppercase" } }}
          disabled={edit}
        />
        <Box display={'flex'} flexDirection={{ xs: 'column', md: 'row' }} alignItems={'center'} columnGap={1}>
          <TextField
            margin="normal"
            size="small"
            fullWidth
            name="serie"
            type="text"
            label="Serie"
            value={formik.values?.serie?.toUpperCase() || ''}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            helperText={formik.touched.serie && formik.errors.serie}
            error={formik.touched.serie && Boolean(formik.errors.serie)}
            inputProps={{ style: { textTransform: "uppercase" } }}
          />

          <TextField
            margin="normal"
            size="small"
            fullWidth
            name="numeroActual"
            type="number"
            label="Numero actual"
            value={formik.values?.numeroActual}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            helperText={formik.touched.numeroActual && formik.errors.numeroActual}
            error={formik.touched.numeroActual && Boolean(formik.errors.numeroActual)}
          />
        </Box>

        <FormControl fullWidth size="small">
          <InputLabel id="demo-simple-select-label">Tipo de documento</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={formik.values.id_puntoemision}
            // value={dataCliente.tipoDoc}
            label="Tipo de documento"
            // onChange={(e: SelectChangeEvent): void => SelectHandleChange(e)}
            error={formik.touched.id_puntoemision && Boolean(formik.errors.id_puntoemision)}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            name="id_puntoemision"
            readOnly={edit}
          >
            <MenuItem value={0}>
              ...Elija un punto de emisión...
            </MenuItem>

            {
              puntosEmision.map(puntos => (
                <MenuItem key={puntos.id} value={puntos.id}>
                  {puntos.nombre}
                </MenuItem>
              ))

            }

          </Select>
        </FormControl>


        <Box display={'flex'} flexDirection={'column'} alignItems={'center'} mb={2} >
          <Typography>Placas</Typography>
          <StyledSearchButton sx={{ width: '50%' }} variant="contained" color="warning" size='small'
            onClick={() => {
              handleOpenModalForm(
                <SearchVehiculo onCheck={handleConfirm} />,
                'Buscar Vehiculo'
              )
            }}
          >
            {primario===null? 'Buscar Primario':'Buscar Secundario'}
          </StyledSearchButton>

          <Box display={'flex'} flexDirection={'row'} justifyContent={'space-between'} columnGap={1} mt={2}>
            <Box sx={{ width: 200,padding:1 }} display={'flex'} flexDirection={'column'} component={Paper}>
              <Typography textAlign={'center'}>Primario</Typography>
              {
                primario &&
                <List sx={{ width: '100%' }}>
                  <StyledListItem key={primario?.id}>
                    <Box display="flex" justifyContent="space-between" width='100%' alignItems={'center'}>
                      <Typography variant="body2" color="textSecondary">
                        ID: {primario.id}
                      </Typography>
                      <Typography variant="h6">{primario?.placa}</Typography>
                      <IconButton onClick={handleDelete}>
                        <DeleteForeverIcon color='error' />
                      </IconButton>
                    </Box>
                  </StyledListItem>
                </List>
              }

            </Box>
            <Box sx={{ width: 200, padding:1 }} component={Paper} display={'flex'} flexDirection={'column'}>
              <Typography textAlign={'center'}>Secundarios</Typography>
              <List sx={{ width: '100%' }}>
                {secundarios?.map((secundario) => (
                  <StyledListItem key={secundario.id}>
                    <Box display="flex" justifyContent="space-between" width='100%' alignItems={'center'}>
                      <Typography variant="body2" color="textSecondary">
                        ID: {secundario.id}
                      </Typography>
                      <Typography variant="h6">{secundario.placa}</Typography>
                      <IconButton onClick={() => handleDeleteSecundario(secundario.id)}>
                        <DeleteForeverIcon color='error' />
                      </IconButton>
                    </Box>
                  </StyledListItem>
                ))}
              </List>
            </Box>
          </Box>


        </Box>

        {/* 
        <Box textAlign={'center'}>
          <Button onClick={() => setFav(!fav)} variant={!fav ? 'outlined' : 'contained'} color='warning' sx={{ display: 'inline-block', my: 2, width: '80%', letterSpacing: 20, fontWeight: 600 }}>
            FAVORITO
          </Button>
        </Box> */}


        <Button type='submit' color='success' variant='contained' sx={{ width: '50%', alignItems: 'start', display: 'inline-block' }}>
          Guardar
        </Button>
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
      </Box>
    </>
  );
}

export default ModalNumeracion