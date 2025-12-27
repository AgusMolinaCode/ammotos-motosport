import { authService } from "@/infrastructure/providers/AuthProviderFactory";
import { env } from "@/infrastructure/config/env";
import { prisma } from "@/infrastructure/database/prisma";
import type { BrandsResponse } from "@/domain/types/turn14/brands";

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
   * Sync brands from API to database
   */
  async syncBrands(): Promise<{ synced: boolean; count: number }> {
    const needsSync = await this.shouldSync();

    if (!needsSync) {
      const count = await prisma.brand.count();
      return { synced: false, count };
    }

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
            pricegroups: brand.attributes.pricegroups,
          },
          create: {
            id: brand.id,
            name: brand.attributes.name,
            dropship: brand.attributes.dropship,
            logo: brand.attributes.logo,
            aaia: brand.attributes.AAIA || [],
            pricegroups: brand.attributes.pricegroups,
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
}

export const brandsSyncService = new BrandsSyncService();
