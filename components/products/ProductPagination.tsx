"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
import Link from "next/link";

interface ProductPaginationProps {
  currentPage: number;
  totalPages: number;
  brandId?: number;
  brandSlug?: string;
  categorySlug?: string;
  onNavigate?: () => void; // Callback cuando se navega
}

export function ProductPagination({
  currentPage,
  totalPages,
  brandId,
  brandSlug,
  categorySlug,
  onNavigate,
}: ProductPaginationProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [navigating, setNavigating] = useState(false);

  // Resetear estado de navegación cuando cambia la página
  useEffect(() => {
    // Deferir el setState para evitar renders en cascada
    const timer = setTimeout(() => {
      setNavigating(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [currentPage]);

  // Construir URL con página preservando filtros activos
  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());

    // Determinar URL base según si es categoría o marca
    if (categorySlug) {
      return `/categories/${categorySlug}?${params.toString()}`;
    }
    return `/brands/${brandSlug}?${params.toString()}`;
  };

  // Función para navegar con loading state
  const handleNavigate = (page: number) => {
    setNavigating(true);
    onNavigate?.(); // Notificar al componente padre

    startTransition(() => {
      router.push(buildPageUrl(page));
    });

    // Scroll al inicio de la página
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (totalPages <= 1) return null;

  // Calcular ventana de 5 páginas deslizante
  const getPageNumbers = (): number[] => {
    const WINDOW_SIZE = 5;
    const pages: number[] = [];

    // Si hay menos de 5 páginas totales, mostrar todas
    if (totalPages <= WINDOW_SIZE) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    // Calcular inicio de la ventana (bloques de 5)
    const windowStart = Math.floor((currentPage - 1) / WINDOW_SIZE) * WINDOW_SIZE + 1;

    // Final de la ventana limitado por totalPages
    const windowEnd = Math.min(windowStart + WINDOW_SIZE - 1, totalPages);

    for (let i = windowStart; i <= windowEnd; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  const isLoading = isPending || navigating;

  return (
    <div className="flex items-center justify-center gap-2">
      {/* Previous button */}
      <button
        onClick={() => !isFirstPage && handleNavigate(currentPage - 1)}
        disabled={isFirstPage || isLoading}
        className={`
          px-4 py-2 text-sm font-semibold rounded transition-colors
          ${
            isFirstPage || isLoading
              ? "text-gray-400 bg-gray-200 cursor-not-allowed"
              : "text-white bg-blue-500 hover:bg-blue-500/80 cursor-pointer"
          }
        `}
      >
        {isLoading ? "Cargando..." : "<<"}
      </button>

      {/* Page numbers */}
      <div className="flex gap-1">
        {pageNumbers.map((page) => (
          <button
            key={page}
            onClick={() => page !== currentPage && handleNavigate(page)}
            disabled={isLoading || currentPage === page}
            className={`
              min-w-[40px] h-10 flex items-center justify-center
              text-sm font-semibold rounded transition-colors
              ${
                currentPage === page
                  ? "bg-orange-500 text-white shadow-md cursor-default"
                  : isLoading
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300 cursor-pointer"
              }
            `}
          >
            {page}
          </button>
        ))}
      </div>

      {/* Next button */}
      <button
        onClick={() => !isLastPage && handleNavigate(currentPage + 1)}
        disabled={isLastPage || isLoading}
        className={`
          px-4 py-2 text-sm font-semibold rounded transition-colors
          ${
            isLastPage || isLoading
              ? "text-gray-400 bg-gray-200 cursor-not-allowed"
              : "text-white bg-blue-500 hover:bg-blue-500/80 cursor-pointer"
          }
        `}
      >
        {isLoading ? "Cargando..." : ">>"}
      </button>
    </div>
  );
}
