import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ThemeConfig } from "./config/theme.config.tsx";
// import { DialogProvider } from "./context/dialog.context.tsx";
import { NotificationProvider } from "./context/notification.context.tsx";
import { ParamsProvider } from "./context/params.context.tsx";
import { TokenProvider } from "./context/token.context.tsx";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/routes.tsx";
import { CssBaseline } from "@mui/material";
import { ModalProvider } from "./context/modal.context.tsx";
import { AuxiliarProvider } from "./context/AuxiliarProvider.tsx";
import { DialogProvider } from "./context/dialog.context.tsx";

// dotenv.config();

// console.log(process.env.API_URL_CONSULT_PERSONAS);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeConfig>
      
      <NotificationProvider>
        <DialogProvider>
          {/* <ParamsProvider> */}
            {/* <TokenProvider> */}
            <ModalProvider>
              <AuxiliarProvider>
                <RouterProvider  router={router}/>
              </AuxiliarProvider>
            </ModalProvider>
              {/* <App /> */}
            {/* </TokenProvider> */}
          {/* </ParamsProvider> */}
        </DialogProvider>
      </NotificationProvider>
    </ThemeConfig>
  </React.StrictMode>
);
