"use client";

import { useState } from "react";
import { CategorySidebar } from "./CategorySidebar";

interface BrandCategory {
  category: string;
  categoryEs: string;
}

interface MobileCategoryButtonProps {
  categories: BrandCategory[];
}

export function MobileCategoryButton({
  categories,
}: MobileCategoryButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden w-full mb-4 px-4 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
        Filtrar por Categoría
      </button>

      {/* Mobile Drawer/Modal */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white z-50 lg:hidden overflow-y-auto shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-zinc-200 p-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-bold">Filtrar Productos</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-zinc-100 rounded-lg transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Sidebar Content */}
            <div className="p-0">
              <CategorySidebar categories={categories} />
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-white border-t border-zinc-200 p-4">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Ver Productos
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
