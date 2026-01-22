import { getPricesByProductIds } from "@/application/actions/prices";
import { getInventoryByBrand, getInventoryByProductIds } from "@/application/actions/inventory";
import { ProductGridWrapper } from "./ProductGridWrapper";
import { SelectedProductView } from "./SelectedProductView";
import type { Product } from "@/domain/types/turn14/products";

interface ProductsWithDataProps {
  products: Product[];
  brandId?: number;
  brandSlug?: string;
  categorySlug?: string;
  currentPage: number;
  totalPages: number;
  selectedProductId?: string | null;
  selectedProduct?: Product | null; // Para backwards compatibility con páginas de marcas
  hideOutOfStock?: boolean;
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
  categorySlug,
  currentPage,
  totalPages,
  selectedProductId,
  selectedProduct,
  hideOutOfStock = false,
}: ProductsWithDataProps) {
  // Extraer IDs de productos
  const productIds = products.map((product) => product.id);

  // Fetch paralelo de precios e inventario
  // Ambos son OPTIONAL - si alguno falla, continuamos sin él
  const [pricesData, inventory] = await Promise.all([
    getPricesByProductIds(productIds).catch((error) => {
      console.warn(
        `⚠️ Prices unavailable, showing products without pricing:`,
        error instanceof Error ? error.message : error
      );
      return null;
    }),
    // Para categorías, usar getInventoryByProductIds; para marcas, usar getInventoryByBrand
    categorySlug
      ? getInventoryByProductIds(productIds).catch((error) => {
          console.warn(
            `⚠️ Inventory unavailable for category ${categorySlug}, showing products without stock info:`,
            error instanceof Error ? error.message : error
          );
          return null;
        })
      : brandId
      ? getInventoryByBrand(brandId).catch((error) => {
          console.warn(
            `⚠️ Inventory unavailable for brand ${brandId}, showing products without stock info:`,
            error instanceof Error ? error.message : error
          );
          return null;
        })
      : Promise.resolve(null),
  ]);

  // Si hay un producto seleccionado (新旧两种方式都支持)
  const effectiveSelectedProduct = selectedProduct || (selectedProductId ? products.find((p) => p.id === selectedProductId) || null : null);
  if (effectiveSelectedProduct) {
    return (
      <SelectedProductView
        product={effectiveSelectedProduct}
        brandId={brandId}
        brandSlug={brandSlug}
        categorySlug={categorySlug}
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
      categorySlug={categorySlug}
      pricesData={pricesData}
      inventory={inventory}
      hideOutOfStock={hideOutOfStock}
    />
  );
}
