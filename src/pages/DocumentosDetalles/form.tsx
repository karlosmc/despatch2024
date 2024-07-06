import { useEffect, useState } from "react";
import { Detail } from "../../types/doc.interface";
import { Box, Button, FormControl, InputLabel, MenuItem, Select, TextField, styled } from "@mui/material";

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

const _UNIDAD_MEDIDA = [
  {
    "id": 1,
    "codigo": "NIU",
    "descripcion": "NIU: UNIDAD (BIENES)"
  },
  {
    "id": 2,
    "codigo": "GLL",
    "descripcion": "GLL: US GALON (3,7843 L)"
  },
  {
    "id": 3,
    "codigo": "KGM",
    "descripcion": "KGM: KILOGRAMO"
  },
  {
    "id": 4,
    "codigo": "MTR",
    "descripcion": "MTR: METRO"
  },
  {
    "id": 5,
    "codigo": "ZZ",
    "descripcion": "ZZ: UNIDAD (SERVICIOS)"
  },
  {
    "id": 6,
    "codigo": "4A",
    "descripcion": "4A: BOBINAS"
  },
  {
    "id": 7,
    "codigo": "BJ",
    "descripcion": "BJ: BALDE"
  },
  {
    "id": 8,
    "codigo": "BLL",
    "descripcion": "BLL: BARRILES"
  },
  {
    "id": 9,
    "codigo": "BG",
    "descripcion": "BG: BOLSA"
  },
  {
    "id": 10,
    "codigo": "BO",
    "descripcion": "BO: BOTELLAS"
  },
  {
    "id": 11,
    "codigo": "BX",
    "descripcion": "BX: CAJA"
  },
  {
    "id": 12,
    "codigo": "CT",
    "descripcion": "CT: CARTONES"
  },
  {
    "id": 13,
    "codigo": "CMK",
    "descripcion": "CMK: CENTIMETRO CUADRADO"
  },
  {
    "id": 14,
    "codigo": "CMQ",
    "descripcion": "CMQ: CENTIMETRO CUBICO"
  },
  {
    "id": 15,
    "codigo": "CMT",
    "descripcion": "CMT: CENTIMETRO LINEAL"
  },
  {
    "id": 16,
    "codigo": "CEN",
    "descripcion": "CEN: CIENTO DE UNIDADES"
  },
  {
    "id": 17,
    "codigo": "CY",
    "descripcion": "CY: CILINDRO"
  },
  {
    "id": 18,
    "codigo": "CJ",
    "descripcion": "CJ: CONOS"
  },
  {
    "id": 19,
    "codigo": "DZN",
    "descripcion": "DZN: DOCENA"
  },
  {
    "id": 20,
    "codigo": "DZP",
    "descripcion": "DZP: DOCENA POR 10**6"
  },
  {
    "id": 21,
    "codigo": "BE",
    "descripcion": "BE: FARDO"
  },
  {
    "id": 22,
    "codigo": "GLI",
    "descripcion": "GLI: GALON INGLES (4,545956L)"
  },
  {
    "id": 23,
    "codigo": "GRM",
    "descripcion": "GRM: GRAMO"
  },
  {
    "id": 24,
    "codigo": "GRO",
    "descripcion": "GRO: GRUESA"
  },
  {
    "id": 25,
    "codigo": "HLT",
    "descripcion": "HLT: HECTOLITRO"
  },
  {
    "id": 26,
    "codigo": "LEF",
    "descripcion": "LEF: HOJA"
  },
  {
    "id": 27,
    "codigo": "SET",
    "descripcion": "SET: JUEGO"
  },
  {
    "id": 28,
    "codigo": "KTM",
    "descripcion": "KTM: KILOMETRO"
  },
  {
    "id": 29,
    "codigo": "KWH",
    "descripcion": "KWH: KILOVATIO HORA"
  },
  {
    "id": 30,
    "codigo": "KT",
    "descripcion": "KT: KIT"
  },
  {
    "id": 31,
    "codigo": "CA",
    "descripcion": "CA: LATAS"
  },
  {
    "id": 32,
    "codigo": "LBR",
    "descripcion": "LBR: LIBRAS"
  },
  {
    "id": 33,
    "codigo": "LTR",
    "descripcion": "LTR: LITRO"
  },
  {
    "id": 34,
    "codigo": "MWH",
    "descripcion": "MWH: MEGAWATT HORA"
  },
  {
    "id": 35,
    "codigo": "MTK",
    "descripcion": "MTK: METRO CUADRADO"
  },
  {
    "id": 36,
    "codigo": "MTQ",
    "descripcion": "MTQ: METRO CUBICO"
  },
  {
    "id": 37,
    "codigo": "MGM",
    "descripcion": "MGM: MILIGRAMOS"
  },
  {
    "id": 38,
    "codigo": "MLT",
    "descripcion": "MLT: MILILITRO"
  },
  {
    "id": 39,
    "codigo": "MMT",
    "descripcion": "MMT: MILIMETRO"
  },
  {
    "id": 40,
    "codigo": "MMK",
    "descripcion": "MMK: MILIMETRO CUADRADO"
  },
  {
    "id": 41,
    "codigo": "MMQ",
    "descripcion": "MMQ: MILIMETRO CUBICO"
  },
  {
    "id": 42,
    "codigo": "MLL",
    "descripcion": "MLL: MILLARES"
  },
  {
    "id": 43,
    "codigo": "UM",
    "descripcion": "UM: MILLON DE UNIDADES"
  },
  {
    "id": 44,
    "codigo": "ONZ",
    "descripcion": "ONZ: ONZAS"
  },
  {
    "id": 45,
    "codigo": "PF",
    "descripcion": "PF: PALETAS"
  },
  {
    "id": 46,
    "codigo": "PK",
    "descripcion": "PK: PAQUETE"
  },
  {
    "id": 47,
    "codigo": "PR",
    "descripcion": "PR: PAR"
  },
  {
    "id": 48,
    "codigo": "FOT",
    "descripcion": "FOT: PIES"
  },
  {
    "id": 49,
    "codigo": "FTK",
    "descripcion": "FTK: PIES CUADRADOS"
  },
  {
    "id": 50,
    "codigo": "FTQ",
    "descripcion": "FTQ: PIES CUBICOS"
  },
  {
    "id": 51,
    "codigo": "C62",
    "descripcion": "C62: PIEZAS"
  },
  {
    "id": 52,
    "codigo": "PG",
    "descripcion": "PG: PLACAS"
  },
  {
    "id": 53,
    "codigo": "ST",
    "descripcion": "ST: PLIEGO"
  },
  {
    "id": 54,
    "codigo": "INH",
    "descripcion": "INH: PULGADAS"
  },
  {
    "id": 55,
    "codigo": "RM",
    "descripcion": "RM: RESMA"
  },
  {
    "id": 56,
    "codigo": "DR",
    "descripcion": "DR: TAMBOR"
  },
  {
    "id": 57,
    "codigo": "STN",
    "descripcion": "STN: TONELADA CORTA"
  },
  {
    "id": 58,
    "codigo": "LTN",
    "descripcion": "LTN: TONELADA LARGA"
  },
  {
    "id": 59,
    "codigo": "TNE",
    "descripcion": "TNE: TONELADAS"
  },
  {
    "id": 60,
    "codigo": "TU",
    "descripcion": "TU: TUBOS"
  },
  {
    "id": 61,
    "codigo": "YRD",
    "descripcion": "YRD: YARDA"
  },
  {
    "id": 62,
    "codigo": "YDK",
    "descripcion": "YDK: YARDA CUADRADA"
  }
]

