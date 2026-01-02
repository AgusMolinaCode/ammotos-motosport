interface ProductPriceAndStockProps {
  productId: string;
  pricing: {
    purchaseCost: number;
    retailPrice: number | null;
    mapPrice: number | null;
  } | null;
  inventory: {
    hasStock: boolean;
    totalStock: number;
    manufacturer: {
      stock: number;
      esd: string;
    } | null;
  } | null;
}

/**
 * ⚡ COMPONENTE ESTÁTICO: Muestra precios e inventario pre-fetched
 * Los datos ya fueron cargados por el componente padre
 */
export function ProductPriceAndStock({
  pricing,
  inventory,
}: ProductPriceAndStockProps) {
  const price = pricing;
  const stock = inventory;

  return (
    <div className="shrink-0 flex flex-col items-end justify-between min-w-[200px]">
      {/* Precios */}
      <div className="text-right">
        {price ? (
          <>
            {/* Retail Price (tachado) */}
            {price.retailPrice && (
              <div className="text-sm text-zinc-600 mb-1">
                <span className="font-semibold">Retail</span>
                <span className="ml-2 line-through">
                  ${price.retailPrice.toFixed(2)}
                </span>
              </div>
            )}

            {/* Purchase Cost (precio principal) */}
            <div className="text-3xl font-bold text-orange-500 mb-1">
              ${price.purchaseCost.toFixed(2)}
            </div>

            <div className="text-sm text-zinc-600 italic">Precio</div>
          </>
        ) : (
          <div className="text-sm text-zinc-500 italic">
            Precio no disponible
          </div>
        )}
      </div>

      {/* Stock Info */}
      <div className="text-right mb-4 mt-2">
        {stock ? (
          stock.hasStock ? (
            <p className="text-lg text-green-600">
              ✅ Stock: {stock.totalStock}
            </p>
          ) : stock.manufacturer && stock.manufacturer.stock > 0 ? (
            <p className="text-lg text-orange-600">
              ⚠️ Pedido: {stock.manufacturer.stock}
              <br />
              <span className="text-lg">Fecha estimada: {stock.manufacturer.esd}</span>
            </p>
          ) : (
            <p className="text-lg text-red-600">❌ Sin Stock</p>
          )
        ) : (
          <p className="text-lg text-zinc-400">Stock no disponible</p>
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
  );
}
