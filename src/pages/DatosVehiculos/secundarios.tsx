import { useState } from "react";

import { Stack, Button, TableCell, TableRow, Box, Table, TableBody, TableHead, TableContainer, Paper, Typography } from "@mui/material";
import DatosVehiculo from ".";
import { EnvioVehiculo } from "../../types/guias/guiaremision.interface";
import { useNotification } from "../../context/notification.context";

interface Props {
  vehiculos: Array<EnvioVehiculo>;
  onConfirm: (vehiculos: EnvioVehiculo[]) => void;
}

const VehiculoValues: EnvioVehiculo = {
  id: 0,
  placa: "",
  codEmisor: "",
  nroAutorizacion: "",
  nroCirculacion: "",
  secundarios: null,
};

const VehiculosSecundarios = ({ vehiculos, onConfirm }: Props) => {
  // const [carro, setCarro] = useState<EnvioVehiculo>(VehiculoValues);
  const [cars, setCars] = useState<EnvioVehiculo[]>(vehiculos || []);

  const { getError } = useNotification()

  // const formik = useFormik({
  //   initialValues: vehiculos,
  //   validationSchema: SecundariosSchema,
  //   onSubmit: (_) => {
  //     // console.log(values)
  //     // console.log(values);
  //     // onChange(values);
  //     onConfirm(carros);
  //   },
  // });

  // const handleNewVehiculo = (newVehiculo: EnvioVehiculo): void => {
  //   // setCarro(newVehiculo);
  //   setCarros((carros) => [...carros, newVehiculo]);
  // };

  const onSubmit = () => {
    onConfirm(cars);
  }

  const handleNewVehiculo = (newVehiculo: EnvioVehiculo): void => {
    // setCarro(newVehiculo);

    if(cars.length===2){
      getError('Solo se permiten hasta 2 vehiculos secundarios');
      return;
    }
    setCars((prev) => [...prev, newVehiculo]);
  };


  // const handleSubmit = () => {
  //   onConfirm(carros);
  // };

  const handleClean = () => {
    setCars([]);
    onConfirm([]);
  };

  // useEffect(() => {
  //   formik.setValues(carros);
  //   // console.log(listaChoferes)
  // }, [carros]);


  // const renderList = (): JSX.Element[] => {
  //   return carros?.map((vehiculo, index) => {
  //     return (
  //       <li key={index}>
  //         {vehiculo.codEmisor}
  //         {vehiculo.nroAutorizacion}
  //         {vehiculo.nroCirculacion}
  //         {vehiculo.placa}
  //       </li>
  //     );
  //   });
  // };

  const renderList = (): JSX.Element[] => {
    return cars?.map((vehiculo, index) => {
      return (
        <TableRow
          key={index}
        >
          <TableCell align="left">{vehiculo.id}</TableCell>
          <TableCell align="left">{vehiculo.placa}</TableCell>
          <TableCell align="left">{vehiculo.codEmisor}</TableCell>
          <TableCell align="left">{vehiculo.nroAutorizacion}</TableCell>
          <TableCell align="left">{vehiculo.nroCirculacion}</TableCell>

        </TableRow>
      );
    });
  };


  return (
    <>

      <Box component={'form'}>
        <DatosVehiculo
          initialValue={VehiculoValues}
          onChange={handleNewVehiculo}
        />

      </Box>
      <Typography sx={{mt:1}} textAlign={'center'}>Lista de choferes</Typography>
      <TableContainer component={Paper} sx={{mb:2}} >
        <Table aria-label="simple table" size='small' sx={{ my: 2, border: '1px solid grey' }}>
          <TableHead sx={{ background: 'grey' }}>
            <TableRow>
              <TableCell width={'5%'} align="left">Id</TableCell>
              <TableCell width={'20%'} align="left">Placa</TableCell>
              <TableCell width={'10%'} align="left">Cod.Emisor</TableCell>
              <TableCell width={'10%'} align="left">Nro.Autorizacion</TableCell>
              <TableCell width={'50%'} align="left">Nro.Circulacion</TableCell>

            </TableRow>
          </TableHead>
          <TableBody>
            {renderList()}
          </TableBody>
        </Table>
      </TableContainer>
      <Stack direction="row" spacing={2}>
        <Button fullWidth variant="contained" color="success" onClick={onSubmit}>
          Completar
        </Button>
        <Button fullWidth variant="outlined" color="secondary" onClick={handleClean}>
          Limpiar todo
        </Button>
      </Stack>
    </>
  );
};

export default VehiculosSecundarios;
