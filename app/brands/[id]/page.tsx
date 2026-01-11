import { getBrandById } from "@/application/actions/brands";
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

export default async function BrandDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    page?: string;
    category?: string;
    subcategory?: string;
    productName?: string;
    productId?: string;
  }>;
}) {
  const { id } = await params;
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

  // ⚡ OPTIMIZACIÓN: Paralelizar llamadas independientes
  // Solo cargamos Brand y Productos primero (datos esenciales)
  // Precios e Inventario se cargan después con Suspense (carga diferida)
  // Las categorías, subcategorías y productNames vienen directamente del resultado de getProductsByBrand
  const [brandData, productsData] = await Promise.all([
    getBrandById(id),
    getProductsByBrand(parseInt(id), currentPage, filters),
  ]);

  // Extraer filterData directamente del resultado de productos
  const { categories, subcategories, productNames } =
    productsData.filterData || {
      categories: [],
      subcategories: [],
      productNames: [],
    };

  const brand = brandData.data;
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
    parseInt(id),
    currentPage,
    productsData.meta.total_pages,
    filters
  );

  const hasProductSelection = !!productId;
  const hasNextPage = currentPage < productsData.meta.total_pages;
  const nextPage = currentPage + 1;
  const totalPages = productsData.meta.total_pages;

  // Si hay selección de producto, obtenerlo para mostrar en la grilla
  const selectedProduct = hasProductSelection && productId ? await getProductForGrid(productId) : null;

  // Productos para mostrar: el producto seleccionado o todos los productos
  const productsForGrid = selectedProduct ? [selectedProduct] : productsData.data;

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-[110rem] mx-auto p-8">
        {/* BrandSearchHandler solo maneja el search */}
        <BrandSearchHandler brandId={parseInt(id)} />

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
                  ({selectedProduct ? "1" : productsData.meta.total_products} productos)
                </span>
              )}
            </h2>
            {/* Solo mostrar paginación si NO hay producto seleccionado */}
            {!selectedProduct && (
              <ProductPagination
                currentPage={currentPage}
                totalPages={totalPages}
                brandId={parseInt(brand.id)}
              />
            )}
          </div>

          {/* Indicador de filtros activos - solo si no hay producto seleccionado */}
          {!selectedProduct && (
            <ActiveFilters brandId={parseInt(id)} filters={activeFiltersData} />
          )}

          {/* Mobile Category Filter Button - solo si no hay producto seleccionado */}
          {!selectedProduct && (
            <MobileCategoryButton categories={categories} />
          )}

          {/* Layout: Sidebar + Products Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-8">
            {/* Sidebar - Hidden on mobile, visible on large screens - solo si no hay producto seleccionado */}
            {!selectedProduct && (
              <div className="hidden lg:block">
                <div className="sticky top-6">
                  <CategorySidebarAccordion
                    categories={categories}
                    subcategories={subcategories}
                    productNames={productNames}
                    brandId={parseInt(id)}
                    activeFilters={filters}
                  />
                </div>
              </div>
            )}

            {/* Products Grid con carga ultra-progresiva */}
            <div>
              <Suspense
                fallback={
                  <ProductGridInstant
                    products={productsForGrid}
                    brandId={parseInt(id)}
                    currentPage={currentPage}
                    totalPages={selectedProduct ? 1 : productsData.meta.total_pages}
                  />
                }
              >
                <ProductsWithData
                  products={productsForGrid}
                  brandId={parseInt(id)}
                  currentPage={currentPage}
                  totalPages={selectedProduct ? 1 : productsData.meta.total_pages}
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
