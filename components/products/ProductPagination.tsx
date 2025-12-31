import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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

  // Generar array de páginas a mostrar
  const getPageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      // Mostrar todas las páginas si son 7 o menos
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Lógica para mostrar páginas con elipsis
      if (currentPage <= 3) {
        // Inicio: 1 2 3 4 ... last
        pages.push(1, 2, 3, 4, "ellipsis", totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Final: 1 ... last-3 last-2 last-1 last
        pages.push(1, "ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        // Medio: 1 ... current-1 current current+1 ... last
        pages.push(1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <Pagination>
      <PaginationContent>
        {/* Previous button */}
        <PaginationItem>
          {currentPage > 1 ? (
            <PaginationPrevious href={`/brands/${brandId}?page=${currentPage - 1}`} />
          ) : (
            <span className="inline-flex items-center justify-center gap-1 pl-2.5 h-9 px-4 py-2 text-sm font-medium text-zinc-400 cursor-not-allowed">
              Anterior
            </span>
          )}
        </PaginationItem>

        {/* Page numbers */}
        {pageNumbers.map((page, index) => (
          <PaginationItem key={index}>
            {page === "ellipsis" ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                href={`/brands/${brandId}?page=${page}`}
                isActive={currentPage === page}
              >
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        {/* Next button */}
        <PaginationItem>
          {currentPage < totalPages ? (
            <PaginationNext href={`/brands/${brandId}?page=${currentPage + 1}`} />
          ) : (
            <span className="inline-flex items-center justify-center gap-1 pr-2.5 h-9 px-4 py-2 text-sm font-medium text-zinc-400 cursor-not-allowed">
              Siguiente
            </span>
          )}
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
