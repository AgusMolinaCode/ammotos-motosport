"use server";

import { productsSyncService } from "@/infrastructure/services/ProductsSyncService";
import { prisma } from "@/infrastructure/database/prisma";
import type { ProductData, ProductsResponse, Product as Turn14Product, ProductFile, Product } from "@/domain/types/turn14/products";
import type { BrandFilterData, ProductFilters } from "@/infrastructure/services/ProductsSyncService";

// Tipo para productos en OfferItems
export interface OfferProduct {
  id: string;
  productName: string;
  partNumber: string;
  brandName: string;
  brandId: number;
  thumbnail: string | null;
  files: ProductFile[];
  price: number | null;
}

export interface ProductsWithFiltersResult {
  data: Turn14Product[];
  meta: {
    total_pages: number;
    current_page: number;
    total_matches?: number;
    total_products?: number;
  };
  filterData: BrandFilterData;
}

/**
 * Obtener el total de productos de una marca (cacheados en DB)
 */
export async function getTotalProductsByBrand(brandId: number): Promise<number> {
  try {
    const count = await prisma.product.count({
      where: { brandId }
    });
    return count;
  } catch (error) {
    console.error(`Error counting products for brand ${brandId}:`, error);
    return 0;
  }
}

export async function getProductsByBrand(
  brandId: number,
  page: number = 1,
  filters: ProductFilters = {}
): Promise<ProductsWithFiltersResult> {
  try {
    const hasFilters = !!(
      filters.category || filters.subcategory || filters.productName || filters.hasStock
    );

    // Obtener productos y total de productos en paralelo
    const [result, totalProducts] = await Promise.all([
      hasFilters
        ? productsSyncService.getProductsByBrandFiltered(brandId, page, filters)
        : productsSyncService.getProductsByBrandPaginated(brandId, page),
      getTotalProductsByBrand(brandId)
    ]);

    const totalMatches = "totalMatches" in result ? result.totalMatches : result.products.length;

    return {
      data: result.products,
      meta: {
        total_pages: result.totalPages,
        current_page: result.currentPage,
        total_matches: totalMatches,
        total_products: totalProducts,
      },
      filterData: result.filterData,
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
}

/**
 * Obtener datos de un producto específico por ID (con caché en DB)
 * 1. Primero busca en DB
 * 2. Si no está o tiene más de 7 días, fetch desde API y guarda en DB
 */
export async function getProductDataById(itemId: string): Promise<ProductData | null> {
  try {
    return await productsSyncService.getProductDataById(itemId);
  } catch (error) {
    console.error(`Error fetching product data for ${itemId}:`, error);
    throw error;
  }
}

/**
 * Obtener productos actualizados o añadidos en los últimos X días
 *
 * @param page - Número de página (required)
 * @param days - Número de días (1-15, default: 1)
 * @returns ProductsResponse con productos actualizados
 */
export async function getItemsUpdates(
  page: number = 1,
  days: number = 1
): Promise<ProductsResponse> {
  try {
    return await productsSyncService.getItemsUpdates(page, days);
  } catch (error) {
    console.error(`Error fetching items updates:`, error);
    throw error;
  }
}

/**
 * Obtener productos recomendados con stock (para sección de ofertas)
 * 1. Filtra productos con canPurchase = true (tienen stock)
 * 2. Ordena por clearanceItem para priorizar ofertas
 * 3. Toma 10 productos aleatorios
 */
export async function getRecommendedProducts(count: number = 10) {
  try {
    // Contar productos con stock
    const totalWithStock = await prisma.productPrice.count({
      where: { canPurchase: true }
    });

    if (totalWithStock === 0) {
      return [];
    }

    // Obtener skip aleatorio (asegurar que hay suficientes productos)
    const skip = Math.max(0, Math.floor(Math.random() * Math.min(totalWithStock - count, 1000)));

    // Obtener productos con stock
    const productsWithStock = await prisma.productPrice.findMany({
      where: { canPurchase: true },
      take: Math.min(count + skip, totalWithStock),
      skip: skip,
      select: { productId: true }
    });

    if (productsWithStock.length === 0) {
      return [];
    }

    // Obtener detalles de los productos
    const productIds = productsWithStock.map(p => p.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      take: count
    });

    // Shuffle para aleatoriedad
    return products.sort(() => Math.random() - 0.5);
  } catch (error) {
    console.error("Error fetching recommended products:", error);
    return [];
  }
}

/**
 * Obtener productos de brands específicos (para sección de ofertas)
 * @param count - Cantidad de productos FINAL (sepedido más para compensar filtrado)
 * @param brandIds - Array de IDs de brands
 */
export async function getProductsByBrandsForOffers(
  count: number = 6,
  brandIds: number[]
): Promise<OfferProduct[]> {
  try {
    // Pedimos más productos para compensar los que se filtran por no tener files
    const fetchCount = Math.ceil(count * 10);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const products = await productsSyncService.getProductsByBrands(fetchCount, brandIds) as any as OfferProduct[];

    // Filtrar solo productos que tienen files con items
    const filteredProducts = products.filter((p) => p.files && p.files.length > 0);

    // Retornar solo la cantidad solicitada
    return filteredProducts.slice(0, count);
  } catch (error) {
    console.error("Error fetching products by brands:", error);
    return [];
  }
}

/**
 * Obtener logo de una marca por su ID
 */
export async function getBrandLogo(brandId: number): Promise<string | null> {
  try {
    const brand = await prisma.brand.findUnique({
      where: { id: String(brandId) },
      select: { logo: true }
    });
    return brand?.logo || null;
  } catch (error) {
    console.error(`Error fetching brand logo for ${brandId}:`, error);
    return null;
  }
}

// Tipo para resultado de búsqueda por mfrPartNumber
export interface MfrPartNumberSearchResult {
  id: string;
  productName: string;
  mfrPartNumber: string;
  thumbnail: string | null;
  brandName: string;
  brandId: number;
  brandSlug: string;
}

/**
 * Buscar productos por mfrPartNumber O partNumber
 * @param query - Texto de búsqueda (búsqueda parcial, case-insensitive)
 * @param limit - Máximo de resultados (default: 10)
 * @returns Array de productos que coinciden con la búsqueda
 */
export async function searchByMfrPartNumber(
  query: string,
  limit: number = 10
): Promise<MfrPartNumberSearchResult[]> {
  if (!query || query.length < 2) {
    return [];
  }

  try {
    // Buscar en mfrPartNumberMap por mfrPartNumber
    const mfrResults = await prisma.mfrPartNumberMap.findMany({
      where: {
        mfrPartNumber: {
          contains: query,
          mode: "insensitive",
        },
      },
      take: Math.ceil(limit / 2),
      orderBy: { mfrPartNumber: "asc" },
    });

    // Buscar en Product por partNumber (código interno de Turn14)
    const productResults = await prisma.product.findMany({
      where: {
        partNumber: {
          contains: query,
          mode: "insensitive",
        },
      },
      take: Math.ceil(limit / 2),
      orderBy: { partNumber: "asc" },
    });

    // Combinar resultados, removiendo duplicados por productId
    const combinedMap = new Map<string, MfrPartNumberSearchResult>();

    // Recopilar todos los brandIds para hacer una sola consulta
    const brandIds = new Set<number>();

    // Agregar resultados de mfrPartNumberMap
    for (const r of mfrResults) {
      brandIds.add(r.brandId);
      combinedMap.set(r.productId, {
        id: r.productId,
        productName: r.productName,
        mfrPartNumber: r.mfrPartNumber,
        thumbnail: r.thumbnail,
        brandName: r.brandName,
        brandId: r.brandId,
        brandSlug: "", // Se填充 después
      });
    }

    // Agregar resultados de Product (usan partNumber)
    for (const p of productResults) {
      brandIds.add(p.brandId);
      if (!combinedMap.has(p.id)) {
        combinedMap.set(p.id, {
          id: p.id,
          productName: p.productName,
          mfrPartNumber: p.mfrPartNumber || "",
          thumbnail: p.thumbnail,
          brandName: p.brandName,
          brandId: p.brandId,
          brandSlug: "", // Se填充 después
        });
      }
    }

    // Fetch slugs para todos los brandIds
    const brands = await prisma.brand.findMany({
      where: { id: { in: Array.from(brandIds).map(String) } },
      select: { id: true, slug: true },
    });

    const brandSlugMap = new Map<string, string>();
    for (const brand of brands) {
      brandSlugMap.set(brand.id, brand.slug || brand.id);
    }

    // Actualizar resultados con slugs
    const results = Array.from(combinedMap.values());
    for (const result of results) {
      result.brandSlug = brandSlugMap.get(String(result.brandId)) || String(result.brandId);
    }

    // Retornar primeros 'limit' resultados
    return results.slice(0, limit);
  } catch (error) {
    console.error("Error searching by part number:", error);
    return [];
  }
}

/**
 * Obtener un producto del search por su ID para mostrar en grilla
 * Busca en MfrPartNumberMap primero, luego en Product
 */
export async function getProductForGrid(productId: string): Promise<Product | null> {
  // Primero buscar en MfrPartNumberMap (tiene todos los productos mapeados)
  // Usamos findFirst porque productId no es el campo @id (mfrPartNumber es el @id)
  const mappedProduct = await prisma.mfrPartNumberMap.findFirst({
    where: { productId },
  });

  if (mappedProduct) {
    // Convertir resultado del search a formato Product con valores por defecto
    return {
      id: mappedProduct.productId,
      type: "Item" as const,
      attributes: {
        product_name: mappedProduct.productName,
        part_number: "", // No tenemos este dato del search
        mfr_part_number: mappedProduct.mfrPartNumber,
        part_description: "",
        category: "Other",
        subcategory: "Other",
        dimensions: [],
        brand_id: mappedProduct.brandId,
        brand: mappedProduct.brandName,
        price_group_id: 0,
        price_group: "Standard",
        active: true,
        born_on_date: "",
        regular_stock: true,
        powersports_indicator: false,
        clearance_item: false,
        dropship_controller_id: 0,
        air_freight_prohibited: false,
        ltl_freight_required: false,
        units_per_sku: 1,
        not_carb_approved: false,
        carb_acknowledgement_required: false,
        carb_eo_number: null,
        prop_65: "N",
        epa: "N/A",
        warehouse_availability: [],
        thumbnail: mappedProduct.thumbnail || "",
        barcode: undefined,
        alternate_part_number: null,
        contents: null,
      },
    };
  }

  // Si no está en MfrPartNumberMap, buscar en Product (formato completo)
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (product) {
    return {
      id: product.id,
      type: "Item" as const,
      attributes: {
        product_name: product.productName,
        part_number: product.partNumber,
        mfr_part_number: product.mfrPartNumber,
        part_description: product.partDescription || "",
        category: product.category,
        subcategory: product.subcategory,
        dimensions: product.dimensions as unknown as Product["attributes"]["dimensions"],
        brand_id: product.brandId,
        brand: product.brandName,
        price_group_id: product.priceGroupId,
        price_group: product.priceGroup,
        active: product.active,
        born_on_date: "",
        regular_stock: product.regularStock,
        powersports_indicator: false,
        clearance_item: product.clearanceItem,
        dropship_controller_id: 0,
        air_freight_prohibited: false,
        ltl_freight_required: false,
        units_per_sku: 1,
        not_carb_approved: false,
        carb_acknowledgement_required: false,
        carb_eo_number: null,
        prop_65: "N",
        epa: "N/A",
        warehouse_availability: product.warehouseAvailability as unknown as Product["attributes"]["warehouse_availability"],
        thumbnail: product.thumbnail || "",
        barcode: undefined,
        alternate_part_number: null,
        contents: null,
      },
    };
  }

  return null;
}

/**
 * Obtener un producto por su mfrPartNumber
 * 1. Busca en MfrPartNumberMap (más completo)
 * 2. Si no está, busca en Product
 * 3. Si no está en DB, busca directamente en Turn14 API
 */
export async function getProductByMfrPartNumber(
  mfrPartNumber: string
): Promise<Product | null> {
  const normalizedPartNumber = mfrPartNumber.toUpperCase();

  // Primero buscar en MfrPartNumberMap (tiene todos los productos mapeados)
  const mappedProduct = await prisma.mfrPartNumberMap.findFirst({
    where: {
      OR: [
        { mfrPartNumber: normalizedPartNumber },
        // También buscar sin guiones para mayor tolerancia
        { mfrPartNumber: normalizedPartNumber.replace(/-/g, "") },
      ],
    },
  });

  if (mappedProduct) {
    return {
      id: mappedProduct.productId,
      type: "Item" as const,
      attributes: {
        product_name: mappedProduct.productName,
        part_number: "",
        mfr_part_number: mappedProduct.mfrPartNumber,
        part_description: "",
        category: "Other",
        subcategory: "Other",
        dimensions: [],
        brand_id: mappedProduct.brandId,
        brand: mappedProduct.brandName,
        price_group_id: 0,
        price_group: "Standard",
        active: true,
        born_on_date: "",
        regular_stock: true,
        powersports_indicator: false,
        clearance_item: false,
        dropship_controller_id: 0,
        air_freight_prohibited: false,
        ltl_freight_required: false,
        units_per_sku: 1,
        not_carb_approved: false,
        carb_acknowledgement_required: false,
        carb_eo_number: null,
        prop_65: "N",
        epa: "N/A",
        warehouse_availability: [],
        thumbnail: mappedProduct.thumbnail || "",
        barcode: undefined,
        alternate_part_number: null,
        contents: null,
      },
    };
  }

  // Si no está en MfrPartNumberMap, buscar en Product
  const product = await prisma.product.findFirst({
    where: { mfrPartNumber: normalizedPartNumber },
  });

  if (product) {
    return {
      id: product.id,
      type: "Item" as const,
      attributes: {
        product_name: product.productName,
        part_number: product.partNumber,
        mfr_part_number: product.mfrPartNumber,
        part_description: product.partDescription || "",
        category: product.category,
        subcategory: product.subcategory,
        dimensions: product.dimensions as unknown as Product["attributes"]["dimensions"],
        brand_id: product.brandId,
        brand: product.brandName,
        price_group_id: product.priceGroupId,
        price_group: product.priceGroup,
        active: product.active,
        born_on_date: "",
        regular_stock: product.regularStock,
        powersports_indicator: false,
        clearance_item: product.clearanceItem,
        dropship_controller_id: 0,
        air_freight_prohibited: false,
        ltl_freight_required: false,
        units_per_sku: 1,
        not_carb_approved: false,
        carb_acknowledgement_required: false,
        carb_eo_number: null,
        prop_65: "N",
        epa: "N/A",
        warehouse_availability: product.warehouseAvailability as unknown as Product["attributes"]["warehouse_availability"],
        thumbnail: product.thumbnail || "",
        barcode: undefined,
        alternate_part_number: null,
        contents: null,
      },
    };
  }

  return null;
}
