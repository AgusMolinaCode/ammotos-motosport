import { getBrandBySlug } from "@/application/actions/brands";
import {
  getProductsByBrand,
  getProductForGrid,
} from "@/application/actions/products";
import Link from "next/link";
import { Suspense } from "react";
import type { PriceGroup } from "@/domain/types/turn14/brands";
import { ProductsWithData } from "@/components/products/ProductsWithData";
import { CategorySidebarAccordion } from "@/components/sidebar/CategorySidebarAccordion";
import { MobileFilterButton } from "@/components/sidebar/MobileFilterButton";
import { ActiveFilters } from "@/components/filters/ActiveFilters";
import {
  traducirCategoria,
  traducirSubcategoria,
} from "@/constants/categorias";
import Image from "next/image";
import { extractProductId } from "@/lib/utils";
import type { Metadata } from "next";

interface ProductPageProps {
  params: Promise<{
    slug: string;
    productSlug: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug, productSlug } = await params;
  const productId = extractProductId(productSlug);

  return {
    title: productId
      ? `Producto ${productId} | ${slug} | AmPowerparts`
      : `Producto | ${slug} | AmPowerparts`,
    description: `Encuentra repuestos y accesorios para tu auto deportivo.`,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug: brandSlug, productSlug } = await params;
  const productId = extractProductId(productSlug);

  // Si no hay productId válido, redirigir a la página de la marca
  if (!productId) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Producto no encontrado
          </h1>
          <Link
            href={`/brands/${brandSlug}`}
            className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-2 transition-colors"
          >
            ← Volver a {brandSlug}
          </Link>
        </div>
      </div>
    );
  }

  // Obtener el brand
  const brandData = await getBrandBySlug(brandSlug);
  const brand = brandData.data;

  if (!brand) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Marca no encontrada
          </h1>
          <Link
            href="/test-brands"
            className="text-blue-600 hover:text-blue-800"
          >
            ← Volver a todas las marcas
          </Link>
        </div>
      </div>
    );
  }

  const brandId = parseInt(brand.id);
  const brandSlugFromDb = brand.attributes.slug || brandSlug;

  // Buscar el producto por productId
  const selectedProduct = await getProductForGrid(productId);

  // Obtener datos de filtros para la sidebar
  const productsData = await getProductsByBrand(brandId, 1, {});

  const priceGroups = brand.attributes.pricegroups as PriceGroup[];

  // Extraer filtros del productsData
  const { categories, subcategories, productNames } =
    productsData.filterData || {
      categories: [],
      subcategories: [],
      productNames: [],
    };

  // Preparar datos de filtros activos (vacíos porque estamos mostrando un producto)
  const activeFiltersData = {
    category: undefined,
    categoryEs: undefined,
    subcategory: undefined,
    subcategoryEs: undefined,
    productName: undefined,
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-[110rem] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/test-brands"
            className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-2 transition-colors"
          >
            ← Ver todas las marcas
          </Link>
          <div className="flex justify-start items-center my-6">
            <h1 className="text-3xl font-bold mt-2">{brand.attributes.name}</h1>

            {brand.attributes.logo && (
              <div className="">
                <Image
                  src={brand.attributes.logo}
                  alt={brand.attributes.name}
                  className="max-w-xs max-h-28 object-contain"
                  width={200}
                  height={100}
                />
              </div>
            )}
          </div>
        </div>

        {/* Products Section with Sidebar */}
        <div className="mt-12">
          {/* Indicador de filtros activos - vacío porque hay producto seleccionado */}
          <ActiveFilters
            brandId={brandId}
            brandSlug={brandSlugFromDb}
            filters={activeFiltersData}
          />

          {/* Layout: Sidebar + Products Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-6 xl:gap-8">
            {/* Sidebar - Solo visible en xl+ (desktop) */}
            <div className="hidden xl:block xl:col-span-1">
              <div className="xl:sticky xl:top-6">
                <CategorySidebarAccordion
                  categories={categories}
                  subcategories={subcategories}
                  productNames={productNames}
                  brandId={brandId}
                  brandSlug={brandSlugFromDb}
                  activeFilters={{}}
                />
              </div>
            </div>

            {/* Product */}
            <div className="xl:col-span-1">
              {/* Botón filtros móvil - visible solo en < xl */}
              <div className="xl:hidden mb-4">
                <MobileFilterButton
                  categories={categories}
                  subcategories={subcategories}
                  productNames={productNames}
                  brandId={brandId}
                  brandSlug={brandSlugFromDb}
                  activeFilters={{}}
                />
              </div>
              {selectedProduct ? (
                <Suspense
                  fallback={
                    <div className="h-64 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
                      <span className="text-gray-400">
                        Cargando producto...
                      </span>
                    </div>
                  }
                >
                  <ProductsWithData
                    products={[selectedProduct]}
                    brandId={brandId}
                    brandSlug={brandSlugFromDb}
                    currentPage={1}
                    totalPages={1}
                    selectedProduct={selectedProduct}
                  />
                </Suspense>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">
                    No se encontró el producto con ID: {productId}
                  </p>
                  <Link
                    href={`/brands/${brandSlugFromDb}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Ver todos los productos
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Force dynamic rendering
export const dynamic = "force-dynamic";
export const revalidate = false;
