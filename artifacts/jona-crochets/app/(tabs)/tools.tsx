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
import { useApp } from "@/context/AppContext";
import type { Note, YarnItem } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

type ToolsTab = "calculator" | "stash" | "notes" | "guides";

const HOOK_SIZES = [
  { size: "2.0mm", usCrochet: "B/1", weight: "תחרה / חוט" },
  { size: "2.5mm", usCrochet: "C/2", weight: "דק מאוד" },
  { size: "3.0mm", usCrochet: "D/3", weight: "דק מאוד" },
  { size: "3.5mm", usCrochet: "E/4", weight: "ספורט" },
  { size: "4.0mm", usCrochet: "G/6", weight: "DK" },
  { size: "4.5mm", usCrochet: "7", weight: "DK / וורסטד" },
  { size: "5.0mm", usCrochet: "H/8", weight: "וורסטד" },
  { size: "5.5mm", usCrochet: "I/9", weight: "וורסטד" },
  { size: "6.0mm", usCrochet: "J/10", weight: "עבה" },
  { size: "8.0mm", usCrochet: "L/11", weight: "עבה" },
  { size: "10.0mm", usCrochet: "N/15", weight: "עבה מאוד" },
  { size: "12.0mm", usCrochet: "O/P/16", weight: "ג'מבו" },
];

const STITCH_ABBREVS = [
  { abbrev: "ch", full: "שרשרת (Chain)" },
  { abbrev: "sl st", full: "תפר חלק (Slip Stitch)" },
  { abbrev: "sc", full: "תפר קצר (Single Crochet)" },
  { abbrev: "hdc", full: "חצי כפול (Half Double)" },
  { abbrev: "dc", full: "תפר כפול (Double Crochet)" },
  { abbrev: "tr", full: "תפר משולש (Treble)" },
  { abbrev: "inc", full: "הגדלה (2sc במקום אחד)" },
  { abbrev: "dec", full: "הקטנה (2sc ביחד)" },
  { abbrev: "MR", full: "טבעת קסם (Magic Ring)" },
  { abbrev: "FO", full: "סיום (Fasten Off)" },
  { abbrev: "BLO", full: "לולאה אחורית בלבד" },
  { abbrev: "FLO", full: "לולאה קדמית בלבד" },
  { abbrev: "sp", full: "רווח (Space)" },
  { abbrev: "yo", full: "עטיפת חוט (Yarn Over)" },
  { abbrev: "st", full: "תפר (Stitch)" },
  { abbrev: "rnd", full: "סיבוב (Round)" },
  { abbrev: "rep", full: "חזרה (Repeat)" },
];

const YARN_WEIGHTS = [
  { number: "0", name: "תחרה", hookSize: "1.5–2.25mm", uses: "מפות, תחרה" },
  { number: "1", name: "דק מאוד (Fingering)", hookSize: "2.25–3.5mm", uses: "גרביים, שאלים" },
  { number: "2", name: "ספורט", hookSize: "3.5–4.5mm", uses: "פריטי תינוקות" },
  { number: "3", name: "DK (קל)", hookSize: "4.5–5.5mm", uses: "סוודרים קלים, תיקים" },
  { number: "4", name: "וורסטד (בינוני)", hookSize: "5.5–6.5mm", uses: "סוודרים, שמיכות, אמיגורומי" },
  { number: "5", name: "עבה (Bulky)", hookSize: "6.5–9mm", uses: "שטיחים, צעיפים, כובעים" },
  { number: "6", name: "עבה מאוד", hookSize: "9–15mm", uses: "שמיכות מהירות" },
  { number: "7", name: "ג'מבו", hookSize: "15mm+", uses: "שמיכות ענק" },
];

export default function ToolsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<ToolsTab>("calculator");

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const tabs: { id: ToolsTab; label: string; icon: string; color: string }[] = [
    { id: "calculator", label: "מחשבון", icon: "calculator", color: colors.accent },
    { id: "stash", label: "מלאי חוטים", icon: "palette-swatch-outline", color: colors.sage },
    { id: "notes", label: "הערות", icon: "notebook-outline", color: colors.warning },
    { id: "guides", label: "מדריכים", icon: "book-open-variant", color: colors.lavender },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.accent + "20", colors.background]}
        style={[styles.header, { paddingTop: topPad + 12 }]}
      >
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>כלים</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={[
                styles.tab,
                { backgroundColor: activeTab === tab.id ? tab.color : colors.muted, borderRadius: 20 },
              ]}
            >
              <MaterialCommunityIcons
                name={tab.icon as any}
                size={16}
                color={activeTab === tab.id ? "#fff" : colors.mutedForeground}
              />
              <Text style={[styles.tabText, { color: activeTab === tab.id ? "#fff" : colors.mutedForeground }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LinearGradient>

      {activeTab === "calculator" && <CalculatorTab colors={colors} />}
      {activeTab === "stash" && <StashTab colors={colors} />}
      {activeTab === "notes" && <NotesTab colors={colors} />}
      {activeTab === "guides" && <GuidesTab colors={colors} />}
    </View>
  );
}

