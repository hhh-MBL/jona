import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface Counter {
  id: string;
  name: string;
  count: number;
  target?: number;
  notes?: string;
  type: "rows" | "stitches" | "rounds" | "repeats";
  projectId?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  status: "planning" | "in_progress" | "paused" | "finished";
  startDate: string;
  deadline?: string;
  notes?: string;
  materials?: string;
  patternLink?: string;
  progress: number;
  isGift: boolean;
  isSaleItem: boolean;
  isPersonal: boolean;
  category: "gift" | "sale" | "personal";
  image?: string;
  counterId?: string;
  archived: boolean;
  createdAt: string;
}

export interface YarnItem {
  id: string;
  brand: string;
  colorName: string;
  colorHex?: string;
  type: string;
  weight: "lace" | "fingering" | "sport" | "dk" | "worsted" | "bulky" | "super_bulky";
  amount: number;
  unit: "grams" | "meters" | "yards";
  hookSize?: string;
  notes?: string;
  lowStockThreshold?: number;
  projectId?: string;
  createdAt: string;
}

export interface WishlistItem {
  id: string;
  title: string;
  description?: string;
  priority: "low" | "medium" | "high";
  tag: "weekend" | "gift" | "big_project" | "seasonal" | "other";
  libraryItemId?: string;
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: "project" | "stitch" | "pattern" | "measurement" | "client" | "general";
  projectId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  type: "project" | "materials" | "deadline" | "daily" | "weekly";
  date?: string;
  done: boolean;
  createdAt: string;
}

export interface UserProfile {
  name: string;
  avatar?: string;
  joinDate: string;
  bio?: string;
}

interface AppContextType {
  counters: Counter[];
  projects: Project[];
  yarnStash: YarnItem[];
  wishlist: WishlistItem[];
  notes: Note[];
  reminders: Reminder[];
  profile: UserProfile;
  favorites: string[];

  addCounter: (c: Omit<Counter, "id" | "createdAt">) => void;
  updateCounter: (id: string, data: Partial<Counter>) => void;
  deleteCounter: (id: string) => void;

  addProject: (p: Omit<Project, "id" | "createdAt">) => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  addYarn: (y: Omit<YarnItem, "id" | "createdAt">) => void;
  updateYarn: (id: string, data: Partial<YarnItem>) => void;
  deleteYarn: (id: string) => void;

  addWishlistItem: (w: Omit<WishlistItem, "id" | "createdAt">) => void;
  updateWishlistItem: (id: string, data: Partial<WishlistItem>) => void;
  deleteWishlistItem: (id: string) => void;

  addNote: (n: Omit<Note, "id" | "createdAt" | "updatedAt">) => void;
  updateNote: (id: string, data: Partial<Note>) => void;
  deleteNote: (id: string) => void;

  addReminder: (r: Omit<Reminder, "id" | "createdAt">) => void;
  updateReminder: (id: string, data: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;

  updateProfile: (data: Partial<UserProfile>) => void;
  toggleFavorite: (libraryItemId: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

const genId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

const SAMPLE_PROJECTS: Project[] = [
  {
    id: "p1",
    name: "ארנב אביב אמיגורומי",
    status: "in_progress",
    startDate: "2026-03-15",
    deadline: "2026-04-20",
    notes: "מתנה לפסח. חוט ורוד פסטל.",
    materials: "חוט DK ורוד, עיניות בטיחות 10mm, מילוי פוליאסטר",
    patternLink: "",
    progress: 65,
    isGift: true,
    isSaleItem: false,
    isPersonal: false,
    category: "gift",
    archived: false,
    createdAt: "2026-03-15T10:00:00.000Z",
  },
  {
    id: "p2",
    name: "תיק שוק עם פרחים",
    status: "planning",
    startDate: "2026-04-01",
    notes: "פרויקט קיץ. חוט כותנה ירוק מרווה.",
    materials: "חוט כותנה וורסטד, מחט 5mm",
    patternLink: "",
    progress: 0,
    isGift: false,
    isSaleItem: true,
    isPersonal: false,
    category: "sale",
    archived: false,
    createdAt: "2026-04-01T09:00:00.000Z",
  },
];

const SAMPLE_YARN: YarnItem[] = [
  {
    id: "y1",
    brand: "Lion Brand",
    colorName: "ורוד אבקה",
    colorHex: "#c27d82",
    type: "אקריל",
    weight: "worsted",
    amount: 200,
    unit: "grams",
    hookSize: "5mm",
    createdAt: "2026-01-10T10:00:00.000Z",
  },
  {
    id: "y2",
    brand: "Paintbox Simply",
    colorName: "ירוק מרווה",
    colorHex: "#8faa8b",
    type: "כותנה",
    weight: "dk",
    amount: 150,
    unit: "grams",
    hookSize: "4mm",
    createdAt: "2026-02-05T10:00:00.000Z",
  },
  {
    id: "y3",
    brand: "Drops",
    colorName: "קרם",
    colorHex: "#f5ead9",
    type: "צמר מרינו",
    weight: "fingering",
    amount: 50,
    unit: "grams",
    hookSize: "2.5mm",
    lowStockThreshold: 100,
    createdAt: "2026-02-20T10:00:00.000Z",
  },
];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [counters, setCounters] = useState<Counter[]>([]);
  const [projects, setProjects] = useState<Project[]>(SAMPLE_PROJECTS);
  const [yarnStash, setYarnStash] = useState<YarnItem[]>(SAMPLE_YARN);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    joinDate: new Date().toISOString(),
    bio: "",
  });

