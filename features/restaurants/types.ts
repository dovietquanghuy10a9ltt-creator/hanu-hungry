export type RestaurantSummary = {
  id: string;
  name: string;
  area: string | null;
  address_text: string | null;
  image_url: string | null;
  min_price_vnd: number | null;
  categories: string[] | null;
};

export type Dish = {
  id: string;
  name: string;
  price_text: string | null;
  price_min_vnd: number | null;
  price_max_vnd: number | null;
  notes: string | null;
  is_active: boolean;
};

export type RestaurantDetail = {
  id: string;
  name: string;
  area: string | null;
  address_text: string | null;
  plus_code: string | null;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  image_url: string | null;
  notes: string | null;
  dishes: Dish[];
  restaurant_categories: { categories: { id: string; name: string; slug: string } | null }[];
};
