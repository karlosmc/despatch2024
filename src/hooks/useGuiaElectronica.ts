// hooks/useGuiaElectronica.js
import { useState, useCallback } from 'react';
import { GuiaElectronicaService } from '../service/GuiaElectronicaService';

import { useTokenParamsStore } from '../store/tokenParamsStore';


export const useGuiaElectronica = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState(null);
  const [pasoActual, setPasoActual] = useState(0);
  const [datosPasos, setDatosPasos] = useState<any>(null);

  const getToken = useTokenParamsStore(state => state.getToken);
  const asegurarParams = useTokenParamsStore(state => state.asegurarParams);

  const validarYPrepararToken = useCallback(async () => {
    try {
      setProgress('Verificando autenticación...');

      // Obtener/renovar token si es necesario
      const token = await getToken();
      if (!token) {
        throw new Error('No se pudo obtener el token de autenticación');
      }

      setProgress('Token validado correctamente');
      return token;
    } catch (error: any) {
      throw new Error(`Error de autenticación: ${error?.message || error}`);
    }
  }, [getToken]);

  // Función para resetear el estado del hook
  const resetearEstado = useCallback(() => {
    setLoading(false);
    setProgress('');
    setError(null);
    setResultado(null);
    setPasoActual(0);
    setDatosPasos(null);
  }, []);

  // Función para proceso completo
  const procesarGuiaCompleta = useCallback(async (datosGuia,idElectronico) => {
    setLoading(true);
    setError(null);
    setProgress('');
    setPasoActual(0);
    setDatosPasos(null);

    try {
      // Se leen en el momento de enviar, no al montar el componente: así nunca
      // se usan unos params viejos o nulos (si faltan, se recargan aquí).
      setProgress('Cargando parámetros de SUNAT...');
      const params = await asegurarParams();
      const token = await validarYPrepararToken();

      const resultado = await GuiaElectronicaService.procesarGuiaCompleta(
        datosGuia, params,token,idElectronico,
        (mensaje, datosProceso) => {
          setProgress(mensaje);
          if (datosProceso) {
            setPasoActual(datosProceso.pasoActual);
            setDatosPasos(datosProceso.pasos);
          }
        }
      );
      setResultado(resultado);
      return resultado;
    } catch (err: any) {
      // Convertir el error a string para evitar problemas de renderizado en React
      const errorMessage = err?.message || err?.toString() || 'Error desconocido en el proceso';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [asegurarParams, validarYPrepararToken]);

  // Función para reintentar solo la consulta
  const reintentarConsulta = useCallback(async (numeroDocumento: string, ticket: string, idElectronico: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = await asegurarParams();
      const token = await validarYPrepararToken();
      // Si se armó sin RUC (params aún no cargados) queda "-09-T001-1": se completa
      const documento = numeroDocumento.startsWith('-') ? `${params.ruc}${numeroDocumento}` : numeroDocumento;

      const resultadoConsulta = await GuiaElectronicaService.reintentarConsulta(
        documento, ticket, params, token, idElectronico,
        (mensaje) => {
          setProgress(mensaje);
        }
      );
      console.log(resultadoConsulta);

      // Actualizar los datos de los pasos si existen
      if (datosPasos) {
        const nuevosDatosPasos = {
          ...datosPasos,
          consultar: {
            completado: resultadoConsulta.completado,
            datos: resultadoConsulta.datos
          }
        };
        setDatosPasos(nuevosDatosPasos);
        
        // Solo marcar como paso 4 completado si la consulta fue exitosa
        if (resultadoConsulta.completado && resultadoConsulta.success) {
          setPasoActual(4);
        }
      }

      return resultadoConsulta;
    } catch (err: any) {
      const errorMessage = err?.message || err?.toString() || 'Error al reintentar consulta';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [asegurarParams, validarYPrepararToken, datosPasos]);

  return {
    // Proceso completo
    procesarGuiaCompleta,
    // Función de reintento
    reintentarConsulta,
    // Función de reset
    resetearEstado,
    // Estados
    loading,
    progress,
    error,
    resultado,
    pasoActual,
    datosPasos
  };
};