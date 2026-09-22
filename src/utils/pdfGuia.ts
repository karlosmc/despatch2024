import { GuiaServices } from "../service/GuiaServices";

/**
 * PDF con el formato de la empresa, el mismo que muestra "Ver PDF" del panel de
 * guías: se lee la guía ya guardada y se manda a `/GeneraPdfDespatch`.
 */

/** La guía guardada trae los vehículos en una lista con tipo P/S; el PDF los espera anidados. */
export const formatearGuiaParaPdf = (guia: any) => {
  const vehiculos = guia?.envio?.vehiculo?.length > 0
    ? guia.envio.vehiculo.find((ve: any) => ve.tipo === "P")
    : null;
  const secundarios = guia?.envio?.vehiculo?.length > 0
    ? guia.envio.vehiculo.filter((ve: any) => ve.tipo === "S")
    : [];

  if (vehiculos) vehiculos.secundarios = secundarios;

  return {
    ...guia,
    tipoDoc: "09",
    envio: {
      ...guia.envio,
      indicadores: (guia?.envio?.indicadores || []).map((indi: any) => indi.indicador),
      vehiculo: vehiculos,
    },
  };
};

/** Base64 del PDF de una guía ya guardada. Lanza el motivo si no se pudo generar. */
export const pdfDeGuiaGuardada = async (idGuia: number): Promise<string> => {
  const respuesta = await GuiaServices.getPdfById(idGuia);
  const guia = respuesta?.data;
  if (!guia) throw "No se encontró la guía para generar el PDF";

  const { response } = await GuiaServices.getPdf(formatearGuiaParaPdf(guia));
  if (!response?.TramaPdf) throw "El servicio no devolvió el PDF de la guía";
  return response.TramaPdf;
};
