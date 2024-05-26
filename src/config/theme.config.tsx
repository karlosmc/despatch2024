

import { createTheme,CssBaseline,ThemeProvider } from '@mui/material'
import React from 'react'

type ThemeProp = {
    children: JSX.Element
}

export enum themePalette  {
    BG = "#12181b",
    CMAQ_BLUE = "#56ECF8",
    CMAQ_BLUE2 = "#78dde4",
    FONT_GLOBAL = "'Montserrat Alternates',sans-serif",
    //Alert styles
    ERROR_MAIN = "#F44336",
    BG_ERROR_MAIN = "rgba(244,67,54,0.1)",
    SUCCESS_MAIN = "#66BB6A",
    BG_SUCCESS_MAIN = "rgba(102,187,106,0.1)",
    CMAQ_GREY = "#BBBBBB",

}

let theme = createTheme({

    palette:{
        mode:'dark',
        background:{
            default:themePalette.BG
        },
        primary:{
            main:themePalette.CMAQ_BLUE,
            light:themePalette.CMAQ_BLUE2
        },
        grey:{
            
        }
        
    },
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
