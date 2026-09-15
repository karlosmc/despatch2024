
import {

  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,

} from "@mui/material";
import React, { useEffect, useState } from "react";


import { DialogComponentCustom } from "../components";



// import ModalConductor from "../components/Conductor";
import { panelguia } from "../types/panelguia.interface";

import { useNotification } from "../context/notification.context";

import { BuscarOpcionesInterface } from "../types/buscar.interface";
import BuscarComponent from "../components/BuscarComponent";

import { GuiaServices } from "../service/GuiaServices";
import { useMiscStore } from "../store/miscStore";
import TablePanel from "../components/Guias/TablePanel";


// import { GuiaRemision } from "../types/guias/guiaremision.interface";
// import { Link } from "react-router-dom";

type ModalsProps = {
  open: boolean;
  form: React.ReactNode | null;
  title: string;
};

const opciones: BuscarOpcionesInterface[] = [

  {
    codigo: 'numero',
    valor: 'Numero',
    type: 'number'
  },

  // {
  //   codigo: 'fav',
  //   valor: 'Favoritos'
  // },
]




const Guias = () => {

  const [modalsForm, setModalsForms] = useState<ModalsProps>({
    open: false,
    form: null,
    title: "",
  });

  const { getError } = useNotification()

  const [isLoading, setIsLoading] = useState(false)

  const [guias, setGuias] = useState<panelguia[]>([])

  const [serie, setSerie] = useState<string>('')

  const seriesStore = useMiscStore((state) => state.series);

  const series = seriesStore?.map(it => it.serie) || [];

  const [inputQuery, setInputQuery] = useState<string>('')

  const [searchField, setSearchField] = useState<string>('')

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalCount, setTotalCount] = useState(0);

  // Obtener el primer y último día del mes actual
  const getCurrentMonthRange = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    // Primer día del mes
    const firstDay = new Date(year, month, 1);
    // Último día del mes
    const lastDay = new Date(year, month + 1, 0);

    // Formatear a YYYY-MM-DD para el input date
    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };

    return {
      inicio: formatDate(firstDay),
      fin: formatDate(lastDay)
    };
  };

  const monthRange = getCurrentMonthRange();
  const [fechaIni, setFechaIni] = useState<string>(monthRange.inicio);
  const [fechaFin, setFechaFin] = useState<string>(monthRange.fin);

  const [estadoGuia, setEstadoGuia] = useState<string>('');

  // Opciones para el estado de la guía
  const estadosGuia = [
    { valor: 'G', texto: 'Generado' },
    { valor: 'S', texto: 'Firmado' },
    { valor: 'E', texto: 'Enviado' },
    { valor: 'P', texto: 'Pendiente' },
    { valor: 'F', texto: 'Finalizado' }
  ];

  const handleCloseModalForm = () => {
    // Cierra el modal en la posición especificada
    setModalsForms((prev) => ({ ...prev, open: false }));
  };


  const handleSearchParams = (field: string, query: string) => {
    setSearchField(field)
    setInputQuery(query)
  };

  // Ejecutar búsqueda al presionar "Buscar"
  const handleSearch = () => {
    setPage(0)
    getGuias();
  };

  const reFetch = () => {
    getGuias();
  };

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setSerie(evt.target.value)
  }

  const handleEstadoChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setEstadoGuia(evt.target.value)
  }


  const getGuias = async () => {
    setIsLoading(true);

    const params = new URLSearchParams();
    if (searchField && inputQuery) {
      params.append(searchField, inputQuery);
    }
    if (serie) {
      params.append('serie', serie);
    }
    if (fechaIni) {
      params.append('fecha_inicio', fechaIni);
    }
    if (fechaFin) {
      params.append('fecha_fin', fechaFin);
    }
    if (estadoGuia) {
      params.append('estado', estadoGuia);
    }
    params.append('page', (page + 1).toString()); // Backend pages are 1-indexed
    params.append('per_page', rowsPerPage.toString());

    try {
      const data = await GuiaServices.guias(`buscar?${params.toString()}`);
      if (data) {
        setGuias(data.data);
        setTotalCount(data.pagination.total);
      } else {
        setGuias([]);
      }
    } catch (error) {
      console.error("Error al obtener las guías:", error);
      getError('Error al obtener las guías');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getGuias();
  }, [rowsPerPage, page]);

  const handleReporte = async () => {

    const params = new URLSearchParams();
    if (searchField && inputQuery) {
      params.append(searchField, inputQuery);
    }
    if (serie) {
      params.append('serie', serie);
    }
    if (fechaIni) {
      params.append('fecha_inicio', fechaIni);
    }
    if (fechaFin) {
      params.append('fecha_fin', fechaFin);
    }
    if (estadoGuia) {
      params.append('estado', estadoGuia);
    }
    try {

      const data = await GuiaServices.report(params.toString());

      const uri = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = uri;

      // Establecer el nombre del archivo
      link.setAttribute('download', 'documentos.xlsx');

      // Añadir el enlace al DOM y hacer clic en él
      document.body.appendChild(link);
      link.click();

      // Limpiar el DOM
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error("Error al generar el reporte:", error);
      getError('Error al generar el reporte');
    }
  }


  const handleDescargarArchivos = async (tipo: string) => {

    const params = new URLSearchParams();

    params.append('type', tipo);
    

    if (searchField && inputQuery) {
      params.append(searchField, inputQuery);
    }
    if (serie) {
      params.append('serie', serie);
    }
    if (fechaIni) {
      params.append('fecha_inicio', fechaIni);
    }
    if (fechaFin) {
      params.append('fecha_fin', fechaFin);
    }
    if (estadoGuia) {
      params.append('estado', estadoGuia);
    }
    

    try {
      const data = await GuiaServices.descargar(params.toString());
      const uri = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = uri;

      // Establecer el nombre del archivo
      link.setAttribute('download', tipo==='hash'?'descarga.xlsx': 'descarga.zip');

      // Añadir el enlace al DOM y hacer clic en él
      document.body.appendChild(link);
      link.click();

      // Limpiar el DOM
      link.parentNode.removeChild(link);
    } catch (error) {
      console.log('Error al descargar los archivos', error);
      getError('Error al descargar los archivos');
    }


  }


  return (
    <Container>
      <Box my={3} display="flex" flexDirection={{ sm: 'row', xs: 'column' }} textAlign={{ sm: 'left', xs: 'center' }} component="div" justifyContent="space-between">
        <Typography>Estado de las Guías Electrónicas</Typography>

      </Box>
      <Box display={"flex"} gap={2}>
        <FormControl sx={{ width: '50%' }} margin='normal' size='small'>
          <InputLabel id="series-select-label">Series</InputLabel>
          <Select
            name='series'
            value={serie}
            label="Series"
            onChange={handleChange}
            labelId="series-select-label"
          >
            {series.map(ser => (
              <MenuItem key={ser} value={ser}>{ser}</MenuItem>
            ))}
            <MenuItem value="">Elija su Serie</MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ width: '50%' }} margin='normal' size='small'>
          <InputLabel id="estado-select-label">Estado de Guía</InputLabel>
          <Select
            name='estadoGuia'
            value={estadoGuia}
            label="Estado de Guía"
            onChange={handleEstadoChange}
            labelId="estado-select-label"
          >
            {estadosGuia.map(estado => (
              <MenuItem key={estado.valor} value={estado.valor}>
                {estado.valor}: {estado.texto}
              </MenuItem>
            ))}
            <MenuItem value="">Todos los Estados</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Box display={'flex'} flexDirection={{ xs: 'column', sm: 'row' }} mb={1}>
        <BuscarComponent opciones={opciones} onSearchChange={handleSearchParams} />
      </Box>
      <Box display={'flex'} flexDirection={{ xs: 'column', sm: 'row' }} justifyContent={{ xs: 'center', sm: 'flex-end' }} width={'100%'} gap={1}>
        <TextField
          type="date"
          size="small"
          label="Fecha Inicio"
          value={fechaIni}
          onChange={(e) => setFechaIni(e.target.value)}
          fullWidth
          InputLabelProps={{
            shrink: true,
          }}
        />
        <TextField
          type="date"
          size="small"
          label="Fecha Fin"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
          fullWidth
          InputLabelProps={{
            shrink: true,
          }}
        />

      </Box>


      <Button onClick={handleSearch} size='small' fullWidth color='success' variant='contained' sx={{ mb: 1 }}>Buscar</Button>

      <Box width={'100%'} my={1} display={'flex'} flexDirection={'row'} justifyContent={'space-between'} p={2} border={1} borderColor={'text.secondary'} borderRadius={2}>
        <Button variant="outlined" color="success" sx={{ width: '50%' }} onClick={handleReporte} >
          Reporte Excel
        </Button>
        <Button variant="contained" onClick={() => handleDescargarArchivos('xml')} >
          XML
        </Button>
        <Button variant="contained" color="error" onClick={() => handleDescargarArchivos('pdf')} >
          PDF
        </Button>
        <Button variant="contained" color="warning" onClick={() => handleDescargarArchivos('cdr')} >
          CDR
        </Button>
        <Button variant="contained" color="secondary" onClick={() => handleDescargarArchivos('hash')} >
          Lista Hash
        </Button>
      </Box>

      <TablePanel
        isLoading={isLoading}
        guias={guias}
        reFetch={reFetch}
        page={page}
        setPage={setPage}
        rowsPerPage={rowsPerPage}
        totalCount={totalCount}
        setRowsPerPage={setRowsPerPage}
      />

      {/* <ProductoFormModal/> */}
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

    </Container >
  );
};

export default Guias;
