import { useMemo, useState } from 'react';
import { Calendar, MessageCircle } from 'lucide-react';
import { ServiceCard } from '../components/ServiceCard';
import { useSpa } from '../context/SpaContext';
import { buildWhatsAppUrl } from '../data/defaults';

export function ServicesPage() {
  const { services, navigate, settings } = useSpa();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const activeServices = useMemo(
    () => services.filter((s) => s.active),
    [services]
  );

  const categories = useMemo(() => {
    const unique = Array.from(new Set(activeServices.map((s) => s.category)));
    return ['All', ...unique];
  }, [activeServices]);

  const filtered = useMemo(() => {
    if (selectedCategory === 'All') return activeServices;
    return activeServices.filter((s) => s.category === selectedCategory);
  }, [activeServices, selectedCategory]);

  const customWhatsAppUrl = buildWhatsAppUrl(
    settings.whatsappIntl,
    'Hello Viccie Mobile Spa, I would like pricing and availability for a bespoke mobile spa package in Cape Town.'
  );

  return (
    <div className="bg-[#FAF7F4] py-14 lg:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#E6DDD7]">
          <div className="space-y-3 max-w-2xl">
            <p className="text-xs font-medium text-[#9A7245]">
              Mobile Beauty &amp; Wellness Menu · {settings.locationText}
            </p>
            <h1
              className="font-display font-semibold text-[#2C2220] leading-[1.1] [text-wrap:balance]"
              style={{ fontSize: 'clamp(2.15rem, 3.6vw, 3.25rem)' }}
            >
              Our Spa &amp; Beauty Treatments
            </h1>
            <p className="text-sm sm:text-base text-[#5A4C48] leading-relaxed">
              Explore our signature mobile treatments in Cape Town—from facial treatments and massages to manicures, pedicures, reflexology, Gelish, and classic lashes.
            </p>
          </div>

          {/* Interactive Filter Tabs */}
          <div
            role="tablist"
            aria-label="Filter treatments by category"
            className="inline-flex flex-wrap items-center gap-1 p-1 bg-[#EFE8E2] rounded-xl self-start lg:self-auto"
          >
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-white text-[#2C2220] shadow-xs'
                      : 'text-[#5A4C48] hover:text-[#2C2220]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Services Grid */}
        {filtered.length === 0 ? (
          <div className="bg-white border border-[#E6DDD7] rounded-2xl p-10 text-center space-y-3">
            <p className="font-display text-2xl text-[#2C2220]">
              No treatments found in this category
            </p>
            <button
              type="button"
              onClick={() => setSelectedCategory('All')}
              className="px-4 py-2 text-xs font-medium text-white bg-[#7D4A4C] rounded-lg cursor-pointer"
            >
              Show All Treatments
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {filtered.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}

        {/* Custom Package Enquiry Banner */}
        <div className="bg-white border border-[#E6DDD7] rounded-2xl p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#2C2220]">
              Planning a Couples Session or Pamper Gathering?
            </h2>
            <p className="text-sm text-[#5A4C48]">
              Combine facials, massages, Gelish nails, or pedicures into a custom mobile spa booking at your Cape Town venue.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => navigate('/booking')}
              className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 text-sm font-medium text-white bg-[#7D4A4C] hover:bg-[#663A3C] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>Book Package</span>
            </button>
            <a
              href={customWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 text-sm font-medium text-[#2C2220] bg-[#FAF7F4] hover:bg-[#F4EBE8] border border-[#DDD1C9] rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <MessageCircle className="w-4 h-4 text-[#1F6F54]" />
              <span>Ask on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
