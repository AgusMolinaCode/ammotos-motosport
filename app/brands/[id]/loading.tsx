import { ProductSkeleton } from "@/components/products/ProductSkeleton";

export default function BrandDetailLoading() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-[90rem] mx-auto p-8">
        <div className="animate-pulse">
          {/* Back link skeleton */}
          <div className="h-6 bg-zinc-300 rounded w-48 mb-2"></div>

          {/* Title skeleton */}
          <div className="h-10 bg-zinc-400 rounded w-1/3 mb-6"></div>

          {/* Content card skeleton */}
          <div className="bg-white rounded-lg shadow p-6 space-y-6">
            {/* Logo skeleton */}
            <div className="flex justify-center p-4 bg-zinc-50 rounded">
              <div className="h-32 w-64 bg-zinc-200 rounded"></div>
            </div>

            {/* Info grid skeleton */}
            <div className="grid grid-cols-2 gap-4 border-t pt-6">
              <div className="space-y-2">
                <div className="h-4 bg-zinc-200 rounded w-20"></div>
                <div className="h-4 bg-zinc-300 rounded w-32"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-zinc-200 rounded w-20"></div>
                <div className="h-4 bg-zinc-300 rounded w-24"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-zinc-200 rounded w-24"></div>
                <div className="h-4 bg-zinc-300 rounded w-40"></div>
              </div>
              <div className="space-y-2">
                <div className="h-4 bg-zinc-200 rounded w-28"></div>
                <div className="h-4 bg-zinc-300 rounded w-16"></div>
              </div>
            </div>

            {/* Price groups skeleton */}
            <div className="mt-6 border-t pt-6">
              <div className="h-6 bg-zinc-300 rounded w-48 mb-4"></div>
              <div className="space-y-4">
                <div className="border border-zinc-200 rounded-lg p-4">
                  <div className="h-6 bg-zinc-300 rounded w-1/3 mb-2"></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-4 bg-zinc-200 rounded"></div>
                    <div className="h-4 bg-zinc-200 rounded"></div>
                  </div>
                </div>
                <div className="border border-zinc-200 rounded-lg p-4">
                  <div className="h-6 bg-zinc-300 rounded w-1/3 mb-2"></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-4 bg-zinc-200 rounded"></div>
                    <div className="h-4 bg-zinc-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products section skeleton */}
        <div className="mt-12">
          <div className="h-8 bg-zinc-300 rounded w-48 mb-6 animate-pulse" />

          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
            {/* Sidebar skeleton */}
            <div className="hidden lg:block">
              <div className="bg-white rounded-lg shadow p-4 sticky top-6 animate-pulse">
                <div className="h-6 bg-zinc-300 rounded mb-4" />
                <div className="space-y-2">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-4 bg-zinc-200 rounded" />
                  ))}
                </div>
              </div>
            </div>

            {/* Products skeleton */}
            <div>
              <ProductSkeleton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
