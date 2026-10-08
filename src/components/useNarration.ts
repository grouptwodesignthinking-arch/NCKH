import * as Speech from 'expo-speech';
import { useCallback, useEffect, useState } from 'react';
import { useProgress } from '../store/progress';

/**
 * Narration via the device's text-to-speech voice. Stands in for recorded
 * audio until the team has real narration / witness recordings.
 */
export function useNarration() {
  const lang = useProgress((s) => s.lang);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => () => void Speech.stop(), []);

  const play = useCallback(
    (text: string, onDone?: () => void) => {
      void Speech.stop();
      setSpeaking(true);
      Speech.speak(text, {
        language: lang === 'vi' ? 'vi-VN' : 'en-US',
        rate: 0.95,
        onDone: () => {
          setSpeaking(false);
          onDone?.();
        },
        onStopped: () => setSpeaking(false),
        onError: () => setSpeaking(false),
      });
    },
    [lang],
  );

  const stop = useCallback(() => {
    void Speech.stop();
    setSpeaking(false);
  }, []);

  return { speaking, play, stop };
}
