"use client";

import { useRouter } from "next/navigation";

interface Product {
  id: string;
  type: "Item";
  attributes: {
    product_name: string;
    mfr_part_number: string;
    thumbnail: string;
  };
  pricing?: {
    mapPrice: number | null;
    hasMap: boolean;
    canPurchase: boolean;
  } | null;
}

interface ProductGridProps {
  products: Product[];
  currentPage: number;
  totalPages: number;
  brandId: number;
}

export function ProductGrid({
  products,
  currentPage,
  totalPages,
  brandId,
}: ProductGridProps) {
  const router = useRouter();

  const handlePageChange = (page: number) => {
    router.push(`/brands/${brandId}?page=${page}`);
  };

  return (
    <>
      {/* Grid de productos */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-4"
          >
            {/* Imagen */}
            <div className="aspect-square mb-3 bg-zinc-100 rounded flex items-center justify-center overflow-hidden">
              {product.attributes.thumbnail ? (
                <img
                  src={product.attributes.thumbnail}
                  alt={product.attributes.product_name}
                  className="object-contain"
                />
              ) : (
                <span className="text-zinc-400 text-sm">Sin imagen</span>
              )}
            </div>

            {/* Nombre del producto */}
            <h3 className="font-semibold text-sm mb-2 line-clamp-2 min-h-[40px]">
              {product.attributes.product_name}
            </h3>

            {/* Número de parte */}
            <p className="text-zinc-600 text-xs font-mono">
              {product.attributes.mfr_part_number}
            </p>

            {/* Price Display */}
            {product.pricing?.hasMap && product.pricing.mapPrice && (
              <div className="mt-2 pt-2 border-t border-zinc-200">
                <p className="text-sm font-semibold text-green-700">
                  ${product.pricing.mapPrice.toFixed(2)}
                </p>
                <p className="text-xs text-zinc-500">MAP Price</p>
              </div>
            )}

            {/* No Price Available */}
            {product.pricing && !product.pricing.hasMap && (
              <div className="mt-2 pt-2 border-t border-zinc-200">
                <p className="text-xs text-zinc-500 italic">
                  Price not available
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Paginación básica */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-white border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50 transition-colors"
          >
            ← Anterior
          </button>

          <span className="px-4 py-2 text-sm">
            Página {currentPage} de {totalPages}
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-white border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50 transition-colors"
          >
            Siguiente →
          </button>
        </div>
      )}
    </>
  );
}
