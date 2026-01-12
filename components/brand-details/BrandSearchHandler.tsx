"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { ProductSearchPopup } from "@/components/main/ProductSearchPopup";
import type { MfrPartNumberSearchResult } from "@/application/actions/products";

interface BrandSearchHandlerProps {
  brandId: number;
  brandSlug: string;
}

export function BrandSearchHandler({ brandId, brandSlug }: BrandSearchHandlerProps) {
  const router = useRouter();

  const handleProductSelect = useCallback(
    (product: MfrPartNumberSearchResult) => {
      const productBrandSlug = product.brandSlug || product.brandId;
      // Si es de la misma marca, navegar con query param
      if (product.brandId === brandId) {
        router.push(`/brands/${brandSlug}?productId=${product.id}`, {
          scroll: false,
        });
      } else {
        // Si es de otra marca, navegar a esa marca
        router.push(`/brands/${productBrandSlug}?productId=${product.id}`, {
          scroll: false,
        });
      }
    },
    [brandId, brandSlug, router]
  );

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <ProductSearchPopup onProductSelect={handleProductSelect} />
      </div>
    </div>
  );
}
