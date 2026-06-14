"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export type SoundKey = "tap" | "coin" | "celebrate" | "alert" | "swoosh";

interface SoundCtx {
  enabled: boolean;
  toggle: () => void;
  play: (key: SoundKey) => void;
}

const SoundContext = createContext<SoundCtx>({
  enabled: false,
  toggle: () => {},
  play: () => {},
});

const SOUND_FILES: Record<SoundKey, string> = {
  tap: "/sounds/tap.mp3",
  coin: "/sounds/coin.mp3",
  celebrate: "/sounds/celebrate.mp3",
  alert: "/sounds/alert.mp3",
  swoosh: "/sounds/swoosh.mp3",
};

export function SoundProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("sound-enabled");
    setEnabled(stored === "true");
  }, []);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      if (mounted) localStorage.setItem("sound-enabled", String(next));
      return next;
    });
  }, [mounted]);

  const play = useCallback(
    (key: SoundKey) => {
      if (!enabled) return;
      try {
        const audio = new Audio(SOUND_FILES[key]);
        audio.volume = 0.35;
        audio.play().catch(() => {});
      } catch {
        // no-op if file missing or browser blocked
      }
    },
    [enabled]
  );

  return (
    <SoundContext.Provider value={{ enabled, toggle, play }}>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  return useContext(SoundContext);
}
