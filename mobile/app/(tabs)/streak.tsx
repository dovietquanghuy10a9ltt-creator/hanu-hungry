import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { Flame, Trophy, CalendarCheck, MapPin, Clock } from "lucide-react-native";
import { useAuth } from "../../src/context/AuthContext";
import { getUserCheckIns } from "../../src/services/restaurants";
import { historyStats } from "../../src/services/streaks";
import type { CheckIn } from "../../src/types";
import { Colors, Spacing } from "../../src/constants/theme";

export default function StreakScreen() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadCheckIns() {
    if (!user) {
      setLoading(false);
      setRefreshing(false);
      return;
    }
    try {
      const data = await getUserCheckIns(user.id);
      setCheckIns(data);
    } catch (err) {
      console.warn("Lỗi tải lịch sử check-in:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadCheckIns();
  }, [user]);

  const stats = historyStats(checkIns);

  if (!user) {
    return (
      <View style={styles.authPromptContainer}>
        <Flame size={56} color={Colors.secondary} />
        <Text style={styles.authPromptTitle}>Đăng nhập để giữ chuỗi ngày</Text>
        <Text style={styles.authPromptSubtitle}>
          Check-in món ăn hàng ngày để tích lũy chuỗi kỷ lục và tranh tài trên Bảng xếp hạng sinh viên HANU!
        </Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.push("/(tabs)/profile" as any)}
        >
          <Text style={styles.loginButtonText}>Đăng nhập ngay</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 2 Thẻ Chuỗi Hiện Tại & Kỷ Lục */}
      <View style={styles.statsRow}>
        <View style={styles.streakCard}>
          <View style={styles.streakCardHeader}>
            <Flame size={20} color={Colors.secondary} />
            <Text style={styles.streakCardLabel}>Chuỗi hiện tại</Text>
          </View>
          <Text style={styles.streakValue}>
            {stats.currentStreak} <Text style={styles.streakUnit}>ngày</Text>
          </Text>
          <View
            style={[
              styles.todayStatusBadge,
              stats.isTodayCheckedIn
                ? styles.todayStatusBadgeActive
                : styles.todayStatusBadgePending,
            ]}
          >
            <Text
              style={[
                styles.todayStatusText,
                stats.isTodayCheckedIn
                  ? styles.todayStatusTextActive
                  : styles.todayStatusTextPending,
              ]}
            >
              {stats.isTodayCheckedIn
                ? "✅ Hôm nay đã check-in"
                : "⏳ Hôm nay chưa check-in"}
            </Text>
          </View>
        </View>

        <View style={styles.recordCard}>
          <View style={styles.streakCardHeader}>
            <Trophy size={20} color="#D9480F" />
            <Text style={styles.streakCardLabel}>Chuỗi kỷ lục</Text>
          </View>
          <Text style={styles.recordValue}>
            {stats.longestStreak} <Text style={styles.streakUnit}>ngày</Text>
          </Text>
          <Text style={styles.recordSubtext}>
            Tổng check-in: {checkIns.length} lần
          </Text>
        </View>
      </View>

      {/* Danh sách nhật ký check-in gần đây */}
      <View style={styles.historyHeader}>
        <CalendarCheck size={18} color={Colors.primary} />
        <Text style={styles.historyTitle}>Nhật ký ghé quán gần đây</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={checkIns}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadCheckIns();
              }}
              colors={[Colors.primary]}
            />
          }
          contentContainerStyle={styles.historyList}
          renderItem={({ item }) => {
            const dateStr = new Date(item.visited_at).toLocaleDateString(
              "vi-VN",
              {
                hour: "2-digit",
                minute: "2-digit",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              }
            );

            return (
              <View style={styles.historyItem}>
                <View style={styles.historyDot} />
                <View style={styles.historyItemContent}>
                  <Text style={styles.historyRestaurantName}>
                    {item.restaurant?.name || "Quán ăn HANU"}
                  </Text>
                  {item.dish?.name ? (
                    <Text style={styles.historyDishName}>
                      Món: {item.dish.name}
                    </Text>
                  ) : null}
                  <View style={styles.historyTimeRow}>
                    <Clock size={11} color={Colors.muted} />
                    <Text style={styles.historyTimeText}>{dateStr}</Text>
                  </View>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyHistory}>
              <Flame size={40} color={Colors.muted} />
              <Text style={styles.emptyHistoryTitle}>Chưa có check-in nào</Text>
              <Text style={styles.emptyHistorySubtitle}>
                Hãy ghé một quán ăn và check-in để bắt đầu chuỗi ngày đầu tiên!
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.lg,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  streakCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FFD8A8",
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recordCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  streakCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  streakCardLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.muted,
  },
  streakValue: {
    fontSize: 28,
    fontWeight: "900",
    color: Colors.secondary,
    marginVertical: 4,
  },
  recordValue: {
    fontSize: 28,
    fontWeight: "900",
    color: Colors.ink,
    marginVertical: 4,
  },
  streakUnit: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.muted,
  },
  todayStatusBadge: {
    marginTop: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  todayStatusBadgeActive: {
    backgroundColor: Colors.successLight,
  },
  todayStatusBadgePending: {
    backgroundColor: "#FFF9DB",
  },
  todayStatusText: {
    fontSize: 10,
    fontWeight: "700",
  },
  todayStatusTextActive: {
    color: Colors.success,
  },
  todayStatusTextPending: {
    color: Colors.warning,
  },
  recordSubtext: {
    fontSize: 11,
    color: Colors.muted,
    marginTop: 6,
  },
  historyHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: Spacing.md,
  },
  historyTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.ink,
  },
  historyList: {
    paddingBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  historyItem: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: "center",
  },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginRight: Spacing.md,
  },
  historyItemContent: {
    flex: 1,
  },
  historyRestaurantName: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.ink,
    marginBottom: 2,
  },
  historyDishName: {
    fontSize: 12,
    color: Colors.muted,
    marginBottom: 4,
  },
  historyTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  historyTimeText: {
    fontSize: 11,
    color: Colors.muted,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyHistory: {
    paddingVertical: 50,
    alignItems: "center",
  },
  emptyHistoryTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.ink,
    marginTop: Spacing.md,
  },
  emptyHistorySubtitle: {
    fontSize: 12,
    color: Colors.muted,
    marginTop: 4,
    textAlign: "center",
    maxWidth: 240,
  },
  authPromptContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  authPromptTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.ink,
    marginTop: Spacing.md,
    marginBottom: 6,
    textAlign: "center",
  },
  authPromptSubtitle: {
    fontSize: 13,
    color: Colors.muted,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: Spacing.xl,
    maxWidth: 280,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 14,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});
