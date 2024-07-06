

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

const theme  =(mode:PaletteMode='dark') => ({
  
  palette: {
    mode:mode,
    primary: {
      main: themePalette.dark_primary,
      light: themePalette.light_primary,
      dark: themePalette.dark_primary,
    },
    secondary: {
      main: themePalette.dark_secondary,
      light: themePalette.dark_secondary_light,
      dark: themePalette.dark_secondary,
      
      // dark:themePalette.dark_dark
    },
    info: {
      main: themePalette.dark_info,
      dark: themePalette.dark_info,
      light: themePalette.dark_info,
    },
    // error:{
    //     main:themePalette.dark_error
    // },
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
    
  },
  typography: {
    fontFamily: themePalette.FONT_GLOBAL,
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
  // components: {
  //   MuiButton: {
  //     defaultProps: {
  //       style: {
  //         textTransform: "none",
  //         boxShadow: 'none',
  //         borderRadius: '0.5em'
  //       }
  //     }
  //   },
  //   MuiAlert: {
  //     defaultProps: {
  //       style: {
  //         borderRadius: '0.8em',
  //         fontSize: '1em'
  //       }
  //     },
  //     styleOverrides: {
  //       standardError: {
  //         border: `1px solid ${themePalette.ERROR_MAIN}`,
  //         background: themePalette.BG_ERROR_MAIN
  //       },
  //       standardSuccess: {
  //         border: `1px solid ${themePalette.SUCCESS_MAIN}`,
  //         background: themePalette.BG_SUCCESS_MAIN
  //       }
  //     }
  //   }
  // },

})

export default theme ;

