"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { Product, ProductData } from "@/domain/types/turn14/products";
import { traducirCategoria, traducirSubcategoria } from "@/constants/categorias";
import { formatDateSpanish } from "./ProductPriceAndStock";
import { getProductDataById } from "@/application/actions/products";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface ProductDetailDialogProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
  pricesData?: Array<{
    productId: string;
    purchaseCost: number;
    retailPrice: number | null;
    mapPrice: number | null;
  }> | null;
  inventory?: Record<string, {
    hasStock: boolean;
    totalStock: number;
    manufacturer: {
      stock: number;
      esd: string;
    } | null;
  }> | null;
}

/**
 * Componente de diálogo para mostrar detalles extendidos de un producto
 * Incluye carousel de imágenes, descripciones largas y documentos
 */
export function ProductDetailDialog({
  product,
  open,
  onClose,
  pricesData = null,
  inventory = null,
}: ProductDetailDialogProps) {
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fetch product data cuando se abre el dialog
  useEffect(() => {
    const fetchProductData = async () => {
      if (!product) {
        setProductData(null);
        setCurrentImageIndex(0);
        return;
      }

      setIsLoading(true);
      try {
        const data = await getProductDataById(product.id);
        setProductData(data);
        setCurrentImageIndex(0);
      } catch (error) {
        console.error("Error fetching product data:", error);
        setProductData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductData();
  }, [product]);

  // Resetear índice de imagen cuando cambia el producto
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [product]);

  // Limpiar estado al cerrar
  const handleClose = () => {
    setProductData(null);
    setCurrentImageIndex(0);
    onClose();
  };

  if (!product) return null;

  // Obtener todas las imágenes
  const images = productData?.files?.filter(f => f.type === "Image") || [];

  // Si no hay imágenes adicionales, usar thumbnail
  const displayImage = images.length > 0
    ? images[currentImageIndex]
    : null;

  const mainImageLink = displayImage?.links?.find(l => l.size === "L") ||
    displayImage?.links?.find(l => l.size === "M") ||
    displayImage?.links?.[0];

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl pr-8">Detalles del Producto</DialogTitle>
          <DialogClose className="absolute right-4 top-4" onClick={handleClose}>
            <X className="h-4 w-4" />
          </DialogClose>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Carousel de imágenes */}
          <div className="relative bg-zinc-50 rounded-lg p-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
              </div>
            ) : images.length > 0 ? (
              <>
                {/* Imagen principal */}
                <div className="flex justify-center relative">
                  {mainImageLink ? (
                    <Image
                      src={mainImageLink.url}
                      alt={displayImage?.media_content || product.attributes.product_name}
                      className="object-contain"
                      width={600}
                      height={600}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-72 text-zinc-400">
                      Sin imagen
                    </div>
                  )}

                  {/* Navegación del carousel */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentImageIndex(prev => (prev > 0 ? prev - 1 : images.length - 1))}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white shadow-md transition-colors"
                        disabled={isLoading}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setCurrentImageIndex(prev => (prev < images.length - 1 ? prev + 1 : 0))}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-full hover:bg-white shadow-md transition-colors"
                        disabled={isLoading}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>

                {/* Indicadores de imagen */}
                {images.length > 1 && (
                  <div className="flex justify-center gap-2 mt-4">
                    {images.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          idx === currentImageIndex ? "bg-cyan-600" : "bg-zinc-300"
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Label de la imagen actual */}
                {/* <p className="text-center text-sm text-zinc-500 mt-2">
                  {displayImage?.media_content || `Imagen ${currentImageIndex + 1} de ${images.length}`}
                </p> */}
              </>
            ) : (
              // Thumbnail fallback
              <div className="flex justify-center">
                {product.attributes.thumbnail ? (
                  <Image
                    src={product.attributes.thumbnail}
                    alt={product.attributes.product_name}
                    className="object-contain max-h-64"
                    width={300}
                    height={256}
                  />
                ) : (
                  <div className="flex items-center justify-center h-64 text-zinc-400">
                    Sin imagen
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Información principal */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold text-zinc-500">Pieza #</p>
              <p className="text-lg font-medium text-cyan-600">
                {product.attributes.mfr_part_number}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-500">Turn14 ID</p>
              <p className="text-lg">{product.id}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm font-semibold text-zinc-500">Nombre del Producto</p>
              <p className="text-lg">{product.attributes.product_name}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm font-semibold text-zinc-500">Descripción Corta</p>
              <p className="text-gray-700">
                {product.attributes.part_description || "Sin descripción"}
              </p>
            </div>
          </div>

          {/* Descripciones largas del API */}
          {productData?.descriptions && productData.descriptions.length > 0 && (
            <div className="bg-zinc-50 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-zinc-700">Descripción Detallada</h4>
              {productData.descriptions.map((desc, idx) => (
                <div key={idx} className="text-sm">
                  <p className="font-medium text-zinc-600">{desc.type}</p>
                  <p className="text-gray-700 mt-1">{desc.description}</p>
                </div>
              ))}
            </div>
          )}

          {/* Archivos PDF (manuales, etc.) */}
          {productData?.files && productData.files.filter(f => f.type !== "Image").length > 0 && (
            <div className="bg-zinc-50 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold text-zinc-700">Documentos</h4>
              <div className="flex flex-wrap gap-2">
                {productData.files
                  .filter(f => f.type !== "Image")
                  .map((file, idx) => (
                    <a
                      key={idx}
                      href={file.links[0]?.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-white rounded border border-zinc-200 hover:bg-zinc-50 transition-colors text-sm"
                    >
                      <span className="text-red-600 font-semibold">{file.file_extension}</span>
                      <span>{file.media_content}</span>
                    </a>
                  ))}
              </div>
            </div>
          )}

          {/* Sección de precios */}
          {pricesData && (
            <div className="bg-zinc-50 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold text-zinc-700">Información de Precios</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-zinc-500">Retail</p>
                  <p className="text-lg text-zinc-600 line-through">
                    ${pricesData.find(p => p.productId === product.id)?.retailPrice?.toFixed(2) || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">MAP</p>
                  <p className="text-lg text-zinc-600">
                    ${pricesData.find(p => p.productId === product.id)?.mapPrice?.toFixed(2) || "-"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Tu Precio</p>
                  <p className="text-2xl font-bold text-orange-500">
                    ${pricesData.find(p => p.productId === product.id)?.purchaseCost.toFixed(2) || "-"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Sección de inventario */}
          {inventory && inventory[product.id] && (
            <div className="bg-zinc-50 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold text-zinc-700">Inventario</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-zinc-500">Stock Total</p>
                  <p className={`text-lg font-medium ${
                    inventory[product.id].hasStock
                      ? "text-green-600"
                      : "text-red-600"
                  }`}>
                    {inventory[product.id].hasStock
                      ? `${inventory[product.id].totalStock} unidades`
                      : "Sin stock"}
                  </p>
                </div>
                {inventory[product.id].manufacturer && (
                  <div>
                    <p className="text-sm text-zinc-500">Stock del Fabricante</p>
                    <p className="text-lg text-orange-600">
                      {inventory[product.id].manufacturer!.stock} unidades
                      {inventory[product.id].manufacturer!.esd && (
                        <span className="text-sm text-zinc-500 ml-2">
                          (ESD: {formatDateSpanish(inventory[product.id].manufacturer!.esd)})
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Información adicional */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold text-zinc-500">Fabricante</p>
              <p>{product.attributes.brand}</p>
            </div>
            <div>
              <p className="font-semibold text-zinc-500">Pricing Group</p>
              <p>{product.attributes.price_group}</p>
            </div>
            <div>
              <p className="font-semibold text-zinc-500">Categoría</p>
              <p>{traducirCategoria(product.attributes.category)}</p>
            </div>
            <div>
              <p className="font-semibold text-zinc-500">Subcategoría</p>
              <p>{traducirSubcategoria(product.attributes.subcategory)}</p>
            </div>
            <div>
              <p className="font-semibold text-zinc-500">Peso</p>
              <p>{product.attributes.dimensions[0]?.weight || "-"} lbs</p>
            </div>
            <div>
              <p className="font-semibold text-zinc-500">Dimensiones</p>
              <p>
                {product.attributes.dimensions[0]
                  ? `${product.attributes.dimensions[0].length}" x ${product.attributes.dimensions[0].width}" x ${product.attributes.dimensions[0].height}"`
                  : "-"}
              </p>
            </div>
            <div>
              <p className="font-semibold text-zinc-500">Part Number Alterno</p>
              <p>{product.attributes.alternate_part_number || "-"}</p>
            </div>
            <div>
              <p className="font-semibold text-zinc-500">Barcode</p>
              <p>{product.attributes.barcode || "-"}</p>
            </div>
          </div>

          {/* Certificaciones */}
          <div className="flex flex-wrap gap-2">
            {product.attributes.clearance_item && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                Liquidación
              </span>
            )}
            {product.attributes.not_carb_approved && (
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                No CARB
              </span>
            )}
            {product.attributes.carb_acknowledgement_required && (
              <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                Requiere CARB
              </span>
            )}
            {product.attributes.prop_65 === "Y" && (
              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                Prop 65
              </span>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
