# Documento de Funcionalidades del Sitio Web

## ¿Qué es este sitio?

Plataforma de comercio electrónico para la venta de autopartes y accesorios automotrices mayorista. Está conectado directamente con Turn14 (distribuidor mayorista de autopartes) para mostrar inventario en tiempo real.

---

## Lo que actualmente tenemos funcionando

### 1. Catálogo de Marcas
- Página con todas las marcas disponibles (446 marcas)
- Muestra el logo de cada marca
- Indica si cada marca tiene envío directo (dropship)
- Muestra cuántas tarifas de precio tiene cada marca
- Permite hacer clic en cualquier marca para ver sus productos

### 2. Página de cada Marca (ej: /brands/333)

#### Información de la Marca
- Logo de la marca
- Nombre
- Disponibilidad de envío directo
- Códigos AAIA (identificación de la industria)
- **Tarifas de Precio**: Muestra los diferentes niveles de precios disponibles para esa marca (cada tarifa tiene diferentes reglas de compra y costos por estado/país)

#### Catálogo de Productos
- Lista de productos organizados en grilla (tarjetas)
- Cada producto muestra:
  - Imagen (clic para ver más detalles)
  - Número de pieza del fabricante
  - Nombre del producto
  - Descripción corta
  - Categoría y subcategoría en español
  - Disponibilidad de stock (colores: verde=hay stock, naranja=pedido especial, rojo=sin stock)
  - Precio de lista (tachado)
  - **Tu precio** (precio de compra destacado en naranja)
  - Cantidad a pedir + botón "Agregar"

### 3. Modal de Detalle del Producto
Al hacer clic en la imagen o número de pieza, se abre una ventana emergente con:

- **Galería de imágenes**: Carrusel para ver múltiples fotos del producto
- **Descripción extendida**: Información detallada del producto
- **Documentos PDF**: Manuales, guías de instalación, etc.
- **Desglose de precios**: Precio retail, precio MAP, y tu precio
- **Inventario completo**:
  - Stock total en almacén
  - Stock del fabricante con fecha estimada de disponibilidad
- **Especificaciones físicas**: Peso y dimensiones
- **Información adicional**: Código de barras, número de pieza alternativo
- **Certificaciones**: Si aplica CARB, Prop 65, o liquidación

### 4. Sistema de Filtros
Barra lateral (escritorio) o botón desplegable (móvil) con:

- **Categorías**: 58 categorías traducidas al español (ej: "Filtros de Aire", "Sistemas de Escape", "Suspensión")
- **Subcategorías**: Filtros más específicos dentro de cada categoría
- **Nombres de productos**: Filtrar por línea específica de producto

Los filtros activos se muestran claramente con opción de quitar uno por uno o limpiar todos.

### 5. Paginación
- Navegación entre páginas de productos
- Muestra 5 páginas a la vez con botón de "siguiente"
- Carga rápida (precarga las páginas en segundo plano)

---

## Categorías disponibles (traducidas al español)

### Motor y Rendimiento
Filtros de Aire, Sistemas de Admisión, Refrigeración, Componentes del Motor, Escape, Inducción Forzada, Sistema de Combustible, Encendido, Aceites

### Exterior y Carrocería
Carrocería, Protección, Paragolpes, Parrillas, Luces, Deflectores, Techos, Portaequipajes, Cubiertas de Caja, Parabrisas

### Interior y Confort
Indumentaria, Audio/Video, Alfombrillas, Medidores, Asientos, Bolsas

### Suspensión y Ruedas
Frenos, Suspensión, Neumáticos, Ruedas, Extensiones de Guardabarros, Estribos

### Accesorios y Equipamiento
Baterías, Adquisición de Datos, Programadores, Seguridad, Herramientas, Cabrestantes, Enganches

### Otros
Transmisión, Fabricación, Powersports, Sin Categoría

---

## Lo que el usuario puede hacer

1. **Ver marcas** → Entrar a /test-brands y explorar todas las marcas
2. **Ver productos de una marca** → Clic en cualquier marca
3. **Filtrar productos** → Usar la barra lateral por categoría, subcategoría o nombre
4. **Ver detalles completos** → Clic en imagen o número de pieza
5. **Navegar páginas** → Usar la paginación para explorarcatálogos grandes
6. **Gestionar filtros** → Agregar/quitar filtros, limpiar todos
7. **Agregar al carrito** → Ingresar cantidad y clic en "Agregar"

---

## ¿Qué datos se muestran de cada producto?

| Dato | Descripción |
|------|-------------|
| Número de pieza | Fabricante oficial |
| Nombre producto | Título completo |
| Descripción | Texto corto |
| Descripción extendida | Detalles completos (en modal) |
| Categoría | En español |
| Subcategoría | En español |
| Tarifa de precio | Nivel de precio |
| Precio retail | MSRP (tachado) |
| Precio MAP | Precio mínimo anunciado |
| Tu precio | Precio de compra real |
| Stock | Hay stock / Pedido especial / Sin stock |
| Stock total | Unidades disponibles |
| Stock fabricante | Unidades en fabricante + fecha |
| Peso | Libras |
| Dimensiones | Largo x Ancho x Alto |
| Código de barras | UPC/Barcode |
| Número alternativo | Otras referencias |
| Certificaciones | CARB, Prop 65, Liquidación |

---

## Notas técnicas (para contexto, no técnico)

- Los datos vienen directamente de Turn14 API
- Las categorías están traducidas automáticamente de inglés a español
- La información de marcas se actualiza cada 7 días
- Inventario y precios en tiempo real
- Diseño adaptativo para móviles y computadoras

---

## Próximos pasos / Mejoras potenciales

*Completar con el equipo*

- [ ] Carrito de compras completo
- [ ] Proceso de checkout
- [ ] Historial de pedidos
- [ ] Búsqueda global de productos
- [ ] Comparación de productos
- [ ] Lista de deseos/favoritos
- [ ] Notificaciones de stock
- [ ] Precios por cliente/tarifa
- [ ] Descarga de catálogos en PDF
- [ ] Integración con sistemas de inventario
- [ ] Otros: _______________
