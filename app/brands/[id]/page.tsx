import { getBrandById } from "@/application/actions/brands";
import Link from "next/link";
import type { PriceGroup } from "@/domain/types/turn14/brands";

export default async function BrandDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Server action - errors will be caught by error boundary
  const brandData = await getBrandById(id);
  const brand = brandData.data;
  const priceGroups = brand.attributes.pricegroups as PriceGroup[];

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-4xl mx-auto p-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/test-brands"
            className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-2 transition-colors"
          >
            ← Volver a todas las marcas
          </Link>
          <h1 className="text-3xl font-bold mt-2">
            {brand.attributes.name}
          </h1>
        </div>

        {/* Details Card */}
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          {/* Logo */}
          {brand.attributes.logo && (
            <div className="flex justify-center p-4 bg-zinc-50 rounded">
              <img
                src={brand.attributes.logo}
                alt={brand.attributes.name}
                className="max-w-xs max-h-32 object-contain"
              />
            </div>
          )}

          {/* Basic Info Grid */}
          <div className="grid grid-cols-2 gap-4 border-t pt-6">
            <InfoItem label="Brand ID" value={brand.id} />
            <InfoItem
              label="Dropship"
              value={brand.attributes.dropship ? "✅ Sí" : "❌ No"}
            />
            <InfoItem
              label="Códigos AAIA"
              value={
                brand.attributes.AAIA && brand.attributes.AAIA.length > 0
                  ? brand.attributes.AAIA.join(", ")
                  : "Ninguno"
              }
            />
            <InfoItem
              label="Grupos de Precio"
              value={priceGroups.length.toString()}
            />
          </div>

          {/* Price Groups Detail */}
          {priceGroups.length > 0 && (
            <div className="mt-6 border-t pt-6">
              <h2 className="text-xl font-semibold mb-4">
                Grupos de Precio
              </h2>
              <div className="space-y-4">
                {priceGroups.map((pg) => (
                  <PriceGroupCard key={pg.pricegroup_id} priceGroup={pg} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm font-medium text-zinc-600">{label}</dt>
      <dd className="mt-1 text-sm text-zinc-900">{value}</dd>
    </div>
  );
}

function PriceGroupCard({ priceGroup }: { priceGroup: PriceGroup }) {
  const hasRestrictions =
    priceGroup.purchase_restrictions &&
    priceGroup.purchase_restrictions.length > 0;
  const hasLocationRules =
    priceGroup.location_rules && priceGroup.location_rules.length > 0;

  return (
    <div className="border border-zinc-200 rounded-lg p-4 hover:border-zinc-400 transition-colors">
      <h3 className="font-semibold text-lg mb-2">
        {priceGroup.pricegroup_name}
      </h3>
      <div className="grid grid-cols-2 gap-2 text-sm mb-3">
        <InfoItem label="ID" value={priceGroup.pricegroup_id.toString()} />
        <InfoItem label="Prefijo" value={priceGroup.pricegroup_prefix} />
        <InfoItem
          label="Restricciones"
          value={(priceGroup.purchase_restrictions?.length || 0).toString()}
        />
        <InfoItem
          label="Reglas de Ubicación"
          value={(priceGroup.location_rules?.length || 0).toString()}
        />
      </div>

      {/* Restrictions Detail */}
      {hasRestrictions && (
        <div className="mt-3 pt-3 border-t">
          <h4 className="text-sm font-medium mb-2">
            Restricciones de Compra:
          </h4>
          <ul className="text-sm text-zinc-600 space-y-1">
            {priceGroup.purchase_restrictions.map((pr, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                <span className="font-medium">{pr.program}:</span>
                <span>{pr.your_status}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Location Rules Detail */}
      {hasLocationRules && (
        <div className="mt-3 pt-3 border-t">
          <h4 className="text-sm font-medium mb-2">Reglas de Ubicación:</h4>
          <ul className="text-sm text-zinc-600 space-y-1">
            {priceGroup.location_rules.map((lr, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                <span>
                  {lr.country}/{lr.state}
                </span>
                <span>-</span>
                <span>{lr.type}</span>
                <span className="font-medium">(Fee: ${lr.fee})</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Force dynamic rendering (no static generation)
export const dynamic = "force-dynamic";
export const revalidate = false; // Immutable cache
