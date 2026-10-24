export type RawCheckIn = {
  id: string;
  visited_at: string;
  restaurant_id: string;
  restaurant_name: string;
  dish_id: string | null;
  dish_name: string | null;
  user_id: string;
  user_name: string;
  student_code?: string;
};

export type AnalyticsSummary = {
  totalRestaurants: number;
  totalDishes: number;
  totalCheckIns: number;
  totalReviews: number;
  averageRating: number | null;
};

export type SystemAccount = {
  id: string;
  student_code: string;
  display_name: string;
  avatar_url: string | null;
  role: "USER" | "ADMIN";
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
};

export type PeriodOption = "week" | "month" | "year" | "custom";
export type MetricTab = "accounts" | "dishes" | "restaurants" | "users" | "streaks";

export type UserStreakRankingItem = {
  userId: string;
  studentCode: string;
  displayName: string;
  avatarUrl: string | null;
  role: "USER" | "ADMIN";
  email: string;
  currentStreak: number;
  longestStreak: number;
  isTodayCheckedIn: boolean;
  totalCheckIns: number;
  lastCheckInAt: string | null;
};

