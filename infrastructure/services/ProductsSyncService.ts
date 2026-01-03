import { authService } from "@/infrastructure/providers/AuthProviderFactory";
import { prisma } from "@/infrastructure/database/prisma";
import type {
  ProductsResponse,
  Product as Turn14Product,
} from "@/domain/types/turn14/products";
import { traducirCategoria } from "@/constants/categorias";

// Tipo para datos de filtros de marca (categorías, subcategorías, productNames)
export interface BrandFilterData {
  categories: { category: string; categoryEs: string }[];
  subcategories: { subcategory: string }[];
  productNames: { productName: string }[];
}

// Tipo de retorno para productos con datos de filtros
interface ProductsResult {
  products: Turn14Product[];
  totalPages: number;
  currentPage: number;
  links: {
    self: string;
    first: string;
    last: string;
  };
  filterData: BrandFilterData;
}

export class ProductsSyncService {
  private static readonly CACHE_TTL_DAYS = 5; // Renovar caché cada 5 días (actualizado para consistencia)
  private static readonly PAGE_SIZE = 25; // Productos por página mostrados al usuario
  private static readonly API_PAGE_SIZE = 100; // La API de Turn14 devuelve ~100 productos por página
  private static readonly USER_PAGES_PER_API_PAGE = 4; // 100 / 25 = 4 páginas de usuario por página de API

  /**
   * Obtener productos con sistema de caché lazy-loading + TTL
   * 1. Si la página está cacheada y < 5 días → leer desde DB
   * 2. Si la página está cacheada pero > 5 días → renovar desde API
   * 3. Si no está cacheada → llamar API y guardar en DB
   *
   * PAGINACIÓN: El usuario solicita páginas de 25 productos, pero la API devuelve ~100.
   * Mapeamos páginas de usuario a páginas de API:
   * - Página usuario 1-4 → API página 1 (productos 1-100)
   * - Página usuario 5-8 → API página 2 (productos 101-200)
   *
   * CACHÉ ROBUSTO: Verifica que haya suficientes productos en DB antes de paginar.
   * Si faltan productos para una página solicitada, hace fetch automático desde API.
   */
  async getProductsByBrandPaginated(brandId: number, userPage: number = 1) {
    // Calcular qué página de API necesitamos
    const apiPage = Math.ceil(userPage / ProductsSyncService.USER_PAGES_PER_API_PAGE);

    // Calcular offset dentro de la página de API
    const offsetWithinApiPage = ((userPage - 1) % ProductsSyncService.USER_PAGES_PER_API_PAGE) * ProductsSyncService.PAGE_SIZE;

    // Verificar si esta página de API ya está cacheada
    const cachedPage = await prisma.productPageCache.findUnique({
      where: {
        brandId_page: {
          brandId,
          page: apiPage,
        },
      },
    });

    // Si está cacheada, verificar antigüedad
    if (cachedPage) {
      const daysSinceCache =
        (Date.now() - cachedPage.cachedAt.getTime()) / (1000 * 60 * 60 * 24);

      // Caché válido (< 5 días)
      if (daysSinceCache < ProductsSyncService.CACHE_TTL_DAYS) {
        console.log(
          `📦 Cache HIT: Brand ${brandId}, User Page ${userPage}, API Page ${apiPage} (${daysSinceCache.toFixed(1)} días)`
        );
        return this.getProductsFromDatabase(brandId, apiPage, offsetWithinApiPage, userPage);
      }

      // Caché expirado (> 5 días) - Renovar
      console.log(
        `♻️  Cache STALE: Brand ${brandId}, User Page ${userPage}, API Page ${apiPage} (${daysSinceCache.toFixed(1)} días) - Renovando...`
      );
      await this.invalidateCache(brandId, apiPage);
      return this.fetchAndCacheProducts(brandId, apiPage, offsetWithinApiPage, userPage);
    }

    // Si no está cacheada, llamar API y guardar
    console.log(
      `🌐 Cache MISS: Fetching from API - Brand ${brandId}, User Page ${userPage}, API Page ${apiPage}`
    );
    return this.fetchAndCacheProducts(brandId, apiPage, offsetWithinApiPage, userPage);
  }

  /**
   * Invalidar caché de una página específica
   */
  private async invalidateCache(brandId: number, page: number) {
    // Eliminar entrada de caché
    await prisma.productPageCache.delete({
      where: {
        brandId_page: {
          brandId,
          page,
        },
      },
    });

    console.log(`🗑️  Cache invalidated: Brand ${brandId}, Page ${page}`);
  }

