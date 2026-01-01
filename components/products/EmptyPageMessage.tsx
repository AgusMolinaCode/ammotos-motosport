import Link from "next/link";

interface EmptyPageMessageProps {
  brandId: number;
  currentPage: number;
}

export function EmptyPageMessage({
  brandId,
  currentPage,
}: EmptyPageMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="text-center space-y-4">
        <p className="text-xl font-semibold text-gray-700">
          No hay más productos para mostrar
        </p>
        <Link
          href={`/brands/${brandId}?page=${currentPage - 1}`}
          className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-sm"
        >
          ← Volver a página {currentPage - 1}
        </Link>
      </div>
    </div>
  );
}
