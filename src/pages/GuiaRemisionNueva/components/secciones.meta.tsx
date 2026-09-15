import { ReactNode } from "react";

import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import RouteRoundedIcon from "@mui/icons-material/RouteRounded";
import Inventory2RoundedIcon from "@mui/icons-material/Inventory2Rounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";

import { SeccionId } from "../constants";
import { SectionColor } from "./SectionCard";

export interface SeccionMeta {
  id: SeccionId;
  titulo: string;
  tituloCorto: string;
  descripcion: string;
  color: SectionColor;
  icono: ReactNode;
  opcional?: boolean;
}

/** Orden pensado para que cada paso dependa sólo de los anteriores. */
export const SECCIONES: SeccionMeta[] = [
  {
    id: "generales",
    titulo: "Datos generales",
    tituloCorto: "General",
    descripcion: "Punto de emisión, serie y fecha",
    color: "primary",
    icono: <ReceiptLongRoundedIcon />,
  },
  {
    id: "envio",
    titulo: "Traslado",
    tituloCorto: "Traslado",
    descripcion: "Motivo, modalidad, peso y bultos",
    color: "info",
    icono: <LocalShippingRoundedIcon />,
  },
  {
    id: "personas",
    titulo: "Destinatario y proveedor",
    tituloCorto: "Personas",
    descripcion: "A quién se le entrega la mercadería",
    color: "success",
    icono: <PeopleAltRoundedIcon />,
  },
  {
    id: "puntos",
    titulo: "Partida y llegada",
    tituloCorto: "Ruta",
    descripcion: "Direcciones de origen y destino",
    color: "warning",
    icono: <RouteRoundedIcon />,
  },
  {
    id: "bienes",
    titulo: "Bienes y documentos",
    tituloCorto: "Bienes",
    descripcion: "Productos a trasladar y comprobantes",
    color: "secondary",
    icono: <Inventory2RoundedIcon />,
  },
  {
    id: "transporte",
    titulo: "Transporte",
    tituloCorto: "Transporte",
    descripcion: "Chofer, transportista y vehículos",
    color: "error",
    icono: <BadgeRoundedIcon />,
  },
  {
    id: "observaciones",
    titulo: "Observaciones",
    tituloCorto: "Notas",
    descripcion: "Texto libre que se imprime en la guía",
    color: "primary",
    icono: <EditNoteRoundedIcon />,
    opcional: true,
  },
];
