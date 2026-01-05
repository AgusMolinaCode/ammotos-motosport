/**
 * Skeleton de carga para la grilla de productos
 * Se muestra mientras se navega entre páginas
 */
export function ProductGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="space-y-3 mb-8 animate-pulse">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="border-l-8 border-gray-300 rounded-lg shadow-sm flex h-64 bg-white"
        >
          {/* Contenedor principal */}
          <div className="flex flex-1 p-4 gap-4">
            {/* Imagen skeleton */}
            <div className="w-28 h-28 shrink-0 bg-gray-200 rounded" />

            {/* Información del producto skeleton */}
            <div className="flex-1 min-w-0 space-y-3">
              {/* Part Number */}
              <div className="h-8 bg-gray-200 rounded w-2/3" />

              {/* Detalles */}
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
                <div className="h-4 bg-gray-200 rounded w-4/5" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="h-4 bg-gray-200 rounded w-3/5" />
              </div>
            </div>

            {/* Precio skeleton */}
            <div className="w-56 shrink-0 space-y-2">
              <div className="h-6 bg-gray-200 rounded w-full" />
              <div className="h-6 bg-gray-200 rounded w-4/5" />
              <div className="h-6 bg-gray-200 rounded w-3/4" />
              <div className="h-8 bg-gray-200 rounded w-full mt-4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
