import { getPricesByProductIds } from "@/application/actions/prices";
import { getInventoryByBrand } from "@/application/actions/inventory";
import { ProductGridWrapper } from "./ProductGridWrapper";
import type { Product } from "@/domain/types/turn14/products";

interface ProductsWithDataProps {
  products: Product[];
  brandId: number;
  currentPage: number;
  totalPages: number;
}

/**
 * ⚡ SERVER COMPONENT: Fetch de precios e inventario
 * Usa ProductGridWrapper (client) para controlar rendering progresivo
 * y evitar que cache de Next.js muestre todo de golpe
 */
export async function ProductsWithData({
  products,
  brandId,
  currentPage,
  totalPages,
}: ProductsWithDataProps) {
  // Extraer IDs de productos
  const productIds = products.map((product) => product.id);

  // Fetch paralelo de precios e inventario
  const [pricesData, inventory] = await Promise.all([
    getPricesByProductIds(productIds),
    getInventoryByBrand(brandId),
  ]);

  return (
    <ProductGridWrapper
      products={products}
      currentPage={currentPage}
      totalPages={totalPages}
      brandId={brandId}
      pricesData={pricesData}
      inventory={inventory}
    />
  );
}
