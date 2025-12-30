# Constants

Archivo de constantes globales del proyecto.

## Categorías (`categorias.ts`)

Traducciones al español de las categorías de productos Turn14.

### Uso Básico

```typescript
import { CATEGORIAS, traducirCategoria } from "@/constants/categorias";

// Traducir una categoría individual
const categoria = "Air Filters";
const traduccion = traducirCategoria(categoria);
// => "Filtros de Aire"

// Acceso directo al diccionario
console.log(CATEGORIAS["Suspension"]);
// => "Suspensión"
```

### Listar Todas las Categorías

```typescript
import { obtenerCategorias } from "@/constants/categorias";

const todasLasCategorias = obtenerCategorias();
// => [{ id: "Air Filters", nombre: "Filtros de Aire" }, ...]

// Ejemplo: Dropdown de categorías
<select>
  {todasLasCategorias.map((cat) => (
    <option key={cat.id} value={cat.id}>
      {cat.nombre}
    </option>
  ))}
</select>
```

### Buscar Categorías

```typescript
import { buscarCategorias } from "@/constants/categorias";

// Buscar por término (español o inglés)
const resultados = buscarCategorias("suspensión");
// => [{ id: "Suspension", nombre: "Suspensión" }]

const resultados2 = buscarCategorias("brake");
// => [{ id: "Brakes, Rotors & Pads", nombre: "Frenos, Discos y Pastillas" }]
```

### Categorías Agrupadas

```typescript
import { CATEGORIAS_AGRUPADAS, NOMBRES_GRUPOS } from "@/constants/categorias";

// Mostrar categorías por grupo
Object.entries(CATEGORIAS_AGRUPADAS).map(([grupo, categorias]) => (
  <div key={grupo}>
    <h3>{NOMBRES_GRUPOS[grupo]}</h3>
    <ul>
      {categorias.map((cat) => (
        <li key={cat}>{traducirCategoria(cat)}</li>
      ))}
    </ul>
  </div>
));
```

### Ejemplo Completo: ProductGrid con Categoría Traducida

```typescript
import { traducirCategoria } from "@/constants/categorias";

interface Product {
  id: string;
  attributes: {
    product_name: string;
    category: string; // Viene en inglés del API
  };
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <div>
      <h3>{product.attributes.product_name}</h3>
      <p className="text-sm text-gray-500">
        {traducirCategoria(product.attributes.category)}
      </p>
    </div>
  );
}
```

### Grupos Disponibles

- **Motor y Rendimiento**: Filtros, sistemas de admisión, escape, etc.
- **Exterior y Carrocería**: Paragolpes, luces, protectores, etc.
- **Interior y Confort**: Asientos, audio, alfombrillas, etc.
- **Suspensión y Ruedas**: Frenos, suspensión, neumáticos, ruedas
- **Accesorios y Equipamiento**: Baterías, herramientas, seguridad, etc.
- **Otros**: Misceláneos, servicios, sin categoría

### Type Safety

El archivo incluye tipos TypeScript completos:

```typescript
import type { CategoryKey } from "@/constants/categorias";

// Type-safe category handling
function procesarCategoria(cat: CategoryKey) {
  // TypeScript validará que cat sea una categoría válida
}
```
