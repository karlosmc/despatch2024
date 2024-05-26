import React, { MouseEvent,useState } from "react";
import { Detail } from "../../types/doc.interface";
import { Button, Chip, Paper, TextField, Typography } from "@mui/material";

import { useFormik } from "formik";
import * as Yup from "yup";
import { DetailSchema } from "../../utils/validateForm";
import { Producto, UserLogin } from "../../types/login.interface";

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

const ProductoValues: Producto = {
  alias: "",
  codigo: "",
  codProdSunat: "",
  company: "",
  descripcion: "",
  id: "",
  product: "",
  unidad:''
};

const FormDetail = ({ onNewDetail }: DetailFormProps) => {
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

  const dataUser: UserLogin = JSON.parse(localStorage.getItem("userlogin"));

  const DefaultProducts: Producto[] = dataUser.products;

  // const [detalle, setDetalle] = useState<Detail>(DetailValues);

  // const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const { name, value } = event.target;
  //   setDetalle({
  //     ...detalle,
  //     [name]: value,
  //   });
  // };

  // const handleSubmit= ()=>{
  //   onNewDetail(detalle);
  // }

  const handleClickProductsDefault = (evt: MouseEvent<HTMLDivElement>) => {
    evt.preventDefault();
    const spanChip = evt.currentTarget.id;
    // console.log(spanChip);

    const DefaultProduct = DefaultProducts.find((item) => item.id === spanChip);
    // console.log(DefaultClient);
    // setChipRazonSocial(DefaultClient.rznSocial);
    // setChipProductDefault(DefaultProduct);

 

    formik.setFieldValue('codigo',DefaultProduct.codigo)
    formik.setFieldValue('codProdSunat',DefaultProduct.codProdSunat)
    formik.setFieldValue('descripcion',DefaultProduct.descripcion)
    formik.setFieldValue('unidad',DefaultProduct.unidad)

    // setIndicadores((prevState) =>
    //   prevState.map((indi) =>
    //     indi.id === spanChip ? { ...indi, selected: !indi.selected } : indi
    //   )
    // );
  };

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
        {DefaultProducts.map((pro) => {
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
              // color={indicador.selected ? "success" : "default"}
              clickable={true}
              onClick={handleClickProductsDefault}
              // icon={indicador.icon}
            />
          );
        })}
      </Paper>
      <form onSubmit={formik.handleSubmit}>
        <TextField
          margin="normal"
          size="small"
          fullWidth
          name="codigo"
          label="Codigo de producto"
          // value={detalle.codigo}
          // onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
          //   handleChange(e)
          // }
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
          // value={detalle.cantidad}
          // onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
          //   handleChange(e)
          // }
          value={formik.values.cantidad}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          helperText={formik.touched.cantidad && formik.errors.cantidad}
          error={formik.touched.cantidad && Boolean(formik.errors.cantidad)}
        />

        <TextField
          margin="normal"
          size="small"
          fullWidth
          name="codProdSunat"
          label="Codigo de producto SUNAT"
          // value={detalle.codProdSunat}
          // onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
          //   handleChange(e)
          // }
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
          name="descripcion"
          label="Descripcion"
          // value={detalle.descripcion}
          // onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
          //   handleChange(e)
          // }
          value={formik.values.descripcion}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          helperText={formik.touched.descripcion && formik.errors.descripcion}
          error={
            formik.touched.descripcion && Boolean(formik.errors.descripcion)
          }
        />
        <TextField
          margin="normal"
          size="small"
          fullWidth
          name="unidad"
          label="Unidad de medida"
          // value={detalle.unidad}
          // onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
          //   handleChange(e)
          // }
          value={formik.values.unidad}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          helperText={formik.touched.unidad && formik.errors.unidad}
          error={formik.touched.unidad && Boolean(formik.errors.unidad)}
        />
        <Button
          variant="outlined"
          color="success"
          // onClick={handleSubmit}
          type="submit"
        >
          Agregar Item
        </Button>
      </form>
    </>
  );
};

export default FormDetail;
