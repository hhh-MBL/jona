import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo, useState } from "react";
import {
  Dimensions,
  FlatList,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useApp } from "@/context/AppContext";
import { CATEGORIES, LIBRARY_ITEMS, LibraryItem } from "@/data/libraryData";
import { useColors } from "@/hooks/useColors";

const { width } = Dimensions.get("window");

const LEVEL_COLORS: Record<string, string> = {
  beginner: "#8faa8b",
  intermediate: "#d4a853",
  advanced: "#c27d82",
};

const LEVEL_LABELS: Record<string, string> = {
  beginner: "מתחילה",
  intermediate: "בינוני",
  advanced: "מתקדמת",
};

export default function LibraryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { favorites, toggleFavorite } = useApp();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(null);
  const [filter, setFilter] = useState<"all" | "beginner" | "intermediate" | "advanced">("all");

  const filtered = useMemo(() => {
    let items = LIBRARY_ITEMS;
    if (selectedCategory !== "all") items = items.filter(i => i.category === selectedCategory);
    if (filter !== "all") items = items.filter(i => i.skillLevel === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        i =>
          i.title.toLowerCase().includes(q) ||
          i.description.toLowerCase().includes(q) ||
          i.tags.some(t => t.includes(q))
      );
    }
    return items;
  }, [selectedCategory, filter, search]);

  function handleSurprise() {
    const random = LIBRARY_ITEMS[Math.floor(Math.random() * LIBRARY_ITEMS.length)];
    setSelectedItem(random);
  }

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.lavender + "25", colors.background]}
        style={[styles.header, { paddingTop: topPad + 12 }]}
      >
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>ספרייה</Text>
          <TouchableOpacity
            style={[styles.surpriseBtn, { backgroundColor: colors.lavender }]}
            onPress={handleSurprise}
          >
            <MaterialCommunityIcons name="dice-multiple" size={18} color="#fff" />
            <Text style={styles.surpriseBtnText}>הפתיעי אותי</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.searchBar, { backgroundColor: colors.muted, borderRadius: colors.radius }]}>
          <MaterialCommunityIcons name="magnify" size={20} color={colors.mutedForeground} />
          <TextInput
            style={[styles.searchInput, { color: colors.foreground }]}
            placeholder="חיפוש תבניות, תגיות..."
            placeholderTextColor={colors.mutedForeground}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <MaterialCommunityIcons name="close-circle" size={18} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setSelectedCategory(cat.id)}
              style={[
                styles.catChip,
                {
                  backgroundColor: selectedCategory === cat.id ? colors.lavender : colors.muted,
                  borderRadius: 20,
                },
              ]}
            >
              <Text
                style={[
                  styles.catChipText,
                  { color: selectedCategory === cat.id ? "#fff" : colors.mutedForeground },
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
          {(["all", "beginner", "intermediate", "advanced"] as const).map(level => (
            <TouchableOpacity
              key={level}
              onPress={() => setFilter(level)}
              style={[
                styles.levelChip,
                {
                  backgroundColor: filter === level ? (level === "all" ? colors.primary : LEVEL_COLORS[level]) : "transparent",
                  borderColor: level === "all" ? colors.primary : LEVEL_COLORS[level],
                  borderRadius: 16,
                },
              ]}
            >
              <Text
                style={[
                  styles.levelChipText,
                  { color: filter === level ? "#fff" : level === "all" ? colors.primary : LEVEL_COLORS[level] },
                ]}
              >
                {level === "all" ? "כל הרמות" : LEVEL_LABELS[level]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LinearGradient>

      {filtered.length === 0 ? (
        <EmptyState
          icon="bookshelf"
          title="לא נמצאו תבניות"
          subtitle="נסי חיפוש או קטגוריה אחרת"
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={i => i.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <LibraryCard
              item={item}
              colors={colors}
              isFavorite={favorites.includes(item.id)}
              onToggleFavorite={() => toggleFavorite(item.id)}
              onPress={() => setSelectedItem(item)}
            />
          )}
        />
      )}

      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          colors={colors}
          isFavorite={favorites.includes(selectedItem.id)}
          onToggleFavorite={() => toggleFavorite(selectedItem.id)}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </View>
  );
}

function LibraryCard({ item, colors, isFavorite, onToggleFavorite, onPress }: {
  item: LibraryItem; colors: any; isFavorite: boolean; onToggleFavorite: () => void; onPress: () => void;
}) {
  const levelColor = LEVEL_COLORS[item.skillLevel];

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderRadius: colors.radius, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <LinearGradient
        colors={[levelColor + "25", colors.card]}
        style={[styles.cardGradient, { borderRadius: colors.radius }]}
      >
        <View style={styles.cardIconArea}>
          <MaterialCommunityIcons name="needle" size={36} color={levelColor} />
          {item.isFeatured && (
            <View style={[styles.featuredBadge, { backgroundColor: colors.primary }]}>
              <MaterialCommunityIcons name="star" size={10} color="#fff" />
            </View>
          )}
        </View>
        <View style={styles.cardContent}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={[styles.cardDesc, { color: colors.mutedForeground }]} numberOfLines={2}>
            {item.description}
          </Text>
          <View style={styles.cardMeta}>
            <View style={[styles.levelDot, { backgroundColor: levelColor }]} />
            <Text style={[styles.cardLevel, { color: levelColor }]}>{LEVEL_LABELS[item.skillLevel]}</Text>
          </View>
          <View style={styles.cardFooter}>
            <Text style={[styles.cardTime, { color: colors.mutedForeground }]}>{item.estimatedTime}</Text>
            <TouchableOpacity onPress={onToggleFavorite}>
              <MaterialCommunityIcons
                name={isFavorite ? "heart" : "heart-outline"}
                size={20}
                color={isFavorite ? colors.primary : colors.mutedForeground}
              />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

function ItemDetailModal({ item, colors, isFavorite, onToggleFavorite, onClose }: {
  item: LibraryItem; colors: any; isFavorite: boolean; onToggleFavorite: () => void; onClose: () => void;
}) {
  const levelColor = LEVEL_COLORS[item.skillLevel];

  return (
    <Modal visible animationType="slide" presentationStyle="formSheet">
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onToggleFavorite}>
            <MaterialCommunityIcons
              name={isFavorite ? "heart" : "heart-outline"}
              size={24}
              color={isFavorite ? colors.primary : colors.mutedForeground}
            />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.modalBody}>
          <LinearGradient colors={[levelColor + "30", colors.background]} style={styles.modalHero}>
            <MaterialCommunityIcons name="needle" size={72} color={levelColor} />
          </LinearGradient>

          <View style={styles.modalInfo}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>{item.title}</Text>
            <Text style={[styles.modalDesc, { color: colors.mutedForeground }]}>{item.description}</Text>

            <View style={styles.metaGrid}>
              <MetaItem icon="signal" label="רמה" value={LEVEL_LABELS[item.skillLevel]} color={levelColor} colors={colors} />
              <MetaItem icon="clock-outline" label="זמן" value={item.estimatedTime} color={colors.accent} colors={colors} />
              <MetaItem icon="hook" label="מחט" value={item.hookSize} color={colors.lavender} colors={colors} />
              <MetaItem icon="weight" label="חוט" value={item.yarnType} color={colors.sage} colors={colors} />
            </View>

            <Text style={[styles.sectionLabel, { color: colors.foreground }]}>חומרים דרושים</Text>
            {item.materials.map((m, i) => (
              <View key={i} style={styles.materialRow}>
                <View style={[styles.materialDot, { backgroundColor: colors.primary }]} />
                <Text style={[styles.materialText, { color: colors.foreground }]}>{m}</Text>
              </View>
            ))}

            <Text style={[styles.sectionLabel, { color: colors.foreground }]}>תגיות</Text>
            <View style={styles.tagsRow}>
              {item.tags.map(tag => (
                <View key={tag} style={[styles.tag, { backgroundColor: colors.muted, borderRadius: 12 }]}>
                  <Text style={[styles.tagText, { color: colors.mutedForeground }]}>#{tag}</Text>
                </View>
              ))}
            </View>

            {item.patternUrl ? (
              <TouchableOpacity
                style={[styles.patternBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
                onPress={() => Linking.openURL(item.patternUrl!)}
              >
                <MaterialCommunityIcons name="open-in-new" size={18} color="#fff" />
                <Text style={styles.patternBtnText}>פתחי תבנית מלאה</Text>
              </TouchableOpacity>
            ) : (
              <View style={[styles.noPatternArea, { backgroundColor: colors.muted, borderRadius: colors.radius }]}>
                <MaterialCommunityIcons name="information-outline" size={20} color={colors.mutedForeground} />
                <Text style={[styles.noPatternText, { color: colors.mutedForeground }]}>
                  קישור לתבנית יתווסף בקרוב
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

function MetaItem({ icon, label, value, color, colors }: { icon: string; label: string; value: string; color: string; colors: any }) {
  return (
    <View style={[styles.metaItem, { backgroundColor: color + "15", borderRadius: 12 }]}>
      <MaterialCommunityIcons name={icon as any} size={18} color={color} />
      <Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.metaValue, { color: colors.foreground }]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const cardWidth = (width - 48) / 2;

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  headerTitle: { fontSize: 28, fontWeight: "700" },
  surpriseBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  surpriseBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  searchBar: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 12 },
  searchInput: { flex: 1, fontSize: 15 },
  catScroll: { marginBottom: 8 },
  catChip: { paddingHorizontal: 14, paddingVertical: 7, marginRight: 8 },
  catChipText: { fontSize: 13, fontWeight: "600" },
  levelChip: { paddingHorizontal: 12, paddingVertical: 5, marginRight: 8, borderWidth: 1.5 },
  levelChipText: { fontSize: 12, fontWeight: "600" },
  columnWrapper: { paddingHorizontal: 16, gap: 12 },
  list: { paddingTop: 12, paddingBottom: 110 },
  card: { width: cardWidth, borderWidth: 1, overflow: "hidden" },
  cardGradient: { padding: 14 },
  cardIconArea: { alignItems: "center", marginBottom: 10 },
  featuredBadge: { position: "absolute", top: 0, right: 0, width: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  cardContent: {},
  cardTitle: { fontSize: 14, fontWeight: "700", marginBottom: 4 },
  cardDesc: { fontSize: 11, lineHeight: 16, marginBottom: 8 },
  cardMeta: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 6 },
  levelDot: { width: 6, height: 6, borderRadius: 3 },
  cardLevel: { fontSize: 11, fontWeight: "600" },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTime: { fontSize: 10 },
  modalContainer: { flex: 1 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16 },
  modalHero: { alignItems: "center", paddingVertical: 40 },
  modalBody: { paddingBottom: 40 },
  modalInfo: { paddingHorizontal: 20 },
  modalTitle: { fontSize: 24, fontWeight: "800", marginBottom: 8 },
  modalDesc: { fontSize: 14, lineHeight: 22, marginBottom: 20 },
  metaGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 24 },
  metaItem: { width: "46%", padding: 12, gap: 4 },
  metaLabel: { fontSize: 10, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  metaValue: { fontSize: 13, fontWeight: "700" },
  sectionLabel: { fontSize: 15, fontWeight: "700", marginBottom: 10 },
  materialRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  materialDot: { width: 6, height: 6, borderRadius: 3 },
  materialText: { fontSize: 14 },
  tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 24 },
  tag: { paddingHorizontal: 10, paddingVertical: 4 },
  tagText: { fontSize: 12 },
  patternBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14 },
  patternBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  noPatternArea: { flexDirection: "row", alignItems: "center", gap: 8, padding: 14 },
  noPatternText: { fontSize: 13 },
});
