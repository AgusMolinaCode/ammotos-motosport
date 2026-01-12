import type { Metadata } from "next";
import { getBrandBySlug } from "@/application/actions/brands";

interface BrandLayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const brandData = await getBrandBySlug(slug);
  const brand = brandData.data;

  if (!brand) {
    return {
      title: "Marca no encontrada | AmPowerparts",
      description: "La marca solicitada no fue encontrada.",
    };
  }

  const brandName = brand.attributes.name;

  return {
    title: {
      default: `${brandName} | AmPowerparts - Repuestos para Autos Deportivos`,
      template: `%s | ${brandName}`,
    },
    description: `Explora nuestra colección de repuestos y accesorios ${brandName}. Encuentra los mejores productos para tu auto deportivo. Envío rápido y calidad garantizada.`,
    keywords: [
      `repuestos ${brandName}`,
      `accesorios ${brandName}`,
      `autos deportivos ${brandName}`,
      `tienda ${brandName}`,
      "repuestos autos deportivos",
      "accesorios auto deportivo",
    ],
    openGraph: {
      type: "website",
      locale: "es_ES",
      url: `https://ampowerparts.com/brands/${slug}`,
      siteName: "AmPowerparts",
      title: `${brandName} | AmPowerparts - Repuestos para Autos Deportivos`,
      description: `Encuentra los mejores repuestos y accesorios ${brandName} para tu auto deportivo.`,
      images: [
        {
          url: brand.attributes.logo || "/og-image.jpg",
          width: 200,
          height: 100,
          alt: `Logo de ${brandName}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${brandName} | AmPowerparts`,
      description: `Repuestos y accesorios ${brandName} para autos deportivos.`,
      images: [brand.attributes.logo || "/og-image.jpg"],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function BrandLayout({ children, params }: BrandLayoutProps) {
  return <>{children}</>;
}

export const dynamic = "force-dynamic";
