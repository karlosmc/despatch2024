import { useState } from "react";

import { Choferes } from "../../types/doc.interface";
import { Stack, Button } from "@mui/material";

import ChoferForm from ".";

interface Props {
  choferes: Array<Choferes>;
  onConfirm: (choferes: Choferes[]) => void;
}

const ChoferValues: Choferes = {
  tipo: "",
  tipoDoc: "",
  apellidos: "",
  licencia: "",
  nombres: "",
  nroDoc: "",
};

const ListaChoferes = ({ choferes, onConfirm }: Props) => {
  const [_chofer, setChofer] = useState<Choferes>(ChoferValues);
  const [listaChoferes, setListaChoferes] = useState<Choferes[]>(choferes);

  const handleNewChofer = (newChofer: Choferes): void => {
    setChofer(newChofer);
    setListaChoferes((chofer) => [...chofer, newChofer]);
  };

  const handleSubmit = () => {
    onConfirm(listaChoferes);
    
  };

  const handleClean = () => {
    setListaChoferes([]);
    onConfirm([]);
  };


  const renderList = (): JSX.Element[] => {
    return listaChoferes.map((driver, index) => {
      return (
        <li key={index}>
          {driver.tipo}
          {driver.tipoDoc}
          {driver.nroDoc}
          {driver.nombres}
          {driver.apellidos}
          {driver.licencia}
        </li>
      );
    });
  };

  return (
    <ul style={{ textAlign: "center" }}>
      <ChoferForm
        initialValue={ChoferValues}
        onChange={handleNewChofer}
      />
      Lista de Choferes
      {renderList()}
      <Stack direction="row" spacing={2}>
        <Button variant="outlined" color="success" onClick={handleSubmit}>
          Completar
        </Button>
        <Button variant="outlined" color="error" onClick={handleClean}>
          Limpiar todo
        </Button>
      </Stack>
    </ul>
  );
};

export default ListaChoferes;
