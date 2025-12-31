import { authService } from "@/infrastructure/providers/AuthProviderFactory";
import { prisma } from "@/infrastructure/database/prisma";
import type {
  ProductsResponse,
  Product as Turn14Product,
} from "@/domain/types/turn14/products";
import { traducirCategoria } from "@/constants/categorias";

export class ProductsSyncService {
  private static readonly CACHE_TTL_DAYS = 3; // Renovar caché cada 3 días
  private static readonly PAGE_SIZE = 25; // Productos por página mostrados al usuario
  private static readonly API_PAGE_SIZE = 100; // La API de Turn14 devuelve ~100 productos por página
  private static readonly USER_PAGES_PER_API_PAGE = 4; // 100 / 25 = 4 páginas de usuario por página de API

  /**
   * Obtener productos con sistema de caché lazy-loading + TTL
   * 1. Si la página está cacheada y < 3 días → leer desde DB
   * 2. Si la página está cacheada pero > 3 días → renovar desde API
   * 3. Si no está cacheada → llamar API y guardar en DB
   *
   * PAGINACIÓN: El usuario solicita páginas de 25 productos, pero la API devuelve ~100.
   * Mapeamos páginas de usuario a páginas de API:
   * - Página usuario 1-4 → API página 1 (productos 1-100)
   * - Página usuario 5-8 → API página 2 (productos 101-200)
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

      // Caché válido (< 3 días)
      if (daysSinceCache < ProductsSyncService.CACHE_TTL_DAYS) {
        console.log(
          `📦 Cache HIT: Brand ${brandId}, User Page ${userPage}, API Page ${apiPage} (${daysSinceCache.toFixed(1)} días)`
        );
        return this.getProductsFromDatabase(brandId, apiPage, offsetWithinApiPage, userPage);
      }

      // Caché expirado (> 3 días) - Renovar
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
    // Obtener los ~100 productos de la página de API desde la DB
    // Estos productos ya están guardados cuando se hizo el fetch de la API
    const apiPageProducts = await prisma.product.findMany({
      where: { brandId },
      skip: (apiPage - 1) * ProductsSyncService.API_PAGE_SIZE,
      take: ProductsSyncService.API_PAGE_SIZE,
      orderBy: { id: "asc" },
    });

    // Aplicar el offset dentro de la página de API para obtener los 25 productos correctos
    const userPageProducts = apiPageProducts.slice(
      offsetWithinApiPage,
      offsetWithinApiPage + ProductsSyncService.PAGE_SIZE
    );

    // Calcular total de páginas basado en el total de productos
    const totalProducts = await prisma.product.count({
      where: { brandId },
    });
    const totalPages = Math.ceil(totalProducts / ProductsSyncService.PAGE_SIZE);

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
        thumbnail: p.thumbnail || "",
        dimensions: p.dimensions as any,
        warehouse_availability: p.warehouseAvailability as any,
        // Campos que no guardamos pero que la interfaz requiere (valores por defecto)
        born_on_date: "",
        powersports_indicator: false,
        clearance_item: false,
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

    // Guardar productos en DB
    await this.saveProductsToDatabase(data.data, brandId);

    // Extraer y guardar categorías únicas
    await this.saveBrandCategories(data.data, brandId);

    // Marcar página de API como cacheada (usar upsert para evitar race conditions)
    await prisma.productPageCache.upsert({
      where: {
        brandId_page: {
          brandId,
          page: apiPage,
        },
      },
      update: {
        cachedAt: new Date(),
      },
      create: {
        brandId,
        page: apiPage,
      },
    });

    // Aplicar offset dentro de la página de API para obtener los 25 productos correctos
    // La API devuelve ~100 productos, aplicamos slice según la página de usuario
    const userPageProducts = data.data.slice(
      offsetWithinApiPage,
      offsetWithinApiPage + ProductsSyncService.PAGE_SIZE
    );

    // Calcular total de páginas ajustado al nuevo pageSize
    // Si la API tiene 10 páginas de 100 productos = 1000 productos
    // Con pageSize de 25 = 40 páginas (1000 / 25)
    const estimatedTotalProducts = data.meta.total_pages * ProductsSyncService.API_PAGE_SIZE;
    const adjustedTotalPages = Math.ceil(estimatedTotalProducts / ProductsSyncService.PAGE_SIZE);

    return {
      products: userPageProducts,
      totalPages: adjustedTotalPages,
      currentPage: userPage,
      links: data.links,
    };
  }

  /**
   * Guardar productos en la base de datos
   */
  private async saveProductsToDatabase(
    products: Turn14Product[],
    brandId: number
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
      thumbnail: p.attributes.thumbnail || null,
      dimensions: p.attributes.dimensions as any, // Cast to any for Prisma Json type
      warehouseAvailability: p.attributes.warehouse_availability as any, // Cast to any for Prisma Json type
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

    console.log(`✅ Saved ${products.length} products to database`);
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
}

export const productsSyncService = new ProductsSyncService();
