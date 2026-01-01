import Image from "next/image";
import { ProductPagination } from "./ProductPagination";

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
    retailPrice: number | null;
    purchaseCost: number;
    hasMap: boolean;
    canPurchase: boolean;
  } | null;
  inventory?: {
    totalStock: number;
    hasStock: boolean;
    inventory: Record<string, number>;
    manufacturer: {
      stock: number;
      esd: string;
    } | null;
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
  return (
    <>
      {/* Lista de productos */}
      <div className="space-y-3 mb-8">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white border-l-4 border-emerald-500 shadow-sm hover:shadow-md transition-shadow duration-200 flex"
          >
            {/* Contenedor principal */}
            <div className="flex flex-1 p-4 gap-4">
              {/* Imagen */}
              <div className="w-20 h-20 shrink-0 bg-zinc-50 rounded flex items-center justify-center overflow-hidden">
                {product.attributes.thumbnail ? (
                  <Image
                    src={product.attributes.thumbnail}
                    alt={product.attributes.product_name}
                    className="object-contain"
                    width={80}
                    height={80}
                  />
                ) : (
                  <span className="text-zinc-400 text-xs">Sin imagen</span>
                )}
              </div>

              {/* Información del producto */}
              <div className="flex-1 min-w-0">
                {/* Part Number */}
                <h3 className="text-xl font-normal text-cyan-600 mb-1">
                  Part #: {product.attributes.mfr_part_number}
                </h3>

                {/* Stock - Real inventory data */}
                {product.inventory ? (
                  product.inventory.hasStock ? (
                    <p className="text-sm text-green-600 mb-2">
                      ✅ En Stock ({product.inventory.totalStock} disponibles)
                    </p>
                  ) : (
                    <p className="text-sm text-red-600 mb-2">
                      ❌ Sin Stock
                      {product.inventory.manufacturer && product.inventory.manufacturer.stock > 0 && (
                        <span className="text-orange-600 ml-2">
                          (Fabricante: {product.inventory.manufacturer.stock} - ESD: {product.inventory.manufacturer.esd})
                        </span>
                      )}
                    </p>
                  )
                ) : (
                  <p className="text-sm text-zinc-400 mb-2">
                    Stock no disponible
                  </p>
                )}

                {/* Detalles del producto */}
                <div className="space-y-0.5 text-sm">
                  <p>
                    <span className="font-semibold">Manufacturer:</span>{" "}
                    {product.attributes.product_name.split(" ")[0]}{" "}
                    <span className="font-semibold ml-2">Pricing Group:</span>{" "}
                    {product.attributes.product_name.split(" ")[0]}
                  </p>
                  <p>
                    <span className="font-semibold">Description:</span>{" "}
                    {product.attributes.product_name}
                  </p>
                  <p>
                    <span className="font-semibold">Product Name:</span>{" "}
                    {product.attributes.product_name}
                  </p>
                  <p>
                    <span className="font-semibold">Turn14 ID:</span>{" "}
                    {product.id}
                  </p>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-2 mt-3">
                  <button className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium rounded transition-colors">
                    Product Info
                  </button>
                  <button className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded transition-colors">
                    Related Items
                  </button>
                  <button className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded transition-colors">
                    Available to Promise
                  </button>
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
                        Purchase Cost
                      </div>
                    </>
                  ) : (
                    <div className="text-sm text-zinc-500 italic">
                      Precio no disponible
                    </div>
                  )}
                </div>

                {/* Cantidad y botón */}
                <div className="space-y-2 w-full">
                  <input
                    type="number"
                    defaultValue="1"
                    min="1"
                    className="w-full px-2 py-1 border-2 border-zinc-400 rounded text-center text-sm shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                  <button
                    type="button"
                    className="w-full px-3 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-semibold rounded transition-colors duration-200 shadow-sm"
                  >
                    Agregar
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
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
