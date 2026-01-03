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
  subcategoryEs: string;
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
              <span className="text-base text-indigo-600 font-medium">({categories.length})</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            {categories.length > 0 ? (
              <ul className="space-y-2 max-h-[500px] overflow-y-auto px-2">
                {categories.map(({ category, categoryEs }) => (
                  <li key={category}>
                    <button
                      className="w-full px-5 py-3.5 text-left text-base font-medium transition-all text-indigo-800 hover:bg-white/70 hover:text-indigo-950 rounded-lg shadow-sm hover:shadow-md"
                    >
                      {categoryEs}
                      <span className="text-md text-indigo-500/80 font-normal flex">({category})</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-6 py-8 text-center">
                <p className="text-base text-indigo-600 font-medium">No hay categorías disponibles</p>
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
              <span className="text-base text-indigo-600 font-medium">({subcategories.length})</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            {subcategories.length > 0 ? (
              <ul className="space-y-2 max-h-[500px] overflow-y-auto px-2">
                {subcategories.map(({ subcategory, subcategoryEs }) => (
                  <li key={subcategory}>
                    <button
                      className="w-full px-5 py-3.5 text-left text-base font-medium transition-all text-indigo-800 hover:bg-white/70 hover:text-indigo-950 rounded-lg shadow-sm hover:shadow-md"
                    >
                      {subcategoryEs}
                      <span className="text-md text-indigo-500/80 font-normal flex">({subcategory})</span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-6 py-8 text-center">
                <p className="text-base text-indigo-600 font-medium">No hay subcategorías disponibles</p>
                <p className="text-sm text-indigo-400 mt-2">
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
              <span className="text-base text-indigo-600 font-medium">({productNames.length})</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            {productNames.length > 0 ? (
              <ul className="space-y-2 max-h-[500px] overflow-y-auto px-2">
                {productNames.map(({ productName }) => (
                  <li key={productName}>
                    <button
                      className="w-full px-5 py-3.5 text-left text-base font-medium transition-all text-indigo-800 hover:bg-white/70 hover:text-indigo-950 rounded-lg shadow-sm hover:shadow-md truncate"
                      title={productName}
                    >
                      {productName}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-6 py-8 text-center">
                <p className="text-base text-indigo-600 font-medium">No hay productos disponibles</p>
                <p className="text-sm text-indigo-400 mt-2">
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
          Total: {categories.length} categorías, {subcategories.length} subcategorías, {productNames.length} productos
        </p>
        <p className="text-sm text-indigo-500 text-center mt-2">
          Las listas se actualizan automáticamente al navegar páginas
        </p>
      </div>
    </aside>
  );
}
