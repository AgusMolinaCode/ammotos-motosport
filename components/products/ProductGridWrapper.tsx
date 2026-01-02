"use client";

import { useState, useEffect } from "react";
import { ProductGridInstant } from "./ProductGridInstant";
import type { Product } from "@/domain/types/turn14/products";

interface ProductGridWrapperProps {
  products: Product[];
  currentPage: number;
  totalPages: number;
  brandId: number;
  pricesData: Array<{
    productId: string;
    purchaseCost: number;
    retailPrice: number | null;
    mapPrice: number | null;
  }> | null;
  inventory: Record<string, {
    hasStock: boolean;
    totalStock: number;
    manufacturer: {
      stock: number;
      esd: string;
    } | null;
  }> | null;
}

/**
 * ⚡ CLIENT WRAPPER: Controla rendering progresivo en cliente
 *
 * PROBLEMA: Cuando Next.js prefetchea una página, los datos ya están en cache
 * y Suspense no se activa, mostrando todo de golpe.
 *
 * SOLUCIÓN: Este componente cliente controla el rendering manualmente:
 * 1. Render inicial: Muestra productos SIN datos (skeleton en precios)
 * 2. Después del mount: Muestra productos CON datos
 *
 * Esto garantiza que SIEMPRE veamos productos primero, sin importar el cache.
 */
export function ProductGridWrapper({
  products,
  currentPage,
  totalPages,
  brandId,
  pricesData,
  inventory,
}: ProductGridWrapperProps) {
  // Estado: controla si debemos mostrar los datos
  const [showData, setShowData] = useState(false);

  // Después del mount, activar los datos
  useEffect(() => {
    // Pequeño delay para asegurar que el usuario vea el skeleton primero
    const timer = setTimeout(() => {
      setShowData(true);
    }, 100); // 100ms - imperceptible pero asegura skeleton inicial

    return () => clearTimeout(timer);
  }, [currentPage]); // Re-ejecutar cuando cambie la página

  return (
    <ProductGridInstant
      products={products}
      currentPage={currentPage}
      totalPages={totalPages}
      brandId={brandId}
      pricesData={showData ? pricesData : null}
      inventory={showData ? inventory : null}
    />
  );
}
