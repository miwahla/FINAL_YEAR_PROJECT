import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "@leafeye_dark_mode";

export const LIGHT = {
  bg: "#f9fafb",
  bg2: "#f3f4f6",
  card: "#ffffff",
  card2: "#f8fafc",
  text: "#111827",
  textSub: "#6b7280",
  textMuted: "#9ca3af",
  border: "#e5e7eb",
  tabBar: "#ffffff",
  tabBarBorder: "#eef2f7",
  inputBg: "#f3f4f6",
  sectionLabel: "#9ca3af",
};

export const DARK = {
  bg: "#0f172a",
  bg2: "#1e293b",
  card: "#1e293b",
  card2: "#263548",
  text: "#f1f5f9",
  textSub: "#94a3b8",
  textMuted: "#64748b",
  border: "#334155",
  tabBar: "#1e293b",
  tabBarBorder: "#2d3f55",
  inputBg: "#263548",
  sectionLabel: "#64748b",
};

export type Colors = typeof LIGHT;

interface ThemeCtx {
  isDark: boolean;
  toggle: () => void;
  colors: Colors;
}

const ThemeContext = createContext<ThemeCtx>({
  isDark: false,
  toggle: () => {},
  colors: LIGHT,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((v) => {
      if (v !== null) setIsDark(v === "true");
    });
  }, []);

  const toggle = () => {
    setIsDark((prev) => {
      const next = !prev;
      AsyncStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggle, colors: isDark ? DARK : LIGHT }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
