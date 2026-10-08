import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Lang } from '../i18n';
import type { CheckpointId } from '../data/checkpoints';
import type { CompanionId } from '../data/companions';
import { journeyById, type JourneyId } from '../data/journeys';

export type ChapterRecord = {
  completedAt: number;
  choice?: string;
  reflection?: string;
};

type State = {
  lang: Lang;
  journeyId?: JourneyId;
  companionId?: CompanionId;
  chapters: Partial<Record<CheckpointId, ChapterRecord>>;
  arDone: CheckpointId[];
  storiesHeard: string[];
  favoriteStory?: CheckpointId;
  demoUnlockAll: boolean;
};

type Actions = {
  setLang: (l: Lang) => void;
  chooseJourney: (id: JourneyId) => void;
  chooseCompanion: (id: CompanionId) => void;
  markAr: (id: CheckpointId) => void;
  markStory: (id: string) => void;
  completeChapter: (id: CheckpointId, rec: Omit<ChapterRecord, 'completedAt'>) => void;
  setFavorite: (id: CheckpointId) => void;
  setDemoUnlockAll: (v: boolean) => void;
  reset: () => void;
};

const initial: State = {
  lang: 'vi',
  chapters: {},
  arDone: [],
  storiesHeard: [],
  demoUnlockAll: false,
};

const addUnique = <T>(list: T[], v: T) => (list.includes(v) ? list : [...list, v]);

export const useProgress = create<State & Actions>()(
  persist(
    (set) => ({
      ...initial,
      setLang: (lang) => set({ lang }),
      chooseJourney: (journeyId) => set({ journeyId }),
      chooseCompanion: (companionId) => set({ companionId }),
      markAr: (id) => set((s) => ({ arDone: addUnique(s.arDone, id) })),
      markStory: (id) => set((s) => ({ storiesHeard: addUnique(s.storiesHeard, id) })),
      completeChapter: (id, rec) =>
        set((s) => ({
          chapters: { ...s.chapters, [id]: { ...s.chapters[id], ...rec, completedAt: s.chapters[id]?.completedAt ?? Date.now() } },
        })),
      setFavorite: (favoriteStory) => set({ favoriteStory }),
      setDemoUnlockAll: (demoUnlockAll) => set({ demoUnlockAll }),
      reset: () => set((s) => ({ ...initial, lang: s.lang })),
    }),
    { name: 'cuchi-progress-v1', storage: createJSONStorage(() => AsyncStorage) },
  ),
);

export type CheckpointStatus = 'done' | 'open' | 'locked';

/** The route of the chosen journey (defaults to the basic journey). */
export function routeOf(journeyId?: JourneyId): CheckpointId[] {
  return journeyById[journeyId ?? 'basic'].route;
}

/** Explored – open – locked. Chapters open one at a time, in route order. */
export function statusOf(s: Pick<State, 'chapters' | 'journeyId' | 'demoUnlockAll'>, id: CheckpointId): CheckpointStatus {
  if (s.chapters[id]) return 'done';
  if (s.demoUnlockAll) return 'open';
  const route = routeOf(s.journeyId);
  const firstOpen = route.find((c) => !s.chapters[c]);
  return firstOpen === id || !route.includes(id) ? 'open' : 'locked';
}

export const XP_PER_LEVEL = 200;

export function xpOf(s: Pick<State, 'chapters' | 'arDone' | 'storiesHeard'>) {
  return Object.keys(s.chapters).length * 80 + s.arDone.length * 20 + s.storiesHeard.length * 10;
}
