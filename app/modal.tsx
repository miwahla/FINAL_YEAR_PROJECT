import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../contexts/theme";

export default function ModalScreen() {
  const { colors } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Text style={[styles.text, { color: colors.textSub }]}>Modal</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  text: { fontSize: 16 },
});