function CalculatorTab({ colors }: { colors: any }) {
  const [materialCost, setMaterialCost] = useState("");
  const [yarnCost, setYarnCost] = useState("");
  const [accessoryCost, setAccessoryCost] = useState("");
  const [hours, setHours] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [profitMargin, setProfitMargin] = useState("20");
  const [packagingCost, setPackagingCost] = useState("");
  const [shippingCost, setShippingCost] = useState("");
  const [customOrderFee, setCustomOrderFee] = useState("");
  const [giftMode, setGiftMode] = useState(true);

  const totalMaterials =
    parseFloat(materialCost || "0") +
    parseFloat(yarnCost || "0") +
    parseFloat(accessoryCost || "0") +
    parseFloat(packagingCost || "0") +
    parseFloat(shippingCost || "0");

  const laborCost = parseFloat(hours || "0") * parseFloat(hourlyRate || "0");
  const customFee = parseFloat(customOrderFee || "0");
  const totalCost = totalMaterials + laborCost + customFee;
  const margin = parseFloat(profitMargin || "0") / 100;
  const sellingPrice = giftMode ? totalCost : totalCost / (1 - margin);


  const formatPrice = (v: number) => `₪${v.toFixed(2)}`;

  return (
    <ScrollView contentContainerStyle={[styles.tabContent, { paddingBottom: 110 }]}>
      <View style={[styles.giftToggle, { backgroundColor: colors.muted, borderRadius: colors.radius }]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.giftLabel, { color: colors.foreground }]}>מצב אישי</Text>
          <Text style={[styles.giftDesc, { color: colors.mutedForeground }]}>האפליקציה מותאמת לשימוש אישי ולא למכירה</Text>
        </View>
        <TouchableOpacity
          style={[styles.giftBtn, { backgroundColor: giftMode ? colors.primary : colors.border }]}
          onPress={() => setGiftMode(v => !v)}
        >
          <MaterialCommunityIcons
            name={giftMode ? "gift" : "gift-outline"}
            size={20}
            color={giftMode ? "#fff" : colors.mutedForeground}
          />
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionLabel, { color: colors.foreground }]}>חומרים</Text>
      <CalcInput label="עלות חוטים" value={yarnCost} onChangeText={setYarnCost} colors={colors} />
      <CalcInput label="עלות חומרים" value={materialCost} onChangeText={setMaterialCost} colors={colors} />
      <CalcInput label="אביזרים" value={accessoryCost} onChangeText={setAccessoryCost} colors={colors} />
      <CalcInput label="אריזה" value={packagingCost} onChangeText={setPackagingCost} colors={colors} />
      <CalcInput label="משלוח" value={shippingCost} onChangeText={setShippingCost} colors={colors} />
      <CalcInput label="דמי הזמנה מיוחדת" value={customOrderFee} onChangeText={setCustomOrderFee} colors={colors} />

      <Text style={[styles.sectionLabel, { color: colors.foreground }]}>עבודה</Text>
      <CalcInput label="שעות עבודה" value={hours} onChangeText={setHours} colors={colors} />
      <CalcInput label="תעריף לשעה (₪)" value={hourlyRate} onChangeText={setHourlyRate} colors={colors} />

      {!giftMode && (
        <>
          <Text style={[styles.sectionLabel, { color: colors.foreground }]}>רווח</Text>
          <CalcInput label="אחוז רווח (%)" value={profitMargin} onChangeText={setProfitMargin} colors={colors} />
        </>
      )}

      <View style={[styles.resultCard, { backgroundColor: colors.primary + "15", borderRadius: colors.radius }]}>
        <Text style={[styles.resultTitle, { color: colors.foreground }]}>
          {giftMode ? "עלות הפרויקט" : "הערכת עלות לפרויקט"}
        </Text>
        <Text style={[styles.resultPrice, { color: colors.primary }]}>{formatPrice(sellingPrice)}</Text>

        <View style={styles.breakdown}>
          <BreakdownRow label="סה''כ חומרים" value={formatPrice(totalMaterials)} colors={colors} />
          <BreakdownRow label="עלות עבודה" value={formatPrice(laborCost)} colors={colors} />
          {customFee > 0 && <BreakdownRow label="דמי הזמנה" value={formatPrice(customFee)} colors={colors} />}
          <BreakdownRow label="סה''כ עלות" value={formatPrice(totalCost)} colors={colors} bold />
          {!giftMode && <BreakdownRow label="אחוז רווח" value={`${profitMargin}%`} colors={colors} />}
        </View>
      </View>
    </ScrollView>
  );
}

