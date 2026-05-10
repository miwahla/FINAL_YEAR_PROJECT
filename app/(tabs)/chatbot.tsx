import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
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

const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 90 : 70;

type Role = "user" | "assistant";

interface Message {
  id: string;
  role: Role;
  content: string;
}

export default function ChatbotScreen() {
  const { initialMessage } = useLocalSearchParams<{ initialMessage?: string }>();

  useEffect(() => {
    if (initialMessage) setInput(initialMessage);
  }, [initialMessage]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      role: "assistant",
      content:
        "Hello! I'm LeafEye's farming assistant. Ask me anything about crops, diseases, fertilizers, or plant care.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList>(null);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };

    const history = messages.map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const authHeader = await getAuthHeader();
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ message: text, history }),
      });

      if (!res.ok) throw new Error(`Server error ${res.status}`);

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.reply,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, I couldn't reach the server. Make sure the backend is running.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  const renderItem = ({ item }: { item: Message }) => {
    const isUser = item.role === "user";
    return (
      <View style={[styles.bubbleRow, isUser ? styles.rowRight : styles.rowLeft]}>
        {!isUser && (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>🌿</Text>
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
          <Text style={isUser ? styles.userText : styles.botText}>{item.content}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>LeafEye Assistant</Text>
        <Text style={styles.headerSub}>Powered by RAG + Groq</Text>
      </View>

      {/* KAV sits above the tab bar spacer — keyboard pushes only this section up */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === "ios" ? 50 : 30}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          style={styles.flex}
          keyboardShouldPersistTaps="handled"
        />

        {loading && (
          <View style={styles.typingRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>🌿</Text>
            </View>
            <View style={styles.typingBubble}>
              <ActivityIndicator size="small" color="#16a34a" />
            </View>
          </View>
        )}

        <View style={styles.inputRow}>
          {/* Keyboard dismiss toggle */}
          <TouchableOpacity
            style={styles.keyboardBtn}
            onPress={() => Keyboard.dismiss()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-down" size={20} color="#6b7280" />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask about crops, diseases..."
            placeholderTextColor="#9ca3af"
            multiline
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            onPress={sendMessage}
            disabled={!input.trim() || loading}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Spacer outside KAV so keyboard doesn't push it up */}
      <View style={styles.tabBarSpacer} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f9fafb" },
  flex: { flex: 1 },

  header: {
    backgroundColor: "#16a34a",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  headerTitle: { color: "#fff", fontSize: 17, fontWeight: "700" },
  headerSub: { color: "#bbf7d0", fontSize: 11, marginTop: 2 },

  messageList: { padding: 12, paddingBottom: 8 },

  bubbleRow: { flexDirection: "row", marginVertical: 4, alignItems: "flex-end" },
  rowLeft: { justifyContent: "flex-start" },
  rowRight: { justifyContent: "flex-end" },

  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  avatarText: { fontSize: 14 },

  bubble: {
    maxWidth: "75%",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  userBubble: { backgroundColor: "#16a34a", borderBottomRightRadius: 4 },
  botBubble: { backgroundColor: "#fff", borderBottomLeftRadius: 4, elevation: 1 },

  userText: { color: "#fff", fontSize: 14, lineHeight: 20 },
  botText: { color: "#1f2937", fontSize: 14, lineHeight: 20 },

  typingRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, marginBottom: 4 },
  typingBubble: {
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
    elevation: 1,
  },

  inputRow: {
    flexDirection: "row",
    padding: 8,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    alignItems: "flex-end",
  },

  keyboardBtn: {
    width: 36,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 4,
  },

  input: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
    color: "#111827",
    maxHeight: 100,
  },
  sendBtn: {
    marginLeft: 8,
    backgroundColor: "#16a34a",
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: { backgroundColor: "#d1d5db" },
  sendIcon: { color: "#fff", fontSize: 16 },

  tabBarSpacer: {
    height: TAB_BAR_HEIGHT,
    backgroundColor: "#fff",
  },
});
