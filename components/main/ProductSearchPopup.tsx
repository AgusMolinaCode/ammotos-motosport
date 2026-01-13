"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, Loader2, Clock, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  searchByMfrPartNumber,
  type MfrPartNumberSearchResult,
} from "@/application/actions/products";
import { generateProductUrl } from "@/lib/utils";

interface ProductSearchBarProps {
  className?: string;
  onProductSelect?: (product: MfrPartNumberSearchResult) => void;
}

interface RecentSearch {
  id: string;
  productName: string;
  mfrPartNumber: string;
  brandName: string;
  brandId: number;
  brandSlug: string;
  thumbnail: string | null;
  timestamp: number;
}

const MAX_RECENT_SEARCHES = 5;
const STORAGE_KEY = "product_search_recent";

export function ProductSearchPopup({
  className = "",
  onProductSelect,
}: ProductSearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MfrPartNumberSearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Usar ref para mantener el historial actualizado
  const recentSearchesRef = useRef<RecentSearch[]>([]);

  // Cargar búsquedas recientes del localStorage al montar
  useEffect(() => {
    const loadFromStorage = () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setRecentSearches(parsed);
            recentSearchesRef.current = parsed;
          }
        }
      } catch (e) {
        console.error("Error loading recent searches:", e);
      }
    };

    loadFromStorage();
  }, []);

  // Guardar búsqueda en recent searches
  const saveToRecentSearches = (result: MfrPartNumberSearchResult) => {
    const newSearch: RecentSearch = {
      id: result.id,
      productName: result.productName,
      mfrPartNumber: result.mfrPartNumber,
      brandName: result.brandName,
      brandId: result.brandId,
      brandSlug: result.brandSlug,
      thumbnail: result.thumbnail,
      timestamp: Date.now(),
    };

    // Usar el ref para obtener la lista actual
    const currentList = [...recentSearchesRef.current];

    // Filtrar duplicados y agregar al principio
    const filtered = currentList.filter((s) => s.id !== result.id);
    const updated = [newSearch, ...filtered].slice(0, MAX_RECENT_SEARCHES);

    // Actualizar ref y estado
    recentSearchesRef.current = updated;
    setRecentSearches(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  // Eliminar un elemento del historial
  const removeFromRecentSearches = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const updated = recentSearches.filter((s) => s.id !== id);
    recentSearchesRef.current = updated;
    setRecentSearches(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  // Debounced search
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const searchResults = await searchByMfrPartNumber(query, 10);
        setResults(searchResults);
        setShowResults(true);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleClose = () => {
    setShowResults(false);
    setQuery("");
    setResults([]);
  };

  const handleSelect = (result: MfrPartNumberSearchResult) => {
    saveToRecentSearches(result);

    if (onProductSelect) {
      onProductSelect(result);
      setShowResults(false);
      setQuery("");
      setResults([]);
    } else {
      const productUrl = generateProductUrl(
        String(result.brandSlug || result.brandId),
        result.id,
        result.productName
      );
      router.push(productUrl);
    }
  };

  const handleRecentClick = (search: RecentSearch) => {
    if (onProductSelect) {
      // Convertir RecentSearch a MfrPartNumberSearchResult
      const result: MfrPartNumberSearchResult = {
        id: search.id,
        productName: search.productName,
        mfrPartNumber: search.mfrPartNumber,
        brandName: search.brandName,
        brandId: search.brandId,
        brandSlug: search.brandSlug,
        thumbnail: search.thumbnail,
      };
      onProductSelect(result);
      setShowResults(false);
      setQuery("");
      setResults([]);
    } else {
      const productUrl = generateProductUrl(
        String(search.brandSlug || search.brandId),
        search.id,
        search.productName
      );
      router.push(productUrl);
    }
  };

  return (
    <div className={`relative w-full ${className}`}>
      {/* Input con icono a la derecha y cruz para cerrar */}
      <div className="relative">
        <Input
          type="text"
          placeholder="Buscar"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          className="h-14 xl:w-[40rem]  px-6 rounded-full border border-gray-300 bg-white text-black text-lg font-medium focus:ring-0 focus:ring-gray-50"
        />
        {/* Iconos a la derecha */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center h-14 w-14 bg-black rounded-full px-4">
          {loading ? (
            <Loader2 className="w-7 h-7 text-gray-400 animate-spin" />
          ) : query ? (
            <button
              onClick={handleClose}
              className=" hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className=" w-7 h-7 text-gray-400" />
            </button>
          ) : (
            <Search className=" w-7 h-7 text-gray-400" />
          )}
        </div>
      </div>

      {/* Resultados dropdown */}
      {showResults && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <div className="inline-block w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No se encontraron productos para "{query}"
            </div>
          ) : (
            <ul className="divide-y max-h-96 overflow-y-auto">
              {/* Resultados de búsqueda actual */}
              {results.map((result) => (
                <li key={result.id}>
                  <button
                    onClick={() => handleSelect(result)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="w-16 h-20 flex-shrink-0 rounded overflow-hidden bg-gray-100">
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
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-base truncate">
                        {result.productName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {result.mfrPartNumber}
                      </p>
                      <p className="text-sm text-gray-400">
                        {result.brandName}
                      </p>
                    </div>
                  </button>
                </li>
              ))}

              {/* Historial */}
              {recentSearches.length > 0 && (
                <>
                  <li className="bg-gray-50 border-t">
                    <div className="px-4 py-3 flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">
                        Historial ({recentSearches.length})
                      </span>
                    </div>
                  </li>
                  {recentSearches
                    .slice(0, MAX_RECENT_SEARCHES)
                    .map((search) => (
                      <li key={search.id}>
                        <button
                          onClick={() => handleRecentClick(search)}
                          className="w-full flex items-center gap-3 p-3 hover:bg-gray-100 transition-colors text-left group"
                        >
                          <div className="w-16 h-20 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                            {search.thumbnail ? (
                              <Image
                                src={search.thumbnail}
                                alt={search.productName}
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
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-700 text-base truncate">
                              {search.productName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {search.mfrPartNumber}
                            </p>
                            <p className="text-sm text-gray-400">
                              {search.brandName}
                            </p>
                          </div>
                          {/* Botón X para eliminar */}
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              removeFromRecentSearches(
                                search.id,
                                e as unknown as React.MouseEvent
                              );
                            }}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                removeFromRecentSearches(
                                  search.id,
                                  e as unknown as React.MouseEvent
                                );
                              }
                            }}
                            className="p-2 rounded-full hover:bg-red-100 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                          >
                            <X className="w-4 h-4 text-red-500" />
                          </div>
                        </button>
                      </li>
                    ))}
                </>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
