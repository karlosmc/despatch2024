
import { useModal } from "../context/modal.context";
import { Breakpoint, Button, Dialog, DialogActions, DialogContent, DialogTitle, Portal } from "@mui/material";


type useModalComponentsProps = {
  title: string;
  content: React.ReactNode;
  modalName:string;
  maxWidth?:Breakpoint|false;
}

export const useModalComponent = ({ title, content,modalName,maxWidth=false }: useModalComponentsProps) => {

  const { isModalOpen, closeModal } = useModal()
  // const [isMounted, setIsMounted] = useState<boolean>(false)


  // useEffect(() => {
  //   if (isModalOpen(modalName)) {
  //     setIsMounted(true)
  //   } else {
  //     // setTimeout(() => {
  //       setIsMounted(false)
  //     // }, 300);
  //   }

  // }, [isModalOpen(modalName)])

  const handleClose = () =>{
    closeModal(modalName)
  }

  const ModalComponent = () => (
    
      <Portal>
        <Dialog maxWidth={maxWidth} open={isModalOpen(modalName)} scroll="paper" disableEscapeKeyDown onClose={handleClose}>
          <DialogTitle>{title}</DialogTitle>
          <DialogContent>{content}</DialogContent>
          <DialogActions>
            <Button variant="contained" color="error" onClick={handleClose} fullWidth sx={{m:2}}>Close</Button>
          </DialogActions>
        </Dialog>
      </Portal>
    
  )
  return ModalComponent

}