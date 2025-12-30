/**
 * Categorías de productos Turn14 con traducciones al español
 *
 * Mapeo de categorías en inglés (tal como vienen del API)
 * a español para mejor UX en el sitio.
 */

export type CategoryKey =
  | "Air Filters"
  | "Air Intake Systems"
  | "Apparel"
  | "Audio, Video & Radios"
  | "Bags & Packs"
  | "Batteries, Starting & Charging"
  | "Body"
  | "Body Armor & Protection"
  | "Brakes, Rotors & Pads"
  | "Bumpers"
  | "Bumpers, Grilles & Guards"
  | "Controls"
  | "Cooling"
  | "Data Acquisition"
  | "Deflectors"
  | "Drivetrain"
  | "Engine Components"
  | "Exhaust, Mufflers & Tips"
  | "Exterior Styling"
  | "Fabrication"
  | "Fender Flares & Trim"
  | "Floor Mats"
  | "Forced Induction"
  | "Fuel Delivery"
  | "Gauges & Pods"
  | "Grille Guards & Bull Bars"
  | "Ignition"
  | "Implements"
  | "Interior Accessories"
  | "Lights"
  | "Marketing"
  | "Misc Powersports"
  | "Nerf Bars & Running Boards"
  | "Oils & Oil Filters"
  | "Programmers & Chips"
  | "Roof Racks & Truck Racks"
  | "Roofs & Roof Accessories"
  | "Safety"
  | "Scratch & Dent"
  | "Seats"
  | "Services"
  | "Suspension"
  | "Tires"
  | "Tonneau Covers"
  | "Tools"
  | "Transport"
  | "Truck Bed Accessories"
  | "Uncategorized"
  | "Wheel and Tire Accessories"
  | "Wheels"
  | "Winches & Hitches"
  | "Windshields";

/**
 * Diccionario de traducciones de categorías
 */
export const CATEGORIAS: Record<CategoryKey, string> = {
  "Air Filters": "Filtros de Aire",
  "Air Intake Systems": "Sistemas de Admisión de Aire",
  "Apparel": "Indumentaria",
  "Audio, Video & Radios": "Audio, Video y Radios",
  "Bags & Packs": "Bolsas y Mochilas",
  "Batteries, Starting & Charging": "Baterías, Arranque y Carga",
  "Body": "Carrocería",
  "Body Armor & Protection": "Protección y Blindaje",
  "Brakes, Rotors & Pads": "Frenos, Discos y Pastillas",
  "Bumpers": "Paragolpes",
  "Bumpers, Grilles & Guards": "Paragolpes, Parrillas y Protectores",
  "Controls": "Controles",
  "Cooling": "Refrigeración",
  "Data Acquisition": "Adquisición de Datos",
  "Deflectors": "Deflectores",
  "Drivetrain": "Transmisión",
  "Engine Components": "Componentes del Motor",
  "Exhaust, Mufflers & Tips": "Escape, Silenciadores y Puntas",
  "Exterior Styling": "Estilo Exterior",
  "Fabrication": "Fabricación",
  "Fender Flares & Trim": "Extensiones de Guardabarros",
  "Floor Mats": "Alfombrillas",
  "Forced Induction": "Inducción Forzada",
  "Fuel Delivery": "Sistema de Combustible",
  "Gauges & Pods": "Medidores e Indicadores",
  "Grille Guards & Bull Bars": "Protectores de Parrilla",
  "Ignition": "Encendido",
  "Implements": "Implementos",
  "Interior Accessories": "Accesorios de Interior",
  "Lights": "Luces",
  "Marketing": "Marketing",
  "Misc Powersports": "Powersports Varios",
  "Nerf Bars & Running Boards": "Estribos y Pisaderas",
  "Oils & Oil Filters": "Aceites y Filtros de Aceite",
  "Programmers & Chips": "Programadores y Chips",
  "Roof Racks & Truck Racks": "Portaequipajes",
  "Roofs & Roof Accessories": "Techos y Accesorios",
  "Safety": "Seguridad",
  "Scratch & Dent": "Rayado y Abollado",
  "Seats": "Asientos",
  "Services": "Servicios",
  "Suspension": "Suspensión",
  "Tires": "Neumáticos",
  "Tonneau Covers": "Cubiertas de Caja",
  "Tools": "Herramientas",
  "Transport": "Transporte",
  "Truck Bed Accessories": "Accesorios para Caja de Camioneta",
  "Uncategorized": "Sin Categoría",
  "Wheel and Tire Accessories": "Accesorios para Ruedas y Neumáticos",
  "Wheels": "Ruedas",
  "Winches & Hitches": "Cabrestantes y Enganches",
  "Windshields": "Parabrisas",
};