const DetailValues: Detail = {
  id:0,
  atributos: null,
  cantidad: 1,
  codigo: "",
  codProdSunat: "",
  descripcion: "",
  unidad: "NIU",
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

    formik.setFieldValue('id', producto.id)
    formik.setFieldValue('codigo', producto.codigo)
    formik.setFieldValue('codProdSunat', producto.codProdSunat)
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


  // const handleCheckProduct = (producto: Producto): void => {
  //   formik.setFieldValue('id', producto.id)
  //   formik.setFieldValue('codigo', producto.codigo)
  //   formik.setFieldValue('codProdSunat', producto.codProdSunat)
  //   formik.setFieldValue('descripcion', producto.descripcion)
  //   formik.setFieldValue('unidad', producto.unidad)
  //   handleCloseModalForm()
  // }

  const handleSetFavorite = (item: ChipInterface): void => {
    const producto = dataFilter.find(it => it.id === item.id);
    // formik.setFieldValue('tipoDoc', persona.tipoDoc)
    formik.setFieldValue('id', producto.id)
    formik.setFieldValue('codigo', producto.codigo)
    formik.setFieldValue('codProdSunat', producto.codProdSunat)
    formik.setFieldValue('descripcion', producto.descripcion)
    formik.setFieldValue('unidad', producto.unidad)
  }

  useEffect(() => {
    filterFav()
  }, [])

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
                <SearchProducto onCheck={handleConfirm} />,
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
            inputProps={{ style: { textTransform: "uppercase" } }}
            InputProps={{readOnly:formik.values.id<=1?false:true}}
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
            value={formik.values.codProdSunat||''}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            helperText={formik.touched.codProdSunat && formik.errors.codProdSunat}
            error={
              formik.touched.codProdSunat && Boolean(formik.errors.codProdSunat)
            }
            inputProps={{ style: { textTransform: "uppercase" } }}
            InputProps={{readOnly:formik.values.id<=1?false:true}}
          />

          {/* <TextField
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
          /> */}
          <FormControl fullWidth size="small" margin="normal" sx={{ mb: 2 }}>
            <InputLabel>Unidad de medida</InputLabel>
            <Select
              label="Unidad de medida"
              name="unidad"
              value={formik.values.unidad}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.unidad && Boolean(formik.errors.unidad)}
              readOnly={formik.values.id<=1?false:true}
            >
              {_UNIDAD_MEDIDA.map((uni) => (
                <MenuItem key={uni.id} value={uni.codigo}>
                  {uni.descripcion}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
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
          inputProps={{ style: { textTransform: "uppercase" } }}
          InputProps={{readOnly:formik.values.id<=1?false:true}}
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
