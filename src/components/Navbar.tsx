import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useSpa } from '../context/SpaContext';
import type { AppRoute } from '../types';

const NAV_LINKS: Array<{ label: string; to: AppRoute }> = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Services', to: '/services' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Contact', to: '/contact' },
];

export function Navbar() {
  const { route, navigate, settings } = useSpa();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (to: AppRoute) => {
    setMobileOpen(false);
    navigate(to);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F4]/95 backdrop-blur-md border-b border-[#E6DDD7]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-element brand wordmark */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            handleNav('/');
          }}
          className="font-display text-2xl sm:text-[26px] font-semibold tracking-tight text-[#2C2220] whitespace-nowrap shrink-0"
        >
          {settings.businessName}
        </a>

        {/* Zone 2: Concise single-line navigation links */}
        <nav
          aria-label="Main navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#5A4C48]"
        >
          {NAV_LINKS.map((item) => {
            const isActive = route === item.to;
            return (
              <a
                key={item.to}
                href={item.to}
                onClick={(e) => {
                  e.preventDefault();
                  handleNav(item.to);
                }}
                className={`whitespace-nowrap shrink-0 py-1 border-b transition-colors duration-150 ${
                  isActive
                    ? 'text-[#2C2220] border-[#9A7245] font-semibold'
                    : 'border-transparent hover:text-[#2C2220] hover:border-[#CBB8AA]'
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Zone 3: Single primary action + mobile menu toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleNav('/booking')}
            className="hidden sm:inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium text-white bg-[#7D4A4C] hover:bg-[#663A3C] rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
          >
            Book Now
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg text-[#2C2220] hover:bg-[#EFE8E2] transition-colors cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#E6DDD7] bg-[#FAF7F4] px-4 py-4 space-y-1">
          {NAV_LINKS.map((item) => {
            const isActive = route === item.to;
            return (
              <a
                key={item.to}
                href={item.to}
                onClick={(e) => {
                  e.preventDefault();
                  handleNav(item.to);
                }}
                className={`flex items-center min-h-[44px] px-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#F4EBE8] text-[#2C2220] font-semibold'
                    : 'text-[#5A4C48] hover:bg-[#EFE8E2]'
                }`}
              >
                {item.label}
              </a>
            );
          })}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => handleNav('/booking')}
              className="w-full min-h-[44px] px-4 py-2.5 text-sm font-medium text-white bg-[#7D4A4C] hover:bg-[#663A3C] rounded-lg transition-colors cursor-pointer"
            >
              Book an Appointment
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
