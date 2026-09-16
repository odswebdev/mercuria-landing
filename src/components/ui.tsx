import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "../utils/cn";

export const EASE = [0.22, 1, 0.36, 1] as const;

/* ---------------- Logo ---------------- */
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="group inline-flex items-center gap-2.5">
      <span className="relative grid h-6 w-6 place-items-center">
        <svg viewBox="0 0 24 24" className="h-6 w-6 text-cream">
          <circle
            cx="12"
            cy="12"
            r="10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeDasharray="47 16"
            strokeLinecap="round"
            className="origin-center transition-transform duration-700 group-hover:rotate-90"
          />
          <path
            d="M7.5 16V9.2l4.5 5 4.5-5V16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {!compact && (
        <span className="font-display text-[13px] font-semibold tracking-[0.08em] text-cream">
          Mercuria
        </span>
      )}
    </span>
  );
}

/* ---------------- Small centred section label ---------------- */
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, ease: EASE }}
      className="text-center text-[13px] font-medium tracking-[0.02em] text-white/55"
    >
      {children}
    </motion.p>
  );
}

/* ---------------- Fade-up reveal wrapper ---------------- */
export function FadeIn({
  children,
  className,
  delay = 0,
  y = 36,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 1, delay, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ---------------- Line reveal for headings ---------------- */
export function RevealLine({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <span className={cn("block overflow-hidden pb-[0.08em] -mb-[0.08em]", className)}>
      <motion.span
        className="block will-change-transform"
        initial={{ y: "115%" }}
        whileInView={{ y: "0%" }}
        viewport={{ once: true, margin: "-70px" }}
        transition={{ duration: 1.1, delay, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  );
}

/* ---------------- Pill button ---------------- */
export function EmberButton({
  children,
  onClick,
  className,
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative inline-flex cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-full",
        "bg-ember px-6 py-2.5 text-[13px] font-semibold text-white",
        "transition-all duration-500 hover:shadow-[0_0_32px_rgba(255,77,18,0.55)] active:scale-[0.97]",
        className
      )}
    >
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </button>
  );
}