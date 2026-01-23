"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface HideOutOfStockSwitchProps {
  brandId: number;
  brandSlug: string;
  categorySlug?: string;
}

export function HideOutOfStockSwitch({ brandId, brandSlug, categorySlug }: HideOutOfStockSwitchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get initial state from URL (default: false = show all products)
  const hideOutOfStockParam = searchParams.get("hideOutOfStock");
  const initialHideOutOfStock = hideOutOfStockParam === "true";
  const [hideOutOfStock, setHideOutOfStock] = useState(initialHideOutOfStock);

  const toggleHideOutOfStock = useCallback(() => {
    const newValue = !hideOutOfStock;
    setHideOutOfStock(newValue);

    // Build new URL with updated parameter
    const params = new URLSearchParams(searchParams?.toString() || "");

    if (newValue) {
      params.set("hideOutOfStock", "true");
    } else {
      params.delete("hideOutOfStock");
    }

    // Reset to page 1 when changing filter
    params.delete("page");

    // Determine URL based on whether we have category or brand
    const newUrl = categorySlug
      ? `/categories/${categorySlug}?${params.toString()}`
      : `/marca/${brandSlug}?${params.toString()}`;
    router.push(newUrl, { scroll: false });
  }, [brandSlug, categorySlug, hideOutOfStock, router, searchParams]);

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="hideOutOfStock"
        checked={hideOutOfStock}
        onCheckedChange={toggleHideOutOfStock}
      />
      <Label htmlFor="hideOutOfStock" className="cursor-pointer">
        Solo productos con stock
      </Label>
    </div>
  );
}
