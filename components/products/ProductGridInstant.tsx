"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ProductPagination } from "./ProductPagination";
import { EmptyPageMessage } from "./EmptyPageMessage";
import { ProductPriceAndStock } from "./ProductPriceAndStock";
import { ProductPriceSkeleton } from "./ProductPriceSkeleton";
import { ProductGridSkeleton } from "./ProductGridSkeleton";
import type { Product } from "@/domain/types/turn14/products";
import { traducirCategoria, traducirSubcategoria } from "@/constants/categorias";

interface ProductGridInstantProps {
  products: Product[];
  currentPage: number;
  totalPages: number;
  brandId: number;
  pricesData?: Array<{
    productId: string;
    purchaseCost: number;
    retailPrice: number | null;
    mapPrice: number | null;
  }> | null;
  inventory?: Record<string, {
    hasStock: boolean;
    totalStock: number;
    manufacturer: {
      stock: number;
      esd: string;
    } | null;
  }> | null;
}

/**
 * ⚡ GRID OPTIMIZADO: Muestra productos con/sin datos
 * Si no hay precios/inventario, muestra skeleton
 */
export function ProductGridInstant({
  products,
  currentPage,
  totalPages,
  brandId,
  pricesData = null,
  inventory = null,
}: ProductGridInstantProps) {
  const [isNavigating, setIsNavigating] = useState(false);

  // Callback para cuando se navega
  const handleNavigate = () => {
    setIsNavigating(true);
  };

  // Resetear estado de navegación cuando cambia la página
  useEffect(() => {
    setIsNavigating(false);
  }, [currentPage]);

  // Si está navegando, mostrar skeleton completo
  if (isNavigating) {
    return (
      <>
        <ProductGridSkeleton count={products.length || 12} />
        <ProductPagination
          currentPage={currentPage}
          totalPages={totalPages}
          brandId={brandId}
          onNavigate={handleNavigate}
        />
      </>
    );
  }

  // Si no hay productos, mostrar mensaje de página vacía
  if (products.length === 0) {
    return <EmptyPageMessage brandId={brandId} currentPage={currentPage} />;
  }

  return (
    <>
      {/* Lista de productos */}
      <div className="space-y-3 mb-8">
        {products.map((product) => {
          const isClearance = product.attributes.clearance_item ?? false;

          // Extraer datos de inventario si están disponibles
          const productInventory = inventory?.[product.id] || null;
          const hasStock = productInventory?.hasStock ?? false;
          const manufacturerStock = productInventory?.manufacturer?.stock ?? 0;

          // Función de color de borde (igual que ProductGrid.tsx)
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

                  {/* Detalles del producto */}
                  <div className="space-y-0.5 text-md text-gray-800">
                    <p>
                      <span className="font-semibold">Fabricante:</span>{" "}
                      {product.attributes.product_name.split(" ")[0]}{" "}
                      <span className="font-semibold ml-2">Pricing Group:</span>{" "}
                      {product.attributes.price_group}
                    </p>
                    <p>
                      <span className="font-semibold">Product Name:</span>{" "}
                      <span className="text-gray-700">
                        {product.attributes.product_name}
                      </span>
                    </p>
                    <p className="truncate">
                      <span className="font-semibold">Description:</span>{" "}
                      <span className="text-gray-700">
                        {product.attributes.part_description ||
                          "Sin descripción"}
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

                {/* ⚡ PRECIO E INVENTARIO */}
                {/* Muestra skeleton si los datos no están disponibles */}
                {pricesData && inventory ? (
                  <ProductPriceAndStock
                    productId={product.id}
                    pricing={pricesData.find((p) => p.productId === product.id) || null}
                    inventory={inventory[product.id] || null}
                  />
                ) : (
                  <ProductPriceSkeleton />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Paginación */}
      <ProductPagination
        currentPage={currentPage}
        totalPages={totalPages}
        brandId={brandId}
        onNavigate={handleNavigate}
      />
    </>
  );
}
