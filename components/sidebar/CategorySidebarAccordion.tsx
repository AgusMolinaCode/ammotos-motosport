"use client";

import { useRouter, useSearchParams } from "next/navigation";
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
  brandId: number;
  activeFilters: ProductFilters;
}

/**
 * ⚡ SIDEBAR ACCORDION INTERACTIVO: Filtros con navegación
 * - Click en categoría/subcategoría/productName actualiza URL
 * - Resalta filtro activo
 * - Botón limpiar filtros
 */
export function CategorySidebarAccordion({
  categories,
  subcategories,
  productNames,
  brandId,
  activeFilters,
}: CategorySidebarAccordionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Construir URL con filtro actualizado
  const buildFilterUrl = (
    filterType: "category" | "subcategory" | "productName",
    value: string
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(filterType, encodeURIComponent(value));
    params.set("page", "1"); // Reset a página 1
    return `/brands/${brandId}?${params.toString()}`;
  };

  const handleFilterClick = (
    filterType: "category" | "subcategory" | "productName",
    value: string
  ) => {
    // Aplicar el filtro (sin toggle, para desactivar usar la X en filtros activos)
    router.push(buildFilterUrl(filterType, value));
  };

  const isFilterActive = (
    filterType: "category" | "subcategory" | "productName",
    value: string
  ) => {
    return activeFilters[filterType] === value;
  };

  return (
    <aside className="w-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl shadow-lg border-2 border-indigo-200">
      <Accordion
        type="single"
        collapsible
        className="w-full"
        defaultValue="categories"
      >
        {/* Categorías - Abierto por defecto */}
        <AccordionItem value="categories">
          <AccordionTrigger className="px-6 py-4 text-lg font-semibold text-indigo-900 hover:no-underline hover:bg-white/50 rounded-t-xl flex-col items-start">
            <div className="flex items-center gap-2">
              Categorías
              <span className="text-base text-indigo-600 font-medium">
                ({categories.length})
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            {categories.length > 0 ? (
              <ul className="space-y-2 max-h-[500px] overflow-y-auto px-2 pb-4">
                {categories.map(({ category, categoryEs }) => {
                  const isActive = isFilterActive("category", category);
                  return (
                    <li key={category}>
                      <button
                        onClick={() => handleFilterClick("category", category)}
                        className={`
                          w-full px-5 py-3.5 text-left text-base font-medium
                          transition-all rounded-lg shadow-sm hover:shadow-md flex items-center gap-2 cursor-pointer
                          ${
                            isActive
                              ? "bg-indigo-600 text-white"
                              : "text-indigo-800 hover:bg-white/70 hover:text-indigo-950"
                          }
                        `}
                      >
                        <span>{categoryEs}</span>
                        <span
                          className={`text-xs ${
                            isActive ? "text-indigo-200" : "text-indigo-500/80"
                          } flex`}
                        >
                          ({category})
                        </span>
                        {isActive && <span className="ml-auto">✓</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="px-6 py-8 text-center">
                <p className="text-base text-indigo-600 font-medium">
                  No hay categorías disponibles
                </p>
                <p className="text-sm text-indigo-400 mt-2">
                  Las categorías aparecerán después de cargar productos
                </p>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Subcategorías - Cerrado por defecto */}
        <AccordionItem value="subcategories">
          <AccordionTrigger className="px-6 py-4 text-lg font-semibold text-indigo-900 hover:no-underline hover:bg-white/50 flex-col items-start">
            <div className="flex items-center gap-2">
              Subcategorías
              <span className="text-base text-indigo-600 font-medium">
                ({subcategories.length})
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            {subcategories.length > 0 ? (
              <ul className="space-y-2 max-h-[500px] overflow-y-auto px-2 pb-4">
                {subcategories.map(({ subcategory, subcategoryEs }) => {
                  const isActive = isFilterActive("subcategory", subcategory);
                  return (
                    <li key={subcategory}>
                      <button
                        onClick={() =>
                          handleFilterClick("subcategory", subcategory)
                        }
                        className={`
                          w-full px-5 py-3.5 text-left text-base font-medium
                          transition-all rounded-lg shadow-sm hover:shadow-md flex items-center gap-2 cursor-pointer
                          ${
                            isActive
                              ? "bg-purple-600 text-white"
                              : "text-purple-800 hover:bg-white/70 hover:text-purple-950"
                          }
                        `}
                      >
                        <span>{subcategoryEs}</span>
                        <span
                          className={`text-xs ${
                            isActive ? "text-purple-200" : "text-purple-500/80"
                          } flex`}
                        >
                          ({subcategory})
                        </span>
                        {isActive && <span className="ml-auto">✓</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="px-6 py-8 text-center">
                <p className="text-base text-purple-600 font-medium">
                  No hay subcategorías disponibles
                </p>
                <p className="text-sm text-purple-400 mt-2">
                  Las subcategorías aparecerán después de cargar productos
                </p>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Product Names - Cerrado por defecto */}
        <AccordionItem value="productNames">
          <AccordionTrigger className="px-6 py-4 text-lg font-semibold text-indigo-900 hover:no-underline hover:bg-white/50 rounded-b-xl flex-col items-start">
            <div className="flex items-center gap-2">
              Productos
              <span className="text-base text-indigo-600 font-medium">
                ({productNames.length})
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            {productNames.length > 0 ? (
              <ul className="space-y-2 max-h-[500px] overflow-y-auto px-2 pb-4">
                {productNames.map(({ productName }) => {
                  const isActive = isFilterActive("productName", productName);
                  return (
                    <li key={productName}>
                      <button
                        onClick={() =>
                          handleFilterClick("productName", productName)
                        }
                        className={`
                          w-full px-5 py-3.5 text-left text-base font-medium
                          transition-all rounded-lg shadow-sm hover:shadow-md truncate flex items-center gap-2 cursor-pointer
                          ${
                            isActive
                              ? "bg-pink-600 text-white"
                              : "text-pink-800 hover:bg-white/70 hover:text-pink-950"
                          }
                        `}
                        title={productName}
                      >
                        <span className="truncate">{productName}</span>
                        {isActive && <span className="ml-auto">✓</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="px-6 py-8 text-center">
                <p className="text-base text-pink-600 font-medium">
                  No hay productos disponibles
                </p>
                <p className="text-sm text-pink-400 mt-2">
                  Los productos aparecerán después de cargar datos
                </p>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Footer Info */}
      <div className="p-5 bg-gradient-to-r from-indigo-100 to-purple-100 border-t-2 border-indigo-200 rounded-b-xl">
        <p className="text-sm text-indigo-700 font-medium text-center">
          Total: {categories.length} categorías, {subcategories.length}{" "}
          subcategorías, {productNames.length} productos
        </p>
        <p className="text-sm text-indigo-500 text-center mt-2">
          Click para filtrar productos por categoría, subcategoría o nombre
        </p>
      </div>
    </aside>
  );
}
