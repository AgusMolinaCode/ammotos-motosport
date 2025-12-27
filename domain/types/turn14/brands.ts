/**
 * DOMAIN TYPES: Turn14 Brands API Response
 *
 * Interfaces para la respuesta de GET /brands
 */

export interface PurchaseRestriction {
  program: string;
  your_status: string;
}

export interface LocationRule {
  country: string;
  state: string;
  type: string;
  fee: number;
}

export interface PriceGroup {
  pricegroup_id: number;
  pricegroup_name: string;
  pricegroup_prefix: string;
  purchase_restrictions: PurchaseRestriction[];
  location_rules: LocationRule[];
}

export interface BrandAttributes {
  name: string;
  dropship: boolean;
  logo: string;
  pricegroups: PriceGroup[];
  AAIA?: string[];
}

export interface Brand {
  id: string;
  type: "Brand";
  attributes: BrandAttributes;
}

export interface BrandsResponse {
  data: Brand[];
}
