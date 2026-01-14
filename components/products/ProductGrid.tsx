import Image from "next/image";
import { ProductPagination } from "./ProductPagination";
import { EmptyPageMessage } from "./EmptyPageMessage";
import type { ProductWithDetails, ProductGridProps } from "@/domain/types/components/productGrid";
import { traducirCategoria, traducirSubcategoria } from "@/constants/categorias";
import { formatDateSpanish } from "./ProductPriceAndStock";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { useState } from "react";
import { X } from "lucide-react";

export function ProductGrid({
  products,
  currentPage,
  totalPages,
  brandId,
  brandSlug,
}: ProductGridProps) {
  const [selectedProduct, setSelectedProduct] = useState<ProductWithDetails | null>(null);

  // Si no hay productos, mostrar mensaje de página vacía
  if (products.length === 0) {
    return <EmptyPageMessage brandId={brandId} brandSlug={brandSlug} currentPage={currentPage} />;
  }

  return (
    <>
      {/* Lista de productos */}
      <div className="space-y-3 mb-8">
        {products.map((product) => {
          const hasStock = product.inventory?.hasStock ?? false;
          const manufacturerStock = product.inventory?.manufacturer?.stock ?? 0;
          const isClearance = product.attributes.clearance_item ?? false;

          // Debug: descomentar si necesitas verificar los datos
          // console.log('🔍 Product:', product.id, product.attributes.category, product.attributes.subcategory);

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
                border-l-8 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200
                flex flex-col sm:flex-row h-auto sm:h-64
                ${getBorderColor()}
              `}
            >
              {/* Contenedor principal */}
              <div className="flex flex-col sm:flex-row flex-1 p-3 sm:p-4 gap-3 sm:gap-4">
                {/* Imagen - Clickable */}
                <button
                  onClick={() => setSelectedProduct(product)}
                  className="w-full sm:w-28 h-48 sm:h-28 shrink-0 bg-zinc-50 rounded flex items-center justify-center overflow-hidden hover:bg-zinc-100 transition-colors cursor-pointer"
                >
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
                </button>

                {/* Información del producto */}
                <div className="flex-1 min-w-0">
                  {/* Part Number - Clickable */}
                  <button
                    onClick={() => setSelectedProduct(product)}
                    className="text-lg sm:text-xl md:text-3xl font-medium text-cyan-600 mb-1 hover:text-cyan-700 transition-colors cursor-pointer text-left"
                  >
                    Pieza #: {product.attributes.mfr_part_number}
                  </button>

                  {/* Stock - Real inventory data */}
                  {product.inventory ? (
                    product.inventory.hasStock ? (
                      <p className="text-base sm:text-xl text-green-600 mb-2">
                        ✅ En Stock ({product.inventory.totalStock} disponibles)
                      </p>
                    ) : product.inventory.manufacturer && product.inventory.manufacturer.stock > 0 ? (
                      <p className="text-base sm:text-xl text-orange-600 mb-2">
                        ⚠️ Pedido especial ({product.inventory.manufacturer.stock} - ESD: {product.inventory.manufacturer.esd})
                      </p>
                    ) : (
                      <p className="text-base sm:text-xl text-red-600 mb-2">
                        ❌ Sin Stock
                      </p>
                    )
                  ) : (
                    <p className="text-base sm:text-xl text-zinc-400 mb-2">
                      Stock no disponible
                    </p>
                  )}

                  {/* Detalles del producto */}
                  <div className="space-y-0.5 text-sm sm:text-md text-gray-800">
                    <p className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
                      <span className="font-semibold">Fabricante:</span>{" "}
                      {product.attributes.product_name.split(" ")[0]}{" "}
                      <span className="font-semibold sm:ml-2">Pricing Group:</span>{" "}
                      {product.attributes.price_group}
                    </p>
                    <p>
                      <span className="font-semibold">Product Name:</span>{" "}
                      <span className="text-gray-700">{product.attributes.product_name}</span>
                    </p>
                    <p className="truncate">
                      <span className="font-semibold">Description:</span>{" "}
                      <span className="text-gray-700">
                        {product.attributes.part_description || "Sin descripción"}
                      </span>
                    </p>
                    <p>
                      <span className="font-semibold">Turn14 ID:</span>{" "}
                      {product.id}
                    </p>
                    <p>
                      <span className="font-semibold">Categoría:</span>{" "}
                      <span className="text-gray-700">
                        {traducirCategoria(product.attributes.category)}
                      </span>
                    </p>
                    <p>
                      <span className="font-semibold">Subcategoría:</span>{" "}
                      <span className="text-gray-700">
                        {traducirSubcategoria(product.attributes.subcategory)}
                      </span>
                    </p>
                    {isClearance && (
                      <p className="text-yellow-600 font-bold">
                        🏷️ Liquidación
                      </p>
                    )}
                  </div>
                </div>

                {/* Precio y controles */}
                <div className="shrink-0 flex flex-row sm:flex-col items-end sm:items-end justify-between sm:justify-start min-w-[150px] sm:min-w-[200px] gap-2 sm:gap-3 mt-2 sm:mt-0">
                  {/* Precios */}
                  <div className="text-right">
                    {product.pricing ? (
                      <>
                        {/* Retail Price (tachado) */}
                        {product.pricing.retailPrice && (
                          <div className="text-xs sm:text-sm text-zinc-600 mb-1">
                            <span className="font-semibold">Retail</span>
                            <span className="ml-2 line-through">
                              ${product.pricing.retailPrice.toFixed(2)}
                            </span>
                          </div>
                        )}

                        {/* Purchase Cost (precio principal) */}
                        <div className="text-xl sm:text-3xl font-bold text-orange-500 mb-1">
                          ${product.pricing.purchaseCost.toFixed(2)}
                        </div>

                        <div className="text-xs sm:text-sm text-zinc-600 italic">
                          Precio
                        </div>
                      </>
                    ) : (
                      <div className="text-xs sm:text-sm text-zinc-500 italic">
                        Precio no disponible
                      </div>
                    )}
                  </div>

                  {/* Cantidad y botón */}
                  <div className="space-y-2 w-full flex flex-row sm:flex-col justify-end items-end">
                    <input
                      type="number"
                      defaultValue="1"
                      min="1"
                      className="w-14 sm:w-16 px-2 py-1 border border-zinc-600 bg-zinc-100 rounded text-center text-sm text-zinc-900 font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-zinc-700 focus:border-zinc-700"
                    />
                    <button
                      type="button"
                      className="w-20 sm:w-22 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-semibold rounded transition-colors duration-200 shadow-sm"
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
        brandSlug={brandSlug}
      />

      {/* Dialog con detalles del producto */}
      <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Detalles del Producto</DialogTitle>
            <DialogClose className="absolute right-4 top-4">
              <X className="h-4 w-4" />
            </DialogClose>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-4 mt-4">
              {/* Imagen grande */}
              <div className="flex justify-center bg-zinc-50 rounded-lg p-4">
                {selectedProduct.attributes.thumbnail ? (
                  <Image
                    src={selectedProduct.attributes.thumbnail}
                    alt={selectedProduct.attributes.product_name}
                    className="object-contain max-h-64"
                    width={300}
                    height={256}
                  />
                ) : (
                  <span className="text-zinc-400">Sin imagen</span>
                )}
              </div>

              {/* Información principal */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-zinc-500">Pieza #</p>
                  <p className="text-lg font-medium text-cyan-600">
                    {selectedProduct.attributes.mfr_part_number}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-500">Turn14 ID</p>
                  <p className="text-lg">{selectedProduct.id}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-semibold text-zinc-500">Nombre del Producto</p>
                  <p className="text-lg">{selectedProduct.attributes.product_name}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-semibold text-zinc-500">Descripción</p>
                  <p className="text-gray-700">
                    {selectedProduct.attributes.part_description || "Sin descripción"}
                  </p>
                </div>
              </div>

              {/* Sección de precios */}
              {selectedProduct.pricing && (
                <div className="bg-zinc-50 rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold text-zinc-700">Información de Precios</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-zinc-500">Retail</p>
                      <p className="text-lg text-zinc-600 line-through">
                        ${selectedProduct.pricing.retailPrice?.toFixed(2) || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">MAP</p>
                      <p className="text-lg text-zinc-600">
                        ${selectedProduct.pricing.mapPrice?.toFixed(2) || "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">Tu Precio</p>
                      <p className="text-2xl font-bold text-orange-500">
                        ${selectedProduct.pricing.purchaseCost.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Sección de inventario */}
              {selectedProduct.inventory && (
                <div className="bg-zinc-50 rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold text-zinc-700">Inventario</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-zinc-500">Stock Total</p>
                      <p className={`text-lg font-medium ${
                        selectedProduct.inventory.hasStock
                          ? "text-green-600"
                          : "text-red-600"
                      }`}>
                        {selectedProduct.inventory.hasStock
                          ? `${selectedProduct.inventory.totalStock} unidades`
                          : "Sin stock"}
                      </p>
                    </div>
                    {selectedProduct.inventory.manufacturer && (
                      <div>
                        <p className="text-sm text-zinc-500">Stock del Fabricante</p>
                        <p className="text-lg text-orange-600">
                          {selectedProduct.inventory.manufacturer.stock} unidades
                          {selectedProduct.inventory.manufacturer.esd && (
                            <span className="text-sm text-zinc-500 ml-2">
                              (ESD: {formatDateSpanish(selectedProduct.inventory.manufacturer.esd)})
                            </span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Información adicional */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-semibold text-zinc-500">Fabricante</p>
                  <p>{selectedProduct.attributes.brand}</p>
                </div>
                <div>
                  <p className="font-semibold text-zinc-500">Pricing Group</p>
                  <p>{selectedProduct.attributes.price_group}</p>
                </div>
                <div>
                  <p className="font-semibold text-zinc-500">Categoría</p>
                  <p>{traducirCategoria(selectedProduct.attributes.category)}</p>
                </div>
                <div>
                  <p className="font-semibold text-zinc-500">Subcategoría</p>
                  <p>{traducirSubcategoria(selectedProduct.attributes.subcategory)}</p>
                </div>
                <div>
                  <p className="font-semibold text-zinc-500">Peso</p>
                  <p>{selectedProduct.attributes.dimensions[0]?.weight || "-"} lbs</p>
                </div>
                <div>
                  <p className="font-semibold text-zinc-500">Dimensiones</p>
                  <p>
                    {selectedProduct.attributes.dimensions[0]
                      ? `${selectedProduct.attributes.dimensions[0].length}" x ${selectedProduct.attributes.dimensions[0].width}" x ${selectedProduct.attributes.dimensions[0].height}"`
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-zinc-500">Part Number Alterno</p>
                  <p>{selectedProduct.attributes.alternate_part_number || "-"}</p>
                </div>
                <div>
                  <p className="font-semibold text-zinc-500">Barcode</p>
                  <p>{selectedProduct.attributes.barcode || "-"}</p>
                </div>
              </div>

              {/* Certificaciones */}
              <div className="flex flex-wrap gap-2">
                {selectedProduct.attributes.clearance_item && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                    Liquidación
                  </span>
                )}
                {selectedProduct.attributes.not_carb_approved && (
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                    No CARB
                  </span>
                )}
                {selectedProduct.attributes.carb_acknowledgement_required && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                    Requiere CARB
                  </span>
                )}
                {selectedProduct.attributes.prop_65 === "Y" && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                    Prop 65
                  </span>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
