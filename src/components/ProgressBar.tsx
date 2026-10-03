"use client";

import { motion } from "framer-motion";

export default function ProgressBar({ percent }: { percent: number }) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/15">
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: `${percent}%` }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="h-full rounded-full bg-white"
      />
    </div>
  );
}
