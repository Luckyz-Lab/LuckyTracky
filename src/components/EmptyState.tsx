"use client";

import { motion } from "framer-motion";
import Mascot from "./mascot/Mascot";

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export default function EmptyState({
  title = "No spending today. Well done!",
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`flex flex-col items-center justify-center gap-4 py-12 px-6 text-center ${className}`}
    >
      <Mascot slot="sleeping" size={100} interactive={false} />
      <div className="space-y-1">
        <p className="font-display text-base font-semibold text-slate-700 dark:text-slate-200">
          {title}
        </p>
        {description && (
          <p className="text-sm text-slate-400 dark:text-slate-500">{description}</p>
        )}
      </div>
      {action && <div className="pt-1">{action}</div>}
    </motion.div>
  );
}
