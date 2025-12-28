# Flujo de Implementación: Productos Turn14

## 🎯 Objetivo
Implementar sistema completo de productos siguiendo el mismo patrón arquitectónico que brands.

**Patrón**: Sincronización API → Almacenamiento PostgreSQL → Visualización Next.js

---

## ⚠️ PREREQUISITO CRÍTICO

**ANTES DE COMENZAR, CORREGIR ERROR DE PRISMA:**

```bash
# 1. Regenerar cliente Prisma
npx prisma generate

# 2. Limpiar cache de Next.js
rm -rf .next

# 3. Reiniciar dev server
npm run dev
```

**Verificar**: Navega a `/brands/335` - debe funcionar sin errores.

---

## 📋 Pasos de Implementación

### PASO 1: Investigar API de Turn14 Products ✅

**Acciones**:
1. Revisar documentación oficial de Turn14 para `/v1/items`
2. Probar endpoint con Postman o curl
3. Documentar estructura de respuesta JSON

**Archivo a crear**: `docs/TURN14_PRODUCTS_API.md`

**Comando de prueba**:
```bash
curl -X GET "https://api.turn14.com/v1/items?brand_id=335" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Campos clave a identificar**:
- `item_id` - ID único del producto
- `brand_id` - Relación con brand
- `mfr_part_number` - Número de parte del fabricante
- `title` - Título/nombre del producto
- `description` - Descripción
- `pricing[]` - Array de precios por price group
- `inventory{}` - Disponibilidad y stock
- `images[]` - Array de URLs de imágenes

---

### PASO 2: Crear Tipos TypeScript ✅

**Archivo a crear**: `domain/types/turn14/products.ts`

**Estructura básica**:
```typescript
export interface ProductsResponse {
  data: Product[];
  meta?: {
    pagination?: {
      total: number;
      per_page: number;
      current_page: number;
    };
  };
}

export interface Product {
  id: string;
  type: "Product";
  attributes: ProductAttributes;
}

export interface ProductAttributes {
  item_id: string;
  brand_id: string;
  mfr_part_number: string;
  title: string;
  description: string;
  category: string;
  pricing: ProductPricing[];
  inventory: InventoryInfo;
  images: ProductImage[];
}

export interface ProductPricing {
  pricegroup_id: string;
  price: number;
  cost: number;
  map_price?: number;
}

export interface InventoryInfo {
  quantity: number;
  available: boolean;
  warehouse?: string;
}

export interface ProductImage {
  url: string;
  type: string; // 'main', 'thumbnail', etc.
  position: number;
}
```

---

### PASO 3: Actualizar Schema Prisma ✅

**Archivo a modificar**: `prisma/schema.prisma`

**Agregar al final del archivo**:
```prisma
model Product {
  id              String   @id
  brandId         String
  mfrPartNumber   String
  title           String
  description     String?  @db.Text
  category        String?

  // Campos JSON para flexibilidad
  pricing         Json
  inventory       Json
  images          Json
  attributes      Json?

  // Metadata
  lastSyncedAt    DateTime @default(now())
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relación con Brand
  brand           Brand    @relation(fields: [brandId], references: [id])

  @@index([brandId])
  @@index([category])
  @@index([mfrPartNumber])
  @@map("products")
}
```

**Actualizar modelo Brand** (agregar al final del modelo):
```prisma
model Brand {
  // ... campos existentes ...
  products        Product[]  // 👈 Agregar esta línea
}
```

**Ejecutar migración**:
```bash
npx prisma migrate dev --name add_products_model
npx prisma generate
```

---

### PASO 4: Crear Servicio de Sincronización ✅

**Archivo a crear**: `infrastructure/services/ProductsSyncService.ts`

**Patrón a seguir**: Copiar estructura de `BrandsSyncService.ts`

**Métodos principales**:
```typescript
export class ProductsSyncService {
  // Sincronizar productos de un brand específico
  async syncProductsByBrand(brandId: string): Promise<{ count: number }> {
    // 1. Fetch desde Turn14 API: GET /v1/items?brand_id={brandId}
    // 2. Upsert a PostgreSQL usando Prisma
    // 3. Retornar count
  }

  // Obtener productos desde DB
  async getProductsByBrand(brandId: string) {
    return await prisma.product.findMany({
      where: { brandId },
      orderBy: { title: 'asc' }
    });
  }

  // Obtener producto por ID (con lazy-loading)
  async getProductById(productId: string) {
    // Similar a getBrandById en BrandsSyncService
  }
}

export const productsSyncService = new ProductsSyncService();
```

**Detalles técnicos**:
- Usar `authService.getAuthorizationHeader()` para autenticación
- Almacenar `pricing`, `inventory`, `images` como JSON
- Usar `as any` para writes, `as unknown as ProductPricing[]` para reads

---

### PASO 5: Crear Server Actions ✅

**Archivo a crear**: `application/actions/products.ts`

```typescript
"use server";

import { productsSyncService } from "@/infrastructure/services/ProductsSyncService";
import type { Product } from "@/generated/prisma/client";
import type { ProductPricing } from "@/domain/types/turn14/products";

export async function getProductsByBrand(brandId: string) {
  try {
    const products = await productsSyncService.getProductsByBrand(brandId);

    return {
      data: products.map((product: Product) => ({
        id: product.id,
        type: "Product" as const,
        attributes: {
          title: product.title,
          description: product.description,
          category: product.category,
          pricing: product.pricing as unknown as ProductPricing[],
          inventory: product.inventory as unknown as any,
          images: product.images as unknown as any[],
        }
      }))
    };
  } catch (error) {
    throw error;
  }
}

