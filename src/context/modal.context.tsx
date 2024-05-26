import React, { ReactNode, useContext, useState } from "react";


type ModalContextType = {
  isModalOpen :(modalName:string)=>boolean;
  openModal:(modalName:string)=>void;
  closeModal:(modalName:string)=>void;
}

const ModalContext = React.createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [modals, setModals] = useState<{[key:string]:boolean}>({});

  const openModal = (modalName:string) => setModals({...modals,[modalName]:true})
  const closeModal = (modalName:string) => setModals({...modals,[modalName]:false})
  const isModalOpen = (modalName:string) => !!modals[modalName]

  return(
    <ModalContext.Provider value={{ isModalOpen ,openModal,closeModal}}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);

  if (!context) throw new Error("No existe contexto");
  return context;
};
