import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

/**
 * La raíz no tiene contenido propio: se lleva a cada perfil a su pantalla de
 * trabajo (los operadores no ven el dashboard en el menú).
 */
const Inicio = () => {
  const perfil = useAuthStore((state) => state.user?.perfil)
  return <Navigate to={perfil === 'operador' ? '/admin/guias' : '/admin'} replace />
}

export default Inicio
