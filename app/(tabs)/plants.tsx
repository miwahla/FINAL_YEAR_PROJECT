import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getPlantsByType, PlantRow } from "../../lib/db";
import { addToMyPlants, getMyPlants } from "../../lib/my-plants";

type TabKey = "crops" | "home";

// plants.tsx is in app/(tabs), images are in assets/images
const plantImages: Record<string, any> = {
  Cotton: require("../../assets/images/cotton.png"),
  Maize: require("../../assets/images/maize.png"),
  Wheat: require("../../assets/images/wheat.png"),
  Chilli: require("../../assets/images/chilli.png"),
  Coriander: require("../../assets/images/coriander.png"),
  Lemon: require("../../assets/images/lemon.png"),
  Potato: require("../../assets/images/potato.png"),
  Rice: require("../../assets/images/rice.png"),
  Garlic: require("../../assets/images/garlic.png"),
  Onion: require("../../assets/images/onion.png"),
  Sugarcane: require("../../assets/images/sugarcane.png"),
  Sunflower: require("../../assets/images/sunflower.png"),
  Tomato: require("../../assets/images/tomato.png"),
  "Aloe Vera": require("../../assets/images/aloevera.png"),
  Carrot: require("../../assets/images/carrot.png"),
  Ginger: require("../../assets/images/ginger.png"),
  Lettuce: require("../../assets/images/lettuce.png"),
  Mint: require("../../assets/images/mint.png"),
};

const getPlantImage = (name_en: string) => plantImages[name_en] ?? null;

export default function PlantsScreen() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabKey>("crops");
  const [plants, setPlants] = useState<PlantRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [myPlantIds, setMyPlantIds] = useState<Set<string>>(new Set());

  const type = useMemo(() => (activeTab === "crops" ? "crop" : "home"), [activeTab]);

  // Load "My Plants" IDs (so we can show Add / Added)
  const loadMyPlantIds = useCallback(async () => {
    try {
      const saved = await getMyPlants();
      setMyPlantIds(new Set(saved.map((p) => p.id)));
    } catch (e) {
      console.log("❌ Error loading my plants ids:", e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadMyPlantIds();
    }, [loadMyPlantIds])
  );

  // Load plants from local SQLite (fast), then fetch saved IDs from Supabase in background
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        const rows = await getPlantsByType(type);
        if (!cancelled) {
          setPlants(rows);
          setLoading(false);
        }
      } catch (e) {
        console.log("❌ Error loading plants:", e);
        if (!cancelled) setLoading(false);
      }

      // Load Supabase saved IDs after plants are already shown
      loadMyPlantIds().catch(() => {});
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [type, loadMyPlantIds]);

  const handlePressPlant = (plant: PlantRow) => {
    router.push({
      pathname: "/plant-detail",
      params: { plantId: plant.id },
    });
  };

  const handleAdd = async (plantId: string) => {
    try {
      await addToMyPlants(plantId);
      setMyPlantIds((prev) => new Set([...prev, plantId]));
    } catch (e) {
      console.log("❌ Error adding to my plants:", e);
    }
  };

  const renderItem = ({ item }: { item: PlantRow }) => {
    const imgSource = getPlantImage(item.name_en);
    const isAdded = myPlantIds.has(item.id);

    return (
      <TouchableOpacity
        onPress={() => handlePressPlant(item)}
        style={styles.card}
        activeOpacity={0.9}
      >
        <View style={styles.cardInner}>
          <View style={styles.imageWrap}>
            {imgSource ? (
              <Image source={imgSource} style={styles.cardImage} />
            ) : (
              <View style={styles.imageFallback} />
            )}
          </View>

          <View style={styles.cardTextWrapper}>
            <View style={styles.titleRow}>
              <Text style={styles.nameEn} numberOfLines={1}>
                {item.name_en}
              </Text>

              {/* ✅ Fix: Wheat urdu was getting clipped — give it a pill with padding + maxWidth */}
              <View style={styles.urduPill}>
                <Text style={styles.nameUr} numberOfLines={1}>
                  {item.name_ur}
                </Text>
              </View>
            </View>

            <Text style={styles.cardHint} numberOfLines={1}>
              Tap to view details
            </Text>
          </View>

          {/* ADD BUTTON */}
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              if (!isAdded) handleAdd(item.id);
            }}
            style={[styles.addBtn, isAdded && styles.addBtnAdded]}
            activeOpacity={0.85}
          >
            <Text style={[styles.addBtnText, isAdded && styles.addBtnTextAdded]}>
              {isAdded ? "Added" : "Add"}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.heading}>Plants</Text>
          <Text style={styles.subheading}>Choose what you want to explore</Text>
        </View>

        {/* Segmented Control */}
        <View style={styles.segment}>
          <TouchableOpacity
            style={[
              styles.segmentBtn,
              activeTab === "crops" && styles.segmentActive,
            ]}
            onPress={() => setActiveTab("crops")}
            activeOpacity={0.9}
          >
            <Text
              style={[
                styles.segmentText,
                activeTab === "crops" && styles.segmentActiveText,
              ]}
            >
              Field Crops
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentBtn,
              activeTab === "home" && styles.segmentActive,
            ]}
            onPress={() => setActiveTab("home")}
            activeOpacity={0.9}
          >
            <Text
              style={[
                styles.segmentText,
                activeTab === "home" && styles.segmentActiveText,
              ]}
            >
              Homegrown
            </Text>
          </TouchableOpacity>
        </View>

        {/* List */}
        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="small" />
          </View>
        ) : (
          <FlatList
            data={plants}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyTitle}>Nothing here yet</Text>
                <Text style={styles.emptyText}>
                  No plants found for this category.
                </Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const GREEN = "#22C55E";
