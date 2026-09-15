# Componente de Edición de Guía de Remisión

## Descripción
`GuiaRemisionEdit` es un componente completamente independiente para editar guías de remisión existentes. No modifica ningún código existente y mantiene toda la funcionalidad original intacta.

## Ubicación
```
src/pages/GuiaRemisionEdit/
├── index.tsx                           # Componente principal
├── components/
│   ├── ProcesarGuiaModal.tsx          # Modal para procesar guía
│   └── PreviewGuiaModal.tsx           # Modal de vista previa
└── README.md                          # Este archivo
```

## Características

### ✅ **Funcionalidades Implementadas**
- **Carga automática de datos** - Obtiene la guía por ID
- **Interfaz organizada con acordeones** - Secciones colapsables para mejor UX
- **Edición completa de todas las secciones**:
  - Datos Generales
  - Destinatario
  - Datos de Envío
  - Direcciones (partida y llegada)
  - Transporte (transportista, vehículo, conductores)
  - Productos/Detalles
- **Detección de cambios** - Indica cuando hay modificaciones sin guardar
- **Actualización en tiempo real** - Guarda cambios via API
- **Navegación segura** - Botón para volver a la lista
- **Reutilización de componentes** - Usa todos los formularios existentes

### 🎨 **Diseño y UX**
- **Interfaz moderna** con Material-UI
- **Responsivo** - Funciona en móvil y desktop
- **Feedback visual** - Chips de estado, alertas de cambios
- **Navegación intuitiva** - Acordeones con iconos descriptivos
- **Modales organizados** - Cada sección se edita en su propio modal

## Cómo Usar

### Opción 1: Activar las rutas (Recomendado)
1. **Reemplazar el archivo de rutas** por la versión que incluye la nueva ruta:
   ```bash
   # Respaldar el actual
   cp src/routes/routes.tsx src/routes/routes-backup.tsx
   
   # Usar la nueva versión
   cp src/routes/routes-with-edit.tsx src/routes/routes.tsx
   ```

2. **Acceder via URL**:
   ```
   /admin/guiaremision/edit/{id}
   ```
   Donde `{id}` es el ID de la guía que quieres editar.

### Opción 2: Integración manual en componentes existentes
```tsx
import GuiaRemisionEdit from '../pages/GuiaRemisionEdit';

// En tu componente de lista de guías:
<Button 
  onClick={() => navigate(`/admin/guiaremision/edit/${guiaId}`)}
>
  Editar
</Button>

// O usar como componente directo:
<GuiaRemisionEdit guiaId="123" />
```

### Opción 3: Agregar botón de edición a la lista de guías
En el componente donde muestras la lista de guías, agregar:
```tsx
<IconButton 
  onClick={() => navigate(`/admin/guiaremision/edit/${guia.id}`)}
  color="primary"
>
  <EditIcon />
</IconButton>
```

## API y Servicios

### **Servicios Utilizados**
- `GuiaServices.get(id)` - Cargar datos de la guía
- `GuiaServices.update(data, id)` - Actualizar la guía
- Todos los servicios de los componentes originales

### **Props del Componente**
```tsx
interface GuiaRemisionEditProps {
  guiaId?: string; // ID de la guía (opcional si viene por URL params)
}
```

## Estructura de Datos

### **Estados Principales**
```tsx
- loading: boolean              // Estado de carga inicial
- saving: boolean              // Estado de guardado
- originalData: GuiaRemision   // Datos originales para comparar
- additionalData: {            // Datos adicionales
    adicionalDocs: AddDoc[]
    detalles: Detail[]
    base64Pdf: string
    datosParaProcesar: any
    estadoElectronico: any
  }
```

### **Modales Disponibles**
- `destinatario` - Editar destinatario
- `tercero` - Editar tercero
- `partida` - Editar dirección de partida
- `llegada` - Editar dirección de llegada
- `transportista` - Editar transportista
- `vehiculo` - Editar vehículo
- `conductores` - Gestionar conductores
- `detalles` - Gestionar productos

## Funcionalidades Avanzadas

### **Detección de Cambios**
```tsx
const hasUnsavedChanges = () => {
  return JSON.stringify(formik.values) !== JSON.stringify(originalData) ||
         JSON.stringify(additionalData.adicionalDocs) !== JSON.stringify(originalData.addDocs) ||
         JSON.stringify(additionalData.detalles) !== JSON.stringify(originalData.details);
};
```

### **Validación de Formularios**
Utiliza el mismo esquema de validación (`GuiaRemisionSchema`) que el componente original.

### **Manejo de Errores**
- Notificaciones de éxito/error
- Redirección automática si no se puede cargar la guía
- Validación de permisos de usuario

## Ventajas de esta Implementación

### ✅ **Sin Conflictos**
- **No modifica código existente**
- **Mantiene funcionalidad original intacta**
- **Fácil de remover si no se necesita**

### ✅ **Reutilización Máxima**
- **Usa todos los componentes existentes**
- **Mantiene la misma lógica de validación**
- **Consistencia visual con el resto de la app**

### ✅ **Escalable**
- **Fácil agregar nuevas funcionalidades**
- **Arquitectura modular**
- **Componentes independientes**

## Personalización

### **Modificar Secciones Visibles**
Editar el array de acordeones en el JSX del componente principal.

### **Cambiar Validaciones**
Modificar las funciones `handle*Change` para agregar validaciones específicas.

### **Agregar Nuevos Modales**
1. Agregar al estado `modals`
2. Crear la función handler
3. Agregar el `DialogComponentCustom` correspondiente

## Ejemplo de Uso Completo

```tsx
// En tu componente de lista de guías
import { useNavigate } from 'react-router-dom';

const GuiasList = () => {
  const navigate = useNavigate();
  
  return (
    <TableContainer>
      <Table>
        <TableBody>
          {guias.map((guia) => (
            <TableRow key={guia.id}>
              <TableCell>{guia.serie}-{guia.correlativo}</TableCell>
              <TableCell>
                <IconButton
                  onClick={() => navigate(`/admin/guiaremision/edit/${guia.id}`)}
                  color="primary"
                  title="Editar guía"
                >
                  <EditIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
```

## Troubleshooting

### **Error: Cannot find module**
Verificar que todas las rutas de import sean correctas.

### **Error: GuiaServices method not found**
Verificar que el servicio tenga los métodos `get()` y `update()`.

### **Error: Navigation not working**
Verificar que las rutas estén configuradas correctamente en `routes.tsx`.

---

**Nota**: Este componente está diseñado para ser completamente independiente y no afectar el funcionamiento existente de la aplicación.
