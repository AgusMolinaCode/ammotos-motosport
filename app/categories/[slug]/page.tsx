import { getProductsByCategoryFromDB } from "@/application/actions/products";
import type { ProductFilters } from "@/infrastructure/services/ProductsSyncService";
import Link from "next/link";
import { Suspense } from "react";
import { InfoItem } from "@/components/brand-details/InfoItem";
import { ProductGridInstant } from "@/components/products/ProductGridInstant";
import { ProductsWithData } from "@/components/products/ProductsWithData";
import { SelectedProductView } from "@/components/products/SelectedProductView";
import { HideOutOfStockSwitch } from "@/components/products/StockFilterSwitch";
import { CategorySidebarAccordion } from "@/components/sidebar/CategorySidebarAccordion";
import { MobileFilterButton } from "@/components/sidebar/MobileFilterButton";
import { ActiveFilters } from "@/components/filters/ActiveFilters";
import { ProductPagination } from "@/components/products/ProductPagination";
import { CategoryBrandSelect } from "@/components/categories/CategoryBrandSelect";
import {
  traducirCategoria,
  traducirSubcategoria,
} from "@/constants/categorias";
import { extractProductId } from "@/lib/utils";
import { prisma } from "@/infrastructure/database/prisma";

interface BrandInfo {
  id: string;
  name: string;
  slug: string | null;
  logo: string | null;
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    page?: string;
    subcategory?: string;
    productName?: string;
    productId?: string;
    hideOutOfStock?: string;
    brandId?: string;
  }>;
}) {
  const { slug } = await params;
  const {
    page: pageParam,
    subcategory,
    productName,
    productId: rawProductId,
    hideOutOfStock: hideOutOfStockParam,
    brandId,
  } = await searchParams;

  // El slug es el nombre de la categoría en inglés (con guiones o %20 para espacios)
  // Convertir slug a categoría: "engine-components" o "Engine%20Components" -> "Engine Components"
  const decodedSlug = decodeURIComponent(slug);
  const category = decodedSlug
    .split(/[-_\s%20]+/) // Separar por guiones, guiones bajos, espacios o %20
    .filter(Boolean) // Eliminar strings vacíos
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  const currentPage = pageParam ? Math.max(1, parseInt(pageParam)) : 1;
  const hideOutOfStock = hideOutOfStockParam === "true";

  // Verificar si hay filtro de marca (productName con prefijo [BRAND_FILTER])
  const rawProductName = productName;
  let brandNameFilter: string | undefined;
  let actualProductNameFilter: string | undefined;

  if (productName && productName.startsWith("[BRAND_FILTER]")) {
    brandNameFilter = productName.replace("[BRAND_FILTER]", "");
  } else {
    actualProductNameFilter = productName;
  }

  // Construir filtros
  const filters: ProductFilters = {};
  if (subcategory) filters.subcategory = decodeURIComponent(subcategory);
  if (actualProductNameFilter) filters.productName = decodeURIComponent(actualProductNameFilter);

  const hasActiveFilters = !!(subcategory || productName || brandNameFilter);
  const hasProductSelection = !!rawProductId;
  const productId = rawProductId ? extractProductId(rawProductId) : undefined;

  // Solo mostrar producto encontrado si NO hay filtros activos pero SÍ hay productId
  const shouldShowSelectedProduct = hasProductSelection && !hasActiveFilters;

  // Verificar que la categoría existe en nuestro diccionario
  const categoryEs = traducirCategoria(category);
  const isValidCategory = categoryEs !== category || Object.keys({
    "Air Filters": "Filtros de Aire",
    "Air Intake Systems": "Sistemas de Admisión de Aire",
    "Apparel": "Indumentaria",
    "Audio, Video & Radios": "Audio, Video y Radios",
    "Bags & Packs": "Bolsas y Mochilas",
    "Batteries, Starting & Charging": "Baterías, Arranque y Carga",
    "Body": "Carrocería",
    "Body Armor & Protection": "Protección y Blindaje",
    "Brakes, Rotors & Pads": "Frenos, Discos y Pastillas",
    "Bumpers": "Paragolpes",
    "Bumpers, Grilles & Guards": "Paragolpes, Parrillas y Protectores",
    "Controls": "Controles",
    "Cooling": "Refrigeración",
    "Data Acquisition": "Adquisición de Datos",
    "Deflectors": "Deflectores",
    "Drivetrain": "Transmisión",
    "Engine Components": "Componentes del Motor",
    "Exhaust, Mufflers & Tips": "Escape, Silenciadores y Puntas",
    "Exterior Styling": "Estilo Exterior",
    "Fabrication": "Fabricación",
    "Fender Flares & Trim": "Extensiones de Guardabarros",
    "Floor Mats": "Alfombrillas",
    "Forced Induction": "Inducción Forzada",
    "Fuel Delivery": "Sistema de Combustible",
    "Gauges & Pods": "Medidores e Indicadores",
    "Grille Guards & Bull Bars": "Protectores de Parrilla",
    "Ignition": "Encendido",
    "Implements": "Implementos",
    "Interior Accessories": "Accesorios de Interior",
    "Lights": "Luces",
    "Marketing": "Marketing",
    "Misc Powersports": "Powersports Varios",
    "Nerf Bars & Running Boards": "Estribos y Pisaderas",
    "Oils & Oil Filters": "Aceites y Filtros de Aceite",
    "Programmers & Chips": "Programadores y Chips",
    "Roof Racks & Truck Racks": "Portaequipajes",
    "Roofs & Roof Accessories": "Techos y Accesorios",
    "Safety": "Seguridad",
    "Scratch & Dent": "Rayado y Abollado",
    "Seats": "Asientos",
    "Services": "Servicios",
    "Suspension": "Suspensión",
    "Tires": "Neumáticos",
    "Tonneau Covers": "Cubiertas de Caja",
    "Tools": "Herramientas",
    "Transport": "Transporte",
    "Truck Bed Accessories": "Accesorios para Caja de Camioneta",
    "Uncategorized": "Sin Categoría",
    "Wheel and Tire Accessories": "Accesorios para Ruedas y Neumáticos",
    "Wheels": "Ruedas",
    "Winches & Hitches": "Cabrestantes y Enganches",
    "Windshields": "Parabrisas",
  }).includes(category);

  // Obtener productos de la categoría
  const productsData = await getProductsByCategoryFromDB(
    category,
    currentPage,
    subcategory,
    hideOutOfStock,
    brandNameFilter
  );

  // Obtener marcas únicas para esta categoría
  // Escapar category para usar en SQL
  // IMPORTANTE: Brand.id es String y Product.brandId es Int, necesitamos castear
  const escapeSql = (str: string) => str.replace(/'/g, "''");
  const brandsRaw = await prisma.$queryRawUnsafe(
    `SELECT DISTINCT b.id, b.name, b.slug, b.logo
    FROM "brands" b
    INNER JOIN "products" p ON b.id::integer = p."brandId"
    WHERE p."category" = '${escapeSql(category)}'
    ORDER BY b.name ASC`
  );

  const brands = (brandsRaw as BrandInfo[]).map((b) => ({
    id: b.id,
    name: b.name,
    slug: b.slug || b.id,
    logo: b.logo,
  }));

  // Extraer filterData
  const { categories, subcategories, productNames } =
    productsData.filterData || {
      categories: [],
      subcategories: [],
      productNames: [],
    };

  // Preparar datos de filtros activos
  const activeFiltersData = {
    category: category,
    categoryEs: categoryEs,
    subcategory: filters.subcategory,
    subcategoryEs: filters.subcategory
      ? traducirSubcategoria(filters.subcategory)
      : undefined,
    productName: filters.productName,
    brandName: brandNameFilter,
  };

  const hasNextPage = currentPage < productsData.meta.total_pages;
  const nextPage = currentPage + 1;
  const totalPages = productsData.meta.total_pages;

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-[110rem] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-2 transition-colors"
          >
            ← Volver al inicio
          </Link>

          <div className="flex justify-start items-center my-2 lg:my-6">
            <h1 className="text-3xl font-bold mt-2">{categoryEs}</h1>
          </div>

          {/* Información de la categoría */}
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-6">
            <div className="flex flex-wrap gap-4">
              <InfoItem
                label="Categoría"
                value={category}
              />
              <InfoItem
                label="Total productos"
                value={(productsData.meta.total_products ?? 0).toLocaleString()}
              />
                <InfoItem
                  label="Marcas disponibles"
                  value={brands.length.toString()}
                />
              <div className="">
                <Suspense fallback={<div className="h-10 bg-gray-100 animate-pulse rounded mt-1" />}>
                  <CategoryBrandSelect
                    brands={brands}
                    categorySlug={slug}
                  />
                </Suspense>
              </div>
            </div>
          </div>
        </div>

        {/* Products Section with Sidebar */}
        <div className="mt-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex justify-start items-center gap-4">
              <h2 className="text-2xl font-bold">
                {shouldShowSelectedProduct ? "Producto encontrado" : "Productos"}
                {hasActiveFilters ? (
                  <span className="text-lg font-normal text-gray-600 ml-2">
                    ({productsData.meta.total_matches} coincidencias de{" "}
                    {(productsData.meta.total_products ?? 0)} totales)
                  </span>
                ) : (
                  <span className="text-lg font-normal text-gray-600 ml-2">
                    (
                    {shouldShowSelectedProduct ? "1" : productsData.meta.total_products ?? 0}{" "}
                    productos)
                  </span>
                )}
              </h2>
              <div>
                {!shouldShowSelectedProduct && (
                  <Suspense fallback={<div className="h-10" />}>
                    <HideOutOfStockSwitch
                      brandId={0}
                      brandSlug=""
                      categorySlug={slug}
                    />
                  </Suspense>
                )}
              </div>
            </div>

            {!shouldShowSelectedProduct && (
              <ProductPagination
                currentPage={currentPage}
                totalPages={totalPages}
                categorySlug={slug}
              />
            )}
          </div>

          {/* Indicador de filtros activos */}
          {!shouldShowSelectedProduct && (
            <ActiveFilters
              categorySlug={slug}
              filters={activeFiltersData}
            />
          )}

          {/* Layout: Sidebar + Products Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-6 xl:gap-8">
            {/* Sidebar - Solo visible en xl+ (desktop) */}
            <div className="hidden xl:block xl:col-span-1">
              <div className="xl:sticky xl:top-6">
                <CategorySidebarAccordion
                  categories={categories}
                  subcategories={subcategories}
                  productNames={productNames}
                  categorySlug={slug}
                  brands={brands}
                  activeFilters={filters}
                />
              </div>
            </div>

            {/* Products Grid */}
            <div className="xl:col-span-1">
              {/* Botón filtros móvil - visible solo en < xl */}
              <div className="xl:hidden mb-4">
                <MobileFilterButton
                  categories={categories}
                  subcategories={subcategories}
                  productNames={productNames}
                  categorySlug={slug}
                  brands={brands}
                  activeFilters={filters}
                />
              </div>

              {/* Si hay producto seleccionado, usar SelectedProductView */}
              {shouldShowSelectedProduct && productId ? (
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
                    products={productsData.data}
                    categorySlug={slug}
                    currentPage={1}
                    totalPages={1}
                    selectedProductId={productId}
                    hideOutOfStock={hideOutOfStock}
                  />
                </Suspense>
              ) : (
                <Suspense
                  fallback={
                    <ProductGridInstant
                      products={productsData.data}
                      categorySlug={slug}
                      currentPage={currentPage}
                      totalPages={productsData.meta.total_pages}
                      hideOutOfStock={hideOutOfStock}
                    />
                  }
                >
                  <ProductsWithData
                    products={productsData.data}
                    categorySlug={slug}
                    currentPage={currentPage}
                    totalPages={productsData.meta.total_pages}
                    selectedProductId={null}
                    hideOutOfStock={hideOutOfStock}
                  />
                </Suspense>
              )}
            </div>
          </div>
        </div>

        {/* Prefetch siguiente página */}
        {hasNextPage && (
          <Link
            href={`/categories/${slug}?page=${nextPage}`}
            prefetch={true}
            className="hidden"
            aria-hidden="true"
          >
            Prefetch página {nextPage}
          </Link>
        )}
      </div>
    </div>
  );
}

// Force dynamic rendering
export const dynamic = "force-dynamic";
export const revalidate = false;
