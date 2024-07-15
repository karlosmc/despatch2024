import { createBrowserRouter } from "react-router-dom";

// import DespatchPage from "../pages/despatch";

import RegisterForm from "../views/RegisterForm";
// import Layout from "../layouts/Layout";
import Inicio from "../views/Inicio";
import AuthLayout from "../layouts/AuthLayout";
import LoginForm from "../views/LoginForm";
import AdminLayout from "../layouts/AdminLayout";

// import Guias from "../views/Guias";
// import Dashboard from "../views/Dashboard";
import Reportes from "../views/Reportes";
import Productos from "../views/Productos";
// import TestStepForm from "../views/TestStepForm";
// import Test2Stepper from "../views/Test2Stepper";
// import MultiStep from "../views/MultiStep";
// import CustomStepper from "../pages/CustomStepper";
import GuiaRemisionMain from "../pages/GuiaRemision";
import PuntoUbicacion from "../views/PuntosUbicacion";
import Personas from "../views/Personas";
import Conductores from "../views/Conductores";
import Transportistas from "../views/Transportista";
import SunatParameters from "../views/SunatParameters";
import Grelayout from "../layouts/GreLayout";
import Vehiculos from "../views/Vehiculos";
import Guias from "../views/Guias";
import GuiaRemisionEdicion from "../pages/GuiaRemision/edicionMode";

import { CssBaseline, ThemeProvider } from "@mui/material";
import { ThemeContextProvider, useThemeContext } from '../context/themeProvider';
// import LoginForm from "../pages/login";




export const router = createBrowserRouter([
  {
        path: "/",
        
        element: <AdminLayout />,
        children:[
          {
            index:true,
            element:<Inicio/>
          }
        ]
  },
  {
    path:'/auth',
    element:<AuthLayout/>,
    children:[
      {
        path:'/auth/login',
        element:<LoginForm/>
      },
      {
        path:'/auth/registro',
        element:<RegisterForm />
      }
    ]
  },
  {
    path:'/admin',
    element:<AdminLayout/>,
    children:[
     
      {
        path:'/admin/reportes',
        element:<Reportes/>
      },
      {
        path:'/admin/productos',
        element:<Productos/>
      },
      {
        path:'/admin/puntos',
        element:<PuntoUbicacion/>
      },
      {
        path:'/admin/personas',
        element:<Personas/>
      },
      {
        path:'/admin/conductores',
        element:<Conductores/>
      },
      {
        path:'/admin/transportista',
        element:<Transportistas/>
      },
      {
        path:'/admin/sunat',
        element:<SunatParameters/>
      },
      {
        path:'/admin/vehiculos',
        element:<Vehiculos/>
      },
      {
        path:'/admin/guias',
        element:<Guias/>
      },
      {
        path:'/admin/guiaremision',
        element:<GuiaRemisionMain/>
      },
      
    ]
  },
  // {
  //   path:'/gre',
  //   element:<Grelayout/>,
  //   children:[
  //     {
  //     path:'/gre/guiaremision',
  //     element:<GuiaRemisionMain/>
  //     },
  //   ]
  // },
  // {
  //   path:'/guiaedicion/:id',
  //   element:<GuiaRemisionEdicion/>
  // }
 
]);

