"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getItemsUpdates } from "@/application/actions/products";
import type { Product } from "@/domain/types/turn14/products";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";

const UpdateItems = () => {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUpdates() {
      try {
        const response = await getItemsUpdates(1, 7);
        setProducts(response.data.slice(0, 3));
      } catch (error) {
        console.error("Error fetching items updates:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUpdates();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <p className="text-gray-500">Cargando productos actualizados...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Grid 1: Banner con imagen y botón */}
      <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden">
        <img
          src="/images/akra2.webp"
          alt="Banner AKRA"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <HoverBorderGradient
            containerClassName="rounded-lg"
            as="button"
            onClick={() => router.push("/ofertas")}
            className="bg-black/40 text-white flex items-center gap-2 px-6 py-3 text-lg cursor-pointer"
          >
            <span>Comprar</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </HoverBorderGradient>
        </div>
      </div>

      {/* Grid 2: Productos actualizados */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <img
              src={product.attributes.thumbnail}
              alt={product.attributes.product_name}
              className="w-full h-32 object-cover"
            />
            <div className="p-4">
              <p className="text-xs text-gray-500 mb-1">{product.attributes.brand}</p>
              <h3 className="font-medium text-sm line-clamp-2 mb-2">
                {product.attributes.product_name}
              </h3>
              <p className="text-sm text-gray-600">{product.attributes.part_number}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpdateItems;
