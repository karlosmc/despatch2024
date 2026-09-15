# Cambios en DatosEnvioForm para soportar Edición

## ✅ **Cambios Realizados:**

### 1. **Habilitado enableReinitialize en Formik**
```tsx
const formik = useFormik({
  initialValues: EnvioValues,
  validationSchema: EnvioSchema,
  enableReinitialize: true, // ⭐ NUEVO: Permite que formik se reinicialice cuando cambien los valores iniciales
  onSubmit: (_) => { }
});
```

### 2. **Agregado useEffect para sincronizar indicadores en edición**
```tsx
// useEffect para sincronizar indicadores cuando se cargan datos desde edición
useEffect(() => {
  if (EnvioValues.indicadores && EnvioValues.indicadores.length > 0) {
    setIndicadores(prevIndicadores => 
      prevIndicadores.map(indicador => ({
        ...indicador,
        selected: EnvioValues.indicadores.includes(indicador.id)
      }))
    );
  }
}, [EnvioValues.indicadores]);
```

## 🔄 **Cómo funciona ahora:**

### **Para Guías Nuevas:**
- El componente funciona igual que antes
- Los valores iniciales vienen vacíos o con valores por defecto
- Los indicadores inician sin seleccionar
- No afecta el comportamiento existente

### **Para Edición de Guías:**
- `enableReinitialize: true` permite que cuando lleguen nuevos `EnvioValues` desde la API, el formulario se actualice automáticamente
- El nuevo useEffect detecta si hay indicadores ya seleccionados en los datos de edición y los marca como `selected: true`
- Los campos se precargan con los valores existentes de la guía

## 🎯 **Ejemplo de uso:**

### **Guía Nueva:**
```tsx
const envioValuesNuevo = {
  codTraslado: "",
  desTraslado: "",
  fecTraslado: dayjs().format("YYYY-MM-DD"),
  indicadores: [], // ← Vacío
  // ... resto de campos
};

<DatosEnvioForm 
  EnvioValues={envioValuesNuevo}
  onChange={handleEnvioChange}
/>
```

### **Edición de Guía:**
```tsx
const envioValuesEdicion = {
  codTraslado: "01",
  desTraslado: "Venta",
  fecTraslado: "2024-01-15",
  indicadores: ["SUNAT_Envio_IndicadorTrasladoVehiculoM1L"], // ← Con datos
  // ... resto de campos
};

<DatosEnvioForm 
  EnvioValues={envioValuesEdicion} // ← Los valores se cargan automáticamente
  onChange={handleEnvioChange}
/>
```

## ✨ **Beneficios:**

1. **Compatibilidad total**: Funciona para guías nuevas Y edición
2. **Sin cambios en la interfaz**: La API del componente sigue igual
3. **Sincronización automática**: Los indicadores se marcan correctamente en edición
4. **No afecta funcionalidad existente**: Las guías nuevas siguen funcionando igual

## 🚀 **Resultado:**
El componente ahora detecta automáticamente si está en modo "nuevo" o "edición" y se comporta apropiadamente en ambos casos, cargando los valores existentes cuando están disponibles.
