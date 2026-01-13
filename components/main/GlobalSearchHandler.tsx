"use client";

import { useRouter } from "next/navigation";
import { ProductSearchPopup } from "@/components/main/ProductSearchPopup";
import type { MfrPartNumberSearchResult } from "@/application/actions/products";
import { generateProductUrl } from "@/lib/utils";

/**
 * Componente de búsqueda global para usar en el layout
 * Funciona en todas las páginas - navega directamente al producto encontrado
 */
export function GlobalSearchHandler() {
  const router = useRouter();

  const handleProductSelect = (product: MfrPartNumberSearchResult) => {
    // Navegar a la marca del producto con productName y productId en la URL
    const brandSlug = String(product.brandSlug || product.brandId);
    const productUrl = generateProductUrl(brandSlug, product.id, product.productName);
    router.push(productUrl, { scroll: false });
  };

  return <ProductSearchPopup onProductSelect={handleProductSelect} />;
}
