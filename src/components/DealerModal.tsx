import { useEffect, useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";
import { EASE } from "./ui";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled])';

interface DealerModalProps {
  open: boolean;
  onClose: () => void;
}

export default function DealerModal({ open, onClose }: DealerModalProps) {
  const [sent, setSent] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  /* lock scroll, move focus in, restore focus on close */
  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => {
      dialogRef.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    }, 60);
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = "";
      previouslyFocused?.focus?.();
    };
  }, [open]);

  /* close on Escape */
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  /* keep focus inside the dialog while it is open */
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab" || !dialogRef.current) return;
    const focusables = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSent(true);
  };

  const inputClass =
    "w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white " +
    "placeholder-white/30 transition focus:border-white/40 focus:outline-none";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* backdrop */}
          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            tabIndex={-1}
            className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dealer-modal-title"
            onKeyDown={handleKeyDown}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="relative w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl md:p-8"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close dialog"
              className="absolute right-4 top-4 rounded-full p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>

            {sent ? (
              <div role="status" className="py-6 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400" aria-hidden="true" />
                <p className="mt-4 text-lg font-semibold text-white">Request sent!</p>
                <p className="mt-2 text-sm text-white/60">
                  A Mercuria dealer will contact you shortly to arrange your visit.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-6 rounded-full bg-orange-600 px-7 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-500"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate={false}>
                <h2
                  id="dealer-modal-title"
                  className="text-xl font-semibold tracking-tight text-white"
                >
                  Find a dealer
                </h2>
                <p className="mt-2 text-sm text-white/60">
                  Leave your details and we will arrange a visit to your nearest Mercuria
                  showroom.
                </p>

                <div className="mt-6 space-y-4">
                  <div>
                    <label htmlFor="dealer-name" className="mb-1.5 block text-xs text-white/60">
                      Full name
                    </label>
                    <input
                      id="dealer-name"
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      placeholder="John Doe"
                      className={inputClass}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="dealer-email" className="mb-1.5 block text-xs text-white/60">
                        Email
                      </label>
                      <input
                        id="dealer-email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        placeholder="john@example.com"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="dealer-phone" className="mb-1.5 block text-xs text-white/60">
                        Phone
                      </label>
                      <input
                        id="dealer-phone"
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        placeholder="+1 (555) 000-0000"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="dealer-city" className="mb-1.5 block text-xs text-white/60">
                      City
                    </label>
                    <input
                      id="dealer-city"
                      name="city"
                      type="text"
                      autoComplete="address-level2"
                      placeholder="New York"
                      className={inputClass}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-6 w-full rounded-full bg-orange-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-600/25 transition hover:bg-orange-500"
                >
                  Send request
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
