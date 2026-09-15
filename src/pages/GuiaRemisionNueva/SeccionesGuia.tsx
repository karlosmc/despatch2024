import { ReactNode, useState } from "react";
import {
  Box,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";

import AssignmentIndRoundedIcon from "@mui/icons-material/AssignmentIndRounded";
import CommuteRoundedIcon from "@mui/icons-material/CommuteRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import AirportShuttleRoundedIcon from "@mui/icons-material/AirportShuttleRounded";
import PersonPinCircleRoundedIcon from "@mui/icons-material/PersonPinCircleRounded";
import PinDropRoundedIcon from "@mui/icons-material/PinDropRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

import DatosGeneralesForm from "../DatosGeneralesForm";
import EnvioForm from "../DatosEnvioForm";
import Cliente from "../PersonaCliente";
import DatosDireccion from "../Direccion";
import Conductores from "../Conductores";
import DatosTransportista from "../DatosTransportista";
import DatosVehiculo from "../DatosVehiculos";
import VehiculosSecundarios from "../DatosVehiculos/secundarios";
import DocumentoDetalle from "../DocumentosDetalles/form";

import { LlegadaSchema, TerceroSchema } from "../../utils/validateGuiaRemision";

import FormSheet from "./components/FormSheet";
import PickerCard from "./components/PickerCard";
import { ListaAddDocs, ListaDetalles } from "./components/Listas";
import SelectorBienes from "./components/SelectorBienes";
import SelectorAddDocs from "./components/SelectorAddDocs";
import { INDICADOR_M1L, SeccionId, TRANSPORTE_PRIVADO } from "./constants";
import { GuiaRemisionFormApi } from "./useGuiaRemisionForm";

type SheetId =
  | "destinatario"
  | "proveedor"
  | "partida"
  | "llegada"
  | "chofer"
  | "transportista"
  | "vehiculo"
  | "secundarios"
  | "detalle";

interface SheetMeta {
  title: string;
  subtitle?: string;
  icon: ReactNode;
  content: ReactNode;
}

/**
 * Construye el contenido de cada sección y las hojas de formulario que abren.
 * Los formularios internos son exactamente los mismos que usa la pantalla
 * original, sólo cambia el contenedor.
 */
export const useContenidoSecciones = (api: GuiaRemisionFormApi) => {
  const [sheet, setSheet] = useState<SheetId | null>(null);
  const cerrar = () => setSheet(null);

  const values = api.formik.values;
  const esM1L = values.envio.indicadores.includes(INDICADOR_M1L);
  const esPrivado = values.envio.modTraslado === TRANSPORTE_PRIVADO;

  const choferDeshabilitado = esM1L && esPrivado;
  const transportistaDeshabilitado = esM1L || esPrivado;

  /* ---------------- Hojas de formulario ---------------- */
  const sheets: Record<SheetId, SheetMeta> = {
    destinatario: {
      title: "Destinatario",
      subtitle: "Quién recibe la mercadería",
      icon: <PersonRoundedIcon />,
      content: (
        <Cliente
          initialValue={values.destinatario}
          onChange={(cliente) => {
            api.onDestinatarioChange(cliente);
            cerrar();
          }}
          tipo={
            values.envio.codTraslado === "02" || values.envio.codTraslado === "04" ? "default" : ""
          }
        />
      ),
    },
    proveedor: {
      title: "Proveedor",
      subtitle: "Opcional, según el motivo de traslado",
      icon: <StorefrontRoundedIcon />,
      content: (
        <Cliente
          initialValue={values.tercero}
          onChange={(cliente) => {
            api.onProveedorChange(cliente);
            cerrar();
          }}
          schema={TerceroSchema}
          tipo="c"
        />
      ),
    },
    partida: {
      title: "Punto de partida",
      subtitle: "Desde dónde sale la mercadería",
      icon: <PersonPinCircleRoundedIcon />,
      content: (
        <DatosDireccion
          initialValue={values.partida}
          onChange={(direccion) => {
            api.onPartidaChange(direccion);
            cerrar();
          }}
          codTraslado={values.envio.codTraslado}
        />
      ),
    },
    llegada: {
      title: "Punto de llegada",
      subtitle: "A dónde llega la mercadería",
      icon: <PinDropRoundedIcon />,
      content: (
        <DatosDireccion
          initialValue={values.llegada}
          onChange={(direccion) => {
            api.onLlegadaChange(direccion);
            cerrar();
          }}
          schema={LlegadaSchema}
          codTraslado={values.envio.codTraslado}
        />
      ),
    },
    chofer: {
      title: "Choferes",
      subtitle: "Principal y secundarios",
      icon: <AssignmentIndRoundedIcon />,
      content: (
        <Conductores
          choferes={values.choferes}
          onConfirm={(choferes) => {
            api.onChoferesChange(choferes);
            cerrar();
          }}
        />
      ),
    },
    transportista: {
      title: "Transportista",
      subtitle: "Sólo en transporte público",
      icon: <CommuteRoundedIcon />,
      content: (
        <DatosTransportista
          initialValue={values.transportista}
          onChange={(transportista) => {
            api.onTransportistaChange(transportista);
            cerrar();
          }}
        />
      ),
    },
    vehiculo: {
      title: "Vehículo principal",
      icon: <LocalShippingRoundedIcon />,
      content: (
        <DatosVehiculo
          initialValue={values.vehiculo}
          onChange={(vehiculo) => {
            api.onVehiculoChange(vehiculo);
            cerrar();
          }}
        />
      ),
    },
    secundarios: {
      title: "Vehículos secundarios",
      subtitle: "Hasta 2 vehículos",
      icon: <AirportShuttleRoundedIcon />,
      content: (
        <VehiculosSecundarios
          vehiculos={values.vehiculo?.secundarios}
          onConfirm={(vehiculos) => {
            api.onVehiculosSecundariosChange(vehiculos);
            cerrar();
          }}
        />
      ),
    },
    detalle: {
      title: "Agregar bien",
      subtitle: "Producto a transportar",
      icon: <AddRoundedIcon />,
      content: (
        <DocumentoDetalle
          onNewDetail={(detalle) => {
            api.onNuevoDetalle(detalle);
            cerrar();
          }}
        />
      ),
    },
  };

  const sheetActual = sheet ? sheets[sheet] : null;

  const sheetElement = (
    <FormSheet
      open={sheet !== null}
      title={sheetActual?.title || ""}
      subtitle={sheetActual?.subtitle}
      icon={sheetActual?.icon}
      onClose={cerrar}
    >
      {sheetActual?.content}
    </FormSheet>
  );

  /* ---------------- Contenido de las secciones ---------------- */
  const choferPrincipal = values.choferes.find((c) => c.tipo === "Principal") || values.choferes[0];
  const secundarios = values.vehiculo?.secundarios || [];

  const contenidos: Record<SeccionId, ReactNode> = {
    generales: (
      <Box display="grid" gap={2}>
        {/* En edición la serie y el correlativo ya están fijados por el documento. */}
        {!api.modoEdicion && (
          <FormControl fullWidth size="small" disabled={api.bloqueada}>
            <InputLabel id="punto-emision-label">Punto de emisión</InputLabel>
            <Select
              labelId="punto-emision-label"
              label="Punto de emisión"
              name="puntoemision"
              value={api.puntoEmisionSelected}
              onChange={(e) => api.setPuntoEmisionSelected(Number(e.target.value))}
            >
              <MenuItem value={0}>Elige un punto de emisión…</MenuItem>
              {api.puntosEmision?.map((pe) => (
                <MenuItem key={pe.id} value={pe.id}>
                  {pe.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        <DatosGeneralesForm
          onChange={api.onDatosGeneralesChange}
          datosGeneralesValues={values.datosGenerales}
          onSelectSerie={api.onSelectSerie}
          puntoEmision={api.puntoEmisionSelected}
          editMode={api.modoEdicion}
        />
      </Box>
    ),

    envio: <EnvioForm onChange={api.onEnvioChange} EnvioValues={api.envioInicial} />,

    personas: (
      <Box
        display="grid"
        gridTemplateColumns={{ xs: "minmax(0, 1fr)", md: "repeat(2, minmax(0, 1fr))" }}
        gap={1.5}
        minWidth={0}
      >
        <PickerCard
          icono={<PersonRoundedIcon />}
          titulo="Destinatario"
          color="success"
          valor={values.destinatario?.rznSocial}
          detalle={[values.destinatario?.numDoc && `Doc. ${values.destinatario.numDoc}`]}
          textoVacio="Toca para elegir el destinatario"
          disabled={api.bloqueada}
          onClick={() => setSheet("destinatario")}
        />
        <PickerCard
          icono={<StorefrontRoundedIcon />}
          titulo="Proveedor"
          badge="Opcional"
          color="warning"
          valor={values.tercero?.rznSocial}
          detalle={[values.tercero?.numDoc && `Doc. ${values.tercero.numDoc}`]}
          textoVacio="Sólo si aplica al motivo de traslado"
          disabled={api.bloqueada || values.envio?.codTraslado === "04"}
          onClick={() => setSheet("proveedor")}
        />
      </Box>
    ),

    puntos: (
      <Box
        display="grid"
        gridTemplateColumns={{ xs: "minmax(0, 1fr)", md: "repeat(2, minmax(0, 1fr))" }}
        gap={1.5}
        minWidth={0}
      >
        <PickerCard
          icono={<PersonPinCircleRoundedIcon />}
          titulo="Partida"
          color="warning"
          valor={values.partida?.direccion}
          detalle={[
            values.partida?.rznSocial,
            values.partida?.ruc && `RUC ${values.partida.ruc}`,
            values.partida?.codLocal && `Cód. local ${values.partida.codLocal}`,
          ]}
          textoVacio="Toca para elegir el punto de partida"
          disabled={api.bloqueada}
          onClick={() => setSheet("partida")}
        />
        <PickerCard
          icono={<PinDropRoundedIcon />}
          titulo="Llegada"
          color="error"
          valor={values.llegada?.direccion}
          detalle={[
            values.llegada?.rznSocial,
            values.llegada?.ruc && `RUC ${values.llegada.ruc}`,
            values.llegada?.codLocal && `Cód. local ${values.llegada.codLocal}`,
          ]}
          textoVacio="Toca para elegir el punto de llegada"
          disabled={api.bloqueada}
          onClick={() => setSheet("llegada")}
        />
      </Box>
    ),

    bienes: (
      <Box display="grid" gridTemplateColumns="minmax(0, 1fr)" gap={2.5} minWidth={0}>
        <Box minWidth={0}>
          <Typography variant="subtitle2" fontWeight={700} mb={1}>
            Bienes a transportar
          </Typography>
          <SelectorBienes
            onAgregar={api.onNuevoDetalle}
            onAbrirManual={() => setSheet("detalle")}
            disabled={api.bloqueada}
          />
          <Box mt={1.5}>
            <ListaDetalles
              detalles={values.details || []}
              onDelete={api.onEliminarDetalle}
              onCantidad={api.bloqueada ? undefined : api.onCambiarCantidadDetalle}
            />
          </Box>
        </Box>

        <Divider />

        <Box minWidth={0}>
          <Typography variant="subtitle2" fontWeight={700} mb={1}>
            Documentos adicionales
          </Typography>
          <SelectorAddDocs onAgregar={api.onNuevoAddDoc} disabled={api.bloqueada} />
          <Box mt={1.5}>
            <ListaAddDocs adicionales={values.addDocs || []} onDelete={api.onEliminarAddDoc} />
          </Box>
        </Box>
      </Box>
    ),

    transporte: (
      <Box
        display="grid"
        gridTemplateColumns={{ xs: "minmax(0, 1fr)", md: "repeat(2, minmax(0, 1fr))" }}
        gap={1.5}
        minWidth={0}
      >
        <PickerCard
          icono={<AssignmentIndRoundedIcon />}
          titulo="Choferes"
          color="warning"
          valor={
            choferPrincipal ? `${choferPrincipal.nombres} ${choferPrincipal.apellidos}` : undefined
          }
          detalle={[
            choferPrincipal?.licencia && `Licencia ${choferPrincipal.licencia}`,
            values.choferes.length > 1 ? `+${values.choferes.length - 1} secundario(s)` : undefined,
          ]}
          textoVacio={
            choferDeshabilitado ? "No aplica para vehículo M1/L privado" : "Sin chofer asignado"
          }
          disabled={api.bloqueada || choferDeshabilitado}
          onClick={() => setSheet("chofer")}
        />
        <PickerCard
          icono={<CommuteRoundedIcon />}
          titulo="Transportista"
          color="primary"
          valor={values.transportista?.numDoc ? values.transportista.rznSocial : undefined}
          detalle={[
            values.transportista?.numDoc && `RUC ${values.transportista.numDoc}`,
            values.transportista?.nroMtc && `MTC ${values.transportista.nroMtc}`,
          ]}
          textoVacio={
            transportistaDeshabilitado
              ? "Sólo para transporte público"
              : "Obligatorio en transporte público"
          }
          disabled={api.bloqueada || transportistaDeshabilitado}
          onClick={() => setSheet("transportista")}
        />
        <PickerCard
          icono={<LocalShippingRoundedIcon />}
          titulo="Vehículo principal"
          color="error"
          valor={values.vehiculo?.placa || undefined}
          detalle={[
            values.vehiculo?.nroCirculacion && `Circulación ${values.vehiculo.nroCirculacion}`,
          ]}
          textoVacio="Sin placa registrada"
          disabled={api.bloqueada}
          onClick={() => setSheet("vehiculo")}
        />
        <PickerCard
          icono={<AirportShuttleRoundedIcon />}
          titulo="Vehículos secundarios"
          badge="Opcional"
          color="info"
          valor={secundarios.length > 0 ? secundarios.map((v) => v.placa).join(" · ") : undefined}
          textoVacio={
            values.vehiculo?.placa === ""
              ? "Primero registra el vehículo principal"
              : "Sin vehículos secundarios"
          }
          disabled={api.bloqueada || values.vehiculo?.placa === ""}
          onClick={() => setSheet("secundarios")}
        />
      </Box>
    ),

    observaciones: (
      <TextField
        fullWidth
        multiline
        rows={4}
        label="Observaciones"
        placeholder="Texto libre que se imprime en la guía"
        value={values.observacion || ""}
        disabled={api.bloqueada}
        onChange={(e) => api.onObservacionChange(e.target.value)}
        inputProps={{ style: { textTransform: "uppercase" } }}
      />
    ),
  };

  return { contenidos, sheetElement };
};
