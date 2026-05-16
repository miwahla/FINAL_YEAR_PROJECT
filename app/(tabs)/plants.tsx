import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
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

import { useTheme } from "../../contexts/theme";
import { getPlantsByType, PlantRow } from "../../lib/db";

type TabKey = "crops" | "home";

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
  const { colors, isDark } = useTheme();

  const [activeTab, setActiveTab] = useState<TabKey>("crops");
  const [plants, setPlants] = useState<PlantRow[]>([]);
  const [loading, setLoading] = useState(true);

  const type = useMemo(() => (activeTab === "crops" ? "crop" : "home"), [activeTab]);

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
    };

    load();
    return () => { cancelled = true; };
  }, [type]);

  const handlePressPlant = (plant: PlantRow) => {
    router.push({ pathname: "/plant-detail", params: { plantId: plant.id } });
  };

  const renderItem = ({ item }: { item: PlantRow }) => {
    const imgSource = getPlantImage(item.name_en);

    return (
      <TouchableOpacity
        onPress={() => handlePressPlant(item)}
        style={[styles.card, { backgroundColor: isDark ? "#1a3a30" : "#badad3ff" }]}
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
              <Text style={[styles.nameEn, { color: isDark ? "#a7f3d0" : "#064E3B" }]} numberOfLines={1}>
                {item.name_en}
              </Text>
              <View style={styles.urduPill}>
                <Text style={[styles.nameUr, { color: isDark ? "#d1fae5" : "#121211ff" }]} numberOfLines={1}>
                  {item.name_ur}
                </Text>
              </View>
            </View>
            <Text style={[styles.cardHint, { color: colors.textSub }]} numberOfLines={1}>
              Tap to view details
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? colors.bg : "#e8eee4ff" }]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.heading, { color: colors.text }]}>Plants</Text>
          <Text style={[styles.subheading, { color: colors.textSub }]}>Choose what you want to explore</Text>
        </View>

        <View style={[styles.segment, { backgroundColor: isDark ? colors.bg2 : "#E5E7EB" }]}>
          {(["crops", "home"] as TabKey[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.segmentBtn, activeTab === tab && [styles.segmentActive, { backgroundColor: colors.card }]]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.9}
            >
              <Text style={[styles.segmentText, { color: activeTab === tab ? colors.text : colors.textSub }]}>
                {tab === "crops" ? "Field Crops" : "Homegrown"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="small" color={colors.textSub} />
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
                <Text style={[styles.emptyTitle, { color: colors.text }]}>Nothing here yet</Text>
                <Text style={[styles.emptyText, { color: colors.textSub }]}>No plants found for this category.</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const GREEN = "#22C55E";

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 10 },

  header: { marginBottom: 14 },
  heading: { fontSize: 28, fontWeight: "800" },
  subheading: { fontSize: 14, marginTop: 4 },

  segment: { flexDirection: "row", borderRadius: 16, padding: 4, marginBottom: 14 },
  segmentBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: "center" },
  segmentActive: {
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 2 },
    }),
  },
  segmentText: { fontSize: 14, fontWeight: "700" },

  listContent: { paddingBottom: 24 },

  card: {
    borderRadius: 18,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: GREEN,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 6 } },
      android: { elevation: 3 },
    }),
  },
  cardInner: { flexDirection: "row", alignItems: "center" },

  imageWrap: {
    width: 56, height: 56, borderRadius: 5,
    backgroundColor: "#D1FAE5",
    alignItems: "center", justifyContent: "center",
    marginRight: 12, overflow: "hidden",
  },
  cardImage: { width: "100%", height: "100%" },
  imageFallback: { width: 26, height: 26, borderRadius: 13, backgroundColor: "#f3eda7ff" },

  cardTextWrapper: { flex: 1, minWidth: 0 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 10 },

  nameEn: { flex: 1, minWidth: 0, fontSize: 17, fontWeight: "800" },

  urduPill: { maxWidth: 120, paddingLeft: 4, paddingRight: 10, paddingVertical: 2 },
  nameUr: { fontSize: 18, fontWeight: "700", textAlign: "right", includeFontPadding: false },

  cardHint: { marginTop: 6, fontSize: 12 },

  loaderWrap: { flex: 1, alignItems: "center", justifyContent: "center" },

  emptyWrap: { paddingTop: 60, alignItems: "center" },
  emptyTitle: { fontSize: 16, fontWeight: "800", marginBottom: 6 },
  emptyText: { fontSize: 13 },
});
