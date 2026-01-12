"use client";

import Image from "next/image";
import Link from "next/link";
import { ProductPriceAndStock } from "./ProductPriceAndStock";
import { ProductDetailDialog } from "./ProductDetailDialog";
import { useState } from "react";
import type { Product } from "@/domain/types/turn14/products";
import {
  traducirCategoria,
  traducirSubcategoria,
} from "@/constants/categorias";

interface SelectedProductViewProps {
  product: Product;
  brandId: number;
  brandSlug: string;
  pricesData: Array<{
    productId: string;
    purchaseCost: number;
    retailPrice: number | null;
    mapPrice: number | null;
  }> | null;
  inventory: Record<
    string,
    {
      hasStock: boolean;
      totalStock: number;
      manufacturer: {
        stock: number;
        esd: string;
      } | null;
    }
  > | null;
}

export function SelectedProductView({
  product,
  brandId,
  brandSlug,
  pricesData,
  inventory,
}: SelectedProductViewProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const isClearance = product.attributes.clearance_item ?? false;
  const productInventory = inventory?.[product.id] || null;
  const hasStock = productInventory?.hasStock ?? false;
  const manufacturerStock = productInventory?.manufacturer?.stock ?? 0;

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
    <div className="space-y-6">
      {/* Botón para volver */}
      <Link
        href={`/brands/${brandSlug}`}
        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors font-medium"
      >
        ← Volver a todos los productos de la marca
      </Link>

      {/* Producto encontrado */}
      <div
        className={`
          border-l-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col md:flex-row h-auto md:h-80
          ${getBorderColor()}
        `}
      >
        {/* Contenedor principal */}
        <div className="flex flex-col md:flex-row flex-1 p-6 gap-6">
          {/* Imagen */}
          <button
            onClick={() => setSelectedProduct(product)}
            className="w-full md:w-48 h-64 md:h-full shrink-0 bg-zinc-50 rounded flex items-center justify-center overflow-hidden hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            {product.attributes.thumbnail ? (
              <Image
                src={product.attributes.thumbnail}
                alt={product.attributes.product_name}
                className="object-contain"
                width={180}
                height={180}
              />
            ) : (
              <span className="text-zinc-400 text-sm">Sin imagen</span>
            )}
          </button>

          {/* Información del producto */}
          <div className="flex-1 min-w-0">
            {/* Part Number */}
            <button
              onClick={() => setSelectedProduct(product)}
              className="text-2xl md:text-4xl font-medium text-cyan-600 mb-3 hover:text-cyan-700 transition-colors cursor-pointer text-left"
            >
              Pieza #: {product.attributes.mfr_part_number}
            </button>

            {/* Detalles del producto */}
            <div className="space-y-2 text-lg text-gray-800">
              <p>
                <span className="font-semibold">Fabricante:</span>{" "}
                {product.attributes.product_name.split(" ")[0]}
                <span className="font-semibold ml-4">Pricing Group:</span>{" "}
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
                  {product.attributes.part_description || "Sin descripción"}
                </span>
              </p>
              <p>
                <span className="font-semibold">Turn14 ID:</span>{" "}
                <span className="font-mono text-sm">{product.id}</span>
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
                <p className="text-yellow-600 font-bold text-xl">
                  🏷️ Liquidación
                </p>
              )}
            </div>
          </div>

          {/* Precio e Inventario */}
          <div className="w-full md:w-64 shrink-0">
            {pricesData && inventory ? (
              <ProductPriceAndStock
                productId={product.id}
                pricing={
                  pricesData.find((p) => p.productId === product.id) || null
                }
                inventory={inventory[product.id] || null}
              />
            ) : (
              <div className="h-48 bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
                <span className="text-gray-400">Cargando precio...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dialog con detalles del producto */}
      <ProductDetailDialog
        product={selectedProduct}
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        pricesData={pricesData}
        inventory={inventory}
      />
    </div>
  );
}
