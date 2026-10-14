import {
  Sunrise,
  Sun,
  CloudSun,
  Sunset,
  Moon,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export type PrayerId = "sabah" | "ogle" | "ikindi" | "aksam" | "yatsi" | "vitir";

export type Prayer = {
  id: PrayerId;
  name: string;
  meta: string;
  accent: string;
  icon: LucideIcon;
};

export const PRAYERS: Prayer[] = [
  { id: "sabah", name: "Sabah", meta: "Fecr vakti", accent: "#38d3ff", icon: Sunrise },
  { id: "ogle", name: "Öğle", meta: "Zuhr vakti", accent: "#4d8dff", icon: Sun },
  { id: "ikindi", name: "İkindi", meta: "Asr vakti", accent: "#2f6bff", icon: CloudSun },
  { id: "aksam", name: "Akşam", meta: "Mağrib vakti", accent: "#5b6cff", icon: Sunset },
  { id: "yatsi", name: "Yatsı", meta: "İşa vakti", accent: "#6a5cff", icon: Moon },
  { id: "vitir", name: "Vitir", meta: "Vâcib namaz", accent: "#1f4fe0", icon: Sparkles },
];