export async function getProductById(productId: string) {
  // Similar a getBrandById
}

export async function forceSyncProducts(brandId: string) {
  // Forzar sincronización
}
```

---

### PASO 6: UI - Lista de Productos por Brand ✅

**Archivos a crear**:

**1. Página**: `app/brands/[id]/products/page.tsx`
```typescript
import { getProductsByBrand } from "@/application/actions/products";
import { getBrandById } from "@/application/actions/brands";
import Link from "next/link";

export default async function BrandProductsPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;

  const [brandData, productsData] = await Promise.all([
    getBrandById(id),
    getProductsByBrand(id)
  ]);

  const brand = brandData.data;
  const products = productsData.data;

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-7xl mx-auto p-8">
        <Link href={`/brands/${id}`} className="text-blue-600 hover:text-blue-800">
          ← Volver a {brand.attributes.name}
        </Link>

        <h1 className="text-3xl font-bold mt-4 mb-8">
          Productos de {brand.attributes.name}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
```

**2. Componente**: `components/product-details/ProductCard.tsx`
```typescript
import type { Product } from "@/domain/types/turn14/products";
import Link from "next/link";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const mainImage = product.attributes.images[0]?.url || '';
  const price = product.attributes.pricing[0]?.price || 0;

  return (
    <Link href={`/products/${product.id}`}>
      <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-4">
        {mainImage && (
          <img
            src={mainImage}
            alt={product.attributes.title}
            className="w-full h-48 object-contain mb-4"
          />
        )}
        <h3 className="font-semibold text-sm mb-2 line-clamp-2">
          {product.attributes.title}
        </h3>
        <p className="text-zinc-600 text-xs mb-2">
          SKU: {product.attributes.mfr_part_number}
        </p>
        <p className="text-lg font-bold text-blue-600">
          ${price.toFixed(2)}
        </p>
      </div>
    </Link>
  );
}
```

---

### PASO 7: UI - Detalle de Producto ✅

**Archivo a crear**: `app/products/[id]/page.tsx`

```typescript
import { getProductById } from "@/application/actions/products";
import Link from "next/link";

export default async function ProductDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const productData = await getProductById(id);
  const product = productData.data;

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-6xl mx-auto p-8">
        <Link href={`/brands/${product.attributes.brand_id}/products`}>
          ← Volver a productos
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
          {/* Galería de imágenes */}
          <div>
            <img
              src={product.attributes.images[0]?.url}
              alt={product.attributes.title}
              className="w-full rounded-lg"
            />
          </div>

          {/* Información del producto */}
          <div>
            <h1 className="text-3xl font-bold mb-4">
              {product.attributes.title}
            </h1>
            <p className="text-zinc-600 mb-6">
              {product.attributes.description}
            </p>

            {/* Pricing */}
            <div className="bg-white rounded-lg p-6 shadow">
              <h2 className="text-xl font-semibold mb-4">Precios</h2>
              {/* Tabla de precios por price group */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
```

---

### PASO 8: Integrar con Brands ✅

**Archivo a modificar**: `app/brands/[id]/page.tsx`

**Agregar después de la información del brand**:
```typescript
// Obtener count de productos
const productCount = await prisma.product.count({
  where: { brandId: id }
});

// En el JSX, agregar:
<div className="mt-6 pt-6 border-t">
  <Link
    href={`/brands/${id}/products`}
    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
  >
    Ver {productCount} Productos →
  </Link>
</div>
```

---

### PASO 9: API Endpoints (Opcional) ✅

**Para testing y administración**

**Archivo**: `app/api/sync/products/[brandId]/route.ts`
```typescript
import { productsSyncService } from "@/infrastructure/services/ProductsSyncService";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ brandId: string }> }
) {
  const { brandId } = await params;

  const result = await productsSyncService.syncProductsByBrand(brandId);

  return NextResponse.json(result);
}
```

---

### PASO 10: Testing ✅

**Pruebas a realizar**:

1. **Sincronización**:
```bash
# Via API endpoint
curl -X POST http://localhost:3000/api/sync/products/335

# Via server action en consola del navegador
```

2. **Navegación**:
- `/brands` → Lista de brands ✅
- `/brands/335` → Detalle de brand ✅
- Clic en "Ver X Productos" → Lista de productos
- Clic en producto → Detalle de producto

3. **Verificar en PostgreSQL**:
```sql
-- Ver productos sincronizados
SELECT id, title, "brandId", category, "createdAt"
FROM products
WHERE "brandId" = '335'
LIMIT 10;

-- Contar productos por brand
SELECT "brandId", COUNT(*)
FROM products
GROUP BY "brandId";
```

---

## 📊 Arquitectura Final

```
Turn14 API
    ↓
ProductsSyncService (infrastructure)
    ↓
PostgreSQL (products table)
    ↓
Server Actions (application)
    ↓
Next.js Pages (app/brands/[id]/products)
    ↓
React Components (components/product-details)
```

---

## 🎯 Próximos Pasos Opcionales

Una vez completados los 10 pasos:

1. **Búsqueda full-text** con PostgreSQL tsvector
2. **Filtros avanzados** (categoría, precio, disponibilidad)
3. **Paginación** cursor-based para mejor performance
4. **Optimización de imágenes** con Next.js Image
5. **Cache de productos** más visitados

---

**Creado**: 28 dic 2025
**Última actualización**: 28 dic 2025
**Estado**: ✅ Listo para ejecución (después de corregir prerequisito Prisma)
