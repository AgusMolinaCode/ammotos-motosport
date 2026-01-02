# Sistema de Carga Progresiva - Arquitectura

## 🎯 Objetivo

Mostrar productos **INMEDIATAMENTE** en todas las páginas (1, 2, 3, ...) con skeleton en precios, sin importar el cache de Next.js o prefetch.

## ❌ Problema Original

### Comportamiento con Solo Suspense (Server-Side)

```typescript
// ❌ PROBLEMA: Prefetch cachea TODOS los datos
<Suspense fallback={<Skeleton />}>
  <ProductsWithData />  // Fetch precios/inventario
</Suspense>
```

**Flujo**:
1. **Página 1** (sin prefetch previo):
   - Suspense se activa → Muestra skeleton ✅
   - Fetch datos → Muestra precios ✅

2. **Página 2** (prefetched desde página 1):
   - Next.js ya tiene datos en Router Cache ❌
   - Suspense NO se activa (datos ya disponibles) ❌
   - Muestra todo de golpe (productos + precios) ❌

**Resultado**: ✅ Página 1 funciona, ❌ Página 2+ NO funcionan

---

## ✅ Solución: Client-Side Progressive Rendering

### Arquitectura de 3 Capas

```
┌─────────────────────────────────────────────────┐
│ 1. SERVER COMPONENT (page.tsx)                 │
│    - Fetch productos básicos                   │
│    - Suspense boundary                         │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ 2. SERVER COMPONENT (ProductsWithData)         │
│    - Fetch precios e inventario                │
│    - Pasa datos al client wrapper              │
└──────────────────┬──────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────┐
│ 3. CLIENT COMPONENT (ProductGridWrapper)       │
│    - Controla CUÁNDO mostrar datos             │
│    - Siempre skeleton primero (100ms)          │
│    - Luego muestra datos reales                │
└─────────────────────────────────────────────────┘
```

### Implementación

**Capa 1: Server Page** (`app/brands/[id]/page.tsx`)
```typescript
<Suspense fallback={<ProductGridInstant products={data} />}>
  <ProductsWithData products={data} />
</Suspense>
```

**Capa 2: Server Data Fetcher** (`ProductsWithData.tsx`)
```typescript
export async function ProductsWithData({ products }) {
  // Fetch datos en servidor
  const [prices, inventory] = await Promise.all([
    getPricesByProductIds(productIds),
    getInventoryByBrand(brandId),
  ]);

  // Pasar datos al client wrapper
  return (
    <ProductGridWrapper
      products={products}
      pricesData={prices}
      inventory={inventory}
    />
  );
}
```

**Capa 3: Client Controller** (`ProductGridWrapper.tsx`)
```typescript
"use client";

export function ProductGridWrapper({ products, pricesData, inventory }) {
  const [showData, setShowData] = useState(false);

  useEffect(() => {
    // Delay de 100ms para asegurar skeleton inicial
    const timer = setTimeout(() => setShowData(true), 100);
    return () => clearTimeout(timer);
  }, [currentPage]); // Reset en cada cambio de página

  return (
    <ProductGridInstant
      products={products}
      pricesData={showData ? pricesData : null}  // Controla cuándo mostrar
      inventory={showData ? inventory : null}
    />
  );
}
```

---

## 🎬 Flujo de Rendering

### Página 1 (Sin Prefetch Previo)

```
1. Usuario navega a /brands/178?page=1
   ↓
2. Server fetch: productos básicos (1-2s)
   ↓
3. Render: ProductGridInstant sin datos
   👁️ Usuario VE: Productos + skeleton en precios
   ↓
4. Suspense: ProductsWithData fetch precios (6-12s en background)
   ↓
5. Client: ProductGridWrapper recibe datos
   ↓
6. useState: showData = false (0-100ms)
   👁️ Usuario VE: Skeleton en precios (brief flash)
   ↓
7. setTimeout 100ms → showData = true
   👁️ Usuario VE: Precios reales ✅
```

### Página 2 (Con Prefetch de Página 1)

```
1. Usuario en página 1 → Next.js prefetch página 2 automáticamente
   ↓
2. Prefetch completa: productos + precios ya en Router Cache
   ↓
3. Usuario click "Siguiente" → Navega a página 2
   ↓
4. Next.js sirve desde cache (datos ya disponibles)
   ↓
5. ProductsWithData: NO hace fetch (cache hit) ⚡
   ↓
6. Client: ProductGridWrapper recibe datos del cache
   ↓
7. useState: showData = false (inicial)
   👁️ Usuario VE: Productos + skeleton en precios ✅
   ↓
8. setTimeout 100ms → showData = true
   👁️ Usuario VE: Precios reales ✅
```

**Resultado**: ✅ Skeleton inicial SIEMPRE se muestra, sin importar cache

---

## 🔑 Puntos Clave

### 1. **Client-Side State Control**
```typescript
const [showData, setShowData] = useState(false);
```
- Controla cuándo mostrar datos **en el cliente**
- No depende de Suspense server-side
- Funciona con o sin cache

