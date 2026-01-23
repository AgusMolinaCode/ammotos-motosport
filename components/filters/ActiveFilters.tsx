"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { traducirCategoria } from "@/constants/categorias";

interface ActiveFiltersProps {
  brandId?: number;
  brandSlug?: string;
  categorySlug?: string;
  filters: {
    category?: string;
    categoryEs?: string;
    subcategory?: string;
    subcategoryEs?: string;
    productName?: string;
    brandName?: string;
  };
}

export function ActiveFilters({ brandId, brandSlug, categorySlug, filters }: ActiveFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const hasFilters = !!(filters.category || filters.subcategory || filters.productName || filters.brandName);

  if (!hasFilters) return null;

  // Determinar URL base
  const getBaseUrl = () => {
    if (categorySlug) return `/categories/${categorySlug}`;
    if (brandSlug) return `/marca/${brandSlug}`;
    return "/";
  };

  const removeFilter = (filterType: "category" | "subcategory" | "productName" | "brandName" | "brandId") => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(filterType);
    params.set("page", "1"); // Reset a página 1
    router.push(`${getBaseUrl()}?${params.toString()}`);
  };

  const clearAllFilters = () => {
    router.push(getBaseUrl());
  };

  return (
    <div className="mt-4 flex items-center gap-2 flex-wrap my-2">
      <span className="font-semibold text-gray-700">Filtros activos:</span>

      {/* Categoría */}
      {filters.category && (
        <button
          onClick={() => removeFilter("category")}
          className="group px-3 py-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 rounded-full text-sm font-medium transition-colors flex items-center gap-2"
        >
          <span>{filters.categoryEs || traducirCategoria(filters.category)}</span>
          <span className="text-indigo-600 group-hover:text-indigo-900 font-bold">×</span>
        </button>
      )}

      {/* Subcategoría */}
      {filters.subcategory && (
        <button
          onClick={() => removeFilter("subcategory")}
          className="group px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-800 rounded-full text-sm font-medium transition-colors flex items-center gap-2"
        >
          <span>{filters.subcategoryEs || filters.subcategory}</span>
          <span className="text-purple-600 group-hover:text-purple-900 font-bold">×</span>
        </button>
      )}

      {/* Nombre de producto */}
      {filters.productName && (
        <button
          onClick={() => removeFilter("productName")}
          className="group px-3 py-1.5 bg-pink-100 hover:bg-pink-200 text-pink-800 rounded-full text-sm font-medium transition-colors flex items-center gap-2"
        >
          <span>{filters.productName}</span>
          <span className="text-pink-600 group-hover:text-pink-900 font-bold">×</span>
        </button>
      )}

      {/* Marca */}
      {filters.brandName && (
        <button
          onClick={() => {
            removeFilter("brandName");
            removeFilter("brandId");
          }}
          className="group px-3 py-1.5 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-full text-sm font-medium transition-colors flex items-center gap-2"
        >
          <span>Marca: {filters.brandName}</span>
          <span className="text-orange-600 group-hover:text-orange-900 font-bold">×</span>
        </button>
      )}

      {/* Limpiar todos */}
      <button
        onClick={clearAllFilters}
        className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-full text-sm font-semibold transition-colors"
      >
        Limpiar todo
      </button>
    </div>
  );
}