function CalcInput({ label, value, onChangeText, colors }: { label: string; value: string; onChangeText: (v: string) => void; colors: any }) {
  return (
    <View style={styles.calcRow}>
      <Text style={[styles.calcLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <TextInput
        style={[styles.calcInput, { backgroundColor: colors.muted, color: colors.foreground, borderRadius: 10 }]}
        value={value}
        onChangeText={onChangeText}
        keyboardType="decimal-pad"
        placeholder="0.00"
        placeholderTextColor={colors.mutedForeground}
      />
    </View>
  );
}

function BreakdownRow({ label, value, colors, bold }: { label: string; value: string; colors: any; bold?: boolean }) {
  return (
    <View style={styles.breakdownRow}>
      <Text style={[styles.breakdownLabel, { color: colors.mutedForeground, fontWeight: bold ? "700" : "400" }]}>{label}</Text>
      <Text style={[styles.breakdownValue, { color: colors.foreground, fontWeight: bold ? "800" : "600" }]}>{value}</Text>
    </View>
  );
}

function MarketRow({ label, value, color, colors }: { label: string; value: string; color: string; colors: any }) {
  return (
    <View style={[styles.marketRow, { borderLeftColor: color }]}>
      <Text style={[styles.marketLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.marketValue, { color }]}>{value}</Text>
    </View>
  );
}

function StashTab({ colors }: { colors: any }) {
  const { yarnStash, addYarn, deleteYarn } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [brand, setBrand] = useState("");
  const [colorName, setColorName] = useState("");
  const [type, setType] = useState("");
  const [weight, setWeight] = useState<YarnItem["weight"]>("worsted");
  const [amount, setAmount] = useState("");
  const [hookSize, setHookSize] = useState("");

  const lowStock = yarnStash.filter(y => y.lowStockThreshold && y.amount < y.lowStockThreshold);

  const WEIGHT_COLORS: Record<YarnItem["weight"], string> = {
    lace: colors.lavender,
    fingering: colors.primary,
    sport: colors.accent,
    dk: colors.sage,
    worsted: colors.warning,
    bulky: "#d4a853",
    super_bulky: "#c07d50",
  };

  const WEIGHT_LABELS: Record<YarnItem["weight"], string> = {
    lace: "תחרה",
    fingering: "דק מאוד",
    sport: "ספורט",
    dk: "DK",
    worsted: "וורסטד",
    bulky: "עבה",
    super_bulky: "עבה מאוד",
  };

  const yarnToDelete = yarnStash.find(y => y.id === deleteTarget);

  function handleAdd() {
    if (!brand.trim() || !colorName.trim()) return;
    addYarn({ brand: brand.trim(), colorName: colorName.trim(), type: type.trim(), weight, amount: parseFloat(amount) || 0, unit: "grams", hookSize: hookSize.trim() });
    setBrand(""); setColorName(""); setType(""); setAmount(""); setHookSize("");
    setShowAdd(false);
  }

  return (
    <ScrollView contentContainerStyle={[styles.tabContent, { paddingBottom: 110 }]}>
      <TouchableOpacity
        style={[styles.addStashBtn, { backgroundColor: colors.sage, borderRadius: colors.radius }]}
        onPress={() => setShowAdd(true)}
      >
        <MaterialCommunityIcons name="plus" size={20} color="#fff" />
        <Text style={styles.addStashBtnText}>הוספי חוט</Text>
      </TouchableOpacity>

      {lowStock.length > 0 && (
        <View style={[styles.lowStockBanner, { backgroundColor: colors.warning + "20", borderRadius: colors.radius }]}>
          <MaterialCommunityIcons name="alert-circle-outline" size={18} color={colors.warning} />
          <Text style={[styles.lowStockText, { color: colors.warning }]}>
            {lowStock.length} פריט/ים עם מלאי נמוך
          </Text>
        </View>
      )}

      {yarnStash.length === 0 ? (
        <EmptyState icon="palette-swatch-outline" title="המלאי שלך ריק" subtitle="הוסיפי את אוסף החוטים שלך" />
      ) : (
        yarnStash.map(yarn => (
          <Card key={yarn.id} style={{ marginBottom: 10 }}>
            <View style={styles.yarnHeader}>
              <View style={[styles.yarnColorDot, { backgroundColor: yarn.colorHex || WEIGHT_COLORS[yarn.weight], width: 32, height: 32, borderRadius: 16 }]} />
              <View style={styles.yarnInfo}>
                <Text style={[styles.yarnName, { color: colors.foreground }]}>{yarn.colorName}</Text>
                <Text style={[styles.yarnBrand, { color: colors.mutedForeground }]}>{yarn.brand}</Text>
              </View>
              <View style={styles.yarnMeta}>
                <View style={[styles.weightBadge, { backgroundColor: WEIGHT_COLORS[yarn.weight] + "20" }]}>
                  <Text style={[styles.weightText, { color: WEIGHT_COLORS[yarn.weight] }]}>{WEIGHT_LABELS[yarn.weight]}</Text>
                </View>
                <TouchableOpacity onPress={() => setDeleteTarget(yarn.id)}>
                  <MaterialCommunityIcons name="trash-can-outline" size={18} color={colors.destructive} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.yarnDetails}>
              <Text style={[styles.yarnDetail, { color: colors.mutedForeground }]}>
                {yarn.amount}ג' · {yarn.type || "חוט"}
              </Text>
              {yarn.hookSize && <Text style={[styles.yarnDetail, { color: colors.mutedForeground }]}>מחט: {yarn.hookSize}</Text>}
              {yarn.lowStockThreshold && yarn.amount < yarn.lowStockThreshold && (
                <Text style={[styles.lowStock, { color: colors.warning }]}>מלאי נמוך!</Text>
              )}
            </View>
          </Card>
        ))
      )}

      <ConfirmDialog
        visible={!!deleteTarget}
        title="מחיקת חוט"
        message={`להסיר את ${yarnToDelete?.colorName}?`}
        confirmLabel="מחקי"
        cancelLabel="ביטול"
        destructive
        onConfirm={() => { deleteYarn(deleteTarget!); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
      />

      <Modal visible={showAdd} animationType="slide" presentationStyle="formSheet">
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>הוספת חוט</Text>
            <TouchableOpacity onPress={() => setShowAdd(false)}>
              <MaterialCommunityIcons name="close" size={24} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
          <ScrollView style={{ padding: 20 }}>
            <Text style={[styles.inputLabel, { color: colors.foreground }]}>מותג *</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderRadius: colors.radius }]} value={brand} onChangeText={setBrand} placeholder="למשל: Lion Brand" placeholderTextColor={colors.mutedForeground} />
            <Text style={[styles.inputLabel, { color: colors.foreground }]}>שם הצבע *</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderRadius: colors.radius }]} value={colorName} onChangeText={setColorName} placeholder="למשל: ורוד אבקה" placeholderTextColor={colors.mutedForeground} />
            <Text style={[styles.inputLabel, { color: colors.foreground }]}>סיב</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderRadius: colors.radius }]} value={type} onChangeText={setType} placeholder="למשל: אקריל, כותנה" placeholderTextColor={colors.mutedForeground} />
            <Text style={[styles.inputLabel, { color: colors.foreground }]}>כמות (גרמים)</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderRadius: colors.radius }]} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="200" placeholderTextColor={colors.mutedForeground} />
            <Text style={[styles.inputLabel, { color: colors.foreground }]}>גודל מחט</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderRadius: colors.radius }]} value={hookSize} onChangeText={setHookSize} placeholder="למשל: 5mm" placeholderTextColor={colors.mutedForeground} />
            <TouchableOpacity style={[styles.createBtn, { backgroundColor: colors.sage, borderRadius: colors.radius }]} onPress={handleAdd}>
              <Text style={[styles.createBtnText, { color: "#fff" }]}>הוספי למלאי</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}

