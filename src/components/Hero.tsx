import Header from "./Header";

export default function Hero() {
  return (
    <section id="top" className="relative h-[100vh] min-h-[720px] w-full overflow-hidden bg-black">
      <Header />

      {/* Giant wordmark */}
      <div className="relative z-10 flex flex-col items-center pt-24 md:pt-28">
        <h1
          className="select-none text-center leading-[0.8] text-[#f5efe2]"
          style={{
            fontSize: "clamp(4.5rem, 17vw, 15rem)",
            fontFamily: "'Arial Black', Impact, sans-serif",
            fontWeight: 900,
            letterSpacing: "-0.02em",
          }}
        >
          Mercuria
        </h1>
        <p className="mt-4 text-xs font-medium tracking-[0.2em] text-white/80 md:text-sm">
          RANGE, PERFORMANCE, EFFICIENCY, AND SPACE.
        </p>
      </div>

      {/* Background image with gradient */}
      <div className="absolute inset-x-0 bottom-0 top-[36%] z-0">
        <img
          src={`${import.meta.env.BASE_URL}images/hero-side.jpg`}
          alt="Mercuria GT 001 side profile"
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent" />
      </div>
    </section>
  );
}
