import React, { useContext, useState } from "react";

import {DialogComponent} from "../components";

type ContextProps = {
  /* getError: (msg: string) => void;
  getSuccess: (msg: string) => void; */
  getModal: (element: React.ReactElement, title: string, open:boolean, closeButton:React.ReactNode) => void;
};

const DialogContext = React.createContext<ContextProps | null>(null);

export const DialogProvider: React.FC<{ children: JSX.Element }> = ({
  children,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [element, setElement] = useState<React.ReactNode>(null);
  const [closeButton, setCloseButton] = useState<React.ReactNode>(null);


  const getModal = (element: React.ReactElement, title: string,open:boolean,closeButton:React.ReactNode) => {
    setOpen(open);
    setTitle(title);
    setElement(element);
    setCloseButton(closeButton)
  };

  const value = {
    getModal,
  };
  return (
    <DialogContext.Provider value={value}>
      <DialogComponent
        
        open={open}
        element={element}
        title={title}
        closeButton={closeButton}
      />
      {children}
    </DialogContext.Provider>
  );
};

export const useDialog = () => {
  const context = useContext(DialogContext);

  if (!context) throw new Error("No existe contexto");
  return context;
};
