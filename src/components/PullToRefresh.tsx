"use client";

import { useState, useRef, useCallback, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
}

const PULL_THRESHOLD = 72;

export default function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [pullY, setPullY] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startYRef = useRef<number | null>(null);
  const pullingRef = useRef(false);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      startYRef.current = e.touches[0].clientY;
      pullingRef.current = true;
    }
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!pullingRef.current || startYRef.current === null) return;
    const delta = e.touches[0].clientY - startYRef.current;
    if (delta > 0) {
      setPullY(Math.min(delta * 0.45, PULL_THRESHOLD + 20));
    }
  }, []);

  const onTouchEnd = useCallback(async () => {
    if (pullY >= PULL_THRESHOLD && !refreshing) {
      setRefreshing(true);
      setPullY(PULL_THRESHOLD);
      await onRefresh();
      setRefreshing(false);
    }
    setPullY(0);
    pullingRef.current = false;
    startYRef.current = null;
  }, [pullY, refreshing, onRefresh]);

  const progress = Math.min(pullY / PULL_THRESHOLD, 1);

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className="relative"
    >
      <AnimatePresence>
        {(pullY > 4 || refreshing) && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: pullY > 4 ? 0 : -40 }}
            exit={{ opacity: 0, y: -40 }}
            className="absolute inset-x-0 top-0 z-10 flex justify-center"
            style={{ height: Math.max(pullY, refreshing ? PULL_THRESHOLD : 0) }}
          >
            <div className="flex flex-col items-center justify-end pb-2">
              <div
                className="text-2xl"
                style={{
                  transform: `rotate(${progress * 360}deg)`,
                  transition: refreshing ? "none" : undefined,
                }}
              >
                {refreshing ? (
                  <span className="animate-spin inline-block">🐾</span>
                ) : progress >= 1 ? (
                  "🐾"
                ) : (
                  "🐱"
                )}
              </div>
              <p className="mt-1 text-xs text-lucky-600 font-medium">
                {refreshing ? "Loading..." : progress >= 1 ? "Release to refresh!" : "Pull down to refresh"}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        style={{ marginTop: refreshing ? PULL_THRESHOLD : pullY > 4 ? pullY : 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 30 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
