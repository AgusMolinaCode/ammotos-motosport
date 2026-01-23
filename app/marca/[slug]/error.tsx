"use client";

import Link from "next/link";

export default function BrandDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-6">
        <div className="text-center">
          {/* Error Icon */}
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg
              className="h-6 w-6 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-xl font-semibold text-red-600 mb-2">
            Error al Cargar Brand
          </h2>

          {/* Error Message */}
          <p className="text-zinc-600 mb-4">{error.message}</p>

          {/* Digest (if available) */}
          {error.digest && (
            <p className="text-xs text-zinc-400 mb-4">
              Error ID: {error.digest}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={reset}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Intentar de Nuevo
            </button>
            <Link
              href="/marcas"
              className="bg-zinc-200 text-zinc-800 px-4 py-2 rounded hover:bg-zinc-300 transition-colors inline-block"
            >
              Volver a Brands
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
