import { ReactNode, useMemo } from "react";
import { ThemeProvider, createTheme } from "@mui/material";
import { deepmerge } from "@mui/utils";

import temaBase from "../../../config/theme";
import { useThemeContext } from "../../../context/themeProvider";

const FUENTE_COMPACTA = "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif";

/**
 * Ajustes sólo para la guía rápida: fuente más angosta a 13px y controles
 * pequeños. Se mezclan con las opciones del tema (no con el tema ya creado) para
 * que MUI recalcule todas las variantes tipográficas con la nueva fuente.
 */
const ajustesCompactos = {
  typography: {
    fontFamily: FUENTE_COMPACTA,
    fontSize: 13,
  },
  components: {
    MuiTextField: { defaultProps: { size: "small" } },
    MuiFormControl: { defaultProps: { size: "small" } },
    MuiOutlinedInput: {
      styleOverrides: { input: { paddingTop: 7, paddingBottom: 7 } },
    },
    MuiInputLabel: {
      styleOverrides: { root: { fontSize: 13 } },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: { marginTop: 2, marginLeft: 4, marginRight: 4, fontSize: 11, lineHeight: 1.3 },
      },
    },
    MuiButton: { defaultProps: { size: "small" } },
    MuiIconButton: { defaultProps: { size: "small" } },
    MuiCheckbox: { defaultProps: { size: "small" } },
    MuiChip: { defaultProps: { size: "small" } },
    MuiToggleButton: {
      styleOverrides: {
        root: { paddingTop: 3, paddingBottom: 3, paddingLeft: 10, paddingRight: 10, fontSize: 12 },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { paddingTop: 0, paddingBottom: 0, paddingLeft: 10, paddingRight: 10, fontSize: 12, alignItems: "center" },
        icon: { paddingTop: 4, paddingBottom: 4, marginRight: 8, fontSize: 18 },
        message: { paddingTop: 5, paddingBottom: 5 },
      },
    },
    MuiMenuItem: {
      styleOverrides: { root: { minHeight: 34, fontSize: 13 } },
    },
  },
};

const TemaCompacto = ({ children }: { children: ReactNode }) => {
  const { mode } = useThemeContext();
  const tema = useMemo(() => createTheme(deepmerge(temaBase(mode), ajustesCompactos)), [mode]);
  return <ThemeProvider theme={tema}>{children}</ThemeProvider>;
};

export default TemaCompacto;
