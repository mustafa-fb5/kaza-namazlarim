"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/use-auth";
import type { PrayerId } from "@/lib/prayers";

const STORAGE_KEY = "kaza-namaz-v1";
export const MAX_COUNT = 999_999;

type Store = {
  counts: Partial<Record<PrayerId, number>>;
  day: string;
  today: number;
};

const todayKey = () => new Date().toLocaleDateString("sv-SE");

const empty = (): Store => ({ counts: {}, day: todayKey(), today: 0 });

function readLocal(): Store {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty();
    const data = JSON.parse(raw) as Store;
    if (data.day !== todayKey()) return { ...data, day: todayKey(), today: 0 };
    return { counts: data.counts ?? {}, day: data.day, today: data.today ?? 0 };
  } catch {
    return empty();
  }
}

const clamp = (v: number) =>
  Math.max(0, Math.min(MAX_COUNT, Math.floor(Number.isFinite(v) ? v : 0)));

export function useKazaStore() {
  const { user } = useAuth();
  const [store, setStore] = useState<Store>(() => ({ counts: {}, day: "", today: 0 }));
  const [ready, setReady] = useState(false);
  const isSyncingFromRemote = useRef(false);

  // İstemcide ilk açılışta localStorage oku
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage yalnızca istemcide okunabilir
    setStore(readLocal());
    setReady(true);
  }, []);

  // Firebase Firestore eşitlemesi (Kullanıcı giriş yaptığında)
  useEffect(() => {
    if (!user) return;

    const userDocRef = doc(db, "users", user.uid);

    // İlk girişte mevcut Firestore verisini çek
    getDoc(userDocRef).then((snap) => {
      if (snap.exists()) {
        const data = snap.data() as Partial<Store>;
        setStore((prev) => {
          const day = todayKey();
          const merged: Store = {
            counts: { ...prev.counts, ...(data.counts ?? {}) },
            day,
            today: data.day === day ? (data.today ?? 0) : 0,
          };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          return merged;
        });
      } else {
        // Kullanıcının henüz bulutta verisi yoksa yerel veriyi buluta aktar
        const current = readLocal();
        setDoc(userDocRef, current, { merge: true }).catch(console.error);
      }
    });

    // Realtime dinleyici
    const unsub = onSnapshot(userDocRef, (snap) => {
      if (snap.exists()) {
        isSyncingFromRemote.current = true;
        const data = snap.data() as Partial<Store>;
        const day = todayKey();
        setStore({
          counts: data.counts ?? {},
          day,
          today: data.day === day ? (data.today ?? 0) : 0,
        });
        setTimeout(() => {
          isSyncingFromRemote.current = false;
        }, 100);
      }
    });

    return () => unsub();
  }, [user]);

  // Store değiştiğinde localStorage ve Firestore'a kaydet
  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));

    if (user && !isSyncingFromRemote.current) {
      const userDocRef = doc(db, "users", user.uid);
      setDoc(userDocRef, store, { merge: true }).catch(console.error);
    }
  }, [store, ready, user]);

  const setCount = useCallback((id: PrayerId, value: number, track = false) => {
    setStore((s) => {
      const prev = s.counts[id] ?? 0;
      const next = clamp(value);
      if (next === prev) return s;
      const today = track ? Math.max(0, s.today + (prev - next)) : s.today;
      return { ...s, today, counts: { ...s.counts, [id]: next } };
    });
  }, []);

  const step = useCallback(
    (id: PrayerId, delta: number) =>
      setStore((s) => {
        const prev = s.counts[id] ?? 0;
        const next = clamp(prev + delta);
        if (next === prev) return s;
        return {
          ...s,
          today: Math.max(0, s.today + (prev - next)),
          counts: { ...s.counts, [id]: next },
        };
      }),
    []
  );

  const reset = useCallback(() => {
    const emptyState = empty();
    setStore(emptyState);
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      setDoc(userDocRef, emptyState).catch(console.error);
    }
  }, [user]);

  const total = Object.values(store.counts).reduce((a, b) => a + (b ?? 0), 0);

  return { store, ready, total, setCount, step, reset };
}
