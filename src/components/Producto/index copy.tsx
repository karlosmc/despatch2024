// import { Box, Button, Container, FormControl, InputLabel, Select, TextField } from '@mui/material';
// import React, { SetStateAction, useEffect, useState } from 'react'
// import { MenuItem } from '@mui/material';
// import { ProductoSchema } from '../../utils/validateForm';

// import { Producto } from '../../types/producto.interface'
// import { useFormik } from 'formik';
// import clienteAxios from '../../config/axios';
// import { update } from '@react-spring/web';

// type UnidadMedidaType = {
//   codigo: string;
//   descripcion: string
// }
// const _UNIDAD_MEDIDA: UnidadMedidaType[] = [
//   {
//     codigo: 'NIU',
//     descripcion: 'NIU:UNIDAD (BIENES)',
//   },
//   {
//     codigo: 'ZZ',
//     descripcion: 'ZZ: UNIDAD (SERVICIOS)',
//   }
//   ,
//   {
//     codigo: 'KGM',
//     descripcion: 'KGM:UNIDAD (SERVICIOS)',
//   },
//   {
//     codigo: 'GLL',
//     descripcion: 'GLL:US GALON (3,7843 L)',
//   }
// ]


// const ProductoInitialValues: Producto = {
//   codigo: '',
//   descripcion: '',
//   fav: false,
//   unidad: 'NIU',
//   codProdSunat: '',
//   id: 0
// }

// interface ProductoFormProps {
//   initialValue?: Producto;
//   closeModal:(modalName:string)=>void;
//   edit:Boolean,
// }

// const ModalProducto = ({ initialValue,closeModal,edit }: ProductoFormProps) => {

//   const [fav, setFav] = useState<boolean>(initialValue?.fav||false);

//   const token = localStorage.getItem('AUTH_TOKEN');

//   const storeProducto = async(values:Producto)=>{

    
//     try {
//       const { data } = await clienteAxios.post('/api/productos', {
//         codigo: values.codigo,
//         descripcion: values.descripcion,
//         fav: values.fav,
//         unidad: values.unidad,
//         codProdSunat: values.codProdSunat,
       
//       }, {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       })
//     }
//     catch(error){
//       console.log(error)
//     }

//   }

//   const updateProducto = async(values:Producto)=>{

    
//     try {
//       const { data } = await clienteAxios.put(`/api/productos/${values.id}`, {
//         descripcion: values.descripcion,
//         fav: values.fav,
//         unidad: values.unidad,
//         codProdSunat: values.codProdSunat||'',
//       }, {
//         headers: {
//           Authorization: `Bearer ${token}`
//         }
//       })
//     }
//     catch(error){
//       console.log(error)
//     }

//   }

//   const formik = useFormik({
//     initialValues: initialValue||ProductoInitialValues,
//     validationSchema: ProductoSchema,
//     onSubmit: (values) => {
      
//       if(edit){
//         updateProducto(values)
//       }else{
//         storeProducto(values)
//       }
//       closeModal('prueba')
//     },
//   });


//   useEffect(() => {
//     formik.setFieldValue('fav', fav)
//   }, [fav])

//   return (

//     <Box component='form' onSubmit={formik.handleSubmit} alignItems={'center'} >

//       <TextField
//         margin='normal'
//         fullWidth
//         label='Código'
//         size='small'
//         value={formik.values.codigo}
//         error={formik.touched.codigo && Boolean(formik.errors.codigo)}
//         onBlur={formik.handleBlur}
//         onChange={formik.handleChange}
//         name="codigo"
//         helperText={formik.touched.codigo && formik.errors.codigo}
//         disabled={Boolean(edit)}
//       />
//       <TextField
//         margin='normal'
//         fullWidth
//         label='Código Sunat'
//         size='small'
//         value={formik.values.codProdSunat}
//         error={formik.touched.codProdSunat && Boolean(formik.errors.codProdSunat)}
//         onBlur={formik.handleBlur}
//         onChange={formik.handleChange}
//         name="codProdSunat"
//         helperText={formik.touched.codProdSunat && formik.errors.codProdSunat}
//       />
//       <TextField
//         margin='normal'
//         fullWidth
//         label='Descripción'
//         size='small'
//         multiline
//         rows={2}
//         value={formik.values.descripcion}
//         error={formik.touched.descripcion && Boolean(formik.errors.descripcion)}
//         onBlur={formik.handleBlur}
//         onChange={formik.handleChange}
//         name="descripcion"
//         helperText={formik.touched.descripcion && formik.errors.descripcion}
//       />
//       <FormControl fullWidth size='small' sx={{ mt: 2 }}>
//         <InputLabel>Unidad de Medida</InputLabel>

//         <Select
//           label='Unidad de Medida'
//           value={formik.values.unidad}
//           error={formik.touched.unidad && Boolean(formik.errors.unidad)}
//           onBlur={formik.handleBlur}
//           onChange={formik.handleChange}
//           name="unidad"
//         >
//           {
//             _UNIDAD_MEDIDA.map(item => (
//               <MenuItem key={item.codigo} value={item.codigo}>{item.descripcion}</MenuItem>
//             ))
//           }

//         </Select>
//       </FormControl>
//       <Box textAlign={'center'}>

//         <Button  onClick={() => setFav(!fav)} variant={!fav ? 'outlined' : 'contained'} color='warning' sx={{ display: 'inline-block', my: 2, width: '80%', letterSpacing: 20, fontWeight: 600 }}>
//           FAVORITO
//         </Button>
//       </Box>
//       <Button type='submit' color='success' variant='outlined' sx={{ width: '50%', alignItems: 'start', display: 'inline-block' }}>
//         Guardar
//       </Button>

//     </Box>



//   )
// }

// export default ModalProducto