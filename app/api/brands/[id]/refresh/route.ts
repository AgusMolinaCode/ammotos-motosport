import { NextRequest, NextResponse } from "next/server";
import { brandsSyncService } from "@/infrastructure/services/BrandsSyncService";

/**
 * POST /api/brands/{id}/refresh
 *
 * Admin endpoint: Force refresh brand details from Turn14 API
 * Violates immutability rule - use only for manual updates
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const brand = await brandsSyncService.forceRefreshBrandDetails(id);

    return NextResponse.json({
      success: true,
      message: `Brand ${id} refreshed successfully`,
      data: {
        id: brand.id,
        name: brand.name,
        detailsFetchedAt: brand.detailsFetchedAt,
      },
    });
  } catch (error) {
    console.error(`Error refreshing brand:`, error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
