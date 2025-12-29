# Flujo de Implementación: Productos Turn14

## 🎯 Objetivo
Implementar sistema de visualización de productos con enfoque MVP.

**Enfoque MVP (Fase 1)**:
- ✅ Fetch directo desde Turn14 API (sin sincronización a DB por ahora)
- ✅ Grid simple: foto, nombre, número de parte
- ✅ Paginación básica en `brands/[id]`
- ❌ Sin almacenamiento en PostgreSQL (fase posterior)
- ❌ Sin página de detalle (fase posterior)

**Endpoints disponibles**:
- `/v1/items/brand/{brand_id}?page={page}` - Catálogo de productos ✅ (implementar ahora)
- `/v1/pricing/{item_id}` - Precios ⏸️ (fase posterior)
- `/v1/inventory/{item_id}` - Inventario ⏸️ (fase posterior)

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
curl -X GET "https://api.turn14.com/v1/items/brand/{brand_id}?page={page}" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**⚠️ IMPORTANTE - Limitaciones del Endpoint**:
- Este endpoint retorna **información de catálogo** (nombres, descripciones, especificaciones)
- **NO incluye precios** - solo `price_group_id` y `price_group` name
- **NO incluye inventario en tiempo real** - solo `warehouse_availability` (si acepta órdenes)

**📌 Endpoints Adicionales Disponibles**:
- **Pricing**: `GET /v1/pricing/{item_id}` - Obtener precios del producto
- **Inventory**: `GET /v1/inventory/{item_id}` - Obtener inventario en tiempo real
- Estos endpoints se implementarán en una fase posterior según necesidad

**Estructura de Respuesta**:
```json
{
  "meta": {
    "total_pages": 10
  },
  "data": [
    {
      "id": "251594",
      "type": "Item",
      "attributes": { /* ver campos abajo */ }
    }
  ],
  "links": {
    "self": "/v1/items/brand/{brandID}?page=4",
    "first": "/v1/items/brand/{brandID}?page=1",
    "prev": "/v1/items/brand/{brandID}?page=3",
    "next": "/v1/items/brand/{brandID}?page=5",
    "last": "/v1/items/brand/{brandID}?page=10"
  }
}
```

**Campos en `attributes` (ejemplo real de brand 75 - AEM Induction)**:
```json
{
  "product_name": "AEM IND Universal Air Filter",
  "part_number": "aem21-2029DK",
  "mfr_part_number": "21-2029DK",
  "part_description": "AEM 2.75 in Dryflow Air Filter with 9 in Element",
  "category": "Air Filters",
  "subcategory": "Air Filters - Universal Fit",
  "dimensions": [
    {
      "box_number": 1,
      "length": 11,
      "width": 6.6,
      "height": 6.4,
      "weight": 1.8
    }
  ],
  "brand_id": 75,
  "brand": "AEM Induction",
  "price_group_id": 155,
  "price_group": "AEM Induction",
  "active": true,
  "born_on_date": "2010-12-23",
  "regular_stock": true,
  "powersports_indicator": false,
  "dropship_controller_id": 41,
  "air_freight_prohibited": false,
  "not_carb_approved": true,
  "carb_acknowledgement_required": true,
  "ltl_freight_required": false,
  "prop_65": "Y",
  "epa": "N/A",
  "units_per_sku": 1,
  "warehouse_availability": [
    {
      "location_id": "01",
      "can_place_order": true
    }
  ],
  "clearance_item": false,
  "thumbnail": "https://d32vzsop7y1h3k.cloudfront.net/79a06699d54d08bc32ed957fac97be3a.JPG",
  "barcode": "840879015022",
  "alternate_part_number": null,
  "carb_eo_number": null,
  "contents": null
}

---

### PASO 2: Crear Tipos TypeScript ✅

**Archivo a crear**: `domain/types/turn14/products.ts`

**Estructura básica** (basada en API real):
```typescript
export interface ProductsResponse {
  meta: {
    total_pages: number;
  };
  data: Product[];
  links: {
    self: string;
    first: string;
    prev?: string;
    next?: string;
    last: string;
  };
}

export interface Product {
  id: string; // Puede contener letras, ej: "13504G"
  type: "Item";
  attributes: ProductAttributes;
}

export interface ProductAttributes {
  // Identificación
  product_name: string;
  part_number: string; // Turn14 internal part number
  mfr_part_number: string; // Manufacturer part number
  part_description: string; // Puede estar vacío ""

