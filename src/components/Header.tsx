import { useState } from "react";
import DealerModal from "./DealerModal";

const links = [
  { label: "Performance", href: "#performance" },
  { label: "About Us", href: "#about-us" },
  { label: "Configurator", href: "#configurator" },
  { label: "Models", href: "#models" },
];

export default function Header() {
  const [dealerOpen, setDealerOpen] = useState(false);

  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-6 md:px-10">
        <a href="#top" aria-label="Mercuria — back to top" className="flex items-center gap-2 text-white">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            className="text-white"
            aria-hidden="true"
          >
            <path
              d="M12 2C7 6 4 10.5 4 14.5C4 18.6 7.6 22 12 22C16.4 22 20 18.6 20 14.5C20 10.5 17 6 12 2Z"
              fill="currentColor"
            />
          </svg>
          <span className="text-sm font-semibold tracking-wide">Mercuria</span>
        </a>

        <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-xs font-medium tracking-wide text-white/90 transition hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setDealerOpen(true)}
          className="rounded-full bg-orange-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-orange-600/30 transition hover:bg-orange-500"
        >
          Find a dealer
        </button>
      </div>

      <DealerModal open={dealerOpen} onClose={() => setDealerOpen(false)} />
    </header>
  );
}
