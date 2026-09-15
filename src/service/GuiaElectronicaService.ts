import apiLogged from "../api/axios.auth";
import { apiInitCi } from "../api/axios.ci"
import { ParamsInterface } from "../types/params.interface";


export const GuiaElectronicaService = {

  /* Métodos de Guia electrónica */
  sendApi: async (params: any, api: string) => {
    try {
      const data = await apiInitCi.post(`${api}`, params)
      return data;
    } catch (error: any) {
      console.log(`Hubo un error en el método ${api}`);
      throw error?.response?.data?.message || `Hubo un error en el método ${api}`;
    }
  },
  generar: async (doc: any) => {
    try {
      // console.log(doc);
      // const guiaFormateada = GuiaElectronicaService.formatGuia(doc)
      
      const { data } = await GuiaElectronicaService.sendApi({ doc }, '/GeneraXmlDespatch');
      return data;
    } catch (error: any) {
      console.log(`Hubo un error al generar la Guía`);
      throw error?.response?.data?.message || `Hubo un error al generar la Guía`;
    }
  },
  
  firmar: async (TramaXmlSinFirma: string, numeroDocumento: string, params: ParamsInterface) => {
    try {

      const sign = {
        CertificadoDigital: params.certificado,
        PasswordCertificado: params.clavecertificado,
        TramaXmlSinFirma,
        numeroDocumento
      };
      const { data } = await GuiaElectronicaService.sendApi(sign, '/FirmarXml');
      return data;
    } catch (error: any) {
      console.log(`Hubo un error al firmar la Guía`);
      throw error?.response?.data?.message || `Hubo un error al firmar la Guía`;
    }
  },

  enviar: async (TramaXmlFirmado: string, IdDocumento: string, url: string, TipoDocumento: string, token: string) => {
    try {

      const sendReq = {
        Ruc: '',
        EndPointUrl: url,
        TramaXmlFirmado: TramaXmlFirmado,
        TipoDocumento,
        IdDocumento,
        token
      };
      // console.log(sendReq);
      const { data } = await GuiaElectronicaService.sendApi(sendReq, '/SendDespatch');
      // console.log(data);
      return data;
    } catch (error: any) {
      console.log(`Hubo un error al enviar la Guía`);
      throw error?.response?.data?.message || `Hubo un error al enviar la Guía`;
    }
  },

  consultar: async (numeroDocumento: string, ticket: string, url: string, token: string,) => {
    try {

      const consultReq = {
        access_token: token,
        EndPointUrl: `${url}${ticket}`,
        numeroDocumento
      };
      const { data } = await GuiaElectronicaService.sendApi(consultReq, '/ConsultaGuia');
      return data;
    } catch (error: any) {
      console.log(`Hubo un error al consultar la Guía`);
      throw error?.response?.data?.message || `Hubo un error al consultar la Guía`;
    }
  },
  getPdfPreview: async (doc:any)=>{
    try {
      const {data} = await GuiaElectronicaService.sendApi({doc},`/GeneraPdfDespatch`);
      return data;
    } catch (error:any) {
      console.log(`Hubo un error al generar el PDF`);
      throw error?.response?.data?.message || `Hubo un error al generar el PDF`;
    }
    

  },



  /* Metodos de base de datos */
  get: async (idGuia: number) => {
    try {
      const { data } = await apiLogged(`/api/despatches/${idGuia}`)
      return data;
    } catch (error: any) {
      console.log('Hubo un error en la obtención de la Guia electrónica: ', error);
      throw error?.response?.data?.message || 'Hubo un error en la obtención de la Guia electrónica';
    }
  },
  actualizarEstadoBD: async (idElectronico: number, values: any) => {
    try {
      // Validación previa
      if (!idElectronico || idElectronico <= 0) {
        throw new Error('ID electrónico inválido para actualizar en base de datos');
      }

      const { data } = await apiLogged.put(`/api/estadoelectronico/${idElectronico}`, {
        ...values
      });
      
      // Verificar si la actualización fue exitosa
      if (!data || data.error) {
        throw new Error(data?.message || 'Error al actualizar estado en base de datos');
      }
      
      return data;
    } catch (error: any) {
      console.log('Error al actualizar el estado Electrónico de la guía:', error);
      
      // Manejo específico de errores comunes
      if (error?.response?.status === 404) {
        throw new Error(`No se encontró el registro electrónico con ID: ${idElectronico}`);
      } else if (error?.response?.status === 400) {
        throw new Error(`Datos inválidos para actualizar estado electrónico: ${error?.response?.data?.message || 'Verifique los datos enviados'}`);
      } else if (error?.response?.status === 500) {
        throw new Error('Error interno del servidor al actualizar estado electrónico');
      }
      
      throw new Error(error?.response?.data?.message || error?.message || 'Error al actualizar el estado Electrónico de la guía');
    }
  },
  /* Proceso Completo */
  procesarGuiaCompleta: async (datosGuia: any,  params: ParamsInterface, token: string, idElectronico: number, onProgress) => {

    // Validación inicial del ID electrónico
    if (!idElectronico || idElectronico <= 0) {
      throw new Error('ID electrónico inválido. No se puede procesar la guía sin un ID válido.');
    }

    const numeroDocumento = `${params.ruc}-${datosGuia.tipoDoc}-${datosGuia.serie}-${datosGuia.correlativo}`;
    const IdDocumento = `${datosGuia.serie}-${datosGuia.correlativo}`;
    
    // Estructura para devolver información de cada paso
    const resultadoProceso = {
      pasoActual: 0,
      pasos: {
        generar: { completado: false, datos: null },
        firmar: { completado: false, datos: null },
        enviar: { completado: false, datos: null },
        consultar: { completado: false, datos: null }
      }
    };

    try {

      onProgress?.('Iniciando proceso de Guía electrónica', resultadoProceso);

      //Paso 1: Genera
      const guiaGenerada = await GuiaElectronicaService.generar(datosGuia);
      

      if (!guiaGenerada.response.Exito) {
        console.log('Error al Generar el documento');
        onProgress?.('Error al Generar el documento', resultadoProceso);
        throw new Error(guiaGenerada.response.Descripcion || 'Error al Generar el documento');
      }
      

      
      // Actualizar estado en BD después de generar
      const rutaXml = `/XML/${numeroDocumento}.xml`;
      try {
        await GuiaElectronicaService.actualizarEstadoBD(idElectronico, {
          estado: 'G', //generada
          descripcion: 'Documento Generado con Exito',
          rutaXml
        });
      } catch (bdError) {
        onProgress?.(`Error al actualizar BD después de generar: ${bdError.message}`, resultadoProceso);
        throw new Error(`Guía generada pero falló actualización en BD: ${bdError.message}`);
      }
      
      // Marcar paso 1 como completado con datos
      resultadoProceso.pasoActual = 1;
      resultadoProceso.pasos.generar = { 
        completado: true, 
        datos: { 
          rutaXml,
          descripcion: 'Documento XML generado correctamente'
        } 
      };
      onProgress?.('Guía generada exitosamente', resultadoProceso);

      //Paso 2: Firmado
      const guiaFirmada = await GuiaElectronicaService.firmar(guiaGenerada.response.TramaXmlSinFirma, numeroDocumento, params);

      if (!guiaFirmada.response.Exito) {
        console.log('Error al Firmar el documento');
        onProgress?.('Error al Firmar el documento', resultadoProceso);
        throw new Error(guiaFirmada.response.Descripcion || 'Error al Firmar el documento');
      }
      
      // Actualizar estado en BD después de firmar
      const hash = guiaFirmada?.response?.ResumenFirma || '';
      try {
        await GuiaElectronicaService.actualizarEstadoBD(idElectronico, {
          estado: 'S', // signed
          descripcion: 'Documento Firmado con Exito',
          hash
        });
      } catch (bdError) {
        onProgress?.(`Error al actualizar BD después de firmar: ${bdError.message}`, resultadoProceso);
        throw new Error(`Guía firmada pero falló actualización en BD: ${bdError.message}`);
      }
      
      // Marcar paso 2 como completado con datos
      resultadoProceso.pasoActual = 2;
      resultadoProceso.pasos.firmar = { 
        completado: true, 
        datos: { 
          hash,
          rutaXml, // También incluir la ruta XML firmada
          descripcion: 'Documento firmado digitalmente'
        } 
      };
      onProgress?.('Guía firmada exitosamente', resultadoProceso);

      //Paso 3: Envio
      const guiaEnviada = await GuiaElectronicaService.enviar(guiaFirmada.response.TramaXmlFirmado, IdDocumento, params.urlsend, datosGuia.tipoDoc, token);
      
      if (!guiaEnviada.exito) {
        console.log('Error al Enviar el documento');
        onProgress?.('Error al Enviar el documento', resultadoProceso);
        throw new Error(guiaEnviada.descripcion || 'Error al Enviar el documento');
      }

      // Actualizar estado en BD después de enviar
      const ticket = guiaEnviada.numTicket;
      try {
        await GuiaElectronicaService.actualizarEstadoBD(idElectronico, {
          estado: 'E',//Enviado
          descripcion: 'Documento enviado con Exito',
          token_sunat: token,
          ticket
        });
      } catch (bdError) {
        onProgress?.(`Error al actualizar BD después de enviar: ${bdError.message}`, resultadoProceso);
        throw new Error(`Guía enviada a SUNAT pero falló actualización en BD: ${bdError.message}`);
      }
      
      // Marcar paso 3 como completado con datos
      resultadoProceso.pasoActual = 3;
      resultadoProceso.pasos.enviar = { 
        completado: true, 
        datos: { 
          ticket,
          descripcion: 'Documento enviado a SUNAT exitosamente'
        } 
      };
      onProgress?.('Guía enviada exitosamente', resultadoProceso);

      //Paso 4: Consulta
      const guiaConsultada = await GuiaElectronicaService.consultar(numeroDocumento, guiaEnviada.numTicket, params.urlconsult, token);

      

      if (guiaConsultada.error) {
        console.log('Hubo un error al consultar el ticket de la Guia');
        
        // Marcar que el envío fue exitoso pero la consulta falló
        resultadoProceso.pasoActual = 3; // Mantener en paso 3 (enviado)
        resultadoProceso.pasos.consultar = { 
          completado: false, 
          datos: { 
            ticket,
            error: guiaConsultada.error?.desError || 'Error al consultar',
            codigoError:guiaConsultada?.error?.numError,
            descripcion: 'Error en consulta - puede reintentar',
            puedeReintentar: true,
            estadoSunat:guiaConsultada?.codRespuesta || ''
          } 
        };
        
        // Actualizar estado de error en BD pero manteniendo el ticket
        try {
          await GuiaElectronicaService.actualizarEstadoBD(idElectronico, {
            estado: 'E', // Mantener como enviado
            descripcion: `Enviado con éxito - Error en consulta: ${guiaConsultada?.error?.desError || 'Error desconocido'}`,
            estadoSunat: guiaConsultada?.codRespuesta || '',
            codigoSunat: guiaConsultada?.error?.numError || guiaConsultada?.codRespuesta || '',
            cdrbase64: guiaConsultada?.arcCdr || '',
            hashQr: guiaConsultada?.CdrResponse?.hashQr || ''
          });
        } catch (bdError) {
          console.error('Error adicional al actualizar BD con error de consulta:', bdError.message);
        }
        
        onProgress?.('Guía enviada exitosamente - Error en consulta (puede reintentar)', resultadoProceso);
        
        // No lanzar error aquí, sino retornar el resultado parcial
        return resultadoProceso;
      }

      const descripcion = guiaConsultada?.CdrResponse?.Descripcion || 'PENDIENTE DE CONSULTA';
      const hashQr = guiaConsultada.CdrResponse?.hashQr || '';

      // Actualizar estado final en BD
      try {
        await GuiaElectronicaService.actualizarEstadoBD(idElectronico, {
          estado: descripcion === 'PENDIENTE DE CONSULTA' ? 'P' : 'F',
          rutaCdr: `/CDR/${numeroDocumento}.zip`,
          rutaPdf: `/PDF/${numeroDocumento}.pdf`,
          cdrbase64: guiaConsultada.arcCdr || '',
          hashQr,
          descripcion,
          'estadoSunat': guiaConsultada.codRespuesta ? guiaConsultada.codRespuesta : '',
          'codigoSunat': guiaConsultada.codRespuesta ? guiaConsultada.codRespuesta : '',
        });
      } catch (bdError) {
        onProgress?.(`Error al actualizar BD con resultado final: ${bdError.message}`, resultadoProceso);
        throw new Error(`Proceso completado en SUNAT pero falló actualización final en BD: ${bdError.message}`);
      }
      
      // Marcar paso 4 como completado con datos
      resultadoProceso.pasoActual = 4;
      resultadoProceso.pasos.consultar = { 
        completado: true, 
        datos: { 
          hashQr,
          descripcion: descripcion,
          estadoSunat: guiaConsultada.codRespuesta || '',
          rutaCdr: `/CDR/${numeroDocumento}.zip`
        } 
      };
      onProgress?.('Guía consultada exitosamente', resultadoProceso);

      return resultadoProceso;

    } catch (error) {
      console.error('Error en proceso completo:', error);
      onProgress?.(`Error: ${error.message || error}`, resultadoProceso);
      throw error;
    }
  },
    // Nueva función para reintentar solo la consulta
  reintentarConsulta: async (numeroDocumento: string, ticket: string, params: ParamsInterface, token: string, idElectronico: number, onProgress) => {
    // Validación inicial del ID electrónico
    if (!idElectronico || idElectronico <= 0) {
      throw new Error('ID electrónico inválido. No se puede procesar la consulta sin un ID válido.');
    }

    // Estructura de resultado similar a procesarGuiaCompleta
    const resultadoConsulta = {
      completado: false,
      datos: null,
      success: false
    };

    try {
      onProgress?.('Reintentando consulta de estado...');

      const guiaConsultada = await GuiaElectronicaService.consultar(numeroDocumento, ticket, params.urlconsult, token);

      if (guiaConsultada.error) {
        console.log('Error al consultar el ticket de la Guia');
        
        // Manejar error de consulta de manera similar a procesarGuiaCompleta
        resultadoConsulta.completado = false;
        resultadoConsulta.datos = { 
          ticket,
          error: guiaConsultada.error?.desError || 'Error al consultar',
          codigoError: guiaConsultada?.error?.numError,
          descripcion: 'Error en consulta - puede reintentar',
          puedeReintentar: true,
          estadoSunat: guiaConsultada?.codRespuesta || ''
        };
        
        // Actualizar estado de error en BD pero manteniendo el ticket (similar a procesarGuiaCompleta)
        try {
          await GuiaElectronicaService.actualizarEstadoBD(idElectronico, {
            estado: 'E', // Mantener como enviado
            descripcion: `Enviado con éxito - Error en consulta: ${guiaConsultada?.error?.desError || 'Error desconocido'}`,
            estadoSunat: guiaConsultada?.codRespuesta || '',
            codigoSunat: guiaConsultada?.error?.numError || guiaConsultada?.codRespuesta || '',
            cdrbase64: guiaConsultada?.arcCdr || '',
            hashQr: guiaConsultada?.CdrResponse?.hashQr || ''
          });
        } catch (bdError) {
          console.error('Error adicional al actualizar BD con error de consulta:', bdError.message);
        }
        
        onProgress?.('Error en consulta - puede reintentar más tarde');
        
        // No lanzar error, retornar el resultado parcial como en procesarGuiaCompleta
        return resultadoConsulta;
      }

      const descripcion = guiaConsultada?.CdrResponse?.Descripcion || 'PENDIENTE DE CONSULTA';
      const hashQr = guiaConsultada.CdrResponse?.hashQr || '';

      // Actualizar estado final en BD (igual que en procesarGuiaCompleta)
      try {
        await GuiaElectronicaService.actualizarEstadoBD(idElectronico, {
          estado: descripcion === 'PENDIENTE DE CONSULTA' ? 'P' : 'F',
          rutaCdr: `/CDR/${numeroDocumento}.zip`,
          rutaPdf: `/PDF/${numeroDocumento}.pdf`,
          cdrbase64: guiaConsultada.arcCdr || '',
          hashQr,
          descripcion,
          'estadoSunat': guiaConsultada.codRespuesta ? guiaConsultada.codRespuesta : '',
          'codigoSunat': guiaConsultada.codRespuesta ? guiaConsultada.codRespuesta : '',
        });
      } catch (bdError) {
        onProgress?.(`Error al actualizar BD con resultado de consulta: ${bdError.message}`);
        throw new Error(`Consulta exitosa pero falló actualización en BD: ${bdError.message}`);
      }

      onProgress?.('Consulta completada exitosamente');

      // Estructura de resultado exitoso similar a procesarGuiaCompleta
      resultadoConsulta.completado = true;
      resultadoConsulta.success = true;
      resultadoConsulta.datos = { 
        hashQr,
        descripcion: descripcion,
        estadoSunat: guiaConsultada.codRespuesta || '',
        rutaCdr: `/CDR/${numeroDocumento}.zip`,
        rutaPdf: `/PDF/${numeroDocumento}.pdf`
      };

      return resultadoConsulta;

    } catch (error) {
      console.error('Error en reintento de consulta:', error);
      onProgress?.(`Error en consulta: ${error.message || error}`);
      throw error;
    }
  },
  tryDownloadAgain:async(url:string, numero:string)=>{
    try {
      
      const { data } = await GuiaElectronicaService.sendApi({ url, numero },`/ConsultaGuia/redownload`);
      return data;
    } catch (error) {
      console.log(`Hubo un error al reintentar la descarga del PDF`);
      throw error?.response?.data?.message || `Hubo un error al reintentar la descarga del PDF`;
    }
  },
  
  /* Métodos auxiliares */
  formatGuia: (guia: any) => {

    let vehiculos = guia.envio.vehiculo?.length > 0 ? guia.envio.vehiculo?.find(ve => ve.tipo === 'P') : null;
    let secundarios = guia.envio.vehiculo?.length > 0 ? guia.envio.vehiculo?.filter(ve => ve.tipo === 'S') : [];

    if (vehiculos) {
      vehiculos.secundarios = secundarios;
    }

    const doc = {
      ...guia,
      tipoDoc: '09',
      envio: {
        ...guia.envio,
        indicadores: guia.envio.indicadores.map(indi => indi.indicador),
        vehiculo: vehiculos
      }
    }

    return doc;

  }

}