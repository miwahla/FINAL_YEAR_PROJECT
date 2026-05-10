import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type CropKey = "Cotton" | "Wheat" | "Maize" | "Chilli" | "Coriander" | "Lemon";

type DetectionOutcome = {
  status: "healthy" | "diseased";
  diseaseName?: string;
  confidence: number; // fake confidence
  remedy: string;
  medicineName?: string;
  buyLink?: string;
};

const CROPS: CropKey[] = ["Cotton", "Wheat", "Maize", "Chilli", "Coriander", "Lemon"];

// Hardcoded “knowledge base”
const DISEASE_LIBRARY: Record<CropKey, DetectionOutcome[]> = {
  Cotton: [
    {
      status: "diseased",
      diseaseName: "Cotton Leaf Curl Virus (CLCuV)",
      confidence: 0.87,
      remedy:
        "Remove severely affected plants, control whitefly early, keep field weed-free, and prefer tolerant varieties. Avoid excessive nitrogen.",
      medicineName: "Imidacloprid (for whitefly control)",
      buyLink: "https://www.daraz.pk/catalog/?q=imidacloprid",
    },
    {
      status: "diseased",
      diseaseName: "Bollworm Damage",
      confidence: 0.82,
      remedy:
        "Use pheromone traps, remove infected bolls, and spray only when threshold is crossed. Rotate modes of action to avoid resistance.",
      medicineName: "Emamectin benzoate",
      buyLink: "https://www.daraz.pk/catalog/?q=emamectin%20benzoate",
    },
  ],
  Wheat: [
    {
      status: "diseased",
      diseaseName: "Rust (Leaf/Stripe Rust)",
      confidence: 0.84,
      remedy:
        "Use resistant varieties, avoid late sowing, and apply fungicide when rust appears and spreads rapidly.",
      medicineName: "Propiconazole",
      buyLink: "https://www.daraz.pk/catalog/?q=propiconazole",
    },
  ],
  Maize: [
    {
      status: "diseased",
      diseaseName: "Leaf Blight",
      confidence: 0.81,
      remedy:
        "Remove crop residue, ensure balanced nutrition, and spray fungicide if disease is spreading in humid conditions.",
      medicineName: "Mancozeb",
      buyLink: "https://www.daraz.pk/catalog/?q=mancozeb",
    },
  ],
  Chilli: [
    {
      status: "diseased",
      diseaseName: "Chilli Leaf Curl",
      confidence: 0.86,
      remedy:
        "Rogue infected plants early, control whitefly, and maintain field hygiene. Use reflective mulch if possible.",
      medicineName: "Thiamethoxam",
      buyLink: "https://www.daraz.pk/catalog/?q=thiamethoxam",
    },
  ],
  Coriander: [
    {
      status: "diseased",
      diseaseName: "Powdery Mildew",
      confidence: 0.80,
      remedy:
        "Avoid overcrowding, irrigate in the morning, and spray fungicide when white powdery patches appear.",
      medicineName: "Wettable Sulfur",
      buyLink: "https://www.daraz.pk/catalog/?q=wettable%20sulfur",
    },
  ],
  Lemon: [
    {
      status: "diseased",
      diseaseName: "Citrus Canker (Suspected)",
      confidence: 0.78,
      remedy:
        "Prune infected twigs, disinfect tools, avoid overhead irrigation, and spray copper-based fungicide/bactericide as recommended.",
      medicineName: "Copper Oxychloride",
      buyLink: "https://www.daraz.pk/catalog/?q=copper%20oxychloride",
    },
  ],
};

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

