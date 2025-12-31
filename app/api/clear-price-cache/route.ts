import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infrastructure/database/prisma";

/**
 * DELETE /api/clear-price-cache?productId=622858
 * Limpiar caché de precios para un producto específico o todos
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (productId) {
      // Eliminar precio específico
      await prisma.productPrice.delete({
        where: { productId },
      });

      return NextResponse.json({
        success: true,
        message: `Price cache cleared for product ${productId}`,
      });
    } else {
      // Eliminar todos los precios
      const result = await prisma.productPrice.deleteMany({});

      return NextResponse.json({
        success: true,
        message: `All price cache cleared. Deleted ${result.count} entries`,
      });
    }
  } catch (error) {
    console.error("Error clearing price cache:", error);
    return NextResponse.json(
      { success: false, error: "Failed to clear price cache" },
      { status: 500 }
    );
  }
}