function NotesTab({ colors }: { colors: any }) {
  const { notes, addNote, deleteNote } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<Note["category"]>("general");
  const [search, setSearch] = useState("");

  const filtered = notes.filter(
    n => n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase())
  );

  const CAT_COLORS: Record<Note["category"], string> = {
    project: colors.primary,
    stitch: colors.accent,
    pattern: colors.lavender,
    measurement: colors.sage,
    client: colors.warning,
    general: colors.mutedForeground,
  };

  const CAT_LABELS: Record<Note["category"], string> = {
    project: "פרויקט",
    stitch: "תפר",
    pattern: "תבנית",
    measurement: "מידות",
    client: "לקוח",
    general: "כללי",
  };

  const noteToDelete = notes.find(n => n.id === deleteTarget);

  function handleAdd() {
    if (!title.trim() || !content.trim()) return;
    addNote({ title: title.trim(), content: content.trim(), category });
    setTitle(""); setContent(""); setCategory("general");
    setShowAdd(false);
  }

  return (
    <ScrollView contentContainerStyle={[styles.tabContent, { paddingBottom: 110 }]}>
      <View style={[styles.searchBar2, { backgroundColor: colors.muted, borderRadius: colors.radius }]}>
        <MaterialCommunityIcons name="magnify" size={18} color={colors.mutedForeground} />
        <TextInput
          style={[styles.searchInput2, { color: colors.foreground }]}
          placeholder="חפשי הערות..."
          placeholderTextColor={colors.mutedForeground}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <TouchableOpacity
        style={[styles.addStashBtn, { backgroundColor: colors.warning, borderRadius: colors.radius, marginBottom: 12 }]}
        onPress={() => setShowAdd(true)}
      >
        <MaterialCommunityIcons name="plus" size={20} color="#fff" />
        <Text style={styles.addStashBtnText}>הערה חדשה</Text>
      </TouchableOpacity>

      {filtered.length === 0 ? (
        <EmptyState icon="notebook-outline" title="אין הערות עדיין" subtitle="רשמי תבניות, מידות או רעיונות" />
      ) : (
        filtered.map(note => (
          <Card key={note.id} style={{ marginBottom: 10 }}>
            <View style={styles.noteHeader}>
              <View style={[styles.noteCatDot, { backgroundColor: CAT_COLORS[note.category] }]} />
              <Text style={[styles.noteTitle, { color: colors.foreground }]} numberOfLines={1}>{note.title}</Text>
              <TouchableOpacity onPress={() => setDeleteTarget(note.id)}>
                <MaterialCommunityIcons name="trash-can-outline" size={16} color={colors.destructive} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.noteContent, { color: colors.mutedForeground }]} numberOfLines={3}>{note.content}</Text>
            <Text style={[styles.noteDate, { color: colors.mutedForeground }]}>
              {CAT_LABELS[note.category]} · {new Date(note.updatedAt).toLocaleDateString("he-IL")}
            </Text>
          </Card>
        ))
      )}

      <ConfirmDialog
        visible={!!deleteTarget}
        title="מחיקת הערה"
        message={`למחוק את "${noteToDelete?.title}"?`}
        confirmLabel="מחקי"
        cancelLabel="ביטול"
        destructive
        onConfirm={() => { deleteNote(deleteTarget!); setDeleteTarget(null); }}
        onCancel={() => setDeleteTarget(null)}
      />

      <Modal visible={showAdd} animationType="slide" presentationStyle="formSheet">
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>הערה חדשה</Text>
            <TouchableOpacity onPress={() => setShowAdd(false)}>
              <MaterialCommunityIcons name="close" size={24} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
          <ScrollView style={{ padding: 20 }}>
            <Text style={[styles.inputLabel, { color: colors.foreground }]}>כותרת *</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderRadius: colors.radius }]} value={title} onChangeText={setTitle} placeholder="כותרת ההערה" placeholderTextColor={colors.mutedForeground} />
            <Text style={[styles.inputLabel, { color: colors.foreground }]}>קטגוריה</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {(Object.keys(CAT_LABELS) as Note["category"][]).map(c => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setCategory(c)}
                  style={[styles.catChip2, { backgroundColor: category === c ? CAT_COLORS[c] : colors.muted, borderRadius: 16 }]}
                >
                  <Text style={[styles.catChipText2, { color: category === c ? "#fff" : colors.mutedForeground }]}>
                    {CAT_LABELS[c]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={[styles.inputLabel, { color: colors.foreground }]}>תוכן *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderRadius: colors.radius, height: 140, textAlignVertical: "top" }]}
              value={content}
              onChangeText={setContent}
              placeholder="כתבי את ההערה שלך..."
              placeholderTextColor={colors.mutedForeground}
              multiline
            />
            <TouchableOpacity style={[styles.createBtn, { backgroundColor: colors.warning, borderRadius: colors.radius }]} onPress={handleAdd}>
              <Text style={[styles.createBtnText, { color: "#fff" }]}>שמרי הערה</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}

