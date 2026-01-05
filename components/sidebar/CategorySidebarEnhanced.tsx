"use client";

import { useState } from "react";
import { traducirCategoria, traducirSubcategoria } from "@/constants/categorias";

interface BrandCategory {
  category: string;
  categoryEs: string;
}

interface BrandSubcategory {
  subcategory: string;
  subcategoryEs?: string;
}

interface BrandProductName {
  productName: string;
}

interface CategorySidebarEnhancedProps {
  categories: BrandCategory[];
  subcategories: BrandSubcategory[];
  productNames: BrandProductName[];
}

/**
 * ⚡ SIDEBAR MEJORADO: Muestra 3 listas filtradas
 * - Categorías (con traducción)
 * - Subcategorías
 * - Product Names
 *
 * Todas ordenadas alfabéticamente y actualizadas progresivamente
 */
export function CategorySidebarEnhanced({
  categories,
  subcategories,
  productNames,
}: CategorySidebarEnhancedProps) {
  const [activeSection, setActiveSection] = useState<"categories" | "subcategories" | "productNames">("categories");

  return (
    <aside className="w-full bg-white rounded-lg shadow-sm border border-zinc-200">
      {/* Header con tabs */}
      <div className="border-b border-zinc-200">
        <div className="flex">
          <button
            onClick={() => setActiveSection("categories")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeSection === "categories"
                ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600"
                : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
            }`}
          >
            Categorías
            <span className="ml-2 text-xs text-zinc-500">({categories.length})</span>
          </button>
          <button
            onClick={() => setActiveSection("subcategories")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeSection === "subcategories"
                ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600"
                : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
            }`}
          >
            Subcategorías
            <span className="ml-2 text-xs text-zinc-500">({subcategories.length})</span>
          </button>
          <button
            onClick={() => setActiveSection("productNames")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeSection === "productNames"
                ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600"
                : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
            }`}
          >
            Productos
            <span className="ml-2 text-xs text-zinc-500">({productNames.length})</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-h-[600px] overflow-y-auto">
        {/* Categories List */}
        {activeSection === "categories" && (
          categories.length > 0 ? (
            <ul className="py-2 space-y-1">
              {categories.map(({ category, categoryEs }) => {
                const traduccion = categoryEs || traducirCategoria(category);
                return (
                  <li key={category}>
                    <button
                      className="w-full px-4 py-2.5 text-left text-sm transition-colors text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
                    >
                      {traduccion}
                      <span className="ml-2 text-xs text-zinc-400">({category})</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="p-8 text-center">
              <p className="text-sm text-zinc-500">No hay categorías disponibles</p>
              <p className="text-xs text-zinc-400 mt-1">
                Las categorías aparecerán después de cargar productos
              </p>
            </div>
          )
        )}

        {/* Subcategories List */}
        {activeSection === "subcategories" && (
          subcategories.length > 0 ? (
            <ul className="py-2 space-y-1">
              {subcategories.map(({ subcategory, subcategoryEs }) => {
                const traduccion = subcategoryEs || traducirSubcategoria(subcategory);
                return (
                  <li key={subcategory}>
                    <button
                      className="w-full px-4 py-2.5 text-left text-sm transition-colors text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
                    >
                      {traduccion}
                      <span className="ml-2 text-xs text-zinc-400">({subcategory})</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="p-8 text-center">
              <p className="text-sm text-zinc-500">No hay subcategorías disponibles</p>
              <p className="text-xs text-zinc-400 mt-1">
                Las subcategorías aparecerán después de cargar productos
              </p>
            </div>
          )
        )}

        {/* Product Names List */}
        {activeSection === "productNames" && (
          productNames.length > 0 ? (
            <ul className="py-2 space-y-1">
              {productNames.map(({ productName }) => (
                <li key={productName}>
                  <button
                    className="w-full px-4 py-2.5 text-left text-sm transition-colors text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 truncate"
                    title={productName}
                  >
                    {productName}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-8 text-center">
              <p className="text-sm text-zinc-500">No hay productos disponibles</p>
              <p className="text-xs text-zinc-400 mt-1">
                Los productos aparecerán después de cargar datos
              </p>
            </div>
          )
        )}
      </div>

      {/* Footer Info */}
      <div className="p-4 bg-zinc-50 border-t border-zinc-200">
        <p className="text-xs text-zinc-500 text-center">
          {activeSection === "categories" && `${categories.length} categorías`}
          {activeSection === "subcategories" && `${subcategories.length} subcategorías`}
          {activeSection === "productNames" && `${productNames.length} productos`}
          {" disponibles para esta marca"}
        </p>
        <p className="text-xs text-zinc-400 text-center mt-1">
          Las listas se actualizan automáticamente al navegar páginas
        </p>
      </div>
    </aside>
  );
}
