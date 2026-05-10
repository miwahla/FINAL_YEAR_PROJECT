import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { useRouter } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Lang = "en" | "ur";

const STRINGS: Record<
  Lang,
  {
    appName: string;
    loginTab: string;
    signupTab: string;
    email: string;
    password: string;
    confirmPassword: string;
    loginButton: string;
    signupButton: string;
    loginTitle: string;
    signupTitle: string;
    switchToSignup: string;
    switchToLogin: string;
    fillAll: string;
    wrongCreds: string;
    passwordsDontMatch: string;
    generalError: string;
  }
> = {
  en: {
    appName: "LeafEye",
    loginTab: "Login",
    signupTab: "Sign up",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm password",
    loginButton: "Login",
    signupButton: "Create account",
    loginTitle: "Welcome back",
    signupTitle: "Create your account",
    switchToSignup: "Don't have an account? Sign up",
    switchToLogin: "Already have an account? Login",
    fillAll: "Please fill all fields.",
    wrongCreds: "Email or password is incorrect.",
    passwordsDontMatch: "Passwords do not match.",
    generalError: "Something went wrong. Please try again.",
  },
  ur: {
    appName: "LeafEye",
    loginTab: "لاگ اِن",
    signupTab: "سائن اَپ",
    email: "ای میل",
    password: "پاس ورڈ",
    confirmPassword: "پاس ورڈ دوبارہ",
    loginButton: "لاگ اِن",
    signupButton: "اکاؤنٹ بنائیں",
    loginTitle: "واپس آئیں",
    signupTitle: "نیا اکاؤنٹ بنائیں",
    switchToSignup: "اکاؤنٹ نہیں؟ سائن اَپ کریں",
    switchToLogin: "پہلے سے اکاؤنٹ ہے؟ لاگ اِن کریں",
    fillAll: "براہ کرم تمام خانے پُر کریں۔",
    wrongCreds: "ای میل یا پاس ورڈ غلط ہے۔",
    passwordsDontMatch: "پاس ورڈ ایک جیسے نہیں۔",
    generalError: "مسئلہ ہوا، دوبارہ کوشش کریں۔",
  },
};


