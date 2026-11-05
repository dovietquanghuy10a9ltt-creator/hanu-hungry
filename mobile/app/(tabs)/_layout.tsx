import { Tabs } from "expo-router";
import { Compass, Sparkles, Flame, User } from "lucide-react-native";
import { Colors } from "../../src/constants/theme";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.muted,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.line,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
        },
        headerStyle: {
          backgroundColor: Colors.surface,
          borderBottomColor: Colors.line,
          borderBottomWidth: 1,
        },
        headerTitleStyle: {
          fontWeight: "800",
          fontSize: 18,
          color: Colors.ink,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Khám phá",
          headerTitle: "🍔 HANU HUNGRY",
          tabBarIcon: ({ color, size }) => (
            <Compass color={color} size={size ?? 22} />
          ),
        }}
      />
      <Tabs.Screen
        name="gacha"
        options={{
          title: "Gacha",
          headerTitle: "🎲 Vòng Quay Ẩm Thực",
          tabBarIcon: ({ color, size }) => (
            <Sparkles color={color} size={size ?? 22} />
          ),
        }}
      />
      <Tabs.Screen
        name="streak"
        options={{
          title: "Chuỗi ngày",
          headerTitle: "🔥 Thống Kê Check-in",
          tabBarIcon: ({ color, size }) => (
            <Flame color={color} size={size ?? 22} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Tài khoản",
          headerTitle: "👤 Sinh Viên HANU",
          tabBarIcon: ({ color, size }) => (
            <User color={color} size={size ?? 22} />
          ),
        }}
      />
    </Tabs>
  );
}
