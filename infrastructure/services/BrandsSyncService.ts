import { authService } from "@/infrastructure/providers/AuthProviderFactory";
import { env } from "@/infrastructure/config/env";
import { prisma } from "@/infrastructure/database/prisma";
import type { BrandsResponse } from "@/domain/types/turn14/brands";
import type { IndividualBrandResponse } from "@/domain/types/turn14/brand-details";

/**
 * Service for syncing Turn14 brands with local database
 * Implements weekly sync strategy to avoid unnecessary API calls
 */
export class BrandsSyncService {
  private static readonly SYNC_INTERVAL_DAYS = 7;
  private static readonly ENTITY_NAME = "brands";

  /**
   * Check if sync is needed based on last sync time
   */
  private async shouldSync(): Promise<boolean> {
    const syncControl = await prisma.syncControl.findUnique({
      where: { entity: BrandsSyncService.ENTITY_NAME },
    });

    if (!syncControl) {
      return true; // First time sync
    }

    const daysSinceLastSync =
      (Date.now() - syncControl.lastSync.getTime()) / (1000 * 60 * 60 * 24);

    return daysSinceLastSync >= BrandsSyncService.SYNC_INTERVAL_DAYS;
  }

  /**
   * Fetch brands from Turn14 API
   */
  private async fetchBrandsFromAPI(): Promise<BrandsResponse> {
    const authHeader = await authService.getAuthorizationHeader();

    const response = await fetch(`${env.turn14.apiUrl}/brands`, {
      headers: {
        Authorization: authHeader,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Turn14 API error: ${response.status} - ${errorText}`);
    }

    return await response.json();
  }

  /**
   * Check if sync is needed (public method for API routes)
   */
  async needsSync(): Promise<boolean> {
    return await this.shouldSync();
  }

  /**
   * Sync brands from API to database
   * WARNING: Do not call during component render to avoid hydration issues
   */
  async syncBrands(): Promise<{ synced: boolean; count: number }> {
    const brandsData = await this.fetchBrandsFromAPI();

    // Upsert all brands
    await Promise.all(
      brandsData.data.map((brand) =>
        prisma.brand.upsert({
          where: { id: brand.id },
          update: {
            name: brand.attributes.name,
            dropship: brand.attributes.dropship,
            logo: brand.attributes.logo,
            aaia: brand.attributes.AAIA || [],
            pricegroups: brand.attributes.pricegroups as any,
          },
          create: {
            id: brand.id,
            name: brand.attributes.name,
            dropship: brand.attributes.dropship,
            logo: brand.attributes.logo,
            aaia: brand.attributes.AAIA || [],
            pricegroups: brand.attributes.pricegroups as any,
          },
        })
      )
    );

    // Update sync control
    await prisma.syncControl.upsert({
      where: { entity: BrandsSyncService.ENTITY_NAME },
      update: { lastSync: new Date() },
      create: {
        entity: BrandsSyncService.ENTITY_NAME,
        lastSync: new Date(),
      },
    });

    return { synced: true, count: brandsData.data.length };
  }

  /**
   * Get all brands from database
   */
  async getBrands() {
    return await prisma.brand.findMany({
      orderBy: { name: "asc" },
    });
  }

  /**
   * Force sync (useful for manual sync)
   */
  async forceSync(): Promise<{ count: number }> {
    // Delete existing sync control to force sync
    await prisma.syncControl.deleteMany({
      where: { entity: BrandsSyncService.ENTITY_NAME },
    });

    const result = await this.syncBrands();
    return { count: result.count };
  }

  /**
   * Fetch individual brand details from Turn14 API
   */
  private async fetchBrandDetailsFromAPI(
    brandId: string
  ): Promise<IndividualBrandResponse> {
    const authHeader = await authService.getAuthorizationHeader();

    const response = await fetch(`${env.turn14.apiUrl}/brands/${brandId}`, {
      headers: {
        Authorization: authHeader,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Turn14 API error for brand ${brandId}: ${response.status} - ${errorText}`
      );
    }

    return await response.json();
  }

  /**
   * Get brand by ID with lazy-loading (cache-on-demand)
   *
   * FLOW:
   * 1. Check DB for detailsFetched=true → Return immediately (cache hit)
   * 2. If false → Fetch API → Update DB → Mark true (cache miss)
   * 3. Never update once cached (immutable)
   */
  async getBrandById(brandId: string) {
    // Step 1: Check DB cache
    const cachedBrand = await prisma.brand.findUnique({
      where: { id: brandId },
    });

    // Step 2: Cache hit - return immediately (no API call)
    if (cachedBrand?.detailsFetched) {
      return cachedBrand;
    }

    // Step 3: Brand exists but details not cached
    if (cachedBrand) {
      const apiResponse = await this.fetchBrandDetailsFromAPI(brandId);
      const brandData = apiResponse.data;

      return await prisma.brand.update({
        where: { id: brandId },
        data: {
          name: brandData.attributes.name,
          dropship: brandData.attributes.dropship,
          logo: brandData.attributes.logo,
          aaia: brandData.attributes.AAIA || [],
          pricegroups: brandData.attributes.pricegroups as any,
          detailsFetched: true,
          detailsFetchedAt: new Date(),
        },
      });
    }

    // Step 4: Brand doesn't exist at all (edge case)
    // Shouldn't happen if list sync works, but handle gracefully
    const apiResponse = await this.fetchBrandDetailsFromAPI(brandId);
    const brandData = apiResponse.data;

    return await prisma.brand.create({
      data: {
        id: brandData.id,
        name: brandData.attributes.name,
        dropship: brandData.attributes.dropship,
        logo: brandData.attributes.logo,
        aaia: brandData.attributes.AAIA || [],
        pricegroups: brandData.attributes.pricegroups as any,
        detailsFetched: true,
        detailsFetchedAt: new Date(),
      },
    });
  }

  /**
   * Force refresh brand details (admin tool - violates immutability)
   */
  async forceRefreshBrandDetails(brandId: string) {
    const apiResponse = await this.fetchBrandDetailsFromAPI(brandId);
    const brandData = apiResponse.data;

    return await prisma.brand.update({
      where: { id: brandId },
      data: {
        name: brandData.attributes.name,
        dropship: brandData.attributes.dropship,
        logo: brandData.attributes.logo,
        aaia: brandData.attributes.AAIA || [],
        pricegroups: brandData.attributes.pricegroups as any,
        detailsFetched: true,
        detailsFetchedAt: new Date(),
      },
    });
  }

  /**
   * Get cache statistics (monitoring/debug)
   */
  async getBrandCacheStats() {
    const [total, withDetails, withoutDetails] = await Promise.all([
      prisma.brand.count(),
      prisma.brand.count({ where: { detailsFetched: true } }),
      prisma.brand.count({ where: { detailsFetched: false } }),
    ]);

    return {
      total,
      withDetails,
      withoutDetails,
      cacheHitRate: total > 0 ? (withDetails / total) * 100 : 0,
    };
  }
}

export const brandsSyncService = new BrandsSyncService();