  /**
   * Leer productos desde la base de datos (página ya cacheada)
   * SPARSE CACHE: Solo lee productos de la apiPage específica, permitiendo
   * tener páginas 1,2,3,4,15 sin necesidad de tener las intermedias.
   *
   * @param brandId - ID de la marca
   * @param apiPage - Página de API (100 productos)
   * @param offsetWithinApiPage - Offset dentro de la página de API (0, 25, 50, 75)
   * @param userPage - Página solicitada por el usuario (25 productos)
   */
  private async getProductsFromDatabase(
    brandId: number,
    apiPage: number,
    offsetWithinApiPage: number,
    userPage: number
  ) {
    // Obtener productos SOLO de esta apiPage específica (sparse cache)
    const apiPageProducts = await prisma.product.findMany({
      where: {
        brandId,
        apiPage // Filtrar por página de API específica
      },
      orderBy: { id: "asc" },
    });

    // Si no hay productos para esta apiPage específica, hacer fetch desde API
    if (apiPageProducts.length === 0) {
      console.log(
        `⚠️  No products found for API page ${apiPage}. Fetching from API...`
      );
      return this.fetchAndCacheProducts(brandId, apiPage, offsetWithinApiPage, userPage);
    }

    // Aplicar el offset dentro de la página de API para obtener los 25 productos correctos
    const userPageProducts = apiPageProducts.slice(
      offsetWithinApiPage,
      offsetWithinApiPage + ProductsSyncService.PAGE_SIZE
    );

    // Detectar si es la última página (menos de 25 productos, incluyendo 0)
    const isLastPage = userPageProducts.length < ProductsSyncService.PAGE_SIZE;

    let totalPages: number;
    if (isLastPage) {
      // Si tiene 0 productos, la última página válida es la anterior
      if (userPageProducts.length === 0 && userPage > 1) {
        totalPages = userPage - 1;
      } else {
        // Si tiene 1-24 productos, esta es la última página
        totalPages = userPage;
      }
    } else {
      // Si hay 25 productos, puede haber más páginas
      // Usar totalApiPages del caché más reciente para detectar nuevas páginas
      const latestCache = await prisma.productPageCache.findFirst({
        where: {
          brandId,
          totalApiPages: { not: null }
        },
        orderBy: { cachedAt: 'desc' },
        select: { totalApiPages: true }
      });

      if (latestCache?.totalApiPages) {
        // Usar el total de páginas de la API (cada API page = 4 user pages)
        totalPages = latestCache.totalApiPages * ProductsSyncService.USER_PAGES_PER_API_PAGE;
      } else {
        // Fallback: calcular basado en productos cacheados
        const totalProducts = await prisma.product.count({
          where: {
            brandId,
            apiPage: { not: null }
          },
        });
        totalPages = Math.ceil(totalProducts / ProductsSyncService.PAGE_SIZE);
      }
    }

    // Convertir de formato DB a formato Turn14
    const turn14Products: Turn14Product[] = userPageProducts.map((p) => ({
      id: p.id,
      type: "Item" as const,
      attributes: {
        product_name: p.productName,
        part_number: p.partNumber,
        mfr_part_number: p.mfrPartNumber,
        part_description: p.partDescription || "",
        category: p.category,
        subcategory: p.subcategory,
        brand_id: p.brandId,
        brand: p.brandName,
        price_group_id: p.priceGroupId,
        price_group: p.priceGroup,
        active: p.active,
        regular_stock: p.regularStock,
        clearance_item: p.clearanceItem,
        thumbnail: p.thumbnail || "",
        dimensions: p.dimensions as any,
        warehouse_availability: p.warehouseAvailability as any,
        // Campos que no guardamos pero que la interfaz requiere (valores por defecto)
        born_on_date: "",
        powersports_indicator: false,
        dropship_controller_id: 0,
        air_freight_prohibited: false,
        ltl_freight_required: false,
        units_per_sku: 1,
        not_carb_approved: false,
        carb_acknowledgement_required: false,
        prop_65: "Unknown",
        epa: "Unknown",
      },
    }));

    return {
      products: turn14Products,
      totalPages,
      currentPage: userPage,
      links: {
        self: "",
        first: "",
        last: "",
      },
      filterData: await this.getFilterDataFromDatabase(brandId),
    };
  }

