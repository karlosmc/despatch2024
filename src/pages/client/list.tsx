// import { FC, useEffect, useState } from "react";
// import {
//   Box,
//   Button,
//   CircularProgress,
//   Container,
//   Fab,
//   Grid,
//   Paper,
//   Table,
//   TableBody,
//   TableCell,
//   TableContainer,
//   TableHead,
//   TableRow,
//   Tooltip,
//   Zoom,
// } from "@mui/material";

// import { client } from "../../api/client";
// import { ClientInterface } from "../../types/client.interface";
// import { useDialog } from "../../context/dialog.context";
// import { FormClient } from "./form";
// import { ModeEdit } from "@mui/icons-material";



// export const ClientList: FC = () => {
//   const [allClients, setAllClients] = useState<ClientInterface[] | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [openModal, setOpenModal] = useState<boolean>(false);
//   const [refresh, setRefresh] = useState<boolean>(false);

//   const { getModal } = useDialog();

//   useEffect(() => {
//     setLoading(true);
//     setRefresh(false);
//     client
//       .getAll()
//       .then((res) => {
//         setAllClients(res.data.result);
//         setTimeout(() => setLoading(false), 1500);
//       })
//       .catch((err) => console.log(err));
//   }, [refresh]);

//   useEffect(() => {
//     getModal(
//       <FormClient setOpenModal={setOpenModal} setRefresh={setRefresh} />,
//       "FORMULARIO CLIENTE",
//       openModal,
//       <Button
//         variant="outlined"
//         color="secondary"
//         onClick={() => setOpenModal(false)}
//       >
//         Cancel
//       </Button>
//     );
    
//   }, [openModal]);

//   const handleClick = () => {
//     setOpenModal(true);
//   };

//   return (
//     <Container maxWidth="xl" sx={{ mt: 5 }}>

//       <Grid container sx={{ mb: 5 }} justifyContent="center">
//         <Button color="secondary" variant="outlined" onClick={handleClick}>
//           Nuevo
//         </Button>

//       </Grid>

//       <Grid container justifyContent="center">
//         {loading ? (
//           <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
//             <CircularProgress />
//           </Box>
//         ) : (
//           <TableContainer component={Paper}>
//             <Table>
//               <TableHead>
//                 <TableRow>
//                   <TableCell>id</TableCell>
//                   <TableCell>Tipo Doc.</TableCell>
//                   <TableCell>Nro. Doc.</TableCell>
//                   <TableCell>Razon Social</TableCell>
//                   <TableCell>Email</TableCell>
//                   <TableCell>Teléfono</TableCell>
//                   <TableCell>@</TableCell>
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//                 {allClients?.length !== 0 ? (
//                   <>
//                     {allClients?.map((client) => (
//                       <TableRow key={client.id}>
//                         <TableCell>{client.id}</TableCell>
//                         <TableCell>{client.tipoDoc}</TableCell>
//                         <TableCell>{client.numDoc}</TableCell>
//                         <TableCell>{client.rznSocial}</TableCell>
//                         <TableCell>{client.email}</TableCell>
//                         <TableCell>{client.telephone}</TableCell>

//                         <TableCell align="center">
//                           <Tooltip
//                             TransitionComponent={Zoom}
//                             arrow
//                             title={"Editar"}
//                             placement="right"
//                           >
//                             <Fab
//                               color={"info"}
//                               aria-label="edit"
//                               size="small"
                              
                              
//                               /* onClick={HandledOperacion} */
//                             >
                              
//                                 <ModeEdit color="action" />
                            
//                             </Fab>
//                           </Tooltip>
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </>
//                 ) : (
//                   <TableRow>
//                     <TableCell colSpan={7}>No hay Nada que mostrar</TableCell>
//                   </TableRow>
//                 )}
//               </TableBody>
//             </Table>
//           </TableContainer>
//         )}
//       </Grid>
//     </Container>
//   );
// };
