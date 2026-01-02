/**
 * Skeleton de carga para precios e inventario
 * Se muestra mientras ProductPriceAndStock está cargando
 */
export function ProductPriceSkeleton() {
  return (
    <div className="shrink-0 flex flex-col items-end justify-between min-w-[200px]">
      {/* Precio skeleton */}
      <div className="text-right space-y-2 animate-pulse">
        <div className="h-4 w-24 bg-zinc-200 rounded ml-auto" />
        <div className="h-8 w-32 bg-zinc-200 rounded ml-auto" />
        <div className="h-3 w-28 bg-zinc-200 rounded ml-auto" />
      </div>

      {/* Stock skeleton */}
      <div className="text-right mb-4 mt-2 animate-pulse">
        <div className="h-4 w-28 bg-zinc-200 rounded ml-auto" />
      </div>

      {/* Controles skeleton */}
      <div className="space-y-2 w-full flex flex-col justify-end items-end animate-pulse">
        <div className="h-8 w-16 bg-zinc-200 rounded" />
        <div className="h-9 w-22 bg-zinc-200 rounded" />
      </div>
    </div>
  );
}
