"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LogoLoop from "../ui/LogoLoop";
import { getBrandsWithLogo } from "@/application/actions/brands";

interface BrandLogo {
  id: string;
  name: string;
  logo: string | null;
}

function SliderBrands() {
  const router = useRouter();
  const [brands, setBrands] = useState<BrandLogo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const result = await getBrandsWithLogo();
        setBrands(result.data);
      } catch (error) {
        console.error("Error fetching brands with logo:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  // Convertir marcas a formato para LogoLoop (filtrar nulls)
  const logos = brands
    .filter((brand) => brand.logo)
    .map((brand) => ({
      src: brand.logo as string,
      alt: brand.name,
      href: `/brands/${brand.id}`,
    }));

  if (loading) {
    return (
      <div style={{ height: "200px", position: "relative", overflow: "hidden" }} className="bg-gray-100 animate-pulse">
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-400">Cargando marcas...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: "200px", position: "relative", overflow: "hidden" }}>
      {logos.length > 0 ? (
        <LogoLoop
          logos={logos}
          speed={120}
          direction="left"
          logoHeight={240}
          gap={60}
          hoverSpeed={0}
          scaleOnHover
          fadeOut
          fadeOutColor="#f9fafb"
          ariaLabel="Nuestras marcas"
        />
      ) : (
        <div className="flex items-center justify-center h-full bg-gray-100">
          <p className="text-gray-400">No hay marcas disponibles</p>
        </div>
      )}
    </div>
  );
}

export default SliderBrands;