  /**
   * Obtener datos de filtros desde la base de datos
   */
  private async getFilterDataFromDatabase(brandId: number): Promise<BrandFilterData> {
    const [categories, subcategories, productNames] = await Promise.all([
      prisma.brandCategory.findMany({
        where: { brandId },
        orderBy: { categoryEs: "asc" },
        select: { category: true, categoryEs: true },
      }),
      prisma.brandSubcategory.findMany({
        where: { brandId },
        orderBy: { subcategory: "asc" },
        select: { subcategory: true },
      }),
      prisma.brandProductName.findMany({
        where: { brandId },
        orderBy: { productName: "asc" },
        select: { productName: true },
      }),
    ]);

    return { categories, subcategories, productNames };
  }

  /**
   * Extraer datos de filtros desde los productos de la API
   */
  private extractFilterDataFromProducts(products: Turn14Product[]): BrandFilterData {
    const uniqueCategories = new Map<string, string>();
    const uniqueSubcategories = new Set<string>();
    const uniqueProductNames = new Set<string>();

    for (const product of products) {
      const attr = product.attributes;
      if (attr.category) {
        uniqueCategories.set(attr.category, traducirCategoria(attr.category));
      }
      if (attr.subcategory) {
        uniqueSubcategories.add(attr.subcategory);
      }
      if (attr.product_name) {
        uniqueProductNames.add(attr.product_name);
      }
    }

    return {
      categories: Array.from(uniqueCategories.entries()).map(([category, categoryEs]) => ({
        category,
        categoryEs,
      })),
      subcategories: Array.from(uniqueSubcategories).map((subcategory) => ({ subcategory })),
      productNames: Array.from(uniqueProductNames).map((productName) => ({ productName })),
    };
  }

