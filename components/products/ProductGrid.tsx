import Image from "next/image";
import { ProductPagination } from "./ProductPagination";
import { EmptyPageMessage } from "./EmptyPageMessage";
import type { ProductWithDetails, ProductGridProps } from "@/domain/types/components/productGrid";

export function ProductGrid({
  products,
  currentPage,
  totalPages,
  brandId,
}: ProductGridProps) {
  // Si no hay productos, mostrar mensaje de página vacía
  if (products.length === 0) {
    return <EmptyPageMessage brandId={brandId} currentPage={currentPage} />;
  }

  return (
    <>
      {/* Lista de productos */}
      <div className="space-y-3 mb-8">
        {products.map((product) => {
          const hasStock = product.inventory?.hasStock ?? false;
          const manufacturerStock = product.inventory?.manufacturer?.stock ?? 0;
          const isClearance = product.attributes.clearance_item ?? false;

          console.log(product.attributes.clearance_item);

          const getBorderColor = () => {
            if (isClearance) {
              return "border-yellow-500 bg-yellow-100/20";
            } else if (hasStock) {
              return "border-green-600 bg-green-100/20";
            } else if (manufacturerStock > 0) {
              return "border-orange-600 bg-orange-100/20";
            } else {
              return "border-red-600 bg-red-100/20";
            }
          };

          return (
            <div
              key={product.id}
              className={`
                border-l-8 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 flex h-64
                ${getBorderColor()}
              `}
            >
              {/* Contenedor principal */}
              <div className="flex flex-1 p-4 gap-4">
                {/* Imagen */}
                <div className="w-28 h-28 shrink-0 bg-zinc-50 rounded flex items-center justify-center overflow-hidden">
                  {product.attributes.thumbnail ? (
                    <Image
                      src={product.attributes.thumbnail}
                      alt={product.attributes.product_name}
                      className="object-contain"
                      width={120}
                      height={120}
                    />
                  ) : (
                    <span className="text-zinc-400 text-xs">Sin imagen</span>
                  )}
                </div>

                {/* Información del producto */}
                <div className="flex-1 min-w-0">
                  {/* Part Number */}
                  <h3 className="text-xl md:text-3xl font-medium text-cyan-600 mb-1">
                    Pieza #: {product.attributes.mfr_part_number}
                  </h3>

                  {/* Stock - Real inventory data */}
                  {product.inventory ? (
                    product.inventory.hasStock ? (
                      <p className="text-xl text-green-600 mb-2">
                        ✅ En Stock ({product.inventory.totalStock} disponibles)
                      </p>
                    ) : product.inventory.manufacturer && product.inventory.manufacturer.stock > 0 ? (
                      <p className="text-xl text-orange-600 mb-2">
                        ⚠️ Pedido especial ({product.inventory.manufacturer.stock} - ESD: {product.inventory.manufacturer.esd})
                      </p>
                    ) : (
                      <p className="text-xl text-red-600 mb-2">
                        ❌ Sin Stock
                      </p>
                    )
                  ) : (
                    <p className="text-xl text-zinc-400 mb-2">
                      Stock no disponible
                    </p>
                  )}

                  {/* Detalles del producto */}
                  <div className="space-y-0.5 text-md text-gray-800">
                    <p>
                      <span className="font-semibold">
                        Fabricante:
                      </span>{" "}
                      {product.attributes.product_name.split(" ")[0]}{" "}
                      <span className="font-semibold ml-2">Pricing Group:</span>{" "}
                      {product.attributes.price_group}
                    </p>
                    <p>
                      <span className="font-semibold">
                        Product Name:
                      </span>{" "}
                      <span className="text-gray-700">{product.attributes.product_name}</span>
                    </p>
                    <p className="truncate">
                      <span className="font-semibold">
                        Description:
                      </span>{" "}
                      <span className="text-gray-700">
                        {product.attributes.part_description || "Sin descripción"}
                      </span>
                    </p>
                    <p>
                      <span className="font-semibold">
                        Turn14 ID:
                      </span>{" "}
                      {product.id}
                    </p>
                    {isClearance && (
                      <p className="text-yellow-600 font-bold">
                        🏷️ Liquidación
                      </p>
                    )}
                  </div>
                </div>

                {/* Precio y controles */}
                <div className="shrink-0 flex flex-col items-end justify-between min-w-[200px]">
                  {/* Precios */}
                  <div className="text-right">
                    {product.pricing ? (
                      <>
                        {/* Retail Price (tachado) */}
                        {product.pricing.retailPrice && (
                          <div className="text-sm text-zinc-600 mb-1">
                            <span className="font-semibold">Retail</span>
                            <span className="ml-2 line-through">
                              ${product.pricing.retailPrice.toFixed(2)}
                            </span>
                          </div>
                        )}

                        {/* Purchase Cost (precio principal) */}
                        <div className="text-3xl font-bold text-orange-500 mb-1">
                          ${product.pricing.purchaseCost.toFixed(2)}
                        </div>

                        <div className="text-sm text-zinc-600 italic">
                          Precio
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-zinc-500 italic">
                        Precio no disponible
                      </div>
                    )}
                  </div>

                  {/* Cantidad y botón */}
                  <div className="space-y-2 w-full flex flex-col justify-end items-end">
                    <input
                      type="number"
                      defaultValue="1"
                      min="1"
                      className="w-16 px-2 py-1 border-1 border-zinc-600 bg-zinc-100 rounded text-center text-sm text-zinc-900 font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-700 focus:border-zinc-700"
                    />
                    <button
                      type="button"
                      className="w-22 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-semibold rounded transition-colors duration-200 shadow-sm"
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Paginación con shadcn/ui */}
      <ProductPagination
        currentPage={currentPage}
        totalPages={totalPages}
        brandId={brandId}
      />
    </>
  );
}