function GuidesTab({ colors }: { colors: any }) {
  const [guideTab, setGuideTab] = useState<"hooks" | "weights" | "stitches">("hooks");

  return (
    <ScrollView contentContainerStyle={[styles.tabContent, { paddingBottom: 110 }]}>
      <View style={[styles.guideTabRow, { backgroundColor: colors.muted, borderRadius: 20 }]}>
        {([
          { id: "hooks", label: "גדלי מחטים" },
          { id: "weights", label: "משקלי חוט" },
          { id: "stitches", label: "קיצורים" },
        ] as { id: typeof guideTab; label: string }[]).map(g => (
          <TouchableOpacity
            key={g.id}
            onPress={() => setGuideTab(g.id)}
            style={[styles.guideTabBtn, { backgroundColor: guideTab === g.id ? colors.lavender : "transparent", borderRadius: 18 }]}
          >
            <Text style={[styles.guideTabText, { color: guideTab === g.id ? "#fff" : colors.mutedForeground }]}>
              {g.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {guideTab === "hooks" && (
        <Card style={styles.guideCard}>
          <View style={styles.guideTableHeader}>
            <Text style={[styles.guideTableHead, { color: colors.primary, flex: 1 }]}>מידה</Text>
            <Text style={[styles.guideTableHead, { color: colors.primary, flex: 1 }]}>US</Text>
            <Text style={[styles.guideTableHead, { color: colors.primary, flex: 1.5 }]}>מתאים ל</Text>
          </View>
          {HOOK_SIZES.map((h, i) => (
            <View key={h.size} style={[styles.guideRow, { backgroundColor: i % 2 === 0 ? "transparent" : colors.muted + "40" }]}>
              <Text style={[styles.guideCell, { color: colors.foreground, flex: 1, fontWeight: "700" }]}>{h.size}</Text>
              <Text style={[styles.guideCell, { color: colors.foreground, flex: 1 }]}>{h.usCrochet}</Text>
              <Text style={[styles.guideCell, { color: colors.mutedForeground, flex: 1.5 }]}>{h.weight}</Text>
            </View>
          ))}
        </Card>
      )}

      {guideTab === "weights" && (
        <View>
          {YARN_WEIGHTS.map(w => (
            <Card key={w.number} style={{ marginBottom: 10 }}>
              <View style={styles.weightRow}>
                <View style={[styles.weightNumber, { backgroundColor: colors.lavender + "20" }]}>
                  <Text style={[styles.weightNumberText, { color: colors.lavender }]}>{w.number}</Text>
                </View>
                <View style={styles.weightInfo}>
                  <Text style={[styles.weightName, { color: colors.foreground }]}>{w.name}</Text>
                  <Text style={[styles.weightHook, { color: colors.mutedForeground }]}>מחט: {w.hookSize}</Text>
                  <Text style={[styles.weightUses, { color: colors.mutedForeground }]}>{w.uses}</Text>
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}

      {guideTab === "stitches" && (
        <Card style={styles.guideCard}>
          <View style={styles.guideTableHeader}>
            <Text style={[styles.guideTableHead, { color: colors.primary, width: 70 }]}>קיצור</Text>
            <Text style={[styles.guideTableHead, { color: colors.primary, flex: 1 }]}>משמעות</Text>
          </View>
          {STITCH_ABBREVS.map((s, i) => (
            <View key={s.abbrev} style={[styles.guideRow, { backgroundColor: i % 2 === 0 ? "transparent" : colors.muted + "40" }]}>
              <Text style={[styles.guideCell, { color: colors.primary, width: 70, fontWeight: "700" }]}>{s.abbrev}</Text>
              <Text style={[styles.guideCell, { color: colors.foreground, flex: 1 }]}>{s.full}</Text>
            </View>
          ))}
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  headerTitle: { fontSize: 28, fontWeight: "700", marginBottom: 14 },
  tabsScroll: {},
  tab: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8 },
  tabText: { fontSize: 13, fontWeight: "600" },
  tabContent: { padding: 16 },
  sectionLabel: { fontSize: 15, fontWeight: "700", marginTop: 16, marginBottom: 8 },
  giftToggle: { flexDirection: "row", alignItems: "center", padding: 14, gap: 10, marginBottom: 8 },
  giftLabel: { fontSize: 15, fontWeight: "700" },
  giftDesc: { fontSize: 12 },
  giftBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  calcRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  calcLabel: { flex: 1, fontSize: 14 },
  calcInput: { width: 110, padding: 10, fontSize: 14, textAlign: "right" },
  resultCard: { padding: 20, marginTop: 20, alignItems: "center" },
  resultTitle: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  resultPrice: { fontSize: 48, fontWeight: "800", letterSpacing: -1, marginBottom: 16 },
  breakdown: { width: "100%", gap: 6 },
  breakdownRow: { flexDirection: "row", justifyContent: "space-between" },
  breakdownLabel: { fontSize: 13 },
  breakdownValue: { fontSize: 13 },
  marketCard: { padding: 16, marginTop: 16, gap: 12 },
  marketTitle: { fontSize: 15, fontWeight: "700", marginBottom: 4 },
  marketRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderLeftWidth: 3, paddingLeft: 10 },
  marketLabel: { fontSize: 13 },
  marketValue: { fontSize: 16, fontWeight: "800" },
  addStashBtn: { flexDirection: "row", alignItems: "center", gap: 8, padding: 14, justifyContent: "center", marginBottom: 16 },
  addStashBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  lowStockBanner: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, marginBottom: 12 },
  lowStockText: { fontSize: 13, fontWeight: "700" },
  yarnHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  yarnColorDot: {},
  yarnInfo: { flex: 1 },
  yarnName: { fontSize: 15, fontWeight: "700" },
  yarnBrand: { fontSize: 12 },
  yarnMeta: { alignItems: "flex-end", gap: 6 },
  weightBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  weightText: { fontSize: 11, fontWeight: "700" },
  yarnDetails: { flexDirection: "row", gap: 12, marginTop: 8, flexWrap: "wrap" },
  yarnDetail: { fontSize: 12 },
  lowStock: { fontSize: 12, fontWeight: "700" },
  searchBar2: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10, marginBottom: 12 },
  searchInput2: { flex: 1, fontSize: 14 },
  noteHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  noteCatDot: { width: 8, height: 8, borderRadius: 4 },
  noteTitle: { flex: 1, fontSize: 15, fontWeight: "700" },
  noteContent: { fontSize: 13, lineHeight: 18, marginTop: 6 },
  noteDate: { fontSize: 11, marginTop: 8 },
  catChip2: { paddingHorizontal: 12, paddingVertical: 7, marginRight: 8 },
  catChipText2: { fontSize: 13, fontWeight: "600" },
  guideTabRow: { flexDirection: "row", padding: 4, marginBottom: 16 },
  guideTabBtn: { flex: 1, paddingVertical: 8, alignItems: "center" },
  guideTabText: { fontSize: 12, fontWeight: "700" },
  guideCard: { padding: 0 },
  guideTableHeader: { flexDirection: "row", padding: 12, borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.06)" },
  guideTableHead: { fontSize: 12, fontWeight: "700", textTransform: "uppercase" },
  guideRow: { flexDirection: "row", paddingVertical: 10, paddingHorizontal: 12 },
  guideCell: { fontSize: 13 },
  weightRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  weightNumber: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  weightNumberText: { fontSize: 18, fontWeight: "800" },
  weightInfo: { flex: 1 },
  weightName: { fontSize: 14, fontWeight: "700" },
  weightHook: { fontSize: 12, marginTop: 2 },
  weightUses: { fontSize: 12 },
  modal: { flex: 1 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.06)" },
  modalTitle: { fontSize: 20, fontWeight: "700" },
  inputLabel: { fontSize: 13, fontWeight: "600", marginBottom: 6, marginTop: 16 },
  input: { padding: 14, fontSize: 15 },
  createBtn: { marginTop: 32, paddingVertical: 16, alignItems: "center" },
  createBtnText: { fontSize: 16, fontWeight: "700" },
});
