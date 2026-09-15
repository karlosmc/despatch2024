// import DespatchPage from "../pages/despatch";

import RegisterForm from "../views/RegisterForm";
// import Layout from "../layouts/Layout";
import Inicio from "../views/Inicio";
import AuthLayout from "../layouts/AuthLayout";
import LoginForm from "../views/LoginForm";
import AdminLayout from "../layouts/AdminLayout";
import Dashboard from "../views/Dashboard";
import LogoutPage from "../views/LogoutPage";
import AuthDebugPage from "../views/AuthDebugPage";


// import Guias from "../views/Guias";
// import Dashboard from "../views/Dashboard";
import Reportes from "../views/Reportes";
import Productos from "../views/Productos";
// import TestStepForm from "../views/TestStepForm";
// import Test2Stepper from "../views/Test2Stepper";
// import MultiStep from "../views/MultiStep";
// import CustomStepper from "../pages/CustomStepper";
import GuiaRemisionMain from "../pages/GuiaRemision";
import GuiaRemisionEdit from "../pages/GuiaRemisionEdit"; // Nuevo componente de edición
import PuntoUbicacion from "../views/PuntosUbicacion";
import Personas from "../views/Personas";
import Conductores from "../views/Conductores";
import Transportistas from "../views/Transportista";
import SunatParameters from "../views/SunatParameters";

import Vehiculos from "../views/Vehiculos";
import Guias from "../views/Guias";
import PuntoEmision from "../views/PuntoEmision";
import Numeracion from "../views/Numeracion";
import { createBrowserRouter } from "react-router-dom";

// Componentes de protección de rutas
import PrivateRoute from "../components/PrivateRoute";
import PublicRoute from "../components/PublicRoute";

// import LoginForm from "../pages/login";




export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <PrivateRoute>
        <AdminLayout />
      </PrivateRoute>
    ),
    children: [
      {
        path: '/admin',
        element: <Dashboard />
      },
      {
        path: '/admin/dashboard',
        element: <Dashboard />
      },
      {
        path: '/admin/reportes',
        element: <Reportes />
      },
      {
        path: '/admin/puntoubicacion',
        element: <PuntoUbicacion />
      },
      {
        path: '/admin/personas',
        element: <Personas />
      },
      {
        path: '/admin/conductores',
        element: <Conductores />
      },
      {
        path: '/admin/transportistas',
        element: <Transportistas />
      },
      {
        path: '/admin/vehiculos',
        element: <Vehiculos />
      },
      {
        path: '/admin/productos',
        element: <Productos />
      },
      {
        path: '/admin/guias',
        element: <Guias />
      },
      {
        path: '/admin/numeracion',
        element: <Numeracion />
      },
      {
        path: '/admin/puntoemision',
        element: <PuntoEmision />
      },
      {
        path: '/admin/guiaremision',
        element: <GuiaRemisionMain />
      },
      {
        path: '/admin/guiaremision/edit/:id',
        element: <GuiaRemisionEdit />
      },
      {
        path: '/admin/logout',
        element: <LogoutPage />
      },
      {
        path: '/admin/sunat',
        element: <SunatParameters />
      },
      {
        path: '/debug',
        element: <AuthDebugPage />
      }
    ]
  },
  {
    path: "/",
    element: (
      <PublicRoute>
        <AuthLayout />
      </PublicRoute>
    ),
    children: [
      {
        path: '/',
        element: <Inicio />
      },
      {
        path: '/login',
        element: <LoginForm />
      },
      {
        path: '/register',
        element: <RegisterForm />
      }
    ]
  }
]);
