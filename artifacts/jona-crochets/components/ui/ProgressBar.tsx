import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View, ViewStyle } from "react-native";
import { useColors } from "@/hooks/useColors";

interface ProgressBarProps {
  progress: number;
  label?: string;
  showPercent?: boolean;
  color?: string;
  style?: ViewStyle;
  height?: number;
}

export function ProgressBar({ progress, label, showPercent = true, color, style, height = 8 }: ProgressBarProps) {
  const colors = useColors();
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const clampedProgress = Math.max(0, Math.min(100, progress));

  useEffect(() => {
    Animated.spring(animatedWidth, {
      toValue: clampedProgress,
      useNativeDriver: false,
      tension: 60,
      friction: 10,
    }).start();
  }, [clampedProgress]);

  return (
    <View style={style}>
      {(label || showPercent) && (
        <View style={styles.labelRow}>
          {label && <Text style={[styles.label, { color: colors.mutedForeground }]}>{label}</Text>}
          {showPercent && (
            <Text style={[styles.percent, { color: colors.primary }]}>{clampedProgress}%</Text>
          )}
        </View>
      )}
      <View style={[styles.track, { backgroundColor: colors.muted, height, borderRadius: height / 2 }]}>
        <Animated.View
          style={[
            styles.fill,
            {
              backgroundColor: color || colors.primary,
              height,
              borderRadius: height / 2,
              width: animatedWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  labelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
  },
  percent: {
    fontSize: 12,
    fontWeight: "700",
  },
  track: {
    overflow: "hidden",
  },
  fill: {},
});
