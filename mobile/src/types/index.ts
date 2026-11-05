export interface Restaurant {
  id: string;
  source_stt?: number;
  name: string;
  area: string | null;
  address_text: string | null;
  plus_code: string | null;
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  image_url: string | null;
  notes: string | null;
  is_active: boolean;
  categories?: Category[];
}

export interface Dish {
  id: string;
  restaurant_id: string;
  name: string;
  price_text: string | null;
  price_min_vnd: number | null;
  price_max_vnd: number | null;
  image_url: string | null;
  notes: string | null;
  is_active: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Profile {
  id: string;
  student_code: string;
  display_name: string;
  avatar_url: string | null;
  role: "USER" | "ADMIN";
}

export interface CheckIn {
  id: string;
  user_id: string;
  restaurant_id: string;
  dish_id: string | null;
  visited_at: string;
  restaurant?: {
    name: string;
  };
  dish?: {
    name: string;
  };
}

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  isTodayCheckedIn: boolean;
  totalCheckIns: number;
}

