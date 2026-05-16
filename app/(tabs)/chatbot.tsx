import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../contexts/theme";
import { supabase } from "../../lib/supabase";

const API_BASE = process.env.EXPO_PUBLIC_ML_BACKEND_URL ?? "http://localhost:8000";
console.log("[Chatbot] API_BASE =", API_BASE);

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data: { session }, error } = await supabase.auth.getSession();
  console.log("[Chatbot] getSession →", session ? `user=${session.user.email}` : "no session", error ? `err=${error.message}` : "");
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
  const { colors, isDark } = useTheme();

  useEffect(() => {
    if (initialMessage) setInput(initialMessage);
  }, [initialMessage]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      role: "assistant",
      content: "Hello! I'm LeafEye's farming assistant. Ask me anything about crops, diseases, fertilizers, or plant care.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList>(null);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    const history = messages.map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const authHeader = await getAuthHeader();
      const url = `${API_BASE}/chat`;
      console.log("[Chatbot] POST", url, "hasAuth=", !!authHeader.Authorization);
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ message: text, history }),
      });

      console.log("[Chatbot] response status =", res.status);
      if (!res.ok) {
        const body = await res.text();
        console.log("[Chatbot] error body =", body);
        throw new Error(`Server error ${res.status}: ${body}`);
      }

      const data = await res.json();
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: data.reply }]);
    } catch (err) {
      console.log("[Chatbot] fetch error =", String(err));
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I couldn't reach the server. Make sure the backend is running.",
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  // Parse text into segments: plain | bold | url
  const parseSegments = (text: string) => {
    const regex = /(\*\*[^*]+\*\*)|(https?:\/\/[^\s\)\]\n]+)/g;
    const segments: { type: "text" | "bold" | "url"; content: string }[] = [];
    let last = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > last) segments.push({ type: "text", content: text.slice(last, match.index) });
      if (match[1]) segments.push({ type: "bold", content: match[1].slice(2, -2) });
      else if (match[2]) segments.push({ type: "url", content: match[2] });
      last = match.index + match[0].length;
    }
    if (last < text.length) segments.push({ type: "text", content: text.slice(last) });
    return segments;
  };

  const copyToClipboard = async (text: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert("Copied", "Message copied to clipboard.");
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isUser = item.role === "user";
    const segments = parseSegments(item.content);
    return (
      <View style={[styles.bubbleRow, isUser ? styles.rowRight : styles.rowLeft]}>
        {!isUser && (
          <View style={[styles.avatar, { backgroundColor: isDark ? "#14532d" : "#dcfce7" }]}>
            <Text style={styles.avatarText}>🌿</Text>
          </View>
        )}
        <TouchableOpacity
          activeOpacity={0.85}
          onLongPress={() => copyToClipboard(item.content)}
          style={[styles.bubble, isUser ? styles.userBubble : [styles.botBubble, { backgroundColor: colors.card }]]}
        >
          <Text style={isUser ? styles.userText : [styles.botText, { color: colors.text }]}>
            {segments.map((seg, i) => {
              if (seg.type === "bold") return <Text key={i} style={[styles.boldText, { color: colors.text }]}>{seg.content}</Text>;
              if (seg.type === "url") return (
                <Text key={i} style={styles.linkText} onPress={() => Linking.openURL(seg.content)}>
                  {seg.content}
                </Text>
              );
              return <Text key={i}>{seg.content}</Text>;
            })}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>LeafEye Assistant</Text>
        <Text style={styles.headerSub}>Powered by RAG + Groq</Text>
      </View>

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
            <View style={[styles.avatar, { backgroundColor: isDark ? "#14532d" : "#dcfce7" }]}>
              <Text style={styles.avatarText}>🌿</Text>
            </View>
            <View style={[styles.typingBubble, { backgroundColor: colors.card }]}>
              <ActivityIndicator size="small" color="#16a34a" />
            </View>
          </View>
        )}

        <View style={[styles.inputRow, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <TouchableOpacity style={styles.keyboardBtn} onPress={() => Keyboard.dismiss()} activeOpacity={0.7}>
            <Ionicons name="chevron-down" size={20} color={colors.textSub} />
          </TouchableOpacity>

          <TextInput
            style={[styles.input, { backgroundColor: colors.inputBg, color: colors.text }]}
            value={input}
            onChangeText={setInput}
            placeholder="Ask about crops, diseases..."
            placeholderTextColor={colors.textMuted}
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

      <View style={[styles.tabBarSpacer, { backgroundColor: colors.card }]} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },

  header: { backgroundColor: "#16a34a", paddingVertical: 12, paddingHorizontal: 16 },
  headerTitle: { color: "#fff", fontSize: 17, fontWeight: "700" },
  headerSub: { color: "#bbf7d0", fontSize: 11, marginTop: 2 },

  messageList: { padding: 12, paddingBottom: 8 },

  bubbleRow: { flexDirection: "row", marginVertical: 4, alignItems: "flex-end" },
  rowLeft: { justifyContent: "flex-start" },
  rowRight: { justifyContent: "flex-end" },

  avatar: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center", marginRight: 6 },
  avatarText: { fontSize: 14 },

  bubble: { maxWidth: "75%", borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8 },
  userBubble: { backgroundColor: "#16a34a", borderBottomRightRadius: 4 },
  botBubble: { borderBottomLeftRadius: 4, elevation: 1 },

  userText: { color: "#fff", fontSize: 14, lineHeight: 20 },
  botText: { fontSize: 14, lineHeight: 20 },
  boldText: { fontWeight: "700" },
  linkText: { color: "#16a34a", textDecorationLine: "underline", fontSize: 14, lineHeight: 20 },

  typingRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, marginBottom: 4 },
  typingBubble: { borderRadius: 16, paddingHorizontal: 16, paddingVertical: 10, elevation: 1 },

  inputRow: {
    flexDirection: "row",
    padding: 8,
    borderTopWidth: 1,
    alignItems: "flex-end",
  },
  keyboardBtn: { width: 36, height: 40, alignItems: "center", justifyContent: "center", marginRight: 4 },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
    maxHeight: 100,
  },
  sendBtn: { marginLeft: 8, backgroundColor: "#16a34a", borderRadius: 20, width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  sendBtnDisabled: { backgroundColor: "#d1d5db" },
  sendIcon: { color: "#fff", fontSize: 16 },

  tabBarSpacer: { height: TAB_BAR_HEIGHT },
});
