import { NextResponse } from "next/server";
import { prisma } from "@/infrastructure/database/prisma";

export async function POST(request: Request) {
  try {
    const { brandId } = await request.json();

    if (!brandId) {
      return NextResponse.json(
        { error: "brandId is required" },
        { status: 400 }
      );
    }

    // Eliminar cache de productos para la marca
    const deletedProducts = await prisma.productPageCache.deleteMany({
      where: { brandId: parseInt(brandId) },
    });

    // Eliminar cache de precios para la marca
    const deletedPrices = await prisma.pricePageCache.deleteMany({
      where: { brandId: parseInt(brandId) },
    });

    console.log(
      `✅ Invalidated cache for brand ${brandId}: ${deletedProducts.count} product pages, ${deletedPrices.count} price pages`
    );

    return NextResponse.json({
      success: true,
      message: `Cache invalidated for brand ${brandId}`,
      deletedProducts: deletedProducts.count,
      deletedPrices: deletedPrices.count,
    });
  } catch (error) {
    console.error("❌ Error invalidating cache:", error);
    return NextResponse.json(
      { error: "Failed to invalidate cache" },
      { status: 500 }
    );
  }
}
