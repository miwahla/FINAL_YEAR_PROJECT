import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChatbotScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.heading}>AI Chatbot</Text>
        <Text style={styles.subheading}>
          This will be your assistant to answer crop and plant questions.
        </Text>

        <View style={styles.chatPlaceholder}>
          <Text style={styles.placeholderText}>
            Chat UI will go here (message list + input box).
          </Text>
        </View>
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
    padding: 16,
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  subheading: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 16,
  },
  chatPlaceholder: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: "#6b7280",
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 16,
  },
});
