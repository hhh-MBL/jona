import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { useColors } from "@/hooks/useColors";

type BadgeVariant = "primary" | "secondary" | "accent" | "success" | "warning" | "muted";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

export function Badge({ label, variant = "primary", style }: BadgeProps) {
  const colors = useColors();

  const bgColors: Record<BadgeVariant, string> = {
    primary: colors.primary,
    secondary: colors.secondary,
    accent: colors.accent,
    success: colors.success,
    warning: colors.warning,
    muted: colors.muted,
  };

  const textColors: Record<BadgeVariant, string> = {
    primary: colors.primaryForeground,
    secondary: colors.secondaryForeground,
    accent: colors.accentForeground,
    success: "#fff",
    warning: "#fff",
    muted: colors.mutedForeground,
  };

  return (
    <View style={[styles.badge, { backgroundColor: bgColors[variant] }, style]}>
      <Text style={[styles.label, { color: textColors[variant] }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
});
