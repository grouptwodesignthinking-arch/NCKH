import { useCallback } from 'react';
import { useProgress } from '../store/progress';
import { strings, type StringKey } from './strings';

export type Lang = 'vi' | 'en';
/** A bilingual piece of content. */
export type L = { vi: string; en: string };

export function useT() {
  const lang = useProgress((s) => s.lang);
  const t = useCallback(
    (key: StringKey, vars?: Record<string, string | number>) => {
      let out: string = strings[key][lang];
      if (vars) for (const [k, v] of Object.entries(vars)) out = out.replaceAll(`{${k}}`, String(v));
      return out;
    },
    [lang],
  );
  const tr = useCallback((l: L) => l[lang], [lang]);
  return { t, tr, lang };
}
