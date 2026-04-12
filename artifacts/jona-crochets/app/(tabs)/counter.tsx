import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useState } from "react";
import {
  Alert,
  Animated,
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
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useApp } from "@/context/AppContext";
import type { Counter } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

type CounterType = Counter["type"];

export default function CounterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { counters, addCounter, updateCounter, deleteCounter } = useApp();
  const [selectedId, setSelectedId] = useState<string | null>(counters[0]?.id ?? null);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newTarget, setNewTarget] = useState("");
  const [newType, setNewType] = useState<CounterType>("rows");
  const [newNotes, setNewNotes] = useState("");

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const selected = counters.find(c => c.id === selectedId);

  function animateTap() {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 0.92, useNativeDriver: true, speed: 50 }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 50 }),
    ]).start();
  }

  function handleIncrement() {
    if (!selected) return;
    animateTap();
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    updateCounter(selected.id, { count: selected.count + 1 });
  }

  function handleDecrement() {
    if (!selected || selected.count <= 0) return;
    animateTap();
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    updateCounter(selected.id, { count: selected.count - 1 });
  }

  function handleReset() {
    if (!selected) return;
    Alert.alert("Reset Counter", `Reset "${selected.name}" to 0?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        style: "destructive",
        onPress: () => {
          if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          updateCounter(selected.id, { count: 0 });
        },
      },
    ]);
  }

  function handleDelete() {
    if (!selected) return;
    Alert.alert("Delete Counter", `Delete "${selected.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteCounter(selected.id);
          setSelectedId(counters.filter(c => c.id !== selected.id)[0]?.id ?? null);
        },
      },
    ]);
  }

  function handleCreate() {
    if (!newName.trim()) return;
    const target = newTarget ? parseInt(newTarget) : undefined;
    addCounter({ name: newName.trim(), count: 0, target, type: newType, notes: newNotes });
    setNewName("");
    setNewTarget("");
    setNewType("rows");
    setNewNotes("");
    setShowCreate(false);
  }

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : 0;

  const progress =
    selected?.target && selected.target > 0 ? Math.min(100, (selected.count / selected.target) * 100) : 0;

  const typeColors: Record<CounterType, string> = {
    rows: colors.primary,
    stitches: colors.accent,
    rounds: colors.lavender,
    repeats: colors.warning,
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.primary + "25", colors.background]}
        style={[styles.header, { paddingTop: topPad + 12 }]}
      >
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Counters</Text>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={() => setShowCreate(true)}
          >
            <MaterialCommunityIcons name="plus" size={20} color={colors.primaryForeground} />
          </TouchableOpacity>
        </View>

        {counters.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
            {counters.map(c => (
              <TouchableOpacity
                key={c.id}
                onPress={() => setSelectedId(c.id)}
                style={[
                  styles.counterTab,
                  {
                    backgroundColor: selectedId === c.id ? colors.primary : colors.muted,
                    borderRadius: 20,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.counterTabText,
                    { color: selectedId === c.id ? colors.primaryForeground : colors.mutedForeground },
                  ]}
                  numberOfLines={1}
                >
                  {c.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </LinearGradient>

      {!selected ? (
        <View style={styles.emptyWrapper}>
          <EmptyState
            icon="counter"
            title="No counters yet"
            subtitle="Create a counter for rows, stitches, rounds, or repeats"
            actionLabel="Create Counter"
            onAction={() => setShowCreate(true)}
          />
        </View>
      ) : (
        <View style={[styles.mainArea, { paddingBottom: bottomPad + 110 }]}>
          <View style={styles.typeRow}>
            {(["rows", "stitches", "rounds", "repeats"] as CounterType[]).map(t => (
              <TouchableOpacity
                key={t}
                style={[
                  styles.typeChip,
                  {
                    backgroundColor: selected.type === t ? typeColors[t] : colors.muted,
                    borderRadius: 12,
                  },
                ]}
                onPress={() => updateCounter(selected.id, { type: t })}
              >
                <Text
                  style={[
                    styles.typeChipText,
                    { color: selected.type === t ? "#fff" : colors.mutedForeground },
                  ]}
                >
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {selected.target && selected.target > 0 ? (
            <View style={styles.progressArea}>
              <ProgressBar
                progress={progress}
                label={`${selected.count} / ${selected.target} ${selected.type}`}
                color={typeColors[selected.type]}
                height={10}
              />
            </View>
          ) : null}

          <Animated.View style={[styles.bigCounterArea, { transform: [{ scale: scaleAnim }] }]}>
            <TouchableOpacity
              style={[styles.bigBtn, { backgroundColor: typeColors[selected.type] }]}
              onPress={handleIncrement}
              activeOpacity={0.85}
            >
              <Text style={[styles.bigCount, { color: "#fff" }]}>{selected.count}</Text>
              <Text style={[styles.bigLabel, { color: "rgba(255,255,255,0.75)" }]}>
                tap to count {selected.type}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.controlsRow}>
            <TouchableOpacity
              style={[styles.controlBtn, { backgroundColor: colors.muted }]}
              onPress={handleDecrement}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="minus" size={28} color={colors.mutedForeground} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlBtn, { backgroundColor: colors.muted }]}
              onPress={handleReset}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="refresh" size={24} color={colors.mutedForeground} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlBtn, { backgroundColor: colors.destructive + "20" }]}
              onPress={handleDelete}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="trash-can-outline" size={22} color={colors.destructive} />
            </TouchableOpacity>
          </View>

          {selected.target ? (
            <Text style={[styles.targetInfo, { color: colors.mutedForeground }]}>
              Target: {selected.target} {selected.type} — {Math.max(0, selected.target - selected.count)} remaining
            </Text>
          ) : null}
        </View>
      )}

      <Modal visible={showCreate} animationType="slide" presentationStyle="formSheet">
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>New Counter</Text>
            <TouchableOpacity onPress={() => setShowCreate(false)}>
              <MaterialCommunityIcons name="close" size={24} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <Text style={[styles.inputLabel, { color: colors.foreground }]}>Project Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderRadius: colors.radius }]}
              value={newName}
              onChangeText={setNewName}
              placeholder="e.g. Spring Bunny"
              placeholderTextColor={colors.mutedForeground}
            />

            <Text style={[styles.inputLabel, { color: colors.foreground }]}>Type</Text>
            <View style={styles.typeGrid}>
              {(["rows", "stitches", "rounds", "repeats"] as CounterType[]).map(t => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setNewType(t)}
                  style={[
                    styles.typeOption,
                    {
                      backgroundColor: newType === t ? typeColors[t] : colors.muted,
                      borderRadius: colors.radius / 2,
                    },
                  ]}
                >
                  <Text style={[styles.typeOptionText, { color: newType === t ? "#fff" : colors.mutedForeground }]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.inputLabel, { color: colors.foreground }]}>Target (optional)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderRadius: colors.radius }]}
              value={newTarget}
              onChangeText={setNewTarget}
              placeholder="e.g. 50"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="number-pad"
            />

            <Text style={[styles.inputLabel, { color: colors.foreground }]}>Notes (optional)</Text>
            <TextInput
              style={[styles.input, styles.textarea, { backgroundColor: colors.muted, color: colors.foreground, borderRadius: colors.radius }]}
              value={newNotes}
              onChangeText={setNewNotes}
              placeholder="Any notes for this counter..."
              placeholderTextColor={colors.mutedForeground}
              multiline
            />

            <TouchableOpacity
              style={[styles.createBtn, { backgroundColor: colors.primary, borderRadius: colors.radius }]}
              onPress={handleCreate}
            >
              <Text style={[styles.createBtnText, { color: colors.primaryForeground }]}>Create Counter</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: "700" },
  addBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  tabScroll: { marginTop: 4 },
  counterTab: { paddingHorizontal: 16, paddingVertical: 8, marginRight: 8 },
  counterTabText: { fontSize: 13, fontWeight: "600" },
  emptyWrapper: { flex: 1, justifyContent: "center" },
  mainArea: { flex: 1, alignItems: "center", paddingHorizontal: 24, paddingTop: 12 },
  typeRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
  typeChip: { paddingHorizontal: 14, paddingVertical: 6 },
  typeChipText: { fontSize: 12, fontWeight: "600", textTransform: "capitalize" },
  progressArea: { width: "100%", marginBottom: 20 },
  bigCounterArea: { width: "100%", marginBottom: 32 },
  bigBtn: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 200,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
    maxHeight: 260,
    maxWidth: 260,
    alignSelf: "center",
  },
  bigCount: { fontSize: 80, fontWeight: "800", letterSpacing: -3 },
  bigLabel: { fontSize: 13, marginTop: 4 },
  controlsRow: { flexDirection: "row", gap: 20 },
  controlBtn: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center" },
  targetInfo: { marginTop: 20, fontSize: 13 },
  modal: { flex: 1 },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.06)",
  },
  modalTitle: { fontSize: 20, fontWeight: "700" },
  modalBody: { padding: 20 },
  inputLabel: { fontSize: 13, fontWeight: "600", marginBottom: 6, marginTop: 16 },
  input: { padding: 14, fontSize: 15 },
  textarea: { height: 80, textAlignVertical: "top" },
  typeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  typeOption: { paddingHorizontal: 16, paddingVertical: 10 },
  typeOptionText: { fontSize: 13, fontWeight: "600", textTransform: "capitalize" },
  createBtn: { marginTop: 32, paddingVertical: 16, alignItems: "center" },
  createBtnText: { fontSize: 16, fontWeight: "700" },
});
