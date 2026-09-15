import { PaletteMode } from '@mui/material'

export enum themePalette {
  BG = "#272b30",
  CMAQ_BLUE = "#56ECF8",
  CMAQ_BLUE2 = "#78dde4",
  FONT_GLOBAL = "'Montserrat Alternates',sans-serif",
  //Alert styles
  ERROR_MAIN = "#F44336",
  BG_ERROR_MAIN = "rgba(244,67,54,0.1)",
  SUCCESS_MAIN = "#77b300",
  BG_SUCCESS_MAIN = "rgba(102,187,106,0.1)",
  CMAQ_GREY = "#BBBBBB",
  dark_primary = "#2a9fd6",
  light_primary = "#114056",
  dark_secondary = "#C9C941",
  dark_secondary_light = "#7e7e4b",
  dark_info = "#9933cc",
  dark_warning = "#ff8800",
  dark_success = "#77b300",
  dark_error = "#cc0000",
  dark_light = "#222",
  dark_dark = "#adafae"
}

/**
 * Tema de la aplicación. Mantiene la paleta de marca y agrega fondos, bordes y
 * formas consistentes para claro y oscuro.
 */
const theme = (mode: PaletteMode = 'dark') => {
  const oscuro = mode === 'dark';
  const divider = oscuro ? 'rgba(255,255,255,0.09)' : 'rgba(15,23,42,0.09)';

  return {
    palette: {
      mode: mode,
      primary: {
        main: themePalette.dark_primary,
        light: themePalette.light_primary,
        dark: themePalette.dark_primary,
        contrastText: '#fff',
      },
      secondary: {
        main: themePalette.dark_secondary,
        light: themePalette.dark_secondary_light,
        dark: themePalette.dark_secondary,
      },
      info: {
        main: themePalette.dark_info,
        dark: themePalette.dark_info,
        light: themePalette.dark_info,
      },
      success: {
        main: themePalette.dark_success,
        light: themePalette.dark_success,
        dark: themePalette.dark_success,
        contrastText: '#fff'
      },
      warning: {
        main: themePalette.dark_warning,
        dark: themePalette.dark_warning,
        light: themePalette.dark_warning
      },
      background: oscuro
        ? { default: '#101318', paper: '#181c22' }
        : { default: '#f4f6fa', paper: '#ffffff' },
      divider,
    },
    shape: {
      borderRadius: 10,
    },
    typography: {
      fontFamily: themePalette.FONT_GLOBAL,
      button: {
        textTransform: 'none' as const,
        fontWeight: 600,
      },
      h6: {
        fontSize: '1rem'
      },
      h7: {
        fontSize: '0.8rem'
      },
      h8: {
        fontSize: '0.7rem'
      },
    },
    components: {
      MuiButton: {
        defaultProps: { disableElevation: true },
      },
      MuiPaper: {
        // El modo oscuro de MUI aclara el papel con un degradado: se quita para que
        // tarjetas y diálogos respeten el fondo definido arriba.
        styleOverrides: { root: { backgroundImage: 'none' } },
      },
      MuiCard: {
        defaultProps: { elevation: 0 },
        styleOverrides: { root: { border: `1px solid ${divider}`, borderRadius: 14 } },
      },
      MuiAppBar: {
        defaultProps: { elevation: 0 },
      },
      MuiTableCell: {
        styleOverrides: { head: { fontWeight: 700 } },
      },
      MuiChip: {
        styleOverrides: { label: { fontWeight: 600 } },
      },
      MuiCssBaseline: {
        styleOverrides: {
          body: { WebkitFontSmoothing: 'antialiased' },
        },
      },
    },
  }
}

export default theme;
