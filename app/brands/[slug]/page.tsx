import { getBrandBySlug } from "@/application/actions/brands";
import {
  getProductsByBrand,
  type ProductFilters,
  getProductForGrid,
} from "@/application/actions/products";
import Link from "next/link";
import { Suspense } from "react";
import type { PriceGroup } from "@/domain/types/turn14/brands";
import { InfoItem } from "@/components/brand-details/InfoItem";
import { PriceGroupCard } from "@/components/brand-details/PriceGroupCard";
import { ProductGridInstant } from "@/components/products/ProductGridInstant";
import { ProductsWithData } from "@/components/products/ProductsWithData";
import { SelectedProductView } from "@/components/products/SelectedProductView";
import { CategorySidebarAccordion } from "@/components/sidebar/CategorySidebarAccordion";
import { MobileCategoryButton } from "@/components/sidebar/MobileCategoryButton";
import { ActiveFilters } from "@/components/filters/ActiveFilters";
import { ProductPagination } from "@/components/products/ProductPagination";
import { prefetchAdjacentPages } from "@/lib/prefetch/productPrefetch";
import {
  traducirCategoria,
  traducirSubcategoria,
} from "@/constants/categorias";
import Image from "next/image";
import { BrandSearchHandler } from "@/components/brand-details/BrandSearchHandler";
import Head from "next/head";

