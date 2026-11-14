import {
  Box,
  Button,
  Container,
  FormControl,
  Grid,
  InputLabel,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import TableViewRoundedIcon from "@mui/icons-material/TableViewRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import PictureAsPdfRoundedIcon from "@mui/icons-material/PictureAsPdfRounded";
import FolderZipRoundedIcon from "@mui/icons-material/FolderZipRounded";
import TagRoundedIcon from "@mui/icons-material/TagRounded";

import { DialogComponentCustom } from "../components";
import { panelguia } from "../types/panelguia.interface";
import { useNotification } from "../context/notification.context";
import { BuscarOpcionesInterface } from "../types/buscar.interface";
import BuscarComponent from "../components/BuscarComponent";
import { GuiaServices } from "../service/GuiaServices";
import { useMiscStore } from "../store/miscStore";
import TablePanel from "../components/Guias/TablePanel";
import { GUIA_RAPIDA_HABILITADA } from "../config/modulos";

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
];

// Opciones para el estado de la guía
const estadosGuia = [
  { valor: 'G', texto: 'Generado' },
  { valor: 'S', texto: 'Firmado' },
  { valor: 'E', texto: 'Enviado' },
  { valor: 'P', texto: 'Pendiente' },
  { valor: 'F', texto: 'Finalizado' }
];

/** Archivos que se descargan en lote con los filtros actuales. */
const DESCARGAS = [
  { tipo: 'xml', texto: 'XML', icono: <DescriptionRoundedIcon fontSize="small" color="primary" /> },
  { tipo: 'pdf', texto: 'PDF', icono: <PictureAsPdfRoundedIcon fontSize="small" color="error" /> },
  { tipo: 'cdr', texto: 'CDR', icono: <FolderZipRoundedIcon fontSize="small" color="warning" /> },
  { tipo: 'hash', texto: 'Lista Hash', icono: <TagRoundedIcon fontSize="small" color="secondary" /> },
];

// Primer y último día del mes actual (YYYY-MM-DD)
const getCurrentMonthRange = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  return {
    inicio: formatDate(new Date(year, month, 1)),
    fin: formatDate(new Date(year, month + 1, 0))
  };
};

const descargarBlob = (data: BlobPart, nombre: string) => {
  const uri = window.URL.createObjectURL(new Blob([data]));
  const link = document.createElement('a');
  link.href = uri;
  link.setAttribute('download', nombre);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(uri);
};

