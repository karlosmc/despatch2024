import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dayjs from "dayjs";
import { isObject, useFormik } from "formik";
import { useBlocker, useNavigate, useParams } from "react-router-dom";
import { Theme, useMediaQuery } from "@mui/material";

import {
  AddDoc,
  Client,
  DatosGenerales,
  Detail,
  Direccion,
  Envio,
  EnvioChoferes,
  EnvioVehiculo,
  GuiaRemision,
  Transportista,
} from "../../types/guias/guiaremision.interface";
import { puntoEmision } from "../../types/puntoemision.interface";

import { GuiaRemisionSchema } from "../../utils/validateGuiaRemision";
import { useNotification } from "../../context/notification.context";
import { useAuthStore } from "../../store/authStore";

import { GuiaServices } from "../../service/GuiaServices";
import { PuntoEmisionService } from "../../service/PuntoEmisionService";
import { ConductoresService } from "../../service/ConductoresServices";
import { GuiaElectronicaService } from "../../service/GuiaElectronicaService";
import { NumeracionService } from "../../service/NumeracionService";

import {
  EXIGIR_FEC_INICIO_TRASLADO,
  EnvioValues,
  INDICADOR_M1L,
  SeccionId,
  TRANSPORTE_PRIVADO,
  TRANSPORTE_PUBLICO,
  VehiculoValues,
  initialValues,
} from "./constants";
import { mapearGuiaDesdeApi } from "./mapeo";

/** "borrador" guarda solo en la base de datos; "sunat" guarda y abre el envío electrónico. */
export type ModoGuardado = "borrador" | "sunat";

export type EstadoSecciones = Record<SeccionId, boolean>;

const RUTA_SALIDA = "/admin/guias";

/** Estados electrónicos que ya no admiten cambios: aceptada por SUNAT o dada de baja. */
const ESTADOS_CERRADOS = ["F", "B"];

/** Devuelve el primer mensaje de error de un objeto de errores de formik (anidado). */
const primerMensajeDeError = (errores: unknown): string | null => {
  if (!errores) return null;
  if (typeof errores === "string") return errores;
  if (Array.isArray(errores)) {
    for (const item of errores) {
      const mensaje = primerMensajeDeError(item);
      if (mensaje) return mensaje;
    }
    return null;
  }
  if (isObject(errores)) {
    for (const valor of Object.values(errores)) {
      const mensaje = primerMensajeDeError(valor);
      if (mensaje) return mensaje;
    }
  }
  return null;
};

/**
 * El transportista sólo existe en transporte público y sin indicador M1/L.
 * Es la misma regla con la que la pantalla deshabilita su selector.
 */
const aplicaTransportista = (envio: Envio): boolean =>
  envio.modTraslado === TRANSPORTE_PUBLICO && !envio.indicadores.includes(INDICADOR_M1L);

/** El backend responde 409 cuando la serie + correlativo ya está tomada. */
const esConflictoDeDuplicado = (error: any): boolean => {
  const texto =
    typeof error === "string" ? error : error?.message || error?.error || String(error || "");
  return /ya existe|duplicad|409/i.test(texto);
};

