import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Modal,
} from "react-native";
import * as Haptics from "expo-haptics";
import { Dices, Sparkles, Utensils, CheckCircle2, X } from "lucide-react-native";
import { getGachaCandidates } from "../../src/services/restaurants";
import type { Dish } from "../../src/types";
import { Colors, Spacing } from "../../src/constants/theme";

const BUDGET_OPTIONS = [
  { label: "Tất cả mức giá", value: 0 },
  { label: "Dưới 30.000đ", value: 30000 },
  { label: "Dưới 45.000đ", value: 45000 },
  { label: "Dưới 60.000đ", value: 60000 },
];

export default function GachaScreen() {
  const [selectedBudget, setSelectedBudget] = useState<number>(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<(Dish & { restaurantName?: string }) | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  async function handleSpin() {
    try {
      // 1. Rung xúc giác bắt đầu
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      } catch {}

      setSpinning(true);
      const candidates = await getGachaCandidates(
        selectedBudget > 0 ? selectedBudget : undefined
      );

      if (candidates.length === 0) {
        Alert.alert(
          "Chưa tìm thấy món",
          "Không có món ăn nào phù hợp với ngân sách này. Bạn thử chọn mức giá khác nhé!"
        );
        setSpinning(false);
        return;
      }

      // Giả lập hiệu ứng quay số trong 1.5 giây với rung nhịp tim (Haptic pulses)
      const pulseInterval = setInterval(() => {
        try {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch {}
      }, 250);

      setTimeout(async () => {
        clearInterval(pulseInterval);
        // Chọn ngẫu nhiên 1 món
        const randomIndex = Math.floor(Math.random() * candidates.length);
        const picked = candidates[randomIndex];
        setResult(picked);
        setSpinning(false);
        setModalVisible(true);

        // Rung thông báo thành công (Notification Success)
        try {
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success
          );
        } catch {}
      }, 1500);
    } catch (err) {
      console.warn("Lỗi quay Gacha:", err);
      setSpinning(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.headerTitle}>HÔM NAY ĂN GÌ?</Text>
        <Text style={styles.headerSubtitle}>
          Khỏi đau đầu suy nghĩ trước cổng HANU! Để Hanu Hungry chọn món giúp bạn.
        </Text>
      </View>

      {/* Bộ lọc ngân sách */}
      <View style={styles.budgetSection}>
        <Text style={styles.sectionLabel}>Chọn mức ngân sách của bạn:</Text>
        <View style={styles.budgetRow}>
          {BUDGET_OPTIONS.map((opt) => {
            const isSelected = selectedBudget === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.budgetButton,
                  isSelected && styles.budgetButtonSelected,
                ]}
                onPress={() => setSelectedBudget(opt.value)}
              >
                <Text
                  style={[
                    styles.budgetText,
                    isSelected && styles.budgetTextSelected,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Khu vực vòng quay */}
      <View style={styles.wheelArea}>
        <View style={styles.wheelOuter}>
          <View style={styles.wheelInner}>
            {spinning ? (
              <ActivityIndicator size="large" color="#FFFFFF" />
            ) : (
              <Dices size={64} color="#FFFFFF" />
            )}
            <Text style={styles.wheelCenterText}>
              {spinning ? "ĐANG TÌM MÓN..." : "GACHA HANU"}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.spinButton, spinning && styles.spinButtonDisabled]}
          activeOpacity={0.85}
          disabled={spinning}
          onPress={handleSpin}
        >
          <Sparkles size={22} color="#FFFFFF" />
          <Text style={styles.spinButtonText}>
            {spinning ? "ĐANG QUAY..." : "QUAY NGAY"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modal Popup Kết quả trúng thưởng */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeIcon}
              onPress={() => setModalVisible(false)}
            >
              <X size={20} color={Colors.muted} />
            </TouchableOpacity>

            <View style={styles.celebrationBadge}>
              <Text style={styles.celebrationEmoji}>🎉</Text>
              <Text style={styles.celebrationTitle}>MÓN ĂN DÀNH CHO BẠN!</Text>
            </View>

            <View style={styles.resultBox}>
              <Text style={styles.resultDishName}>{result?.name}</Text>
              <View style={styles.resultRestaurantRow}>
                <Utensils size={14} color={Colors.muted} />
                <Text style={styles.resultRestaurantName}>
                  {result?.restaurantName}
                </Text>
              </View>
              {result?.price_text ? (
                <View style={styles.priceTag}>
                  <Text style={styles.priceTagText}>
                    Giá: {result.price_text}
                  </Text>
                </View>
              ) : null}
            </View>

            <TouchableOpacity
              style={styles.acceptButton}
              onPress={() => setModalVisible(false)}
            >
              <CheckCircle2 size={18} color="#FFFFFF" />
              <Text style={styles.acceptButtonText}>Chốt món này luôn!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: Spacing.lg,
  },
  headerBox: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.muted,
    textAlign: "center",
    marginTop: 4,
    lineHeight: 18,
  },
  budgetSection: {
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.ink,
    marginBottom: Spacing.sm,
  },
  budgetRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  budgetButton: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: Colors.surface,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: "center",
  },
  budgetButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  budgetText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.ink,
  },
  budgetTextSelected: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  wheelArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  wheelOuter: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 6,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: Spacing.xxl,
  },
  wheelInner: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  wheelCenterText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 8,
    letterSpacing: 0.5,
  },
  spinButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.secondary,
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 30,
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  spinButtonDisabled: {
    opacity: 0.6,
  },
  spinButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  modalContent: {
    width: "100%",
    backgroundColor: Colors.surface,
    borderRadius: 24,
    padding: Spacing.xl,
    alignItems: "center",
    position: "relative",
  },
  closeIcon: {
    position: "absolute",
    top: Spacing.md,
    right: Spacing.md,
    padding: 6,
  },
  celebrationBadge: {
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  celebrationEmoji: {
    fontSize: 42,
  },
  celebrationTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: Colors.primary,
    marginTop: 4,
  },
  resultBox: {
    width: "100%",
    backgroundColor: Colors.background,
    padding: Spacing.lg,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  resultDishName: {
    fontSize: 18,
    fontWeight: "900",
    color: Colors.ink,
    textAlign: "center",
    marginBottom: 6,
  },
  resultRestaurantRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  resultRestaurantName: {
    fontSize: 13,
    color: Colors.muted,
  },
  priceTag: {
    backgroundColor: "#FFF4EB",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FFD8A8",
  },
  priceTagText: {
    color: Colors.secondary,
    fontSize: 12,
    fontWeight: "800",
  },
  acceptButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 14,
    width: "100%",
    justifyContent: "center",
  },
  acceptButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
});

