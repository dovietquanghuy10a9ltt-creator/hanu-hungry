export function pickRandom<T>(items: readonly T[]): T | null {
  if (!items.length) return null;
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return items[array[0] % items.length];
  }
  return items[Math.floor(Math.random() * items.length)];
}

export function isDrinkDish(dishName: string, categorySlugs: string[] = []): boolean {
  const lower = dishName.toLowerCase().trim();
  if (/^(cơm|com|bún|bun|phở|pho|bánh|banh|mì|mi|miến|mien|xôi|xoi|lẩu|lau|nướng|nuong|gà|ga|chân gà|chan ga|nem|chả|cha|khoai|set|combo|cháo|chao|súp|sup|salad)(?:\s|$)/iu.test(lower)) {
    return false;
  }
  if (/(trà|tra|cà phê|ca phe|cafe|coffee|bạc xỉu|bac xiu|sinh tố|sinh to|nước ép|nuoc ep|nước ngọt|nuoc ngot|sữa tươi|sua tuoi|sữa đậu|sua dau|sữa chua|sua chua|latte|macchiato|cappuccino|espresso|americano|soda|smoothie|coca|pepsi|sting|me đá|sấu đá|nước mía|nuoc mia|nước chanh|nuoc chanh|nước suối|nuoc suoi|nước khoáng|nuoc khoang|trà sữa|tra sua|hồng trà|hong tra|lục trà|luc tra|cacao|đá xay|da xay|chanh leo|trà tắc|tra tac|matcha|đồ uống|do uong)/iu.test(lower)) {
    return true;
  }
  if (categorySlugs.some((c) => c === "do-uong" || c === "tra-sua-ca-phe")) {
    if (!/(khoai|hướng dương|khô bò|khô gà|bắp|khô mực)/iu.test(lower)) {
      return true;
    }
  }
  return false;
}

