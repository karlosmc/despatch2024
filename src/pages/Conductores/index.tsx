import { useEffect, useState } from "react";


import { Stack, Button, Box } from "@mui/material";
import { isObject, useFormik } from "formik";

import * as Yup from "yup";
import { EnvioChoferes } from "../../types/guias/guiaremision.interface";
import { ChoferSchema } from "../../utils/validateGuiaRemision";
import ConductorForm from "./form";
import { useNotification } from "../../context/notification.context";


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
  // const [chofer, setChofer] = useState<EnvioChoferes>(ChoferValues);
  const [listaChoferes, setListaChoferes] = useState<EnvioChoferes[]>(choferes);

  const { getError } = useNotification();

  const formik = useFormik({
    initialValues: choferes,
    validationSchema: Yup.array(ChoferSchema),
    onSubmit: (values) => {
      // console.log(values)
      // console.log(values);
      // onChange(values);

      onConfirm(values);
    },
  });

  const handleNewChofer = (newChofer: EnvioChoferes): void => {
    // console.log(chofer)
    if (listaChoferes.length === 0) {
      if (newChofer.tipo !== 'Principal') {
        getError('El primer chofer debe ser Principal');
        // ChoferValues.apellidos=newChofer.apellidos;
        // ChoferValues.nroDoc=newChofer.nroDoc;
        // ChoferValues.tipo=newChofer.tipo;
        // ChoferValues.tipoDoc=newChofer.tipoDoc;
        // ChoferValues.licencia=newChofer.licencia;
        // ChoferValues.nombres=newChofer.nombres;
        return;
      }
    } else {
      if (newChofer.tipo === 'Principal') {
        getError('Ya existe un conductor principal');
        return;
      }

    }


    // if(listaChoferes.filter(chofer => chofer.tipo==='Principal').length>0){
    //   getError('Ya existe un conductor principal');
    //   return;
    // }
    // setChofer(newChofer);
    if (listaChoferes.length < 3) {
      setListaChoferes((chofer) => [...chofer, newChofer]);
    } else {
      getError('La cantidad de conductores permitida es de 3');
    }
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

  // useEffect(() => {
  //   if (!formik.isSubmitting) return;
  //   if (Object.keys(formik.errors).length > 0) {
  //     const ErrorValues = Object.values(formik.errors)[0];
  //     // console.log(ErrorValues);
  //     //const ErrorKeys = Object.keys(formik.errors)[0]
  //     if (isObject(ErrorValues)) {
  //       // console.log(Object.values(ErrorValues)[0])
  //       const ErrorValuesSub = Object.values(ErrorValues)[0];
  //       // const ErrorKeySub = Object.keys(ErrorKeys)[0]
  //       if (isObject(ErrorValuesSub)) {
  //         //getError(`Error en la Seccion:${Object.keys(ErrorKeySub)[0]}: ${Object.values(ErrorValuesSub)[0]}`)
  //         getError(`${Object.values(ErrorValuesSub)[0]}`);
  //       } else {
  //         //getError(`Error en la Seccion:${ErrorKeys.toUpperCase()}: ${ErrorValuesSub}`)
  //         getError(ErrorValuesSub);
  //       }
  //     } else {
  //       getError(ErrorValues);
  //     }
  //   }
  // }, [formik]);


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
        <Box>
          <ul style={{ textAlign: "center" }}>
            {/* <ChoferForm initialValue={ChoferValues} onChange={handleNewChofer} /> */}
            Lista de Choferes
            {renderList()}

          </ul>
        </Box>
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

    </>
  );
};

export default Conductores;
