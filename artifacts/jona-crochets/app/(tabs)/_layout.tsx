import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View, useColorScheme } from "react-native";
import { useColors } from "@/hooks/useColors";

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "house.fill", selected: "house.fill" }} />
        <Label>בית</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="counter">
        <Icon sf={{ default: "number.circle.fill", selected: "number.circle.fill" }} />
        <Label>מונה</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="library">
        <Icon sf={{ default: "books.vertical.fill", selected: "books.vertical.fill" }} />
        <Label>ספרייה</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="projects">
        <Icon sf={{ default: "folder.fill", selected: "folder.fill" }} />
        <Label>פרויקטים</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="tools">
        <Icon sf={{ default: "wrench.and.screwdriver.fill", selected: "wrench.and.screwdriver.fill" }} />
        <Label>כלים</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 0,
          height: isWeb ? 84 : 60,
          paddingBottom: isWeb ? 34 : 8,
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView intensity={80} tint={isDark ? "dark" : "systemChromeMaterial"} style={StyleSheet.absoluteFill} />
          ) : isWeb ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]} />
          ) : null,
        tabBarLabelStyle: { fontSize: 10, fontWeight: "600", marginTop: 2 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "בית",
          tabBarIcon: ({ color, size }) =>
            isIOS ? <SymbolView name="house.fill" tintColor={color} size={size} /> : <MaterialCommunityIcons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="counter"
        options={{
          title: "מונה",
          tabBarIcon: ({ color, size }) =>
            isIOS ? <SymbolView name="number.circle.fill" tintColor={color} size={size} /> : <MaterialCommunityIcons name="counter" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: "ספרייה",
          tabBarIcon: ({ color, size }) =>
            isIOS ? <SymbolView name="books.vertical.fill" tintColor={color} size={size} /> : <MaterialCommunityIcons name="bookshelf" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: "פרויקטים",
          tabBarIcon: ({ color, size }) =>
            isIOS ? <SymbolView name="folder.fill" tintColor={color} size={size} /> : <MaterialCommunityIcons name="folder-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="tools"
        options={{
          title: "כלים",
          tabBarIcon: ({ color, size }) =>
            isIOS ? <SymbolView name="wrench.and.screwdriver.fill" tintColor={color} size={size} /> : <MaterialCommunityIcons name="tools" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) return <NativeTabLayout />;
  return <ClassicTabLayout />;
}
