import { Box, CircularProgress, IconButton } from "@mui/material";
import React, { useState } from "react";
// import VehiculoForm from "../../pages/vehiculo";

import SearchIcon from "@mui/icons-material/Search";
import { dataFound } from "../../types/persona.interface";

interface ButtonSearchProps {
  type: string | null;
  valor: string;
  onSearch: (dataFound: dataFound) => void;
}

const _TIPO_DOCUMENTO = [
  { valor: "1", name: "dni3" },
  { valor: "6", name: "ruc" },
];

const ButtonSearch = ({ type, valor, onSearch }: ButtonSearchProps) => {
  const API_PERSONAS = import.meta.env.VITE_API_URL_CONSULT_PERSONAS;

  const API_PERSONAS_REGISTRADAS = import.meta.env.VITE_API_URL_GUIAS;

  const [loading, setLoading] = useState<Boolean>(false);

  const consultaApiPersonas = async () => {
    const tipo = _TIPO_DOCUMENTO.find((item) => item.valor === type).name;
    const url = `${API_PERSONAS}Consultas/${tipo}/${valor}`;
    const consultado = await fetch(url);

    return consultado.json();
  };

  const consultaApiPersonasExistentes = async () => {
    const url = `${API_PERSONAS_REGISTRADAS}Client/${valor}`;
    const consultado = await fetch(url);
    return consultado.json();
  };

  const handleSearch = async (evt: React.MouseEvent<HTMLButtonElement>) => {
    evt.preventDefault();

    setLoading(true);

    const res1 = await consultaApiPersonasExistentes();
    
    try {
      if (res1 && res1.result) {
        const data =
          type === "1"
            ? { dniData: { dni:valor, apellidoPaterno: res1.result.rznSocial,apellidoMaterno:'',nombres:'',direccion:res1.result.address.direccion,ubigeo:res1.result.address.ubigeo }, rucData: null }
            : { dniData: null, rucData: {ruc:valor,razonSocial:res1.result.rznSocial,nombreComercial:'',direccion:res1.result.address.direccion,ubigeo:res1.result.address.ubigeo} };

            console.log(data);
        onSearch(data);
      } else {
        const res = await consultaApiPersonas();
        // console.log(res);

        if (res && res.response.exito) {
          const data =
            type === "1"
              ? { dniData: {dni:valor, apellidoPaterno: res.response.apellidoPaterno,apellidoMaterno:'',nombres:'',direccion:'',ubigeo:''}, rucData: null }
              : { dniData: null, rucData: {ruc:valor,razonSocial:res.response.ar.razonSocial,nombreComercial:'', direccion:res.response.ar.direccion, ubigeo:''} };

          onSearch(data);
        } else {
          onSearch({ dniData: null, rucData: null });
        }
      }
      setLoading(false);
    } catch (error) {
      onSearch({ dniData: null, rucData: null });
      setLoading(false);
    }
  };

  return (
    <Box>
      {loading ? (
        <IconButton
          color="warning"
          aria-label="add an alarm"
          //sx={BoxShadoWButton}
          // onClick={handleSearch}
        >
          <CircularProgress size={35} />
        </IconButton>
      ) : (
        <IconButton
          color="warning"
          aria-label="add an alarm"
          //sx={BoxShadoWButton}
          onClick={handleSearch}
        >
          <SearchIcon fontSize="large" />
        </IconButton>
      )}
    </Box>
  );
};

export default ButtonSearch;
