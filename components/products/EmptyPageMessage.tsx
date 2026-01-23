import Link from "next/link";

interface EmptyPageMessageProps {
  brandId?: number;
  brandSlug?: string;
  categorySlug?: string;
  currentPage: number;
}

export function EmptyPageMessage({
  brandId,
  brandSlug,
  categorySlug,
  currentPage,
}: EmptyPageMessageProps) {
  const previousPage = Math.max(1, currentPage - 1); // Nunca ir a página 0

  // Determinar URL base
  const getBaseUrl = () => {
    if (categorySlug) return `/categories/${categorySlug}`;
    if (brandSlug) return `/marca/${brandSlug}`;
    return "/";
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="text-center space-y-4">
        <p className="text-xl font-semibold text-gray-700">
          No hay más productos para mostrar
        </p>
        {currentPage > 1 && (
          <Link
            href={`${getBaseUrl()}?page=${previousPage}`}
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-sm"
          >
            ← Volver a página {previousPage}
          </Link>
        )}
      </div>
    </div>
  );
}
