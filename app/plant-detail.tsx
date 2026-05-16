import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { useTheme } from "../contexts/theme";
import {
    Alert,
    ImageBackground,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTts } from "../hooks/use-tts";
import { getPlantWithSections, PlantSectionRow } from "../lib/db";
import { addToMyPlants, getMyPlants } from "../lib/my-plants";

type Lang = "en" | "ur";

/**
 * Background images live in: assets/images
 * Names you have:
 * cottonbg.png, maizebg.jpg, wheatbg.jpg, chillibg.png, lemonbg.jpeg
 * (You can add corianderbg.jpg later if you want)
 */
const plantBgById: Record<string, any> = {
  cotton: require("../assets/images/cottonbg.png"),
  maize: require("../assets/images/maizebg.jpg"),
  wheat: require("../assets/images/wheatbg.jpg"),
  chilli: require("../assets/images/chillibg.png"),
  lemon: require("../assets/images/lemonbg.jpeg"),
  coriander: require("../assets/images/corianderbg.jpg"),
  potato: require("../assets/images/potato.png"),
  rice: require("../assets/images/rice.png"),
  garlic: require("../assets/images/garlic.png"),
  onion: require("../assets/images/onion.png"),
  sugarcane: require("../assets/images/sugarcane.png"),
  sunflower: require("../assets/images/sunflower.png"),
  tomato: require("../assets/images/tomato.png"),
  aloevera: require("../assets/images/aloevera.png"),
  carrot: require("../assets/images/carrot.png"),
  ginger: require("../assets/images/ginger.png"),
  lettuce: require("../assets/images/lettuce.png"),
  mint: require("../assets/images/mint.png"),
};

// Fallback: use a nice existing image if a bg is missing
const DEFAULT_BG = require("../assets/images/login-bg.jpg");

function getPlantBg(plantId: string) {
  return plantBgById[plantId] ?? DEFAULT_BG;
}

