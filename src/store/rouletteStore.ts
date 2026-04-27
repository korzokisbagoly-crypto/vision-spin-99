import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Roulette, Segment } from "@/types/roulette";
import { PALETTE } from "@/types/roulette";

const uid = () => Math.random().toString(36).slice(2, 10);
const today = () => new Date().toISOString().slice(0, 10);

interface State {
  roulettes: Roulette[];
  disciplineMode: boolean;
  dailyLimit: number;
  soundEnabled: boolean;
  createRoulette: (partial?: Partial<Roulette>) => string;
  duplicateRoulette: (id: string) => string | null;
  deleteRoulette: (id: string) => void;
  updateRoulette: (id: string, patch: Partial<Roulette>) => void;
  addSegment: (rouletteId: string, segment?: Partial<Segment>) => void;
  updateSegment: (rouletteId: string, segmentId: string, patch: Partial<Segment>) => void;
  removeSegment: (rouletteId: string, segmentId: string) => void;
  registerSpin: (rouletteId: string) => void;
  toggleDiscipline: () => void;
  setDailyLimit: (n: number) => void;
  toggleSound: () => void;
  importJson: (json: string) => boolean;
}

const seedRoulette = (): Roulette => ({
  id: uid(),
  name: "Morning Ritual",
  emoji: "🌿",
  themeColor: PALETTE[0],
  segments: [
    { id: uid(), label: "Stretch", emoji: "🧘", color: PALETTE[0], weight: 1 },
    { id: uid(), label: "Journal", emoji: "📓", color: PALETTE[1], weight: 1 },
    { id: uid(), label: "Walk", emoji: "🚶", color: PALETTE[2], weight: 1 },
    { id: uid(), label: "Read", emoji: "📖", color: PALETTE[3], weight: 1 },
    { id: uid(), label: "Meditate", emoji: "🕯️", color: PALETTE[4], weight: 1 },
    { id: uid(), label: "Tea", emoji: "🍵", color: PALETTE[5], weight: 1 },
  ],
  createdAt: Date.now(),
  updatedAt: Date.now(),
  spinCount: 0,
});

export const useRouletteStore = create<State>()(
  persist(
    (set, get) => ({
      roulettes: [seedRoulette()],
      disciplineMode: false,
      dailyLimit: 3,
      soundEnabled: true,

      createRoulette: (partial) => {
        const id = uid();
        const r: Roulette = {
          id,
          name: partial?.name ?? "Untitled board",
          emoji: partial?.emoji,
          themeColor: partial?.themeColor ?? PALETTE[0],
          segments: partial?.segments ?? [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          spinCount: 0,
        };
        set((s) => ({ roulettes: [r, ...s.roulettes] }));
        return id;
      },

      duplicateRoulette: (id) => {
        const original = get().roulettes.find((r) => r.id === id);
        if (!original) return null;
        const newId = uid();
        const copy: Roulette = {
          ...original,
          id: newId,
          name: `${original.name} (copy)`,
          segments: original.segments.map((s) => ({ ...s, id: uid() })),
          createdAt: Date.now(),
          updatedAt: Date.now(),
          spinCount: 0,
          lastSpinDate: undefined,
          spinsToday: 0,
        };
        set((s) => ({ roulettes: [copy, ...s.roulettes] }));
        return newId;
      },

      deleteRoulette: (id) =>
        set((s) => ({ roulettes: s.roulettes.filter((r) => r.id !== id) })),

      updateRoulette: (id, patch) =>
        set((s) => ({
          roulettes: s.roulettes.map((r) =>
            r.id === id ? { ...r, ...patch, updatedAt: Date.now() } : r
          ),
        })),

      addSegment: (rouletteId, segment) => {
        set((s) => ({
          roulettes: s.roulettes.map((r) => {
            if (r.id !== rouletteId) return r;
            if (r.segments.length >= 50) return r;
            const seg: Segment = {
              id: uid(),
              label: segment?.label ?? "New",
              emoji: segment?.emoji,
              color: segment?.color ?? PALETTE[r.segments.length % PALETTE.length],
              weight: segment?.weight ?? 1,
              mediaUrl: segment?.mediaUrl,
              mediaType: segment?.mediaType,
            };
            return { ...r, segments: [...r.segments, seg], updatedAt: Date.now() };
          }),
        }));
      },

      updateSegment: (rouletteId, segmentId, patch) =>
        set((s) => ({
          roulettes: s.roulettes.map((r) =>
            r.id === rouletteId
              ? {
                  ...r,
                  segments: r.segments.map((seg) =>
                    seg.id === segmentId ? { ...seg, ...patch } : seg
                  ),
                  updatedAt: Date.now(),
                }
              : r
          ),
        })),

      removeSegment: (rouletteId, segmentId) =>
        set((s) => ({
          roulettes: s.roulettes.map((r) =>
            r.id === rouletteId
              ? { ...r, segments: r.segments.filter((s2) => s2.id !== segmentId), updatedAt: Date.now() }
              : r
          ),
        })),

      registerSpin: (rouletteId) =>
        set((s) => ({
          roulettes: s.roulettes.map((r) => {
            if (r.id !== rouletteId) return r;
            const t = today();
            const spinsToday = r.lastSpinDate === t ? (r.spinsToday ?? 0) + 1 : 1;
            return { ...r, spinCount: r.spinCount + 1, lastSpinDate: t, spinsToday };
          }),
        })),

      toggleDiscipline: () => set((s) => ({ disciplineMode: !s.disciplineMode })),
      setDailyLimit: (n) => set({ dailyLimit: Math.max(1, n) }),
      toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),

      importJson: (json) => {
        try {
          const data = JSON.parse(json);
          const items: Roulette[] = Array.isArray(data) ? data : [data];
          const cleaned = items.map((r) => ({
            ...r,
            id: uid(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
            spinCount: 0,
            segments: (r.segments ?? []).map((s) => ({ ...s, id: uid() })),
          }));
          set((s) => ({ roulettes: [...cleaned, ...s.roulettes] }));
          return true;
        } catch {
          return false;
        }
      },
    }),
    { name: "loop-roulettes" }
  )
);