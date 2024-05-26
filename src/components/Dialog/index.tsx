import React, { FC } from "react";


import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";

import DialogTitle from "@mui/material/DialogTitle";



type DialogProps = {
  open: boolean;
  
  element?: React.ReactNode;
  title: string;
  closeButton?:React.ReactNode;
};

export const DialogComponent: FC<DialogProps> = ({
  open,
  
  element,
  title,
  closeButton
  
}) => {
  
  return (
    <Dialog open={open} scroll="paper" disableEscapeKeyDown>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent style={{paddingTop:5}}>{element}</DialogContent>
      <DialogActions>
        {closeButton}
      </DialogActions>
    </Dialog>
  );
};
