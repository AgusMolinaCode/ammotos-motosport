# Configuración del Sistema de Sincronización de Marcas

## Cambios Realizados

### 1. Base de Datos PostgreSQL

Se agregaron dos modelos en Prisma:

- **Brand**: Almacena todas las marcas de Turn14
- **SyncControl**: Controla cuándo fue la última sincronización

### 2. Servicio de Sincronización

El servicio `BrandsSyncService` implementa:

- ✅ Sincronización automática cada 7 días
- ✅ Almacenamiento en PostgreSQL
- ✅ Actualización incremental (solo marcas nuevas)
- ✅ Sincronización forzada manual cuando sea necesario

### 3. Server Actions

- `getBrands()`: Obtiene marcas de la base de datos (sincroniza automáticamente si es necesario)
- `forceSyncBrands()`: Fuerza una sincronización manual

## Instrucciones de Setup

### Paso 1: Instalar Dependencias (solo primera vez)

```bash
npm install
```

### Paso 2: Iniciar Docker Desktop

Asegúrate de que Docker Desktop esté corriendo en tu sistema.

### Paso 3: Iniciar la Base de Datos

```bash
npm run db:start
```

### Paso 4: Generar Cliente de Prisma

```bash
npm run prisma:generate
```

### Paso 5: Aplicar el Schema a la Base de Datos

```bash
npm run prisma:push
```

### Paso 6: Ver la Base de Datos (Opcional)

```bash
npm run db:studio
```

Esto abrirá Prisma Studio en tu navegador donde podrás ver las tablas `brands` y `sync_control`.

### Paso 7: Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

Accede a `http://localhost:3000/test-brands`

### Paso 8: Sincronización Inicial

La primera vez que accedas a `/test-brands`, se realizará automáticamente la sincronización inicial con Turn14 API.

## Comandos Útiles

```bash
# Ver logs de la base de datos
npm run db:logs

# Acceder a la shell de PostgreSQL
npm run db:shell

# Ver la base de datos con Prisma Studio
npm run db:studio

# Detener la base de datos
npm run db:stop
```

## Cómo Funciona

1. **Primera carga**: Cuando se llama a `getBrands()` por primera vez, sincroniza todas las marcas desde Turn14 API
2. **Cargas posteriores**: Lee las marcas de la base de datos local (sin llamar a la API)
3. **Actualización semanal**: Cada 7 días, sincroniza automáticamente para agregar nuevas marcas
4. **Sincronización manual**: Usa `forceSyncBrands()` si necesitas sincronizar antes de los 7 días

## Estructura de Archivos

```
infrastructure/
├── database/
│   └── prisma.ts              # Cliente de Prisma
├── services/
│   └── BrandsSyncService.ts   # Servicio de sincronización

application/
└── actions/
    └── brands.ts              # Server actions (getBrands, forceSyncBrands)

prisma/
└── schema.prisma              # Definición de modelos
```

## Beneficios

- 🚀 **Performance**: No llama a la API en cada request
- 💰 **Ahorro de costos**: Reduce llamadas a la API de Turn14
- ⚡ **Velocidad**: Las marcas se cargan desde la base de datos local
- 🔄 **Actualización automática**: Se mantiene sincronizado semanalmente
- 🎯 **Sin console.log**: Código limpio sin logs innecesarios
