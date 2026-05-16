import { Session } from "@supabase/supabase-js";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";

import { ThemeProvider, useTheme } from "../contexts/theme";
import { initDb } from "../lib/db";
import { supabase } from "../lib/supabase";

function AppNavigator() {
  const { isDark } = useTheme();
  const router = useRouter();
  const segments = useSegments();

  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    initDb();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session === undefined) return;

    const inTabsGroup = segments[0] === "(tabs)";
    const onLogin = segments[0] === "login" || segments.length === 0;

    if (session && onLogin) {
      router.replace("/(tabs)/plants");
    } else if (!session && inTabsGroup) {
      router.replace("/login");
    }
  }, [session, segments]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="plant-detail" options={{ title: "Plant details" }} />
        <Stack.Screen name="modal" options={{ presentation: "modal", title: "Modal" }} />
      </Stack>
      <StatusBar style={isDark ? "light" : "dark"} />
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}
