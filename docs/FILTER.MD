# Plan: Sistema de Filtrado de Productos con Auto-Fetch

## Resumen Ejecutivo

Implementar un sistema completo de filtrado de productos por categoría, subcategoría y nombre de producto, con capacidad de "auto-fetch" inteligente que busca en múltiples páginas de la API hasta completar 25 productos filtrados.

**Requisitos del Usuario:**
- ✅ Auto-fetch múltiples páginas hasta completar 25 productos filtrados
- ✅ Query params en URL para compartir y persistir filtros
- ✅ Filtros combinados (categoría + subcategoría + productName)
- ✅ Filtrado en backend con queries SQL optimizadas

**Tiempo Estimado:** 15-20 horas (2-2.5 días)

---

## Fase 1: Base de Datos (30 min)

### Agregar Índices Compuestos para Optimización

**Archivo:** `prisma/schema.prisma`

**Cambios:**
```prisma
model Product {
  // ... campos existentes ...

  // NUEVOS ÍNDICES COMPUESTOS
  @@index([brandId, category])
  @@index([brandId, subcategory])
  @@index([brandId, productName])
  @@index([brandId, category, subcategory])
  @@index([brandId, category, apiPage])
}
```

**Ejecutar:**
```bash
npx prisma migrate dev --name add_product_filter_indexes
```

**Por qué:** Reduce tiempo de queries filtradas de 500ms a <50ms

---

## Fase 2: Backend - ProductsSyncService (6-8 horas)

### Archivo: `infrastructure/services/ProductsSyncService.ts`

### 2.1 Agregar Interfaces (5 min)

```typescript
export interface ProductFilters {
  category?: string;
  subcategory?: string;
  productName?: string;
}

interface FilteredProductsResult {
  products: Turn14Product[];
  totalPages: number;
  currentPage: number;
  totalMatches: number;
  links: { self: string; first: string; last: string };
  filterData: BrandFilterData;
}
```

### 2.2 Método Principal: `getProductsByBrandFiltered()` (2 horas)

**Lógica:**
1. Construir WHERE clause con filtros
2. Contar productos cacheados que coinciden
3. Si insuficientes → ejecutar auto-fetch
4. Consultar productos paginados de DB
5. Retornar resultado formateado

```typescript
async getProductsByBrandFiltered(
  brandId: number,
  userPage: number = 1,
  filters: ProductFilters = {}
): Promise<FilteredProductsResult> {
  const whereClause = this.buildFilterWhereClause(brandId, filters);
  const cachedCount = await prisma.product.count({ where: whereClause });
  const requiredProducts = userPage * ProductsSyncService.PAGE_SIZE;

  if (cachedCount < requiredProducts) {
    await this.autoFetchFilteredProducts(brandId, filters, requiredProducts);
  }

  return this.getFilteredProductsFromDatabase(brandId, userPage, filters);
}
```

### 2.3 Helper: `buildFilterWhereClause()` (30 min)

Construye objeto WHERE de Prisma con filtros opcionales:

```typescript
private buildFilterWhereClause(brandId: number, filters: ProductFilters) {
  const where: any = {
    brandId,
    apiPage: { not: null },
  };

  if (filters.category) where.category = filters.category;
  if (filters.subcategory) where.subcategory = filters.subcategory;
  if (filters.productName) where.productName = filters.productName;

  return where;
}
```

### 2.4 Algoritmo Auto-Fetch: `autoFetchFilteredProducts()` (3-4 horas)

**Estrategia:** Iterar páginas de API hasta encontrar suficientes productos

**Límites de Seguridad:**
- MAX_API_PAGES: 20 (máximo 2000 productos)
- MAX_EMPTY_STREAK: 3 (detener tras 3 páginas vacías consecutivas)
- TIMEOUT_MS: 30000 (timeout de 30 segundos)

