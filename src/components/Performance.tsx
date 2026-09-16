import StatsBar from "./StatsBar";

export default function Performance() {
  return (
    <section id="performance" aria-labelledby="performance-title" className="relative bg-black pt-16 md:pt-20">
      <h2
        id="performance-title"
        className="mb-8 text-center text-xs font-medium tracking-[0.25em] text-white/50"
      >
        PERFORMANCE
      </h2>

      {/* full-bleed image */}
      <div className="relative w-full overflow-hidden">
        <img
          src={`${import.meta.env.BASE_URL}images/desert-drive.jpg`}
          alt="Mercuria GT 001 driving through desert"
          className="h-[70vh] max-h-[640px] min-h-[380px] w-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/85 to-transparent" />

        {/* stats — pinned to the very bottom of the image */}
        <div className="absolute inset-x-0 bottom-2 z-20 px-4 md:bottom-3 md:px-8">
          <StatsBar />
        </div>
      </div>
    </section>
  );
}
