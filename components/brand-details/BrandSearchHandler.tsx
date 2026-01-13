"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { ProductSearchPopup } from "@/components/main/ProductSearchPopup";
import type { MfrPartNumberSearchResult } from "@/application/actions/products";
import { generateProductUrl } from "@/lib/utils";

interface BrandSearchHandlerProps {
  brandId: number;
  brandSlug: string;
}

export function BrandSearchHandler({ brandId, brandSlug }: BrandSearchHandlerProps) {
  const router = useRouter();

  const handleProductSelect = useCallback(
    (product: MfrPartNumberSearchResult) => {
      const productBrandSlug = String(product.brandSlug || product.brandId);
      // Navegar con el productName y productId en la URL
      if (product.brandId === brandId) {
        const productUrl = generateProductUrl(brandSlug, product.id, product.productName);
        router.push(productUrl, { scroll: false });
      } else {
        const productUrl = generateProductUrl(productBrandSlug, product.id, product.productName);
        router.push(productUrl, { scroll: false });
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
