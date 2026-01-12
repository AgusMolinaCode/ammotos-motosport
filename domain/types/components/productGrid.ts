import type { Product as Turn14Product } from "../turn14/products";

// Product con pricing e inventory agregados
export interface ProductWithDetails extends Turn14Product {
  attributes: Turn14Product["attributes"] & {
    clearance_item?: boolean;
  };
  pricing?: {
    mapPrice: number | null;
    retailPrice: number | null;
    purchaseCost: number;
    hasMap: boolean;
    canPurchase: boolean;
  } | null;
  inventory?: {
    totalStock: number;
    hasStock: boolean;
    inventory: Record<string, number>;
    manufacturer: {
      stock: number;
      esd: string;
    } | null;
  } | null;
}

export interface ProductGridProps {
  products: ProductWithDetails[];
  currentPage: number;
  totalPages: number;
  brandId: number;
  brandSlug: string;
}
