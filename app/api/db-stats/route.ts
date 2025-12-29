import { NextResponse } from "next/server";
import { prisma } from "@/infrastructure/database/prisma";

export async function GET() {
  try {
    const [brandsCount, productsCount, cachedPagesCount] = await Promise.all([
      prisma.brand.count(),
      prisma.product.count(),
      prisma.productPageCache.count(),
    ]);

    const firstBrands = await prisma.brand.findMany({
      take: 10,
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });

    const cachedPages = await prisma.productPageCache.findMany({
      orderBy: [{ brandId: "asc" }, { page: "asc" }],
    });

    return NextResponse.json({
      success: true,
      stats: {
        brands: brandsCount,
        products: productsCount,
        cachedPages: cachedPagesCount,
      },
      firstBrands,
      cachedPages,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
