"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface BrandCategory {
  category: string;
  categoryEs: string;
}

interface BrandSubcategory {
  subcategory: string;
}

interface BrandProductName {
  productName: string;
}

interface CategorySidebarAccordionProps {
  categories: BrandCategory[];
  subcategories: BrandSubcategory[];
  productNames: BrandProductName[];
}

/**
 * ⚡ SIDEBAR ACCORDION: Muestra 3 listas colapsables
 * - Categorías (ABIERTO por defecto, con traducción)
 * - Subcategorías (cerrado por defecto)
 * - Product Names (cerrado por defecto)
 *
 * Todas ordenadas alfabéticamente y actualizadas progresivamente
 */
export function CategorySidebarAccordion({
  categories,
  subcategories,
  productNames,
}: CategorySidebarAccordionProps) {
  return (
    <aside className="w-full bg-white rounded-lg shadow-sm border border-zinc-200">
      <Accordion
        type="single"
        collapsible
        className="w-full"
        defaultValue="categories"
      >
        {/* Categorías - Abierto por defecto */}
        <AccordionItem value="categories">
          <AccordionTrigger className="px-4 text-sm font-medium text-zinc-900 hover:no-underline hover:bg-zinc-50">
            Categorías
            <span className="ml-2 text-xs text-zinc-500">({categories.length})</span>
          </AccordionTrigger>
          <AccordionContent>
            {categories.length > 0 ? (
              <ul className="space-y-1 max-h-[400px] overflow-y-auto">
                {categories.map(({ category, categoryEs }) => (
                  <li key={category}>
                    <button
                      className="w-full px-4 py-2.5 text-left text-sm transition-colors text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
                    >
                      {categoryEs}
                      <span className="ml-2 text-xs text-zinc-400">({category})</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-zinc-500">No hay categorías disponibles</p>
                <p className="text-xs text-zinc-400 mt-1">
                  Las categorías aparecerán después de cargar productos
                </p>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Subcategorías - Cerrado por defecto */}
        <AccordionItem value="subcategories">
          <AccordionTrigger className="px-4 text-sm font-medium text-zinc-900 hover:no-underline hover:bg-zinc-50">
            Subcategorías
            <span className="ml-2 text-xs text-zinc-500">({subcategories.length})</span>
          </AccordionTrigger>
          <AccordionContent>
            {subcategories.length > 0 ? (
              <ul className="space-y-1 max-h-[400px] overflow-y-auto">
                {subcategories.map(({ subcategory }) => (
                  <li key={subcategory}>
                    <button
                      className="w-full px-4 py-2.5 text-left text-sm transition-colors text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
                    >
                      {subcategory}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-zinc-500">No hay subcategorías disponibles</p>
                <p className="text-xs text-zinc-400 mt-1">
                  Las subcategorías aparecerán después de cargar productos
                </p>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>

        {/* Product Names - Cerrado por defecto */}
        <AccordionItem value="productNames">
          <AccordionTrigger className="px-4 text-sm font-medium text-zinc-900 hover:no-underline hover:bg-zinc-50">
            Productos
            <span className="ml-2 text-xs text-zinc-500">({productNames.length})</span>
          </AccordionTrigger>
          <AccordionContent>
            {productNames.length > 0 ? (
              <ul className="space-y-1 max-h-[400px] overflow-y-auto">
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
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-zinc-500">No hay productos disponibles</p>
                <p className="text-xs text-zinc-400 mt-1">
                  Los productos aparecerán después de cargar datos
                </p>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Footer Info */}
      <div className="p-4 bg-zinc-50 border-t border-zinc-200">
        <p className="text-xs text-zinc-500 text-center">
          Total: {categories.length} categorías, {subcategories.length} subcategorías, {productNames.length} productos
        </p>
        <p className="text-xs text-zinc-400 text-center mt-1">
          Las listas se actualizan automáticamente al navegar páginas
        </p>
      </div>
    </aside>
  );
}