  // Categorización
  category: string;
  subcategory: string;

  // Dimensiones físicas
  dimensions: Dimensions[];

  // Brand relationship
  brand_id: number; // Es un número, no string
  brand: string; // Nombre del brand

  // Price group (NO precios reales)
  price_group_id: number;
  price_group: string;

  // Status flags
  active: boolean;
  born_on_date: string; // Formato: "YYYY-MM-DD"
  regular_stock: boolean;
  powersports_indicator: boolean;
  clearance_item: boolean;

  // Shipping & logistics
  dropship_controller_id: number;
  air_freight_prohibited: boolean;
  ltl_freight_required: boolean;
  units_per_sku: number;

  // Compliance
  not_carb_approved: boolean;
  carb_acknowledgement_required: boolean;
  carb_eo_number?: string | null;
  prop_65: string; // "Y", "N", "Unknown"
  epa: string; // "N/A", "Unknown", etc.

  // Warehouse & availability
  warehouse_availability: WarehouseAvailability[];

  // Media
  thumbnail: string; // URL única, no array de images

  // Identification codes
  barcode?: string;
  alternate_part_number?: string | null;

  // Kit items (opcional, solo para productos tipo kit)
  contents?: KitContent[] | null;
}

// Interfaces auxiliares
export interface Dimensions {
  box_number: number;
  length: number; // inches
  width: number;  // inches
  height: number; // inches
  weight: number; // pounds
}

export interface WarehouseAvailability {
  location_id: string; // "01", "02", "03", etc.
  can_place_order: boolean;
}

