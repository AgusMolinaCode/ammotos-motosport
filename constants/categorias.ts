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

/**
 * Diccionario de traducciones de subcategorías
 * Se irá expandiendo a medida que se descubran nuevas subcategorías
 */
export const SUBCATEGORIAS: Record<string, string> = {
  // Fuel Delivery System
  "Carburetor Jets": "Chicles de Carburador",

  // Truck Bed Accessories
  "Bed Bars": "Barras de Caja",
  "Bed Steps": "Escalones de Caja",
  "Brackets": "Soportes",
  "Fuel Caps": "Tapas de Combustible",
  "Hardware - Singles": "Herrajes - Individuales",
  "Running Boards": "Pisaderas",
  "Wiring Connectors": "Conectores Eléctricos",

  // Body & Exterior (Carrocería y Exterior)
  "Doors": "Puertas",
  "Hoods": "Capós",
  "Fenders": "Guardabarros",
  "Trunks": "Maleteros",
  "Roofs": "Techos",
  "Spoilers": "Alerones",
  "Side Skirts": "Faldones Laterales",
  "Lips & Splitters": "Labios y Divisores",
  "Window Louvers": "Persianas de Ventana",
  "Diffusers": "Difusores",
  "Grilles": "Parrillas",
  "Bumper Covers - Front": "Cubiertas de Paragolpes - Delantero",
  "Bumper Covers - Rear": "Cubiertas de Paragolpes - Trasero",
  "Hood Vents": "Ventilaciones de Capó",
  "Radiator Cooling Plates": "Placas de Enfriamiento del Radiador",
  "Engine Covers": "Cubiertas de Motor",
  "Carbon Accessories": "Accesorios de Carbono",

  // Suspension & Steering
  "Coil Springs": "Resortes Helicoidales",
  "Control Arms": "Brazos de Control",
  "Shocks": "Amortiguadores",
  "Struts": "Puntales",
  "Sway Bars": "Barras Estabilizadoras",
  "Leveling Kits": "Kits de Nivelación",
  "Lift Kits": "Kits de Elevación",

  // Wheels & Tires
  "Wheels": "Ruedas",
  "Tires": "Neumáticos",
  "Wheel Spacers": "Espaciadores de Rueda",
  "Lug Nuts": "Tuercas de Rueda",
  "Automotive/UTV Tires - Off Road": "Neumáticos Automotrices/UTV - Todoterreno",
  "Automotive/UTV Tires - On Road": "Neumáticos Automotrices/UTV - Carretera",

  // Exhaust (Escape)
  "Mufflers": "Silenciadores",
  "Muffler": "Silenciador",
  "Cat-Back Exhaust": "Escape Cat-Back",
  "Headers": "Colectores",
  "Headers & Manifolds": "Colectores y Múltiples",
  "Tips": "Puntas de Escape",
  "Powersports Exhausts": "Escapes Powersports",
  "Spark Arrestors": "Arrestachispas",
  "2-Stroke Pipes": "Tubos de Escape 2 Tiempos",
  "2-Stroke Silencers": "Silenciadores 2 Tiempos",
  "Exhaust Hangers": "Soportes de Escape",
  "Exhaust Hardware": "Herrajes de Escape",
  "Flanges": "Bridas",
  "Heat Shields": "Escudos Térmicos",

  // Lighting
  "LED Light Bars": "Barras LED",
  "Headlights": "Faros Delanteros",
  "Tail Lights": "Luces Traseras",
  "Fog Lights": "Luces de Niebla",
  "Work Lights": "Luces de Trabajo",

  // Body & Exterior
  "Bumpers": "Paragolpes",
  "Bumpers - Steel": "Paragolpes - Acero",
  "Fender Flares": "Extensiones de Guardabarros",
  "Side Steps": "Estribos Laterales",
  "Tonneau Covers": "Cubiertas de Caja",
  "Bed Liners": "Protectores de Caja",

  // Engine & Performance
  "Air Filters": "Filtros de Aire",
  "Cold Air Intakes": "Admisiones de Aire Frío",
  "Throttle Bodies": "Cuerpos de Aceleración",
  "Fuel Injectors": "Inyectores de Combustible",
  "Spark Plugs": "Bujías",
  "Water Pumps": "Bombas de Agua",
  "Pulleys - Crank, Underdrive": "Poleas - Cigüeñal, Subimpulsión",
  "Belts - Timing, Accessory": "Correas - Distribución, Accesorios",
  "Gasket Kits": "Kits de Juntas",
  "O-Rings": "Juntas Tóricas",

  // Valvetrain (Tren de Válvulas)
  "Valve Lash Caps": "Tapas de Juego de Válvulas",
  "Valve Springs, Retainers": "Resortes y Retenedores de Válvulas",
  "Valve Locks": "Seguros de Válvulas",
  "Valve Guides": "Guías de Válvulas",
  "Valve Seals": "Retenes de Válvulas",
  "Lifters": "Levantaválvulas",
  "Rocker Arms": "Balancines",

  // Fuel Delivery System
  "Fuel Tanks": "Tanques de Combustible",
  "Fuel Systems": "Sistemas de Combustible",
  "Fuel Pumps": "Bombas de Combustible",
  "Fuel Pressure Regulators": "Reguladores de Presión de Combustible",
  "Fuel Filters": "Filtros de Combustible",
  "Fuel Rails": "Rieles de Combustible",
  "Fuel Manifolds": "Colectores de Combustible",
  "Fuel Components Misc": "Componentes de Combustible Varios",

  // Hardware & Accessories
  "Fittings": "Acopladores",
  "Valves": "Válvulas",
  "Wiring Harnesses": "Arneses de Cableado",
  "Hoses": "Mangueras",
  "Clamps": "Abrazaderas",
  "Gauges": "Medidores",
  "Grips": "Puños",
  "Keychains": "Llaveros",
  "License Frame": "Marcos de Matrícula",
  "Tools": "Herramientas", // Puede aparecer como categoría o subcategoría
  "Marketing": "Marketing",
  "Stickers/Decals/Banners": "Calcomanías/Adhesivos/Banners",

  // Interior
  "Floor Mats": "Alfombrillas",
  "Seat Covers": "Fundas de Asientos",
  "Cargo Liners": "Protectores de Carga",
  "Dash Kits": "Kits de Tablero",

  // Electronics & Audio
  "Speakers": "Parlantes",
  "Subwoofers": "Subwoofers",
  "Amplifiers": "Amplificadores",
  "Head Units": "Unidades Principales",

  // Recovery & Towing
  "Winches": "Cabrestantes",
  "Hitches": "Enganches",
  "Recovery Straps": "Correas de Recuperación",
  "D-Rings": "Aros D",
  "Shackles": "Grilletes",

  // Pistons & Connecting Rods (Pistones y Bielas)
  "Piston Sets - Forged - 4cyl": "Conjuntos de Pistones - Forjados - 4cil",
  "Pistons - Forged - Single": "Pistones - Forjados - Individual",
  "Piston Sets - Forged - 6cyl": "Conjuntos de Pistones - Forjados - 6cil",
  "Piston Pins": "Pernos de Pistón",
  "Piston Pin Locks": "Seguros de Perno de Pistón",
  "Piston Rings": "Aros de Pistón",
  "Piston Sets - Forged - 8cyl": "Conjuntos de Pistones - Forjados - 8cil",
  "Connecting Rod Bushings": "Bujes de Biela",
  "Piston Sets - Diesel": "Conjuntos de Pistones - Diésel",
  "Piston Coating": "Recubrimiento de Pistones",
  "Piston Sets - Powersports": "Conjuntos de Pistones - Powersports",
  "Piston Sets - Custom": "Conjuntos de Pistones - Personalizados",
  "Piston Sets - Forged - 5cyl": "Conjuntos de Pistones - Forjados - 5cil",
  "Connecting Rods - 4Cyl": "Bielas - 4Cil",
  "Connecting Rods": "Bielas",
  "Connecting Rods - 6Cyl": "Bielas - 6Cil",

  // Exterior Styling - Additional subcategories
  "Bed Caps": "Tapas de Caja",
  "Body Armor & Rock Rails": "Protección de Carrocería y Rieles de Roca",
  "Exterior Trim": "Molduras Exteriores",
  "Hardware Kits - Other": "Kits de Herrajes - Otros",
  "Light Accessories and Wiring": "Accesorios de Iluminación y Cableado",
  "Mud Flaps": "Guardabarros",
  "Roof Rack": "Portaequipajes de Techo",
  "Tailgate Caps": "Tapas de Compuerta",

  // Electronics & Tuning (Electrónica y Afinación)
  "Programmers & Tuners": "Programadores y Afinadores",
  "Programmer Accessories": "Accesorios para Programadores",
  "Launch Controllers": "Controladores de Lanzamiento",
  "Throttle Controllers": "Controladores de Acelerador",

  // Drivetrain - Clutch (Transmisión - Embrague)
  "Clutch Kits - Single": "Kits de Embrague - Individual",
  "Clutch Rebuild Kits": "Kits de Reconstrucción de Embrague",
  "Pressure Plates": "Platos de Presión",
  "Shifters": "Palancas de Cambio",

  // Air Intake (Admisión de Aire)
  "Air Intake Components": "Componentes de Admisión de Aire",
  "Silicone Couplers & Hoses": "Acopladores y Mangueras de Silicona",

  // Ignition (Encendido)
  "Ignition Coils - Upgrade": "Bobinas de Encendido - Mejora",

  // Marketing & Display
  "POP Displays": "Exhibidores POP",

  // Safety & Apparel (Seguridad e Indumentaria)
  "Helmets and Accessories": "Cascos y Accesorios",
  "Racing Suits": "Trajes de Carrera",

  // Air Filters & Intakes (Filtros de Aire y Admisiones)
  "Air Filters - Direct Fit": "Filtros de Aire - Ajuste Directo",
  "Short Ram Air Intakes": "Admisiones de Aire Ram Corto",

  // Engine Components (Componentes del Motor)
  "Camshafts": "Árboles de Levas",
  "Connecting Pipes": "Tubos de Conexión",
  "Dipsticks": "Varillas de Medición",
  "Engine Mounts": "Soportes de Motor",
  "Intake Manifolds": "Múltiples de Admisión",

  // Cooling System (Sistema de Refrigeración)
  "Cooling Packages": "Paquetes de Refrigeración",
  "Expansion Tanks": "Tanques de Expansión",
  "Radiators": "Radiadores",

  // Oil System (Sistema de Aceite)
  "Oil Caps": "Tapas de Aceite",
  "Oil Coolers": "Enfriadores de Aceite",
  "Oil Filter Other": "Filtro de Aceite - Otros",
  "Oil Line Kits": "Kits de Líneas de Aceite",
  "Oil Pans": "Cárteres de Aceite",
  "Oil Separators": "Separadores de Aceite",

  // Fuel System (Sistema de Combustible)
  "Flex Fuel Kit": "Kit de Combustible Flexible",
  "Fuel Lines": "Líneas de Combustible",
  "Injection Pump Components": "Componentes de Bomba de Inyección",

  // Forced Induction (Inducción Forzada)
  "Intercooler Kits": "Kits de Intercooler",
  "Intercooler Pipe Kits": "Kits de Tuberías de Intercooler",
  "Intercoolers": "Intercoolers",
  "Turbo Kits": "Kits Turbo",
  "Turbo Upgrade Components": "Componentes de Mejora Turbo",

  // Exhaust System (Sistema de Escape)
  "Downpipes": "Bajantes de Escape",

  // Drivetrain & Transmission (Transmisión)
  "Clutch Lines": "Líneas de Embrague",
  "Clutch Master Cylinder": "Cilindro Maestro de Embrague",
  "Differentials": "Diferenciales",
  "Diff Covers": "Tapas de Diferencial",
  "Flywheels": "Volantes de Motor",
  "Shift Knobs": "Perillas de Cambio",
  "Shifter Bushings": "Bujes de Palanca de Cambio",
  "Transmission Coolers": "Enfriadores de Transmisión",
  "Transmission Filters": "Filtros de Transmisión",

  // Brakes (Frenos)
  "Brake Kits - Performance Drill": "Kits de Frenos - Perforados de Rendimiento",
  "Brake Line Kits": "Kits de Líneas de Freno",
  "Line Locks": "Bloqueadores de Línea",

  // Suspension & Chassis (Suspensión y Chasis)
  "Suspension Arms & Components": "Brazos y Componentes de Suspensión",
  "Sway Bar Endlinks": "Enlaces de Barra Estabilizadora",

  // Exterior & Accessories (Exterior y Accesorios)
  "Bumper Accessories": "Accesorios para Paragolpes",

  // Sensors & Electronics (Sensores y Electrónica)
  "Mass Air Flow Sensors": "Sensores de Flujo de Aire Másico",

  // Hardware & Fasteners (Herrajes y Sujetadores)
  "Bolts": "Pernos",
  "Main Stud & Bolt Kits": "Kits de Espárragos y Pernos Principales",

  // Safety & Racing (Seguridad y Carreras) - Nuevas traducciones
  "Gloves": "Guantes",
  "Horn Accessories": "Accesorios de Bocina",
  "Seat Belts & Harnesses": "Cinturones de Seguridad y Arneses",
  "Steering Wheel Hubs": "Mazas de Volante",
  "Steering Wheels": "Volantes de Dirección",
  "Tow Straps": "Correas de Remolque",
};

/**
 * Helper para traducir una subcategoría
 * @param subcategory - Subcategoría en inglés
 * @returns Subcategoría traducida al español, o la subcategoría original si no existe traducción
 *
 * NOTA: Si no encuentra traducción, registra en consola para agregarlo al diccionario
 */
export function traducirSubcategoria(subcategory: string): string {
  const traduccion = SUBCATEGORIAS[subcategory];

  // Si no hay traducción, registrar en consola para agregarla después
  if (!traduccion && typeof window === 'undefined') {
    console.log(`⚠️ Subcategoría sin traducción: "${subcategory}"`);
  }

  return traduccion || subcategory;
}
