export default function About() {
  return (
    <section id="about-us" className="bg-black px-6 py-24 text-center md:py-32">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-medium tracking-[0.25em] text-white/50">ABOUT</p>

        <h2 className="mt-6 text-3xl font-semibold leading-tight text-white md:text-5xl">
          Mercuria GT 001, <span className="italic font-light">Inspired</span>
          <br className="hidden md:block" /> by Mercury. Built for Earth.
        </h2>

        <p className="mx-auto mt-8 max-w-2xl text-sm leading-relaxed text-white/70 md:text-base">
          A new vision of electric grand touring, where performance, precision and everyday
          usability exist in perfect balance. Designed around a purpose-built electric platform,
          Mercuria GT 001 transforms advanced engineering into an effortless driving experience.
        </p>

        <p className="mx-auto mt-8 max-w-lg text-xs leading-relaxed text-white/45 md:text-sm">
          From its aerodynamic silhouette to its intelligent all-wheel-drive system, every element
          has been shaped with intention. Clean surfaces, seamless lighting and a spacious cabin
          create a vehicle that is as efficient as it is unmistakably Mercuria.
        </p>
      </div>
    </section>
  );
}