export default function PlantDetailScreen() {
  const router = useRouter();
  const { plantId } = useLocalSearchParams<{ plantId?: string }>();
  const { isDark } = useTheme();

  const [loading, setLoading] = useState(true);
  const [plantNameEn, setPlantNameEn] = useState("");
  const [plantNameUr, setPlantNameUr] = useState("");
  const [sections, setSections] = useState<PlantSectionRow[]>([]);
  const [expandedIds, setExpandedIds] = useState<Record<number, boolean>>({});
  const [lang, setLang] = useState<Lang>("en");
  const [isAdded, setIsAdded] = useState(false);

  const { speak: ttsSpeak, stop: ttsStop, isLoading: ttsLoading, error: ttsError } = useTts();

  useEffect(() => {
    if (ttsError) Alert.alert("Narration error", ttsError);
  }, [ttsError]);

  const isUrdu = lang === "ur";

  // Fetch plant + sections from DB, check if already saved
  useEffect(() => {
    if (!plantId) return;

    setLoading(true);
    getPlantWithSections(String(plantId))
      .then((res) => {
        if (!res) return;
        setPlantNameEn(res.plant.name_en);
        setPlantNameUr(res.plant.name_ur);
        setSections(res.sections);
      })
      .finally(() => setLoading(false));

    getMyPlants().then((saved) => {
      setIsAdded(saved.some((p) => p.id === String(plantId)));
    }).catch(() => {});
  }, [plantId]);

  const handleAdd = async () => {
    if (isAdded || !plantId) return;
    try {
      await addToMyPlants(String(plantId));
      setIsAdded(true);
    } catch (e) {
      console.log("❌ Error adding to my plants:", e);
    }
  };

  const bgSource = useMemo(() => {
    if (!plantId) return DEFAULT_BG;
    return getPlantBg(String(plantId));
  }, [plantId]);

  const toggleSection = (id: number) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleBack = () => {
    if (router.canGoBack && router.canGoBack()) router.back();
    else router.replace("/");
  };

  const speak = (section: PlantSectionRow) => {
    const text = lang === "en" ? section.body_en : section.body_ur;
    if (!text || text.trim().length === 0) return;

    ttsSpeak(text, lang);
  };

  const stopSpeaking = () => {
    ttsStop();
  };

  const headerTitle = useMemo(() => {
    return { en: plantNameEn, ur: plantNameUr };
  }, [plantNameEn, plantNameUr]);

  if (!plantId) {
    return (
      <SafeAreaView style={styles.safeAreaPlain}>
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>No plant selected</Text>
          <TouchableOpacity onPress={handleBack} activeOpacity={0.85}>
            <Text style={styles.backText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safeAreaPlain}>
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Loading…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ImageBackground source={bgSource} style={styles.bg} resizeMode="cover" imageStyle={styles.bgImage}>
      <View style={[styles.bgOverlay, { backgroundColor: isDark ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.35)" }]} />

      <SafeAreaView style={styles.safeAreaTransparent}>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.headerWrap}>
            <View style={styles.headerTopRow}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBack}
                activeOpacity={0.8}
              >
                <Ionicons name="chevron-back" size={22} color={BLUE} />
                <Text style={styles.backLabel}>Back</Text>
              </TouchableOpacity>

              {/* Language toggle */}
              <View style={styles.langToggle}>
                <TouchableOpacity
                  style={[styles.langBtn, lang === "en" && styles.langBtnActive]}
                  onPress={() => setLang("en")}
                  activeOpacity={0.9}
                >
                  <Text
                    style={[
                      styles.langText,
                      lang === "en" && styles.langTextActive,
                    ]}
                  >
                    EN
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.langBtn, lang === "ur" && styles.langBtnActive]}
                  onPress={() => setLang("ur")}
                  activeOpacity={0.9}
                >
                  <Text
                    style={[
                      styles.langText,
                      lang === "ur" && styles.langTextActive,
                    ]}
                  >
                    اردو
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.headerTitles}>
              <View style={styles.headerNameRow}>
                <Text style={styles.plantName} numberOfLines={1}>
                  {headerTitle.en}
                </Text>
                <TouchableOpacity
                  style={[styles.addBtn, isAdded && styles.addBtnAdded]}
                  onPress={handleAdd}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name={isAdded ? "checkmark" : "add"}
                    size={16}
                    color={isAdded ? "#16a34a" : "#fff"}
                  />
                  <Text style={[styles.addBtnText, isAdded && styles.addBtnTextAdded]}>
                    {isAdded ? "Added" : "Add"}
                  </Text>
                </TouchableOpacity>
              </View>
              {!!headerTitle.ur && (
                <View style={styles.urduPill}>
                  <Text
                    style={[
                      styles.plantNameUr,
                      isUrdu && { textAlign: "right", writingDirection: "rtl" },
                    ]}
                    numberOfLines={1}
                  >
                    {headerTitle.ur}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Sections */}
          {sections.map((section) => {
            const isOpen = !!expandedIds[section.id];
            const title = isUrdu ? section.title_ur : section.title_en;
            const body = isUrdu ? section.body_ur : section.body_en;

            return (
              <View key={section.id} style={styles.card}>
                {/* Card header */}
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderLeft}>
                    <View style={styles.accentDot} />
                    <Text
                      style={[
                        styles.cardTitle,
                        isUrdu && {
                          textAlign: "right",
                          writingDirection: "rtl",
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {title}
                    </Text>
                  </View>

                  {/* Narration */}
                  <View style={styles.cardHeaderActions}>
                    <TouchableOpacity
                      style={[styles.iconBtn, ttsLoading && styles.iconBtnLoading]}
                      onPress={() => speak(section)}
                      activeOpacity={0.85}
                      disabled={ttsLoading}
                    >
                      <Ionicons
                        name={ttsLoading ? "hourglass" : "volume-high"}
                        size={18}
                        color={WHITE}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.iconBtn}
                      onPress={stopSpeaking}
                      activeOpacity={0.85}
                    >
                      <Ionicons name="stop" size={18} color={WHITE} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Card body */}
                <View style={styles.cardBody}>
                  <Text
                    style={[
                      styles.cardBodyText,
                      isUrdu && {
                        textAlign: "right",
                        writingDirection: "rtl",
                      },
                    ]}
                    numberOfLines={isOpen ? undefined : 4}
                  >
                    {body}
                  </Text>

                  <View style={styles.cardFooter}>
                    <TouchableOpacity
                      style={styles.readMoreBtn}
                      onPress={() => toggleSection(section.id)}
                      activeOpacity={0.9}
                    >
                      <Text style={styles.readMoreText}>
                        {isOpen ? "Show less" : "Read more"}
                      </Text>
                      <Ionicons
                        name={isOpen ? "chevron-up" : "chevron-down"}
                        size={16}
                        color={GREEN_DARK}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const BLUE = "#2563EB";
const WHITE = "#FFFFFF";

const GREEN_DARK = "#14532d";
const GREEN_DARKER = "#0f3d21";
const GREEN_LIGHT = "#EAF7EE";

const styles = StyleSheet.create({
  /* Background */
  bg: { flex: 1 },
  bgImage: { transform: [{ scale: 1.15 }] },

  // overlay makes text readable while still showing image
  bgOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.35)",
    
  },

  safeAreaTransparent: { flex: 1, backgroundColor: "transparent" },
  safeAreaPlain: { flex: 1, backgroundColor: "#F7F9F7" },

  container: {
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 28,
  },

  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },

  loadingText: {
    fontSize: 14,
    color: "#6B7280",
  },

  backText: { color: BLUE, marginTop: 10, fontWeight: "700" },

  /* Header */
  headerWrap: {
    marginBottom: 16,
  },

  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingRight: 10,
  },

  backLabel: {
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "700",
    marginLeft: 2,
  },

  headerTitles: {
    paddingHorizontal: 2,
    gap: 8,
  },

  headerNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  plantName: {
    flex: 1,
    fontSize: 28,
    fontWeight: "900",
    color: "#111827",
    letterSpacing: -0.3,
  },

  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#16a34a",
    ...Platform.select({
      ios: {
        shadowColor: "#16a34a",
        shadowOpacity: 0.35,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 2 },
    }),
  },
  addBtnAdded: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 1,
    borderColor: "#16a34a",
  },
  addBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 13,
  },
  addBtnTextAdded: {
    color: "#16a34a",
  },

  urduPill: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.82)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(17,24,39,0.08)",
  },

  plantNameUr: {
    fontSize: 18,
    color: "#374151",
    fontWeight: "700",
    includeFontPadding: false,
  },

  /* Lang toggle */
  langToggle: {
    flexDirection: "row",
    backgroundColor: "rgba(35, 212, 100, 0.25)",
    borderRadius: 999,
    padding: 3,
  },
  langBtn: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  langBtnActive: {
    backgroundColor: "#2ad01bff",
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
  langText: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "800",
  },
  langTextActive: {
    color: "#111827",
  },

  /* Card */
  card: {
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 14,
    backgroundColor: "rgba(255,255,255,0.92)",
    borderWidth: 1,
    borderColor: "rgba(209,231,214,0.95)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 10 },
      },
      android: { elevation: 3 },
    }),
  },

  cardHeader: {
    backgroundColor: GREEN_DARK,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    minWidth: 0,
  },

  accentDot: {
    width: 9,
    height: 9,
    borderRadius: 999,
    backgroundColor: "#34D399",
    marginRight: 10,
  },

  cardTitle: {
    flex: 1,
    minWidth: 0,
    fontSize: 15,
    fontWeight: "900",
    color: WHITE,
  },

  cardHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginLeft: 10,
  },

  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GREEN_DARKER,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },

  iconBtnLoading: {
    opacity: 0.6,
  },

  /* Body */
  cardBody: {
    backgroundColor: GREEN_LIGHT,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
  },

  cardBodyText: {
    fontSize: 14,
    color: "#111827",
    lineHeight: 21,
  },

  cardFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },

  readMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "rgba(20, 83, 45, 0.10)",
  },

  readMoreText: {
    fontSize: 12,
    fontWeight: "900",
    color: GREEN_DARK,
  },

});
