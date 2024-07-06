import { PaletteMode, createTheme } from "@mui/material"
import { useMemo, useState } from "react";
import theme from "../config/theme";


export const useColorTheme = () => {

  const [mode, setMode] = useState<PaletteMode>('dark');


  const toggleColorMode = () => {

    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));

  }

  const modifiedTheme = useMemo(
    () => createTheme(theme(mode)),
    [mode]
  );

  return {
    theme:modifiedTheme,
    mode,
    toggleColorMode,
  }

}
