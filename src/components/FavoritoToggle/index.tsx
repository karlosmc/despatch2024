import { MouseEvent, useEffect, useRef, useState } from "react";
import { IconButton, Tooltip } from "@mui/material";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import StarOutlineRoundedIcon from "@mui/icons-material/StarOutlineRounded";

import {
  FavoritoService,
  TipoFavorito,
  esFavorito,
  favoritoVigente,
  olvidarCambioFavorito,
} from "../../service/FavoritoService";
import { useNotification } from "../../context/notification.context";

interface FavoritoToggleProps {
  tipo: TipoFavorito;
  id?: number | null;
  /** Valor que trajo el listado (`fav` del usuario autenticado). */
  fav?: unknown;
  size?: "small" | "medium";
  onChange?: (fav: boolean) => void;
}

/** Estrella para marcar/quitar un favorito del usuario desde cualquier tabla. */
const FavoritoToggle = ({ tipo, id, fav, size = "small", onChange }: FavoritoToggleProps) => {
  const { getError } = useNotification();

  const delServidor = esFavorito(fav);

  // Arranca con lo último confirmado en la sesión (la fila puede venir de un
  // listado cargado antes de marcarla).
  const [marcado, setMarcado] = useState<boolean>(() => favoritoVigente(tipo, id, fav));
  const [guardando, setGuardando] = useState(false);

  /* Si el listado se recarga con otro valor, manda el servidor. */
  const previo = useRef(delServidor);
  useEffect(() => {
    if (previo.current === delServidor) return;
    previo.current = delServidor;
    if (id) olvidarCambioFavorito(tipo, id);
    setMarcado(delServidor);
  }, [delServidor, tipo, id]);

  const alternar = async (event: MouseEvent) => {
    event.stopPropagation();
    if (!id || guardando) return;

    const siguiente = !marcado;
    setMarcado(siguiente); // optimista: la estrella responde al instante
    setGuardando(true);

    try {
      await FavoritoService.marcar(tipo, id, siguiente);
      onChange?.(siguiente);
    } catch (error) {
      setMarcado(!siguiente);
      getError(typeof error === "string" ? error : "No se pudo actualizar el favorito");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Tooltip title={marcado ? "Quitar de mis favoritos" : "Marcar como favorito"}>
      <span>
        <IconButton
          size={size}
          color="warning"
          onClick={alternar}
          disabled={!id}
          aria-pressed={marcado}
          aria-label={marcado ? "Quitar de mis favoritos" : "Marcar como favorito"}
          sx={{ opacity: guardando ? 0.6 : 1 }}
        >
          {marcado ? <StarRoundedIcon /> : <StarOutlineRoundedIcon />}
        </IconButton>
      </span>
    </Tooltip>
  );
};

export default FavoritoToggle;
