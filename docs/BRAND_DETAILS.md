# Sistema de Lazy-Loading para Brand Details

## Resumen

Sistema de cache on-demand para detalles individuales de brands que minimiza las llamadas a la API de Turn14 cacheando los detalles en PostgreSQL la primera vez que un usuario accede a un brand.

## Estrategia: Cache-on-Demand

```
Primera visita a /brands/260:
  User → getBrandById("260") → DB check (detailsFetched=false)
  → API call Turn14 → Update DB → Mark detailsFetched=true → Return

Visitas subsecuentes a /brands/260:
  User → getBrandById("260") → DB check (detailsFetched=true)
  → Return desde DB (NO API call) ✅ 50x más rápido
```

## Arquitectura

### Modelo de Datos

```prisma
model Brand {
  id               String    @id
  name             String
  dropship         Boolean
  logo             String?
  aaia             String[]
  pricegroups      Json
  detailsFetched   Boolean   @default(false)  // 🔑 Cache flag
  detailsFetchedAt DateTime?                  // Audit trail
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt

  @@index([detailsFetched])  // Optimización de queries
}
```

### Flujo de Datos

```
Turn14 API (/brands/{id})
    ↓ (solo primera vez)
BrandsSyncService.getBrandById()
    ↓ (upsert con detailsFetched=true)
PostgreSQL (brands table)
    ↓ (solo lectura después)
getBrandById() server action
    ↓
/brands/[id] página
```

## Componentes del Sistema

### 1. Domain Types

**Archivo**: `domain/types/turn14/brand-details.ts`

Interfaces para el response de `GET /v1/brands/{id}`:
- `IndividualBrandResponse`
- `IndividualBrandData`
- `IndividualBrandAttributes`

### 2. Service Layer

**Archivo**: `infrastructure/services/BrandsSyncService.ts`

Métodos agregados:

#### `getBrandById(brandId: string)`
Lazy-loading con cache-aside pattern:
1. Check DB para `detailsFetched=true` → retorna inmediatamente (cache hit)
2. Si `false` → fetch API → update DB → marca `true` (cache miss)
3. Nunca actualiza una vez cacheado (inmutable)

#### `forceRefreshBrandDetails(brandId: string)`
Admin tool para forzar actualización (viola inmutabilidad).

#### `getBrandCacheStats()`
Retorna estadísticas del cache:
- Total brands
- Brands con details cacheados
- Brands sin details
- Cache hit rate (%)

### 3. Server Actions

**Archivo**: `application/actions/brands.ts`

#### `getBrandById(brandId: string)`
- Llama al service layer
- Transforma a formato de respuesta API
- Usado por páginas para obtener brand details

#### `getBrandCacheStats()`
- Expone estadísticas del cache
- Usado para monitoreo

### 4. API Routes (Admin Tools)

#### `POST /api/brands/{id}/refresh`
Fuerza actualización de un brand específico.

```bash
curl -X POST http://localhost:3000/api/brands/260/refresh
```

#### `GET /api/brands/stats`
Obtiene estadísticas del cache.

```bash
curl http://localhost:3000/api/brands/stats

# Response:
{
  "success": true,
  "stats": {
    "total": 150,
    "cached": 45,
    "uncached": 105,
    "cacheHitRate": "30.00%"
  }
}
```

### 5. UI Components

#### `/brands/[id]/page.tsx`
Página principal de detalles del brand:
- Muestra logo, nombre, dropship status
- Lista códigos AAIA
- Despliega todos los price groups con detalles
- Muestra purchase restrictions y location rules
- Link de regreso a lista de brands

#### `/brands/[id]/loading.tsx`
Loading state con skeleton animation durante fetch.

#### `/brands/[id]/error.tsx`
Error boundary con:
- Mensaje de error user-friendly
- Botón "Intentar de Nuevo"
- Link para volver a la lista

#### `/test-brands/page.tsx` (modificado)
Nombres de brands ahora son clickables y navegan a `/brands/{id}`.

## Performance

### Primera Visita (Cache Miss)
- DB check: ~10ms
- Turn14 API call: ~200-500ms
- DB update: ~20ms
- **Total**: ~250-550ms

### Visitas Subsecuentes (Cache Hit)
- DB fetch only: ~10ms
- **Total**: ~10ms (**50x más rápido**)

### Escalabilidad
- Almacenamiento por brand: ~2-5KB
- 1000 brands cacheados: ~2-5MB
- Impacto en DB: negligible

## Uso del Sistema

### Navegación Usuario

1. Usuario visita `/test-brands`
2. Hace click en un brand (ej: "3D MAXpider")
3. Navega a `/brands/260`
4. Primera visita:
   - Ve loading state (skeleton)
   - Sistema fetch desde Turn14 API
   - Cachea en DB
   - Muestra detalles completos
