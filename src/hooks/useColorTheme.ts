import { PaletteMode, createTheme } from "@mui/material"
import { useEffect, useMemo, useState } from "react";
import theme from "../config/theme";

const CLAVE_MODO = "theme-mode";

/** Recupera el modo elegido; si nunca se eligió, se mantiene el oscuro de siempre. */
const modoGuardado = (): PaletteMode => {
  try {
    const guardado = localStorage.getItem(CLAVE_MODO);
    if (guardado === "light" || guardado === "dark") return guardado;
  } catch {
    /* storage no disponible: se usa el valor por defecto */
  }
  return "dark";
};

export const useColorTheme = () => {

  const [mode, setMode] = useState<PaletteMode>(modoGuardado);

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE_MODO, mode);
    } catch {
      /* sin storage el modo sólo dura la sesión */
    }
  }, [mode]);

  const toggleColorMode = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  }

  const modifiedTheme = useMemo(
    () => createTheme(theme(mode)),
    [mode]
  );

  return {
    theme: modifiedTheme,
    mode,
    toggleColorMode,
  }

}
