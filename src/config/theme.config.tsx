

import { createTheme,CssBaseline,ThemeProvider } from '@mui/material'
import React from 'react'

type ThemeProp = {
    children: JSX.Element
}


export enum themePalette  {
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
    dark_primary="#2a9fd6",
    light_primary="#114056",
    dark_secondary="#C9C941",
    dark_secondary_light="#7e7e4b",
    dark_info="#9933cc",
    dark_warning="#ff8800",
    dark_success="#77b300",
    dark_error="#cc0000",
    dark_light="#222",
    dark_dark="#adafae"
}

let theme = createTheme({

    // palette:{
    //     mode:'light',
        
    //     primary:{
    //         main:themePalette.dark_primary,
    //         light:themePalette.light_primary
    //     },
    //     secondary:{
    //         main:themePalette.dark_secondary,
    //         light:themePalette.dark_secondary_light
    //         // dark:themePalette.dark_dark
    //     },
    //     info:{
    //         main:themePalette.dark_info
    //     },
    //     // error:{
    //     //     main:themePalette.dark_error
    //     // },
    //     success:{
    //         main:themePalette.dark_success,
    //         contrastText:'#fff'
    //     },
    //     warning:{
    //         main:themePalette.dark_warning
    //     },
    // },
    typography:{
        fontFamily:themePalette.FONT_GLOBAL,
      
        
    },
    components:{
        MuiButton:{
            defaultProps:{
                style:{
                    textTransform:"none",
                    boxShadow:'none',
                    borderRadius:'0.5em'
                }
            }
        },
        MuiAlert:{
            defaultProps:{
                style:{
                    borderRadius:'0.8em',
                    fontSize:'1em'
                }
            },
            styleOverrides:{
                standardError:{
                    border:`1px solid ${themePalette.ERROR_MAIN}`,
                    background:themePalette.BG_ERROR_MAIN
                },
                standardSuccess:{
                    border:`1px solid ${themePalette.SUCCESS_MAIN}`,
                    background:themePalette.BG_SUCCESS_MAIN
                }
            }
        }
    }
})

theme = createTheme(theme,{
    typography:{
        link:{
            fontSize:'0.8rem',
            [theme.breakpoints.up('md')]:{
                fontSize:'0.9rem'
            },
            fonWeight: 500,
            color: theme.palette.primary,
            display:'block',
            cursor:'pointer'
        },
        cardTitle:{
            fontSize:'1.2rem',
            display:'block',
            fontWeight:500
        },
        h6:{
            fontSize:'1rem'
        },
        h7:{
            fontSize:'0.8rem'
        },
        h8:{
            fontSize:'0.7rem'
        }
        
    }
})

export const ThemeConfig: React.FC<ThemeProp> = ({children}) => {
  return (
    <ThemeProvider theme={theme}>
        <CssBaseline/>
        {children}
    </ThemeProvider>
  )
}
