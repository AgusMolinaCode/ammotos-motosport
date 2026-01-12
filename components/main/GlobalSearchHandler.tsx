"use client";

import { useRouter } from "next/navigation";
import { ProductSearchPopup } from "@/components/main/ProductSearchPopup";
import type { MfrPartNumberSearchResult } from "@/application/actions/products";

/**
 * Componente de búsqueda global para usar en el layout
 * Funciona en todas las páginas - navega directamente al producto encontrado
 */
export function GlobalSearchHandler() {
  const router = useRouter();

  const handleProductSelect = (product: MfrPartNumberSearchResult) => {
    // Siempre navegar a la marca del producto con el productId
    router.push(`/brands/${product.brandId}?productId=${product.id}`, {
      scroll: false,
    });
  };

  return <ProductSearchPopup onProductSelect={handleProductSelect} />;
}
