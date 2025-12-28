# Sistema de Sincronización de Brands

## Arquitectura

El sistema de sincronización de marcas está diseñado para:

1. **Usar la base de datos como fuente principal** - Todas las páginas y componentes leen de PostgreSQL
2. **Sincronizar automáticamente cada 7 días** - Actualiza brands desde Turn14 API sin intervención manual
3. **Evitar errores de hidratación** - Separación entre lectura (render) y escritura (sincronización)

## Componentes

### 1. Base de Datos (PostgreSQL)

```prisma
model Brand {
  id          String   @id
  name        String
  dropship    Boolean
  logo        String?
  aaia        String[]
  pricegroups Json
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model SyncControl {
  id        String   @id @default(cuid())
  entity    String   @unique // "brands"
  lastSync  DateTime
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### 2. BrandsSyncService

Servicio que maneja la lógica de sincronización:

- `getBrands()` - Lee brands desde la DB (usado en páginas)
- `needsSync()` - Verifica si han pasado 7 días
- `syncBrands()` - Sincroniza desde Turn14 API
- `forceSync()` - Fuerza sincronización manual

### 3. Server Actions

`getBrands()` en `application/actions/brands.ts`:
- Lee SOLO de la base de datos
- NO ejecuta sincronización durante render
- Previene errores de hidratación

### 4. API Endpoints

#### GET `/api/sync/brands`

Verifica si necesita sincronización y ejecuta si es necesario:

```bash
curl http://localhost:3000/api/sync/brands
```

Respuesta cuando NO necesita sync:
```json
{
  "success": true,
  "synced": false,
  "message": "La sincronización no es necesaria todavía (< 7 días)",
  "count": 150
}
```

Respuesta cuando SÍ sincroniza:
```json
{
  "success": true,
  "synced": true,
  "message": "Sincronizadas 150 marcas exitosamente",
  "count": 150
}
```

#### POST `/api/sync/brands`

Fuerza sincronización inmediata:

```bash
curl -X POST http://localhost:3000/api/sync/brands
```

## Configuración de Sincronización Automática

### Opción 1: Cron Job (Recomendado para Producción)

Configura un cron job en tu servidor para ejecutar cada día:

```bash
# Edita crontab
crontab -e

# Agrega esta línea (ejecuta todos los días a las 3 AM)
0 3 * * * curl http://localhost:3000/api/sync/brands
```

### Opción 2: Vercel Cron Jobs

Si usas Vercel, agrega en `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/sync/brands",
      "schedule": "0 3 * * *"
    }
  ]
}
```

### Opción 3: GitHub Actions

Crea `.github/workflows/sync-brands.yml`:

```yaml
name: Sync Brands

on:
  schedule:
    - cron: "0 3 * * *" # Todos los días a las 3 AM

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Call sync endpoint
        run: curl -X GET ${{ secrets.APP_URL }}/api/sync/brands
```

### Opción 4: Sincronización Manual

Para sincronizar manualmente cuando lo necesites:

```bash
# Verificar si necesita sync
curl http://localhost:3000/api/sync/brands

# Forzar sync inmediata
curl -X POST http://localhost:3000/api/sync/brands
```

## Flujo de Datos

```
┌─────────────────────┐
│   Turn14 API        │
│   /brands           │
└──────────┬──────────┘
           │
           │ Cada 7 días
           ▼
┌─────────────────────┐
│  /api/sync/brands   │
│  (GET endpoint)     │
└──────────┬──────────┘
           │
           │ Upsert
           ▼
┌─────────────────────┐
│  PostgreSQL         │
│  brands table       │
└──────────┬──────────┘
           │
           │ Read only
           ▼
┌─────────────────────┐
│  getBrands()        │
│  Server Action      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Pages/Components   │
│  /test-brands       │
└─────────────────────┘
```

## Ventajas de esta Arquitectura

✅ **Sin errores de hidratación** - Lectura y escritura están separadas
✅ **Performance** - Páginas leen de DB local, no de API externa
✅ **Costo optimizado** - Solo 52 llamadas al año vs miles
✅ **Datos actualizados** - Sincronización automática cada semana
✅ **Confiabilidad** - Si Turn14 API falla, la app sigue funcionando
✅ **Control total** - Sync manual disponible cuando se necesite

## Troubleshooting

### ¿Cómo verificar cuándo fue la última sincronización?

```sql
SELECT * FROM sync_control WHERE entity = 'brands';
```

### ¿Cómo forzar una sincronización ahora?

```bash
curl -X POST http://localhost:3000/api/sync/brands
```

### ¿Cómo ver cuántas marcas hay en la DB?

```sql
SELECT COUNT(*) FROM brands;
```

### Error: "No brands found"

Ejecuta la primera sincronización manualmente:

```bash
curl -X POST http://localhost:3000/api/sync/brands
```

## Migración desde Sistema Anterior

El sistema anterior llamaba `getBrands()` que sincronizaba durante el render.
Esto causaba:
- Errores de hidratación
- Lentitud en páginas
- Llamadas innecesarias a la API

El nuevo sistema:
- `getBrands()` solo lee de DB
- Sincronización vía endpoint `/api/sync/brands`
- Configuración de cron job para automatizar

### Pasos de migración:

1. ✅ Modificado `BrandsSyncService` - separada lectura de sync
2. ✅ Actualizado `getBrands()` - solo lectura de DB
3. ✅ Creado endpoint `/api/sync/brands`
4. ✅ Arreglada página `/test-brands` - HTML determinístico
5. ⏳ **Pendiente**: Configurar cron job en producción
6. ⏳ **Pendiente**: Primera sincronización manual
