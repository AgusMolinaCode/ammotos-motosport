// Turn14 Pricing API Types
// API Endpoint: GET /v1/pricing/brand/{brand_id}?page={page}

export interface PricingResponse {
  meta: {
    total_pages: number;
  };
  data: PricingItem[];
  links: {
    self: string;
    first: string;
    prev?: string;
    next?: string;
    last: string;
  };
}

export interface PricingItem {
  id: string; // Product item_id (matches Product.id)
  type: "PricingItem";
  attributes: PricingAttributes;
}

export interface PricingAttributes {
  purchase_cost: number; // Distributor cost
  has_map: boolean; // Has MAP pricing policy
  can_purchase: boolean; // Available for purchase
  pricelists: Pricelist[]; // Array of price types
}

export interface Pricelist {
  name: string; // "map", "cost", "jobber", etc.
  price: number;
}

// Data transfer object for pricing service
export interface ProductPriceData {
  productId: string;
  purchaseCost: number;
  hasMap: boolean;
  canPurchase: boolean;
  pricelists: Pricelist[];
  mapPrice: number | null; // Extracted MAP price
  retailPrice: number | null; // Extracted Retail price
}

// Service return type with pagination
export interface PricingServiceResult {
  prices: ProductPriceData[];
  totalPages: number;
  currentPage: number;
  links: {
    self: string;
    first: string;
    last: string;
  };
}
