import { useState } from "react";
import DealerModal from "./DealerModal";

export default function Footer() {
  const [dealerOpen, setDealerOpen] = useState(false);

  return (
    <footer id="contacts" className="border-t border-white/10 bg-black px-6 py-12 text-white/60">
      <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-8 md:flex-row md:items-start">
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center gap-2 text-white md:justify-start">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white" aria-hidden="true">
              <path
                d="M12 2C7 6 4 10.5 4 14.5C4 18.6 7.6 22 12 22C16.4 22 20 18.6 20 14.5C20 10.5 17 6 12 2Z"
                fill="currentColor"
              />
            </svg>
            <span className="text-sm font-semibold tracking-wide">Mercuria</span>
          </div>
          <p className="mt-3 max-w-xs text-xs text-white/40">
            Purpose-built electric grand touring. Designed for range, performance, efficiency and
            space.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-10 text-center text-xs sm:grid-cols-4 md:text-left">
          <nav aria-label="Explore">
            <p className="mb-3 font-semibold text-white/80">Explore</p>
            <ul className="space-y-2 text-white/50">
              <li><a href="#models" className="hover:text-white">Models</a></li>
              <li><a href="#configurator" className="hover:text-white">Configurator</a></li>
              <li><a href="#about-us" className="hover:text-white">About Us</a></li>
            </ul>
          </nav>
          <div>
            <p className="mb-3 font-semibold text-white/80">Contacts</p>
            <ul className="space-y-2 text-white/50">
              <li>
                <a href="mailto:hello@mercuria.com" className="hover:text-white">hello@mercuria.com</a>
              </li>
              <li>
                <a href="tel:+18005550134" className="hover:text-white">+1 (800) 555-0134</a>
              </li>
              <li>
                <button type="button" onClick={() => setDealerOpen(true)} className="hover:text-white">
                  Find a dealer
                </button>
              </li>
            </ul>
          </div>
          <nav aria-label="Company">
            <p className="mb-3 font-semibold text-white/80">Company</p>
            <ul className="space-y-2 text-white/50">
              <li><a href="#" className="hover:text-white">Careers</a></li>
              <li><a href="#" className="hover:text-white">Press</a></li>
              <li><a href="#" className="hover:text-white">Sustainability</a></li>
            </ul>
          </nav>
          <nav aria-label="Legal">
            <p className="mb-3 font-semibold text-white/80">Legal</p>
            <ul className="space-y-2 text-white/50">
              <li><a href="#" className="hover:text-white">Privacy</a></li>
              <li><a href="#" className="hover:text-white">Terms</a></li>
            </ul>
          </nav>
        </div>
      </div>

      <p className="mt-10 text-center text-[11px] text-white/30">
        © {new Date().getFullYear()} Mercuria Motors. All rights reserved.
      </p>

      <DealerModal open={dealerOpen} onClose={() => setDealerOpen(false)} />
    </footer>
  );
}
