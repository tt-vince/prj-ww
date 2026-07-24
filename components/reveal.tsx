"use client";

import { motion } from "motion/react";

const variants = {
  "fade-up": { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } },
  fade: { hidden: { opacity: 0 }, show: { opacity: 1 } },
  "slide-left": { hidden: { opacity: 0, x: -32 }, show: { opacity: 1, x: 0 } },
  "slide-right": { hidden: { opacity: 0, x: 32 }, show: { opacity: 1, x: 0 } },
} as const;

export function Reveal({
  children,
  variant = "fade-up",
  delay = 0,
  duration = 0.6,
  className,
}: {
  children: React.ReactNode;
  variant?: keyof typeof variants;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={variants[variant]}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}
