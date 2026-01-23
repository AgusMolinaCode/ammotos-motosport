"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { ProductFile } from "@/domain/types/turn14/products";
import {
  getProductsByBrandsForOffers,
  getBrandLogo,
} from "@/application/actions/products";
import { getBrandSlug } from "@/application/actions/brands";
import Link from "next/link";

interface OfferProduct {
  id: string;
  productName: string;
  partNumber: string;
  brandName: string;
  brandId: number;
  thumbnail: string | null;
  files: ProductFile[];
  price: number | null;
}

interface BrandData {
  brandId: number;
  products: OfferProduct[];
  logo: string | null;
  brandName: string;
  slug: string;
}

const BRANDS_CONFIG = [
  { id: 405, count: 4 },
  { id: 228, count: 4 },
  { id: 437, count: 4 },
];

const OfferItems = () => {
  const [brandsData, setBrandsData] = useState<BrandData[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch products on mount
  useEffect(() => {
    async function fetchData() {
      console.log("Iniciando fetchData...");
      try {
        const results = await Promise.all(
          BRANDS_CONFIG.map(async (config) => {
            const products = await getProductsByBrandsForOffers(config.count, [
              config.id,
            ]);

            const logo = await getBrandLogo(config.id);
            const slug = await getBrandSlug(config.id);

            return {
              brandId: config.id,
              products,
              logo,
              brandName: products[0]?.brandName || "",
              slug,
            };
          }),
        );
        console.log("All brands data:", results);
        setBrandsData(results);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-w-[110rem] mx-auto pt-20">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square bg-gray-200 animate-pulse rounded-lg"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-[110rem] mx-auto px-2 md:px-4 py-16 md:py-20 space-y-12">
      {brandsData
        .filter((brandData) => brandData.products.length > 0)
        .map((brandData) => (
          <div key={brandData.brandId}>
            <div className="">
              <Link
                className="flex items-center gap-2 md:gap-4 mb-4"
                href={`/marca/${brandData.slug}`}
              >
                {brandData.logo && (
                  <Image
                    src={brandData.logo}
                    alt="Brand logo"
                    width={80}
                    height={40}
                    className="object-contain md:w-[100px] md:h-[80px] w-[80px] h-[60px]"
                  />
                )}
                <h1 className="text-2xl md:text-4xl underline font-bold">
                  {brandData.brandName || "Ofertas"}
                </h1>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {brandData.products.map((product) => {
                const imageUrl =
                  product.files[0]?.links?.[0]?.url || "/placeholder.png";

                return (
                  <div
                    key={product.id}
                    className="aspect-square border rounded-lg overflow-hidden shadow-sm"
                  >
                    <Image
                      src={imageUrl}
                      alt={product.productName}
                      className="w-full h-full object-contain"
                      width={400}
                      height={400}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
    </div>
  );
};

export default OfferItems;
