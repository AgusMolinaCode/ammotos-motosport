import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import SmallBanner from "@/components/main/SmallBanner";
import Navbar from "@/components/main/Navbar";
import SearchBar from "@/components/main/SearchBar";
import Footer from "@/components/main/Footer";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default:
      "AM.Powerparts - Tu Tienda de Repuestos y Accesorios para Autos Deportivos",
    template: "%s | AmPowerparts",
  },
  description:
    "Encuentra los mejores repuestos, accesorios y equipamiento para tu auto deportivo. Amplia variedad de piezas, tuned parts, rines y más. Envío rápido y calidad garantizada.",
  keywords: [
    "repuestos autos deportivos",
    "accesorios auto deportivo",
    "repuestos tuning",
    "tienda autos deportivos",
    "rines para auto",
    "repuestos turn14",
    "accesorios turn14",
    "autos deportivos",
    "tuning cars",
  ],
  authors: [{ name: "AmPowerparts" }],
  creator: "AmPowerparts",
  publisher: "AmPowerparts",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://ampowerparts.com",
    siteName: "AmPowerparts",
    title: "AmPowerparts - Repuestos y Accesorios para Autos Deportivos",
    description:
      "Encuentra los mejores repuestos, accesorios y equipamiento para tu auto deportivo.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AmPowerparts - Tienda de repuestos para autos deportivos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AmPowerparts - Tu Tienda de Repuestos para Autos Deportivos",
    description:
      "Encuentra los mejores repuestos, accesorios y equipamiento para tu auto deportivo.",
    images: ["/og-image.jpg"],
    creator: "@ampowerparts",
  },
  verification: {
    google: "google-site-verification-code",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${outfit.className} antialiased bg-gradient-to-l from-[#f7f7f7] to-[#fefbfb]`}
      >
        <SmallBanner />
        <Navbar />
        <div className="bg-orange-100/30 w-full border-t border-b border-neutral-600 px-1">
          <SearchBar />
        </div>
        <div className="px-2">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