  /**
   * Llamar API y guardar productos en DB
   * @param brandId - ID de la marca
   * @param apiPage - Página de API (100 productos)
   * @param offsetWithinApiPage - Offset dentro de la página de API (0, 25, 50, 75)
   * @param userPage - Página solicitada por el usuario (25 productos)
   */
  private async fetchAndCacheProducts(
    brandId: number,
    apiPage: number,
    offsetWithinApiPage: number,
    userPage: number
  ) {
    const response = await fetch(
      `https://api.turn14.com/v1/items/brand/${brandId}?page=${apiPage}`,
      {
        headers: {
          Authorization: await authService.getAuthorizationHeader(),
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status}`);
    }

    const data: ProductsResponse = await response.json();

    // Guardar productos en DB con su apiPage
    await this.saveProductsToDatabase(data.data, brandId, apiPage);

    // Extraer y guardar categorías, subcategorías y product names únicos
    // ⚡ IMPORTANTE: Extraemos filterData ANTES de guardar para retornarlo inmediatamente
    const filterData = this.extractFilterDataFromProducts(data.data);
    await Promise.all([
      this.saveBrandCategories(data.data, brandId),
      this.saveBrandSubcategories(data.data, brandId),
      this.saveBrandProductNames(data.data, brandId),
    ]);

    // Marcar página de API como cacheada y guardar totalApiPages para detectar nuevas páginas
    await prisma.productPageCache.upsert({
      where: {
        brandId_page: {
          brandId,
          page: apiPage,
        },
      },
      update: {
        cachedAt: new Date(),
        totalApiPages: data.meta.total_pages, // Actualizar total de páginas de la API
      },
      create: {
        brandId,
        page: apiPage,
        totalApiPages: data.meta.total_pages, // Guardar total de páginas de la API
      },
    });

    // Aplicar offset dentro de la página de API para obtener los 25 productos correctos
    // La API devuelve ~100 productos, aplicamos slice según la página de usuario
    const userPageProducts = data.data.slice(
      offsetWithinApiPage,
      offsetWithinApiPage + ProductsSyncService.PAGE_SIZE
    );

    // Calcular total de páginas REAL basado en productos actuales
    // Si esta página tiene menos de 25 productos (incluyendo 0), es la última página
    const isLastPage = userPageProducts.length < ProductsSyncService.PAGE_SIZE;

    let totalPages: number;
    if (isLastPage) {
      // Si tiene 0 productos, la última página válida es la anterior
      if (userPageProducts.length === 0 && userPage > 1) {
        totalPages = userPage - 1;
      } else {
        // Si tiene 1-24 productos, esta es la última página
        totalPages = userPage;
      }
    } else {
      // Si hay 25 productos, puede haber más páginas
      // Usar estimación basada en API meta, pero será ajustado en siguientes requests
      const estimatedTotalProducts = data.meta.total_pages * ProductsSyncService.API_PAGE_SIZE;
      totalPages = Math.ceil(estimatedTotalProducts / ProductsSyncService.PAGE_SIZE);
    }

    return {
      products: userPageProducts,
      totalPages,
      currentPage: userPage,
      links: data.links,
      filterData,
    };
  }

  /**
   * Guardar productos en la base de datos
   * @param products - Productos de Turn14 API
   * @param brandId - ID de la marca
   * @param apiPage - Página de API de donde provienen (para sparse cache)
   */
  private async saveProductsToDatabase(
    products: Turn14Product[],
    brandId: number,
    apiPage: number
  ) {
    const productData = products.map((p) => ({
      id: p.id,
      brandId,
      brandName: p.attributes.brand,
      productName: p.attributes.product_name,
      partNumber: p.attributes.part_number,
      mfrPartNumber: p.attributes.mfr_part_number,
      partDescription: p.attributes.part_description || null,
      category: p.attributes.category,
      subcategory: p.attributes.subcategory,
      priceGroupId: p.attributes.price_group_id,
      priceGroup: p.attributes.price_group,
      active: p.attributes.active,
      regularStock: p.attributes.regular_stock,
      clearanceItem: p.attributes.clearance_item,
      thumbnail: p.attributes.thumbnail || null,
      dimensions: p.attributes.dimensions as any, // Cast to any for Prisma Json type
      warehouseAvailability: p.attributes.warehouse_availability as any, // Cast to any for Prisma Json type
      apiPage, // Guardar página de API para sparse cache
    }));

    // Usar upsert para evitar duplicados
    await Promise.all(
      productData.map((product) =>
        prisma.product.upsert({
          where: { id: product.id },
          update: product,
          create: product,
        })
      )
    );

    console.log(`✅ Saved ${products.length} products from API page ${apiPage} to database`);
  }

  /**
   * Extraer categorías únicas de productos y guardarlas en BrandCategory
   * Solo agrega nuevas categorías, no duplica las existentes
   */
  private async saveBrandCategories(
    products: Turn14Product[],
    brandId: number
  ) {
    // Extraer categorías únicas de los productos
    const uniqueCategories = new Set<string>();
    products.forEach((product) => {
      if (product.attributes.category) {
        uniqueCategories.add(product.attributes.category);
      }
    });

    // Guardar cada categoría única
    const categoryPromises = Array.from(uniqueCategories).map((category) =>
      prisma.brandCategory.upsert({
        where: {
          brandId_category: {
            brandId,
            category,
          },
        },
        update: {}, // No actualizar nada si ya existe
        create: {
          brandId,
          category,
          categoryEs: traducirCategoria(category),
        },
      })
    );

    await Promise.all(categoryPromises);

    console.log(
      `📂 Saved ${uniqueCategories.size} unique categories for brand ${brandId}`
    );
  }

  /**
   * Extraer subcategorías únicas de productos y guardarlas en BrandSubcategory
   * Solo agrega nuevas subcategorías, no duplica las existentes
   */
  private async saveBrandSubcategories(
    products: Turn14Product[],
    brandId: number
  ) {
    // Extraer subcategorías únicas de los productos
    const uniqueSubcategories = new Set<string>();
    products.forEach((product) => {
      if (product.attributes.subcategory) {
        uniqueSubcategories.add(product.attributes.subcategory);
      }
    });

    // Guardar cada subcategoría única
    const subcategoryPromises = Array.from(uniqueSubcategories).map((subcategory) =>
      prisma.brandSubcategory.upsert({
        where: {
          brandId_subcategory: {
            brandId,
            subcategory,
          },
        },
        update: {}, // No actualizar nada si ya existe
        create: {
          brandId,
          subcategory,
        },
      })
    );

    await Promise.all(subcategoryPromises);

    console.log(
      `📂 Saved ${uniqueSubcategories.size} unique subcategories for brand ${brandId}`
    );
  }

  /**
   * Extraer product names únicos de productos y guardarlos en BrandProductName
   * Solo agrega nuevos product names, no duplica los existentes
   */
  private async saveBrandProductNames(
    products: Turn14Product[],
    brandId: number
  ) {
    // Extraer product names únicos de los productos
    const uniqueProductNames = new Set<string>();
    products.forEach((product) => {
      if (product.attributes.product_name) {
        uniqueProductNames.add(product.attributes.product_name);
      }
    });

    // Guardar cada product name único
    const productNamePromises = Array.from(uniqueProductNames).map((productName) =>
      prisma.brandProductName.upsert({
        where: {
          brandId_productName: {
            brandId,
            productName,
          },
        },
        update: {}, // No actualizar nada si ya existe
        create: {
          brandId,
          productName,
        },
      })
    );

    await Promise.all(productNamePromises);

    console.log(
      `📂 Saved ${uniqueProductNames.size} unique product names for brand ${brandId}`
    );
  }
}

export const productsSyncService = new ProductsSyncService();
