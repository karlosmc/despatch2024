import React from "react";
import ReactDOM from "react-dom/client";
// import App from "./App.tsx";
import "./index.css";
// import { ThemeConfig } from "./config/theme.config.tsx";
// import { DialogProvider } from "./context/dialog.context.tsx";
import { NotificationProvider } from "./context/notification.context.tsx";
// import { ParamsProvider } from "./context/params.context.tsx";
// import { TokenProvider } from "./context/token.context.tsx";
import {  RouterProvider } from "react-router-dom";
import { router } from "./routes/routes.tsx";
// import { CssBaseline } from "@mui/material";

import { AuxiliarProvider } from "./context/AuxiliarProvider.tsx";
import { DialogProvider } from "./context/dialog.context.tsx";
import { ThemeConfig } from "./config/theme.config.tsx";
import { ThemeContextProvider } from "./context/themeProvider.tsx";
// import { ThemeConfig } from "./context/themeProvider.tsx";
import { ConfirmProvider } from "material-ui-confirm";



// dotenv.config();

// console.log(process.env.API_URL_CONSULT_PERSONAS);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeContextProvider>
      <ThemeConfig>
        <NotificationProvider>
          <DialogProvider>
            {/* <ParamsProvider> */}
            {/* <TokenProvider> */}
            <AuxiliarProvider>
              <ConfirmProvider>
              
                <RouterProvider router={router} />
              
              </ConfirmProvider>
            </AuxiliarProvider>
            {/* <App /> */}
            {/* </TokenProvider> */}
            {/* </ParamsProvider> */}
          </DialogProvider>
        </NotificationProvider>

      </ThemeConfig>
    </ThemeContextProvider>
  </React.StrictMode>
);