export default async function BrandDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    page?: string;
    category?: string;
    subcategory?: string;
    productName?: string;
    productId?: string;
  }>;
}) {
  const { slug } = await params;
  const {
    page: pageParam,
    category,
    subcategory,
    productName,
    productId,
  } = await searchParams;
  const currentPage = pageParam ? Math.max(1, parseInt(pageParam)) : 1; // Nunca permitir página 0 o negativa

  // Construir objeto de filtros
  const filters: ProductFilters = {};
  if (category) filters.category = decodeURIComponent(category);
  if (subcategory) filters.subcategory = decodeURIComponent(subcategory);
  if (productName) filters.productName = decodeURIComponent(productName);

  const hasActiveFilters = !!(category || subcategory || productName);
  const hasProductSelection = !!productId;

  // Solo mostrar producto encontrado si NO hay filtros activos pero SÍ hay productId
  const shouldShowSelectedProduct = hasProductSelection && !hasActiveFilters;

  // ⚡ OPTIMIZACIÓN: Primero obtener el brand para obtener el ID numérico
  const brandData = await getBrandBySlug(slug);
  const brand = brandData.data;

  // Si no hay brand, retornar 404
  if (!brand) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Marca no encontrada</h1>
          <Link href="/test-brands" className="text-blue-600 hover:text-blue-800">
            ← Volver a todas las marcas
          </Link>
        </div>
      </div>
    );
  }

  const brandId = parseInt(brand.id);
  const brandSlug = brand.attributes.slug || slug;

  // Ahora obtener productos (después de tener el brand ID)
  const productsData = await getProductsByBrand(brandId, currentPage, filters);

  // Extraer filterData directamente del resultado de productos
  const { categories, subcategories, productNames } =
    productsData.filterData || {
      categories: [],
      subcategories: [],
      productNames: [],
    };

  const priceGroups = brand.attributes.pricegroups as PriceGroup[];

  // Preparar datos de filtros activos con traducciones
  const activeFiltersData = {
    category: filters.category,
    categoryEs: filters.category
      ? traducirCategoria(filters.category)
      : undefined,
    subcategory: filters.subcategory,
    subcategoryEs: filters.subcategory
      ? subcategories.find((s) => s.subcategory === filters.subcategory)
          ?.subcategoryEs || traducirSubcategoria(filters.subcategory)
      : undefined,
    productName: filters.productName,
  };

  // ⚡ OPTIMIZACIÓN: Prefetch inteligente de páginas adyacentes en background
  // Esto hace que navegar a la siguiente página sea instantáneo
  prefetchAdjacentPages(
    brandId,
    currentPage,
    productsData.meta.total_pages,
    filters
  );

  const hasNextPage = currentPage < productsData.meta.total_pages;
  const nextPage = currentPage + 1;
  const totalPages = productsData.meta.total_pages;

  // Si hay selección de producto Y NO hay filtros activos, obtenerlo para mostrar en la grilla
  const selectedProduct =
    shouldShowSelectedProduct && productId
      ? await getProductForGrid(productId)
      : null;

  // Productos para mostrar: el producto seleccionado o todos los productos
  const productsForGrid = selectedProduct
    ? [selectedProduct]
    : productsData.data;

  return (
    <>
      {/* <Head>
        <title>{brand.attributes.name} | AmPowerparts</title>
      </Head> */}
      <div className="min-h-screen bg-zinc-50">
        <div className="max-w-[110rem] mx-auto">
          {/* BrandSearchHandler solo maneja el search */}
          {/* <BrandSearchHandler brandId={parseInt(id)} /> */}

          {/* Resto del contenido de la página */}
          {/* Header */}
          <div className="mb-6">
            <Link
              href="/test-brands"
              className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-2 transition-colors"
            >
              ← Volver a todas las marcas
            </Link>
            <h1 className="text-3xl font-bold mt-2">{brand.attributes.name}</h1>
          </div>

          {/* Details Card */}
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            {/* Logo */}
            {brand.attributes.logo && (
              <div className="flex justify-center p-4 bg-zinc-50 rounded">
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

          {/* Products Section with Sidebar */}
          <div className="mt-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold">
                {selectedProduct ? "Producto encontrado" : "Productos"}
                {hasActiveFilters ? (
                  <span className="text-lg font-normal text-gray-600 ml-2">
                    ({productsData.meta.total_matches} coincidencias de{" "}
                    {productsData.meta.total_products} totales)
                  </span>
                ) : (
                  <span className="text-lg font-normal text-gray-600 ml-2">
                    ({selectedProduct ? "1" : productsData.meta.total_products}{" "}
                    productos)
                  </span>
                )}
              </h2>
              {/* Solo mostrar paginación si NO hay producto seleccionado */}
              {!selectedProduct && (
                <ProductPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  brandId={brandId}
                  brandSlug={brandSlug}
                />
              )}
            </div>

            {/* Indicador de filtros activos - solo si no hay producto seleccionado */}
            {!selectedProduct && (
              <ActiveFilters
                brandId={brandId}
                brandSlug={brandSlug}
                filters={activeFiltersData}
              />
            )}

            {/* Mobile Category Filter Button - solo si no hay producto seleccionado */}
            {!selectedProduct && (
              <MobileCategoryButton categories={categories} />
            )}

            {/* Layout: Sidebar + Products Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-8">
              {/* Sidebar - Hidden on mobile, visible on large screens */}
              <div className="hidden lg:block">
                <div className="sticky top-6">
                  <CategorySidebarAccordion
                    categories={categories}
                    subcategories={subcategories}
                    productNames={productNames}
                    brandId={brandId}
                    brandSlug={brandSlug}
                    activeFilters={filters}
                  />
                </div>
              </div>

              {/* Products Grid con carga ultra-progresiva */}
              <div>
                {/* Si hay producto seleccionado, usar SelectedProductView */}
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
                      products={productsForGrid}
                      brandId={brandId}
                      brandSlug={brandSlug}
                      currentPage={currentPage}
                      totalPages={1}
                      selectedProduct={selectedProduct}
                    />
                  </Suspense>
                ) : (
                  /* Si no hay producto seleccionado, mostrar grilla normal */
                  <Suspense
                    fallback={
                      <ProductGridInstant
                        products={productsForGrid}
                        brandId={brandId}
                        brandSlug={brandSlug}
                        currentPage={currentPage}
                        totalPages={productsData.meta.total_pages}
                      />
                    }
                  >
                    <ProductsWithData
                      products={productsForGrid}
                      brandId={brandId}
                      brandSlug={brandSlug}
                      currentPage={currentPage}
                      totalPages={productsData.meta.total_pages}
                      selectedProduct={null}
                    />
                  </Suspense>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ⚡ PREFETCH: Cargar siguiente página en background */}
        {hasNextPage && (
          <Link
            href={`/brands/${brandSlug}?page=${nextPage}`}
            prefetch={true}
            className="hidden"
            aria-hidden="true"
          >
            Prefetch página {nextPage}
          </Link>
        )}
      </div>
    </>
  );
}

// Force dynamic rendering (no static generation)
export const dynamic = "force-dynamic";
export const revalidate = false; // Immutable cache
