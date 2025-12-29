import { NextResponse } from "next/server";
import { prisma } from "@/infrastructure/database/prisma";

/**
 * API de prueba: Simular caché antiguo
 * GET /api/test-cache-refresh?brandId=38&page=1
 *
 * Modifica el timestamp del caché para simular que tiene 4 días de antigüedad
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const brandId = parseInt(searchParams.get("brandId") || "38");
    const page = parseInt(searchParams.get("page") || "1");

    // Buscar el caché existente
    const cachedPage = await prisma.productPageCache.findUnique({
      where: {
        brandId_page: {
          brandId,
          page,
        },
      },
    });

    if (!cachedPage) {
      return NextResponse.json({
        success: false,
        message: `No existe caché para Brand ${brandId}, Page ${page}`,
      });
    }

    // Calcular fecha de hace 4 días
    const fourDaysAgo = new Date();
    fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);

    // Actualizar el timestamp
    await prisma.productPageCache.update({
      where: {
        brandId_page: {
          brandId,
          page,
        },
      },
      data: {
        cachedAt: fourDaysAgo,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Caché modificado: Brand ${brandId}, Page ${page} ahora muestra 4 días de antigüedad`,
      brandId,
      page,
      newCachedAt: fourDaysAgo,
      instruction: `Ahora visita http://localhost:3000/brands/${brandId}?page=${page} y verás en los logs: "♻️ Cache STALE" seguido de renovación desde API`,
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
