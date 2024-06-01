import {

  Button,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,

  TextField,
  Tooltip,
  
} from "@mui/material";
import React, { MouseEvent, useEffect,  useState } from "react";


import DirectionsCarFilledIcon from "@mui/icons-material/DirectionsCarFilled";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import TaxiAlertIcon from "@mui/icons-material/TaxiAlert";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";







//import TextSearch from "../../components/TextSearch";
//import DireccionFormChat from "../direction/formDirectionChatGpt";

import { useFormik } from "formik";
import { Envio } from "../../types/guias/guiaremision.interface";
import { EnvioSchema } from "../../utils/validateGuiaRemision";




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


type indicadoresType = {
  id: string;
  name: string;
  tooltip: string;
  selected: boolean;
  icon: JSX.Element;
};
const _INDICADORES_ESPECIALES = [
  {
    id: "SUNAT_Envio_IndicadorTrasladoVehiculoM1L",
    name: "Traslado en vehiculos M1 o L",
    tooltip: "Vehiculo M1 o L",
    selected: false,
    icon: <DirectionsCarFilledIcon />,
  },
  {
    id: "SUNAT_Envio_IndicadorRetornoVehiculoEnvaseVacio",
    name: "Retorno de vehiculos con envases o embalajes vacíos",
    tooltip: "Envases o embalajes vacío",
    selected: false,
    icon: <DeleteOutlineIcon />,
  },
  {
    id: "SUNAT_Envio_IndicadorRetornoVehiculoVacio",
    name: "Retorno de vehículo vacío",
    tooltip: "Vehículo vacío",
    selected: false,
    icon: <TaxiAlertIcon />,
  },
  {
    id: "SUNAT_Envio_IndicadorTrasladoTotalDAMoDS",
    name: "Traslado total de la DAM o DS",
    tooltip: "Total de DAM o DS",
    selected: false,
    icon: <FormatListNumberedIcon />,
  },
];

const _MODALIDAD_TRASLADO = [
  { id: "01", valor: "Transporte público" },
  { id: "02", valor: "Transporte privado" },
];

const _UNIDAD_PESO_TOTAL = [
  { id: "KGM", valor: "KILOGRAMOS" },
  { id: "TNL", valor: "TONELADAS" },
];



interface EnvioFormProps {
  onChange: (envio: Envio) => void;
  EnvioValues: Envio;
}

type ModalsProps = {
  open: boolean;
  form: React.ReactNode | null;
  title: string;
};
const EnvioForm = ({ onChange, EnvioValues }: EnvioFormProps) => {

  const [modalsForm, setModalsForms] = useState<ModalsProps>({
    open: false,
    form: null,
    title: "",
  });

  // const {getError,getSuccess } = useNotification();

  const formik = useFormik({
    initialValues: EnvioValues,
    validationSchema: EnvioSchema,
    onSubmit: (_) => { }
  });


  const handleCloseModalForm = () => {
    // Cierra el modal en la posición especificada
    setModalsForms((prev) => ({ ...prev, open: false }));
  };



  const [indicadores, setIndicadores] = useState<indicadoresType[]>(
    _INDICADORES_ESPECIALES
  );


  useEffect(() => {
    if (formik.values.codTraslado) {
      const desTraslado = _MOTIVO_TRASLADO.find(item => item.id === formik.values.codTraslado).valor
      formik.setFieldValue('desTraslado', desTraslado)
    }
  }, [formik.values.codTraslado])

  useEffect(() => {
    // console.log(formik.values);
    onChange(formik.values);
  }, [formik.values]);

  useEffect(() => {
    const filterIndicadores = indicadores.filter(item => item.selected).map(filtrados => filtrados.id)
    formik.setFieldValue('indicadores', filterIndicadores)
  }, [indicadores])


  const handleClickIndicator = (evt: MouseEvent<HTMLDivElement>) => {
    evt.preventDefault();
    const spanChip = evt.currentTarget.id;

    setIndicadores((prevState) =>
      prevState.map((indi) =>
        indi.id === spanChip ? { ...indi, selected: !indi.selected } : indi
      )
    );
  }

  return (
    <>

      <Grid container item xs={12} spacing={2}>
        <Grid item lg={6} xs={12}>
          <FormControl fullWidth size="small">
            <InputLabel>Motivo de traslado</InputLabel>
            <Select
              value={formik.values.codTraslado}
              name="codTraslado"
              label="Motivo de traslado"
              error={formik.touched.codTraslado && Boolean(formik.errors.codTraslado)}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
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
              value={formik.values.modTraslado}
              name="modTraslado"
              label="Modalidad de traslado"           
              onChange={formik.handleChange}
              error={formik.touched.modTraslado && Boolean(formik.errors.modTraslado)}
              onBlur={formik.handleBlur}            
            >
              {_MODALIDAD_TRASLADO.map((modalidad) => (
                <MenuItem key={modalidad.id} value={modalidad.id}>
                  {modalidad.valor}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      <Grid my={1} container item xs={12} spacing={2}>
        <Grid item lg={5} xs={12}>
          <TextField
            fullWidth
            size="small"            
            value={formik.values.fecTraslado}
            name="fecTraslado"
            onChange={formik.handleChange}
            label="Fecha de traslado"
            type="datetime-local"
            style={{ colorScheme: "dark" }}
            error={formik.touched.fecTraslado && Boolean(formik.errors.fecTraslado)}
            onBlur={formik.handleBlur}
            helperText={formik.touched.fecTraslado && formik.errors.fecTraslado}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Grid>
        <Grid item lg={2} xs={4}>
          <TextField
            fullWidth
            size="small"
            
            value={formik.values.pesoTotal}
            name="pesoTotal"
            onChange={formik.handleChange}
            
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
            value={formik.values.numBultos}
            name="numBultos"            
            onChange={formik.handleChange}           
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
              value={formik.values.undPesoTotal}
              name="undPesoTotal"
              label="Unidad de Peso Total"
              onChange={formik.handleChange}
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
      </Grid>

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
        {indicadores.map((indicador) => {
          return (
            <Tooltip title={indicador.name} key={indicador.id}>
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
                id={indicador.id}
                label={indicador.tooltip}
                key={indicador.id}
                color={indicador.selected ? "success" : "default"}
                clickable={true}
                onClick={handleClickIndicator}
                icon={indicador.icon}
              />
            </Tooltip>
          );
        })}
      </Paper>

    </>
  );
};

export default EnvioForm;
