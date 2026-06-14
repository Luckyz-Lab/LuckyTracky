"use client";

import { useEffect, useRef, useState } from "react";
import type { MascotSlot } from "./Mascot";

interface LottiePlayerProps {
  slot: MascotSlot;
  size: number;
  onError: () => void;
}

export default function LottiePlayer({ slot, size, onError }: LottiePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let destroyed = false;
    let lottieInstance: { destroy: () => void } | null = null;

    (async () => {
      try {
        const lottie = (await import("lottie-web")).default;
        const res = await fetch(`/mascot/${slot}.json`);
        if (!res.ok) throw new Error("not found");
        const data = await res.json();
        if (!containerRef.current || destroyed) return;
        lottieInstance = lottie.loadAnimation({
          container: containerRef.current,
          renderer: "svg",
          loop: true,
          autoplay: true,
          animationData: data,
        });
        setLoaded(true);
      } catch {
        if (!destroyed) onError();
      }
    })();

    return () => {
      destroyed = true;
      lottieInstance?.destroy();
    };
  }, [slot, onError]);

  return (
    <div
      ref={containerRef}
      style={{ width: size, height: size, opacity: loaded ? 1 : 0, transition: "opacity 0.3s" }}
    />
  );
}
