import { KeyboardEvent, useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import PersonSearchRoundedIcon from "@mui/icons-material/PersonSearchRounded";

import { AddDoc } from "../../../types/guias/guiaremision.interface";
import { persona, searchPersona } from "../../../types/persona.interface";
import { PersonaService } from "../../../service/PersonaService";
import { AddDocSchema } from "../../../utils/validateGuiaRemision";
import { useNotification } from "../../../context/notification.context";
import ButtonSearch from "../../../components/ButtonSearch";
import SearchPersona from "../../../components/Persona/SearchPersona";
import FormSheet from "./FormSheet";
import FilaDeslizable from "./FilaDeslizable";

interface SelectorAddDocsProps {
  onAgregar: (doc: AddDoc) => void;
  disabled?: boolean;
}

const TIPO_DOCUMENTOS = [
  { valor: "01", descripcion: "FACTURA" },
  { valor: "03", descripcion: "BOLETA" },
  { valor: "04", descripcion: "LIQUIDACION DE COMPRA" },
  { valor: "81", descripcion: "CODIGO DE AUTORIZACION EMITIDA POR EL SCOP" },
];

const ejemploPorTipo = (tipo: string): string => {
  switch (tipo) {
    case "01":
      return "Ej. F123-456789";
    case "03":
      return "Ej. B123-456789";
    case "04":
      return "Ej. E001-123456";
    default:
      return "";
  }
};

/**
 * Alta rápida de comprobantes: el emisor y el tipo quedan fijos entre altas,
 * así cargar varias facturas del mismo proveedor es sólo escribir el número
 * y pulsar Enter.
 */
const SelectorAddDocs = ({ onAgregar, disabled = false }: SelectorAddDocsProps) => {
  const { getError } = useNotification();

  const [tipo, setTipo] = useState("01");
  const [nro, setNro] = useState("");
  const [emisor, setEmisor] = useState("");
  const [rznSocial, setRznSocial] = useState("");

  const [favoritos, setFavoritos] = useState<persona[]>([]);
  const [buscandoPersona, setBuscandoPersona] = useState(false);

  const nroRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelado = false;
    const cargar = async () => {
      try {
        const { data } = await PersonaService.get("fav=1");
        if (!cancelado) setFavoritos(data || []);
      } catch (error) {
        console.log("No se pudieron cargar los emisores favoritos", error);
      }
    };
    cargar();
    return () => {
      cancelado = true;
    };
  }, []);

  const elegirEmisor = (numDoc: string, razon: string) => {
    setEmisor(numDoc);
    setRznSocial(razon);
    nroRef.current?.focus();
  };

  const onConsultaRuc = (resultado: searchPersona): void => {
    if (!resultado) {
      getError("Tiempo de espera terminado, inténtalo otra vez o verifica el número");
      return;
    }
    if (resultado.status === "error") {
      getError(resultado.message);
      return;
    }
    setRznSocial(resultado.persona.nombreRazonSocial);
    nroRef.current?.focus();
  };

  const agregar = async () => {
    const numero = nro.trim().toUpperCase();
    const tipoDesc = TIPO_DOCUMENTOS.find((item) => item.valor === tipo)?.descripcion || "";

    const nuevo: AddDoc = { tipo, tipoDesc, nro: numero, emisor: emisor.trim() };

    try {
      await AddDocSchema.validate(nuevo);
    } catch (error: any) {
      getError(error?.message || "Revisa los datos del comprobante");
      return;
    }

    // Mismas reglas que el formulario original
    if (tipo === "01" && !numero.startsWith("F") && !numero.startsWith("E")) {
      getError("El número de comprobante no corresponde al tipo FACTURA");
      return;
    }
    if (tipo === "03" && !numero.includes("B")) {
      getError("El número de comprobante no corresponde al tipo BOLETA");
      return;
    }

    onAgregar(nuevo);

    // El emisor y el tipo se mantienen para seguir cargando del mismo proveedor.
    setNro("");
    nroRef.current?.focus();
  };

  const onEnter = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    agregar();
  };

  return (
    <Box display="grid" gridTemplateColumns="minmax(0, 1fr)" gap={1.5} minWidth={0}>
      {/* Emisor */}
      <Box display="flex" gap={1} alignItems="center" minWidth={0}>
        <TextField
          size="small"
          fullWidth
          label="RUC del emisor"
          value={emisor}
          disabled={disabled}
          onChange={(e) => setEmisor(e.target.value)}
          sx={{ maxWidth: { sm: 220 } }}
        />
        <ButtonSearch type="6" valor={emisor} onSearch={onConsultaRuc} />
        <TextField
          size="small"
          fullWidth
          label="Razón social"
          value={rznSocial}
          InputProps={{ readOnly: true }}
        />
        <Button
          size="small"
          variant="outlined"
          disabled={disabled}
          onClick={() => setBuscandoPersona(true)}
          sx={{ flexShrink: 0, minWidth: 0, px: 1.25 }}
          aria-label="Buscar persona"
        >
          <PersonSearchRoundedIcon fontSize="small" />
        </Button>
      </Box>

      {/* Emisores frecuentes */}
      {favoritos.length > 0 && (
        <Box minWidth={0}>
          <Typography variant="caption" color="text.secondary">
            Emisores frecuentes
          </Typography>
          <FilaDeslizable>
            {favoritos.map((per) => (
              <Chip
                key={per.id}
                clickable
                disabled={disabled}
                color={emisor === per.numDoc ? "primary" : "default"}
                variant={emisor === per.numDoc ? "filled" : "outlined"}
                label={per.nombreCorto || per.numDoc}
                onClick={() => elegirEmisor(per.numDoc, per.rznSocial)}
                sx={{ flexShrink: 0, fontWeight: 700, height: 34 }}
              />
            ))}
          </FilaDeslizable>
        </Box>
      )}

      {/* Tipo + número + alta */}
      <Box display="flex" gap={1} alignItems="flex-start" minWidth={0} flexWrap="wrap">
        <FormControl size="small" disabled={disabled} sx={{ minWidth: 150, flex: "0 1 190px" }}>
          <InputLabel>Tipo</InputLabel>
          <Select label="Tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
            {TIPO_DOCUMENTOS.map((doc) => (
              <MenuItem key={doc.valor} value={doc.valor}>
                {doc.descripcion}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          inputRef={nroRef}
          size="small"
          autoComplete="off"
          disabled={disabled}
          label={tipo === "81" ? "Código SCOP" : "Número"}
          placeholder={ejemploPorTipo(tipo)}
          value={nro}
          onChange={(e) => setNro(e.target.value)}
          onKeyDown={onEnter}
          inputProps={{ style: { textTransform: "uppercase" } }}
          sx={{ flex: "1 1 160px", minWidth: 0 }}
        />

        <Button
          variant="contained"
          startIcon={<AddRoundedIcon />}
          onClick={agregar}
          disabled={disabled}
          sx={{ height: 40, flexShrink: 0, color: "common.white", fontWeight: 700 }}
        >
          Agregar
        </Button>
      </Box>

      <Typography variant="caption" color="text.secondary">
        El emisor y el tipo se mantienen: escribe el siguiente número y pulsa Enter.
      </Typography>

      <FormSheet
        open={buscandoPersona}
        title="Buscar persona"
        icon={<PersonSearchRoundedIcon />}
        onClose={() => setBuscandoPersona(false)}
      >
        <SearchPersona
          onCheck={(per: persona) => {
            setBuscandoPersona(false);
            elegirEmisor(per.numDoc, per.rznSocial);
          }}
        />
      </FormSheet>
    </Box>
  );
};

export default SelectorAddDocs;
