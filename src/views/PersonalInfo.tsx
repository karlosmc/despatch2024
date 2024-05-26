import {
  TextField,
  Grid
} from '@mui/material';
import { Field, FormikProps, FormikValues } from 'formik';
import ChipsField from './ChipsField';
import ChipsFieldArray from './ChipsFieldArray';


import { useEffect, useState } from 'react';


interface AccountDetailsProps {
  formik: FormikProps<FormikValues>;
}

const options = [
  { label: 'Opción 1', value: 1 },
  { label: 'Opción 2', value: 2 },
  { label: 'Opción 3', value: 3 },
  // Agrega más opciones según sea necesario
];


type indicadoresType = {
  id: string;
  name: string;
  tooltip: string;
  selected: boolean;
  icon: JSX.Element;
};




const PersonalInfo = ({ formik }: AccountDetailsProps) => {
  // const { formik } = props;

  // console.log(formik.values)

  // const [indicadores, setIndicadores] = useState(_INDICADORES_ESPECIALES);

  

  // useEffect(() => {
  //   const filterIndicadores = indicadores.filter(item => item.selected).map(filtrados => filtrados.id)
  //   console.log(filterIndicadores)
  //   formik.setFieldValue('indicadores', filterIndicadores)
  // }, [indicadores])


  return (
    <Grid
      container
      spacing={2}
    >
      <Grid
        item
        xs={6}
      >
        <TextField
          name="firstName"
          label="First Name"
          variant="outlined"
          size='small'
          fullWidth
          value={formik.values.firstName}
          onChange={formik.handleChange}
          error={formik.touched.firstName && Boolean(formik.errors.firstName)}
        // helperText={formik.touched.firstName && formik.errors.firstName}
        />
      </Grid>
      <Grid
        item
        xs={6}
      >
        <TextField
          name="lastName"
          label="Last Name"
          variant="outlined"
          size="small"
          fullWidth
          value={formik.values.lastName}
          onChange={formik.handleChange}
          error={formik.touched.lastName && Boolean(formik.errors.lastNamel)}
        // helperText={formik.touched.lastName && formik.errors.lastName}
        />
      </Grid>
      <Grid
        item
        xs={12}
      >
        <TextField
          name="phone"
          label="Phone Number"
          variant="outlined"
          type="phone"
          fullWidth
          size="small"
          value={formik.values.phone}
          onChange={formik.handleChange}
          error={formik.touched.phone && Boolean(formik.errors.phone)}
        // helperText={formik.touched.phone && formik.errors.phone}
        />
      </Grid>
      <Grid
        item
        xs={12}
      >
        <TextField
          name="residence"
          label="Residence"
          variant="outlined"
          size="small"
          fullWidth
          value={formik.values.residence}
          onChange={formik.handleChange}
          error={formik.touched.residence && Boolean(formik.errors.residence)}
        // helperText={formik.touched.residence && formik.errors.residence}
        />
      </Grid>

      <Grid
        item
        xs={12}
      >
        <Field
          name="obligado"
          options={options}
          component={ChipsField} // Usa el componente ChipsField
        />

      </Grid>

      <Grid
        item
        xs={12}
      >
        <Field
          name="indicadores"
          // indicadores={indicadores}
          // setIndicadores={setIndicadores}
          component={ChipsFieldArray} // Usa el componente ChipsField
        />
      </Grid>
    </Grid>
  )
}

export default PersonalInfo