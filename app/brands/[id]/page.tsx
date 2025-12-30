import { getBrandById } from "@/application/actions/brands";
import { getProductsByBrand } from "@/application/actions/products";
import { getPricesByBrand } from "@/application/actions/prices";
import { getBrandCategories } from "@/application/actions/categories";
import Link from "next/link";
import type { PriceGroup } from "@/domain/types/turn14/brands";
import { InfoItem } from "@/components/brand-details/InfoItem";
import { PriceGroupCard } from "@/components/brand-details/PriceGroupCard";
import { ProductGrid } from "@/components/products/ProductGrid";
import { CategorySidebar } from "@/components/sidebar/CategorySidebar";
import { MobileCategoryButton } from "@/components/sidebar/MobileCategoryButton";

export default async function BrandDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { id } = await params;
  const { page: pageParam } = await searchParams;

  // Server actions - errors will be caught by error boundary
  const brandData = await getBrandById(id);
  const brand = brandData.data;
  const priceGroups = brand.attributes.pricegroups as PriceGroup[];

  // Obtener productos con paginación
  const currentPage = pageParam ? parseInt(pageParam) : 1;
  const productsData = await getProductsByBrand(parseInt(id), currentPage);

  // Obtener precios para los productos
  const pricesData = await getPricesByBrand(parseInt(id), currentPage);

  // 🔍 DEBUG: Mostrar datos de pricing en consola
  console.log("📊 [Brand Page] Pricing data received:");
  console.log(`   Total prices: ${pricesData.data.length}`);
  console.log(`   Current page: ${pricesData.meta.current_page}`);
  console.log(`   Total pages: ${pricesData.meta.total_pages}`);
  console.log("   Sample price data:", pricesData.data[0]);

  // Obtener categorías únicas de esta marca
  const categories = await getBrandCategories(parseInt(id));

  // Merge products con prices
  const productsWithPrices = productsData.data.map((product) => {
    const price = pricesData.data.find((p) => p.productId === product.id);
    return {
      ...product,
      pricing: price || null,
    };
  });

  // 🔍 DEBUG: Mostrar ejemplo de producto con precio
  console.log("🛍️ [Brand Page] Sample product with pricing:", {
    productId: productsWithPrices[0]?.id,
    productName: productsWithPrices[0]?.attributes.product_name,
    pricing: productsWithPrices[0]?.pricing,
  });

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-[90rem] mx-auto p-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/test-brands"
            className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-2 transition-colors"
          >
            ← Volver a todas las marcas
          </Link>
          <h1 className="text-3xl font-bold mt-2">
            {brand.attributes.name}
          </h1>
        </div>

        {/* Details Card */}
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Logo */}
          {brand.attributes.logo && (
            <div className="flex justify-center p-4 bg-zinc-50 rounded">
              <img
                src={brand.attributes.logo}
                alt={brand.attributes.name}
                className="max-w-xs max-h-28 object-contain"
              />
            </div>
          )}

          {/* Basic Info Grid */}
          <div className="grid grid-cols-2 gap-4 border-t pt-6">
            <InfoItem label="Brand ID" value={brand.id} />
            <InfoItem
              label="Dropship"
              value={brand.attributes.dropship ? "✅ Sí" : "❌ No"}
            />
            <InfoItem
              label="Códigos AAIA"
              value={
                brand.attributes.AAIA && brand.attributes.AAIA.length > 0
                  ? brand.attributes.AAIA.join(", ")
                  : "Ninguno"
              }
            />
            <InfoItem
              label="Grupos de Precio"
              value={priceGroups.length.toString()}
            />
          </div>

          {/* Price Groups Detail */}
          {priceGroups.length > 0 && (
            <div className="mt-6 border-t pt-6">
              <h2 className="text-xl font-semibold mb-4">
                Grupos de Precio
              </h2>
              <div className="space-y-4">
                {priceGroups.map((pg) => (
                  <PriceGroupCard key={pg.pricegroup_id} priceGroup={pg} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Products Section with Sidebar */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Productos</h2>

          {/* Mobile Category Filter Button */}
          <MobileCategoryButton categories={categories} />

          {/* Layout: Sidebar + Products Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
            {/* Sidebar - Hidden on mobile, visible on large screens */}
            <div className="hidden lg:block">
              <div className="sticky top-6">
                <CategorySidebar categories={categories} />
              </div>
            </div>

            {/* Products Grid */}
            <div>
              <ProductGrid
                products={productsWithPrices}
                currentPage={currentPage}
                totalPages={productsData.meta.total_pages}
                brandId={parseInt(id)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Force dynamic rendering (no static generation)
export const dynamic = "force-dynamic";
export const revalidate = false; // Immutable cache
