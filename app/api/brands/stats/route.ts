import { NextResponse } from "next/server";
import { brandsSyncService } from "@/infrastructure/services/BrandsSyncService";

/**
 * GET /api/brands/stats
 *
 * Get brand cache statistics
 * Returns total brands, cached count, and cache hit rate
 */
export async function GET() {
  try {
    const stats = await brandsSyncService.getBrandCacheStats();

    return NextResponse.json({
      success: true,
      stats: {
        total: stats.total,
        cached: stats.withDetails,
        uncached: stats.withoutDetails,
        cacheHitRate: `${stats.cacheHitRate.toFixed(2)}%`,
      },
    });
  } catch (error) {
    console.error("Error fetching cache stats:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