export default function DetectScreen() {
  const router = useRouter();

  const [selectedCrop, setSelectedCrop] = useState<CropKey>("Cotton");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [result, setResult] = useState<DetectionOutcome | null>(null);

  // Hardcoded “healthy chance” — tweak as you like
  const HEALTHY_PROB = 0.45;

  const cropOptions = useMemo(() => CROPS, []);

  const pickImage = async () => {
    setResult(null);

    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission required", "Please allow photo access to upload an image.");
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsEditing: true,
    });

    if (res.canceled) return;

    const uri = res.assets?.[0]?.uri;
    if (uri) setImageUri(uri);
  };

  const runFakeDetection = async () => {
    if (!imageUri) {
      Alert.alert("Upload required", "Please upload a plant photo first.");
      return;
    }

    setDetecting(true);
    setResult(null);

    // 0.25 second loader
    await new Promise((r) => setTimeout(r, 250));

    // Fake logic: healthy vs diseased
    const roll = Math.random();
    if (roll < HEALTHY_PROB) {
      const conf = clamp01(0.82 + Math.random() * 0.14);
      setResult({
        status: "healthy",
        confidence: conf,
        remedy:
          "Plant looks healthy. Keep balanced irrigation, avoid waterlogging, and monitor leaves weekly for early signs of pests.",
      });
    } else {
      const options = DISEASE_LIBRARY[selectedCrop];
      const chosen = options[Math.floor(Math.random() * options.length)];
      // Add tiny randomness to confidence (keep realistic)
      const conf = clamp01(chosen.confidence - 0.05 + Math.random() * 0.08);
      setResult({ ...chosen, confidence: conf });
    }

    setDetecting(false);
  };

  const openBuyLink = async () => {
    if (!result?.buyLink) return;
    const ok = await Linking.canOpenURL(result.buyLink);
    if (!ok) {
      Alert.alert("Link error", "Cannot open this link on your device.");
      return;
    }
    Linking.openURL(result.buyLink);
  };

  // IMPORTANT: set this to your actual AI chat route
  // Common possibilities in expo-router:
  // router.push("/ai-chat") or router.push("/(tabs)/ai-chat")
  const goToChatbot = () => {
    router.push("/(tabs)/chatbot");

  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Detect Disease</Text>
        <Text style={styles.subheading}>
          Choose a crop and upload a photo
        </Text>

        {/* Crop selector */}
        <Text style={styles.label}>Select Crop</Text>
        <View style={styles.pillsRow}>
          {cropOptions.map((c) => {
            const active = c === selectedCrop;
            return (
              <TouchableOpacity
                key={c}
                onPress={() => {
                  setSelectedCrop(c);
                  setResult(null);
                }}
                style={[styles.pill, active && styles.pillActive]}
                activeOpacity={0.9}
              >
                <Text style={[styles.pillText, active && styles.pillTextActive]}>{c}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Upload */}
        <View style={styles.block}>
          <Text style={styles.label}>Upload Photo</Text>

          <TouchableOpacity onPress={pickImage} style={styles.primaryBtn} activeOpacity={0.9}>
            <Text style={styles.primaryBtnText}>{imageUri ? "Change Photo" : "Upload Photo"}</Text>
          </TouchableOpacity>

          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.preview} />
          ) : (
            <View style={styles.previewPlaceholder}>
              <Text style={styles.previewHint}>No image selected</Text>
            </View>
          )}

          <TouchableOpacity
            onPress={runFakeDetection}
            style={[styles.detectBtn, !imageUri && styles.detectBtnDisabled]}
            activeOpacity={0.9}
            disabled={!imageUri || detecting}
          >
            <Text style={styles.detectBtnText}>{detecting ? "Detecting..." : "Run Detection"}</Text>
          </TouchableOpacity>

          {detecting && (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" />
              <Text style={styles.loadingText}>Analyzing image...</Text>
            </View>
          )}
        </View>

        {/* Result */}
        {result && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>
              {result.status === "healthy" ? "Result: Healthy ✅" : "Result: Disease Detected ⚠️"}
            </Text>

            <Text style={styles.resultMeta}>
              Confidence: {(result.confidence * 100).toFixed(0)}%
            </Text>

            {result.status === "diseased" && (
              <>
                <Text style={styles.resultLabel}>Disease</Text>
                <Text style={styles.resultText}>{result.diseaseName}</Text>
              </>
            )}

            <Text style={styles.resultLabel}>Suggested Remedy</Text>
            <Text style={styles.resultText}>{result.remedy}</Text>

            {result.status === "diseased" && result.medicineName && (
              <>
                <Text style={styles.resultLabel}>Suggested Medicine</Text>
                <Text style={styles.resultText}>{result.medicineName}</Text>

                {!!result.buyLink && (
                  <TouchableOpacity onPress={openBuyLink} style={styles.buyBtn} activeOpacity={0.9}>
                    <Text style={styles.buyBtnText}>Buy / View Online</Text>
                  </TouchableOpacity>
                )}
              </>
            )}

            <TouchableOpacity onPress={goToChatbot} style={styles.chatBtn} activeOpacity={0.9}>
              <Text style={styles.chatBtnText}>Discuss / gain more info from chatbot</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f9fafb" },
  container: { padding: 16, paddingBottom: 28 },

  heading: { fontSize: 22, fontWeight: "800", marginBottom: 4 },
  subheading: { fontSize: 14, color: "#4b5563", marginBottom: 14, lineHeight: 20 },

  block: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    marginTop: 10,
  },

  label: { fontSize: 13, fontWeight: "700", color: "#111827", marginBottom: 8 },

  pillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#e5e7eb",
  },
  pillActive: { backgroundColor: "#22C55E" },
  pillText: { fontSize: 12, fontWeight: "700", color: "#111827" },
  pillTextActive: { color: "#ffffff" },

  primaryBtn: {
    backgroundColor: "#111827",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "800", fontSize: 13 },

  preview: {
    width: "100%",
    height: 220,
    borderRadius: 14,
    marginTop: 10,
    backgroundColor: "#e5e7eb",
  },
  previewPlaceholder: {
    width: "100%",
    height: 220,
    borderRadius: 14,
    marginTop: 10,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  previewHint: { color: "#6b7280", fontWeight: "700" },

  detectBtn: {
    backgroundColor: "#22C55E",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  detectBtnDisabled: { opacity: 0.45 },
  detectBtnText: { color: "#fff", fontWeight: "900", fontSize: 13 },

  loadingRow: { flexDirection: "row", alignItems: "center", marginTop: 10, gap: 10 },
  loadingText: { color: "#4b5563", fontWeight: "700" },

  resultCard: {
    backgroundColor: "#F0FDF4",
    borderRadius: 18,
    padding: 14,
    marginTop: 14,
    borderLeftWidth: 4,
    borderLeftColor: "#22C55E",
  },
  resultTitle: { fontSize: 16, fontWeight: "900", color: "#111827" },
  resultMeta: { marginTop: 4, fontSize: 12, color: "#6b7280", fontWeight: "700" },

  resultLabel: { marginTop: 12, fontSize: 12, fontWeight: "900", color: "#111827" },
  resultText: { marginTop: 4, fontSize: 13, color: "#111827", lineHeight: 19 },

  buyBtn: {
    marginTop: 12,
    backgroundColor: "#111827",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  buyBtnText: { color: "#fff", fontWeight: "900", fontSize: 13 },

  chatBtn: {
    marginTop: 10,
    backgroundColor: "#ffffff",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#22C55E",
  },
  chatBtnText: { color: "#15803D", fontWeight: "900", fontSize: 13 },
});
