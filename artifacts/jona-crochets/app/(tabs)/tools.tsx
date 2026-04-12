import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Alert,
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
import type { Note, YarnItem } from "@/context/AppContext";
import { useColors } from "@/hooks/useColors";

type ToolsTab = "calculator" | "stash" | "notes" | "guides";

const HOOK_SIZES = [
  { size: "2.0mm", usCrochet: "B/1", weight: "Lace/Thread" },
  { size: "2.5mm", usCrochet: "C/2", weight: "Fingering" },
  { size: "3.0mm", usCrochet: "D/3", weight: "Fingering" },
  { size: "3.5mm", usCrochet: "E/4", weight: "Sport" },
  { size: "4.0mm", usCrochet: "G/6", weight: "DK" },
  { size: "4.5mm", usCrochet: "7", weight: "DK/Worsted" },
  { size: "5.0mm", usCrochet: "H/8", weight: "Worsted" },
  { size: "5.5mm", usCrochet: "I/9", weight: "Worsted" },
  { size: "6.0mm", usCrochet: "J/10", weight: "Bulky" },
  { size: "8.0mm", usCrochet: "L/11", weight: "Bulky" },
  { size: "10.0mm", usCrochet: "N/15", weight: "Super Bulky" },
  { size: "12.0mm", usCrochet: "O/P/16", weight: "Super Bulky" },
];

const STITCH_ABBREVS = [
  { abbrev: "ch", full: "Chain" },
  { abbrev: "sl st", full: "Slip Stitch" },
  { abbrev: "sc", full: "Single Crochet" },
  { abbrev: "hdc", full: "Half Double Crochet" },
  { abbrev: "dc", full: "Double Crochet" },
  { abbrev: "tr", full: "Treble Crochet" },
  { abbrev: "dtr", full: "Double Treble Crochet" },
  { abbrev: "inc", full: "Increase (2sc in one)" },
  { abbrev: "dec", full: "Decrease (2sc together)" },
  { abbrev: "MR", full: "Magic Ring" },
  { abbrev: "FO", full: "Fasten Off" },
  { abbrev: "BLO", full: "Back Loop Only" },
  { abbrev: "FLO", full: "Front Loop Only" },
  { abbrev: "sp", full: "Space" },
  { abbrev: "yo", full: "Yarn Over" },
  { abbrev: "st", full: "Stitch" },
  { abbrev: "rnd", full: "Round" },
  { abbrev: "rep", full: "Repeat" },
  { abbrev: "RS", full: "Right Side" },
  { abbrev: "WS", full: "Wrong Side" },
];

const YARN_WEIGHTS = [
  { number: "0", name: "Lace / Thread", hookSize: "1.5–2.25mm", uses: "Doilies, lace" },
  { number: "1", name: "Super Fine / Fingering", hookSize: "2.25–3.5mm", uses: "Socks, shawls" },
  { number: "2", name: "Fine / Sport", hookSize: "3.5–4.5mm", uses: "Baby items, light garments" },
  { number: "3", name: "Light / DK", hookSize: "4.5–5.5mm", uses: "Light sweaters, bags" },
  { number: "4", name: "Medium / Worsted", hookSize: "5.5–6.5mm", uses: "Sweaters, blankets, amigurumi" },
  { number: "5", name: "Bulky", hookSize: "6.5–9mm", uses: "Rugs, scarves, hats" },
  { number: "6", name: "Super Bulky", hookSize: "9–15mm", uses: "Quick blankets, thick scarves" },
  { number: "7", name: "Jumbo", hookSize: "15mm+", uses: "Arm knitting, giant throws" },
];

