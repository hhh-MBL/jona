import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useApp } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");

const QUOTES = [
  "כל תפר הוא מעשה קטן של אהבה.",
  "סריגה היא מדיטציה עם חוט.",
  "לאט לאט, קסם קורה.",
  "הידיים שלך יוצרות חום לעולם.",
  "מאחורי כל יצירה יפה עומד לב סבלני.",
  "סריגה: הופכת חוט לשמחה.",
  "עשי זאת באהבה, תני זאת בשמחה.",
  "כל לולאה מספרת סיפור.",
  "היצירה שלך מביאה חיוך לכל מי שמקבל אותה.",
];

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { projects, counters, yarnStash, profile } = useApp();
  const [quote, setQuote] = useState(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const activeProjects = projects.filter(p => p.status === "in_progress" && !p.archived);
  const completedProjects = projects.filter(p => p.status === "finished" && !p.archived);
  const topCounter = counters[0];

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    const interval = setInterval(() => {
      Animated.timing(fadeAnim, { toValue: 0, duration: 400, useNativeDriver: true }).start(() => {
        setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
      });
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "בוקר טוב" : hour < 17 ? "צהריים טובים" : "ערב טוב";

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 110 }}
    >
      <LinearGradient
        colors={[colors.primary + "30", colors.lavender + "20", colors.background]}
        style={[styles.header, { paddingTop: topPad + 16 }]}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.welcome, { color: colors.primary }]}>ברוך הבא יונוש</Text>
            <Text style={[styles.greeting, { color: colors.mutedForeground }]}>{greeting},</Text>
            <Text style={[styles.name, { color: colors.foreground }]}>{profile.name}</Text>
          </View>
          <TouchableOpacity
            style={[styles.avatarBtn, { backgroundColor: colors.primary + "20" }]}
            onPress={() => router.push("/(tabs)/tools")}
          >
            <MaterialCommunityIcons name="heart" size={28} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <Animated.View style={[styles.quoteCard, { backgroundColor: colors.card, opacity: fadeAnim }]}>
          <MaterialCommunityIcons name="format-quote-open" size={20} color={colors.primary} />
          <Text style={[styles.quoteText, { color: colors.foreground }]}>{quote}</Text>
        </Animated.View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.statsRow}>
          <StatCard
            icon="lightning-bolt"
            value={activeProjects.length.toString()}
            label="פעיל"
            color={colors.primary}
            colors={colors}
          />
          <StatCard
            icon="check-circle-outline"
            value={completedProjects.length.toString()}
            label="הושלם"
            color={colors.accent}
            colors={colors}
          />
          <StatCard
            icon="palette-swatch-outline"
            value={yarnStash.length.toString()}
            label="חוטים"
            color={colors.lavender}
            colors={colors}
          />
          <StatCard
            icon="numeric"
            value={counters.length.toString()}
            label="מונים"
            color={colors.warning}
            colors={colors}
          />
        </View>

        {activeProjects.length > 0 && (
          <View style={styles.section}>
            <SectionHeader title="המשך עבודה" onSeeAll={() => router.push("/(tabs)/projects")} colors={colors} />
            {activeProjects.slice(0, 2).map(project => (
              <Card
                key={project.id}
                style={styles.projectCard}
                onPress={() => router.push("/(tabs)/projects")}
              >
                <View style={styles.projectHeader}>
                  <View style={[styles.projectDot, { backgroundColor: colors.primary }]} />
                  <Text style={[styles.projectName, { color: colors.foreground }]} numberOfLines={1}>
                    {project.name}
                  </Text>
                  {project.isGift && (
                    <MaterialCommunityIcons name="gift-outline" size={16} color={colors.primary} />
                  )}
                </View>
                {project.deadline && (
                  <Text style={[styles.projectDeadline, { color: colors.mutedForeground }]}>
                    עד {new Date(project.deadline).toLocaleDateString("he-IL", { month: "long", day: "numeric" })}
                  </Text>
                )}
                <ProgressBar progress={project.progress} style={{ marginTop: 10 }} />
              </Card>
            ))}
          </View>
        )}

        {topCounter && (
          <View style={styles.section}>
            <SectionHeader title="מונה מהיר" onSeeAll={() => router.push("/(tabs)/counter")} colors={colors} />
            <Card elevated style={styles.counterCard}>
              <Text style={[styles.counterName, { color: colors.mutedForeground }]}>{topCounter.name}</Text>
              <Text style={[styles.counterValue, { color: colors.primary }]}>{topCounter.count}</Text>
              <Text style={[styles.counterType, { color: colors.mutedForeground }]}>
                {topCounter.type === "rows" ? "שורות" : topCounter.type === "stitches" ? "תפרים" : topCounter.type === "rounds" ? "סיבובים" : "חזרות"}
              </Text>
              <TouchableOpacity
                style={[styles.counterBtn, { backgroundColor: colors.primary }]}
                onPress={() => router.push("/(tabs)/counter")}
              >
                <Text style={[styles.counterBtnText, { color: colors.primaryForeground }]}>פתח מונה</Text>
              </TouchableOpacity>
            </Card>
          </View>
        )}

        <View style={styles.section}>
          <SectionHeader title="גישה מהירה" colors={colors} />
          <View style={styles.quickGrid}>
            <QuickCard
              icon="calculator"
              label="מחשבון מתנות"
              color={colors.accent}
              colors={colors}
              onPress={() => router.push("/(tabs)/tools")}
            />
            <QuickCard
              icon="bookshelf"
              label="ספרייה"
              color={colors.lavender}
              colors={colors}
              onPress={() => router.push("/(tabs)/library")}
            />
            <QuickCard
              icon="palette-swatch-outline"
              label="מלאי חוטים"
              color={colors.sage}
              colors={colors}
              onPress={() => router.push("/(tabs)/tools")}
            />
            <QuickCard
              icon="notebook-outline"
              label="רעיונות שלך"
              color={colors.warning}
              colors={colors}
              onPress={() => router.push("/(tabs)/tools")}
            />
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title="השראה להיום" onSeeAll={() => router.push("/(tabs)/library")} colors={colors} />
          <Card onPress={() => router.push("/(tabs)/library")} style={styles.inspirationCard}>
            <LinearGradient
              colors={[colors.primary + "15", colors.lavender + "15"]}
              style={styles.inspirationGrad}
            >
              <MaterialCommunityIcons name="star-four-points" size={32} color={colors.primary} />
              <Text style={[styles.inspirationTitle, { color: colors.foreground }]}>
                גלי את הפרויקט הבא שלך
              </Text>
              <Text style={[styles.inspirationSub, { color: colors.mutedForeground }]}>
                עיין ברעיונות סריגה נבחרים
              </Text>
              <View style={[styles.surpriseBtn, { backgroundColor: colors.primary }]}>
                <Text style={[styles.surpriseBtnText, { color: colors.primaryForeground }]}>
                  הפתיעי אותי
                </Text>
              </View>
            </LinearGradient>
          </Card>
        </View>
      </View>
    </ScrollView>
  );
}