/**
 * Helper para traducir una categoría
 * @param category - Categoría en inglés
 * @returns Categoría traducida al español, o la categoría original si no existe traducción
 */
export function traducirCategoria(category: string): string {
  return CATEGORIAS[category as CategoryKey] || category;
}

/**
 * Helper para obtener todas las categorías traducidas como array
 * @returns Array de objetos con id (inglés) y nombre (español)
 */
export function obtenerCategorias(): Array<{ id: CategoryKey; nombre: string }> {
  return Object.entries(CATEGORIAS).map(([id, nombre]) => ({
    id: id as CategoryKey,
    nombre,
  }));
}

/**
 * Helper para buscar categorías por término de búsqueda (español o inglés)
 * @param searchTerm - Término a buscar
 * @returns Array de categorías que coinciden con la búsqueda
 */
export function buscarCategorias(
  searchTerm: string
): Array<{ id: CategoryKey; nombre: string }> {
  const term = searchTerm.toLowerCase();
  return obtenerCategorias().filter(
    (cat) =>
      cat.id.toLowerCase().includes(term) ||
      cat.nombre.toLowerCase().includes(term)
  );
}

/**
 * Categorías agrupadas por tipo (útil para UI con múltiples columnas)
 */
export const CATEGORIAS_AGRUPADAS = {
  motor: [
    "Air Filters",
    "Air Intake Systems",
    "Cooling",
    "Engine Components",
    "Exhaust, Mufflers & Tips",
    "Forced Induction",
    "Fuel Delivery",
    "Ignition",
    "Oils & Oil Filters",
  ] as CategoryKey[],

  exterior: [
    "Body",
    "Body Armor & Protection",
    "Bumpers",
    "Bumpers, Grilles & Guards",
    "Deflectors",
    "Exterior Styling",
    "Fender Flares & Trim",
    "Grille Guards & Bull Bars",
    "Lights",
    "Roof Racks & Truck Racks",
    "Roofs & Roof Accessories",
    "Tonneau Covers",
    "Windshields",
  ] as CategoryKey[],

  interior: [
    "Apparel",
    "Audio, Video & Radios",
    "Bags & Packs",
    "Controls",
    "Floor Mats",
    "Gauges & Pods",
    "Interior Accessories",
    "Seats",
  ] as CategoryKey[],

  suspension_ruedas: [
    "Brakes, Rotors & Pads",
    "Nerf Bars & Running Boards",
    "Suspension",
    "Tires",
    "Wheel and Tire Accessories",
    "Wheels",
  ] as CategoryKey[],

  accesorios: [
    "Batteries, Starting & Charging",
    "Data Acquisition",
    "Implements",
    "Programmers & Chips",
    "Safety",
    "Tools",
    "Transport",
    "Truck Bed Accessories",
    "Winches & Hitches",
  ] as CategoryKey[],

  otros: [
    "Drivetrain",
    "Fabrication",
    "Marketing",
    "Misc Powersports",
    "Scratch & Dent",
    "Services",
    "Uncategorized",
  ] as CategoryKey[],
};

/**
 * Helper para obtener el grupo de una categoría
 * @param category - Categoría a buscar
 * @returns Nombre del grupo o null si no pertenece a ninguno
 */
export function obtenerGrupoCategoria(
  category: CategoryKey
): keyof typeof CATEGORIAS_AGRUPADAS | null {
  for (const [grupo, categorias] of Object.entries(CATEGORIAS_AGRUPADAS)) {
    if (categorias.includes(category)) {
      return grupo as keyof typeof CATEGORIAS_AGRUPADAS;
    }
  }
  return null;
}

/**
 * Nombres de los grupos en español
 */
export const NOMBRES_GRUPOS = {
  motor: "Motor y Rendimiento",
  exterior: "Exterior y Carrocería",
  interior: "Interior y Confort",
  suspension_ruedas: "Suspensión y Ruedas",
  accesorios: "Accesorios y Equipamiento",
  otros: "Otros",
} as const;
