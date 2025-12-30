"use client";

import { useState } from "react";

interface BrandCategory {
  category: string;
  categoryEs: string;
}

interface CategorySidebarProps {
  categories: BrandCategory[];
  selectedCategory?: string;
  onCategorySelect?: (category: string | null) => void;
}

export function CategorySidebar({
  categories,
  selectedCategory,
  onCategorySelect,
}: CategorySidebarProps) {
  const handleCategoryClick = (category: string) => {
    if (onCategorySelect) {
      // Si ya está seleccionada, deseleccionar
      if (selectedCategory === category) {
        onCategorySelect(null);
      } else {
        onCategorySelect(category);
      }
    }
  };

  const handleClearFilter = () => {
    if (onCategorySelect) {
      onCategorySelect(null);
    }
  };

  return (
    <aside className="w-full bg-white rounded-lg shadow-sm border border-zinc-200">
      {/* Header */}
      <div className="p-4 border-b border-zinc-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-900">Categorías</h2>
          {selectedCategory && (
            <button
              onClick={handleClearFilter}
              className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
            >
              Limpiar filtro
            </button>
          )}
        </div>
        {selectedCategory && (
          <p className="text-xs text-zinc-500 mt-1">
            Filtrando:{" "}
            <span className="font-medium">
              {categories.find((c) => c.category === selectedCategory)
                ?.categoryEs || selectedCategory}
            </span>
          </p>
        )}
      </div>

      {/* Categories List */}
      <div className="max-h-[600px] overflow-y-auto">
        {categories.length > 0 ? (
          <ul className="py-2 space-y-1">
            {categories.map(({ category, categoryEs }) => {
              const isSelected = selectedCategory === category;

              return (
                <li key={category}>
                  <button
                    onClick={() => handleCategoryClick(category)}
                    className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                      isSelected
                        ? "bg-blue-50 text-blue-700 font-medium border-l-4 border-blue-600"
                        : "text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
                    }`}
                  >
                    {categoryEs}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="p-8 text-center">
            <p className="text-sm text-zinc-500">
              No hay categorías disponibles
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              Las categorías aparecerán después de cargar productos
            </p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-4 bg-zinc-50 border-t border-zinc-200">
        <p className="text-xs text-zinc-500 text-center">
          {categories.length} categorías disponibles para esta marca
        </p>
      </div>
    </aside>
  );
}
