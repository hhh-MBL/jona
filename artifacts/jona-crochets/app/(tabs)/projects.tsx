import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
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
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useApp } from "@/context/AppContext";
import type { Project } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

type ProjectStatus = Project["status"];
type SortOption = "newest" | "oldest" | "active" | "completed";

const STATUS_COLORS: Record<ProjectStatus, string> = {
  planning: "#b5a5cc",
  in_progress: "#8faa8b",
  paused: "#d4a853",
  finished: "#c27d82",
};

const STATUS_LABELS: Record<ProjectStatus, string> = {
  planning: "בתכנון",
  in_progress: "בתהליך",
  paused: "מושהה",
  finished: "הושלם",
};

const SORT_LABELS: Record<SortOption, string> = {
  newest: "חדש",
  oldest: "ישן",
  active: "פעיל",
  completed: "הושלם",
};

export default function ProjectsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { projects, addProject, updateProject, deleteProject } = useApp();
  const [showCreate, setShowCreate] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [filterStatus, setFilterStatus] = useState<ProjectStatus | "all">("all");
  const [showArchived, setShowArchived] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [newStatus, setNewStatus] = useState<ProjectStatus>("planning");
  const [newDeadline, setNewDeadline] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [newMaterials, setNewMaterials] = useState("");
  const [newPatternLink, setNewPatternLink] = useState("");
  const [newCategory, setNewCategory] = useState<"gift" | "sale" | "personal">("personal");

  const filtered = projects
    .filter(p => (showArchived ? p.archived : !p.archived))
    .filter(p => filterStatus === "all" || p.status === filterStatus)
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "active") return a.status === "in_progress" ? -1 : 1;
      if (sortBy === "completed") return a.status === "finished" ? -1 : 1;
      return 0;
    });

  const projectToDelete = projects.find(p => p.id === deleteTarget);

  function handleCreate() {
    if (!newName.trim()) return;
    addProject({
      name: newName.trim(),
      status: newStatus,
      startDate: new Date().toISOString().split("T")[0],
      deadline: newDeadline || undefined,
      notes: newNotes,
      materials: newMaterials,
      patternLink: newPatternLink,
      progress: 0,
      isGift: newCategory === "gift",
      isSaleItem: newCategory === "sale",
      isPersonal: newCategory === "personal",
      category: newCategory,
      archived: false,
    });
    resetForm();
    setShowCreate(false);
  }

  function resetForm() {
    setNewName("");
    setNewStatus("planning");
    setNewDeadline("");
    setNewNotes("");
    setNewMaterials("");
    setNewPatternLink("");
    setNewCategory("personal");
  }

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.accent + "25", colors.background]}
        style={[styles.header, { paddingTop: topPad + 12 }]}
      >
        <View style={styles.headerRow}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>פרויקטים</Text>
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.accent }]}
            onPress={() => setShowCreate(true)}
          >
            <MaterialCommunityIcons name="plus" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {(["all", "planning", "in_progress", "paused", "finished"] as const).map(s => (
            <TouchableOpacity
              key={s}
              onPress={() => setFilterStatus(s)}
              style={[
                styles.filterChip,
                {
                  backgroundColor:
                    filterStatus === s
                      ? s === "all" ? colors.accent : STATUS_COLORS[s as ProjectStatus]
                      : colors.muted,
                  borderRadius: 20,
                },
              ]}
            >
              <Text style={[styles.filterChipText, { color: filterStatus === s ? "#fff" : colors.mutedForeground }]}>
                {s === "all" ? "הכל" : STATUS_LABELS[s as ProjectStatus]}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.sortRow}>
          {(["newest", "oldest", "active", "completed"] as SortOption[]).map(s => (
            <TouchableOpacity
              key={s}
              onPress={() => setSortBy(s)}
              style={[styles.sortBtn, { backgroundColor: sortBy === s ? colors.foreground : "transparent" }]}
            >
              <Text style={[styles.sortBtnText, { color: sortBy === s ? colors.background : colors.mutedForeground }]}>
                {SORT_LABELS[s]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ paddingBottom: 110, paddingHorizontal: 16 }}>
        {filtered.length === 0 ? (
          <EmptyState
            icon="clipboard-text-outline"
            title="אין פרויקטים עדיין"
            subtitle="התחילי לעקוב אחרי פרויקטי הסריגה שלך"
            actionLabel="הוספי פרויקט"
            onAction={() => setShowCreate(true)}
          />
        ) : (
          filtered.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              colors={colors}
              onStatusChange={status => updateProject(project.id, { status })}
              onProgressChange={progress => updateProject(project.id, { progress })}
              onArchive={() => updateProject(project.id, { archived: !project.archived })}
              onDelete={() => setDeleteTarget(project.id)}
            />
          ))
        )}

        <TouchableOpacity
          style={[styles.archiveToggle, { borderColor: colors.border }]}
          onPress={() => setShowArchived(v => !v)}
        >
          <MaterialCommunityIcons
            name={showArchived ? "archive-arrow-up" : "archive"}
            size={16}
            color={colors.mutedForeground}
          />
          <Text style={[styles.archiveToggleText, { color: colors.mutedForeground }]}>
            {showArchived ? "הסתירי" : "הציגי"} ארכיון
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <ConfirmDialog
        visible={!!deleteTarget}
        title="מחיקת פרויקט"
        message={`למחוק את "${projectToDelete?.name}"?`}
        confirmLabel="מחקי"
        cancelLabel="ביטול"
        destructive
        onConfirm={() => { deleteProject(deleteTarget!); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
      />

      <Modal visible={showCreate} animationType="slide" presentationStyle="formSheet">
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>פרויקט חדש</Text>
            <TouchableOpacity onPress={() => { resetForm(); setShowCreate(false); }}>
              <MaterialCommunityIcons name="close" size={24} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            <Text style={[styles.inputLabel, { color: colors.foreground }]}>שם הפרויקט *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderRadius: colors.radius }]}
              value={newName}
              onChangeText={setNewName}
              placeholder="למשל: ארנב אמיגורומי"
              placeholderTextColor={colors.mutedForeground}
            />

            <Text style={[styles.inputLabel, { color: colors.foreground }]}>סטטוס</Text>
            <View style={styles.statusGrid}>
              {(["planning", "in_progress", "paused", "finished"] as ProjectStatus[]).map(s => (
                <TouchableOpacity
                  key={s}
                  onPress={() => setNewStatus(s)}
                  style={[
                    styles.statusOption,
                    { backgroundColor: newStatus === s ? STATUS_COLORS[s] : colors.muted, borderRadius: colors.radius / 2 },
                  ]}
                >
                  <Text style={[styles.statusOptionText, { color: newStatus === s ? "#fff" : colors.mutedForeground }]}>
                    {STATUS_LABELS[s]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.inputLabel, { color: colors.foreground }]}>קטגוריה</Text>
            <View style={styles.categoryRow}>
              {(["personal", "gift", "sale"] as const).map(c => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setNewCategory(c)}
                  style={[
                    styles.categoryBtn,
                    { backgroundColor: newCategory === c ? colors.primary : colors.muted, borderRadius: 20 },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={c === "gift" ? "gift-outline" : c === "sale" ? "tag-outline" : "account-outline"}
                    size={16}
                    color={newCategory === c ? "#fff" : colors.mutedForeground}
                  />
                  <Text style={[styles.categoryBtnText, { color: newCategory === c ? "#fff" : colors.mutedForeground }]}>
                    {c === "gift" ? "מתנה" : c === "sale" ? "למכירה" : "אישי"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.inputLabel, { color: colors.foreground }]}>תאריך יעד (אופציונלי)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderRadius: colors.radius }]}
              value={newDeadline}
              onChangeText={setNewDeadline}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.mutedForeground}
            />

            <Text style={[styles.inputLabel, { color: colors.foreground }]}>חומרים</Text>
            <TextInput
              style={[styles.input, styles.textarea, { backgroundColor: colors.muted, color: colors.foreground, borderRadius: colors.radius }]}
              value={newMaterials}
              onChangeText={setNewMaterials}
              placeholder="חוט, מחט, אביזרים..."
              placeholderTextColor={colors.mutedForeground}
              multiline
            />

            <Text style={[styles.inputLabel, { color: colors.foreground }]}>הערות</Text>
            <TextInput
              style={[styles.input, styles.textarea, { backgroundColor: colors.muted, color: colors.foreground, borderRadius: colors.radius }]}
              value={newNotes}
              onChangeText={setNewNotes}
              placeholder="הערות, רעיונות..."
              placeholderTextColor={colors.mutedForeground}
              multiline
            />

            <Text style={[styles.inputLabel, { color: colors.foreground }]}>קישור לתבנית</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderRadius: colors.radius }]}
              value={newPatternLink}
              onChangeText={setNewPatternLink}
              placeholder="https://..."
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={[styles.createBtn, { backgroundColor: colors.accent, borderRadius: colors.radius }]}
              onPress={handleCreate}
            >
              <Text style={[styles.createBtnText, { color: "#fff" }]}>צרי פרויקט</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