function StatCard({ icon, value, label, color, colors }: { icon: string; value: string; label: string; color: string; colors: any }) {
  return (
    <View style={[styles.statCard, { backgroundColor: color + "15", borderRadius: colors.radius }]}>
      <MaterialCommunityIcons name={icon as any} size={20} color={color} />
      <Text style={[styles.statValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

function SectionHeader({ title, onSeeAll, colors }: { title: string; onSeeAll?: () => void; colors: any }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={[styles.seeAll, { color: colors.primary }]}>ראי הכל</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function QuickCard({ icon, label, color, colors, onPress }: { icon: string; label: string; color: string; colors: any; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.quickCard, { backgroundColor: color + "15", borderRadius: colors.radius }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <MaterialCommunityIcons name={icon as any} size={26} color={color} />
      <Text style={[styles.quickLabel, { color: colors.foreground }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  welcome: { fontSize: 14, fontWeight: "800", marginBottom: 2 },
  greeting: { fontSize: 14, fontWeight: "500" },
  name: { fontSize: 28, fontWeight: "700", letterSpacing: -0.5 },
  avatarBtn: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  quoteCard: {
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  quoteText: { fontSize: 14, fontStyle: "italic", lineHeight: 22, marginTop: 4, fontWeight: "500" },
  content: { paddingHorizontal: 20 },
  statsRow: { flexDirection: "row", gap: 10, marginTop: 20, marginBottom: 8 },
  statCard: { flex: 1, alignItems: "center", paddingVertical: 14, gap: 4 },
  statValue: { fontSize: 18, fontWeight: "700" },
  statLabel: { fontSize: 10, fontWeight: "500" },
  section: { marginTop: 24 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  sectionTitle: { fontSize: 17, fontWeight: "700" },
  seeAll: { fontSize: 13, fontWeight: "600" },
  projectCard: { marginBottom: 10 },
  projectHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  projectDot: { width: 8, height: 8, borderRadius: 4 },
  projectName: { flex: 1, fontSize: 15, fontWeight: "600" },
  projectDeadline: { fontSize: 12, marginTop: 4 },
  counterCard: { alignItems: "center", paddingVertical: 24 },
  counterName: { fontSize: 13, fontWeight: "500", marginBottom: 8 },
  counterValue: { fontSize: 64, fontWeight: "800", letterSpacing: -2 },
  counterType: { fontSize: 12, marginTop: 4 },
  counterBtn: { marginTop: 16, paddingHorizontal: 28, paddingVertical: 13, borderRadius: 24, minHeight: 46, justifyContent: "center" },
  counterBtnText: { fontSize: 14, fontWeight: "700" },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  quickCard: { width: (width - 52) / 2, paddingVertical: 20, paddingHorizontal: 16, gap: 10, minHeight: 108, justifyContent: "center" },
  quickLabel: { fontSize: 13, fontWeight: "600" },
  inspirationCard: { padding: 0, overflow: "hidden" },
  inspirationGrad: { padding: 24, alignItems: "center", gap: 8 },
  inspirationTitle: { fontSize: 18, fontWeight: "700", textAlign: "center" },
  inspirationSub: { fontSize: 13, textAlign: "center" },
  surpriseBtn: { marginTop: 8, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20 },
  surpriseBtnText: { fontSize: 14, fontWeight: "700" },
});