```typescript
private async autoFetchFilteredProducts(
  brandId: number,
  filters: ProductFilters,
  targetCount: number
) {
  const MAX_API_PAGES = 20;
  const MAX_EMPTY_STREAK = 3;
  const TIMEOUT_MS = 30000;

  const startTime = Date.now();
  let emptyStreak = 0;

  // Obtener última página cacheada
  const lastCached = await prisma.productPageCache.findFirst({
    where: { brandId },
    orderBy: { page: 'desc' },
    select: { page: true, totalApiPages: true },
  });

  const startPage = (lastCached?.page || 0) + 1;
  const apiTotalPages = lastCached?.totalApiPages || Infinity;

  for (let apiPage = startPage; apiPage <= Math.min(apiTotalPages, MAX_API_PAGES); apiPage++) {
    // Check timeout
    if (Date.now() - startTime > TIMEOUT_MS) break;

    // Fetch página (reutiliza método existente)
    const result = await this.fetchAndCacheProducts(brandId, apiPage, 0, 1);

    // Contar productos que coinciden
    const matchingCount = result.products.filter(p =>
      this.productMatchesFilters(p, filters)
    ).length;

    // Track páginas vacías consecutivas
    if (matchingCount === 0) {
      emptyStreak++;
      if (emptyStreak >= MAX_EMPTY_STREAK) break;
    } else {
      emptyStreak = 0;
    }

    // Verificar si ya tenemos suficientes
    const currentCount = await prisma.product.count({
      where: this.buildFilterWhereClause(brandId, filters),
    });

    if (currentCount >= targetCount) break;
  }
}
```

### 2.5 Helper: `productMatchesFilters()` (15 min)

```typescript
private productMatchesFilters(product: Turn14Product, filters: ProductFilters): boolean {
  if (filters.category && product.attributes.category !== filters.category) {
    return false;
  }
  if (filters.subcategory && product.attributes.subcategory !== filters.subcategory) {
    return false;
  }
  if (filters.productName && product.attributes.product_name !== filters.productName) {
    return false;
  }
  return true;
}
```

### 2.6 Query Filtrada: `getFilteredProductsFromDatabase()` (1 hora)

```typescript
private async getFilteredProductsFromDatabase(
  brandId: number,
  userPage: number,
  filters: ProductFilters
): Promise<FilteredProductsResult> {

  const whereClause = this.buildFilterWhereClause(brandId, filters);
  const totalMatches = await prisma.product.count({ where: whereClause });
  const skip = (userPage - 1) * ProductsSyncService.PAGE_SIZE;
  const totalPages = Math.ceil(totalMatches / ProductsSyncService.PAGE_SIZE);

  const products = await prisma.product.findMany({
    where: whereClause,
    orderBy: { id: 'asc' },
    skip,
    take: ProductsSyncService.PAGE_SIZE,
  });

  // Convertir a formato Turn14Product (usar lógica existente)
  const turn14Products = products.map(/* conversión existente */);

  return {
    products: turn14Products,
    totalPages,
    currentPage: userPage,
    totalMatches,
    links: { self: '', first: '', last: '' },
    filterData: await this.getFilterDataFromDatabase(brandId),
  };
}
```

---

## Fase 3: Server Actions (1 hora)

### Archivo: `application/actions/products.ts`

### 3.1 Agregar Interface y Modificar Acción

```typescript
export interface ProductFilters {
  category?: string;
  subcategory?: string;
  productName?: string;
}

export async function getProductsByBrand(
  brandId: number,
  page: number = 1,
  filters: ProductFilters = {}
) {
  try {
    const hasFilters = !!(filters.category || filters.subcategory || filters.productName);

    const result = hasFilters
      ? await productsSyncService.getProductsByBrandFiltered(brandId, page, filters)
      : await productsSyncService.getProductsByBrandPaginated(brandId, page);

    return {
      data: result.products,
      meta: {
        total_pages: result.totalPages,
        current_page: result.currentPage,
        total_matches: result.totalMatches || result.products.length,
      },
      filterData: result.filterData,
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}
```

---

## Fase 4: Server Component - Extracción de Query Params (1 hora)

### Archivo: `app/brands/[id]/page.tsx`

### 4.1 Extraer y Pasar Filtros

```typescript
export default async function BrandDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    page?: string;
    category?: string;
    subcategory?: string;
    productName?: string;
  }>;
}) {
  const { id } = await params;
  const { page: pageParam, category, subcategory, productName } = await searchParams;

  const currentPage = pageParam ? parseInt(pageParam) : 1;

  // Construir objeto de filtros
  const filters: ProductFilters = {};
  if (category) filters.category = decodeURIComponent(category);
  if (subcategory) filters.subcategory = decodeURIComponent(subcategory);
  if (productName) filters.productName = decodeURIComponent(productName);

  // Fetch con filtros
  const [brandData, productsData] = await Promise.all([
    getBrandById(id),
    getProductsByBrand(parseInt(id), currentPage, filters),
  ]);

  const hasActiveFilters = !!(category || subcategory || productName);

  // ... resto del componente
}
```

### 4.2 Agregar Indicadores de Filtros Activos

