import { useState } from "react";
import VehiculoForm from ".";
import {  Vehiculo } from "../../types/doc.interface";
import { Stack, Button } from "@mui/material";

interface Props {
  vehiculos: Array<Vehiculo>;
  onConfirm: (vehiculos: Vehiculo[]) => void;
}

const VehiculoValues: Vehiculo = {
  placa: "",
  codEmisor: "",
  nroAutorizacion: "",
  nroCirculacion: "",
  secundarios: null,
};

const ListaVehiculos = ({ vehiculos, onConfirm }: Props) => {
  const [_carro, setCarro] = useState<Vehiculo>(VehiculoValues);
  const [carros, setCarros] = useState<Vehiculo[]>(vehiculos);

  const handleNewVehiculo = (newVehiculo: Vehiculo): void => {
    setCarro(newVehiculo);
    setCarros((carros) => [...carros, newVehiculo]);
  };

  const handleSubmit = () => {
    onConfirm(carros);
  };

  const handleClean = () => {
    setCarros([]);
    onConfirm([]);
  };


  const renderList = (): JSX.Element[] => {
    return carros?.map((vehiculo, index) => {
      return (
        <li key={index}>
          {vehiculo.codEmisor}
          {vehiculo.nroAutorizacion}
          {vehiculo.nroCirculacion}
          {vehiculo.placa}
        </li>
      );
    });
  };

  return (
    <ul style={{ textAlign: "center" }}>
      <VehiculoForm
        initialValue={VehiculoValues}
        onChange={handleNewVehiculo}
      />
      Lista de vehiculos Secundarios
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

export default ListaVehiculos;
