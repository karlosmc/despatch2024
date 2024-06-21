import { useEffect, useState } from "react";
import { Detail } from "../../types/doc.interface";
import { Box, Button,  TextField,  styled } from "@mui/material";

import { useFormik } from "formik";



import { DetailSchema } from "../../utils/validateGuiaRemision";
import { DialogComponentCustom } from "../../components";
import ModalProducto from "../../components/Producto";
import SearchProducto from "../../components/Producto/SearchProducto";
import { Producto } from "../../types/producto.interface";
import clienteAxios from "../../config/axios";
import { ChipInterface } from "../../types/general.interface";
import ChipFavoritos from "../../components/ChipFavoritos";

interface DetailFormProps {
  onNewDetail: (newDetail: Detail) => void;
}

const DetailValues: Detail = {
  atributos: null,
  cantidad: 1,
  codigo: "",
  codProdSunat: "",
  descripcion: "",
  unidad: "",
};

type ModalsProps = {
  open: boolean;
  form: React.ReactNode | null;
  title: string;
};

const StyledNewButton = styled(Button)(({ }) => ({
  backgroundColor: '#375A7F',
  color: 'white',
  '&:hover': {
    backgroundColor: '#2F4D6C',
  }
}))

const StyledSearchButton = styled(Button)(({ }) => ({
  backgroundColor: '#00BC8C',
  color: 'white',
  '&:hover': {
    backgroundColor: '#00A077',
  }
}))

const DocumentoDetalle = ({ onNewDetail }: DetailFormProps) => {

  const [dataFilter, setDataFilter] = useState<Producto[]>([])

  const [isLoading, setIsLoading] = useState(true)

  const token = localStorage.getItem('AUTH_TOKEN');

  const filterFav = async () => {
    try {

      const { data, status } = await clienteAxios(`/api/productos/buscar?fav=1`, {
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

  const [modalsForm, setModalsForms] = useState<ModalsProps>({
    open: false,
    form: null,
    title: "",
  });

  const handleOpenModalForm = (form: React.ReactNode, title: string) => {
    setModalsForms({ open: true, form, title });
  };

  const handleCloseModalForm = () => {
    // Cierra el modal en la posición especificada
    setModalsForms((prev) => ({ ...prev, open: false }));
  };

  const handleConfirm = (producto: Producto): void => {

    formik.setFieldValue('codigo', producto.codigo)
    formik.setFieldValue('codProdSunat', producto.codProdSunat ? producto.codProdSunat : '')
    formik.setFieldValue('descripcion', producto.descripcion)
    formik.setFieldValue('unidad', producto.unidad)

    handleCloseModalForm()
  }

  const formik = useFormik({
    initialValues: DetailValues,
    validationSchema: DetailSchema,
    onSubmit: (values) => {
      onNewDetail(values);
    },
  });


  const handleCheckProduct = (producto: Producto): void => {

    formik.setFieldValue('codigo', producto.codigo)
    formik.setFieldValue('codProdSunat', producto.codProdSunat)
    formik.setFieldValue('descripcion', producto.descripcion)
    formik.setFieldValue('unidad', producto.unidad)
    handleCloseModalForm()
  }

  const handleSetFavorite = (item: ChipInterface): void => {
    const producto = dataFilter.find(it => it.id === item.id);
    // formik.setFieldValue('tipoDoc', persona.tipoDoc)
    formik.setFieldValue('codigo', producto.codigo)
    formik.setFieldValue('codProdSunat', producto.codProdSunat)
    formik.setFieldValue('descripcion', producto.descripcion)
    formik.setFieldValue('unidad', producto.unidad)
    
  }


  useEffect(()=>{
    filterFav()
  },[])

  return (
    <>
    <ChipFavoritos isLoading={isLoading} items={dataFilter} onPick={handleSetFavorite} title="Productos favoritos" />
      <Box component={'form'} onSubmit={formik.handleSubmit}>
        <Box display={'flex'} flexDirection={'row'} gap={2} my={2}>
          <StyledNewButton fullWidth variant="contained" 
            onClick={() => {
              handleOpenModalForm(
                <ModalProducto initialValue={null} edit={false} onConfirm={handleConfirm} />,
                'Producto'
              )
            }}
          >
            Crear Item
          </StyledNewButton>

          <StyledSearchButton fullWidth variant="contained" 
            onClick={() => {
              handleOpenModalForm(
                <SearchProducto onCheck={handleCheckProduct} />,
                'Buscar producto'
              )
            }}
          >
            Buscar producto
          </StyledSearchButton>
        </Box>
        <Box display={{ xs: 'block', md: 'flex' }} columnGap={2}>
          <TextField
            margin="normal"
            size="small"
            fullWidth
            name="codigo"
            label="Codigo de producto"
            value={formik.values.codigo}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            helperText={formik.touched.codigo && formik.errors.codigo}
            error={formik.touched.codigo && Boolean(formik.errors.codigo)}
          />

          <TextField
            margin="normal"
            type="number"
            size="small"
            fullWidth
            name="cantidad"
            label="Cantidad"
            value={formik.values.cantidad}
            InputProps={{ inputProps: { min: 1 } }}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            helperText={formik.touched.cantidad && formik.errors.cantidad}
            error={formik.touched.cantidad && Boolean(formik.errors.cantidad)}
          />
        </Box>
        <Box display={{ xs: 'block', md: 'flex' }} columnGap={2}>
          <TextField
            margin="normal"
            size="small"
            fullWidth
            name="codProdSunat"
            label="Codigo de producto SUNAT"
            value={formik.values.codProdSunat}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            helperText={formik.touched.codProdSunat && formik.errors.codProdSunat}
            error={
              formik.touched.codProdSunat && Boolean(formik.errors.codProdSunat)
            }
          />

          <TextField
            margin="normal"
            size="small"
            fullWidth
            name="unidad"
            label="Unidad de medida"
            value={formik.values.unidad}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            helperText={formik.touched.unidad && formik.errors.unidad}
            error={formik.touched.unidad && Boolean(formik.errors.unidad)}
          />
        </Box>


        <TextField
          margin="normal"
          size="small"
          fullWidth
          name="descripcion"
          label="Descripcion"
          value={formik.values.descripcion}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          helperText={formik.touched.descripcion && formik.errors.descripcion}
          error={
            formik.touched.descripcion && Boolean(formik.errors.descripcion)
          }
        />

        <Button
          variant="contained"
          color="success"
          type="submit"
          fullWidth
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

export default DocumentoDetalle;