```tsx
{/* Indicador de filtros activos */}
{hasActiveFilters && (
  <div className="mt-4 flex items-center gap-2 flex-wrap">
    <span className="font-semibold text-gray-700">Filtros activos:</span>
    {category && (
      <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
        📁 {traducirCategoria(category)}
      </span>
    )}
    {subcategory && (
      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
        📂 {traducirSubcategoria(subcategory)}
      </span>
    )}
    {productName && (
      <span className="px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm">
        🏷️ {productName}
      </span>
    )}
    <Link
      href={`/brands/${id}`}
      className="px-3 py-1 bg-red-100 text-red-800 hover:bg-red-200 rounded-full text-sm font-medium transition-colors"
    >
      Limpiar filtros ✕
    </Link>
  </div>
)}
```

### 4.3 Mostrar Total de Coincidencias

```tsx
<h2 className="text-2xl font-bold mb-6">
  Productos
  {productsData.meta.total_matches && hasActiveFilters && (
    <span className="text-lg font-normal text-gray-600 ml-2">
      ({productsData.meta.total_matches} coincidencias)
    </span>
  )}
</h2>
```

### 4.4 Pasar Filtros Activos al Sidebar

```tsx
<CategorySidebarAccordion
  categories={categories}
  subcategories={subcategories}
  productNames={productNames}
  brandId={parseInt(id)}
  activeFilters={filters}
/>
```

---

## Fase 5: Client Components - UI Interactiva (3-4 horas)

### Archivo: `components/sidebar/CategorySidebarAccordion.tsx`

### 5.1 Convertir a Client Component y Agregar Hooks

```typescript
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { traducirCategoria, traducirSubcategoria } from "@/constants/categorias";

interface CategorySidebarAccordionProps {
  categories: Array<{ category: string; categoryEs: string }>;
  subcategories: Array<{ subcategory: string; subcategoryEs: string }>;
  productNames: Array<{ productName: string }>;
  brandId: number;
  activeFilters: ProductFilters;
}
```

### 5.2 Implementar Lógica de Navegación

```typescript
export function CategorySidebarAccordion({
  categories,
  subcategories,
  productNames,
  brandId,
  activeFilters,
}: CategorySidebarAccordionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Construir URL con filtro actualizado
  const buildFilterUrl = (
    filterType: 'category' | 'subcategory' | 'productName',
    value: string
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(filterType, encodeURIComponent(value));
    params.set('page', '1'); // Reset a página 1
    return `/brands/${brandId}?${params.toString()}`;
  };

  const handleFilterClick = (
    filterType: 'category' | 'subcategory' | 'productName',
    value: string
  ) => {
    router.push(buildFilterUrl(filterType, value));
  };

  const handleClearFilters = () => {
    router.push(`/brands/${brandId}`);
  };

  const isFilterActive = (
    filterType: 'category' | 'subcategory' | 'productName',
    value: string
  ) => {
    return activeFilters[filterType] === value;
  };

  // ... resto del componente
}
```

### 5.3 Actualizar UI con Botones Interactivos

```tsx
return (
  <aside className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-6 shadow-md">
    {/* Botón limpiar filtros */}
    {(activeFilters.category || activeFilters.subcategory || activeFilters.productName) && (
      <button
        onClick={handleClearFilters}
        className="w-full mb-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
      >
        Limpiar todos los filtros ✕
      </button>
    )}

    <Accordion type="single" collapsible defaultValue="categories">
      {/* Categorías */}
      <AccordionItem value="categories">
        <AccordionTrigger>
          Categorías ({categories.length})
        </AccordionTrigger>
        <AccordionContent>
          <ul className="space-y-2 max-h-[500px] overflow-y-auto px-2">
            {categories.map(({ category, categoryEs }) => {
              const isActive = isFilterActive('category', category);
              return (
                <li key={category}>
                  <button
                    onClick={() => handleFilterClick('category', category)}
                    className={`
                      w-full px-5 py-3.5 text-left text-base font-medium
                      transition-all rounded-lg shadow-sm hover:shadow-md
                      ${isActive
                        ? 'bg-indigo-600 text-white'
                        : 'text-indigo-800 hover:bg-white/70 hover:text-indigo-950'
                      }
                    `}
                  >
                    {categoryEs}
                    {isActive && <span className="ml-2">✓</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </AccordionContent>
      </AccordionItem>

      {/* Subcategorías - mismo patrón */}
      <AccordionItem value="subcategories">
        {/* ... similar a categorías ... */}
      </AccordionItem>

      {/* Product Names - mismo patrón */}
      <AccordionItem value="productNames">
        {/* ... similar a categorías ... */}
      </AccordionItem>
    </Accordion>
  </aside>
);
```

