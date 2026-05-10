import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Session } from "@supabase/supabase-js";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";

import { useColorScheme } from "../hooks/use-color-scheme";
import { initDb } from "../lib/db";
import { supabase } from "../lib/supabase";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();

  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    initDb();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Redirect based on auth state once session is known
  useEffect(() => {
    if (session === undefined) return; // still loading

    const inTabsGroup = segments[0] === '(tabs)';
    const onLogin = segments[0] === 'login' || segments.length === 0;

    if (session && onLogin) {
      router.replace('/(tabs)');
    } else if (!session && inTabsGroup) {
      router.replace('/login');
    }
  }, [session, segments]);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="plant-detail" options={{ title: "Plant details" }} />
        <Stack.Screen name="modal" options={{ presentation: "modal", title: "Modal" }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
