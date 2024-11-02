import { Box, Button,  IconButton,  List, ListItem,  styled, TextField, Typography } from '@mui/material';
import {  useState } from 'react'


import { useFormik } from 'formik';
import clienteAxios from '../../config/axios';



import { PuntoEmisionSchema } from '../../utils/validateForm';
import { useNotification } from '../../context/notification.context';

import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { puntoEmision } from '../../types/puntoemision.interface';
import SearchUser from '../User/SearchUser';
import { User } from '../../types/user.interface';
import { DialogComponentCustom } from '..';



const PuntoEmisionInitialValues: puntoEmision = {
  codigo: '',
  nombre: '',
  codLocal: '0000',
  direccion: '',
  id: 0,
  ruc: '',
  users: []
}

interface PuntoEmisionFormProps {
  initialValue?: puntoEmision;
  onConfirm: (puntos: any) => void;
  edit: boolean,
}

type ModalsProps = {
  open: boolean;
  form: React.ReactNode | null;
  title: string;
};

const ModalPuntoEmision = ({ initialValue, onConfirm, edit }: PuntoEmisionFormProps) => {


  const { getError } = useNotification()

  const [modalsForm, setModalsForms] = useState<ModalsProps>({
    open: false,
    form: null,
    title: "",
  });

  const token = localStorage.getItem('AUTH_TOKEN');

  const [userList, setUserList] = useState<User[]>( initialValue?.users||[])


  const storePuntoEmision = async (values: puntoEmision) => {


    try {
      const { data, status } = await clienteAxios.post('/api/puntoemision', {
        codigo:values.codigo,
        nombre:values.nombre,
        codLocal:values.codLocal,
        direccion:values.direccion,
        users:userList,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      //  console.log(data)
      if (status === 200) {
        onConfirm(data.puntoemision);
      }
    }
    catch (error) {
      // console.log(error)

      getError(error?.response?.data?.message)


    }



  }

  const updatePuntoEmision = async (values: puntoEmision) => {
    try {
      const { data, status } = await clienteAxios.put(`/api/puntoemision/${values.id}`, {
        codigo:values.codigo,
        nombre:values.nombre,
        codLocal:values.codLocal,
        direccion:values.direccion,
        users:userList,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      // console.log(data)
      if (status === 200) {
        onConfirm(data.puntoemision);
      }
    }
    catch (error) {
      console.log(error)
    }
    // onConfirm();
  }



  const formik = useFormik({
    initialValues: initialValue || PuntoEmisionInitialValues,
    validationSchema: PuntoEmisionSchema,
    onSubmit: (values) => {

      
      const newValues:puntoEmision = {
        ...values,
        direccion:values.direccion.toUpperCase(),
        nombre:values.nombre.toUpperCase()
      }
      
      if (edit) {
        updatePuntoEmision(newValues)
      } else {
        storePuntoEmision(newValues)
      }

    },
  });

  const StyledListItem = styled(ListItem)(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: '8px',
    marginBottom: theme.spacing(1),
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[1],
    textAlign:'center'
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

  const handleConfirm = (user: User): void => {
    const userFound = userList.find(item => item.id===user.id);

    if(userFound){
      getError('Ya existe el Usuario en la Lista')
      return;
    }
    setUserList( (prev)=>[...prev,user])
    handleCloseModalForm()
  }

  const handleDelete = (id:number):void =>{
    

    const usersUpdate = userList.filter(item=>item.id!==id);

    setUserList(usersUpdate)

    handleCloseModalForm()
  }


  return (
    <>

      <Box component={'form'} onSubmit={formik.handleSubmit}>
        <Box display={'flex'} flexDirection={{ xs: 'column', md: 'row' }} alignItems={'center'} columnGap={1}>
          <TextField
            margin="normal"
            size="small"
            fullWidth
            name="codigo"
            type="text"
            label="Código"
            value={formik.values?.codigo?.toUpperCase() || ''}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            helperText={formik.touched.codigo && formik.errors.codigo}
            error={formik.touched.codigo && Boolean(formik.errors.codigo)}
            inputProps={{ style: { textTransform: "uppercase" } }}
            disabled={edit}
          />
          <TextField
            margin="normal"
            size="small"
            fullWidth
            name="codLocal"
            type="text"
            label="Código Local"
            value={formik.values?.codLocal || ''}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            helperText={formik.touched.codLocal && formik.errors.codLocal}
            error={formik.touched.codLocal && Boolean(formik.errors.codLocal)}
            inputProps={{ style: { textTransform: "uppercase" } }}
          />

        </Box>
        <TextField
          margin="normal"
          size="small"
          fullWidth
          name="nombre"
          type="text"
          label="Nombre"
          value={formik.values?.nombre?.toUpperCase() || ''}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          helperText={formik.touched.nombre && formik.errors.nombre}
          error={formik.touched.nombre && Boolean(formik.errors.nombre)}
          inputProps={{ style: { textTransform: "uppercase" } }}
        />
        <TextField
          margin="normal"
          size="small"
          fullWidth
          name="direccion"
          type="text"
          label="Dirección"

          value={formik.values.direccion.toUpperCase() || ''}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          helperText={formik.touched.direccion && formik.errors.direccion}
          error={formik.touched.direccion && Boolean(formik.errors.direccion)}
          inputProps={{ style: { textTransform: "uppercase" } }}
        />
        <Box display={'flex'} flexDirection={'column'} alignItems={'center'} mb={2} >
          <Typography>Usuarios</Typography>
          <StyledSearchButton sx={{ width: '50%' }} variant="contained" color="warning" size='small'
            onClick={() => {
              handleOpenModalForm(
                <SearchUser onCheck={handleConfirm} />,
                'Buscar Usuario'
              )
            }}
          >
            Buscar
          </StyledSearchButton>
          <List sx={{width:'80%'}}>
            {userList?.map((user) => (
              <StyledListItem key={user.id}>
                <Box  display="flex" justifyContent="space-between" width='100%' alignItems={'center'}>
                  <Typography variant="body2" color="textSecondary">
                    ID: {user.id}
                  </Typography>
                  <Typography variant="h6">{user.name}</Typography>
                  <IconButton onClick={()=>handleDelete(user.id)}>
                    <DeleteForeverIcon color='error' />
                  </IconButton>
                </Box>
              </StyledListItem>
            ))}
          </List>

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

export default ModalPuntoEmision