---

## Fase 6: Paginación con Filtros (30 min)

### Archivo: `components/products/ProductPagination.tsx`

### 6.1 Preservar Query Params en Links

```typescript
"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export function ProductPagination({
  currentPage,
  totalPages,
  brandId
}: ProductPaginationProps) {
  const searchParams = useSearchParams();

  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    return `/brands/${brandId}?${params.toString()}`;
  };

  // ... resto de la lógica de ventana ...

  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      {/* Botón Anterior */}
      <Link
        href={buildPageUrl(currentPage - 1)}
        className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
      >
        ← Anterior
      </Link>

      {/* Números de página */}
      {pageNumbers.map(page => (
        <Link
          key={page}
          href={buildPageUrl(page)}
          className={page === currentPage ? 'bg-indigo-600 text-white' : ''}
        >
          {page}
        </Link>
      ))}

      {/* Botón Siguiente */}
      <Link
        href={buildPageUrl(currentPage + 1)}
        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
      >
        Siguiente →
      </Link>
    </div>
  );
}
```

---

## Fase 7: Manejo de Edge Cases (Incluido en implementación)

### Casos Especiales a Manejar:

1. **Sin Resultados (0 productos)**
   - Mostrar mensaje: "No se encontraron productos con los filtros seleccionados"
   - Botón "Limpiar filtros" visible
   - `totalPages = 0`

2. **Resultados Parciales (< 25 productos)**
   - Mostrar mensaje: "{X} productos encontrados"
   - Sin botones de paginación si `totalPages = 1`
   - Auto-fetch se detiene al agotar páginas API

3. **Timeout/Error en Auto-Fetch**
   - Retornar productos parciales encontrados
   - Logging de error para monitoreo
   - Continuar a siguiente página si falla una

4. **Filtro con Caracteres Especiales**
   - Usar `encodeURIComponent()` al construir URL
   - Usar `decodeURIComponent()` al leer de searchParams

---

## Archivos Modificados - Resumen

### Backend (3 archivos):
1. ✅ `prisma/schema.prisma` - Agregar índices
2. ✅ `infrastructure/services/ProductsSyncService.ts` - Auto-fetch + filtrado
3. ✅ `application/actions/products.ts` - Aceptar filtros

### Frontend (3 archivos):
4. ✅ `app/brands/[id]/page.tsx` - Extraer query params + UI filtros activos
5. ✅ `components/sidebar/CategorySidebarAccordion.tsx` - Botones interactivos
6. ✅ `components/products/ProductPagination.tsx` - Preservar filtros en URLs

---

## Testing Checklist

### Funcionalidad:
- [ ] Click en categoría → URL cambia → productos filtrados
- [ ] Click en subcategoría → combina filtros → productos filtrados
- [ ] Paginación mantiene filtros activos
- [ ] Botón "Limpiar filtros" vuelve a vista sin filtrar
- [ ] Back button del navegador funciona correctamente

### Performance:
- [ ] Query filtrada < 150ms (sin auto-fetch)
- [ ] Auto-fetch completo < 5s (promedio)
- [ ] Auto-fetch se detiene correctamente (timeout/empty streak)

### Edge Cases:
- [ ] Filtro sin resultados muestra mensaje apropiado
- [ ] Filtro con < 25 resultados muestra todos sin error
- [ ] Caracteres especiales en filtros se manejan correctamente
- [ ] Error en API no bloquea aplicación

---

## URLs de Ejemplo

```
# Sin filtros
/brands/123

# Paginación sin filtros
/brands/123?page=2

# Filtro por categoría
/brands/123?category=Air%20Filters

# Filtros combinados
/brands/123?category=Air%20Filters&subcategory=Intake

# Filtros completos con paginación
/brands/123?category=Air%20Filters&subcategory=Intake&productName=K%26N&page=3
```

---

## Estimación Final

| Fase | Tiempo |
|------|--------|
| 1. Database Migration | 30 min |
| 2. Backend (ProductsSyncService) | 6-8 horas |
| 3. Server Actions | 1 hora |
| 4. Server Component | 1 hora |
| 5. Client Components | 3-4 horas |
| 6. Paginación | 30 min |
| 7. Testing & Edge Cases | 3-4 horas |
| **TOTAL** | **15-20 horas** |

---

## Próximos Pasos

1. Ejecutar migración de Prisma
2. Implementar métodos en ProductsSyncService
3. Actualizar Server Actions
4. Modificar Server Component
5. Convertir y actualizar Client Components
6. Testing exhaustivo
7. Deploy