const Guias = () => {
  const theme = useTheme();
  const esCelular = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

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

  const monthRange = getCurrentMonthRange();
  const [fechaIni, setFechaIni] = useState<string>(monthRange.inicio);
  const [fechaFin, setFechaFin] = useState<string>(monthRange.fin);

  const [estadoGuia, setEstadoGuia] = useState<string>('');

  /** Menú de descargas en el celular */
  const [anclaDescargas, setAnclaDescargas] = useState<null | HTMLElement>(null);

  const handleCloseModalForm = () => {
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

  /** Filtros comunes a la búsqueda, el reporte y las descargas. */
  const filtros = () => {
    const params = new URLSearchParams();
    if (searchField && inputQuery) params.append(searchField, inputQuery);
    if (serie) params.append('serie', serie);
    if (fechaIni) params.append('fecha_inicio', fechaIni);
    if (fechaFin) params.append('fecha_fin', fechaFin);
    if (estadoGuia) params.append('estado', estadoGuia);
    return params;
  };

  const getGuias = async () => {
    setIsLoading(true);

    const params = filtros();
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
    try {
      const data = await GuiaServices.report(filtros().toString());
      descargarBlob(data, 'documentos.xlsx');
    } catch (error) {
      console.error("Error al generar el reporte:", error);
      getError('Error al generar el reporte');
    }
  }

  const handleDescargarArchivos = async (tipo: string) => {
    setAnclaDescargas(null);
    const params = filtros();
    params.append('type', tipo);
    try {
      const data = await GuiaServices.descargar(params.toString());
      descargarBlob(data, tipo === 'hash' ? 'descarga.xlsx' : 'descarga.zip');
    } catch (error) {
      console.log('Error al descargar los archivos', error);
      getError('Error al descargar los archivos');
    }
  }

  return (
    <Container sx={{ px: { xs: 2, sm: 3 }, pb: 4 }}>
      {/* Encabezado: crear guías */}
      <Box
        mt={{ xs: 2, sm: 3 }}
        mb={2}
        display="flex"
        flexDirection={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'stretch', sm: 'center' }}
        justifyContent="space-between"
        gap={1.5}
      >
        <Box>
          <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
            Guías electrónicas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Estado de las guías emitidas y acceso rápido para crear una nueva.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
          {GUIA_RAPIDA_HABILITADA && (
            <Button
              variant="outlined"
              color="warning"
              startIcon={<BoltRoundedIcon />}
              onClick={() => navigate('/admin/guiaremision/rapida')}
              fullWidth={esCelular}
            >
              Guía rápida
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<AutoAwesomeRoundedIcon />}
            onClick={() => navigate('/admin/guiaremision/nueva')}
            fullWidth={esCelular}
          >
            Emitir guía
          </Button>
        </Stack>
      </Box>

      {/* Filtros */}
      <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2 }, mb: 2, borderRadius: 2.5 }}>
        <Grid container spacing={1.5}>
          <Grid item xs={6} md={3}>
            <FormControl fullWidth size='small'>
              <InputLabel id="series-select-label">Serie</InputLabel>
              <Select
                name='series'
                value={serie}
                label="Serie"
                onChange={(e) => setSerie(e.target.value)}
                labelId="series-select-label"
              >
                <MenuItem value="">Todas</MenuItem>
                {series.map(ser => (
                  <MenuItem key={ser} value={ser}>{ser}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6} md={3}>
            <FormControl fullWidth size='small'>
              <InputLabel id="estado-select-label">Estado</InputLabel>
              <Select
                name='estadoGuia'
                value={estadoGuia}
                label="Estado"
                onChange={(e) => setEstadoGuia(e.target.value)}
                labelId="estado-select-label"
              >
                <MenuItem value="">Todos</MenuItem>
                {estadosGuia.map(estado => (
                  <MenuItem key={estado.valor} value={estado.valor}>
                    {estado.texto}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6} md={3}>
            <TextField
              type="date"
              size="small"
              label="Desde"
              value={fechaIni}
              onChange={(e) => setFechaIni(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={6} md={3}>
            <TextField
              type="date"
              size="small"
              label="Hasta"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} md={9}>
            <Box
              display="flex"
              flexDirection={{ xs: 'column', sm: 'row' }}
              gap={{ xs: 0, sm: 1.5 }}
              sx={{ '& .MuiFormControl-root': { my: 0, mb: { xs: 1.5, sm: 0 } } }}
            >
              <BuscarComponent opciones={opciones} onSearchChange={handleSearchParams} />
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              onClick={handleSearch}
              fullWidth
              color='success'
              variant='contained'
              startIcon={<SearchRoundedIcon />}
              sx={{ height: { md: 40 } }}
            >
              Buscar
            </Button>
          </Grid>
        </Grid>

        {/* Reporte y descargas en lote con los filtros actuales */}
        <Box
          mt={1.5}
          pt={1.5}
          borderTop={1}
          borderColor="divider"
          display="flex"
          flexWrap="wrap"
          alignItems="center"
          gap={1}
        >
          <Button
            variant="outlined"
            color="success"
            size="small"
            startIcon={<TableViewRoundedIcon />}
            onClick={handleReporte}
            sx={{ flex: { xs: 1, sm: 'none' } }}
          >
            Reporte Excel
          </Button>

          {esCelular ? (
            <>
              <Button
                variant="outlined"
                size="small"
                startIcon={<DownloadRoundedIcon />}
                endIcon={<KeyboardArrowDownRoundedIcon />}
                onClick={(e) => setAnclaDescargas(e.currentTarget)}
                sx={{ flex: 1 }}
              >
                Descargar
              </Button>
              <Menu
                anchorEl={anclaDescargas}
                open={Boolean(anclaDescargas)}
                onClose={() => setAnclaDescargas(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                {DESCARGAS.map((d) => (
                  <MenuItem key={d.tipo} onClick={() => handleDescargarArchivos(d.tipo)}>
                    <ListItemIcon>{d.icono}</ListItemIcon>
                    <ListItemText>{d.texto}</ListItemText>
                  </MenuItem>
                ))}
              </Menu>
            </>
          ) : (
            <>
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                Descargar:
              </Typography>
              {DESCARGAS.map((d) => (
                <Button
                  key={d.tipo}
                  size="small"
                  variant="text"
                  startIcon={d.icono}
                  onClick={() => handleDescargarArchivos(d.tipo)}
                >
                  {d.texto}
                </Button>
              ))}
            </>
          )}
        </Box>
      </Paper>

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
    </Container>
  );
};

export default Guias;
