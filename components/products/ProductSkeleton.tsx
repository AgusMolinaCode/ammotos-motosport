export function ProductSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(25)].map((_, i) => (
        <div
          key={i}
          className="bg-white border-l-4 border-zinc-200 shadow-sm flex animate-pulse"
        >
          <div className="flex flex-1 p-4 gap-4">
            {/* Imagen skeleton */}
            <div className="w-20 h-20 shrink-0 bg-zinc-200 rounded" />

            {/* Información skeleton */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="h-6 bg-zinc-200 rounded w-1/3" />
              <div className="h-4 bg-zinc-200 rounded w-1/4" />
              <div className="space-y-1">
                <div className="h-3 bg-zinc-200 rounded w-full" />
                <div className="h-3 bg-zinc-200 rounded w-5/6" />
                <div className="h-3 bg-zinc-200 rounded w-4/5" />
              </div>
              <div className="flex gap-2 mt-3">
                <div className="h-7 w-24 bg-zinc-200 rounded" />
                <div className="h-7 w-24 bg-zinc-200 rounded" />
                <div className="h-7 w-32 bg-zinc-200 rounded" />
              </div>
            </div>

            {/* Precio skeleton */}
            <div className="shrink-0 flex flex-col items-end justify-between min-w-[200px]">
              <div className="text-right space-y-2">
                <div className="h-4 w-24 bg-zinc-200 rounded ml-auto" />
                <div className="h-8 w-32 bg-zinc-200 rounded ml-auto" />
                <div className="h-3 w-28 bg-zinc-200 rounded ml-auto" />
              </div>
              <div className="space-y-2 w-full">
                <div className="h-8 w-full bg-zinc-200 rounded" />
                <div className="h-9 w-full bg-zinc-200 rounded" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
