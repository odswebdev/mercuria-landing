const stats = [
  { value: "2.5", unit: "s", label: "0-100 km/h" },
  { value: "310", unit: "km/h", label: "top speed" },
  { value: "1000", unit: "hp", label: "max power" },
  { value: "550", unit: "km", label: "range" },
];

export default function StatsBar({ className = "" }: { className?: string }) {
  return (
    <div
      className={`mx-auto grid w-full max-w-5xl grid-cols-2 gap-3 rounded-[28px] border border-white/10 bg-black/70 px-4 py-5 backdrop-blur-md sm:grid-cols-4 sm:gap-0 sm:divide-x sm:divide-white/15 sm:py-6 ${className}`}
    >
      {stats.map((s) => (
        <div key={s.label} className="flex flex-col items-center justify-center px-4 text-center">
          <p className="text-2xl font-bold text-white md:text-3xl">
            {s.value}
            <span className="ml-1 text-base font-medium text-white/70 md:text-lg">{s.unit}</span>
          </p>
          <p className="mt-1 text-[11px] text-white/60 md:text-xs">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
