import React, { createContext, useState, useContext, ReactNode } from 'react';

import DirectionsCarFilledIcon from "@mui/icons-material/DirectionsCarFilled";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import TaxiAlertIcon from "@mui/icons-material/TaxiAlert";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";


// Define el tipo de los indicadores
interface IndicadorInterface {
  id: string;
  name: string;
  tooltip: string;
  selected: boolean;
  icon: JSX.Element;
}

interface IndicadoresContextProps {
  indicadores: IndicadorInterface[];
  setIndicadores: React.Dispatch<React.SetStateAction<IndicadorInterface[]>>;
}


const AuxiliarContext = createContext<IndicadoresContextProps|undefined>(undefined);



export const AuxiliarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

  const [indicadores, setIndicadores] = useState<IndicadorInterface[]>([
    {
      id: "SUNAT_Envio_IndicadorTrasladoVehiculoM1L",
      name: "Traslado en vehiculos M1 o L",
      tooltip: "Vehiculo M1 o L",
      selected: false,
      icon: <DirectionsCarFilledIcon />,
    },
    {
      id: "SUNAT_Envio_IndicadorRetornoVehiculoEnvaseVacio",
      name: "Retorno de vehiculos con envases o embalajes vacíos",
      tooltip: "Envases o embalajes vacío",
      selected: false,
      icon: <DeleteOutlineIcon />,
    },
    {
      id: "SUNAT_Envio_IndicadorRetornoVehiculoVacio",
      name: "Retorno de vehículo vacío",
      tooltip: "Vehículo vacío",
      selected: false,
      icon: <TaxiAlertIcon />,
    },
    {
      id: "SUNAT_Envio_IndicadorTrasladoTotalDAMoDS",
      name: "Traslado total de la DAM o DS",
      tooltip: "Total de DAM o DS",
      selected: false,
      icon: <FormatListNumberedIcon />,
    },
  ]);


  return (

    <AuxiliarContext.Provider value={{
      indicadores,
      setIndicadores
    }}>
      {children}
    </AuxiliarContext.Provider>
  )
}

export const useAuxiliares = () => {
  const context = useContext(AuxiliarContext);

  if (!context) throw new Error("No existe contexto");
  return context;
};