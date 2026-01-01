import Link from "next/link";

interface ProductPaginationProps {
  currentPage: number;
  totalPages: number;
  brandId: number;
}

export function ProductPagination({
  currentPage,
  totalPages,
  brandId,
}: ProductPaginationProps) {
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
    // Páginas 1-5 → inicio en 1
    // Páginas 6-10 → inicio en 6
    // Páginas 11-15 → inicio en 11
    const windowStart = Math.floor((currentPage - 1) / WINDOW_SIZE) * WINDOW_SIZE + 1;

    // Final de la ventana limitado por totalPages
    // Si estamos en páginas 6-8 y solo hay 8 totales, muestra [6, 7, 8]
    const windowEnd = Math.min(windowStart + WINDOW_SIZE - 1, totalPages);

    for (let i = windowStart; i <= windowEnd; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      {/* Previous button */}
      {isFirstPage ? (
        <button
          disabled
          className="px-4 py-2 text-sm font-semibold text-gray-400 bg-gray-200 rounded cursor-not-allowed"
        >
          ← Anterior
        </button>
      ) : (
        <Link
          href={`/brands/${brandId}?page=${currentPage - 1}`}
          className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
        >
          ← Anterior
        </Link>
      )}

      {/* Page numbers */}
      <div className="flex gap-1">
        {pageNumbers.map((page) => (
          <Link
            key={page}
            href={`/brands/${brandId}?page=${page}`}
            className={`
              min-w-[40px] h-10 flex items-center justify-center
              text-sm font-semibold rounded transition-colors
              ${
                currentPage === page
                  ? "bg-orange-500 text-white shadow-md"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }
            `}
          >
            {page}
          </Link>
        ))}
      </div>

      {/* Next button */}
      {isLastPage ? (
        <button
          disabled
          className="px-4 py-2 text-sm font-semibold text-gray-400 bg-gray-200 rounded cursor-not-allowed"
        >
          Siguiente →
        </button>
      ) : (
        <Link
          href={`/brands/${brandId}?page=${currentPage + 1}`}
          className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
        >
          Siguiente →
        </Link>
      )}
    </div>
  );
}
