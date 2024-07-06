import {  PaletteMode, Theme,  createTheme } from "@mui/material";
import { FC,PropsWithChildren, createContext, useContext } from "react";
import { useColorTheme } from "../hooks/useColorTheme";


type ThemeContextType = {
  mode:PaletteMode;
  toggleColorMode:()=>void;
  theme: Theme;
}

export const ThemeContext = createContext<ThemeContextType>({
  mode:'dark',
  toggleColorMode:()=>{},
  theme:createTheme(),
})

export const ThemeContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const value = useColorTheme();
  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useThemeContext = ()=>{
  return useContext(ThemeContext)
}

