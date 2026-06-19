"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { useSound } from "./mascot/SoundProvider";

interface CatPawFabProps {
  onClick: () => void;
  label?: string;
}

export default function CatPawFab({ onClick, label = "Add entry" }: CatPawFabProps) {
  const { play } = useSound();

  function handleClick() {
    play("tap");
    onClick();
  }

  return (
    <motion.button
      onClick={handleClick}
      className="xl:hidden fixed bottom-24 right-4 z-40 flex h-14 w-14 flex-col items-center justify-center rounded-2xl bg-lucky-600 text-white shadow-pop focus:outline-none focus:ring-4 focus:ring-lucky-200 lg:bottom-5 lg:right-5 lg:h-16 lg:w-16 lg:rounded-full"
      aria-label={label}
      whileTap={{ scale: 0.82 }}
      whileHover={{ scale: 1.08 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
    >
      <PawIcon />
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-peach-400 shadow-sm"
      >
        <Plus size={13} strokeWidth={3} />
      </motion.div>
    </motion.button>
  );
}

function PawIcon() {
  return (
    <svg viewBox="0 0 32 32" width="28" height="28" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="16" cy="22" rx="9" ry="7" />
      <ellipse cx="7" cy="14" rx="4" ry="5" />
      <ellipse cx="25" cy="14" rx="4" ry="5" />
      <ellipse cx="11" cy="8" rx="3.5" ry="4.5" />
      <ellipse cx="21" cy="8" rx="3.5" ry="4.5" />
    </svg>
  );
}
