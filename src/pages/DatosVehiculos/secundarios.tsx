import { useEffect, useState } from "react";

import { Stack, Button } from "@mui/material";
import DatosVehiculo from ".";
import { EnvioVehiculo } from "../../types/guias/guiaremision.interface";
import { useFormik } from "formik";

import * as Yup from 'yup'
import { SecundariosSchema } from "../../utils/validateGuiaRemision";

interface Props {
  vehiculos: Array<EnvioVehiculo>;
  onConfirm: (vehiculos: EnvioVehiculo[]) => void;
}

const VehiculoValues: EnvioVehiculo = {
  placa: "",
  codEmisor: "",
  nroAutorizacion: "",
  nroCirculacion: "",
  secundarios: null,
};

const VehiculosSecundarios = ({ vehiculos, onConfirm }: Props) => {
  // const [carro, setCarro] = useState<EnvioVehiculo>(VehiculoValues);
  const [carros, setCarros] = useState<EnvioVehiculo[]>(vehiculos);


  const formik = useFormik({
    initialValues: vehiculos,
    validationSchema: Yup.array(SecundariosSchema),
    onSubmit: (_) => {
      // console.log(values)
      // console.log(values);
      // onChange(values);
      onConfirm(carros);
    },
  });

  // const handleNewVehiculo = (newVehiculo: EnvioVehiculo): void => {
  //   // setCarro(newVehiculo);
  //   setCarros((carros) => [...carros, newVehiculo]);
  // };

  const handleNewVehiculo = (newVehiculo: EnvioVehiculo): void => {
    // setCarro(newVehiculo);
    setCarros((carros) => [...carros, newVehiculo]);
  };


  // const handleSubmit = () => {
  //   onConfirm(carros);
  // };

  const handleClean = () => {
    setCarros([]);
    onConfirm([]);
  };

  useEffect(() => {
    formik.setValues(carros);
    // console.log(listaChoferes)
  }, [carros]);


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
    <>

      <form action="" onSubmit={formik.handleSubmit}>
        <DatosVehiculo
          initialValue={VehiculoValues}
          onChange={handleNewVehiculo}
        />

        <Stack direction="row" spacing={2}>
          <Button variant="outlined" color="success" type="submit">
            Completar
          </Button>
          <Button variant="outlined" color="error" onClick={handleClean}>
            Limpiar todo
          </Button>
        </Stack>
      </form>
      <ul style={{ textAlign: "center" }}>
        Lista de vehiculos Secundarios
        {renderList()}
      </ul>
    </>
  );
};

export default VehiculosSecundarios;
