import { getBrands } from "@/application/actions/brands";

/**
 * PÁGINA DE PRUEBA: Brands de Turn14
 *
 * Esta página ejecuta el server action getBrands() automáticamente
 * al cargar. Toda la información se muestra en la consola del servidor.
 */
export default async function TestBrandsPage() {
  // Server Component - se ejecuta en el servidor
  const brandsData = await getBrands();

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Turn14 Brands Test</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            📊 Total de marcas: {brandsData.data.length}
          </h2>
          <p className="text-zinc-600">
            ✅ Los datos completos se muestran en la consola del servidor
          </p>
          <p className="text-zinc-600 mt-2">
            Revisa tu terminal donde está corriendo <code className="bg-zinc-100 px-2 py-1 rounded">npm run dev</code>
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Primeras 10 marcas:</h2>
          <div className="space-y-4">
            {brandsData.data.map((brand) => (
              <div
                key={brand.id}
                className="border border-zinc-200 rounded-lg p-4 hover:border-zinc-400 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {brand.attributes.logo && (
                    <img
                      src={brand.attributes.logo}
                      alt={brand.attributes.name}
                      className="w-16 h-16 object-contain"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">
                      {brand.attributes.name}
                    </h3>
                    <div className="mt-2 text-sm text-zinc-600 space-y-1">
                      <p>
                        <strong>ID:</strong> {brand.id}
                      </p>
                      <p>
                        <strong>Dropship:</strong>{" "}
                        {brand.attributes.dropship ? "✅ Sí" : "❌ No"}
                      </p>
                      <p>
                        <strong>Price Groups:</strong>{" "}
                        {brand.attributes.pricegroups.length}
                      </p>
                      <p>
                        <strong>AAIA:</strong>{" "}
                        {brand.attributes.AAIA?.join(", ") || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
