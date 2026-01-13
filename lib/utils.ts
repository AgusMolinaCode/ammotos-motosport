import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Genera un slug a partir de un texto
 * Convierte a minúsculas, reemplaza espacios y caracteres especiales con guiones
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove special chars
    .replace(/[\s_-]+/g, "-") // Replace spaces/underscores with single hyphen
    .replace(/^-+|-+$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Genera un slug de producto con formato: productName-productId
 * Ejemplo: aceite-para-motor-premium-620863
 */
export function generateProductSlug(productId: string | number, productName: string): string {
  const id = String(productId);
  const nameSlug = generateSlug(productName);
  // Si el nombre está vacío o solo tiene espacios, retornar solo el ID
  if (!nameSlug) {
    return id;
  }
  return `${nameSlug}-${id}`;
}

/**
 * Extrae el productId de un productSlug
 * Soporta formatos: "620863" o "nombre-producto-620863"
 * Retorna el ID o null si no es válido
 */
export function extractProductId(productSlug: string): string | null {
  if (!productSlug) return null;
  // Verificar si es solo un número (ID directo)
  if (/^\d+$/.test(productSlug)) {
    return productSlug;
  }
  // Verificar si es formato "nombre-id" - buscar número al final
  const match = productSlug.match(/(\d+)$/);
  return match ? match[1] : null;
}

/**
 * Genera una URL de producto con el formato: /brands/{brandSlug}/{productSlug}
 */
export function generateProductUrl(brandSlug: string, productId: string | number, productName: string): string {
  const productSlug = generateProductSlug(productId, productName);
  return `/brands/${brandSlug}/${productSlug}`;
}

/**
 * Parsea una URL de producto y extrae sus componentes
 * Soporta: /brands/arrowhead/620863 y /brands/arrowhead/aceite-para-motor-620863
 */
export function parseProductUrl(pathname: string): { brandSlug: string; productSlug: string } | null {
  const match = pathname.match(/^\/brands\/([^/]+)\/([^/]+)$/);
  if (!match) return null;
  return {
    brandSlug: match[1],
    productSlug: match[2],
  };
}
