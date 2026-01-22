"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface BrandInfo {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
}

interface CategoryBrandSelectProps {
  brands: BrandInfo[];
  categorySlug: string;
}

export function CategoryBrandSelect({ brands, categorySlug }: CategoryBrandSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedBrandId = searchParams.get("brandId");

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const brandId = e.target.value;
    if (brandId) {
      const brand = brands.find((b) => b.id === brandId);
      if (brand) {
        // Navegar a la página de la marca con la categoría como query param
        router.push(`/brands/${brand.slug}?brandId=${brandId}&category=${encodeURIComponent(categorySlug)}`);
      }
    }
  };

  if (brands.length === 0) return null;

  return (
    <div className="">
      <label htmlFor="brand-select" className="block text-sm font-medium text-gray-700 mb-1">
        Filtrar por marca
      </label>
      <select
        id="brand-select"
        value={selectedBrandId || ""}
        onChange={handleBrandChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
      >
        <option value="">Todas las marcas</option>
        {brands.map((brand) => (
          <option key={brand.id} value={brand.id}>
            {brand.name}
          </option>
        ))}
      </select>
    </div>
  );
}
