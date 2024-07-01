import {
  Box,
  Button,
  CircularProgress,
  Container,
  Fab,
  
  Modal,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import React, { useRef, useState } from "react";
import useSWR from "swr";
import clienteAxios from "../config/axios";

import EditIcon from "@mui/icons-material/Edit";
import LinkIcon from "@mui/icons-material/Link";
import QrCodeIcon from "@mui/icons-material/QrCode";

import FindInPageIcon from "@mui/icons-material/FindInPage";
import { DialogComponentCustom } from "../components";

import QRCode from "qrcode.react";

import ModalConductor from "../components/Conductor";
import { panelguia } from "../types/panelguia.interface";

type ModalsProps = {
  open: boolean;
  form: React.ReactNode | null;
  title: string;
};

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 300,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const Guias = () => {
  const [modalsForm, setModalsForms] = useState<ModalsProps>({
    open: false,
    form: null,
    title: "",
  });

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleOpenModalForm = (form: React.ReactNode, title: string) => {
    setModalsForms({ open: true, form, title });
  };

  const qrRef = useRef<HTMLDivElement |null >(null);

  const [hashQr, setHashQr] = useState<string>("");

  const handleCloseModalForm = () => {
    // Cierra el modal en la posición especificada
    setModalsForms((prev) => ({ ...prev, open: false }));
  };

  const handleConfirm = (): void => {
    handleCloseModalForm();
  };

  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(0);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // const [edit, setEdit] = useState<boolean>(false);

  const token = localStorage.getItem("AUTH_TOKEN");
  const fetcher = () =>
    clienteAxios("/api/estadoelectronico", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

  const { data, isLoading } = useSWR("/api/estadoelectronico", fetcher);

  // if (isLoading) return <div>Cargando</div>

  const rows = [];

  data?.data?.data.forEach((fil: panelguia) => {
    rows.push(
      <TableRow key={fil.id}>
        <TableCell align="left">{fil.id}</TableCell>
        <TableCell align="left">{fil.serie}</TableCell>
        <TableCell align="left">{fil.numero}</TableCell>
        <TableCell align="left">{fil.fecha}</TableCell>
        <TableCell align="left">{fil.codigoSunat}</TableCell>
        <TableCell align="left">{fil.descripcion}</TableCell>
        <TableCell align="left">{fil.estado}</TableCell>
        <TableCell align="left">
          <Fab
            color="secondary"
            size="small"
            onClick={() => handleUrlHashQr(fil.hashQr)}
          >
            <LinkIcon />
          </Fab>
        </TableCell>
        <TableCell align="left">
          <Fab
            color="default"
            size="small"
            onClick={() => handleImageQr(fil.hashQr)}
          >
            <QrCodeIcon />
          </Fab>
        </TableCell>

        <TableCell align="left">
          <Box display={"flex"} flexDirection={"row"}>
            <Fab
              color="primary"
              size="small"
              onClick={() => handleEditGuia(fil)}
            >
              <EditIcon />
            </Fab>
            <Fab color="warning" size="small">
              <FindInPageIcon />
            </Fab>
          </Box>
        </TableCell>
      </TableRow>
    );
  });

  const handleEditGuia = (guia: panelguia) => {
    // setEdit(false);
    // const selectedPunto = data.data.data.find(item => item.id === id);
    // handleOpenModalForm(
    //   <ModalConductor initialValue={conductor} edit={true} onConfirm={handleConfirm} />,
    //   'Editar conductor'
    // )
  };

  const handleImageQr = (qr: any) => {
    if (qr) {
      setHashQr(qr);
      handleOpen();
    }
  };

  const handleUrlHashQr = (qr: any) => {
    window.open(qr, "_blank");
  };

  const downloadQRCode = () => {
    if (qrRef.current) {
      const canvas = qrRef.current.querySelector('canvas');
      if (canvas) {
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = url;
        link.download = 'codigo_qr.png';
        link.click();
      }
    }
  };

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  return (
    <Container>
      <Box my={3} display="flex" component="div" justifyContent="space-between">
        <Typography>Estado de las Guías Electrónicas</Typography>
        <Button
          color="primary"
          onClick={() => {
            handleOpenModalForm(
              <ModalConductor
                initialValue={null}
                edit={false}
                onConfirm={handleCloseModalForm}
              />,
              "Nuevo conductor"
            );
          }}
          variant="outlined"
        >
          Agregar Conductor
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table aria-label="simple table" size="small">
          <TableHead>
            <TableRow>
              <TableCell width={"5%"}>Id</TableCell>
              <TableCell width={"5%"} align="left">
                Serie
              </TableCell>
              <TableCell width={"5%"} align="left">
                Numero
              </TableCell>
              <TableCell width={"10%"} align="left">
                Fecha
              </TableCell>
              <TableCell width={"5%"} align="left">
                C.Sunat
              </TableCell>
              <TableCell width={"50%"} align="left">
                Descripcion
              </TableCell>
              <TableCell width={"10%"} align="left">
                Estado
              </TableCell>
              <TableCell width={"5%"} align="left">
                QR-Url
              </TableCell>
              <TableCell width={"5%"} align="left">
                QR-Imagen
              </TableCell>
              <TableCell width={"10%"} align="left">
                @
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow style={{ height: 53 * rowsPerPage }}>
                <TableCell colSpan={11} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : rows.length > 0 ? (
              rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            ) : (
              <TableRow style={{ height: 53 * rowsPerPage }}>
                <TableCell colSpan={11} align="center">
                  <h2>No hay resultados</h2>
                </TableCell>
              </TableRow>
            )}

            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={11} />
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
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
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2" mb={2}>
            Imagen QR
          </Typography>
          <Box
            display={"flex"}
            textAlign={"center"}
            justifyContent={'center'}
            ref={qrRef}
          >
            <QRCode value={hashQr} size={256} />
          </Box>
          <Button onClick={downloadQRCode} sx={{mt:2}} fullWidth variant="contained" color="success">

            Descargar QR

          </Button>
        </Box>
      </Modal>
    </Container>
  );
};

export default Guias;
