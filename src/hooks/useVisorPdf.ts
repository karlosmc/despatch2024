import { useCallback, useEffect, useRef, useState } from "react";
import type { VisorPdfProps } from "../components/VisorPdf";

/** PDF que llega en base64 (servicio anterior) convertido a Blob para el visor. */
export const base64APdf = (base64: string): Blob => {
  const datos = base64.includes(",") ? base64.split(",")[1] : base64;
  const binario = atob(datos);
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i);
  return new Blob([bytes], { type: "application/pdf" });
};

type Obtenido = Blob | { blob: Blob; nombre?: string };

interface OpcionesVisor {
  /**
   * Si no se pudo obtener el PDF: el visor se cierra y se avisa con esto (p. ej.
   * `getError` de las notificaciones). Sin él, el motivo se muestra dentro del visor.
   */
  onError?: (mensaje: string) => void;
}

/**
 * Estado del visor de PDF. `abrir` muestra el visor al instante ("Obteniendo el
 * PDF…") y luego el archivo. La primera respuesta negativa corta el proceso:
 * cierra el visor y avisa. Cerrar el visor cancela la descarga en curso.
 *
 *   const visor = useVisorPdf({ onError: getError });
 *   visor.abrir("T001-1.pdf", (signal) => EmisionService.archivo(id, "pdf", "a4", signal));
 *   <VisorPdf {...visor.props} />
 */
export const useVisorPdf = ({ onError }: OpcionesVisor = {}) => {
  const [estado, setEstado] = useState<Omit<VisorPdfProps, "onCerrar">>({
    abierto: false,
    archivo: null,
    nombre: "",
    cargando: false,
    error: null,
  });

  /** Descarga en curso: se cancela al cerrar o al pedir otro PDF. */
  const enCurso = useRef<AbortController | null>(null);
  const avisar = useRef(onError);
  avisar.current = onError;

  const cancelar = () => {
    enCurso.current?.abort();
    enCurso.current = null;
  };

  const cerrar = useCallback(() => {
    cancelar();
    setEstado((e) => ({ ...e, abierto: false, archivo: null, cargando: false, error: null }));
  }, []);

  const abrir = useCallback(async (nombre: string, obtener: (signal: AbortSignal) => Promise<Obtenido>) => {
    cancelar();
    const controlador = new AbortController();
    enCurso.current = controlador;
    setEstado({ abierto: true, archivo: null, nombre, cargando: true, error: null });

    try {
      const obtenido = await obtener(controlador.signal);
      if (controlador.signal.aborted) return;

      const blob = obtenido instanceof Blob ? obtenido : obtenido.blob;
      if (!blob || blob.size === 0) throw "El PDF llegó vacío";

      const nombreFinal = obtenido instanceof Blob ? nombre : obtenido.nombre || nombre;
      setEstado((e) => ({ ...e, archivo: blob, nombre: nombreFinal, cargando: false }));
    } catch (error) {
      // Cerrado por el usuario o reemplazado por otro PDF: no hay nada que avisar
      if (controlador.signal.aborted || error === "cancelado") return;

      const mensaje = typeof error === "string" && error ? error : "No se pudo obtener el PDF";
      if (avisar.current) {
        setEstado((e) => ({ ...e, abierto: false, archivo: null, cargando: false, error: null }));
        avisar.current(mensaje);
      } else {
        setEstado((e) => ({ ...e, cargando: false, error: mensaje }));
      }
    } finally {
      if (enCurso.current === controlador) enCurso.current = null;
    }
  }, []);

  // Si la pantalla se desmonta con una descarga en curso, se corta
  useEffect(() => () => enCurso.current?.abort(), []);

  const props: VisorPdfProps = { ...estado, onCerrar: cerrar };

  return { abrir, cerrar, props };
};
