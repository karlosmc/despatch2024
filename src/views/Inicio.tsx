import { Navigate } from 'react-router-dom'

/**
 * La raíz no tiene contenido propio. Mientras el dashboard está desactivado,
 * todos los perfiles entran al panel de guías.
 */
const Inicio = () => <Navigate to="/admin/guias" replace />

export default Inicio
