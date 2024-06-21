import { FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material'
import { Guia } from '../../types/guias/guias.interface';
import { Field, FormikProps } from 'formik';
import ChipsFieldArray from '../../views/ChipsFieldArray';


const _UNIDAD_PESO_TOTAL = [
  { id: "KGM", valor: "KILOGRAMOS" },
  { id: "TNL", valor: "TONELADAS" },
];

interface DatosEnvioProps {
  formik: FormikProps<Guia>
}

const DatosEnvioStep = ({ formik }: DatosEnvioProps) => {
  return (
    <Grid
      container
      justifyContent="space-between"
      alignContent="center"
      alignItems="center"
      mt={4}
      spacing={1}
    >

      <Grid item lg={5} xs={12}>
        <TextField
          fullWidth
          size="small"
          // value={dataEnvio.fecTraslado}
          value={formik.values.fecTraslado}
          name="fecTraslado"
          // onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
          //   handleChange(e)
          // }
          onChange={formik.handleChange}
          // onChange={handleChange}
          label="Fecha de traslado"
          type="datetime-local"
          style={{ colorScheme: "dark" }}
          error={formik.touched.fecTraslado && Boolean(formik.errors.fecTraslado)}
          onBlur={formik.handleBlur}
          InputLabelProps={{
            shrink: true,
          }}
        />
      </Grid>
      <Grid item lg={2} xs={4}>
        <TextField
          fullWidth
          size="small"
          // value={dataEnvio.pesoTotal}
          value={formik.values.pesoTotal}
          name="pesoTotal"
          // onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
          //   handleChange(e)
          // }

          onChange={formik.handleChange}
          // onChange={handleChange}
          label="Peso Total"
          type="number"
          error={formik.touched.pesoTotal && Boolean(formik.errors.pesoTotal)}
          onBlur={formik.handleBlur}
        />
      </Grid>
      <Grid item lg={2} xs={4}>
        <TextField
          fullWidth
          size="small"
          // value={dataEnvio.numBultos}
          value={formik.values.numBultos}
          name="numBultos"
          // onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
          //   handleChange(e)
          // }
          onChange={formik.handleChange}
          // onChange={handleChange}
          label="Número de bultos"
          type="number"
          error={formik.touched.numBultos && Boolean(formik.errors.numBultos)}
          onBlur={formik.handleBlur}
        />
      </Grid>
      <Grid item lg={3} xs={4}>
        <FormControl fullWidth size="small">
          <InputLabel>Unidad de Peso Total</InputLabel>
          <Select
            // value={dataEnvio.undPesoTotal}
            value={formik.values.undPesoTotal}
            name="undPesoTotal"
            label="Unidad de Peso Total"
            // onChange={(e: SelectChangeEvent): void =>
            //   SelectHandleChange(e)
            // }
            onChange={formik.handleChange}
            // onChange={handleChange}
            error={formik.touched.undPesoTotal && Boolean(formik.errors.undPesoTotal)}
            onBlur={formik.handleBlur}
          >
            {_UNIDAD_PESO_TOTAL.map((unidad, index) => (
              <MenuItem key={index} value={unidad.id}>
                {unidad.valor}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} textAlign={'center'} mt={1}>
        <Field
          name="indicadores"
          component={ChipsFieldArray} // Usa el componente ChipsField
        />
      </Grid>
    </Grid>
  )
}

export default DatosEnvioStep