"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { searchByMfrPartNumber, type MfrPartNumberSearchResult } from "@/application/actions/products";

interface ProductSearchPopupProps {
  triggerClassName?: string;
  triggerSize?: "sm" | "md" | "lg";
}

export function ProductSearchPopup({ triggerClassName = "", triggerSize = "md" }: ProductSearchPopupProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MfrPartNumberSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus input cuando se abre el popup
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Cerrar popup al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Cerrar con ESC
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setHasSearched(true);
      try {
        const searchResults = await searchByMfrPartNumber(query, 10);
        setResults(searchResults);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (productId: string) => {
    setIsOpen(false);
    setQuery("");
    setResults([]);
    router.push(`/products/${productId}`);
  };

  const handleClose = () => {
    setIsOpen(false);
    setQuery("");
    setResults([]);
  };

  const triggerSizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Botón trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className={`${triggerSizes[triggerSize]} flex items-center justify-center rounded-full bg-black hover:bg-gray-800 transition-colors ${triggerClassName}`}
        aria-label="Buscar productos"
      >
        <Search className="w-5 h-5 text-white" />
      </button>

      {/* Popup overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
          {/* Backdrop con blur */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <div className="relative w-full max-w-2xl mx-4 bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header con input */}
            <div className="flex items-center gap-3 p-4 border-b">
              <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <Input
                ref={inputRef}
                type="text"
                placeholder="Buscar por número de parte (ej: 20-0262)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 h-10 text-lg border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
              />
              <button
                onClick={handleClose}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Resultados */}
            <div className="max-h-[60vh] overflow-y-auto">
              {loading && (
                <div className="p-8 text-center text-gray-500">
                  <div className="inline-block w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
                  <p className="mt-2">Buscando...</p>
                </div>
              )}

              {!loading && hasSearched && results.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  <p>No se encontraron productos para &quot;{query}&quot;</p>
                  <p className="text-sm mt-1">Intenta con otro número de parte</p>
                </div>
              )}

              {!loading && results.length > 0 && (
                <ul className="divide-y">
                  {results.map((result) => (
                    <li key={result.id}>
                      <button
                        onClick={() => handleSelect(result.id)}
                        className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors text-left"
                      >
                        {/* Thumbnail */}
                        <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                          {result.thumbnail ? (
                            <Image
                              src={result.thumbnail}
                              alt={result.productName}
                              width={64}
                              height={64}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                              Sin img
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">
                            {result.productName}
                          </p>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {result.mfrPartNumber}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {result.brandName}
                          </p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {/* Estado inicial - sin búsqueda */}
              {!loading && !hasSearched && (
                <div className="p-8 text-center text-gray-400">
                  <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Ingresa un número de parte para buscar</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-gray-50 border-t text-xs text-gray-500 text-center">
              Presiona ESC para cerrar
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