5. Segunda visita:
   - Carga instantánea desde DB
   - No hay loading state (o muy breve)

### Admin - Force Refresh

Para actualizar manualmente un brand:

```bash
curl -X POST http://localhost:3000/api/brands/260/refresh
```

### Monitoreo - Cache Stats

Para ver estadísticas del cache:

```bash
curl http://localhost:3000/api/brands/stats
```

## Verificación y Testing

### Checklist Manual

- [ ] Primera visita a `/brands/260` muestra loading state
- [ ] Verificar API call en network tab (cache miss)
- [ ] Segunda visita a `/brands/260` carga instantáneamente
- [ ] Verificar NO hay API call segunda vez (cache hit)
- [ ] Brand ID inválido muestra error boundary
- [ ] Navegación desde lista funciona correctamente
- [ ] Botón "Volver" regresa a lista

### Verificación SQL

```sql
-- Ver estado de cache de un brand específico
SELECT id, name, "detailsFetched", "detailsFetchedAt"
FROM brands
WHERE id = '260';

-- Estadísticas generales
SELECT
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE "detailsFetched" = true) as cached,
  COUNT(*) FILTER (WHERE "detailsFetched" = false) as uncached,
  ROUND(
    (COUNT(*) FILTER (WHERE "detailsFetched" = true)::float / COUNT(*)) * 100,
    2
  ) as cache_hit_rate
FROM brands;

-- Brands más recientemente cacheados
SELECT id, name, "detailsFetchedAt"
FROM brands
WHERE "detailsFetched" = true
ORDER BY "detailsFetchedAt" DESC
LIMIT 10;
```

### Testing de Errores

```bash
# Brand que no existe
curl http://localhost:3000/brands/99999
# Debe mostrar error boundary

# Force refresh de brand inexistente
curl -X POST http://localhost:3000/api/brands/99999/refresh
# Debe retornar error 500
```

## Características Clave

✅ **Lazy-Loading**: Solo carga lo que se necesita, cuando se necesita
✅ **Cache Inmutable**: Una vez cacheado, nunca se actualiza automáticamente
✅ **Performance**: 50x más rápido en cache hits
✅ **Minimiza API Calls**: Solo 1 call por brand en toda la vida de la app
✅ **Escalable**: Crecimiento lineal con uso real
✅ **Admin Tools**: Endpoints para force refresh y monitoreo
✅ **UX Optimizado**: Loading states y error boundaries

## Diferencias con Sistema de Brands List

| Aspecto | Brands List | Brand Details |
|---------|-------------|---------------|
| **Estrategia** | Sync cada 7 días | Cache on-demand |
| **Trigger** | Cron job o /api/sync/brands | Usuario visita /brands/{id} |
| **Frecuencia** | 52 veces/año | 1 vez por brand (nunca más) |
| **Datos** | Lista completa (metadata) | Detalles individuales |
| **Updates** | Periódicos (7 días) | Inmutables (manual solo) |
| **Cache Flag** | N/A (siempre actualizado) | `detailsFetched` |

## Troubleshooting

### Problema: Brand no carga (404)

**Causa**: Brand no existe en la lista inicial
**Solución**:
```bash
# Sync la lista completa primero
curl -X POST http://localhost:3000/api/sync/brands
```

### Problema: Details desactualizados

**Causa**: Cache inmutable
**Solución**:
```bash
# Force refresh del brand específico
curl -X POST http://localhost:3000/api/brands/260/refresh
```

### Problema: Slow loading en todos los brands

**Causa**: Ningún brand tiene details cacheados
**Verificación**:
```bash
curl http://localhost:3000/api/brands/stats
# Si cacheHitRate es 0%, es normal en primera ejecución
```

## Monitoreo Recomendado

1. **Cache Hit Rate**: Debe crecer con el tiempo (target: >80%)
2. **Cached Brands**: Debe aumentar con uso real
3. **API Calls**: Debe disminuir significativamente vs implementación naive

## Próximos Pasos (Opcional)

1. **Analytics**: Trackear qué brands son más visitados
2. **Precarga**: Cachear top 10-20 brands automáticamente
3. **Background Refresh**: Actualizar brands populares periódicamente
4. **CDN**: Cachear logos de brands en CDN

## Resumen

Este sistema implementa un patrón eficiente de cache-on-demand que:
- Minimiza llamadas a la API de Turn14
- Proporciona experiencia de usuario rápida
- Escala naturalmente con el uso real
- Mantiene datos actualizados cuando se necesita
- Sigue los patrones establecidos del proyecto
