"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WhatsApp } from "@/public/whatssapp";
import { getBrands } from "@/application/actions/brands";
import Link from "next/link";
import { GlobalSearchHandler } from "./GlobalSearchHandler";

interface Brand {
  id: string;
  name: string;
  slug: string;
}

const SearchBar = () => {
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const result = await getBrands();
        const brandsData = result.data.map(
          (brand: {
            id: string;
            attributes: { name: string; slug: string };
          }) => ({
            id: brand.id,
            name: brand.attributes.name,
            slug: brand.attributes.slug,
          }),
        );
        setBrands(brandsData);
      } catch (error) {
        console.error("Error fetching brands:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  const handleBrandSelect = (brandId: string) => {
    // Find the brand to get the slug
    const brand = brands.find((b) => b.id === brandId);
    const slug = brand?.slug || brandId;
    router.push(`/marca/${slug}`);
  };

  return (
    <div className="h-20 flex justify-between items-center gap-2 lg:gap-4 max-w-[110rem] mx-auto">
      <div className="">
        <Link
          href="https://wa.me/1150494936"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center justify-center gap-3"
        >
          <WhatsApp className="w-8 lg:w-10 h-8 lg:h-10 cursor-pointer" />
          <p className="text-2xl lg:text-3xl font-semibold">11 5049-4936</p>
        </Link>
      </div>

      <div className="flex flex-1 md:flex-none items-center gap-3">
        <GlobalSearchHandler />
      </div>

      <div>
        <Select onValueChange={handleBrandSelect} disabled={loading}>
          <SelectTrigger className="hidden md:flex md:w-[240px] lg:w-[320px] h-18 bg-white border-gray-300 text-black text-lg font-medium rounded-lg focus:ring-0 focus:ring-gray-50">
            <SelectValue
              className="text-black"
              placeholder={loading ? "Cargando..." : "Marcas"}
            />
          </SelectTrigger>
          <SelectContent className="bg-gray-100 border-gray-700 max-h-[200px] overflow-y-auto">
            <SelectGroup>
              <SelectLabel className="text-gray-900 text-base">
                Marcas
              </SelectLabel>
              {brands.map((brand) => (
                <SelectItem
                  key={brand.id}
                  value={brand.id}
                  className="text-black text-lg py-3 hover:bg-gray-300 focus:bg-gray-300 cursor-pointer"
                >
                  {brand.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default SearchBar;
