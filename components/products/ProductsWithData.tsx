import { getPricesByProductIds } from "@/application/actions/prices";
import { getInventoryByBrand } from "@/application/actions/inventory";
import { ProductGridWrapper } from "./ProductGridWrapper";
import { SelectedProductView } from "./SelectedProductView";
import type { Product } from "@/domain/types/turn14/products";

interface ProductsWithDataProps {
  products: Product[];
  brandId: number;
  brandSlug: string;
  currentPage: number;
  totalPages: number;
  selectedProduct?: Product | null;
}

/**
 * ⚡ SERVER COMPONENT: Fetch de precios e inventario
 * Usa ProductGridWrapper (client) para controlar rendering progresivo
 * y evitar que cache de Next.js muestre todo de golpe
 *
 * NOTA: Si el inventario falla (ej. API Turn14 no disponible), continuamos
 * sin él para que los productos se muestren igual (sin datos de stock)
 */
export async function ProductsWithData({
  products,
  brandId,
  brandSlug,
  currentPage,
  totalPages,
  selectedProduct,
}: ProductsWithDataProps) {
  // Extraer IDs de productos
  const productIds = products.map((product) => product.id);

  // Fetch paralelo de precios e inventario
  // Ambos son OPTIONAL - si alguno falla, continuamos sin él
  const [pricesData, inventory] = await Promise.all([
    getPricesByProductIds(productIds).catch((error) => {
      console.warn(
        `⚠️ Prices unavailable for brand ${brandId}, showing products without pricing:`,
        error instanceof Error ? error.message : error
      );
      return null;
    }),
    getInventoryByBrand(brandId).catch((error) => {
      console.warn(
        `⚠️ Inventory unavailable for brand ${brandId}, showing products without stock info:`,
        error instanceof Error ? error.message : error
      );
      return null;
    }),
  ]);

  // Si hay un producto seleccionado, usar SelectedProductView
  if (selectedProduct) {
    return (
      <SelectedProductView
        product={selectedProduct}
        brandId={brandId}
        brandSlug={brandSlug}
        pricesData={pricesData}
        inventory={inventory}
      />
    );
  }

  // Otherwise, show the normal grid
  return (
    <ProductGridWrapper
      products={products}
      currentPage={currentPage}
      totalPages={totalPages}
      brandId={brandId}
      brandSlug={brandSlug}
      pricesData={pricesData}
      inventory={inventory}
    />
  );
}