  useEffect(() => { loadData(); }, []);
  useEffect(() => { saveData(); }, [counters, projects, yarnStash, wishlist, notes, reminders, favorites, profile]);

  async function loadData() {
    try {
      const keys = ["counters", "projects", "yarnStash", "wishlist", "notes", "reminders", "favorites", "profile"];
      const results = await AsyncStorage.multiGet(keys);
      results.forEach(([key, value]) => {
        if (!value) return;
        const parsed = JSON.parse(value);
        if (key === "counters") setCounters(parsed);
        if (key === "projects") setProjects(parsed);
        if (key === "yarnStash") setYarnStash(parsed);
        if (key === "wishlist") setWishlist(parsed);
        if (key === "notes") setNotes(parsed);
        if (key === "reminders") setReminders(parsed);
        if (key === "favorites") setFavorites(parsed);
        if (key === "profile") setProfile(parsed);
      });
    } catch (e) {}
  }

  async function saveData() {
    try {
      await AsyncStorage.multiSet([
        ["counters", JSON.stringify(counters)],
        ["projects", JSON.stringify(projects)],
        ["yarnStash", JSON.stringify(yarnStash)],
        ["wishlist", JSON.stringify(wishlist)],
        ["notes", JSON.stringify(notes)],
        ["reminders", JSON.stringify(reminders)],
        ["favorites", JSON.stringify(favorites)],
        ["profile", JSON.stringify(profile)],
      ]);
    } catch (e) {}
  }

  const addCounter = (c: Omit<Counter, "id" | "createdAt">) =>
    setCounters(prev => [...prev, { ...c, id: genId(), createdAt: new Date().toISOString() }]);
  const updateCounter = (id: string, data: Partial<Counter>) =>
    setCounters(prev => prev.map(c => (c.id === id ? { ...c, ...data } : c)));
  const deleteCounter = (id: string) => setCounters(prev => prev.filter(c => c.id !== id));

  const addProject = (p: Omit<Project, "id" | "createdAt">) =>
    setProjects(prev => [...prev, { ...p, id: genId(), createdAt: new Date().toISOString() }]);
  const updateProject = (id: string, data: Partial<Project>) =>
    setProjects(prev => prev.map(p => (p.id === id ? { ...p, ...data } : p)));
  const deleteProject = (id: string) => setProjects(prev => prev.filter(p => p.id !== id));

  const addYarn = (y: Omit<YarnItem, "id" | "createdAt">) =>
    setYarnStash(prev => [...prev, { ...y, id: genId(), createdAt: new Date().toISOString() }]);
  const updateYarn = (id: string, data: Partial<YarnItem>) =>
    setYarnStash(prev => prev.map(y => (y.id === id ? { ...y, ...data } : y)));
  const deleteYarn = (id: string) => setYarnStash(prev => prev.filter(y => y.id !== id));

  const addWishlistItem = (w: Omit<WishlistItem, "id" | "createdAt">) =>
    setWishlist(prev => [...prev, { ...w, id: genId(), createdAt: new Date().toISOString() }]);
  const updateWishlistItem = (id: string, data: Partial<WishlistItem>) =>
    setWishlist(prev => prev.map(w => (w.id === id ? { ...w, ...data } : w)));
  const deleteWishlistItem = (id: string) => setWishlist(prev => prev.filter(w => w.id !== id));

  const addNote = (n: Omit<Note, "id" | "createdAt" | "updatedAt">) =>
    setNotes(prev => [...prev, { ...n, id: genId(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]);
  const updateNote = (id: string, data: Partial<Note>) =>
    setNotes(prev => prev.map(n => (n.id === id ? { ...n, ...data, updatedAt: new Date().toISOString() } : n)));
  const deleteNote = (id: string) => setNotes(prev => prev.filter(n => n.id !== id));

  const addReminder = (r: Omit<Reminder, "id" | "createdAt">) =>
    setReminders(prev => [...prev, { ...r, id: genId(), createdAt: new Date().toISOString() }]);
  const updateReminder = (id: string, data: Partial<Reminder>) =>
    setReminders(prev => prev.map(r => (r.id === id ? { ...r, ...data } : r)));
  const deleteReminder = (id: string) => setReminders(prev => prev.filter(r => r.id !== id));

  const updateProfile = (data: Partial<UserProfile>) => setProfile(prev => ({ ...prev, ...data }));
  const toggleFavorite = (libraryItemId: string) =>
    setFavorites(prev =>
      prev.includes(libraryItemId) ? prev.filter(id => id !== libraryItemId) : [...prev, libraryItemId]
    );

  return (
    <AppContext.Provider value={{
      counters, projects, yarnStash, wishlist, notes, reminders, profile, favorites,
      addCounter, updateCounter, deleteCounter,
      addProject, updateProject, deleteProject,
      addYarn, updateYarn, deleteYarn,
      addWishlistItem, updateWishlistItem, deleteWishlistItem,
      addNote, updateNote, deleteNote,
      addReminder, updateReminder, deleteReminder,
      updateProfile, toggleFavorite,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
