import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../contexts/theme";
import { supabase } from "../../lib/supabase";

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, isDark, toggle } = useTheme();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This will permanently delete your account and all your data. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const { data: { session } } = await supabase.auth.getSession();
              if (!session) return;

              const res = await fetch(
                "https://uimcuhojeuscsubozsxf.supabase.co/functions/v1/delete-account",
                {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${session.access_token}`,
                    "Content-Type": "application/json",
                  },
                }
              );

              const body = await res.json();
              if (!res.ok) throw new Error(body.error ?? "Delete failed");

              await supabase.auth.signOut();
              router.replace("/login");
            } catch (e: any) {
              Alert.alert("Error", e.message ?? "Could not delete account. Please try again.");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        </View>

        {/* My Account */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.sectionLabel }]}>MY ACCOUNT</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.row}>
              <View style={styles.iconWrap}>
                <Ionicons name="person-circle-outline" size={22} color={colors.textSub} />
              </View>
              <View style={styles.rowContent}>
                <Text style={[styles.rowLabel, { color: colors.text }]}>Email</Text>
                <Text style={[styles.rowValue, { color: colors.textSub }]} numberOfLines={1}>{email ?? "—"}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Appearance */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.sectionLabel }]}>APPEARANCE</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.row}>
              <View style={styles.iconWrap}>
                <Ionicons name={isDark ? "moon" : "sunny-outline"} size={22} color={colors.textSub} />
              </View>
              <Text style={[styles.rowLabel, { color: colors.text, flex: 1 }]}>Dark Mode</Text>
              <Switch
                value={isDark}
                onValueChange={toggle}
                trackColor={{ false: "#e5e7eb", true: "#16a34a" }}
                thumbColor="#ffffff"
              />
            </View>
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.sectionLabel }]}>ACCOUNT ACTIONS</Text>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TouchableOpacity style={styles.row} onPress={handleLogout} activeOpacity={0.7}>
              <View style={styles.iconWrap}>
                <Ionicons name="log-out-outline" size={22} color="#dc2626" />
              </View>
              <Text style={[styles.rowLabel, styles.danger]}>Log Out</Text>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: colors.border }]} />

            <TouchableOpacity style={styles.row} onPress={handleDeleteAccount} activeOpacity={0.7}>
              <View style={styles.iconWrap}>
                <Ionicons name="trash-outline" size={22} color="#dc2626" />
              </View>
              <Text style={[styles.rowLabel, styles.danger]}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={[styles.version, { color: colors.textMuted }]}>LeafEye v1.0.0</Text>
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { paddingHorizontal: 18, paddingTop: 8 },

  header: { paddingTop: 6, paddingBottom: 20 },
  title: { fontSize: 28, fontWeight: "800" },

  section: { marginBottom: 24 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },

  card: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  iconWrap: { width: 24, alignItems: "center" },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: 15, fontWeight: "500" },
  rowValue: { fontSize: 13, marginTop: 2 },
  danger: { color: "#dc2626" },

  divider: { height: 1, marginLeft: 52 },

  version: { textAlign: "center", fontSize: 12, marginTop: 8 },
});
