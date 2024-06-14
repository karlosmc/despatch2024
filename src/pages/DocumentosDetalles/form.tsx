import { MouseEvent, useState } from "react";
import { Detail } from "../../types/doc.interface";
import { Box, Button, Chip, Paper, TextField, Typography } from "@mui/material";

import { useFormik } from "formik";



import { DetailSchema } from "../../utils/validateGuiaRemision";
import { DialogComponentCustom } from "../../components";
import ModalProducto from "../../components/Producto";
import SearchProducto from "../../components/Producto/SearchProducto";
import { Producto } from "../../types/producto.interface";

/* const DestinatarioValues: Client = {
  id: "",
  numDoc: "",
  rznSocial: "",
  tipoDoc: "",
}; */

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

const DocumentoDetalle = ({ onNewDetail }: DetailFormProps) => {

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

  const handleConfirm=(producto:Producto):void=>{

    formik.setFieldValue('codigo', producto.codigo)
    formik.setFieldValue('codProdSunat', producto.codProdSunat?producto.codProdSunat:'')
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

  // const [chipProductDefault, setChipProductDefault] = useState<Producto>(
  //   ProductoValues || null
  // );

  // const dataUser: UserLogin = JSON.parse(localStorage.getItem("userlogin"));

  // const DefaultProducts: Producto[] = dataUser.products;

  const DefaultProducts: Producto[] = [];



  // const handleClickProductsDefault = (evt: MouseEvent<HTMLDivElement>) => {
  //   evt.preventDefault();
  //   const spanChip = evt.currentTarget.id;
  //   // console.log(spanChip);

  //   const DefaultProduct = DefaultProducts.find((item) => item.id === spanChip);



  //   formik.setFieldValue('codigo', DefaultProduct.codigo)
  //   formik.setFieldValue('codProdSunat', DefaultProduct.codProdSunat)
  //   formik.setFieldValue('descripcion', DefaultProduct.descripcion)
  //   formik.setFieldValue('unidad', DefaultProduct.unidad)


  // };

  const handleCheckProduct = (producto:Producto):void => {

    formik.setFieldValue('codigo', producto.codigo)
    formik.setFieldValue('codProdSunat', producto.codProdSunat)
    formik.setFieldValue('descripcion', producto.descripcion)
    formik.setFieldValue('unidad', producto.unidad)
    handleCloseModalForm()
  }

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
        {/* {DefaultProducts.map((pro) => {
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
              id={pro.id}
              label={pro.alias}
              key={pro.id}
              clickable={true}
              onClick={handleClickProductsDefault}
            />
          );
        })} */}
      </Paper>
      <form onSubmit={formik.handleSubmit}>
        <Box display={{xs:'block',md:'flex'}} columnGap={2}>
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
        <Box display={{xs:'block',md:'flex'}} columnGap={2}>
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
          variant="outlined"
          color="success"
          type="submit"
        >
          Agregar Item
        </Button>
      </form>

      <Button variant="outlined" color="primary" sx={{mt:2}}
       onClick={() => {
        handleOpenModalForm(
          <ModalProducto initialValue={null} edit={false} onConfirm={handleConfirm}/>,
          'Producto'
        )
      }}
      >
        Crear Item
      </Button>

      <Button variant="outlined" color="primary" sx={{mt:2}}
       onClick={() => {
        handleOpenModalForm(
          <SearchProducto onCheck={handleCheckProduct}/>,
          'Buscar producto'
        )
      }}
      >
        Buscar producto
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
    </>
  );
};

export default DocumentoDetalle;
