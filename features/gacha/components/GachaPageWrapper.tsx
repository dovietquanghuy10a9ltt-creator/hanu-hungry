"use client";

import { useSearchParams } from "next/navigation";
import { GachaExperience, type GachaMode } from "./GachaExperience";
import type { CatalogRestaurant } from "@/features/restaurants/search";

export function GachaPageWrapper({
  catalog,
  restaurantNames,
  foodNames,
  drinkNames,
}: {
  catalog: CatalogRestaurant[];
  restaurantNames: string[];
  foodNames: string[];
  drinkNames: string[];
}) {
  const searchParams = useSearchParams();
  const modeParam = searchParams.get("mode");
  const initialMode: GachaMode =
    modeParam === "food" || modeParam === "dish"
      ? "food"
      : modeParam === "drink"
      ? "drink"
      : "restaurant";

  return (
    <GachaExperience
      catalog={catalog}
      restaurantNames={restaurantNames}
      foodNames={foodNames}
      drinkNames={drinkNames}
      initialMode={initialMode}
    />
  );
}
