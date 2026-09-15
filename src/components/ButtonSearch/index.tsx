import { Box, CircularProgress, IconButton } from "@mui/material";
import { useState } from "react";

import SearchIcon from "@mui/icons-material/Search";
import { searchPersona } from "../../types/persona.interface";

import { PersonaService } from "../../service/PersonaService";

interface ButtonSearchProps {
  type: string | null;
  valor: string;
  onSearch: (searchPersona: searchPersona) => void;
}

const _TIPO_DOCUMENTO = [
  { valor: "1", name: "dni" },
  { valor: "6", name: "ruc" },
];

const ButtonSearch = ({ type, valor, onSearch }: ButtonSearchProps) => {


  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {

    const tipo = _TIPO_DOCUMENTO.find((item) => item.valor === type).name;
    try {
      setIsLoading(true)
      const data = await PersonaService.consulta(valor, tipo)
      onSearch(data)

    }
    catch (error) {
      console.log(error ||'Error al consultar')
      onSearch(null)

    }
    finally {
      setIsLoading(false)
    }

  }

  return (
    <Box>
      {isLoading ? (
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
