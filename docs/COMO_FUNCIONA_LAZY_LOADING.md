# 📚 Cómo Funciona el Lazy-Loading de Brand Details

## 🎯 Concepto Principal

**Solo hay 1 registro por brand** que se va actualizando progresivamente.

## 🗄️ Estructura de la Base de Datos

### Tablas

```
turn14db
├── brands          ← TODOS los brands (lista + detalles)
└── sync_control    ← Control de sincronización
```

### Tabla `brands` - Estructura

```sql
CREATE TABLE brands (
  id               VARCHAR PRIMARY KEY,  -- "335", "260", etc.
  name             VARCHAR,              -- "3D MAXpider"
  dropship         BOOLEAN,              -- true/false
  logo             VARCHAR,              -- URL del logo
  aaia             VARCHAR[],            -- ["FMCP"]
  pricegroups      JSON,                 -- Detalles completos
  detailsFetched   BOOLEAN DEFAULT false,  -- ⚠️ CLAVE: ¿Ya tiene detalles?
  detailsFetchedAt TIMESTAMP,            -- Cuándo se cacheó
  createdAt        TIMESTAMP,
  updatedAt        TIMESTAMP
);
```

## 🔄 Ciclo de Vida de un Brand

### Estado 1️⃣: Recién Sincronizado (Sin Detalles)

```
Acción: curl -X POST http://localhost:3000/api/sync/brands

┌─────────────────────────────────────────────────────────┐
│ Registro en DB después del sync                         │
├─────────────────────────────────────────────────────────┤
│ id: "335"                                               │
│ name: "3D MAXpider"                                     │
│ logo: "https://..."                                     │
│ dropship: false                                         │
│ pricegroups: []          ← ⚠️ Vacío o info básica      │
│ detailsFetched: false    ← ⚠️ NO tiene detalles        │
│ detailsFetchedAt: null                                  │
└─────────────────────────────────────────────────────────┘

Estado: ⏳ Listo para lazy-load
API calls hasta ahora: 1 (solo lista de brands)
```

### Estado 2️⃣: Primera Visita a /brands/335

```
Usuario: Hace click en "3D MAXpider" en /test-brands

┌─────────────────────────────────────────────────────────┐
│ 1. getBrandById("335") ejecuta                          │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ 2. Query: SELECT * FROM brands WHERE id = '335'         │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Encuentra brand con detailsFetched = false           │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ 4. ⚠️ CACHE MISS - Llama a Turn14 API                  │
│    GET https://api.turn14.com/v1/brands/335             │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ 5. Recibe detalles completos de la API                  │
│    {                                                    │
│      name: "3D MAXpider",                               │
│      pricegroups: [                                     │
│        {                                                │
│          pricegroup_id: "808",                          │
│          pricegroup_name: "3D MAXpider",                │
│          purchase_restrictions: [...],                  │
│          location_rules: [...]                          │
│        }                                                │
│      ]                                                  │
│    }                                                    │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ 6. ACTUALIZA el mismo registro (NO crea uno nuevo)      │
│    UPDATE brands SET                                    │
│      pricegroups = [{...detalles completos...}],        │
│      detailsFetched = true,    ← ⚠️ Marca como OK      │
│      detailsFetchedAt = NOW()                           │
│    WHERE id = '335'                                     │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ Registro ACTUALIZADO en DB                              │
├─────────────────────────────────────────────────────────┤
│ id: "335"                                               │
│ name: "3D MAXpider"                                     │
│ logo: "https://..."                                     │
│ dropship: false                                         │
│ pricegroups: [{...DETALLES COMPLETOS...}]  ← ✅ Lleno │
│ detailsFetched: true        ← ✅ Tiene detalles        │
│ detailsFetchedAt: 2025-12-27 18:49:07                  │
└─────────────────────────────────────────────────────────┘

Estado: ✅ Cacheado completamente
API calls totales: 2 (lista + este brand)
Tiempo: ~500ms (por la API call)
```

### Estado 3️⃣: Segunda Visita a /brands/335 (y todas las siguientes)

