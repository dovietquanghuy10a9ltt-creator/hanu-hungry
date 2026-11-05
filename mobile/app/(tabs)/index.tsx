import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { Search, MapPin, Star, UtensilsCrossed } from "lucide-react-native";
import { getActiveRestaurants } from "../../src/services/restaurants";
import type { Restaurant } from "../../src/types";
import { Colors, Spacing } from "../../src/constants/theme";

export default function DiscoveryScreen() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArea, setSelectedArea] = useState<string>("all");

  async function loadData() {
    try {
      const data = await getActiveRestaurants();
      setRestaurants(data);
    } catch (err) {
      console.warn("Lỗi tải danh sách quán ăn:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const areas = useMemo(() => {
    const list = new Set<string>();
    restaurants.forEach((r) => {
      if (r.area) list.add(r.area);
    });
    return ["all", ...Array.from(list)];
  }, [restaurants]);

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((r) => {
      if (selectedArea !== "all" && r.area !== selectedArea) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        r.name.toLowerCase().includes(q) ||
        (r.area && r.area.toLowerCase().includes(q)) ||
        (r.address_text && r.address_text.toLowerCase().includes(q))
      );
    });
  }, [restaurants, searchQuery, selectedArea]);

  const renderRestaurantCard = ({ item }: { item: Restaurant }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => router.push(`/restaurant/${item.id}` as any)}
    >
      <View style={styles.cardImageContainer}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.cardImage} />
        ) : (
          <View style={styles.cardImagePlaceholder}>
            <UtensilsCrossed size={32} color={Colors.muted} />
          </View>
        )}
        {item.area ? (
          <View style={styles.areaBadge}>
            <Text style={styles.areaBadgeText}>{item.area}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {item.name}
        </Text>

        {item.address_text ? (
          <View style={styles.cardAddressRow}>
            <MapPin size={13} color={Colors.muted} />
            <Text style={styles.cardAddress} numberOfLines={1}>
              {item.address_text}
            </Text>
          </View>
        ) : null}

        {item.description ? (
          <Text style={styles.cardDescription} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}

        <View style={styles.cardFooter}>
          <View style={styles.ratingBadge}>
            <Star size={12} color="#F59F00" fill="#F59F00" />
            <Text style={styles.ratingText}>Phổ biến</Text>
          </View>
          <Text style={styles.viewDetailsText}>Xem thực đơn →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Thanh tìm kiếm */}
      <View style={styles.searchHeader}>
        <View style={styles.searchBar}>
          <Search size={18} color={Colors.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm quán ăn, bún chả, cơm tấm quanh HANU..."
            placeholderTextColor={Colors.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Bộ lọc khu vực cuộn ngang */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={areas}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.areaFilterList}
          renderItem={({ item }) => {
            const isSelected = selectedArea === item;
            return (
              <TouchableOpacity
                style={[
                  styles.areaFilterChip,
                  isSelected && styles.areaFilterChipSelected,
                ]}
                onPress={() => setSelectedArea(item)}
              >
                <Text
                  style={[
                    styles.areaFilterText,
                    isSelected && styles.areaFilterTextSelected,
                  ]}
                >
                  {item === "all" ? "Tất cả khu vực" : item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Danh sách quán ăn */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Đang khám phá quán ngon quanh HANU...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredRestaurants}
          keyExtractor={(item) => item.id}
          renderItem={renderRestaurantCard}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadData();
              }}
              colors={[Colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <UtensilsCrossed size={48} color={Colors.muted} />
              <Text style={styles.emptyTitle}>Không tìm thấy quán nào</Text>
              <Text style={styles.emptySubtitle}>
                Thử thay đổi từ khóa hoặc bộ lọc khu vực bạn nhé.
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
  },
  searchHeader: {
    backgroundColor: Colors.surface,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    marginHorizontal: Spacing.lg,
    paddingHorizontal: Spacing.md,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: 14,
    color: Colors.ink,
  },
  areaFilterList: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    gap: Spacing.sm,
  },
  areaFilterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  areaFilterChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  areaFilterText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.muted,
  },
  areaFilterTextSelected: {
    color: "#FFFFFF",
  },
  listContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.line,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardImageContainer: {
    height: 140,
    backgroundColor: Colors.lineLight,
    position: "relative",
  },
  cardImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  cardImagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.primaryLight,
  },
  areaBadge: {
    position: "absolute",
    top: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: "rgba(31, 27, 26, 0.75)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: 8,
  },
  areaBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  cardContent: {
    padding: Spacing.md,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.ink,
    marginBottom: 4,
  },
  cardAddressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  cardAddress: {
    fontSize: 12,
    color: Colors.muted,
    flex: 1,
  },
  cardDescription: {
    fontSize: 12,
    color: Colors.muted,
    lineHeight: 17,
    marginBottom: Spacing.sm,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: Colors.lineLight,
    paddingTop: Spacing.sm,
    marginTop: 4,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFF9DB",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#D9480F",
  },
  viewDetailsText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.primary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: 13,
    color: Colors.muted,
    fontWeight: "600",
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.ink,
    marginTop: Spacing.md,
  },
  emptySubtitle: {
    fontSize: 12,
    color: Colors.muted,
    marginTop: 4,
    textAlign: "center",
  },
});
