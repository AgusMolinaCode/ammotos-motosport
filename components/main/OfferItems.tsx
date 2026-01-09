"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { ProductFile } from "@/domain/types/turn14/products";
import { getProductsByBrandsForOffers } from "@/application/actions/products";

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
  const [loading, setLoading] = useState(true);

  // Fetch products on mount
  useEffect(() => {
    async function fetchProducts() {
      try {
        const data = await getProductsByBrandsForOffers(12, [405, 333]);
        console.log("=== OfferItems Debug ===");
        console.log("Products count:", data.length);
        console.log("Data completa:", JSON.stringify(data, null, 2));
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-w-[110rem] mx-auto">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square bg-gray-200 animate-pulse rounded-lg"
          />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-w-[110rem] mx-auto">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square bg-gray-200 animate-pulse rounded-lg"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-w-[110rem] mx-auto pt-20">
      {products.map((product) => {
        const mainImageFile = product.files.find((f) => f.type === "Image");
        const imageUrl =
          mainImageFile?.links?.[0]?.url ||
          product.thumbnail ||
          "/placeholder.png";

        return (
          <div
            key={product.id}
            className="aspect-square relative border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
          >
            <Image
              src={imageUrl}
              alt={product.productName}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
              width={400}
              height={400}
            />
            {/* Precio con opacidad */}
            {product.price && (
              <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-sm font-medium opacity-70">
                ${product.price.toFixed(2)}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
              <p className="text-xs text-gray-300">{product.brandName}</p>
              <p className="text-xs font-medium text-white line-clamp-2">
                {product.productName}
              </p>
              <p className="text-xs text-gray-400">{product.partNumber}</p>
              <p className="text-xs text-gray-400">{product.id}</p>

            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OfferItems;
