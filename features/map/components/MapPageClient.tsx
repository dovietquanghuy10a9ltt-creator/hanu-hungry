"use client";

import { useState, useMemo } from "react";
import type { CatalogRestaurant } from "@/features/restaurants/catalog";
import { HanuMapContainer } from "./HanuMapContainer";
import { MapSearchBar } from "./MapSearchBar";
import { MapBottomSheet } from "./MapBottomSheet";

interface MapPageClientProps {
  initialCatalog: CatalogRestaurant[];
}

export function MapPageClient({ initialCatalog }: MapPageClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeAlley, setActiveAlley] = useState("Tất cả");
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null);

  // Lọc quán theo tìm kiếm và ngõ
  const filteredRestaurants = useMemo(() => {
    return initialCatalog.filter((restaurant) => {
      // Lọc theo ngõ
      if (activeAlley !== "Tất cả") {
        const area = (restaurant.area || "").toLowerCase();
        const targetAlley = activeAlley.toLowerCase();
        if (targetAlley === "cổng trường") {
          if (!area.includes("cổng trường")) return false;
        } else if (!area.includes(targetAlley)) {
          return false;
        }
      }

      // Lọc theo từ khóa tìm kiếm
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const nameMatch = restaurant.name.toLowerCase().includes(query);
        const areaMatch = (restaurant.area || "").toLowerCase().includes(query);
        const dishMatch = restaurant.dishes.some((d: { name: string }) =>
          d.name.toLowerCase().includes(query)
        );
        const categoryMatch = (restaurant.categories || []).some((c: string) =>
          c.toLowerCase().includes(query)
        );
        if (!nameMatch && !areaMatch && !dishMatch && !categoryMatch) {
          return false;
        }
      }

      return true;
    });
  }, [initialCatalog, activeAlley, searchQuery]);

  const handleSelectRestaurant = (restaurant: CatalogRestaurant) => {
    setSelectedRestaurantId(restaurant.id);
  };

  const handleResetCenter = () => {
    setSearchQuery("");
    setActiveAlley("Tất cả");
    setSelectedRestaurantId(null);
  };

  return (
    <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden bg-[#faf7ef]">
      {/* Top Floating Search & Filter Bar */}
      <div className="absolute top-3 left-3 right-3 sm:left-6 sm:right-6 md:left-auto md:right-6 md:w-[460px] z-20 pointer-events-none">
        <MapSearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeAlley={activeAlley}
          onAlleyChange={setActiveAlley}
          totalFiltered={filteredRestaurants.length}
          onResetCenter={handleResetCenter}
        />
      </div>

      {/* Main Map Container */}
      <HanuMapContainer
        restaurants={filteredRestaurants}
        selectedRestaurantId={selectedRestaurantId}
        onSelectRestaurant={handleSelectRestaurant}
        className="w-full h-full"
      />

      {/* Floating Bottom Drawer / Desktop Sidebar */}
      <MapBottomSheet
        restaurants={filteredRestaurants}
        selectedRestaurantId={selectedRestaurantId}
        onSelectRestaurant={handleSelectRestaurant}
      />
    </div>
  );
}
