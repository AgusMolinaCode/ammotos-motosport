/**
 * DOMAIN TYPES: Turn14 Individual Brand API Response
 *
 * Interfaces para la respuesta de GET /v1/brands/{brand_id}
 */

import type { PriceGroup } from "./brands";

export interface IndividualBrandAttributes {
  name: string;
  dropship: boolean;
  logo: string;
  pricegroups: PriceGroup[];
  AAIA?: string[];
}

export interface IndividualBrandData {
  type: "IndividualBrand";
  id: string;
  attributes: IndividualBrandAttributes;
}

export interface IndividualBrandResponse {
  data: IndividualBrandData;
}
