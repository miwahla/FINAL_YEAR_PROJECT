import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "../../lib/supabase";

const API_BASE = process.env.EXPO_PUBLIC_ML_BACKEND_URL ?? "http://localhost:8000";

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return {};
  return { Authorization: `Bearer ${session.access_token}` };
}

type CropKey =
  | "Cotton"
  | "Wheat"
  | "Maize"
  | "Potato"
  | "Tomato"
  | "Sugarcane"
  | "Onion"
  | "Sunflower"
  | "Rice";

const CROPS: CropKey[] = [
  "Cotton",
  "Wheat",
  "Maize",
  "Potato",
  "Tomato",
  "Sugarcane",
  "Onion",
  "Sunflower",
  "Rice",
];

type DetectionResult = {
  crop: string;
  disease: string;
  display_disease: string;
  confidence: number;
  is_healthy: boolean;
};

export default function DetectScreen() {
  const router = useRouter();

  const [selectedCrop, setSelectedCrop] = useState<CropKey>("Cotton");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);

  const pickImage = async (fromCamera: boolean) => {
    setResult(null);

    if (fromCamera) {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Permission required", "Please allow camera access.");
        return;
      }
      const res = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.85,
        allowsEditing: true,
        aspect: [1, 1],
      });
      if (!res.canceled) setImageUri(res.assets?.[0]?.uri ?? null);
    } else {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Permission required", "Please allow photo access.");
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.85,
        allowsEditing: true,
        aspect: [1, 1],
      });
      if (!res.canceled) setImageUri(res.assets?.[0]?.uri ?? null);
    }
  };

  const runDetection = async () => {
    if (!imageUri) {
      Alert.alert("Photo required", "Please take or upload a leaf photo first.");
      return;
    }

    setDetecting(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("crop", selectedCrop.toLowerCase());
      formData.append("image", {
        uri: imageUri,
        type: "image/jpeg",
        name: "leaf.jpg",
      } as any);

      const authHeader = await getAuthHeader();
      const res = await fetch(`${API_BASE}/detect`, {
        method: "POST",
        headers: authHeader,
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: `Server error ${res.status}` }));
        throw new Error(err.detail ?? `Server error ${res.status}`);
      }

      const data: DetectionResult = await res.json();
      setResult(data);
    } catch (e: any) {
      Alert.alert("Detection failed", e.message ?? "Could not reach the server.");
    } finally {
      setDetecting(false);
    }
  };

  const askChatbot = () => {
    if (!result) return;
    const msg = result.is_healthy
      ? `My ${result.crop} plant looks healthy. Any tips to keep it that way?`
      : `I detected ${result.display_disease} in my ${result.crop} plant (${(result.confidence * 100).toFixed(0)}% confidence). What is the treatment or remedy?`;
    router.push({
      pathname: "/(tabs)/chatbot",
      params: { initialMessage: msg },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Detect Disease</Text>
        <Text style={styles.subheading}>Select your crop, then take or upload a leaf photo.</Text>

        {/* Crop selector */}
        <Text style={styles.label}>Select Crop</Text>
        <View style={styles.pillsRow}>
          {CROPS.map((c) => {
            const active = c === selectedCrop;
            return (
              <TouchableOpacity
                key={c}
                onPress={() => { setSelectedCrop(c); setResult(null); }}
                style={[styles.pill, active && styles.pillActive]}
                activeOpacity={0.9}
              >
                <Text style={[styles.pillText, active && styles.pillTextActive]}>{c}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Photo buttons */}
        <View style={styles.block}>
          <Text style={styles.label}>Leaf Photo</Text>
          <View style={styles.photoRow}>
            <TouchableOpacity
              style={[styles.photoBtn, styles.photoBtnDark]}
              onPress={() => pickImage(true)}
              activeOpacity={0.9}
            >
              <Text style={styles.photoBtnText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.photoBtn, styles.photoBtnGrey]}
              onPress={() => pickImage(false)}
              activeOpacity={0.9}
            >
              <Text style={[styles.photoBtnText, { color: "#111827" }]}>
                {imageUri ? "Change Photo" : "Upload Photo"}
              </Text>
            </TouchableOpacity>
          </View>

          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.preview} />
          ) : (
            <View style={styles.previewPlaceholder}>
              <Text style={styles.previewHint}>No image selected</Text>
            </View>
          )}

          <TouchableOpacity
            onPress={runDetection}
            style={[styles.detectBtn, (!imageUri || detecting) && styles.detectBtnDisabled]}
            activeOpacity={0.9}
            disabled={!imageUri || detecting}
          >
            {detecting ? (
              <View style={styles.detectingRow}>
                <ActivityIndicator size="small" color="#fff" />
                <Text style={[styles.detectBtnText, { marginLeft: 8 }]}>Analyzing...</Text>
              </View>
            ) : (
              <Text style={styles.detectBtnText}>Run Detection</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Result */}
        {result && (
          <View style={[styles.resultCard, result.is_healthy ? styles.resultCardHealthy : styles.resultCardDisease]}>
            <Text style={styles.resultTitle}>
              {result.is_healthy ? "Result: Healthy" : "Disease Detected"}
            </Text>

            {!result.is_healthy && (
              <>
                <Text style={styles.resultLabel}>Disease</Text>
                <Text style={styles.resultValue}>{result.display_disease}</Text>
              </>
            )}

            <Text style={styles.resultLabel}>Confidence</Text>
            <Text style={styles.resultValue}>{(result.confidence * 100).toFixed(1)}%</Text>

            <Text style={styles.resultLabel}>Crop</Text>
            <Text style={styles.resultValue}>{result.crop}</Text>

            <TouchableOpacity onPress={askChatbot} style={styles.chatBtn} activeOpacity={0.9}>
              <Text style={styles.chatBtnText}>
                {result.is_healthy
                  ? "Get Care Tips from AI Assistant"
                  : "Get Treatment Advice from AI Assistant"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f9fafb" },
  container: { padding: 16, paddingBottom: 32 },

  heading: { fontSize: 22, fontWeight: "800", color: "#111827", marginBottom: 4 },
  subheading: { fontSize: 13, color: "#4b5563", lineHeight: 19, marginBottom: 14 },

  label: { fontSize: 13, fontWeight: "700", color: "#111827", marginBottom: 8 },

  pillsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 4 },
  pill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: "#e5e7eb" },
  pillActive: { backgroundColor: "#16a34a" },
  pillText: { fontSize: 12, fontWeight: "700", color: "#111827" },
  pillTextActive: { color: "#fff" },

  block: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginTop: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },

  photoRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  photoBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: "center" },
  photoBtnDark: { backgroundColor: "#111827" },
  photoBtnGrey: { backgroundColor: "#e5e7eb" },
  photoBtnText: { color: "#fff", fontWeight: "800", fontSize: 13 },

  preview: {
    width: "100%",
    height: 220,
    borderRadius: 14,
    backgroundColor: "#e5e7eb",
  },
  previewPlaceholder: {
    width: "100%",
    height: 220,
    borderRadius: 14,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  previewHint: { color: "#6b7280", fontWeight: "700" },

  detectBtn: {
    backgroundColor: "#16a34a",
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  detectBtnDisabled: { opacity: 0.45 },
  detectBtnText: { color: "#fff", fontWeight: "900", fontSize: 14 },
  detectingRow: { flexDirection: "row", alignItems: "center" },

  resultCard: {
    borderRadius: 18,
    padding: 16,
    marginTop: 16,
    borderLeftWidth: 4,
  },
  resultCardHealthy: {
    backgroundColor: "#f0fdf4",
    borderLeftColor: "#16a34a",
  },
  resultCardDisease: {
    backgroundColor: "#fff7ed",
    borderLeftColor: "#f97316",
  },

  resultTitle: { fontSize: 17, fontWeight: "900", color: "#111827", marginBottom: 8 },
  resultLabel: { fontSize: 11, fontWeight: "800", color: "#6b7280", marginTop: 10, textTransform: "uppercase", letterSpacing: 0.5 },
  resultValue: { fontSize: 15, fontWeight: "700", color: "#111827", marginTop: 2 },

  chatBtn: {
    marginTop: 16,
    backgroundColor: "#16a34a",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  chatBtnText: { color: "#fff", fontWeight: "900", fontSize: 13 },
});
