import { useEffect, useState } from "react";


import { Stack, Button } from "@mui/material";
import { useFormik } from "formik";

import * as Yup from "yup";
import ChoferForm from ".";
import { EnvioChoferes } from "../../types/guias/guiaremision.interface";
import { ChoferSchema } from "../../utils/validateGuiaRemision";
import ConductorForm from "./form";


interface Props {
  choferes: Array<EnvioChoferes>;
  onConfirm: (choferes: EnvioChoferes[]) => void;
}

const ChoferValues: EnvioChoferes = {
  tipo: "",
  tipoDoc: "",
  apellidos: "",
  licencia: "",
  nombres: "",
  nroDoc: "",
};

const Conductores = ({ choferes, onConfirm }: Props) => {
  const [chofer, setChofer] = useState<EnvioChoferes>(ChoferValues);
  const [listaChoferes, setListaChoferes] = useState<EnvioChoferes[]>(choferes);

  const formik = useFormik({
    initialValues: choferes,
    validationSchema: Yup.array(ChoferSchema).min(1, "Debe agregar por lo menos 1 Chofer"),
    onSubmit: (values) => {
      // console.log(values)
      // console.log(values);
      // onChange(values);
      onConfirm(values);
    },
  });

  const handleNewChofer = (newChofer: EnvioChoferes): void => {
    // console.log(chofer)
    setChofer(newChofer);
    setListaChoferes((chofer) => [...chofer, newChofer]);
  };

  useEffect(() => {
    formik.setValues(listaChoferes);
    // console.log(listaChoferes)
  }, [listaChoferes]);

  // const handleSubmit = () => {
  //   onConfirm(listaChoferes);
  // };

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
    <>
      <form action="" onSubmit={formik.handleSubmit} >
        <ConductorForm initialValue={ChoferValues} onChange={handleNewChofer} />
        <Stack direction="row" spacing={2}>
          <Button variant="outlined" color="success"
            // onClick={handleSubmit}
            type="submit"
          >
            Completar
          </Button>
          <Button variant="outlined" color="error" onClick={handleClean}>
            Limpiar todo
          </Button>
        </Stack>
      </form>

      <ul style={{ textAlign: "center" }}>
        {/* <ChoferForm initialValue={ChoferValues} onChange={handleNewChofer} /> */}
        Lista de Choferes
        {renderList()}

      </ul>
    </>
  );
};

export default Conductores;
