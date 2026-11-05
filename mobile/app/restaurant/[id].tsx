import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Linking,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import {
  MapPin,
  UtensilsCrossed,
  CheckCircle,
  Flame,
  ExternalLink,
  Tag,
} from "lucide-react-native";
import { useAuth } from "../../src/context/AuthContext";
import {
  getRestaurantDetails,
  recordCheckIn,
} from "../../src/services/restaurants";
import type { Restaurant, Dish } from "../../src/types";
import { Colors, Spacing } from "../../src/constants/theme";

export default function RestaurantDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [selectedDishId, setSelectedDishId] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      getRestaurantDetails(id)
        .then(({ restaurant, dishes }) => {
          setRestaurant(restaurant);
          setDishes(dishes);
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  // Mở Google Maps chỉ đường
  function handleOpenMaps() {
    if (!restaurant) return;
    let url = "";
    if (restaurant.latitude && restaurant.longitude) {
      url = `https://www.google.com/maps/search/?api=1&query=${restaurant.latitude},${restaurant.longitude}`;
    } else if (restaurant.plus_code) {
      url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.plus_code)}`;
    } else if (restaurant.address_text) {
      url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.address_text + " Đại học Hà Nội")}`;
    } else {
      url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name + " HANU")}`;
    }
    Linking.openURL(url);
  }

  // Thực hiện Check-in tại quán ăn
  async function handleCheckIn() {
    if (!user) {
      Alert.alert(
        "Yêu cầu đăng nhập",
        "Bạn cần đăng nhập tài khoản sinh viên HANU để thực hiện check-in và tích lũy chuỗi ngày."
      );
      return;
    }

    if (!restaurant) return;

    try {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {}

      setCheckingIn(true);
      const res = await recordCheckIn(user.id, restaurant.id, selectedDishId);
      setCheckingIn(false);

      if (res.success) {
        try {
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success
          );
        } catch {}

        Alert.alert(
          "Check-in thành công! 🔥",
          `Bạn đã check-in thành công tại ${restaurant.name}. Chuỗi ngày của bạn đã được ghi nhận!`
        );
      } else {
        Alert.alert("Lỗi Check-in", res.error || "Không thể ghi nhận check-in.");
      }
    } catch (err: any) {
      setCheckingIn(false);
      Alert.alert("Lỗi Check-in", err.message || "Đã có lỗi xảy ra.");
    }
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!restaurant) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.notFoundText}>Không tìm thấy thông tin quán ăn.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Ảnh Cover quán ăn */}
        <View style={styles.coverImageContainer}>
          {restaurant.image_url ? (
            <Image
              source={{ uri: restaurant.image_url }}
              style={styles.coverImage}
            />
          ) : (
            <View style={styles.coverPlaceholder}>
              <UtensilsCrossed size={48} color={Colors.muted} />
            </View>
          )}
        </View>

        {/* Thông tin quán */}
        <View style={styles.headerCard}>
          <Text style={styles.restaurantName}>{restaurant.name}</Text>

          {restaurant.address_text ? (
            <View style={styles.metaRow}>
              <MapPin size={15} color={Colors.primary} />
              <Text style={styles.addressText}>{restaurant.address_text}</Text>
            </View>
          ) : null}

          {restaurant.description ? (
            <Text style={styles.descriptionText}>
              {restaurant.description}
            </Text>
          ) : null}

          {/* Nút mở Google Maps */}
          <TouchableOpacity
            style={styles.mapsButton}
            onPress={handleOpenMaps}
          >
            <ExternalLink size={15} color={Colors.primary} />
            <Text style={styles.mapsButtonText}>Chỉ đường trên Google Maps</Text>
          </TouchableOpacity>
        </View>

        {/* Thực đơn món ăn */}
        <View style={styles.menuSection}>
          <View style={styles.menuSectionHeader}>
            <Text style={styles.menuSectionTitle}>Thực đơn món ăn</Text>
            <Text style={styles.dishCountBadge}>
              {dishes.length} món
            </Text>
          </View>

          {dishes.length === 0 ? (
            <Text style={styles.emptyMenuText}>
              Quán chưa cập nhật danh sách món cụ thể.
            </Text>
          ) : (
            <View style={styles.dishesList}>
              {dishes.map((dish) => {
                const isSelected = selectedDishId === dish.id;
                return (
                  <TouchableOpacity
                    key={dish.id}
                    style={[
                      styles.dishCard,
                      isSelected && styles.dishCardSelected,
                    ]}
                    onPress={() =>
                      setSelectedDishId(isSelected ? null : dish.id)
                    }
                  >
                    <View style={styles.dishInfo}>
                      <Text style={styles.dishName}>{dish.name}</Text>
                      {dish.price_text ? (
                        <View style={styles.dishPriceRow}>
                          <Tag size={12} color={Colors.secondary} />
                          <Text style={styles.dishPriceText}>
                            {dish.price_text}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    <View
                      style={[
                        styles.radioCircle,
                        isSelected && styles.radioCircleSelected,
                      ]}
                    >
                      {isSelected ? (
                        <CheckCircle size={16} color={Colors.primary} />
                      ) : null}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Thanh Check-in cố định phía dưới */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.checkInButton, checkingIn && styles.checkInButtonDisabled]}
          activeOpacity={0.85}
          disabled={checkingIn}
          onPress={handleCheckIn}
        >
          {checkingIn ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Flame size={20} color="#FFFFFF" />
              <Text style={styles.checkInButtonText}>
                {selectedDishId ? "Check-in kèm món đã chọn" : "Check-in quán này"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  notFoundText: {
    fontSize: 14,
    color: Colors.muted,
  },
  coverImageContainer: {
    width: "100%",
    height: 180,
    backgroundColor: Colors.lineLight,
  },
  coverImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  coverPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.primaryLight,
  },
  headerCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  restaurantName: {
    fontSize: 20,
    fontWeight: "900",
    color: Colors.ink,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  addressText: {
    fontSize: 13,
    color: Colors.muted,
    flex: 1,
  },
  descriptionText: {
    fontSize: 13,
    color: Colors.ink,
    lineHeight: 19,
    marginBottom: Spacing.md,
  },
  mapsButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.primaryLight,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  mapsButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.primary,
  },
  menuSection: {
    padding: Spacing.lg,
  },
  menuSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  menuSectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.ink,
  },
  dishCountBadge: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.muted,
  },
  emptyMenuText: {
    fontSize: 13,
    color: Colors.muted,
    fontStyle: "italic",
    paddingVertical: 20,
  },
  dishesList: {
    gap: Spacing.sm,
  },
  dishCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  dishCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: "#FFF8F8",
  },
  dishInfo: {
    flex: 1,
  },
  dishName: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.ink,
    marginBottom: 3,
  },
  dishPriceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dishPriceText: {
    fontSize: 12,
    color: Colors.secondary,
    fontWeight: "700",
  },
  radioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: Colors.line,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: Spacing.sm,
  },
  radioCircleSelected: {
    borderColor: Colors.primary,
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 8,
  },
  checkInButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.secondary,
    paddingVertical: 14,
    borderRadius: 14,
  },
  checkInButtonDisabled: {
    opacity: 0.6,
  },
  checkInButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
});

