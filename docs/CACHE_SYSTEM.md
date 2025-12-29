# Sistema de Caché de Productos - Turn14

## 📋 Descripción

Sistema de caché lazy-loading con TTL (Time To Live) de 3 días para productos de Turn14.

## 🎯 Características

- **Cache on-demand**: Solo cachea las páginas que visitas
- **TTL de 3 días**: Renueva automáticamente productos cada 3 días
- **Sin duplicados**: Usa upsert para evitar productos repetidos
- **Logs claros**: Indica estado del caché en tiempo real

## 🔄 Flujos de Trabajo

### Primera Visita (Cache MISS)
```
Usuario → /brands/38?page=1
    ↓
¿Existe en cache? → NO
    ↓
🌐 Llamar Turn14 API
    ↓
💾 Guardar productos en DB
    ↓
✅ Marcar página como cacheada
    ↓
📄 Mostrar productos al usuario
```

**Log esperado:**
```
🌐 Cache MISS: Fetching from API - Brand 38, Page 1
✅ Saved 100 products to database
```

### Segunda Visita - Caché Válido (< 3 días)
```
Usuario → /brands/38?page=1
    ↓
¿Existe en cache? → SÍ
    ↓
¿Antigüedad < 3 días? → SÍ
    ↓
📦 Leer desde DB
    ↓
📄 Mostrar productos al usuario
```

**Log esperado:**
```
📦 Cache HIT: Brand 38, Page 1 (0.5 días)
```

### Caché Expirado (> 3 días)
```
Usuario → /brands/38?page=1
    ↓
¿Existe en cache? → SÍ
    ↓
¿Antigüedad < 3 días? → NO (4 días)
    ↓
♻️ Invalidar caché antiguo
    ↓
🌐 Llamar Turn14 API
    ↓
💾 Actualizar productos en DB
    ↓
✅ Marcar página como cacheada (nuevo timestamp)
    ↓
📄 Mostrar productos actualizados
```

**Log esperado:**
```
♻️ Cache STALE: Brand 38, Page 1 (4.2 días) - Renovando...
🗑️ Cache invalidated: Brand 38, Page 1
🌐 Fetching from API...
✅ Saved 100 products to database
```

## 🧪 Guía de Pruebas

### Prueba 1: Verificar Cache MISS (Nueva Página)

1. Ve a una marca nueva: `http://localhost:3000/brands/335?page=1`
2. Observa logs del servidor Next.js (terminal)
3. Deberías ver:
   ```
   🌐 Cache MISS: Fetching from API - Brand 335, Page 1
   ✅ Saved X products to database
   ```
4. Refresca la página (F5)
5. Ahora deberías ver:
   ```
   📦 Cache HIT: Brand 335, Page 1 (0.0 días)
   ```

### Prueba 2: Verificar Cache HIT (Página Existente)

1. Ve a: `http://localhost:3000/brands/38?page=1`
2. Observa logs - deberías ver:
   ```
   📦 Cache HIT: Brand 38, Page 1 (X días)
   ```
3. La página carga super rápido (sin llamar a API)

### Prueba 3: Simular Caché Expirado

1. Simula caché antiguo:
   ```bash
   curl "http://localhost:3000/api/test-cache-refresh?brandId=38&page=1"
   ```

2. Ve a: `http://localhost:3000/brands/38?page=1`

3. Observa logs - deberías ver:
   ```
   ♻️ Cache STALE: Brand 38, Page 1 (4.0 días) - Renovando...
   🗑️ Cache invalidated: Brand 38, Page 1
   ✅ Saved X products to database
   ```

4. Refresca nuevamente - ahora verás Cache HIT con 0 días

### Prueba 4: Verificar Estadísticas

```bash
curl http://localhost:3000/api/db-stats
```

Respuesta:
```json
{
  "stats": {
    "brands": 444,
    "products": 3894,
    "cachedPages": 4
  },
  "cachedPages": [
    {
      "brandId": 38,
      "page": 1,
      "cachedAt": "2025-12-29T02:35:28.567Z"
    }
  ]
}
```

## 📊 Estructura de Datos

### Tabla: `products`
```prisma
model Product {
  id                String   @id
  brandId           Int
  brandName         String
  productName       String
  partNumber        String
  mfrPartNumber     String
  // ... más campos
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

### Tabla: `product_page_cache`
```prisma
model ProductPageCache {
  id        String   @id @default(cuid())
  brandId   Int
  page      Int
  cachedAt  DateTime @default(now())  // 👈 Usado para TTL

  @@unique([brandId, page])
}
```

## ⚙️ Configuración

### Cambiar TTL (Time To Live)

En `ProductsSyncService.ts`:
```typescript
private static readonly CACHE_TTL_DAYS = 3; // Cambiar a 7, 14, etc.
```

### Invalidar Todo el Caché

```typescript
// Borrar todas las entradas de caché
await prisma.productPageCache.deleteMany();

// Opcionalmente, borrar productos
await prisma.product.deleteMany();
```

## 🔍 Monitoreo

### Ver Logs en Tiempo Real

```bash
# En terminal donde corre Next.js, verás:
📦 Cache HIT: Brand 38, Page 1 (0.5 días)
🌐 Cache MISS: Fetching from API - Brand 335, Page 1
♻️ Cache STALE: Brand 38, Page 1 (4.2 días) - Renovando...
```

### Verificar Estado del Caché

```bash
curl http://localhost:3000/api/db-stats
```

## 🚀 Rendimiento

- **Cache HIT**: ~50ms (lectura desde PostgreSQL)
- **Cache MISS**: ~2-3s (llamada a Turn14 API + guardado)
- **Cache STALE**: ~2-3s (renovación desde API)

## 📝 Notas Técnicas

1. **Granularidad**: El caché es por página, no por brand completo
2. **Actualización parcial**: Solo renueva las páginas visitadas
3. **Productos huérfanos**: Los productos NO se borran, solo se actualizan
4. **Timestamp**: Usa `cachedAt` para determinar antigüedad
5. **Upsert**: Previene duplicados al guardar productos

## ⚠️ Consideraciones

- El TTL de 3 días es independiente por página
- Si un brand tiene 10 páginas y solo visitas la página 1, solo esa se renovará cada 3 días
- Los productos se actualizan in-place (no se crean duplicados)
