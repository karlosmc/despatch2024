import { Button, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material'
import { useFormik, useFormikContext } from 'formik'

import React from 'react'

import { AddDoc, Guia } from '../../types/guias/guias.interface'
import { AddDocSchema, AddDocsSchema } from '../../utils/validateGuias';

interface ComprobantesAdicionalesFormProps {
  onNewAddDoc: (newDetail: AddDoc) => void;
}

const TipoDocumentos = [
  { valor: "03", descripcion: "BOLETA" },
  { valor: "01", descripcion: "FACTURA" },
];

const AddDocValues: AddDoc = {
  emisor: "",
  nro: "",
  tipo: "01",
  tipoDesc: "FACTURA",
};


const ComprobantesAdicionalesForm = ({ onNewAddDoc }: ComprobantesAdicionalesFormProps) => {


  const { values, errors, touched, handleChange, handleBlur, setFieldValue } = useFormikContext<AddDoc>();
  console.log(values)

  // const validate = () => {
  //   // Implementa tu lógica de validación aquí si es necesario
  //   // Retorna true si el formulario es válido, false en caso contrario
  //   return true;
  // };

  const validate = async (values: any) => {
    try {
      // Valida los valores del formulario según el esquema Yup
      await AddDocsSchema.validate(values, { abortEarly: false });
    } catch (errors) {
      // console.log(errors)
      // Si hay errores, construye un objeto de errores personalizado
      const customErrors: any = {};
      errors.inner.forEach((error: any) => {
        customErrors[error.path] = error.message;
      });
      console.log(customErrors)
      return customErrors;
    }
  };

  
  const handleAddDoc = () => {
    if (validate(values)) {
      const newAddDoc: AddDoc = {
        tipo: values.tipo,
        nro: values.nro,
        emisor: values.emisor,
        tipoDesc: TipoDocumentos.find(item=> item.valor===values.tipo).descripcion
      };
      onNewAddDoc(newAddDoc);
      // Resetea los valores del formulario después de agregar el documento adicional
      setFieldValue('tipo', '01');
      setFieldValue('nro', '');
      setFieldValue('emisor', '');
      setFieldValue('tipoDesc', '');
    }
  };


  // const formik = useFormik({
  //   initialValues: AddDocValues,
  //   validationSchema: AddDocSchema,
  //   onSubmit: (values) => {
  //     const tipoDesc = TipoDocumentos.find(
  //       (item) => item.valor === values.tipo
  //     ).descripcion;
  //     values.tipoDesc = tipoDesc;
  //     // console.log(values);
  //     // onChange(values);
  //     onNewAddDoc(values);
  //   },
  // });

  return (
    <>
      <TextField
        margin="normal"
        size="small"
        fullWidth
        name="emisor"
        label="Emisor"
        value={values.emisor}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.emisor && Boolean(errors.emisor)}
      // onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
      //   handleChange(e)
      // }
      />

      <FormControl fullWidth size="small" margin="normal" sx={{ mb: 2 }}>
        <InputLabel>Tipo de comprobante</InputLabel>
        <Select
          label="Tipo de comprobante"
          name="tipo"
          // value={detalle.tipo}

          value={values.tipo||''}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.tipo && Boolean(errors.tipo)}

        // onChange={(e: SelectChangeEvent): void => SelectHandleChange(e)}
        >
          {TipoDocumentos.map((doc) => (
            <MenuItem key={doc.valor} value={doc.valor}>
              {doc.descripcion}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        margin="normal"
        type="text"
        size="small"
        fullWidth
        name="nro"
        // label="Numero Comprobante"
        value={values.nro}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.nro && Boolean(errors.nro)}
        inputProps={{ style: { textTransform: "uppercase" } }}
        placeholder={`EJEMPLO: ${values.nro === "01" ? "F" : "B"
          }123-456789`}
      />
      <Button
        variant="outlined"
        color="success"
        onClick={handleAddDoc}
      >
        Agregar Item
      </Button>

    </>
  )
}



export default ComprobantesAdicionalesForm