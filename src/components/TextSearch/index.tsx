import TextField from "@mui/material/TextField";
import { ChangeEvent, ReactNode, useState } from "react";

import { dataFound } from "../../types/persona.interface";
import CircularProgress from "@mui/material/CircularProgress";
import { Field } from "formik";

interface TextSearchFormProps {
  valor: string;
  onSearch: (dataFound: dataFound) => void;
  onChangeValue: (event: ChangeEvent<HTMLInputElement>) => void;
  type: string;

  name: string;
}

const TextSearch = (props: TextSearchFormProps): JSX.Element => {
  const { valor, type, onSearch, onChangeValue, name, ...restProps } =
    props;

  const [loading, setLoading] = useState<boolean>(false);

  const handleKeyPress = async (evt: React.KeyboardEvent<HTMLInputElement>) => {
    if (evt.key === "Enter") {
      setLoading(true);
      const res = await consultaApiPersonas();

      try {
        if (res && res.response.exito) {
          const data =
            type === "dni2"
              ? { dniData: res.response, rucData: null }
              : { dniData: null, rucData: res.response.ar };
          onSearch(data);
        } else {
          onSearch({ dniData: null, rucData: null });
        }
        setLoading(false);
      } catch (error) {
        onSearch({ dniData: null, rucData: null });
        setLoading(false);
      }
    }
  };

  const consultaApiPersonas = async () => {
    const url = `http://192.168.30.11:8080/ApiRestFE/Consultas/${type}/${valor}`;
    const consultado = await fetch(url);

    return consultado.json();
  };

  return (
    <TextField
      {...restProps}
      
      value={valor}
      color="primary"
      name={name}
      // onChange={(e:ChangeEvent<HTMLInputElement>) => setFieldValue('numDoc',e.target.value)}
      onChange={onChangeValue}
      // onKeyUp={handleKeyPress}
      InputProps={{
        endAdornment: loading ? (
          <CircularProgress color="error" size={20} />
        ) : null,
      }}
    />
  );
};

export default TextSearch;
