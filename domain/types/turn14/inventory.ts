/**
 * DOMAIN TYPES: Turn14 Inventory API Response
 *
 * Interfaces para la respuesta de GET /inventory/brand/{brand_id}
 */

export interface InventoryByLocation {
  [locationId: string]: number; // "59": 1, "01": 2, etc.
}

export interface ManufacturerStock {
  stock: number;
  esd: string; // Estimated Ship Date - formato "YYYY-MM-DD"
}

export interface InventoryItemAttributes {
  inventory: InventoryByLocation;
  manufacturer?: ManufacturerStock; // Opcional - no todos los items tienen manufacturer
}

export interface InventoryItem {
  type: "InventoryItem";
  id: string; // Item ID
  attributes: InventoryItemAttributes;
  relationships: {
    item: {
      links: string; // "/v1/items/15074"
    };
  };
}

export interface BrandInventoryResponse {
  meta: {
    total_pages: number;
  };
  data: InventoryItem[];
  links: {
    self: string;
    first: string;
    prev?: string;
    next?: string;
    last: string;
  };
}
