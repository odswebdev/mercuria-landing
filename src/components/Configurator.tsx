import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { FadeIn } from "../components/ui";
import { cn } from "../utils/cn";

type BodyColor = {
  name: string;
  swatch: string;
  suffix: string; // "" = factory grey (original photo), else colour-variant image
  price: number;
};

/* base price of the car, USD — finish prices are surcharges on top */
const BASE_PRICE = 189_000;

const BODY_COLORS: BodyColor[] = [
  { name: "Lunar Grey", swatch: "linear-gradient(135deg,#ececea,#8b8b88)", suffix: "", price: 0 },
  { name: "Pearl White", swatch: "#efede4", suffix: "-white", price: 1_500 },
  { name: "Deep Sea", swatch: "#39466b", suffix: "-deepsea", price: 1_500 },
  { name: "Desert Sand", swatch: "#e4d7b4", suffix: "-sand", price: 2_500 },
  { name: "Inferno Red", swatch: "#ce1730", suffix: "-red", price: 3_000 },
];

const VIEWS = [
  { id: "rear", label: "Rear quarter", base: `${import.meta.env.BASE_URL}images/config-rear` },
  { id: "front", label: "Front", base: `${import.meta.env.BASE_URL}images/config-front` },
];

const formatUSD = (value: number) => `$${value.toLocaleString("en-US")}`;

export default function Configurator() {
  const [color, setColor] = useState(0);
  const [view, setView] = useState(0);

  const active = BODY_COLORS[color];
  const activeSrc = `${VIEWS[view].base}${active.suffix}.jpg?v=4`;

  useEffect(() => {
    // preload every colour variant of every view so switching is instant
    VIEWS.forEach((v) =>
      BODY_COLORS.forEach((c) => {
        const img = new Image();
        img.src = `${v.base}${c.suffix}.jpg?v=4`;
      }),
    );
  }, []);

  return (
    <section
      id="configurator"
      aria-labelledby="configurator-title"
      className="stage-grad relative overflow-hidden bg-black pb-20 md:pb-24"
    >
      {/* section heading — same treatment as the Models block */}
      <div className="mx-auto max-w-[1400px] px-6 pt-24 md:px-12 md:pt-32">
        <h2
          id="configurator-title"
          className="text-center text-xs font-medium tracking-[0.25em] text-white/50"
        >
          Configurator
        </h2>
      </div>

      {/* stage */}
      <div className="relative mt-10 w-full md:mt-12">
        {/* full-bleed stage image — instant crossfade between views */}
        <div className="relative isolate h-[62vh] max-h-[680px] min-h-[400px] w-full overflow-hidden md:h-[68vh]">
          <AnimatePresence initial={false}>
            <motion.img
              key={activeSrc}
              src={activeSrc}
              alt={`Mercuria GT 001 — ${VIEWS[view].label}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute inset-0 h-full w-full object-cover"
              draggable={false}
            />
          </AnimatePresence>
        </div>

        {/* subtle vignette so overlays stay readable */}
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_50%,transparent_55%,rgba(0,0,0,0.55)_100%)]"
          aria-hidden="true"
        />

        {/* colour panel — top right over the image */}
        <FadeIn
          delay={0.15}
          className="absolute right-6 top-6 z-30 md:right-12 md:top-8"
        >
          <div className="rounded-2xl border border-white/10 bg-black/45 p-5 backdrop-blur-xl">
            <p className="text-[11px] font-medium tracking-[0.08em] text-white/70">Body</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {BODY_COLORS.map((c, i) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setColor(i)}
                  aria-label={`${c.name}${c.price > 0 ? ` (+${formatUSD(c.price)})` : " (included)"}`}
                  aria-pressed={i === color}
                  className={cn(
                    "relative h-10 w-10 rounded-[6px] transition-all duration-300",
                    "ring-1 ring-white/20 hover:scale-105 hover:ring-white/50",
                    i === color && "scale-105 ring-2 ring-white"
                  )}
                  style={{ background: c.swatch }}
                >
                  {i === color && (
                    <span className="absolute inset-0 grid place-items-center">
                      <Check className="h-3.5 w-3.5 text-black/70 mix-blend-multiply" strokeWidth={3} />
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div aria-live="polite" className="mt-3.5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.name}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.35 }}
                >
                  <p className="text-[11px] text-white/60">{active.name}</p>
                  <p className="mt-1 text-[13px] font-semibold text-white">
                    ≈ {formatUSD(BASE_PRICE + active.price)}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </FadeIn>

        {/* view thumbnails — bottom centre over the image */}
        <div
          role="group"
          aria-label="Car view"
          className="absolute inset-x-0 bottom-6 z-30 flex items-end justify-center gap-3 md:bottom-8"
        >
          {VIEWS.map((v, i) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setView(i)}
              aria-label={`Show ${v.label} view`}
              aria-current={i === view ? "true" : undefined}
              className={cn(
                "group relative w-32 overflow-hidden rounded-xl border transition-all duration-400 md:w-36",
                i === view
                  ? "border-white/70 opacity-100"
                  : "border-white/15 opacity-50 hover:opacity-90"
              )}
            >
              <img
                src={`${v.base}.jpg`}
                alt={v.label}
                className="aspect-[16/9] w-full object-cover"
                draggable={false}
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2.5 pt-4 pb-2 text-left text-[10px] font-medium tracking-[0.08em] text-white/85">
                {v.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
