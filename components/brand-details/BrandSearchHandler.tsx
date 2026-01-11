"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { ProductSearchPopup } from "@/components/main/ProductSearchPopup";
import type { MfrPartNumberSearchResult } from "@/application/actions/products";

interface BrandSearchHandlerProps {
  brandId: number;
}

export function BrandSearchHandler({ brandId }: BrandSearchHandlerProps) {
  const router = useRouter();

  const handleProductSelect = useCallback(
    (product: MfrPartNumberSearchResult) => {
      // Si es de la misma marca, navegar con query param
      if (product.brandId === brandId) {
        router.push(`/brands/${brandId}?productId=${product.id}`, {
          scroll: false,
        });
      } else {
        // Si es de otra marca, navegar a esa marca
        router.push(`/brands/${product.brandId}?productId=${product.id}`, {
          scroll: false,
        });
      }
    },
    [brandId, router]
  );

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <ProductSearchPopup onProductSelect={handleProductSelect} />
      </div>
    </div>
  );
}
