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

interface MobileFilterButtonProps {
  categories: BrandCategory[];
  subcategories: BrandSubcategory[];
  productNames: BrandProductName[];
  brandId: number;
  brandSlug: string;
  activeFilters: ProductFilters;
}

// Iconos
function FilterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

/**
 * Botón de filtros para móvil + Drawer
 * - Muestra botón "Filtros"
 * - Al hacer click, abre drawer desde la izquierda
 */
export function MobileFilterButton({
  categories,
  subcategories,
  productNames,
  brandId,
  brandSlug,
  activeFilters,
}: MobileFilterButtonProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [navigating, setNavigating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setNavigating(false);
    setIsOpen(false);
  }, [activeFilters]);

  const buildFilterUrl = (
    filterType: "category" | "subcategory" | "productName",
    value: string
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(filterType, encodeURIComponent(value));
    params.set("page", "1");
    return `/brands/${brandSlug}?${params.toString()}`;
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

  const renderList = (
    items: { category?: string; subcategory?: string; productName?: string; categoryEs?: string; subcategoryEs?: string }[],
    filterType: "category" | "subcategory" | "productName",
    getCount: (item: { category?: string; subcategory?: string; productName?: string }) => string,
    colorClass: string
  ) => (
    <ul className="space-y-1 max-h-[300px] overflow-y-auto">
      {items.length > 0 ? (
        items.map((item) => {
          const value = item.category || item.subcategory || item.productName || "";
          const esName = item.categoryEs || item.subcategoryEs || "";
          const isActive = isFilterActive(filterType, value);
          const label = filterType === "category"
            ? (esName?.trim() || traducirCategoria(value))
            : filterType === "subcategory"
            ? (esName?.trim() || traducirSubcategoria(value))
            : value;

          return (
            <li key={value}>
              <button
                onClick={() => !isLoading && handleFilterClick(filterType, value)}
                disabled={isLoading}
                className={`
                  w-full px-4 py-2.5 text-left text-sm font-medium
                  transition-all rounded-md truncate flex items-center gap-2
                  ${isLoading ? "cursor-not-allowed opacity-60" : isActive ? colorClass : "text-gray-700 hover:bg-gray-100"}
                `}
              >
                {isLoading && (
                  <svg className="animate-spin h-3 w-3 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                <span className="truncate">{label}</span>
                <span className={`text-xs ${isActive ? "text-white/70" : "text-gray-400"} shrink-0`}>
                  ({getCount(item)})
                </span>
                {isActive && <span className="ml-auto">✓</span>}
              </button>
            </li>
          );
        })
      ) : (
        <li className="px-4 py-4 text-center text-sm text-gray-500">Sin opciones</li>
      )}
    </ul>
  );

  return (
    <>
      {/* Botón para abrir filtros */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors w-1/2"
      >
        <FilterIcon className="h-4 w-4" />
        <span className="text-sm font-medium">Filtros</span>
      </button>

      {/* Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">
              <h3 className="font-semibold text-gray-900">Filtrar por</h3>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-200 rounded-md">
                <CloseIcon className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Accordion */}
            <div className="flex-1 overflow-y-auto">
              <Accordion type="single" collapsible defaultValue="categories" className="w-full">
                <AccordionItem value="categories" className="border-b">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-50">
                    Categorías ({categories.length})
                  </AccordionTrigger>
                  <AccordionContent className="px-2 pb-2">
                    {renderList(categories, "category", (i) => i.category || "", "bg-indigo-600 text-white")}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="subcategories" className="border-b">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-50">
                    Subcategorías ({subcategories.length})
                  </AccordionTrigger>
                  <AccordionContent className="px-2 pb-2">
                    {renderList(subcategories, "subcategory", (i) => i.subcategory || "", "bg-purple-600 text-white")}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="productNames">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-50">
                    Productos ({productNames.length})
                  </AccordionTrigger>
                  <AccordionContent className="px-2 pb-2">
                    {renderList(productNames, "productName", () => "", "bg-pink-600 text-white")}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Footer */}
            <div className="p-3 border-t bg-gray-50">
              <p className="text-xs text-center text-gray-500">
                {categories.length} cats • {subcategories.length} subcats
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
