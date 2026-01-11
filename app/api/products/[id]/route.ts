import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/infrastructure/database/prisma";

/**
 * GET /api/products/[id]
 * Obtener un producto por su ID (formato para search popup)
 * Busca en MfrPartNumberMap (tiene todos los productos mapeados)
 * y si no lo encuentra, busca en Product
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Primero buscar en MfrPartNumberMap (contiene todos los productos mapeados)
    const mappedProduct = await prisma.mfrPartNumberMap.findUnique({
      where: { productId: id },
    });

    if (mappedProduct) {
      return NextResponse.json({
        id: mappedProduct.productId,
        productName: mappedProduct.productName,
        mfrPartNumber: mappedProduct.mfrPartNumber,
        brandName: mappedProduct.brandName,
        brandId: mappedProduct.brandId,
        thumbnail: mappedProduct.thumbnail,
      });
    }

    // Si no está en MfrPartNumberMap, buscar en Product
    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        productName: true,
        mfrPartNumber: true,
        partNumber: true,
        brandName: true,
        brandId: true,
        thumbnail: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Devolver en formato MfrPartNumberSearchResult
    return NextResponse.json({
      id: product.id,
      productName: product.productName,
      mfrPartNumber: product.mfrPartNumber || product.partNumber,
      brandName: product.brandName,
      brandId: product.brandId,
      thumbnail: product.thumbnail,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product", details: String(error) },
      { status: 500 }
    );
  }
}