export default function ToolsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<ToolsTab>("calculator");

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const tabs: { id: ToolsTab; label: string; icon: string; color: string }[] = [
    { id: "calculator", label: "Calculator", icon: "calculator", color: colors.accent },
    { id: "stash", label: "Yarn Stash", icon: "palette-swatch-outline", color: colors.sage },
    { id: "notes", label: "Notes", icon: "notebook-outline", color: colors.warning },
    { id: "guides", label: "Guides", icon: "book-open-variant", color: colors.lavender },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[colors.accent + "20", colors.background]}
        style={[styles.header, { paddingTop: topPad + 12 }]}
      >
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Tools</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={[
                styles.tab,
                {
                  backgroundColor: activeTab === tab.id ? tab.color : colors.muted,
                  borderRadius: 20,
                },
              ]}
            >
              <MaterialCommunityIcons
                name={tab.icon as any}
                size={16}
                color={activeTab === tab.id ? "#fff" : colors.mutedForeground}
              />
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === tab.id ? "#fff" : colors.mutedForeground },
                ]}
              >
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
  const [giftMode, setGiftMode] = useState(false);

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

  const low = sellingPrice * 0.85;
  const standard = sellingPrice;
  const premium = sellingPrice * 1.25;

  const formatPrice = (v: number) => `$${v.toFixed(2)}`;

  return (
    <ScrollView contentContainerStyle={[styles.tabContent, { paddingBottom: 110 }]}>
      <View style={[styles.giftToggle, { backgroundColor: colors.muted, borderRadius: colors.radius }]}>
        <Text style={[styles.giftLabel, { color: colors.foreground }]}>Gift Mode</Text>
        <Text style={[styles.giftDesc, { color: colors.mutedForeground }]}>
          Shows cost only, no profit
        </Text>
        <TouchableOpacity
          style={[
            styles.giftBtn,
            { backgroundColor: giftMode ? colors.primary : colors.border },
          ]}
          onPress={() => setGiftMode(v => !v)}
        >
          <MaterialCommunityIcons
            name={giftMode ? "gift" : "gift-outline"}
            size={20}
            color={giftMode ? "#fff" : colors.mutedForeground}
          />
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Materials</Text>
      <CalcInput label="Yarn Cost" value={yarnCost} onChangeText={setYarnCost} colors={colors} />
      <CalcInput label="Materials Cost" value={materialCost} onChangeText={setMaterialCost} colors={colors} />
      <CalcInput label="Accessories" value={accessoryCost} onChangeText={setAccessoryCost} colors={colors} />
      <CalcInput label="Packaging" value={packagingCost} onChangeText={setPackagingCost} colors={colors} />
      <CalcInput label="Shipping" value={shippingCost} onChangeText={setShippingCost} colors={colors} />
      <CalcInput label="Custom Order Fee" value={customOrderFee} onChangeText={setCustomOrderFee} colors={colors} />

      <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Labor</Text>
      <CalcInput label="Hours Worked" value={hours} onChangeText={setHours} colors={colors} />
      <CalcInput label="Hourly Rate ($)" value={hourlyRate} onChangeText={setHourlyRate} colors={colors} />

      {!giftMode && (
        <>
          <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Profit</Text>
          <CalcInput
            label="Profit Margin (%)"
            value={profitMargin}
            onChangeText={setProfitMargin}
            colors={colors}
          />
        </>
      )}

      <View style={[styles.resultCard, { backgroundColor: colors.primary + "15", borderRadius: colors.radius }]}>
        <Text style={[styles.resultTitle, { color: colors.foreground }]}>
          {giftMode ? "Project Cost" : "Recommended Price"}
        </Text>
        <Text style={[styles.resultPrice, { color: colors.primary }]}>{formatPrice(sellingPrice)}</Text>

        <View style={styles.breakdown}>
          <BreakdownRow label="Total Materials" value={formatPrice(totalMaterials)} colors={colors} />
          <BreakdownRow label="Labor Cost" value={formatPrice(laborCost)} colors={colors} />
          {customFee > 0 && <BreakdownRow label="Custom Order Fee" value={formatPrice(customFee)} colors={colors} />}
          <BreakdownRow label="Total Cost" value={formatPrice(totalCost)} colors={colors} bold />
          {!giftMode && <BreakdownRow label="Profit Margin" value={`${profitMargin}%`} colors={colors} />}
        </View>
      </View>

      {!giftMode && totalCost > 0 && (
        <View style={[styles.marketCard, { backgroundColor: colors.muted, borderRadius: colors.radius }]}>
          <Text style={[styles.marketTitle, { color: colors.foreground }]}>Market Suggestions</Text>
          <MarketRow label="Budget / Low" value={formatPrice(low)} color={colors.accent} colors={colors} />
          <MarketRow label="Standard" value={formatPrice(standard)} color={colors.primary} colors={colors} />
          <MarketRow label="Premium" value={formatPrice(premium)} color={colors.lavender} colors={colors} />
        </View>
      )}
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
      <Text style={[styles.breakdownLabel, { color: colors.mutedForeground, fontWeight: bold ? "700" : "400" }]}>
        {label}
      </Text>
      <Text style={[styles.breakdownValue, { color: colors.foreground, fontWeight: bold ? "800" : "600" }]}>
        {value}
      </Text>
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

  function handleAdd() {
    if (!brand.trim() || !colorName.trim()) return;
    addYarn({
      brand: brand.trim(),
      colorName: colorName.trim(),
      type: type.trim(),
      weight,
      amount: parseFloat(amount) || 0,
      unit: "grams",
      hookSize: hookSize.trim(),
    });
    setBrand("");
    setColorName("");
    setType("");
    setAmount("");
    setHookSize("");
    setShowAdd(false);
  }

  return (
    <ScrollView contentContainerStyle={[styles.tabContent, { paddingBottom: 110 }]}>
      <TouchableOpacity
        style={[styles.addStashBtn, { backgroundColor: colors.sage, borderRadius: colors.radius }]}
        onPress={() => setShowAdd(true)}
      >
        <MaterialCommunityIcons name="plus" size={20} color="#fff" />
        <Text style={styles.addStashBtnText}>Add Yarn</Text>
      </TouchableOpacity>

      {lowStock.length > 0 && (
        <View style={[styles.lowStockBanner, { backgroundColor: colors.warning + "20", borderRadius: colors.radius }]}>
          <MaterialCommunityIcons name="alert-circle-outline" size={18} color={colors.warning} />
          <Text style={[styles.lowStockText, { color: colors.warning }]}>
            {lowStock.length} item(s) running low
          </Text>
        </View>
      )}

      {yarnStash.length === 0 ? (
        <EmptyState
          icon="palette-swatch"
          title="Your stash is empty"
          subtitle="Add your yarn collection to track what you have"
        />
      ) : (
        yarnStash.map(yarn => (
          <Card key={yarn.id} style={{ marginBottom: 10 }}>
            <View style={styles.yarnHeader}>
              <View style={[styles.yarnColorDot, {
                backgroundColor: yarn.colorHex || WEIGHT_COLORS[yarn.weight],
                width: 32,
                height: 32,
                borderRadius: 16,
              }]} />
              <View style={styles.yarnInfo}>
                <Text style={[styles.yarnName, { color: colors.foreground }]}>{yarn.colorName}</Text>
                <Text style={[styles.yarnBrand, { color: colors.mutedForeground }]}>{yarn.brand}</Text>
              </View>
              <View style={styles.yarnMeta}>
                <View style={[styles.weightBadge, { backgroundColor: WEIGHT_COLORS[yarn.weight] + "20" }]}>
                  <Text style={[styles.weightText, { color: WEIGHT_COLORS[yarn.weight] }]}>
                    {yarn.weight}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => Alert.alert("Delete Yarn", `Remove ${yarn.colorName}?`, [
                  { text: "Cancel", style: "cancel" },
                  { text: "Delete", style: "destructive", onPress: () => deleteYarn(yarn.id) },
                ])}>
                  <MaterialCommunityIcons name="trash-can-outline" size={18} color={colors.destructive} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.yarnDetails}>
              <Text style={[styles.yarnDetail, { color: colors.mutedForeground }]}>
                {yarn.amount}{yarn.unit} · {yarn.type || "Yarn"}
              </Text>
              {yarn.hookSize && (
                <Text style={[styles.yarnDetail, { color: colors.mutedForeground }]}>
                  Hook: {yarn.hookSize}
                </Text>
              )}
              {yarn.lowStockThreshold && yarn.amount < yarn.lowStockThreshold && (
                <Text style={[styles.lowStock, { color: colors.warning }]}>Low stock!</Text>
              )}
            </View>
          </Card>
        ))
      )}

      <Modal visible={showAdd} animationType="slide" presentationStyle="formSheet">
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Add Yarn</Text>
            <TouchableOpacity onPress={() => setShowAdd(false)}>
              <MaterialCommunityIcons name="close" size={24} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
          <ScrollView style={{ padding: 20 }}>
            <Text style={[styles.inputLabel, { color: colors.foreground }]}>Brand *</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderRadius: colors.radius }]} value={brand} onChangeText={setBrand} placeholder="e.g. Lion Brand" placeholderTextColor={colors.mutedForeground} />
            <Text style={[styles.inputLabel, { color: colors.foreground }]}>Color Name *</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderRadius: colors.radius }]} value={colorName} onChangeText={setColorName} placeholder="e.g. Dusty Rose" placeholderTextColor={colors.mutedForeground} />
            <Text style={[styles.inputLabel, { color: colors.foreground }]}>Fiber Type</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderRadius: colors.radius }]} value={type} onChangeText={setType} placeholder="e.g. Acrylic, Cotton" placeholderTextColor={colors.mutedForeground} />
            <Text style={[styles.inputLabel, { color: colors.foreground }]}>Amount (grams)</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderRadius: colors.radius }]} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="200" placeholderTextColor={colors.mutedForeground} />
            <Text style={[styles.inputLabel, { color: colors.foreground }]}>Hook Size</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderRadius: colors.radius }]} value={hookSize} onChangeText={setHookSize} placeholder="e.g. 5mm" placeholderTextColor={colors.mutedForeground} />
            <TouchableOpacity style={[styles.createBtn, { backgroundColor: colors.sage, borderRadius: colors.radius }]} onPress={handleAdd}>
              <Text style={[styles.createBtnText, { color: "#fff" }]}>Add to Stash</Text>
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
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<Note["category"]>("general");
  const [search, setSearch] = useState("");

  const filtered = notes.filter(
    n =>
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase())
  );

  const CAT_COLORS: Record<Note["category"], string> = {
    project: colors.primary,
    stitch: colors.accent,
    pattern: colors.lavender,
    measurement: colors.sage,
    client: colors.warning,
    general: colors.mutedForeground,
  };

  function handleAdd() {
    if (!title.trim() || !content.trim()) return;
    addNote({ title: title.trim(), content: content.trim(), category });
    setTitle("");
    setContent("");
    setCategory("general");
    setShowAdd(false);
  }

  return (
    <ScrollView contentContainerStyle={[styles.tabContent, { paddingBottom: 110 }]}>
      <View style={[styles.searchBar2, { backgroundColor: colors.muted, borderRadius: colors.radius }]}>
        <MaterialCommunityIcons name="magnify" size={18} color={colors.mutedForeground} />
        <TextInput
          style={[styles.searchInput2, { color: colors.foreground }]}
          placeholder="Search notes..."
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
        <Text style={styles.addStashBtnText}>New Note</Text>
      </TouchableOpacity>

      {filtered.length === 0 ? (
        <EmptyState icon="notebook-outline" title="No notes yet" subtitle="Jot down patterns, measurements, or ideas" />
      ) : (
        filtered.map(note => (
          <Card key={note.id} style={{ marginBottom: 10 }}>
            <View style={styles.noteHeader}>
              <View style={[styles.noteCatDot, { backgroundColor: CAT_COLORS[note.category] }]} />
              <Text style={[styles.noteTitle, { color: colors.foreground }]} numberOfLines={1}>{note.title}</Text>
              <TouchableOpacity onPress={() => Alert.alert("Delete Note", `Delete "${note.title}"?`, [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => deleteNote(note.id) },
              ])}>
                <MaterialCommunityIcons name="trash-can-outline" size={16} color={colors.destructive} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.noteContent, { color: colors.mutedForeground }]} numberOfLines={3}>
              {note.content}
            </Text>
            <Text style={[styles.noteDate, { color: colors.mutedForeground }]}>
              {note.category} · {new Date(note.updatedAt).toLocaleDateString()}
            </Text>
          </Card>
        ))
      )}

      <Modal visible={showAdd} animationType="slide" presentationStyle="formSheet">
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>New Note</Text>
            <TouchableOpacity onPress={() => setShowAdd(false)}>
              <MaterialCommunityIcons name="close" size={24} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>
          <ScrollView style={{ padding: 20 }}>
            <Text style={[styles.inputLabel, { color: colors.foreground }]}>Title *</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderRadius: colors.radius }]} value={title} onChangeText={setTitle} placeholder="Note title" placeholderTextColor={colors.mutedForeground} />
            <Text style={[styles.inputLabel, { color: colors.foreground }]}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {(["general", "project", "stitch", "pattern", "measurement", "client"] as Note["category"][]).map(c => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setCategory(c)}
                  style={[styles.catChip2, { backgroundColor: category === c ? CAT_COLORS[c] : colors.muted, borderRadius: 16 }]}
                >
                  <Text style={[styles.catChipText2, { color: category === c ? "#fff" : colors.mutedForeground }]}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={[styles.inputLabel, { color: colors.foreground }]}>Content *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderRadius: colors.radius, height: 140, textAlignVertical: "top" }]}
              value={content}
              onChangeText={setContent}
              placeholder="Write your note..."
              placeholderTextColor={colors.mutedForeground}
              multiline
            />
            <TouchableOpacity style={[styles.createBtn, { backgroundColor: colors.warning, borderRadius: colors.radius }]} onPress={handleAdd}>
              <Text style={[styles.createBtnText, { color: "#fff" }]}>Save Note</Text>
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
        {(["hooks", "weights", "stitches"] as const).map(g => (
          <TouchableOpacity
            key={g}
            onPress={() => setGuideTab(g)}
            style={[
              styles.guideTabBtn,
              { backgroundColor: guideTab === g ? colors.lavender : "transparent", borderRadius: 18 },
            ]}
          >
            <Text style={[styles.guideTabText, { color: guideTab === g ? "#fff" : colors.mutedForeground }]}>
              {g === "hooks" ? "Hook Sizes" : g === "weights" ? "Yarn Weights" : "Stitches"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {guideTab === "hooks" && (
        <Card style={styles.guideCard}>
          <View style={styles.guideTableHeader}>
            <Text style={[styles.guideTableHead, { color: colors.primary, flex: 1 }]}>Metric</Text>
            <Text style={[styles.guideTableHead, { color: colors.primary, flex: 1 }]}>US Size</Text>
            <Text style={[styles.guideTableHead, { color: colors.primary, flex: 1.5 }]}>Best For</Text>
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
                  <Text style={[styles.weightHook, { color: colors.mutedForeground }]}>Hook: {w.hookSize}</Text>
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
            <Text style={[styles.guideTableHead, { color: colors.primary, width: 70 }]}>Abbrev.</Text>
            <Text style={[styles.guideTableHead, { color: colors.primary, flex: 1 }]}>Full Name</Text>
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
  giftLabel: { fontSize: 15, fontWeight: "700", flex: 1 },
  giftDesc: { fontSize: 12, flex: 2 },
  giftBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  calcRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  calcLabel: { flex: 1, fontSize: 14 },
  calcInput: { width: 100, padding: 10, fontSize: 14, textAlign: "right" },
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
  weightText: { fontSize: 11, fontWeight: "700", textTransform: "capitalize" },
  yarnDetails: { flexDirection: "row", gap: 12, marginTop: 8, flexWrap: "wrap" },
  yarnDetail: { fontSize: 12 },
  lowStock: { fontSize: 12, fontWeight: "700" },
  searchBar2: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10, marginBottom: 12 },
  searchInput2: { flex: 1, fontSize: 14 },
  noteHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  noteCatDot: { width: 8, height: 8, borderRadius: 4 },
  noteTitle: { flex: 1, fontSize: 15, fontWeight: "700" },
  noteContent: { fontSize: 13, lineHeight: 18, marginTop: 6 },
  noteDate: { fontSize: 11, marginTop: 8, textTransform: "capitalize" },
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