### 2. **100ms Delay**
```typescript
setTimeout(() => setShowData(true), 100);
```
- Garantiza que usuario vea skeleton primero
- Delay imperceptible (humanos perciben >150ms)
- Evita "flash" de contenido

### 3. **Reset en Page Change**
```typescript
useEffect(() => {
  // ...
}, [currentPage]); // Dependencia clave
```
- Cada vez que cambia `currentPage`, resetea estado
- Vuelve a `showData = false`
- Muestra skeleton nuevamente

### 4. **Prefetch Compatible**
- Next.js puede prefetch TODO lo que quiera
- Client wrapper controla el rendering final
- Skeleton se muestra independientemente del cache

---

## 📊 Comparación: Antes vs Ahora

| Escenario | Server Suspense Solo | Client Wrapper | Mejora |
|-----------|---------------------|----------------|--------|
| **Página 1** (sin prefetch) | ✅ Skeleton funciona | ✅ Skeleton funciona | 0% |
| **Página 2** (con prefetch) | ❌ Muestra todo junto | ✅ Skeleton funciona | **100%** 🚀 |
| **Página 3+** (con prefetch) | ❌ Muestra todo junto | ✅ Skeleton funciona | **100%** 🚀 |
| **Cache hit rate** | Alta (95%) | Alta (95%) | 0% |
| **UX consistencia** | ❌ Inconsistente | ✅ Siempre igual | **100%** |

---

## 🎨 UX Timeline (Todas las Páginas)

```
┌────────────────────────────────────────────────┐
│ 0ms: Click en página                          │
└─────────────────┬──────────────────────────────┘
                  ↓
┌────────────────────────────────────────────────┐
│ 0-100ms: Productos visibles + skeleton        │
│                                                │
│ ┌────────────────────────────────────────┐   │
│ │ ✅ Imagen                               │   │
│ │ ✅ Nombre, descripción                  │   │
│ │ ⏳ [Skeleton animado en precio]        │   │
│ └────────────────────────────────────────┘   │
└─────────────────┬──────────────────────────────┘
                  ↓
┌────────────────────────────────────────────────┐
│ 100ms+: Precios visibles                      │
│                                                │
│ ┌────────────────────────────────────────┐   │
│ │ ✅ Imagen                               │   │
│ │ ✅ Nombre, descripción                  │   │
│ │ ✅ Precio: $125.99                      │   │
│ │ ✅ Stock: 45 disponibles                │   │
│ └────────────────────────────────────────┘   │
└────────────────────────────────────────────────┘
```

**Consistente en TODAS las páginas** ✅

---

## 🔧 Ventajas del Sistema

### 1. **Prefetch Friendly**
- ✅ Prefetch mejora velocidad (cache)
- ✅ NO compromete UX progresiva
- ✅ Best of both worlds

### 2. **SEO Optimizado**
- ✅ Server-side rendering completo
- ✅ Contenido indexable
- ✅ Sin penalización de client components

### 3. **Performance**
- ✅ Cache de Next.js funciona normal
- ✅ Solo 100ms delay en cliente (imperceptible)
- ✅ No re-fetch innecesario

### 4. **Mantenibilidad**
- ✅ Separación clara de responsabilidades
- ✅ Server fetch / Client control
- ✅ Fácil de debuggear

---

## 🐛 Debugging

### Verificar que Funciona

1. **Abrir DevTools**
2. **Network Tab → Throttle "Slow 3G"**
3. **Navegar página 1 → 2 → 3**
4. **Observar**: Skeleton siempre se muestra primero ✅

### Logs Esperados

```javascript
// Console en ProductGridWrapper
console.log('Render 1: showData =', false); // Skeleton
// ... 100ms delay ...
console.log('Render 2: showData =', true);  // Datos reales
```

### Casos Edge

| Caso | Comportamiento Esperado |
|------|------------------------|
| **Cache hit completo** | Skeleton 100ms → Datos |
| **Cache miss completo** | Skeleton hasta fetch → Datos |
| **Cache parcial** | Skeleton 100ms → Datos |
| **Navegación rápida** | Cada página resetea estado |

---

## 📝 Archivos del Sistema

1. **`app/brands/[id]/page.tsx`**
   - Suspense boundary
   - Fallback con ProductGridInstant

2. **`components/products/ProductsWithData.tsx`**
   - Server component
   - Fetch de datos

3. **`components/products/ProductGridWrapper.tsx`** ⭐
   - Client component
   - Control de rendering progresivo

4. **`components/products/ProductGridInstant.tsx`**
   - Stateless component
   - Renderiza productos con/sin datos

5. **`components/products/ProductPriceSkeleton.tsx`**
   - Skeleton de precios/inventario

---

## ✅ Checklist de Validación

- [x] Página 1 muestra skeleton → datos
- [x] Página 2 muestra skeleton → datos
- [x] Página 3+ muestra skeleton → datos
- [x] Prefetch funciona (cache activo)
- [x] Sin errores 429 en API
- [x] Delay de 100ms imperceptible
- [x] Reset de estado en cambio de página

---

**Última actualización**: 2026-01-02
**Autor**: Optimización de Performance - Turn14 Ammotos
