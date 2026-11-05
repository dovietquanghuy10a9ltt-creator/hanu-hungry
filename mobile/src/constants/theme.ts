export const Colors = {
  primary: "#B51B2C", // Đỏ thương hiệu HANU
  primaryDark: "#8B1522",
  primaryLight: "#FDE8E9",
  secondary: "#D9480F", // Cam chuỗi ngày / streak
  secondaryLight: "#FFF4EB",
  background: "#F8F4EE", // Màu kem ấm đặc trưng Hanu Hungry
  surface: "#FFFFFF",
  ink: "#1F1B1A", // Màu chữ tối
  muted: "#756561", // Màu chữ phụ
  line: "#E5DED7", // Đường kẻ phân cách
  lineLight: "#F0EAE3",
  success: "#2B8A3E",
  successLight: "#EBFBEE",
  warning: "#E67700",
  warningLight: "#FFF9DB",
  error: "#C92A2A",
  star: "#F59F00",
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
};

export const Typography = {
  titleLarge: {
    fontSize: 22,
    fontWeight: "800" as const,
    color: Colors.ink,
  },
  titleMedium: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.ink,
  },
  body: {
    fontSize: 14,
    color: Colors.ink,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    color: Colors.muted,
  },
};

