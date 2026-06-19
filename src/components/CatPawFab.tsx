"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { useSound } from "./mascot/SoundProvider";

interface CatPawFabProps {
  onClick: () => void;
  label?: string;
}

export default function CatPawFab({ onClick, label = "Open Lucky AI assistant" }: CatPawFabProps) {
  const { play } = useSound();

  function handleClick() {
    play("tap");
    onClick();
  }

  return (
    <motion.button
      onClick={handleClick}
      className="fixed bottom-24 right-4 z-40 flex h-14 w-14 flex-col items-center justify-center rounded-2xl bg-orange-500 text-white shadow-pop focus:outline-none focus:ring-4 focus:ring-orange-200 lg:bottom-5 lg:right-5 lg:h-16 lg:w-16 lg:rounded-full"
      aria-label={label}
      whileTap={{ scale: 0.82 }}
      whileHover={{ scale: 1.08 }}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
    >
      <MessageSquare size={25} />
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-emerald-400 shadow-sm"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-white" />
      </motion.div>
    </motion.button>
  );
}
