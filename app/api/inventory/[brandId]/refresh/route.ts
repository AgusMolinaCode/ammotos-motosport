import { NextRequest, NextResponse } from "next/server";
import { inventorySyncService } from "@/infrastructure/services/InventorySyncService";

/**
 * API ENDPOINT: Force refresh inventory cache for a brand
 *
 * GET /api/inventory/[brandId]/refresh
 *
 * Invalida el caché actual y fuerza un nuevo fetch desde Turn14 API
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ brandId: string }> }
) {
  try {
    const { brandId } = await params;
    const brandIdNum = parseInt(brandId);

    if (isNaN(brandIdNum)) {
      return NextResponse.json(
        { error: "Invalid brand ID" },
        { status: 400 }
      );
    }

    console.log(`🔄 API: Force refresh inventory for brand ${brandIdNum}`);

    const inventoryMap = await inventorySyncService.forceRefreshInventory(brandIdNum);

    return NextResponse.json({
      success: true,
      brandId: brandIdNum,
      itemCount: inventoryMap.size,
      message: `Inventory refreshed successfully for brand ${brandIdNum}`,
    });
  } catch (error) {
    console.error("Error refreshing inventory:", error);
    return NextResponse.json(
      {
        error: "Failed to refresh inventory",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