export default function LoginScreen() {
  const router = useRouter();

  const [lang, setLang] = useState<Lang>("en");
  const t = STRINGS[lang];

  const [modeIsLogin, setModeIsLogin] = useState(true); // true = login, false = signup
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // ----------------- Flip Animation -----------------
  const flipAnim = useRef(new Animated.Value(0)).current; // 0 -> 90 (half flip)

  const rotateY = useMemo(() => {
    return flipAnim.interpolate({
      inputRange: [0, 90],
      outputRange: ["0deg", "90deg"],
    });
  }, [flipAnim]);

  const animatedCardStyle = useMemo(
    () => ({
      transform: [{ perspective: 1000 }, { rotateY }],
    }),
    [rotateY]
  );

  const flipTo = (toLogin: boolean) => {
    if (toLogin === modeIsLogin) return;

    setError(null);

    // optional: clear confirm password when switching to login
    if (toLogin) setConfirmPassword("");

    Animated.timing(flipAnim, {
      toValue: 90,
      duration: 220,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      setModeIsLogin(toLogin);

      Animated.timing(flipAnim, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    });
  };
  // --------------------------------------------------

  const handlePrimary = async () => {
    setError(null);

    if (!email || !password || (!modeIsLogin && !confirmPassword)) {
      setError(t.fillAll);
      return;
    }

    if (!modeIsLogin && password !== confirmPassword) {
      setError(t.passwordsDontMatch);
      return;
    }

    try {
      if (modeIsLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });
        if (error) {
          setError(t.wrongCreds);
        } else {
          router.replace("/(tabs)");
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
        });
        if (error) {
          setError(error.message);
        } else {
          router.replace("/(tabs)");
        }
      }
    } catch (e) {
      console.log("Auth error:", e);
      setError(t.generalError);
    }
  };

  const isUrdu = lang === "ur";
  const textAlign = isUrdu ? "right" : "left";

  return (
    <ImageBackground
      source={require("../assets/images/login-bg.jpg")}
      style={styles.bgImage}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
      <SafeAreaView style={styles.safeArea}>
        {/* Top row: app name + language toggle */}
        <View style={styles.topRow}>
          <Text style={styles.appName}>{t.appName}</Text>

          <View style={styles.langToggle}>
            <TouchableOpacity
              style={[
                styles.langButton,
                lang === "en" && styles.langButtonActive,
              ]}
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
              style={[
                styles.langButton,
                lang === "ur" && styles.langButtonActive,
              ]}
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

        {/* Centered login/signup card */}
        <ScrollView
          contentContainerStyle={styles.centerWrapper}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.cardOuter, animatedCardStyle]}>
            <BlurView
              intensity={Platform.OS === "ios" ? 40 : 25}
              tint="light"
              style={styles.glassCard}
            >
              {/* Glass sheen overlay */}
              <View style={styles.glassOverlay} />

              <Text style={[styles.title, { textAlign }]}>
                {modeIsLogin ? t.loginTitle : t.signupTitle}
              </Text>

              {/* Login / Sign up tabs */}
              <View style={styles.modeTabs}>
                <TouchableOpacity
                  style={[styles.modeTab, modeIsLogin && styles.modeTabActive]}
                  onPress={() => flipTo(true)}
                  activeOpacity={0.9}
                >
                  <Text
                    style={[
                      styles.modeTabText,
                      modeIsLogin && styles.modeTabTextActive,
                    ]}
                  >
                    {t.loginTab}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modeTab, !modeIsLogin && styles.modeTabActive]}
                  onPress={() => flipTo(false)}
                  activeOpacity={0.9}
                >
                  <Text
                    style={[
                      styles.modeTabText,
                      !modeIsLogin && styles.modeTabTextActive,
                    ]}
                  >
                    {t.signupTab}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Email */}
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { textAlign }]}>{t.email}</Text>
                <TextInput
                  style={[styles.input, { textAlign }]}
                  placeholder={t.email}
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              {/* Password */}
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { textAlign }]}>{t.password}</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={[styles.input, styles.inputFlex, { textAlign }]}
                    placeholder={t.password}
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(v => !v)} style={styles.eyeBtn}>
                    <Ionicons name={showPassword ? "eye-off" : "eye"} size={18} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm password only in Sign up mode */}
              {!modeIsLogin && (
                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { textAlign }]}>
                    {t.confirmPassword}
                  </Text>
                  <View style={styles.inputRow}>
                    <TextInput
                      style={[styles.input, styles.inputFlex, { textAlign }]}
                      placeholder={t.confirmPassword}
                      placeholderTextColor="#9CA3AF"
                      secureTextEntry={!showConfirmPassword}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                    />
                    <TouchableOpacity onPress={() => setShowConfirmPassword(v => !v)} style={styles.eyeBtn}>
                      <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={18} color="#6B7280" />
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Error message */}
              {error && <Text style={styles.errorText}>{error}</Text>}

              {/* Primary button */}
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handlePrimary}
                activeOpacity={0.9}
              >
                <Text style={styles.primaryButtonText}>
                  {modeIsLogin ? t.loginButton : t.signupButton}
                </Text>
              </TouchableOpacity>

              {/* Switch login <-> signup */}
              <TouchableOpacity
                onPress={() => flipTo(!modeIsLogin)}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryText}>
                  {modeIsLogin ? t.switchToSignup : t.switchToLogin}
                </Text>
              </TouchableOpacity>
            </BlurView>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  appName: {
    fontSize: 38,
    fontWeight: "700",
    fontStyle: "italic",
    color: "#1eca3aff",
    letterSpacing: 0.2,
  },
  langToggle: {
    flexDirection: "row",
    backgroundColor: "#1eca3aff",
    borderRadius: 999,
    padding: 2,
  },
  langButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  langButtonActive: {
    backgroundColor: "#ffffff",
  },
  langText: {
    fontSize: 12,
    color: "#4b5563",
  },
  langTextActive: {
    fontWeight: "800",
    color: "#111827",
  },
  centerWrapper: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 24,
  },

  // --- Glass card styles ---
  cardOuter: {
    borderRadius: 20,
    overflow: "hidden",
  },
  glassCard: {
    borderRadius: 20,
    padding: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.22)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
    color: "#111827",
  },
  modeTabs: {
    flexDirection: "row",
    backgroundColor: "rgba(229,231,235,0.85)",
    borderRadius: 999,
    padding: 4,
    marginBottom: 20,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  modeTabActive: {
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  modeTabText: {
    fontSize: 14,
    color: "#4b5563",
  },
  modeTabTextActive: {
    fontWeight: "700",
    color: "#111827",
  },
  inputContainer: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    marginBottom: 6,
    color: "#374151",
    fontWeight: "600",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(209,213,219,0.9)",
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.75)",
  },
  inputFlex: {
    flex: 1,
    borderWidth: 0,
    backgroundColor: "transparent",
  },
  eyeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  input: {
    borderWidth: 1,
    borderColor: "rgba(209,213,219,0.9)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
    backgroundColor: "rgba(255,255,255,0.75)",
  },
  errorText: {
    color: "#dc2626",
    fontSize: 13,
    marginTop: 4,
    marginBottom: 6,
    fontWeight: "600",
  },
  primaryButton: {
    backgroundColor: "#16a34a",
    paddingVertical: 13,
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  secondaryText: {
    textAlign: "center",
    fontSize: 13,
    color: "#2563eb",
    marginTop: 4,
    fontWeight: "700",
  },
});
