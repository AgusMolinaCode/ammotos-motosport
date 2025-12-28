import type { PriceGroup } from "@/domain/types/turn14/brands";
import { InfoItem } from "./InfoItem";

interface PriceGroupCardProps {
  priceGroup: PriceGroup;
}

export function PriceGroupCard({ priceGroup }: PriceGroupCardProps) {
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