```
Usuario: Vuelve a hacer click en "3D MAXpider"

┌─────────────────────────────────────────────────────────┐
│ 1. getBrandById("335") ejecuta                          │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ 2. Query: SELECT * FROM brands WHERE id = '335'         │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Encuentra brand con detailsFetched = true ✅         │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ 4. ✅ CACHE HIT - Retorna inmediatamente                │
│    ❌ NO llama a Turn14 API                             │
│    ✅ Usa los datos guardados                           │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ 5. Retorna los detalles desde la DB                     │
└─────────────────────────────────────────────────────────┘

Estado: ✅ Servido desde cache
API calls totales: 0 (usa DB solamente)
Tiempo: ~10ms (50x más rápido! 🚀)
```

## 🔍 Cómo Verificar que Funciona

### Paso 1: Ver el Estado Actual

Ejecuta en tu base de datos PostgreSQL:

```sql
-- Ver los últimos brands cacheados
SELECT
  id,
  name,
  "detailsFetched",
  "detailsFetchedAt",
  CASE
    WHEN "detailsFetched" = true THEN '✅ Cached'
    ELSE '⏳ Not cached'
  END as status
FROM brands
ORDER BY "detailsFetchedAt" DESC NULLS LAST
LIMIT 10;
```

**Ejemplo de Output**:
```
┌─────┬──────────────┬────────────────┬─────────────────────┬──────────────┐
│ id  │ name         │ detailsFetched │ detailsFetchedAt    │ status       │
├─────┼──────────────┼────────────────┼─────────────────────┼──────────────┤
│ 335 │ 3D MAXpider  │ true           │ 2025-12-27 18:49:07 │ ✅ Cached    │
│ 260 │ ACL          │ false          │ null                │ ⏳ Not cached│
│ 83  │ Airaid       │ false          │ null                │ ⏳ Not cached│
└─────┴──────────────┴────────────────┴─────────────────────┴──────────────┘
```

### Paso 2: Estadísticas del Cache

```sql
SELECT
  COUNT(*) as total_brands,
  COUNT(*) FILTER (WHERE "detailsFetched" = true) as cached,
  COUNT(*) FILTER (WHERE "detailsFetched" = false) as not_cached,
  ROUND(
    (COUNT(*) FILTER (WHERE "detailsFetched" = true)::float / COUNT(*)) * 100,
    2
  ) as cache_percentage
FROM brands;
```

**Ejemplo de Output**:
```
┌──────────────┬────────┬────────────┬──────────────────┐
│ total_brands │ cached │ not_cached │ cache_percentage │
├──────────────┼────────┼────────────┼──────────────────┤
│ 150          │ 5      │ 145        │ 3.33%            │
└──────────────┴────────┴────────────┴──────────────────┘
```

Esto significa:
- **150 brands** en total
- **5 brands** ya visitados (tienen detalles cacheados)
- **145 brands** aún no visitados (llamarán a API cuando los visiten)
- **3.33%** cache hit rate (irá subiendo con el uso)

### Paso 3: Test Manual

#### Test 1: Primera Visita (Cache Miss)

1. **Abre las DevTools** (F12) → Tab "Network"
2. **Navega a** http://localhost:3000/test-brands
3. **Haz click** en un brand que NO hayas visitado antes (ej: "Airaid")
4. **Observa en Network tab**:
   - ✅ Deberías ver una llamada a `/api/brands/xxx` (tu server action)
   - ⏱️ Tiempo: ~500ms
5. **Verifica en la DB**:
   ```sql
   SELECT "detailsFetched", "detailsFetchedAt"
   FROM brands
   WHERE name = 'Airaid';
   ```
   - Resultado: `detailsFetched = true` ✅

#### Test 2: Segunda Visita (Cache Hit)

1. **Sin recargar la página**, haz click en **"Volver a todas las marcas"**
2. **Haz click en el MISMO brand** ("Airaid")
3. **Observa en Network tab**:
   - ✅ Solo verás la navegación, NO hay llamada adicional a APIs externas
   - ⚡ Tiempo: ~10ms (instantáneo)
4. **Compara los tiempos**:
   - Primera visita: ~500ms
   - Segunda visita: ~10ms
   - **50x más rápido!** 🚀

## 📊 Monitoreo en Tiempo Real

### Endpoint de Estadísticas

```bash
curl http://localhost:3000/api/brands/stats
```

**Respuesta**:
```json
{
  "success": true,
  "stats": {
    "total": 150,
    "cached": 5,
    "uncached": 145,
    "cacheHitRate": "3.33%"
  }
}
```

Este porcentaje irá subiendo conforme los usuarios visiten más brands.

