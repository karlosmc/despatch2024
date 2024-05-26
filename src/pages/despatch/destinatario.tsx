import React from "react";
import { Client } from "../../types/doc.interface";
import { TextField } from "@mui/material";

/* const DestinatarioValues: Client = {
  id: "",
  numDoc: "",
  rznSocial: "",
  tipoDoc: "",
}; */

interface DestinatarioFormProps {
  destinatario: Client;
  onChange: (destinatario: Client) => void;
}

const Destinatario: React.FC<DestinatarioFormProps> = ({
  destinatario,
  onChange,
}) => {
  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    onChange({
      ...destinatario,
      [name]: value,
    });
  };
  return (
    <>
      <TextField
        margin="normal"
        size="small"
        fullWidth
        name="numDoc"
        label="Número de documento"
        value={destinatario.numDoc}
        onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
          handleChange(e)
        }
      />

      <TextField
        margin="normal"
        size="small"
        fullWidth
        name="rznSocial"
        label="Razón Social"
        value={destinatario.rznSocial}
        onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
          handleChange(e)
        }
      />

      <TextField
        margin="normal"
        size="small"
        fullWidth
        name="tipoDoc"
        label="Tipo de Documento"
        value={destinatario.tipoDoc}
        onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
          handleChange(e)
        }
      />
    </>
  );
};

export default Destinatario;
