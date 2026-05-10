// app/(tabs)/index.tsx
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";

type FeatureCardProps = {
  title: string;
  subtitle: string;
  cta: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone: "green" | "blue" | "amber";
  onPress: () => void;
};

function FeatureCard({
  title,
  subtitle,
  cta,
  icon,
  tone,
  onPress,
}: FeatureCardProps) {
  const toneStyles = {
    green: {
      bg: "#E9F9EF",
      stripe: "#1E6B2D", // slightly stronger
      iconBg: "#E3F4E8",
      iconColor: "#1E6B2D",
      cta: "#1E6B2D",
    },
    blue: {
      bg: "#EAF3FF",
      stripe: "#1D4ED8",
      iconBg: "#E6F0FF",
      iconColor: "#1D4ED8",
      cta: "#1D4ED8",
    },
    amber: {
      bg: "#FFF4D6",
      stripe: "#D97706", // richer amber
      iconBg: "#FFEFCC",
      iconColor: "#B45309",
      cta: "#B45309",
    },
  }[tone];

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.cardWrap}>
      <View style={[styles.card, { backgroundColor: toneStyles.bg }]}>
        <View style={[styles.cardStripe, { backgroundColor: toneStyles.stripe }]} />

        <View style={styles.cardContent}>
          <View style={[styles.iconBubble, { backgroundColor: toneStyles.iconBg }]}>
            <Ionicons name={icon} size={20} color={toneStyles.iconColor} />
          </View>

          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardSubtitle}>{subtitle}</Text>

            <View style={styles.ctaRow}>
              <Text style={[styles.cardCta, { color: toneStyles.cta }]}>{cta}</Text>
              <Ionicons name="arrow-forward" size={16} color={toneStyles.cta} />
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.h1}>
                Welcome to <Text style={styles.brand}>LeafEye</Text>
              </Text>
              <Text style={styles.h2}>Your smart assistant for crops and plant health</Text>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn} activeOpacity={0.8}>
              <Ionicons name="log-out-outline" size={20} color="#dc2626" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Feature cards */}
        <View style={styles.section}>
          <FeatureCard
            tone="green"
            icon="leaf-outline"
            title="Plants catalog"
            subtitle="Browse crops & homegrown plants in Urdu/English with care sections from your database."
            cta="Open plants"
            onPress={() => router.push("/plants")}
          />

          <FeatureCard
            tone="blue"
            icon="chatbubble-ellipses-outline"
            title="AI chat assistant"
            subtitle="Ask about plant care, common diseases, and farming tips in simple language."
            cta="Start a chat"
            onPress={() => router.push("/chatbot")}
          />

          <FeatureCard
            tone="amber"
            icon="scan-outline"
            title="Image detection"
            subtitle="Scan a leaf photo to identify issues and get instant guidance."
            cta="Scan a leaf"
            onPress={() => router.push("/detect")}
          />
        </View>

        {/* Bottom note card (lighter) */}
        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>Coming next</Text>
          <Text style={styles.noteBody}>
            More crops, localized remedies for Pakistan, and smarter detection to support farmers and home gardeners.
          </Text>
        </View>

        <View style={{ height: 22 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F7F9F7" },
  container: { paddingHorizontal: 18, paddingTop: 8 },

  header: { paddingTop: 6, paddingBottom: 14 },
  headerRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  logoutBtn: { padding: 8, marginTop: 2 },
  h1: { fontSize: 28, fontWeight: "800", color: "#0F172A", letterSpacing: 0.2 },
  brand: { color: "#16a34a" },
  h2: { marginTop: 6, fontSize: 14.5, color: "#475569", lineHeight: 20 },

  section: { gap: 16 },

  cardWrap: { borderRadius: 18 },
  card: {
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  cardStripe: { width: 5, position: "absolute", left: 0, top: 0, bottom: 0 },

  cardContent: { padding: 16, paddingLeft: 18, flexDirection: "row", gap: 12 },

  iconBubble: {
    width: 42,
    height: 42,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },

  cardText: { flex: 1 },
  cardTitle: { fontSize: 16.5, fontWeight: "800", color: "#0F172A" },
  cardSubtitle: { marginTop: 5, fontSize: 13.8, color: "#334155", lineHeight: 19 },

  ctaRow: { marginTop: 10, flexDirection: "row", alignItems: "center", gap: 6 },
  cardCta: { fontSize: 14, fontWeight: "700", marginRight: 2 },

  noteCard: {
    marginTop: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#EEF2F7",
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 1,
  },
  noteTitle: { fontSize: 14, fontWeight: "700", color: "#0F172A" },
  noteBody: { marginTop: 6, fontSize: 13.5, color: "#475569", lineHeight: 19 },
});
