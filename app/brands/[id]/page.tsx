import { getBrandById } from "@/application/actions/brands";
import { getProductsByBrand } from "@/application/actions/products";
import Link from "next/link";
import { Suspense } from "react";
import type { PriceGroup } from "@/domain/types/turn14/brands";
import { InfoItem } from "@/components/brand-details/InfoItem";
import { PriceGroupCard } from "@/components/brand-details/PriceGroupCard";
import { ProductGridInstant } from "@/components/products/ProductGridInstant";
import { ProductsWithData } from "@/components/products/ProductsWithData";
import { CategorySidebarAccordion } from "@/components/sidebar/CategorySidebarAccordion";
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
  const currentPage = pageParam ? parseInt(pageParam) : 1;

  // ⚡ OPTIMIZACIÓN: Paralelizar llamadas independientes
  // Solo cargamos Brand y Productos primero (datos esenciales)
  // Precios e Inventario se cargan después con Suspense (carga diferida)
  // Las categorías, subcategorías y productNames vienen directamente del resultado de getProductsByBrand
  const [brandData, productsData] = await Promise.all([
    getBrandById(id),
    getProductsByBrand(parseInt(id), currentPage),
  ]);

  // Extraer filterData directamente del resultado de productos
  const { categories, subcategories, productNames } = productsData.filterData || {
    categories: [],
    subcategories: [],
    productNames: [],
  };

  const brand = brandData.data;
  const priceGroups = brand.attributes.pricegroups as PriceGroup[];

  // ⚡ OPTIMIZACIÓN: Verificar si hay página siguiente para prefetch
  const hasNextPage = currentPage < productsData.meta.total_pages;
  const nextPage = currentPage + 1;

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
                <CategorySidebarAccordion
                  categories={categories}
                  subcategories={subcategories}
                  productNames={productNames}
                />
              </div>
            </div>

            {/* Products Grid con carga ultra-progresiva */}
            <div>
              
              <Suspense
                fallback={
                  <ProductGridInstant
                    products={productsData.data}
                    brandId={parseInt(id)}
                    currentPage={currentPage}
                    totalPages={productsData.meta.total_pages}
                  />
                }
              >
                <ProductsWithData
                  products={productsData.data}
                  brandId={parseInt(id)}
                  currentPage={currentPage}
                  totalPages={productsData.meta.total_pages}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </div>

      {/* ⚡ PREFETCH: Cargar siguiente página en background */}
      {hasNextPage && (
        <Link
          href={`/brands/${id}?page=${nextPage}`}
          prefetch={true}
          className="hidden"
          aria-hidden="true"
        >
          Prefetch página {nextPage}
        </Link>
      )}
    </div>
  );
}

// Force dynamic rendering (no static generation)
export const dynamic = "force-dynamic";
export const revalidate = false; // Immutable cache
