import { Alert, AlertColor, Snackbar, Typography } from "@mui/material";
import React from "react";

type NotificationProps = {
  open: boolean;
  msg: string;
  severity: AlertColor | undefined;
  handleClose: () => void;
};

export const Notification: React.FC<NotificationProps> = ({
  open,
  msg,
  severity,
  handleClose,
}) => {
  return (
    <Snackbar
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      autoHideDuration={5000}
      open={open}
      onClose={handleClose}
    >
      <Alert variant="filled" onClose={handleClose} severity={severity} sx={{color:'white'}}>
        <Typography>
            {msg}
        </Typography>
      </Alert>
    </Snackbar>
  );
};
