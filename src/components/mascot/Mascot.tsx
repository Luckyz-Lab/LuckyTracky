"use client";

import { useState, useEffect, useCallback, Suspense, lazy } from "react";
import { motion } from "framer-motion";
import SvgFallback from "./SvgFallback";

const LottiePlayer = lazy(() => import("./LottiePlayer"));

export type MascotSlot =
  | "idle" | "loading" | "sleeping" | "walking"
  | "celebrate" | "eating" | "tap" | "shocked";

export interface MascotProps {
  slot?: MascotSlot;
  size?: number;
  className?: string;
  onTap?: () => void;
  interactive?: boolean;
}

export default function Mascot({
  slot = "idle",
  size = 120,
  className = "",
  onTap,
  interactive = true,
}: MascotProps) {
  const [mounted, setMounted] = useState(false);
  const [lottieError, setLottieError] = useState(false);
  const [tapped, setTapped] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleTap = useCallback(() => {
    if (!interactive) return;
    setTapped(true);
    onTap?.();
    setTimeout(() => setTapped(false), 400);
  }, [interactive, onTap]);

  const displaySlot: MascotSlot = tapped ? "tap" : slot;

  return (
    <motion.div
      className={`relative select-none ${interactive ? "cursor-pointer" : ""} ${className}`}
      style={{ width: size, height: size }}
      onClick={handleTap}
      whileTap={interactive ? { scale: 0.88 } : undefined}
      animate={
        slot === "idle"
          ? { y: [0, -6, 0] }
          : slot === "celebrate"
          ? { rotate: [-6, 6, -6, 6, 0] }
          : {}
      }
      transition={
        slot === "idle"
          ? { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
          : slot === "celebrate"
          ? { duration: 0.5, repeat: 2 }
          : {}
      }
    >
      {mounted && !lottieError ? (
        <Suspense fallback={<SvgFallback slot={displaySlot} />}>
          <LottiePlayer
            slot={displaySlot}
            size={size}
            onError={() => setLottieError(true)}
          />
        </Suspense>
      ) : (
        <SvgFallback slot={displaySlot} />
      )}
    </motion.div>
  );
}
