import { useEffect, useState } from "react";


import { Stack, Button, Box, Table, TableBody, TableCell, TableHead, TableRow, Typography,  styled } from "@mui/material";
import { useFormik } from "formik";

import * as Yup from "yup";
import { EnvioChoferes } from "../../types/guias/guiaremision.interface";
import { ChoferSchema } from "../../utils/validateGuiaRemision";
import ConductorForm from "./form";
import { useNotification } from "../../context/notification.context";
import { DialogComponentCustom } from "../../components";
import ModalConductor from "../../components/Conductor";
import { conductor } from "../../types/conductor.interface";
import SearchConductor from "../../components/Conductor/SerachConductor";
import clienteAxios from "../../config/axios";
import ChipFavoritos from "../../components/ChipFavoritos";
import { ChipInterface } from "../../types/general.interface";





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

type ModalsProps = {
  open: boolean;
  form: React.ReactNode | null;
  title: string;
};


const StyledNewButton = styled(Button)(({})=>({
  backgroundColor: '#375A7F',
  color: 'white',
  '&:hover': {
    backgroundColor: '#2F4D6C',
  }
}))

const StyledSearchButton = styled(Button)(({})=>({
  backgroundColor: '#00BC8C',
  color: 'white',
  '&:hover': {
    backgroundColor: '#00A077',
  }
}))

const Conductores = ({ choferes, onConfirm }: Props) => {
  // const [chofer, setChofer] = useState<EnvioChoferes>(ChoferValues);


  
  const [listaChoferes, setListaChoferes] = useState<EnvioChoferes[]>(choferes);
  const [modalsForm, setModalsForms] = useState<ModalsProps>({
    open: false,
    form: null,
    title: "",
  });

  const [driver, setDriver] = useState<conductor>(null);


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

  const [dataFilter, setDataFilter] = useState<conductor[]>([])

  const [isLoading, setIsLoading] = useState(true)

  const token = localStorage.getItem('AUTH_TOKEN');

  const filterFav = async (tipo:string) => {
    try {

      const { data, status } = await clienteAxios(`/api/conductor/buscar?${tipo}=1`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (status === 200) {
        setIsLoading(false)
        setDataFilter(data?.data)
      }
    }
    catch (error) {
      console.log(error)
    }
  }


  const handleNewChofer = (newChofer: EnvioChoferes): void => {
    // console.log(chofer)
    if (listaChoferes.length === 0) {
      if (newChofer.tipo !== 'Principal') {
        getError('El primer chofer debe ser Principal');
        return;
      }
    } else {
      if (newChofer.tipo === 'Principal') {
        getError('Ya existe un conductor principal');
        return;
      }

    }

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


  const handleConfirm = (conductor: conductor): void => {
    setDriver(conductor)
    handleCloseModalForm()
  }

  const handleSetFavorite = (item: ChipInterface): void => {
    const conductor = dataFilter.find(it => it.id === item.id);
    setDriver(conductor)
  }



  const handleClean = () => {
    setListaChoferes([]);
    onConfirm([]);
  };

  const handleOpenModalForm = (form: React.ReactNode, title: string) => {
    setModalsForms({ open: true, form, title });
  };

  const handleCloseModalForm = () => {
    // Cierra el modal en la posición especificada
    setModalsForms((prev) => ({ ...prev, open: false }));
  };


  const renderList = (): JSX.Element[] => {
    return listaChoferes.map((driver, index) => {
      return (
        <TableRow
          key={index}
        >
          <TableCell align="left">{driver.id}</TableCell>
          <TableCell align="left">{driver.tipo}</TableCell>
          <TableCell align="left">{driver.tipoDoc}</TableCell>
          <TableCell align="left">{driver.nroDoc}</TableCell>
          <TableCell align="left">{driver.apellidos} {driver.nombres}</TableCell>
          <TableCell align="left">{driver.licencia}</TableCell>

        </TableRow>
      );
    });
  };


  useEffect(()=>{
      filterFav('fav')

  },[])
  return (
    <>
    <ChipFavoritos isLoading={isLoading} items={dataFilter} onPick={handleSetFavorite} title="Choferes favoritos" />
      <Box component='form' action="" onSubmit={formik.handleSubmit} >
        <Box display={'flex'} flexDirection={'row'} gap={2} my={2}>
          <StyledNewButton fullWidth variant="contained" 
          onClick={() => {
            handleOpenModalForm(
              <ModalConductor initialValue={null} edit={false} onConfirm={handleConfirm} />,
              'Crear Conductor'
            )
          }}
          >
            Crear
          </StyledNewButton>

          <StyledSearchButton fullWidth variant="contained" color="warning"
          onClick={() => {
            handleOpenModalForm(
              <SearchConductor onCheck={handleConfirm} />,
              'Buscar Conductor'
            )
          }}
          >
            Buscar
          </StyledSearchButton>
        </Box>
        <ConductorForm initialValue={ChoferValues} conductor={driver} onChange={handleNewChofer} />
        <Typography textAlign={'center'}>Lista de choferes</Typography>
        <Box>
          <Table aria-label="simple table" size='small' sx={{ my: 2, border: '1px solid grey' }}>
            <TableHead sx={{ background: 'grey' }}>
              <TableRow>
              <TableCell width={'5%'} align="left">Id</TableCell>
                <TableCell width={'20%'} align="left">T.Conductor</TableCell>
                <TableCell width={'10%'} align="left">Tip.Doc.</TableCell>
                <TableCell width={'10%'} align="left">Nro.Doc.</TableCell>
                <TableCell width={'50%'} align="left">Nombres</TableCell>
                <TableCell width={'10%'} align="left">Nro.Licencia</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {renderList()}
            </TableBody>
          </Table>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button fullWidth variant="contained" color="success"
            // onClick={handleSubmit}
            type="submit"
          >
            Completar
          </Button>

          <Button fullWidth variant="outlined" color="secondary" onClick={handleClean}>
            Limpiar todo
          </Button>
        </Stack>
      </Box>
      <DialogComponentCustom
        closeButton={
          <Button
            variant="contained"
            color="error"
            onClick={() => handleCloseModalForm()}
          >
            Cerrar
          </Button>
        }
        open={modalsForm.open}
        title={modalsForm.title}
        element={modalsForm.form}

      />

    </>
  );
};

export default Conductores;