function ProjectCard({ project, colors, onStatusChange, onProgressChange, onArchive, onDelete }: {
  project: Project; colors: any;
  onStatusChange: (s: ProjectStatus) => void;
  onProgressChange: (p: number) => void;
  onArchive: () => void;
  onDelete: () => void;
}) {
  const statusColor = STATUS_COLORS[project.status];
  const [expanded, setExpanded] = useState(false);

  return (
    <Card style={{ marginBottom: 12 }} onPress={() => setExpanded(v => !v)}>
      <View style={styles.projectHeader}>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        <Text style={[styles.projectName, { color: colors.foreground }]} numberOfLines={1}>{project.name}</Text>
        <View style={styles.projectBadges}>
          {project.isGift && <MaterialCommunityIcons name="gift-outline" size={16} color={colors.primary} />}
          {project.isSaleItem && <MaterialCommunityIcons name="tag-outline" size={16} color={colors.accent} />}
        </View>
        <MaterialCommunityIcons name={expanded ? "chevron-up" : "chevron-down"} size={20} color={colors.mutedForeground} />
      </View>

      <View style={styles.projectStatusRow}>
        <View style={[styles.statusPill, { backgroundColor: statusColor + "20" }]}>
          <Text style={[styles.statusPillText, { color: statusColor }]}>{STATUS_LABELS[project.status]}</Text>
        </View>
        {project.deadline && (
          <Text style={[styles.deadlineText, { color: colors.mutedForeground }]}>
            עד {new Date(project.deadline).toLocaleDateString("he-IL", { month: "long", day: "numeric" })}
          </Text>
        )}
      </View>

      <ProgressBar progress={project.progress} style={{ marginTop: 10 }} color={statusColor} />

      {expanded && (
        <View style={styles.expandedArea}>
          <Text style={[styles.expandLabel, { color: colors.mutedForeground }]}>התקדמות</Text>
          <View style={styles.progressBtns}>
            {[0, 25, 50, 75, 100].map(p => (
              <TouchableOpacity
                key={p}
                onPress={() => onProgressChange(p)}
                style={[styles.progressBtn, { backgroundColor: project.progress >= p ? statusColor : colors.muted }]}
              >
                <Text style={[styles.progressBtnText, { color: project.progress >= p ? "#fff" : colors.mutedForeground }]}>
                  {p}%
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.expandLabel, { color: colors.mutedForeground }]}>שינוי סטטוס</Text>
          <View style={styles.statusBtns}>
            {(["planning", "in_progress", "paused", "finished"] as ProjectStatus[]).map(s => (
              <TouchableOpacity
                key={s}
                onPress={() => onStatusChange(s)}
                style={[styles.statusBtn, { backgroundColor: project.status === s ? STATUS_COLORS[s] : colors.muted }]}
              >
                <Text style={[styles.statusBtnText, { color: project.status === s ? "#fff" : colors.mutedForeground }]}>
                  {STATUS_LABELS[s]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {project.notes ? (
            <Text style={[styles.notesText, { color: colors.mutedForeground }]} numberOfLines={3}>
              {project.notes}
            </Text>
          ) : null}

          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.muted }]} onPress={onArchive}>
              <MaterialCommunityIcons
                name={project.archived ? "archive-arrow-up" : "archive"}
                size={16}
                color={colors.mutedForeground}
              />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.destructive + "20" }]} onPress={onDelete}>
              <MaterialCommunityIcons name="trash-can-outline" size={16} color={colors.destructive} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 12 },
  headerTitle: { fontSize: 28, fontWeight: "700" },
  addBtn: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  filterScroll: { marginBottom: 10 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 10, marginRight: 8, minHeight: 42, justifyContent: "center" },
  filterChipText: { fontSize: 13, fontWeight: "600" },
  sortRow: { flexDirection: "row", gap: 8 },
  sortBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 14, minHeight: 36, justifyContent: "center" },
  sortBtnText: { fontSize: 13, fontWeight: "600" },
  projectHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  projectName: { flex: 1, fontSize: 15, fontWeight: "700" },
  projectBadges: { flexDirection: "row", gap: 4 },
  projectStatusRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  statusPillText: { fontSize: 11, fontWeight: "700" },
  deadlineText: { fontSize: 11 },
  expandedArea: { marginTop: 12, borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.06)", paddingTop: 12 },
  expandLabel: { fontSize: 12, fontWeight: "600", marginBottom: 8, marginTop: 8 },
  progressBtns: { flexDirection: "row", gap: 8, marginBottom: 12 },
  progressBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center", minHeight: 40, justifyContent: "center" },
  progressBtnText: { fontSize: 11, fontWeight: "700" },
  statusBtns: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 },
  statusBtn: { paddingHorizontal: 12, paddingVertical: 9, borderRadius: 10, minHeight: 38, justifyContent: "center" },
  statusBtnText: { fontSize: 11, fontWeight: "700" },
  notesText: { fontSize: 13, lineHeight: 18, marginBottom: 12 },
  actionRow: { flexDirection: "row", gap: 8 },
  actionBtn: { padding: 12, borderRadius: 12, minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" },
  archiveToggle: { flexDirection: "row", alignItems: "center", gap: 8, justifyContent: "center", paddingVertical: 14, marginTop: 8, borderTopWidth: 1 },
  archiveToggleText: { fontSize: 13, fontWeight: "600" },
  modal: { flex: 1 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.06)" },
  modalTitle: { fontSize: 20, fontWeight: "700" },
  modalBody: { padding: 20 },
  inputLabel: { fontSize: 13, fontWeight: "600", marginBottom: 6, marginTop: 16 },
  input: { padding: 14, fontSize: 15 },
  textarea: { height: 80, textAlignVertical: "top" },
  statusGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  statusOption: { paddingHorizontal: 14, paddingVertical: 8 },
  statusOptionText: { fontSize: 13, fontWeight: "600" },
  categoryRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  categoryBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 10 },
  categoryBtnText: { fontSize: 13, fontWeight: "600" },
  createBtn: { marginTop: 32, paddingVertical: 16, alignItems: "center" },
  createBtnText: { fontSize: 16, fontWeight: "700" },
});
