
// import DespatchPage from "../pages/despatch";

import RegisterForm from "../views/RegisterForm";
// import Layout from "../layouts/Layout";
import Inicio from "../views/Inicio";
import AuthLayout from "../layouts/AuthLayout";
import LoginForm from "../views/LoginForm";
import AdminLayout from "../layouts/AdminLayout";
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
import GuiaRemisionNueva from "../pages/GuiaRemisionNueva";
import GuiaRapida from "../pages/GuiaRapida";
import { GUIA_RAPIDA_HABILITADA } from "../config/modulos";
import PuntoUbicacion from "../views/PuntosUbicacion";
import Personas from "../views/Personas";
import Conductores from "../views/Conductores";
import Transportistas from "../views/Transportista";
import SunatParameters from "../views/SunatParameters";

import Asignaciones from "../views/Asignaciones";
import ClonarFavoritos from "../views/ClonarFavoritos";
import Vehiculos from "../views/Vehiculos";
import Guias from "../views/Guias";
import PuntoEmision from "../views/PuntoEmision";
import Numeracion from "../views/Numeracion";
import { Navigate, createBrowserRouter } from "react-router-dom";

// Componentes de protección de rutas
import PrivateRoute from "../components/PrivateRoute";
import PublicRoute from "../components/PublicRoute";

import GuiaRemisionEditForm from "../pages/GuiaRemision/edit";


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
        index: true,
        element: <Inicio />
      }
    ]
  },
  {
    path: '/auth',
    element: (
      <PublicRoute>
        <AuthLayout />
      </PublicRoute>
    ),
    children: [
      {
        path: '/auth/login',
        element: <LoginForm />
      },
      {
        path: '/auth/registro',
        element: <RegisterForm />
      }
    ]
  },
  {
    path: '/admin',
    element: (
      <PrivateRoute>
        <AdminLayout />
      </PrivateRoute>
    ),
    children: [
      {
        // Sin dashboard por ahora: /admin lleva al panel de guías.
        index: true,
        element: <Navigate to="/admin/guias" replace />
      },
      {
        path: '/admin/reportes',
        element: <Reportes />
      },
      {
        path: '/admin/productos',
        element: <Productos />
      },
      {
        path: '/admin/puntos',
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
        path: '/admin/transportista',
        element: <Transportistas />
      },
      {
        path: '/admin/sunat',
        element: <SunatParameters />
      },
      {
        path: '/admin/vehiculos',
        element: <Vehiculos />
      },
      {
        // Sólo admin: la página redirige si el perfil es otro.
        path: '/admin/asignaciones',
        element: <Asignaciones />
      },
      {
        // Sólo admin: la página redirige si el perfil es otro.
        path: '/admin/favoritos/clonar',
        element: <ClonarFavoritos />
      },
      {
        path: '/admin/numeracion',
        element: <Numeracion />
      },
      {
        path: '/admin/guias',
        element: <Guias />
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
        path: '/admin/guiaremision/nueva',
        element: <GuiaRemisionNueva />
      },
      {
        path: '/admin/guiaremision/nueva/:id',
        element: <GuiaRemisionNueva />
      },
      {
        path: '/admin/guiaremision/rapida',
        // Sólo para empresas con SCOP (VITE_GUIA_RAPIDA); si no, se va a la emisión normal.
        element: GUIA_RAPIDA_HABILITADA ? <GuiaRapida /> : <Navigate to="/admin/guiaremision/nueva" replace />
      },
      // {
      //   path: '/admin/guiaremision/edit/:id',
      //   element: <GuiaRemisionEdit />
      // },
      {
        path: '/admin/guiaremision/edit/:id',
        element: <GuiaRemisionEditForm />
      },
      {
        path: '/admin/logout',
        element: <LogoutPage />
      },
      {
        path: '/admin/debug-auth',
        element: <AuthDebugPage />
      },

    ]
  },
  // Ruta catch-all para páginas no encontradas
  {
    path: "*",
    element: (
      <PrivateRoute>
        <AdminLayout />
      </PrivateRoute>
    ),
    children: [
      {
        path: "*",
        element: (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2>Página no encontrada</h2>
            <p>La página que buscas no existe.</p>
          </div>
        )
      }
    ]
  }
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

