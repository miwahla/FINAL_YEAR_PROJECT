// app/(tabs)/_layout.tsx
import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Tabs } from "expo-router";
import React from "react";
import { Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import Svg, { Path } from "react-native-svg";

const VISIBLE_TABS = ["index", "plants", "detect", "my-plants", "chatbot"];

function NotchedBackground() {
  return (
    <View style={styles.notchBgWrap} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox="0 0 100 30" preserveAspectRatio="none">
        <Path
          d="
            M0,8
            C0,3 3,0 8,0
            H38
            C41,0 43,2 44,4
            C46,9 49,13 50,13
            C51,13 54,9 56,4
            C57,2 59,0 62,0
            H92
            C97,0 100,3 100,8
            V30
            H0
            Z
          "
          fill="#FFFFFF"
        />
      </Svg>
      <View style={styles.topHairline} />
    </View>
  );
}

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const visibleRoutes = state.routes.filter((r) => VISIBLE_TABS.includes(r.name));

  return (
    <View style={styles.tabBarWrap}>
      <NotchedBackground />

      <View style={styles.tabBarRow}>
        {visibleRoutes.map((route) => {
          const realIndex = state.routes.findIndex((r) => r.key === route.key);
          const isFocused = state.index === realIndex;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const isCenter = route.name === "detect";

          const iconName = (() => {
            switch (route.name) {
              case "index":
                return isFocused ? "home" : "home-outline";
              case "plants":
                return isFocused ? "leaf" : "leaf-outline";
              case "detect":
                return isFocused ? "scan" : "scan-outline";
              case "my-plants":
                return isFocused ? "bookmark" : "bookmark-outline";
              case "chatbot":
                return isFocused ? "chatbubble" : "chatbubble-outline";
              default:
                return "ellipse";
            }
          })();

          const activeColor = isCenter ? "#16a34a" : "#2563EB";
          const color = isFocused ? activeColor : "#6B7280";

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              activeOpacity={0.85}
              style={[styles.tabItem, isCenter && styles.centerTabItem]}
            >
              <View style={isCenter ? styles.centerBtn : styles.iconBtn}>
                <Ionicons name={iconName as any} size={isCenter ? 28 : 22} color={color} />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <CustomTabBar {...props} />} screenOptions={{ headerShown: false }}>
      {/* must match filenames exactly */}
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="plants" options={{ title: "Plants" }} />
      <Tabs.Screen name="detect" options={{ title: "Detect" }} />
      <Tabs.Screen name="my-plants" options={{ title: "My Plants" }} />
      <Tabs.Screen name="chatbot" options={{ title: "AI Chat" }} />

      {/* exists but hidden */}
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}

const BAR_HEIGHT_IOS = 90;
const BAR_HEIGHT_ANDROID = 70;

const styles = StyleSheet.create({
  tabBarWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: Platform.OS === "ios" ? BAR_HEIGHT_IOS : BAR_HEIGHT_ANDROID,
  },
  notchBgWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: Platform.OS === "ios" ? BAR_HEIGHT_IOS : BAR_HEIGHT_ANDROID,
  },
  topHairline: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 1,
    backgroundColor: "#EEF2F7",
  },
  tabBarRow: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: Platform.OS === "ios" ? BAR_HEIGHT_IOS : BAR_HEIGHT_ANDROID,
    paddingBottom: Platform.OS === "ios" ? 18 : 10,
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: -6 },
    elevation: 10,
  },
  tabItem: { flex: 1, alignItems: "center" },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  centerTabItem: { marginTop: -10 },
  centerBtn: {
    width: 54,
    height: 54,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
});
