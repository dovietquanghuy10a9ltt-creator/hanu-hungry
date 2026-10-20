export function pickRandom<T>(items: readonly T[]): T | null {
  if (!items.length) return null;
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return items[array[0] % items.length];
  }
  return items[Math.floor(Math.random() * items.length)];
}

/**
 * Checks if a dish is definitively a solid food item.
 * Prevents dishes like "Hộp gà xốt chanh leo", "Chân gà sả tắc", "Cơm rang" from ever being considered drinks.
 */
export function isFoodDish(dishName: string): boolean {
  const lower = dishName.toLowerCase().trim();
  if (
    /(gà|chân gà|cánh gà|đùi gà|bò|thịt|heo|lợn|vịt|ngan|sườn|hải sản|tôm|cá|mực|cơm|bún|phở|mì|miến|xôi|lẩu|nướng|tokbokki|nem|chả|dồi|dạ dày|ốc|hàu|sốt|xốt|hộp|suất|chảo|đĩa|bát|bánh mì|bánh bao|bánh gối|bánh cuốn|bánh tráng|bánh giò|khoai tây|khoai lang|há cảo|dimsum|pizza|burger|salad|cháo|súp)/iu.test(
      lower
    )
  ) {
    return true;
  }
  return false;
}

/**
 * Checks if a dish is a drink / beverage.
 */
export function isDrinkDish(dishName: string, categorySlugs: string[] = []): boolean {
  const lower = dishName.toLowerCase().trim();

  // 1. If it contains solid food keywords, it can never be a drink
  if (isFoodDish(dishName)) {
    return false;
  }

  // 2. Clear drink indicators
  if (
    /(trà|tra|cà phê|ca phe|cafe|coffee|bạc xỉu|bac xiu|sinh tố|sinh to|nước ép|nuoc ep|nước ngọt|nuoc ngot|sữa tươi|sua tuoi|sữa đậu|sua dau|sữa chua|sua chua|latte|macchiato|cappuccino|espresso|americano|soda|smoothie|coca|pepsi|sting|me đá|sấu đá|nước mía|nuoc mia|nước chanh|nuoc chanh|nước suối|nuoc suoi|nước khoáng|nuoc khoang|trà sữa|tra sua|hồng trà|hong tra|lục trà|luc tra|cacao|đá xay|da xay|trà tắc|tra tac|matcha|đồ uống|do uong)/iu.test(
      lower
    )
  ) {
    return true;
  }

  // 3. Fallback to restaurant categories if it's primarily a beverage stall
  if (categorySlugs.some((c) => c === "do-uong" || c === "tra-sua-ca-phe")) {
    if (!/(khoai|hướng dương|khô bò|khô gà|bắp|khô mực|bánh|nem|chả)/iu.test(lower)) {
      return true;
    }
  }

  return false;
}
