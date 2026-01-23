"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { traducirCategoria, traducirSubcategoria } from "@/constants/categorias";

interface BrandCategory {
  category: string;
  categoryEs: string;
}

interface BrandSubcategory {
  subcategory: string;
  subcategoryEs: string;
}

interface BrandProductName {
  productName: string;
}

interface ProductFilters {
  category?: string;
  subcategory?: string;
  productName?: string;
}

interface CategorySidebarAccordionProps {
  categories: BrandCategory[];
  subcategories: BrandSubcategory[];
  productNames: BrandProductName[];
  brandId?: number;
  brandSlug?: string;
  categorySlug?: string;
  brands?: Array<{ id: string; name: string; slug: string; logo: string | null }>;
  activeFilters: ProductFilters;
}

// Icono de filtro
function FilterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}

// Icono de cerrar
function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

// Icono de chevron
function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

/**
 * ⚡ SIDEBAR ACCORDION INTERACTIVO: Filtros con navegación
 * - xl+: Sidebar visible con accordion normal
 * - < xl: Sidebar collapsible, solo visible cuando se abre
 * - Click en categoría/subcategoría/productName actualiza URL
 * - Resalta filtro activo
 */
export function CategorySidebarAccordion({
  categories,
  subcategories,
  productNames,
  brandId,
  brandSlug,
  categorySlug,
  brands,
  activeFilters,
}: CategorySidebarAccordionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [navigating, setNavigating] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Resetear estado de navegación cuando cambian los filtros
  useEffect(() => {
    setNavigating(false);
    setIsMobileOpen(false); // Cerrar sidebar móvil al aplicar filtro
  }, [activeFilters]);

  // Determinar URL base según si es categoría o marca
  const getBaseUrl = () => {
    if (categorySlug) return `/categories/${categorySlug}`;
    if (brandSlug) return `/marca/${brandSlug}`;
    return "/";
  };

  // Construir URL con filtro actualizado
  const buildFilterUrl = (
    filterType: "category" | "subcategory" | "productName",
    value: string
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(filterType, encodeURIComponent(value));
    params.set("page", "1"); // Reset a página 1
    return `${getBaseUrl()}?${params.toString()}`;
  };

  const handleFilterClick = (
    filterType: "category" | "subcategory" | "productName",
    value: string
  ) => {
    setNavigating(true);
    startTransition(() => {
      router.push(buildFilterUrl(filterType, value));
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isFilterActive = (
    filterType: "category" | "subcategory" | "productName",
    value: string
  ) => {
    return activeFilters[filterType] === value;
  };

  const isLoading = isPending || navigating;

  // Render lista de categorías
  const renderCategoryList = () => (
    <ul className="space-y-1 max-h-[300px] overflow-y-auto">
      {categories.length > 0 ? (
        categories.map(({ category, categoryEs }) => {
          const isActive = isFilterActive("category", category);
          const traduccion = categoryEs?.trim() || traducirCategoria(category);
          return (
            <li key={category}>
              <button
                onClick={() => !isLoading && handleFilterClick("category", category)}
                disabled={isLoading}
                className={`
                  w-full px-4 py-2.5 text-left text-sm font-medium
                  transition-all rounded-md truncate flex items-center gap-2
                  ${
                    isLoading
                      ? "cursor-not-allowed opacity-60"
                      : isActive
                      ? "bg-indigo-600 text-white"
                      : "text-indigo-800 hover:bg-white/60"
                  }
                `}
              >
                {isLoading && (
                  <svg className="animate-spin h-3 w-3 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                <span className="truncate">{traduccion}</span>
                <span className={`text-xs ${isActive ? "text-indigo-200" : "text-indigo-400/80"} shrink-0`}>
                  ({category})
                </span>
                {isActive && <span className="ml-auto">✓</span>}
              </button>
            </li>
          );
        })
      ) : (
        <li className="px-4 py-4 text-center text-sm text-indigo-500">Sin categorías</li>
      )}
    </ul>
  );

  // Render lista de subcategorías
  const renderSubcategoryList = () => (
    <ul className="space-y-1 max-h-[300px] overflow-y-auto">
      {subcategories.length > 0 ? (
        subcategories.map(({ subcategory, subcategoryEs }) => {
          const isActive = isFilterActive("subcategory", subcategory);
          const traduccion = subcategoryEs?.trim() || traducirSubcategoria(subcategory);
          return (
            <li key={subcategory}>
              <button
                onClick={() => !isLoading && handleFilterClick("subcategory", subcategory)}
                disabled={isLoading}
                className={`
                  w-full px-4 py-2.5 text-left text-sm font-medium
                  transition-all rounded-md truncate flex items-center gap-2
                  ${
                    isLoading
                      ? "cursor-not-allowed opacity-60"
                      : isActive
                      ? "bg-purple-600 text-white"
                      : "text-purple-800 hover:bg-white/60"
                  }
                `}
              >
                {isLoading && (
                  <svg className="animate-spin h-3 w-3 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                <span className="truncate">{traduccion}</span>
                <span className={`text-xs ${isActive ? "text-purple-200" : "text-purple-400/80"} shrink-0`}>
                  ({subcategory})
                </span>
                {isActive && <span className="ml-auto">✓</span>}
              </button>
            </li>
          );
        })
      ) : (
        <li className="px-4 py-4 text-center text-sm text-purple-500">Sin subcategorías</li>
      )}
    </ul>
  );

  // Render lista de productos
  const renderProductList = () => (
    <ul className="space-y-1 max-h-[300px] overflow-y-auto">
      {productNames.length > 0 ? (
        productNames.map(({ productName }) => {
          const isActive = isFilterActive("productName", productName);
          return (
            <li key={productName}>
              <button
                onClick={() => !isLoading && handleFilterClick("productName", productName)}
                disabled={isLoading}
                className={`
                  w-full px-4 py-2.5 text-left text-sm font-medium
                  transition-all rounded-md truncate flex items-center gap-2
                  ${
                    isLoading
                      ? "cursor-not-allowed opacity-60"
                      : isActive
                      ? "bg-pink-600 text-white"
                      : "text-pink-800 hover:bg-white/60"
                  }
                `}
                title={productName}
              >
                {isLoading && (
                  <svg className="animate-spin h-3 w-3 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                <span className="truncate">{productName}</span>
                {isActive && <span className="ml-auto">✓</span>}
              </button>
            </li>
          );
        })
      ) : (
        <li className="px-4 py-4 text-center text-sm text-pink-500">Sin productos</li>
      )}
    </ul>
  );

  // Contenido del sidebar (para desktop)
  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header del sidebar */}
      <div className="flex items-center justify-between p-4 border-b border-indigo-200 bg-gradient-to-r from-indigo-100 to-purple-100">
        <h3 className="font-semibold text-indigo-900">Filtrar por</h3>
        <button
          onClick={() => setIsMobileOpen(false)}
          className="xl:hidden p-1 hover:bg-white/50 rounded-md"
        >
          <CloseIcon className="h-5 w-5 text-indigo-600" />
        </button>
      </div>

      {/* Accordion */}
      <div className="flex-1 overflow-y-auto">
        <Accordion type="single" collapsible defaultValue="categories" className="w-full">
          <AccordionItem value="categories" className="border-b border-indigo-100">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-white/50 text-indigo-900 font-medium">
              <div className="flex items-center gap-2">
                Categorías
                <span className="text-sm text-indigo-600">({categories.length})</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-2 pb-2">
              {renderCategoryList()}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="subcategories" className="border-b border-indigo-100">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-white/50 text-indigo-900 font-medium">
              <div className="flex items-center gap-2">
                Subcategorías
                <span className="text-sm text-indigo-600">({subcategories.length})</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-2 pb-2">
              {renderSubcategoryList()}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="productNames">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-white/50 text-indigo-900 font-medium">
              <div className="flex items-center gap-2">
                Productos
                <span className="text-sm text-indigo-600">({productNames.length})</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-2 pb-2">
              {renderProductList()}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-indigo-200 bg-indigo-50">
        <p className="text-xs text-center text-indigo-600">
          {categories.length} cats • {subcategories.length} subcats
        </p>
      </div>
    </div>
  );

  // Botón para abrir drawer en móvil
  const mobileButton = (
    <button
      onClick={() => setIsMobileOpen(true)}
      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors w-full justify-center"
    >
      <FilterIcon className="h-4 w-4" />
      <span className="text-sm font-medium">Filtros</span>
    </button>
  );

  return (
    <>
      {/* < xl: Botón para abrir filtros */}
      <div className="xl:hidden">
        {mobileButton}

        {/* Drawer overlay - visible cuando isMobileOpen es true */}
        {isMobileOpen && (
          <div className="fixed inset-0 z-50">
            {/* Overlay oscuro */}
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setIsMobileOpen(false)}
            />
            {/* Drawer desde la izquierda */}
            <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-xl overflow-hidden">
              {sidebarContent}
            </div>
          </div>
        )}
      </div>

      {/* xl+: Sidebar sticky */}
      <div className="hidden xl:block sticky top-6 w-full">
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl shadow-lg border-2 border-indigo-200 overflow-hidden">
          {sidebarContent}
        </div>
      </div>
    </>
  );
}
