"use client";

import { useState } from "react";
import Image from "next/image";
import { ProductSearchPopup } from "@/components/main/ProductSearchPopup";
import type { MfrPartNumberSearchResult } from "@/application/actions/products";

interface BrandSearchHandlerProps {
  brandId: number;
  children: React.ReactNode;
}

export function BrandSearchHandler({ brandId, children }: BrandSearchHandlerProps) {
  const [selectedProduct, setSelectedProduct] = useState<MfrPartNumberSearchResult | null>(null);

  const handleProductSelect = (product: MfrPartNumberSearchResult) => {
    // Solo mostrar si es de la misma marca
    if (product.brandId === brandId) {
      setSelectedProduct(product);
    } else {
      // Si es de otra marca, navegar
      window.location.href = `/brands/${product.brandId}/${product.id}`;
    }
  };

  const handleClearSelection = () => {
    setSelectedProduct(null);
  };

  if (selectedProduct) {
    return (
      <div>
        {/* Header con search y botón para volver */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleClearSelection}
              className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-2 transition-colors"
            >
              ← Volver a productos
            </button>
          </div>
          <div className="flex-1 max-w-md ml-8">
            <ProductSearchPopup onProductSelect={handleProductSelect} />
          </div>
        </div>

        {/* Producto único seleccionado */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start gap-6">
            {/* Thumbnail */}
            <div className="w-32 h-32 flex-shrink-0 rounded overflow-hidden bg-gray-100">
              {selectedProduct.thumbnail ? (
                <Image
                  src={selectedProduct.thumbnail}
                  alt={selectedProduct.productName}
                  width={128}
                  height={128}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                  Sin img
                </div>
              )}
            </div>

            {/* Info del producto */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedProduct.productName}
              </h2>
              <p className="text-lg text-gray-600 mb-1">
                <span className="font-medium">Número de parte:</span> {selectedProduct.mfrPartNumber}
              </p>
              <p className="text-gray-500 mb-4">
                <span className="font-medium">Marca:</span> {selectedProduct.brandName}
              </p>
              <a
                href={`/products/${selectedProduct.id}`}
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Ver detalles completos
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header normal con search */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <ProductSearchPopup onProductSelect={handleProductSelect} />
        </div>
      </div>
      {children}
    </div>
  );
}
