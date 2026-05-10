import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PlantRow } from "../../lib/db";
import { getMyPlants, removeFromMyPlants } from "../../lib/my-plants";

// Same images mapping as plants.tsx
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

export default function MyPlantsScreen() {
  const router = useRouter();

  const [plants, setPlants] = useState<PlantRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const rows = await getMyPlants();
      setPlants(rows);
    } catch (e) {
      console.log("❌ Error loading my plants:", e);
    } finally {
      setLoading(false);
    }
  };

  // Reload whenever this tab is focused
  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const handlePressPlant = (plant: PlantRow) => {
    router.push({
      pathname: "/plant-detail",
      params: { plantId: plant.id },
    });
  };

  const handleRemove = async (plant: PlantRow) => {
    Alert.alert(
      "Remove plant?",
      `Remove ${plant.name_en} from My Plants?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              // Optimistic UI (instant remove)
              setPlants((prev) => prev.filter((p) => p.id !== plant.id));

              await removeFromMyPlants(plant.id);

              // Optional: re-load to be 100% synced
              // await load();
            } catch (e) {
              console.log("❌ Error removing plant:", e);
              // fallback: reload to recover
              await load();
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: PlantRow }) => {
    const imgSource = getPlantImage(item.name_en);

    return (
      <TouchableOpacity
        onPress={() => handlePressPlant(item)}
        style={styles.card}
        activeOpacity={0.9}
      >
        <View style={styles.cardInner}>
          {imgSource && <Image source={imgSource} style={styles.cardImage} />}

          <View style={styles.cardTextWrapper}>
            <View style={styles.nameRow}>
              <Text style={styles.nameEn}>{item.name_en}</Text>
              <Text style={styles.nameUr}>{item.name_ur}</Text>
            </View>
            <Text style={styles.cardHint}>Tap to view details</Text>
          </View>

          {/* REMOVE BUTTON */}
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              handleRemove(item);
            }}
            style={styles.removeBtn}
            activeOpacity={0.85}
          >
            <Text style={styles.removeBtnText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.heading}>My Plants</Text>
        <Text style={styles.subheading}>
          Plants you’ve added will appear here for quick access.
        </Text>

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
            ListEmptyComponent={
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyTitle}>No saved plants yet</Text>
                <Text style={styles.emptyText}>
                  Go to Plants and tap “Add” on any plant to save it here.
                </Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  subheading: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 14,
  },

  listContent: {
    paddingBottom: 20,
  },

  card: {
    backgroundColor: "#F0FDF4",
    borderRadius: 18,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: "#22C55E",
  },
  cardInner: {
    flexDirection: "row",
    alignItems: "center",
  },
  cardImage: {
    width: 52,
    height: 52,
    borderRadius: 16,
    marginRight: 12,
  },
  cardTextWrapper: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  nameEn: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  nameUr: {
    fontSize: 18,
    color: "#15803D",
    marginLeft: 8,
    textAlign: "right",
  },
  cardHint: {
    marginTop: 4,
    fontSize: 12,
    color: "#6b7280",
  },

  // Remove button styles
  removeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: "#EF4444",
    marginLeft: 10,
  },
  removeBtnText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 12,
  },

  loaderWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyWrap: {
    paddingTop: 40,
    alignItems: "center",
    paddingHorizontal: 18,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
    color: "#111827",
  },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
  },
});
