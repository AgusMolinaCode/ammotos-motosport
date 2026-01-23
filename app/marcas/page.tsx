import { getBrands } from "@/application/actions/brands";
import Link from "next/link";

/**
 * PÁGINA DE PRUEBA: Brands de Turn14
 *
 * Server Component que muestra las marcas desde la base de datos.
 * La sincronización se maneja automáticamente mediante /api/sync/brands
 */
export default async function TestBrandsPage() {
  const brandsData = await getBrands();
  const brands = brandsData.data;

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Turn14 Brands Test</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            📊 Total de marcas: {brands.length}
          </h2>
          <p className="text-zinc-600">
            ✅ Datos cargados desde la base de datos PostgreSQL
          </p>
          
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Todas las marcas:</h2>
          <div className="space-y-4">
            {brands.map((brand) => {
              const hasLogo = Boolean(brand.attributes.logo);
              const priceGroupsCount = Array.isArray(brand.attributes.pricegroups)
                ? brand.attributes.pricegroups.length
                : 0;
              const aaiaList = brand.attributes.AAIA || [];

              return (
                <div
                  key={brand.id}
                  className="border border-zinc-200 rounded-lg p-4 hover:border-zinc-400 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {hasLogo && (
                      <img
                        src={brand.attributes.logo}
                        alt={brand.attributes.name}
                        className="w-16 h-16 object-contain"
                      />
                    )}
                    <div className="flex-1">
                      <Link href={`/marca/${brand.attributes.slug || brand.id}`}>
                        <h3 className="font-semibold text-lg hover:text-blue-600 transition-colors cursor-pointer">
                          {brand.attributes.name}
                        </h3>
                      </Link>
                      <div className="mt-2 text-sm text-zinc-600 space-y-1">
                        <p>
                          <strong>ID:</strong> {brand.id}
                        </p>
                        <p>
                          <strong>Slug:</strong> {brand.attributes.slug || "N/A"}
                        </p>
                        <p>
                          <strong>Dropship:</strong>{" "}
                          {brand.attributes.dropship ? "✅ Sí" : "❌ No"}
                        </p>
                        <p>
                          <strong>Price Groups:</strong> {priceGroupsCount}
                        </p>
                        <p>
                          <strong>AAIA:</strong>{" "}
                          {aaiaList.length > 0 ? aaiaList.join(", ") : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
