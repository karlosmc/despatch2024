import { ReactNode, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  LinearProgress,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import dayjs from "dayjs";
import SaveRoundedIcon from "@mui/icons-material/SaveRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";

import { GuiaRemisionFormApi } from "../useGuiaRemisionForm";

interface ResumenRevisionProps {
  abierto: boolean;
  onCerrar: () => void;
  api: GuiaRemisionFormApi;
}

const MODALIDADES_TRASLADO: Record<string, string> = {
  "01": "Público",
  "02": "Privado",
};

/** Nombre del documento relacionado según su tipo SUNAT. */
const TIPOS_DOC: Record<string, string> = {
  "01": "Factura",
  "03": "Boleta",
  "09": "Guía",
  "81": "SCOP",
};

const Seccion = ({ titulo, children }: { titulo: string; children: ReactNode }) => (
  <Box py={0.75}>
    <Typography variant="overline" color="text.secondary" lineHeight={1.6} display="block">
      {titulo}
    </Typography>
    {children}
  </Box>
);

const Fila = ({ etiqueta, valor, falta }: { etiqueta: string; valor?: ReactNode; falta?: boolean }) => (
  <Box display="grid" gridTemplateColumns="96px minmax(0,1fr)" columnGap={1} py={0.2}>
    <Typography variant="caption" color="text.secondary">
      {etiqueta}
    </Typography>
    <Typography variant="body2" fontWeight={600} color={falta ? "error.main" : "text.primary"} sx={{ overflowWrap: "anywhere" }}>
      {valor || "—"}
    </Typography>
  </Box>
);

const fecha = (valor?: string) => (valor ? dayjs(valor).format("DD/MM/YYYY") : "");
const formatoKilos = (n: number) => new Intl.NumberFormat("es-PE").format(n);

/**
 * Resumen de la guía antes de guardar o enviar: los datos ordenados y, arriba,
 * todos los problemas encontrados con las mismas reglas del guardado.
 */
const ResumenRevision = ({ abierto, onCerrar, api }: ResumenRevisionProps) => {
  const v = api.formik.values;
  const theme = useTheme();
  const pantallaChica = useMediaQuery(theme.breakpoints.down("sm"));

  const [revisando, setRevisando] = useState(false);
  const [problemas, setProblemas] = useState<string[]>([]);

  useEffect(() => {
    if (!abierto) return;
    let cancelado = false;
    setRevisando(true);
    api
      .revisarGuia()
      .then((lista) => {
        if (!cancelado) setProblemas(lista);
      })
      .finally(() => {
        if (!cancelado) setRevisando(false);
      });
    return () => {
      cancelado = true;
    };
  }, [abierto]);

  const valida = !revisando && problemas.length === 0;
  const chofer = v.choferes[0];
  const secundarios = (v.vehiculo?.secundarios || []).map((s) => s.placa).join(", ");

  const accion = (fn: () => void) => () => {
    onCerrar();
    fn();
  };

  return (
    <Dialog
      open={abierto}
      onClose={onCerrar}
      fullScreen={pantallaChica}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: pantallaChica ? 0 : 3 } }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="subtitle1" fontWeight={800} component="span" display="block">
          Resumen de la guía
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {v.datosGenerales.serie ? `${v.datosGenerales.serie}-${v.datosGenerales.correlativo}` : "Sin serie"}
        </Typography>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 1 }}>
        {revisando ? (
          <LinearProgress sx={{ my: 1 }} />
        ) : valida ? (
          <Alert severity="success" sx={{ borderRadius: 2 }}>
            Todo en orden: la guía está lista para guardar o enviar.
          </Alert>
        ) : (
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            <Typography variant="body2" fontWeight={700}>
              Falta corregir {problemas.length} {problemas.length === 1 ? "cosa" : "cosas"}:
            </Typography>
            {problemas.map((problema) => (
              <Typography key={problema} variant="caption" display="block">
                • {problema}
              </Typography>
            ))}
          </Alert>
        )}

        <Seccion titulo="Guía">
          <Fila etiqueta="Emisión" valor={fecha(v.datosGenerales.fechaEmision)} />
          <Fila etiqueta="Traslado" valor={fecha(v.envio.fecTraslado)} />
          <Fila etiqueta="Motivo" valor={v.envio.desTraslado} falta={!v.envio.codTraslado} />
          <Fila etiqueta="Transporte" valor={MODALIDADES_TRASLADO[v.envio.modTraslado]} />
        </Seccion>
        <Divider />

        <Seccion titulo="Transporte">
          <Fila
            etiqueta="Chofer"
            valor={chofer ? `${chofer.nombres} ${chofer.apellidos} · DNI ${chofer.nroDoc}` : ""}
            falta={!chofer}
          />
          <Fila etiqueta="Licencia" valor={chofer?.licencia} falta={Boolean(chofer) && !chofer?.licencia} />
          <Fila etiqueta="Vehículo" valor={v.vehiculo?.placa} falta={!v.vehiculo?.placa} />
          <Fila etiqueta="Secundario" valor={secundarios} />
        </Seccion>
        <Divider />

        <Seccion titulo="Personas y ruta">
          <Fila
            etiqueta="Destinatario"
            valor={v.destinatario?.numDoc ? `${v.destinatario.rznSocial} · ${v.destinatario.numDoc}` : ""}
            falta={!v.destinatario?.numDoc}
          />
          <Fila
            etiqueta="Proveedor"
            valor={v.tercero?.numDoc ? `${v.tercero.rznSocial} · ${v.tercero.numDoc}` : ""}
          />
          <Fila etiqueta="Partida" valor={v.partida?.direccion} falta={!v.partida?.direccion} />
          <Fila etiqueta="Llegada" valor={v.llegada?.direccion} falta={!v.llegada?.direccion} />
        </Seccion>
        <Divider />

        <Seccion titulo="Bienes">
          {(v.details || []).length === 0 ? (
            <Fila etiqueta="Bienes" valor="" falta />
          ) : (
            (v.details || []).map((d) => (
              <Fila key={d.codigo} etiqueta={d.codigo} valor={`${d.descripcion} · ${d.cantidad} ${d.unidad}`} />
            ))
          )}
          <Fila etiqueta="Peso total" valor={`${formatoKilos(Number(v.envio.pesoTotal) || 0)} kg`} falta={!Number(v.envio.pesoTotal)} />
        </Seccion>
        <Divider />

        <Seccion titulo="Documentos">
          {(v.addDocs || []).length === 0 ? (
            <Fila etiqueta="Documentos" valor="Sin documentos" />
          ) : (
            (v.addDocs || []).map((d) => (
              <Fila key={`${d.emisor}|${d.nro}`} etiqueta={TIPOS_DOC[d.tipo] || `Doc. ${d.tipo}`} valor={`${d.nro} · RUC ${d.emisor}`} />
            ))
          )}
        </Seccion>
      </DialogContent>

      <DialogActions sx={{ flexWrap: "wrap", gap: 0.75, px: 2, py: 1.25 }}>
        <Button color="inherit" onClick={onCerrar}>
          {valida ? "Cerrar" : "Ir a corregir"}
        </Button>
        <Box flex={1} />
        <Button
          variant="outlined"
          color="success"
          startIcon={<SaveRoundedIcon />}
          onClick={accion(() => api.guardar("borrador"))}
          disabled={!valida || api.guardando || api.bloqueada}
        >
          {api.guardada ? "Actualizar" : "Guardar"}
        </Button>
        <Button
          variant="contained"
          color="warning"
          startIcon={<SendRoundedIcon />}
          onClick={accion(() => api.guardar("sunat"))}
          disabled={!valida || api.guardando || api.enviadaSunat || api.bloqueada}
          sx={{ color: "common.white", fontWeight: 700 }}
        >
          Enviar a SUNAT
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ResumenRevision;