export const useGuiaRemisionForm = () => {
  const navigate = useNavigate();
  const { id: guiaId } = useParams<{ id: string }>();
  const { getError, getSuccess, getWarning } = useNotification();
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("sm"));

  const user = useAuthStore((state) => state.user);

  const modoEdicion = Boolean(guiaId);

  /* ---------- Estado de apoyo ---------- */
  const [puntosEmision, setPuntosEmision] = useState<puntoEmision[]>([]);
  const [puntoEmisionSelected, setPuntoEmisionSelected] = useState<number>(0);

  const [adicionalDocs, setAdicionalDocs] = useState<AddDoc[]>([]);
  const [detalles, setDetalles] = useState<Detail[]>([]);

  /**
   * Referencia estable para `EnvioForm` (que se reinicializa con esta prop).
   * En creación es la constante; en edición se reemplaza una sola vez al cargar.
   */
  const [envioInicial, setEnvioInicial] = useState<Envio>(EnvioValues);

  /* ---------- Estado del guardado / envío ---------- */
  const [cargando, setCargando] = useState<boolean>(false);
  const [idDespatch, setIdDespatch] = useState<number | null>(null);
  const [estadoElectronico, setEstadoElectronico] = useState<number | null>(null);
  const [estadoGuia, setEstadoGuia] = useState<string | null>(null);
  const [datosParaProcesar, setDatosParaProcesar] = useState<any>(null);
  const [modalSunatOpen, setModalSunatOpen] = useState<boolean>(false);
  const [guardando, setGuardando] = useState<boolean>(false);
  const [generandoPdf, setGenerandoPdf] = useState<boolean>(false);
  const [enviadaSunat, setEnviadaSunat] = useState<boolean>(false);

  /** Candado síncrono: dos clics en el mismo tick no pueden crear dos guías. */
  const operacionEnCurso = useRef<boolean>(false);
  /** Una vez dada de alta, esta pantalla nunca vuelve a hacer un POST. */
  const guiaYaCreada = useRef<boolean>(false);

  /* ---------- Vista previa ---------- */
  const [base64Pdf, setBase64Pdf] = useState<string>("");
  const [openPreview, setOpenPreview] = useState<boolean>(false);

  /* ---------- Confirmaciones automáticas ---------- */
  const [conductorFound, setConductorFound] = useState<EnvioChoferes[]>([]);
  const [openConfirmChofer, setOpenConfirmChofer] = useState<boolean>(false);
  const [vehiculoFound, setVehiculoFound] = useState<EnvioVehiculo>(VehiculoValues);
  const [openConfirmVehiculo, setOpenConfirmVehiculo] = useState<boolean>(false);

  /* ---------- Salida ---------- */
  const [salidaOpen, setSalidaOpen] = useState<boolean>(false);
  const permitirSalida = useRef<boolean>(false);
  const snapshotGuardado = useRef<string>("");
  const [cambiosSinGuardar, setCambiosSinGuardar] = useState<boolean>(false);
  /**
   * Al cargar una guía, los sub-formularios (`EnvioForm`, `DatosGeneralesForm`)
   * reescriben sus campos en sus primeros efectos. Durante esa ventana se
   * re-toma la referencia en vez de marcar la guía como modificada.
   */
  const ventanaDeAsentado = useRef<number>(0);

  /* =========================================================
   *  Validaciones de negocio (idénticas al formulario original)
   * ========================================================= */
  const validarNegocio = (values: GuiaRemision): string | null => {
    const { destinatario, envio, vehiculo, transportista, partida, llegada, details } = values;
    const { fechaEmision } = values.datosGenerales;
    const { fecTraslado, indicadores } = envio;

    if (fecTraslado && fechaEmision) {
      const parseFechaEmision = new Date(fechaEmision);
      const parseFecTraslado = new Date(fecTraslado);

      if (isNaN(parseFechaEmision.getTime()) || isNaN(parseFecTraslado.getTime())) {
        return "Las fechas ingresadas no son válidas";
      }

      const fechaActual = new Date();
      const dosDiasAdelante = new Date(fechaActual);
      dosDiasAdelante.setDate(fechaActual.getDate() + 2);

      const fechaEmisionSinHora = new Date(
        parseFechaEmision.getFullYear(),
        parseFechaEmision.getMonth(),
        parseFechaEmision.getDate()
      );
      const dosDiasAdelanteSinHora = new Date(
        dosDiasAdelante.getFullYear(),
        dosDiasAdelante.getMonth(),
        dosDiasAdelante.getDate()
      );

      // En edición la fecha de emisión ya está fijada por el documento original.
      if (!modoEdicion && fechaEmisionSinHora > dosDiasAdelanteSinHora) {
        return "La fecha de emisión no puede ser posterior a 2 días de la fecha actual";
      }

      if (parseFecTraslado < parseFechaEmision) {
        return "Datos de Envío: La fecha de traslado debe ser mayor a la fecha de Emisión de la Guía";
      }
    }

    // Un transportista que ya no aplica (se cambió a privado) no exime de la placa.
    const tieneTransportista = aplicaTransportista(envio) && transportista.numDoc !== "";
    if (!indicadores.includes(INDICADOR_M1L) && !tieneTransportista) {
      if (vehiculo.placa === "") {
        return "Debe escribir una Placa";
      }
    }

    if (!destinatario || !destinatario.numDoc) {
      return "Debe especificar un destinatario válido";
    }

    if (!partida || !partida.direccion) {
      return "Debe especificar una dirección de partida";
    }

    if (!llegada || !llegada.direccion) {
      return "Debe especificar una dirección de llegada";
    }

    if (!details || details.length === 0) {
      return "Debe agregar al menos un producto/detalle";
    }

    if (
      EXIGIR_FEC_INICIO_TRASLADO &&
      envio.modTraslado === TRANSPORTE_PUBLICO &&
      values.choferes.length > 0 &&
      !envio.fecInicioTrasladoBienes
    ) {
      return "Datos de Envío: La fecha de inicio de traslado de bienes debe elegirse";
    }

    return null;
  };

  /** Normaliza `fecInicioTrasladoBienes` según la modalidad de traslado. */
  const normalizarEnvio = (values: GuiaRemision): Envio => {
    const envio: Envio = { ...values.envio };

    if (envio.modTraslado === TRANSPORTE_PUBLICO && values.choferes.length === 0) {
      envio.fecInicioTrasladoBienes = envio.fecTraslado;
    }
    if (envio.modTraslado === TRANSPORTE_PRIVADO) {
      envio.fecInicioTrasladoBienes = null;
    }

    return envio;
  };

  /** Arma el documento que espera el backend / el servicio electrónico. */
  const construirDoc = (values: GuiaRemision, envio: Envio = normalizarEnvio(values)) => ({
    fechaEmision: values.datosGenerales.fechaEmision + " " + dayjs().format("HH:mm"),
    correlativo: values.datosGenerales.correlativo,
    serie: values.datosGenerales.serie,
    tipoDoc: values.datosGenerales.tipoDoc,
    version: values.datosGenerales.version,
    observacion: values.observacion,
    destinatario: values.destinatario,
    tercero: values.tercero.numDoc !== "" ? values.tercero : null,
    comprador: null,
    envio: {
      ...envio,
      partida: values.partida,
      llegada: values.llegada,
      vehiculo: values.vehiculo.placa !== "" ? values.vehiculo : null,
      aeropuerto: null,
      puerto: null,
      choferes: values.choferes,
      // Se decide por la modalidad, no sólo por si hay datos cargados: si se
      // cambió a privado (o se marcó M1/L) el transportista nunca viaja en la trama.
      transportista:
        aplicaTransportista(envio) && values.transportista.numDoc !== ""
          ? values.transportista
          : null,
    },
    addDocs: values.addDocs,
    details: values.details,
  });

  /* =========================================================
   *  Formik
   * ========================================================= */
  const formik = useFormik<GuiaRemision>({
    initialValues: initialValues,
    validationSchema: GuiaRemisionSchema,
    enableReinitialize: false,
    onSubmit: () => {
      /* El guardado se dispara desde guardar() para poder distinguir el modo. */
    },
  });

  const marcarComoGuardado = (values: GuiaRemision) => {
    snapshotGuardado.current = JSON.stringify(values);
    setCambiosSinGuardar(false);
  };

  const bloqueada = ESTADOS_CERRADOS.includes(estadoGuia || "");

  /* =========================================================
   *  Anti-duplicidad: refrescar el correlativo de la serie
   * ========================================================= */
  const refrescarCorrelativo = useCallback(async () => {
    if (modoEdicion || !puntoEmisionSelected) return;
    try {
      const { data } = await NumeracionService.getNumeracionByIdPuntoEmision(puntoEmisionSelected);
      const actual = (data || []).find(
        (item: any) => item.serie === formik.values.datosGenerales.serie
      );
      if (actual) {
        formik.setFieldValue("datosGenerales.correlativo", String(actual.numeroActual + 1));
      }
    } catch (error) {
      console.log("No se pudo refrescar el correlativo", error);
    }
  }, [modoEdicion, puntoEmisionSelected, formik.values.datosGenerales.serie]);

  /* =========================================================
   *  Guardado
   * ========================================================= */

  /**
   * Un mismo problema puede llegar como excepción (409) o como cuerpo 200 con
   * `exito: false`; ambos casos pasan por aquí para que el aviso sea el mismo.
   */
  const reportarFallo = async (
    detalle: string,
    esActualizacion: boolean,
    idUsado: number | null
  ) => {
    const { serie, correlativo } = formik.values.datosGenerales;

    console.warn("Guardado rechazado", {
      metodo: esActualizacion ? "PUT" : "POST",
      idDespatch: idUsado,
      documento: `${serie}-${correlativo}`,
      detalle,
    });

    if (!esConflictoDeDuplicado(detalle)) {
      getError(detalle);
      return;
    }

    if (esActualizacion) {
      getError(
        `El servidor rechazó la actualización de ${serie}-${correlativo} porque ya existe un despacho con esa serie y correlativo. Revisa en el Panel de Guías si el documento quedó duplicado.`
      );
      return;
    }

    getError(
      `Ya existe una guía ${serie}-${correlativo}. Se actualizó el correlativo, vuelve a intentar.`
    );
    await refrescarCorrelativo();
  };

  const guardar = async (modo: ModoGuardado): Promise<boolean> => {
    // Candado síncrono + estado: ni el doble clic ni el doble render duplican.
    if (operacionEnCurso.current || guardando) return false;

    if (bloqueada) {
      getError(
        estadoGuia === "B"
          ? "La guía está dada de baja y ya no puede modificarse"
          : "La guía ya fue aceptada por SUNAT y ya no puede modificarse"
      );
      return false;
    }

    if (modo === "sunat" && enviadaSunat) {
      getWarning("Esta guía ya fue enviada a SUNAT en esta sesión");
      return false;
    }

    operacionEnCurso.current = true;
    setGuardando(true);

    try {
      const errores = await formik.validateForm();
      if (Object.keys(errores).length > 0) {
        getError(primerMensajeDeError(errores) || "Revisa los datos del formulario");
        return false;
      }

      const values = formik.values;

      const errorNegocio = validarNegocio(values);
      if (errorNegocio) {
        getError(errorNegocio);
        return false;
      }

      const envio = normalizarEnvio(values);
      const doc = construirDoc(values, envio);

      /**
       * Sólo se da de alta (POST) cuando no hay ningún id conocido. En edición
       * el id de la URL sirve de respaldo, así una guía existente jamás se
       * vuelve a crear aunque el estado se haya perdido.
       */
      const idExistente =
        idDespatch ?? (modoEdicion && guiaId ? Number(guiaId) : null) ?? null;
      const esActualizacion = Boolean(idExistente);

      if (!esActualizacion && guiaYaCreada.current) {
        getError(
          "Esta guía ya se creó pero no se pudo recuperar su número interno. Ábrela desde el Panel de Guías para seguir editándola."
        );
        return false;
      }

      const response = esActualizacion
        ? await GuiaServices.update(doc, idExistente as number)
        : await GuiaServices.save(doc);

      // El backend puede responder 200 con `exito: false` en vez de un 409.
      if (!response || !response.exito) {
        await reportarFallo(
          response?.message || response?.error || "Error al procesar la guía",
          esActualizacion,
          idExistente
        );
        return false;
      }

      if (!esActualizacion) {
        const nuevoId =
          response?.despatch?.id ?? response?.despatch?.id_despatch ?? response?.id ?? null;

        guiaYaCreada.current = true;
        setIdDespatch(nuevoId);
        setEstadoElectronico(response?.electronico ?? null);

        if (!nuevoId) {
          console.warn("El alta no devolvió el id del despacho:", response);
        }
      }

      setDatosParaProcesar(doc);
      marcarComoGuardado(values);

      if (modo === "sunat") {
        getSuccess("La guía se guardó correctamente, se procede a enviar a SUNAT");
        setModalSunatOpen(true);
      } else {
        getSuccess(
          esActualizacion
            ? "Cambios guardados. La guía sigue sin enviarse a SUNAT."
            : "Guía guardada sin enviar a SUNAT. Puedes enviarla más tarde desde el Panel de Guías."
        );
      }

      return true;
    } catch (error) {
      const detalle =
        typeof error === "string"
          ? error
          : error instanceof Error
          ? error.message
          : String(error || "Error inesperado al procesar la guía");

      await reportarFallo(
        detalle,
        Boolean(idDespatch ?? (modoEdicion && guiaId ? Number(guiaId) : null)),
        idDespatch
      );
      console.error("Error al guardar la guía:", error);
      return false;
    } finally {
      operacionEnCurso.current = false;
      setGuardando(false);
    }
  };

  /* =========================================================
   *  Vista previa PDF
   * ========================================================= */
  const previsualizarPdf = async () => {
    const errores = await formik.validateForm();
    if (Object.keys(errores).length > 0) {
      getError(primerMensajeDeError(errores) || "Revisa los datos del formulario");
      return;
    }

    setGenerandoPdf(true);
    try {
      const doc = construirDoc(formik.values);
      const { response } = await GuiaElectronicaService.getPdfPreview(doc);

      if (!response?.TramaPdf) {
        getError("No se pudo generar la vista previa del PDF");
        return;
      }

      setBase64Pdf(response.TramaPdf);

      if (isMobile) {
        const link = document.createElement("a");
        link.href = `data:application/pdf; base64,${response.TramaPdf}`;
        link.download = `${doc.serie}-${doc.correlativo}.pdf`;
        link.click();
      } else {
        setOpenPreview(true);
      }
    } catch (error) {
      getError(typeof error === "string" ? error : "Hubo un error al generar el PDF");
    } finally {
      setGenerandoPdf(false);
    }
  };

  /* =========================================================
   *  Carga inicial
   * ========================================================= */
  const getPuntosEmision = useCallback(async () => {
    try {
      const response = await PuntoEmisionService.getPuntosByUserId(user.id);
      setPuntosEmision(response || []);
      if (response?.length === 1) {
        setPuntoEmisionSelected(response[0].id);
      }
    } catch (error) {
      console.log(error || "Hubo un error al obtener los puntos de emisión del usuario");
    }
  }, [user]);

  const buscarConductorPorNroDoc = useCallback(async (nrodoc: string) => {
    try {
      const { data } = await ConductoresService.getConductorByNroDoc(nrodoc);
      if (data.length > 0) {
        const chofer = data[0];
        setConductorFound([
          {
            apellidos: chofer.apellidos,
            licencia: chofer.licencia,
            nombres: chofer.nombres,
            nroDoc: chofer.nroDoc,
            tipoDoc: chofer.tipoDoc,
            tipo: "Principal",
            id: chofer.id,
          },
        ]);
        setOpenConfirmChofer(true);
      }
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    getPuntosEmision();
    // En edición los choferes vienen del documento; no se sugiere el del usuario.
    if (!modoEdicion) {
      buscarConductorPorNroDoc(user.documento);
    }
  }, [user, modoEdicion, getPuntosEmision, buscarConductorPorNroDoc]);

  /* Carga de la guía a editar */
  useEffect(() => {
    if (!guiaId || !user) return;

    let cancelado = false;

    const cargarGuia = async () => {
      setCargando(true);
      try {
        const response = await GuiaServices.get(parseInt(guiaId));
        const guiaData = response?.data;

        if (!guiaData) {
          getError("No se encontró la guía solicitada");
          navigate(RUTA_SALIDA);
          return;
        }

        if (cancelado) return;

        const cargada = mapearGuiaDesdeApi(guiaData);

        formik.setValues(cargada.values);
        setEnvioInicial(cargada.envio);
        setAdicionalDocs(cargada.addDocs);
        setDetalles(cargada.detalles);
        setIdDespatch(cargada.idDespatch);
        setEstadoElectronico(cargada.idElectronico);
        setEstadoGuia(cargada.estado);
        marcarComoGuardado(cargada.values);
        ventanaDeAsentado.current = Date.now() + 1500;

        if (ESTADOS_CERRADOS.includes(cargada.estado || "")) {
          getWarning(
            cargada.estado === "B"
              ? "Guía dada de baja: sólo lectura"
              : "Guía aceptada por SUNAT: sólo lectura"
          );
        } else {
          getSuccess(
            `Guía ${cargada.values.datosGenerales.serie}-${cargada.values.datosGenerales.correlativo} cargada para edición`
          );
        }
      } catch (error) {
        console.error("Error al cargar la guía:", error);
        getError(typeof error === "string" ? error : "Error al cargar los datos de la guía");
        navigate(RUTA_SALIDA);
      } finally {
        if (!cancelado) setCargando(false);
      }
    };

    cargarGuia();

    return () => {
      cancelado = true;
    };
  }, [guiaId, user]);

  useEffect(() => {
    formik.setFieldValue("addDocs", adicionalDocs);
  }, [adicionalDocs]);

  useEffect(() => {
    formik.setFieldValue("details", detalles);
  }, [detalles]);

  /*
   * Al pasar a transporte privado (o marcar M1/L) se quita el transportista del
   * formulario, para que la pantalla y el resumen no muestren algo que ya no se
   * va a enviar. `construirDoc` igual lo excluye por si llegara a quedar.
   */
  const indicadoresClave = formik.values.envio.indicadores.join("|");
  useEffect(() => {
    if (aplicaTransportista(formik.values.envio)) return;
    if (!formik.values.transportista?.numDoc) return;

    formik.setFieldValue("transportista", { ...initialValues.transportista });
    getWarning("Se quitó el transportista: sólo aplica en transporte público");
  }, [formik.values.envio.modTraslado, indicadoresClave]);

  /* =========================================================
   *  Handlers de cada sección
   * ========================================================= */
  const onDatosGeneralesChange = useCallback((datosGenerales: DatosGenerales) => {
    formik.setFieldValue("datosGenerales", datosGenerales);
  }, []);

  const onEnvioChange = useCallback((envio: Envio) => {
    formik.setFieldValue("envio", envio);
  }, []);

  const onSelectSerie = (vehiculo: EnvioVehiculo): void => {
    if (modoEdicion) return;
    if (vehiculo.placa) {
      setVehiculoFound(vehiculo);
      setOpenConfirmVehiculo(true);
    }
  };

  const onDestinatarioChange = (cliente: Client) => formik.setFieldValue("destinatario", cliente);
  const onProveedorChange = (cliente: Client) => formik.setFieldValue("tercero", cliente);
  const onPartidaChange = (direccion: Direccion) => formik.setFieldValue("partida", direccion);
  const onLlegadaChange = (direccion: Direccion) => formik.setFieldValue("llegada", direccion);
  const onTransportistaChange = (transportista: Transportista) =>
    formik.setFieldValue("transportista", transportista);
  const onVehiculoChange = (vehiculo: EnvioVehiculo) => formik.setFieldValue("vehiculo", vehiculo);
  const onVehiculosSecundariosChange = (vehiculos: EnvioVehiculo[]) =>
    formik.setFieldValue("vehiculo.secundarios", vehiculos);
  const onChoferesChange = (choferes: EnvioChoferes[]) => formik.setFieldValue("choferes", choferes);
  const onObservacionChange = (observacion: string) =>
    formik.setFieldValue("observacion", observacion.toUpperCase());

  /** Evita duplicar el mismo comprobante adicional (mismo emisor + número). */
  const onNuevoAddDoc = (nuevo: AddDoc) => {
    const yaExiste = adicionalDocs.some(
      (doc) => doc.emisor === nuevo.emisor && doc.nro === nuevo.nro
    );
    if (yaExiste) {
      getWarning(`El documento ${nuevo.nro} ya está agregado`);
      return;
    }
    setAdicionalDocs((docs) => [...docs, nuevo]);
  };

  const onEliminarAddDoc = (item: AddDoc) =>
    setAdicionalDocs((docs) => docs.filter((it) => it.emisor !== item.emisor || it.nro !== item.nro));

  /** Evita duplicar el mismo producto: si ya está, suma la cantidad. */
  const onNuevoDetalle = (nuevo: Detail) => {
    const yaExiste = detalles.some((det) => det.codigo === nuevo.codigo);
    if (yaExiste) {
      setDetalles((items) =>
        items.map((det) =>
          det.codigo === nuevo.codigo
            ? { ...det, cantidad: Number(det.cantidad) + Number(nuevo.cantidad) }
            : det
        )
      );
      getWarning(`${nuevo.codigo} ya estaba en la lista: se sumó la cantidad`);
      return;
    }
    setDetalles((items) => [...items, nuevo]);
  };

  const onEliminarDetalle = (item: Detail) =>
    setDetalles((items) => items.filter((it) => it.codigo !== item.codigo));

  /** Edición de cantidad en la propia lista, sin abrir el formulario. */
  const onCambiarCantidadDetalle = (item: Detail, cantidad: number) => {
    if (!cantidad || cantidad <= 0) return;
    setDetalles((items) =>
      items.map((it) => (it.codigo === item.codigo ? { ...it, cantidad } : it))
    );
  };

  const confirmarChoferEncontrado = () => {
    formik.setFieldValue("choferes", conductorFound);
    setOpenConfirmChofer(false);
  };

  const confirmarVehiculoEncontrado = () => {
    formik.setFieldValue("vehiculo", vehiculoFound);
    setOpenConfirmVehiculo(false);
  };

  /* =========================================================
   *  Progreso por sección
   * ========================================================= */
  const secciones: EstadoSecciones = useMemo(() => {
    const v = formik.values;
    const esM1L = v.envio.indicadores.includes(INDICADOR_M1L);

    const transporteListo =
      esM1L ||
      (v.envio.modTraslado === TRANSPORTE_PUBLICO
        ? v.transportista.numDoc !== ""
        : v.vehiculo.placa !== "");

    return {
      generales: v.datosGenerales.serie !== "" && Number(v.datosGenerales.correlativo) > 0,
      envio: v.envio.codTraslado !== "" && !!v.envio.fecTraslado && Number(v.envio.pesoTotal) > 0,
      personas: !!v.destinatario?.numDoc,
      puntos: !!v.partida?.direccion && !!v.llegada?.direccion,
      bienes: (v.details?.length || 0) > 0,
      transporte: transporteListo,
      observaciones: true,
    };
  }, [formik.values]);

  const progreso = useMemo(() => {
    const requeridas: SeccionId[] = [
      "generales",
      "envio",
      "personas",
      "puntos",
      "bienes",
      "transporte",
    ];
    const completas = requeridas.filter((id) => secciones[id]).length;
    return Math.round((completas / requeridas.length) * 100);
  }, [secciones]);

  /* =========================================================
   *  Control de salida
   * ========================================================= */
  const hayDatos = useMemo(() => {
    const v = formik.values;
    return Boolean(
      v.destinatario?.numDoc ||
        v.tercero?.numDoc ||
        v.details?.length ||
        v.addDocs?.length ||
        v.partida?.direccion ||
        v.llegada?.direccion ||
        v.choferes?.length ||
        v.vehiculo?.placa ||
        v.transportista?.numDoc ||
        v.observacion ||
        v.envio?.codTraslado
    );
  }, [formik.values]);

  useEffect(() => {
    const huella = JSON.stringify(formik.values);

    if (Date.now() < ventanaDeAsentado.current) {
      snapshotGuardado.current = huella;
      setCambiosSinGuardar(false);
      return;
    }

    setCambiosSinGuardar(huella !== snapshotGuardado.current);
  }, [formik.values]);

  const hayCambiosPendientes = hayDatos && cambiosSinGuardar && !bloqueada;

  /* Corta la navegación dentro de la app mientras haya cambios sin guardar. */
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      !permitirSalida.current &&
      hayCambiosPendientes &&
      currentLocation.pathname !== nextLocation.pathname
  );

  useEffect(() => {
    if (blocker.state === "blocked") setSalidaOpen(true);
  }, [blocker.state]);

  /* Avisa también al cerrar la pestaña o recargar. */
  useEffect(() => {
    if (!hayCambiosPendientes) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [hayCambiosPendientes]);

  const salirDefinitivamente = () => {
    permitirSalida.current = true;
    setSalidaOpen(false);
    if (blocker.state === "blocked") {
      blocker.proceed?.();
    } else {
      navigate(RUTA_SALIDA);
    }
  };

  const solicitarSalida = () => {
    if (!hayCambiosPendientes) {
      salirDefinitivamente();
      return;
    }
    setSalidaOpen(true);
  };

  const salirSinGuardar = () => salirDefinitivamente();

  const guardarYSalir = async () => {
    const ok = await guardar("borrador");
    if (ok) salirDefinitivamente();
  };

  const cancelarSalida = () => {
    setSalidaOpen(false);
    if (blocker.state === "blocked") blocker.reset?.();
  };

  /* =========================================================
   *  Resultado del envío electrónico
   * ========================================================= */
  const onProcesoSuccess = () => {
    setEnviadaSunat(true);
    permitirSalida.current = true;
    setCambiosSinGuardar(false);
    getSuccess("Guia enviada correctamente a SUNAT");
    setTimeout(() => navigate(RUTA_SALIDA), 2000);
  };

  const onProcesoError = (error: any) => {
    let errorMessage = "Error en el proceso de la guía electrónica";
    if (typeof error === "string") errorMessage = error;
    else if (error?.message) errorMessage = error.message;
    else if (error?.toString) errorMessage = error.toString();
    getError(errorMessage);
  };

  return {
    formik,
    isMobile,
    modoEdicion,
    cargando,
    bloqueada,
    estadoGuia,
    envioInicial,

    puntosEmision,
    puntoEmisionSelected,
    setPuntoEmisionSelected,

    secciones,
    progreso,

    guardando,
    guardar,
    guardada: idDespatch !== null,
    enviadaSunat,

    generandoPdf,
    previsualizarPdf,
    base64Pdf,
    openPreview,
    cerrarPreview: () => setOpenPreview(false),

    modalSunatOpen,
    cerrarModalSunat: () => setModalSunatOpen(false),
    datosParaProcesar,
    estadoElectronico,
    onProcesoSuccess,
    onProcesoError,

    conductorFound,
    openConfirmChofer,
    cancelarChoferEncontrado: () => setOpenConfirmChofer(false),
    confirmarChoferEncontrado,

    vehiculoFound,
    openConfirmVehiculo,
    cancelarVehiculoEncontrado: () => setOpenConfirmVehiculo(false),
    confirmarVehiculoEncontrado,

    salidaOpen,
    hayCambiosPendientes,
    solicitarSalida,
    salirSinGuardar,
    guardarYSalir,
    cancelarSalida,

    onDatosGeneralesChange,
    onEnvioChange,
    onSelectSerie,
    onDestinatarioChange,
    onProveedorChange,
    onPartidaChange,
    onLlegadaChange,
    onTransportistaChange,
    onVehiculoChange,
    onVehiculosSecundariosChange,
    onChoferesChange,
    onObservacionChange,
    onNuevoAddDoc,
    onEliminarAddDoc,
    onNuevoDetalle,
    onEliminarDetalle,
    onCambiarCantidadDetalle,
  };
};

export type GuiaRemisionFormApi = ReturnType<typeof useGuiaRemisionForm>;
