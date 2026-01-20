"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { ProductFile } from "@/domain/types/turn14/products";
import {
  getProductsByBrandsForOffers,
  getBrandLogo,
} from "@/application/actions/products";

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

const OfferItems = () => {
  const [products, setProducts] = useState<OfferProduct[]>([]);
  const [brandLogo, setBrandLogo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch products on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const brandId = 405;
        const [data, logo] = await Promise.all([
          getProductsByBrandsForOffers(4, [brandId]),
          getBrandLogo(brandId),
        ]);
        setProducts(data);
        setBrandLogo(logo);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const displayProducts = products.slice(0, 12);

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
    <div className="max-w-[110rem] mx-auto px-4 py-20">
      <div className="flex items-center gap-4 mb-4">
        {brandLogo && (
          <Image
            src={brandLogo}
            alt="Brand logo"
            width={80}
            height={40}
            className="object-contain"
          />
        )}
        <h1 className="text-4xl underline font-bold">
          {displayProducts[0]?.brandName || "Ofertas"}
        </h1>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 ">
        {displayProducts.map((product) => {
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
  );
};

export default OfferItems;
