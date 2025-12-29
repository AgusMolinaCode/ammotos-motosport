export interface ProductsResponse {
  meta: {
    total_pages: number;
  };
  data: Product[];
  links: {
    self: string;
    first: string;
    prev?: string;
    next?: string;
    last: string;
  };
}

export interface Product {
  id: string; // Puede contener letras, ej: "13504G"
  type: "Item";
  attributes: ProductAttributes;
}

export interface ProductAttributes {
  // Identificación
  product_name: string;
  part_number: string; // Turn14 internal part number
  mfr_part_number: string; // Manufacturer part number
  part_description: string; // Puede estar vacío ""

  // Categorización
  category: string;
  subcategory: string;

  // Dimensiones físicas
  dimensions: Dimensions[];

  // Brand relationship
  brand_id: number; // Es un número, no string
  brand: string; // Nombre del brand

  // Price group (NO precios reales)
  price_group_id: number;
  price_group: string;

  // Status flags
  active: boolean;
  born_on_date: string; // Formato: "YYYY-MM-DD"
  regular_stock: boolean;
  powersports_indicator: boolean;
  clearance_item: boolean;

  // Shipping & logistics
  dropship_controller_id: number;
  air_freight_prohibited: boolean;
  ltl_freight_required: boolean;
  units_per_sku: number;

  // Compliance
  not_carb_approved: boolean;
  carb_acknowledgement_required: boolean;
  carb_eo_number?: string | null;
  prop_65: string; // "Y", "N", "Unknown"
  epa: string; // "N/A", "Unknown", etc.

  // Warehouse & availability
  warehouse_availability: WarehouseAvailability[];

  // Media
  thumbnail: string; // URL única, no array de images

  // Identification codes
  barcode?: string;
  alternate_part_number?: string | null;

  // Kit items (opcional, solo para productos tipo kit)
  contents?: KitContent[] | null;
}

// Interfaces auxiliares
export interface Dimensions {
  box_number: number;
  length: number; // inches
  width: number;  // inches
  height: number; // inches
  weight: number; // pounds
}

export interface WarehouseAvailability {
  location_id: string; // "01", "02", "03", etc.
  can_place_order: boolean;
}

export interface KitContent {
  item_id: number;
  quantity: number;
}