export interface KitContent {
  item_id: number;
  quantity: number;
}
```

---

### PASO 3: Actualizar Schema Prisma ⏸️ (OPCIONAL - Fase Posterior)

**Estado**: Opcional para MVP. Solo necesario si decides sincronizar a PostgreSQL.

**Archivo a modificar**: `prisma/schema.prisma`

**Agregar al final del archivo**:
```prisma
model Product {
  // Primary identifier (Turn14 item ID)
  id                            String   @id

  // Brand relationship
  brandId                       Int      // Relación con Brand.id (Int)

  // Identificación del producto
  partNumber                    String   // Turn14 internal part number
  mfrPartNumber                 String   // Manufacturer part number
  productName                   String   // Nombre del producto
  partDescription               String?  @db.Text // Puede estar vacío

  // Categorización
  category                      String?
  subcategory                   String?

  // Price group (NO precios, solo grupo)
  priceGroupId                  Int
  priceGroup                    String

  // Status flags
  active                        Boolean  @default(true)
  bornOnDate                    DateTime?
  regularStock                  Boolean  @default(true)
  powersportsIndicator          Boolean  @default(false)
  clearanceItem                 Boolean  @default(false)

  // Shipping & logistics
  dropshipControllerId          Int      @default(0)
  airFreightProhibited          Boolean  @default(false)
  ltlFreightRequired            Boolean  @default(false)
  unitsPerSku                   Int      @default(1)

  // Compliance
  notCarbApproved               Boolean  @default(false)
  carbAcknowledgementRequired   Boolean  @default(false)
  carbEoNumber                  String?
  prop65                        String?  // "Y", "N", "Unknown"
  epa                           String?  // "N/A", "Unknown"

  // Media
  thumbnail                     String?  // URL de imagen
  barcode                       String?
  alternatePartNumber           String?

  // Campos JSON para datos complejos
  dimensions                    Json     // Array de Dimensions[]
  warehouseAvailability         Json     // Array de WarehouseAvailability[]
  contents                      Json?    // Array de KitContent[] (opcional, para kits)
  attributes                    Json?    // Almacenar respuesta completa de API

  // Metadata
  lastSyncedAt                  DateTime @default(now())
  createdAt                     DateTime @default(now())
  updatedAt                     DateTime @updatedAt

  // Relación con Brand
  brand                         Brand    @relation(fields: [brandId], references: [id])

  // Indexes para búsquedas comunes
  @@index([brandId])
  @@index([category, subcategory])
  @@index([mfrPartNumber])
  @@index([partNumber])
  @@index([priceGroupId])
  @@index([active, clearanceItem])
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
  // Sincronizar productos de un brand específico (con paginación)
  async syncProductsByBrand(brandId: number): Promise<{ count: number }> {
    let totalSynced = 0;
    let currentPage = 1;
    let hasMorePages = true;

    while (hasMorePages) {
      // 1. Fetch desde Turn14 API con paginación
      const response = await fetch(
        `https://api.turn14.com/v1/items/brand/${brandId}?page=${currentPage}`,
        {
          headers: {
            'Authorization': await authService.getAuthorizationHeader(),
          }
        }
      );

      const data: ProductsResponse = await response.json();

      // 2. Upsert cada producto a PostgreSQL
      for (const product of data.data) {
        await prisma.product.upsert({
          where: { id: product.id },
          create: {
            id: product.id,
            brandId: product.attributes.brand_id,
            partNumber: product.attributes.part_number,
            mfrPartNumber: product.attributes.mfr_part_number,
            productName: product.attributes.product_name,
            partDescription: product.attributes.part_description || null,
            category: product.attributes.category,
            subcategory: product.attributes.subcategory,
            priceGroupId: product.attributes.price_group_id,
            priceGroup: product.attributes.price_group,
            active: product.attributes.active,
            bornOnDate: product.attributes.born_on_date ? new Date(product.attributes.born_on_date) : null,
            regularStock: product.attributes.regular_stock,
            powersportsIndicator: product.attributes.powersports_indicator,
            clearanceItem: product.attributes.clearance_item,
            dropshipControllerId: product.attributes.dropship_controller_id,
            airFreightProhibited: product.attributes.air_freight_prohibited,
            ltlFreightRequired: product.attributes.ltl_freight_required,
            unitsPerSku: product.attributes.units_per_sku,
            notCarbApproved: product.attributes.not_carb_approved,
            carbAcknowledgementRequired: product.attributes.carb_acknowledgement_required,
            carbEoNumber: product.attributes.carb_eo_number,
            prop65: product.attributes.prop_65,
            epa: product.attributes.epa,
            thumbnail: product.attributes.thumbnail,
            barcode: product.attributes.barcode,
            alternatePartNumber: product.attributes.alternate_part_number,
            dimensions: product.attributes.dimensions as any,
            warehouseAvailability: product.attributes.warehouse_availability as any,
            contents: product.attributes.contents as any,
            attributes: product.attributes as any,
          },
          update: { /* same fields */ }
        });
        totalSynced++;
      }

      // 3. Verificar si hay más páginas
      hasMorePages = currentPage < data.meta.total_pages;
      currentPage++;
    }

    return { count: totalSynced };
  }

  // Obtener productos directamente de la API con paginación (sin sync)
  async getProductsByBrandPaginated(brandId: number, page: number = 1) {
    const response = await fetch(
      `https://api.turn14.com/v1/items/brand/${brandId}?page=${page}`,
      {
        headers: {
          'Authorization': await authService.getAuthorizationHeader(),
        }
      }
    );

    const data: ProductsResponse = await response.json();

    return {
      products: data.data,
      totalPages: data.meta.total_pages,
      currentPage: page
    };
  }

  // Obtener productos desde DB
  async getProductsByBrand(brandId: number) {
    return await prisma.product.findMany({
      where: { brandId },
      orderBy: { productName: 'asc' }
    });
  }

  // Obtener producto por ID (con lazy-loading)
  async getProductById(productId: string) {
    // Similar a getBrandById en BrandsSyncService
    let product = await prisma.product.findUnique({
      where: { id: productId }
    });

    // Si no existe en DB, buscar en API
    if (!product) {
      // Fetch desde API y guardar
    }

    return product;
  }
}

export const productsSyncService = new ProductsSyncService();
```

**Detalles técnicos**:
- Usar `authService.getAuthorizationHeader()` para autenticación
- **Paginación**: Loop `while (currentPage <= total_pages)` para obtener todos los productos
- Almacenar `dimensions`, `warehouse_availability`, `contents` como JSON con `as any`
- Para reads: `dimensions as unknown as Dimensions[]`
- Convertir `born_on_date` string a DateTime con `new Date()`
- `brandId` es Int, no String

---

### PASO 5: Crear Server Actions ✅

**Archivo a crear**: `application/actions/products.ts`

```typescript
"use server";

import { productsSyncService } from "@/infrastructure/services/ProductsSyncService";
import type { Product } from "@/generated/prisma/client";
import type {
  Dimensions,
  WarehouseAvailability,
  KitContent
} from "@/domain/types/turn14/products";

