import { productsSyncService } from "@/infrastructure/services/ProductsSyncService";
import type { ProductFile } from "@/domain/types/turn14/products";

interface OfferProduct {
  id: string;
  productName: string;
  partNumber: string;
  brandName: string;
  brandId: number;
  thumbnail: string | null;
  files: ProductFile[];
}

async function getProducts(): Promise<OfferProduct[]> {
  return await productsSyncService.getProductsWithFiles(12) as OfferProduct[];
}

const OfferItems = async () => {
  const products = await getProducts();

  if (products.length === 0) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-w-[110rem] mx-auto">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="aspect-square bg-gray-200 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-w-[110rem] mx-auto pt-20">
      {products.map((product) => {
        const mainImageFile = product.files.find((f) => f.type === "Image");
        // La URL está en links[0].url, no en media_content
        const imageUrl = mainImageFile?.links?.[0]?.url || product.thumbnail || "/placeholder.png";

        return (
          <div
            key={product.id}
            className="aspect-square relative border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
          >
            <img
              src={imageUrl}
              alt={product.productName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
              <p className="text-xs text-gray-300">{product.brandName}</p>
              <p className="text-xs font-medium text-white line-clamp-2">{product.productName}</p>
              <p className="text-xs text-gray-400">{product.partNumber}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OfferItems;