const BG = "#e8eee4ff";

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },

  header: {
    marginBottom: 14,
  },
  heading: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
  },
  subheading: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },

  /* Segmented */
  segment: {
    flexDirection: "row",
    backgroundColor: "#E5E7EB",
    borderRadius: 16,
    padding: 4,
    marginBottom: 14,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  segmentActive: {
    backgroundColor: "#FFFFFF",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 2 },
    }),
  },
  segmentText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "700",
  },
  segmentActiveText: {
    color: "#111827",
  },

  listContent: {
    paddingBottom: 24,
  },

  /* Card */
  card: {
    backgroundColor: "#badad3ff",
    borderRadius: 18,
    padding: 12,
    marginBottom: 12,

    borderLeftWidth: 4,
    borderLeftColor: GREEN,

    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 3 },
    }),
  },
  cardInner: {
    flexDirection: "row",
    alignItems: "center",
  },

  imageWrap: {
    width: 56,
    height: 56,
    borderRadius: 5,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  imageFallback: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#f3eda7ff",
  },

  cardTextWrapper: {
    flex: 1,
    minWidth: 0, // ✅ important so text can shrink instead of pushing out
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  nameEn: {
    flex: 1,
    minWidth: 0,
    fontSize: 17,
    fontWeight: "800",
    color: "#064E3B",
  },

  /* ✅ Urdu pill prevents clipping + keeps it readable */
  urduPill: {
    maxWidth: 110, // adjust if you want more space
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 1,
    backgroundColor: "#badad3ff",
    borderWidth: 1,
    borderColor: "#badad3ff",
  },
  nameUr: {
    fontSize: 18,
    fontWeight: "700",
    color: "#121211ff",
    textAlign: "right",
    includeFontPadding: false,
  },

  cardHint: {
    marginTop: 6,
    fontSize: 12,
    color: "#6B7280",
  },

  /* Add button */
  addBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: GREEN,
    marginLeft: 10,
    ...Platform.select({
      ios: {
        shadowColor: GREEN,
        shadowOpacity: 0.35,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 1 },
    }),
  },
  addBtnAdded: {
    backgroundColor: "#E5E7EB",
  },
  addBtnText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 12,
  },
  addBtnTextAdded: {
    color: "#111827",
  },

  loaderWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyWrap: {
    paddingTop: 60,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: "#6B7280",
  },
});