## 🎯 Ventajas de este Sistema

### 1. Eficiencia de API Calls

```
Sistema Naive (sin cache):
- Usuario visita brand 335: API call
- Usuario vuelve a visitar 335: API call
- Usuario visita 335 tercera vez: API call
Total: 3 API calls para el mismo brand

Sistema Lazy-Loading (con cache):
- Usuario visita brand 335: API call + guardar en DB
- Usuario vuelve a visitar 335: leer de DB (NO API call)
- Usuario visita 335 tercera vez: leer de DB (NO API call)
Total: 1 API call para el mismo brand (para siempre!)
```

### 2. Performance

```
Primera visita:  ~500ms (API + DB write)
Siguientes:      ~10ms  (solo DB read)
Mejora:          50x más rápido
```

### 3. Escalabilidad

```
100 usuarios visitan el mismo brand:
- API calls: 1 (solo el primero)
- DB reads: 100 (muy rápido)
```

## 🔧 Gestión del Cache

### Ver Brands Más Populares (Más Visitados)

```sql
SELECT
  id,
  name,
  "detailsFetchedAt"
FROM brands
WHERE "detailsFetched" = true
ORDER BY "detailsFetchedAt" DESC
LIMIT 10;
```

Esto te muestra qué brands son más visitados por orden de primera visita.

### Forzar Re-cache de un Brand (Admin)

Si necesitas actualizar la información de un brand específico:

```bash
curl -X POST http://localhost:3000/api/brands/335/refresh
```

Esto:
1. Llama a Turn14 API para obtener datos frescos
2. Actualiza el registro en la DB
3. Mantiene `detailsFetched = true`

### Limpiar Todo el Cache (Resetear)

```sql
-- ⚠️ CUIDADO: Esto resetea TODO el cache
UPDATE brands
SET
  detailsFetched = false,
  detailsFetchedAt = null;
```

Después de esto, todos los brands volverán a llamar a la API en su próxima visita.

## ❓ Preguntas Frecuentes

### ¿Se crea un nuevo registro cada vez que visito un brand?

**NO**. El mismo registro se actualiza. Cada brand tiene UN SOLO registro que va evolucionando:
- Inicio: `detailsFetched = false` (sin detalles)
- Después de visita: `detailsFetched = true` (con detalles)

### ¿Cuándo se llama a la API de Turn14?

Solo en 2 casos:
1. **Primera vez** que alguien visita ese brand específico
2. **Force refresh manual** via `/api/brands/{id}/refresh`

### ¿Qué pasa si Turn14 actualiza la información de un brand?

El cache es **inmutable por defecto**. Si necesitas actualizar:
- **Opción 1**: Force refresh manual del brand
- **Opción 2**: Implementar refresh periódico (futuro)

### ¿Cuánto espacio ocupa en la DB?

- **Por brand**: ~2-5 KB
- **150 brands cacheados**: ~750 KB (negligible)

### ¿Puedo ver qué brands NO se han visitado nunca?

```sql
SELECT id, name
FROM brands
WHERE "detailsFetched" = false
ORDER BY name;
```

## 📈 Métricas de Éxito

### Objetivo: Cache Hit Rate > 80%

Con el tiempo, la mayoría de brands populares estarán cacheados:

```
Semana 1:  Cache Hit Rate: ~10%  (usuarios descubriendo)
Semana 2:  Cache Hit Rate: ~40%  (brands populares cacheados)
Semana 4:  Cache Hit Rate: ~70%  (mayoría de visitas cacheadas)
Semana 8:  Cache Hit Rate: ~85%  (sistema estable)
```

### Monitoreo Recomendado

```bash
# Ejecutar diariamente
curl http://localhost:3000/api/brands/stats

# Graficar el crecimiento del cache hit rate
# Ejemplo: Si hoy es 3.33%, mañana debería ser mayor
```

## 🎓 Resumen

1. **Solo 1 tabla**: `brands` tiene todo (lista + detalles)
2. **Solo 1 registro por brand**: Se actualiza, no se duplica
3. **Flag de cache**: `detailsFetched` controla si ya tiene detalles
4. **Primera visita**: API call + actualiza DB
5. **Visitas siguientes**: Solo lee DB (50x más rápido)
6. **Escalable**: 1 API call por brand en toda la vida del sistema

¡Eso es todo! El sistema es simple pero muy eficiente. 🚀
