import { useState } from "react";
import DealerModal from "./DealerModal";

export default function CallToAction() {
  const [dealerOpen, setDealerOpen] = useState(false);

  return (
    <section id="models" aria-labelledby="models-title" className="bg-black px-6 py-24 text-center md:py-28">
      <p className="text-xs font-medium tracking-[0.25em] text-white/50">MODELS</p>
      <h2
        id="models-title"
        className="mx-auto mt-4 max-w-2xl text-3xl font-semibold text-white md:text-4xl"
      >
        Experience Mercuria GT 001 for yourself.
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-sm text-white/60 md:text-base">
        Book a test drive, explore financing options, or find your nearest showroom.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <a
          href="#configurator"
          className="rounded-full border border-white/25 px-7 py-3 text-sm font-semibold text-white transition hover:border-white/60"
        >
          Build &amp; Price
        </a>
        <button
          type="button"
          onClick={() => setDealerOpen(true)}
          className="rounded-full bg-orange-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-600/30 transition hover:bg-orange-500"
        >
          Find a dealer
        </button>
      </div>

      <DealerModal open={dealerOpen} onClose={() => setDealerOpen(false)} />
    </section>
  );
}
