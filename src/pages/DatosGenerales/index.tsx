import {
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import { FormikProps, FormikValues } from "formik";
import { useEffect } from "react";

interface DatosGeneralesProps {
  formik: FormikProps<FormikValues>;
}

const _MOTIVO_TRASLADO = [
  { id: "01", valor: "Venta" },
  { id: "02", valor: "Compra" },
  { id: "03", valor: "Venta con entrega a terceros" },
  { id: "04", valor: "Traslado entre establecimientos de la misma empresa" },
  { id: "05", valor: "Consignación" },
  { id: "06", valor: "Devolución" },
  { id: "07", valor: "Recojo de bienes transformados" },
  { id: "08", valor: "Importación" },
  { id: "09", valor: "Exportación" },
  { id: "13", valor: "Otros" },
  { id: "14", valor: "Venta sujeta a confirmación del comprador" },
  { id: "17", valor: "Traslado de bienes para transformación" },
  { id: "18", valor: "Traslado emisor itinerante CP" },
];
const _MODALIDAD_TRASLADO = [
  { id: "01", valor: "Transporte público" },
  { id: "02", valor: "Transporte privado" },
];




const DatosGenerales = ({ formik }: DatosGeneralesProps) => {

  useEffect(()=>{
    if(formik.values.codTraslado){
      const desTraslado = _MOTIVO_TRASLADO.find(item => item.id=== formik.values.codTraslado).valor
      formik.setFieldValue('desTraslado',desTraslado)
    }
  },[formik.values.codTraslado])
  
  return (
    <Grid
      container
      justifyContent="space-between"
      alignContent="center"
      alignItems="center"
      mt={4}
    >
      <Grid spacing={2} container item xs={12}>
        <Grid item lg={6} xs={12}>
          <FormControl fullWidth size="small">
            <InputLabel id="demo-simple-select-label">
              Tipo Documento
            </InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              label="Tipo Documento"
              value={"G"}
            >
              <MenuItem value="G">GUIA DE REMISION ELECTRONICA</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item lg={6} xs={6}>
          <FormControl fullWidth size="small">
            <InputLabel id="demo-simple-select-label">Serie</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={formik.values.serie}
              // value={formData?.serie}
              label="Serie"
              // onChange={(e: SelectChangeEvent): void =>
              //   SelectHandleChange(e)
              // }
              onChange={formik.handleChange}
              error={formik.touched.serie && Boolean(formik.errors.serie)}
              onBlur={formik.handleBlur}
              // helperText={formik.touched.serie && formik.errors.serie}
              name="serie"
            >
              <MenuItem value={"T001"}>T001</MenuItem>
              {/* <MenuItem value={"T002"}>T002</MenuItem>
            <MenuItem value={"T003"}>T003</MenuItem> */}
            </Select>
            {/* <FormHelperText component={Typography} color="red">{formik.touched.serie && formik.errors.serie}</FormHelperText> */}
          </FormControl>
        </Grid>
        <Grid item lg={6} xs={6}>
          <TextField
            size="small"
            name="correlativo"
            //value={formData?.correlativo}
            value={formik.values.correlativo}
            /* onChange={(
            e: React.ChangeEvent<HTMLInputElement>
          ): void => handleChange(e)} */
            type="text"
            label="Número Documento"
            error={
              formik.touched.correlativo && Boolean(formik.errors.correlativo)
            }
            onBlur={formik.handleBlur}
            // helperText={formik.touched.correlativo && formik.errors.correlativo}
            onChange={formik.handleChange}
          />
        </Grid>
        <Grid item lg={6} xs={12}>
          <TextField
            fullWidth
            size="small"
            id="datetime-local"
            label="Fecha de Emision"
            name="fechaEmision"
            type="datetime-local"
            // value={formData?.fechaEmision}
            value={formik.values.fechaEmision}
            /* onChange={(
            e: React.ChangeEvent<HTMLInputElement>
          ): void => handleChange(e)} */
            style={{ colorScheme: "dark" }}
            InputLabelProps={{
              shrink: true,
            }}
            error={
              formik.touched.fechaEmision && Boolean(formik.errors.fechaEmision)
            }
            onBlur={formik.handleBlur}
            // helperText={
            //   formik.touched.fechaEmision && formik.errors.fechaEmision
            // }
            onChange={formik.handleChange}
          />
        </Grid>
        <Grid item lg={6} xs={12}>
          <FormControl fullWidth size="small">
            <InputLabel>Motivo de traslado</InputLabel>
            <Select
              //value={dataEnvio.codTraslado}
              value={formik.values.codTraslado}
              name="codTraslado"
              label="Motivo de traslado"
              error={
                formik.touched.codTraslado && Boolean(formik.errors.codTraslado)
              }
              onBlur={formik.handleBlur}
              /* onChange={(e: SelectChangeEvent): void =>
                    SelectHandleChange(e)
                  } */
              onChange={formik.handleChange}
              // onChange={handleChange}
            >
              {_MOTIVO_TRASLADO.map((motivo) => (
                <MenuItem key={motivo.id} value={motivo.id}>
                  {motivo.valor}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item lg={6} xs={12}>
          <FormControl fullWidth size="small">
            <InputLabel>Modalidad de traslado</InputLabel>
            <Select
              //value={dataEnvio.modTraslado}
              value={formik.values.modTraslado}
              name="modTraslado"
              label="Modalidad de traslado"
              // onChange={(e: SelectChangeEvent): void =>
              //   SelectHandleChange(e)
              // }
              onChange={formik.handleChange}
              error={
                formik.touched.modTraslado && Boolean(formik.errors.modTraslado)
              }
              onBlur={formik.handleBlur}
              // onChange={handleChange}
            >
              {_MODALIDAD_TRASLADO.map((modalidad) => (
                <MenuItem key={modalidad.id} value={modalidad.id}>
                  {modalidad.valor}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item lg={6} xs={12}>
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
                // helperText={formik.touched.fecTraslado && formik.errors.fecTraslado}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
      </Grid>
      <Grid item xs={12}>
        <TextField
          margin="normal"
          size="small"
          fullWidth
          name="observacion"
          multiline
          maxRows={2}
          minRows={2}
          label="Observaciones"
          // value={formData?.observacion}
          // onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
          //   handleChange(e)
          // }
          sx={{ mt: 1.5, mb: 1.5 }}
          value={formik.values.observacion}
          // required
          onChange={formik.handleChange}
          error={
            formik.touched.observacion && Boolean(formik.errors.observacion)
          }
          onBlur={formik.handleBlur}
          // helperText={formik.touched.observacion && formik.errors.observacion}
        />
      </Grid>
    </Grid>
  );
};

export default DatosGenerales;
