import { useState } from "react";

const slides = [
  {
    src: `${import.meta.env.BASE_URL}images/coastal-drive.jpg`,
    alt: "Mercuria GT 001 driving along the coast",
  },
  {
    src: `${import.meta.env.BASE_URL}images/desert-drive.jpg`,
    alt: "Mercuria GT 001 driving through the desert",
  },
  {
    src: `${import.meta.env.BASE_URL}images/configurator-wheel.jpg`,
    alt: "Mercuria GT 001 rear wheel detail",
  },
];

export default function Exterior() {
  const [active, setActive] = useState(0);

  const count = slides.length;
  const prevIndex = (active - 1 + count) % count;
  const nextIndex = (active + 1) % count;
  const prev = slides[prevIndex];
  const next = slides[nextIndex];

  return (
    <section aria-labelledby="exterior-title" className="bg-black pb-28 pt-8">
      <h2
        id="exterior-title"
        className="text-center text-xs font-medium tracking-[0.25em] text-white/50"
      >
        EXTERIOR
      </h2>

      <p className="mx-auto mt-6 max-w-2xl px-4 text-center text-sm leading-relaxed text-white/70 md:text-base">
        The electric power source, Mercuria-engineered engines and advanced drivetrain affords a
        radically new architecture that uniquely combines extraordinary Mercuria performance with
        the luxury of spaciousness.
      </p>

      {/* full-width slider — side panels show the previous / next slides */}
      <div
        role="group"
        aria-roledescription="carousel"
        aria-label="Exterior gallery"
        className="mt-12 grid w-full grid-cols-1 items-center gap-3 md:grid-cols-[1fr_2.4fr_1fr]"
      >
        <button
          type="button"
          onClick={() => setActive(prevIndex)}
          aria-label={`Previous slide: ${prev.alt}`}
          className="hidden h-64 overflow-hidden md:block"
        >
          <img
            src={prev.src}
            alt={prev.alt}
            className="h-full w-full object-cover opacity-70 transition hover:opacity-100"
            draggable={false}
          />
        </button>

        <div className="overflow-hidden rounded-2xl border border-white/10">
          <img
            src={slides[active].src}
            alt={slides[active].alt}
            className="h-[300px] w-full object-cover sm:h-[420px] md:h-[480px]"
          />
        </div>

        <button
          type="button"
          onClick={() => setActive(nextIndex)}
          aria-label={`Next slide: ${next.alt}`}
          className="hidden h-64 overflow-hidden md:block"
        >
          <img
            src={next.src}
            alt={next.alt}
            className="h-full w-full object-cover opacity-70 transition hover:opacity-100"
            draggable={false}
          />
        </button>
      </div>

      <div role="group" aria-label="Slide controls" className="mt-8 flex items-center justify-center gap-2">
        {slides.map((s, i) => (
          <button
            key={s.src}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Show slide ${i + 1}: ${s.alt}`}
            aria-current={active === i ? "true" : undefined}
            className={`h-2 rounded-full transition-all ${
              active === i ? "w-6 bg-white" : "w-2 bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