export async function getProductsByBrand(brandId: number, page: number = 1) {
  try {
    // Obtener directamente de la API con paginación (sin sync)
    const result = await productsSyncService.getProductsByBrandPaginated(brandId, page);

    return {
      data: result.products.map((product) => ({
        id: product.id,
        type: product.type,
        attributes: {
          product_name: product.attributes.product_name,
          mfr_part_number: product.attributes.mfr_part_number,
          thumbnail: product.attributes.thumbnail,
        }
      })),
      meta: {
        total_pages: result.totalPages,
        current_page: result.currentPage,
      }
    };
  } catch (error) {
    throw error;
  }
}

export async function getProductById(productId: string) {
  try {
    const product = await productsSyncService.getProductById(productId);

    if (!product) {
      throw new Error("Product not found");
    }

    return {
      data: {
        id: product.id,
        type: "Item" as const,
        attributes: {
          product_name: product.productName,
          part_number: product.partNumber,
          mfr_part_number: product.mfrPartNumber,
          part_description: product.partDescription,
          category: product.category,
          subcategory: product.subcategory,
          brand_id: product.brandId,
          price_group: product.priceGroup,
          thumbnail: product.thumbnail,
          dimensions: product.dimensions as unknown as Dimensions[],
          warehouse_availability: product.warehouseAvailability as unknown as WarehouseAvailability[],
          // ... otros campos
        }
      }
    };
  } catch (error) {
    throw error;
  }
}

export async function forceSyncProducts(brandId: number) {
  try {
    const result = await productsSyncService.syncProductsByBrand(brandId);
    return result;
  } catch (error) {
    throw error;
  }
}
```

---

### PASO 6: UI - Lista de Productos por Brand (MVP Básico) ✅

**Objetivo MVP**: Grid simple con foto, nombre y número de parte. Paginación básica.

**Archivos a crear**:

**1. Página**: `app/brands/[id]/page.tsx` (modificar la existente)

Agregar sección de productos con paginación después de la información del brand:

```typescript
import { getProductsByBrand } from "@/application/actions/products";
import { ProductGrid } from "@/components/products/ProductGrid";

// ... código existente del brand ...

// Agregar al final, después de la info del brand:

// Obtener productos (con paginación)
const page = searchParams?.page ? parseInt(searchParams.page) : 1;
const productsData = await getProductsByBrand(brand.id, page);

return (
  <div className="min-h-screen bg-zinc-50">
    <div className="max-w-7xl mx-auto p-8">
      {/* ... Info del brand existente ... */}

      {/* NUEVA SECCIÓN: Productos */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Productos</h2>

        <ProductGrid
          products={productsData.data}
          currentPage={page}
          totalPages={productsData.meta.total_pages}
          brandId={brand.id}
        />
      </div>
    </div>
  </div>
);
```

**2. Componente Grid**: `components/products/ProductGrid.tsx`
```typescript
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface Product {
  id: string;
  type: "Item";
  attributes: {
    product_name: string;
    mfr_part_number: string;
    thumbnail: string;
  };
}

interface ProductGridProps {
  products: Product[];
  currentPage: number;
  totalPages: number;
  brandId: number;
}

export function ProductGrid({ products, currentPage, totalPages, brandId }: ProductGridProps) {
  const router = useRouter();

  const handlePageChange = (page: number) => {
    router.push(`/brands/${brandId}?page=${page}`);
  };

  return (
    <>
      {/* Grid de productos */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-4 cursor-pointer"
          >
            {/* Imagen */}
            <div className="aspect-square mb-3 bg-zinc-100 rounded flex items-center justify-center overflow-hidden">
              {product.attributes.thumbnail ? (
                <img
                  src={product.attributes.thumbnail}
                  alt={product.attributes.product_name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <span className="text-zinc-400 text-sm">Sin imagen</span>
              )}
            </div>

            {/* Nombre del producto */}
            <h3 className="font-semibold text-sm mb-2 line-clamp-2 min-h-[40px]">
              {product.attributes.product_name}
            </h3>

            {/* Número de parte */}
            <p className="text-zinc-600 text-xs font-mono">
              {product.attributes.mfr_part_number}
            </p>
          </div>
        ))}
      </div>

      {/* Paginación básica */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-white border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50"
          >
            ← Anterior
          </button>

          <span className="px-4 py-2 text-sm">
            Página {currentPage} de {totalPages}
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-white border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50"
          >
            Siguiente →
          </button>
        </div>
      )}
    </>
  );
}
```

**3. Actualizar Server Action**: `application/actions/products.ts`

```typescript
export async function getProductsByBrand(brandId: number, page: number = 1) {
  try {
    // Obtener productos de la página específica desde la DB
    // O hacer fetch directo a Turn14 API con paginación
    const products = await productsSyncService.getProductsByBrandPaginated(brandId, page);

    return {
      data: products.map((product: Product) => ({
        id: product.id,
        type: "Item" as const,
        attributes: {
          product_name: product.productName,
          mfr_part_number: product.mfrPartNumber,
          thumbnail: product.thumbnail,
        }
      })),
      meta: {
        total_pages: 10, // Obtener de la API o calcular
      }
    };
  } catch (error) {
    throw error;
  }
}
```

**Notas MVP**:
- ✅ Grid simple con foto, nombre y número de parte
- ✅ Paginación básica (Anterior/Siguiente)
- ❌ Sin filtros por ahora
- ❌ Sin ordenamiento
- ❌ Sin búsqueda
- ❌ Sin link a detalle de producto (se agregará después)

---

### PASO 7: UI - Detalle de Producto ⏸️ (POSTPONED)

**Estado**: Pospuesto para fase posterior. Por ahora solo grid básico de productos.

**Cuando se implemente**, el archivo será: `app/products/[id]/page.tsx`

```typescript
import { getProductById } from "@/application/actions/products";
import { getBrandById } from "@/application/actions/brands";
import Link from "next/link";

