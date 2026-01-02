import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/infrastructure/providers/AuthProviderFactory";
import { env } from "@/infrastructure/config/env";

/**
 * GET /api/test/fetch-product?id=197468
 * Endpoint para testear fetch directo desde la API de Turn14
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("id");

    if (!productId) {
      return NextResponse.json(
        { error: "productId is required" },
        { status: 400 }
      );
    }

    console.log(`🌐 Fetching product ${productId} directly from Turn14 API...`);

    const url = `${env.turn14.apiUrl}/items/${productId}`;
    const response = await fetch(url, {
      headers: {
        Authorization: await authService.getAuthorizationHeader(),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Turn14 API error: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();

    console.log(`✅ Product fetched:`, {
      id: data.data.id,
      clearance_item: data.data.attributes.clearance_item,
      full_data: data.data.attributes,
    });

    return NextResponse.json({
      success: true,
      product: data.data,
      clearance_item: data.data.attributes.clearance_item,
    });
  } catch (error) {
    console.error("❌ Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product", details: error },
      { status: 500 }
    );
  }
}