export default async function ProductDetailPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const productData = await getProductById(id);
  const product = productData.data;

  // Obtener información del brand
  const brandData = await getBrandById(product.attributes.brand_id.toString());
  const brand = brandData.data;

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-6xl mx-auto p-8">
        <Link
          href={`/brands/${product.attributes.brand_id}/products`}
          className="text-blue-600 hover:text-blue-800"
        >
          ← Volver a productos de {brand.attributes.name}
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
          {/* Imagen del producto */}
          <div className="bg-white rounded-lg p-6 shadow">
            {product.attributes.thumbnail ? (
              <img
                src={product.attributes.thumbnail}
                alt={product.attributes.product_name}
                className="w-full rounded-lg"
              />
            ) : (
              <div className="w-full h-96 bg-zinc-200 rounded-lg flex items-center justify-center">
                <span className="text-zinc-400">Sin imagen disponible</span>
              </div>
            )}

            {/* Status badges */}
            <div className="mt-4 flex gap-2">
              {product.attributes.clearance_item && (
                <span className="bg-red-500 text-white text-sm px-3 py-1 rounded">
                  CLEARANCE
                </span>
              )}
              {!product.attributes.active && (
                <span className="bg-gray-400 text-white text-sm px-3 py-1 rounded">
                  INACTIVE
                </span>
              )}
              {product.attributes.regular_stock && (
                <span className="bg-green-500 text-white text-sm px-3 py-1 rounded">
                  REGULAR STOCK
                </span>
              )}
            </div>
          </div>

          {/* Información del producto */}
          <div>
            <h1 className="text-3xl font-bold mb-4">
              {product.attributes.product_name}
            </h1>

            {/* Identificación */}
            <div className="mb-6">
              <p className="text-sm text-zinc-500">Turn14 Part Number</p>
              <p className="font-mono font-semibold">{product.attributes.part_number}</p>
            </div>

            <div className="mb-6">
              <p className="text-sm text-zinc-500">Manufacturer Part Number</p>
              <p className="font-mono font-semibold">{product.attributes.mfr_part_number}</p>
            </div>

            {/* Descripción */}
            {product.attributes.part_description && (
              <div className="mb-6">
                <p className="text-zinc-700">{product.attributes.part_description}</p>
              </div>
            )}

            {/* Categorización */}
            <div className="bg-white rounded-lg p-4 shadow mb-6">
              <h2 className="text-lg font-semibold mb-2">Categorización</h2>
              <p className="text-sm">
                <span className="text-zinc-500">Categoría:</span>{" "}
                {product.attributes.category}
              </p>
              <p className="text-sm">
                <span className="text-zinc-500">Subcategoría:</span>{" "}
                {product.attributes.subcategory}
              </p>
              <p className="text-sm mt-2">
                <span className="text-zinc-500">Price Group:</span>{" "}
                {product.attributes.price_group}
              </p>
            </div>

            {/* Códigos de identificación */}
            <div className="bg-white rounded-lg p-4 shadow mb-6">
              <h2 className="text-lg font-semibold mb-2">Códigos</h2>
              {product.attributes.barcode && (
                <p className="text-sm">
                  <span className="text-zinc-500">Barcode:</span>{" "}
                  <span className="font-mono">{product.attributes.barcode}</span>
                </p>
              )}
              <p className="text-sm">
                <span className="text-zinc-500">Units per SKU:</span>{" "}
                {product.attributes.units_per_sku}
              </p>
            </div>
          </div>
        </div>

        {/* Dimensiones y peso */}
        {product.attributes.dimensions && product.attributes.dimensions.length > 0 && (
          <div className="bg-white rounded-lg p-6 shadow mt-6">
            <h2 className="text-xl font-semibold mb-4">Dimensiones y Peso</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Box #</th>
                    <th className="text-left py-2">Length (in)</th>
                    <th className="text-left py-2">Width (in)</th>
                    <th className="text-left py-2">Height (in)</th>
                    <th className="text-left py-2">Weight (lbs)</th>
                  </tr>
                </thead>
                <tbody>
                  {product.attributes.dimensions.map((dim: any, idx: number) => (
                    <tr key={idx} className="border-b">
                      <td className="py-2">{dim.box_number}</td>
                      <td className="py-2">{dim.length}</td>
                      <td className="py-2">{dim.width}</td>
                      <td className="py-2">{dim.height}</td>
                      <td className="py-2">{dim.weight}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Disponibilidad en warehouses */}
        {product.attributes.warehouse_availability &&
         product.attributes.warehouse_availability.length > 0 && (
          <div className="bg-white rounded-lg p-6 shadow mt-6">
            <h2 className="text-xl font-semibold mb-4">Disponibilidad en Warehouses</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {product.attributes.warehouse_availability.map((wh: any, idx: number) => (
                <div key={idx} className="border rounded p-3">
                  <p className="font-semibold">Location {wh.location_id}</p>
                  <p className={`text-sm ${wh.can_place_order ? 'text-green-600' : 'text-red-600'}`}>
                    {wh.can_place_order ? '✓ Can order' : '✗ Cannot order'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Información de compliance */}
        <div className="bg-white rounded-lg p-6 shadow mt-6">
          <h2 className="text-xl font-semibold mb-4">Compliance & Regulations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-zinc-500">CARB Approved</p>
              <p className={`font-semibold ${product.attributes.not_carb_approved ? 'text-red-600' : 'text-green-600'}`}>
                {product.attributes.not_carb_approved ? 'Not Approved' : 'Approved'}
              </p>
              {product.attributes.carb_acknowledgement_required && (
                <p className="text-xs text-orange-600">Acknowledgement required</p>
              )}
            </div>
            <div>
              <p className="text-sm text-zinc-500">Prop 65</p>
              <p className="font-semibold">{product.attributes.prop_65 || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-500">EPA Status</p>
              <p className="font-semibold">{product.attributes.epa || 'Unknown'}</p>
            </div>
          </div>
        </div>

        {/* Shipping restrictions */}
        <div className="bg-white rounded-lg p-6 shadow mt-6">
          <h2 className="text-xl font-semibold mb-4">Shipping Information</h2>
          <div className="space-y-2">
            <p className="text-sm">
              <span className="text-zinc-500">Air Freight:</span>{" "}
              <span className={product.attributes.air_freight_prohibited ? 'text-red-600' : 'text-green-600'}>
                {product.attributes.air_freight_prohibited ? 'Prohibited' : 'Allowed'}
              </span>
            </p>
            <p className="text-sm">
              <span className="text-zinc-500">LTL Freight:</span>{" "}
              <span className={product.attributes.ltl_freight_required ? 'text-orange-600' : 'text-green-600'}>
                {product.attributes.ltl_freight_required ? 'Required' : 'Not Required'}
              </span>
            </p>
            <p className="text-sm">
              <span className="text-zinc-500">Dropship Controller ID:</span>{" "}
              {product.attributes.dropship_controller_id}
            </p>
          </div>
        </div>

        {/* Kit contents (si es un kit) */}
        {product.attributes.contents && product.attributes.contents.length > 0 && (
          <div className="bg-white rounded-lg p-6 shadow mt-6">
            <h2 className="text-xl font-semibold mb-4">Kit Contents</h2>
            <ul className="space-y-2">
              {product.attributes.contents.map((item: any, idx: number) => (
                <li key={idx} className="flex justify-between border-b pb-2">
                  <span>Item ID: {item.item_id}</span>
                  <span className="font-semibold">Qty: {item.quantity}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Nota sobre precios */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <p className="text-sm text-blue-800">
            <strong>📋 Nota sobre precios:</strong> Este endpoint provee información de catálogo.
            Para obtener precios en tiempo real, consultar el endpoint de pricing de Turn14.
          </p>
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
SELECT
  id,
  "productName",
  "mfrPartNumber",
  "brandId",
  category,
  subcategory,
  "priceGroup",
  active,
  "clearanceItem",
  "createdAt"
FROM products
WHERE "brandId" = 335
LIMIT 10;

-- Contar productos por brand
SELECT "brandId", COUNT(*) as product_count
FROM products
GROUP BY "brandId"
ORDER BY product_count DESC;

-- Ver productos de un brand con información completa
SELECT
  id,
  "productName",
  "partNumber",
  "mfrPartNumber",
  category,
  subcategory,
  "priceGroup",
  active,
  "regularStock",
  "clearanceItem",
  thumbnail,
  "lastSyncedAt"
FROM products
WHERE "brandId" = 75
ORDER BY "productName"
LIMIT 20;

-- Productos clearance activos
SELECT
  id,
  "productName",
  "mfrPartNumber",
  "priceGroup",
  category
FROM products
WHERE "clearanceItem" = true
  AND active = true
ORDER BY "productName";

-- Productos con restricciones CARB
SELECT
  id,
  "productName",
  "mfrPartNumber",
  "notCarbApproved",
  "carbAcknowledgementRequired",
  prop65
FROM products
WHERE "notCarbApproved" = true
   OR "carbAcknowledgementRequired" = true
LIMIT 20;
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

---

## 🚀 Resumen Implementación MVP

### Pasos Requeridos para MVP Básico:

**✅ PASO 1**: Revisar API Documentation (ya documentado arriba)

**✅ PASO 2**: Crear tipos TypeScript
- Archivo: `domain/types/turn14/products.ts`
- Solo necesitas las interfaces básicas de la respuesta API

**⏸️ PASO 3**: Prisma Schema (SALTAR por ahora, solo para fase 2)

**✅ PASO 4**: Crear ProductsSyncService
- Archivo: `infrastructure/services/ProductsSyncService.ts`
- Solo necesitas el método `getProductsByBrandPaginated()` que hace fetch directo a API

**✅ PASO 5**: Crear Server Action
- Archivo: `application/actions/products.ts`
- Solo `getProductsByBrand(brandId, page)` que retorna foto, nombre y número de parte

**✅ PASO 6**: UI Grid de Productos
- Modificar: `app/brands/[id]/page.tsx` - agregar sección de productos
- Crear: `components/products/ProductGrid.tsx` - grid responsive con paginación

**⏸️ PASO 7**: Detalle de Producto (SALTAR por ahora, fase 2)

**⏸️ PASO 8-10**: Opcionales para MVP

### Resultado Final MVP:
```
/brands/335
  - Info del brand (ya existe)
  - Grid de productos con:
    ✅ Foto (thumbnail)
    ✅ Nombre (product_name)
    ✅ Número de parte (mfr_part_number)
  - Paginación:
    ✅ Botón "Anterior"
    ✅ "Página X de Y"
    ✅ Botón "Siguiente"
```

### NO Incluido en MVP:
- ❌ Sincronización a PostgreSQL
- ❌ Página de detalle de producto
- ❌ Pricing (se hará con `/v1/pricing/{item_id}` después)
- ❌ Inventory (se hará con `/v1/inventory/{item_id}` después)
- ❌ Búsqueda/filtros
- ❌ Ordenamiento

---

**Creado**: 28 dic 2025
**Última actualización**: 28 dic 2025
**Estado**: ✅ Listo para MVP - Grid básico con paginación
