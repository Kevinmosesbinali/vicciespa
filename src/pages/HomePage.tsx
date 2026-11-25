import { ArrowRight, Calendar, Check, MapPin, MessageCircle, Phone, Star } from 'lucide-react';
import { ResilientImage } from '../components/ResilientImage';
import { ServiceCard } from '../components/ServiceCard';
import { useSpa } from '../context/SpaContext';
import { buildWhatsAppUrl, formatPhoneForTel, HERO_IMAGE_URL } from '../data/defaults';

const WHY_CHOOSE_PILLARS = [
  {
    num: '01',
    title: 'Spa Serenity at Your Doorstep',
    body: 'Skip Cape Town traffic and waiting rooms. We bring professional treatment tables, warm linens, and calming botanicals straight to your home or hotel.',
  },
  {
    num: '02',
    title: 'Unhurried, Personal Attention',
    body: 'Every session is scheduled exclusively around you—offering private, quiet care tailored to your comfort, skin needs, and pace.',
  },
  {
    num: '03',
    title: 'Thoughtful Hygiene & Preparation',
    body: 'Clean, sanitised tools, fresh soft towels, and curated beauty products prepared for every individual mobile appointment.',
  },
  {
    num: '04',
    title: 'Flexible Across Cape Town',
    body: 'Available for solo self-care mornings, bridal preparation, or intimate pamper gatherings across Cape Town suburbs.',
  },
];

export function HomePage() {
  const { navigate, settings, services, testimonials } = useSpa();

  const activeServices = services.filter((s) => s.active);
  const featuredServices = activeServices.filter((s) => s.featured).slice(0, 6);
  const displayedServices =
    featuredServices.length > 0 ? featuredServices : activeServices.slice(0, 6);

  const whatsappHeroUrl = buildWhatsAppUrl(
    settings.whatsappIntl,
    'Hello Viccie Mobile Spa, I would like to enquire about your beauty treatments and make an appointment.'
  );

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#FAF7F4] border-b border-[#E6DDD7]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            {/* Hero Copy */}
            <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
              <p className="text-xs font-medium tracking-wide text-[#7D4A4C]">
                {settings.businessName} · {settings.locationText}
              </p>

              <h1
                className="font-display font-semibold text-[#2C2220] leading-[1.08] tracking-tight [text-wrap:balance]"
                style={{ fontSize: 'clamp(2.35rem, 4vw, 3.75rem)' }}
              >
                {settings.heroHeading}
              </h1>

              <p className="text-base sm:text-lg text-[#5A4C48] leading-relaxed max-w-xl">
                {settings.heroIntro}
              </p>

              <p className="font-display italic text-lg text-[#7D4A4C]">
                “{settings.slogan}”
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/booking')}
                  className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3 text-sm font-medium text-white bg-[#7D4A4C] hover:bg-[#663A3C] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Calendar className="w-4 h-4 shrink-0" />
                  <span>Book an Appointment</span>
                </button>

                <a
                  href={whatsappHeroUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3 text-sm font-medium text-[#2C2220] bg-white hover:bg-[#F4EBE8] border border-[#DDD1C9] rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <MessageCircle className="w-4 h-4 text-[#1F6F54] shrink-0" />
                  <span>WhatsApp Us</span>
                </a>
              </div>
            </div>

            {/* Hero Editorial Visual */}
            <div className="lg:col-span-6">
              <div className="h-full min-h-[320px] lg:min-h-[460px] rounded-2xl overflow-hidden border border-[#E6DDD7] bg-[#F4EBE8]">
                <ResilientImage
                  src={HERO_IMAGE_URL}
                  alt="Viccie Mobile Spa luxury in-home setup in Cape Town"
                  fallbackTitle={settings.businessName}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Quick Trust & Service Area Strip */}
          <div className="mt-12 pt-8 border-t border-[#E6DDD7] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
            <div className="space-y-1">
              <p className="text-xs text-[#6E5F5B]">Service Format</p>
              <p className="font-medium text-[#2C2220]">Mobile Home &amp; Hotel Spa</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-[#6E5F5B]">Location</p>
              <p className="font-medium text-[#2C2220]">{settings.locationText}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-[#6E5F5B]">WhatsApp Bookings</p>
              <a
                href={whatsappHeroUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#7D4A4C] hover:underline tabular-nums"
              >
                {settings.whatsappNumber}
              </a>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-[#6E5F5B]">Direct Call</p>
              <a
                href={`tel:${formatPhoneForTel(settings.phoneNumber)}`}
                className="font-medium text-[#2C2220] hover:text-[#7D4A4C] tabular-nums"
              >
                {settings.phoneNumber}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Treatments */}
      <section className="py-16 lg:py-20 bg-white border-b border-[#E6DDD7]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="space-y-2 max-w-2xl">
              <p className="text-xs font-medium text-[#9A7245]">Signature Menu</p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#2C2220] [text-wrap:balance]">
                Featured Beauty &amp; Wellness Treatments
              </h2>
              <p className="text-sm sm:text-base text-[#5A4C48]">
                Each treatment is thoughtfully tailored and delivered at your convenience anywhere in Cape Town.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/services')}
              className="inline-flex items-center gap-2 text-sm font-medium text-[#7D4A4C] hover:text-[#5E3537] whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>View all {activeServices.length} treatments</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {displayedServices.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Viccie Mobile Spa */}
      <section className="py-16 lg:py-20 bg-[#FAF7F4] border-b border-[#E6DDD7]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-5 space-y-4">
              <p className="text-xs font-medium text-[#9A7245]">The Mobile Spa Experience</p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#2C2220] [text-wrap:balance]">
                Why Choose {settings.businessName}
              </h2>
              <p className="text-sm sm:text-base text-[#5A4C48] leading-relaxed">
                Designed around comfort, privacy, and effortless relaxation—so self-care fits naturally into your day in Cape Town.
              </p>
              <ul className="pt-2 space-y-2.5 text-sm text-[#2C2220]">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#7D4A4C] shrink-0" />
                  <span>Full mobile setup in your home, apartment, or hotel</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#7D4A4C] shrink-0" />
                  <span>Solo appointments, couples sessions, and pamper groups</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-[#7D4A4C] shrink-0" />
                  <span>Easy appointment requests via form or WhatsApp</span>
                </li>
              </ul>
              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => navigate('/about')}
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#7D4A4C] hover:text-[#5E3537] cursor-pointer"
                >
                  <span>Read our story</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {WHY_CHOOSE_PILLARS.map((item) => (
                <div
                  key={item.num}
                  className="bg-white border border-[#E6DDD7] rounded-2xl p-6 space-y-2.5"
                >
                  <p className="font-display text-2xl font-semibold text-[#9A7245] tabular-nums">
                    {item.num}.
                  </p>
                  <h3 className="font-display text-xl font-semibold text-[#2C2220]">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#5A4C48] leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-16 lg:py-20 bg-white border-b border-[#E6DDD7]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="max-w-2xl space-y-2 mb-10">
              <p className="text-xs font-medium text-[#9A7245]">Client Reflections</p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#2C2220] [text-wrap:balance]">
                Calm Moments Shared Across Cape Town
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
              {testimonials.slice(0, 6).map((item) => (
                <blockquote
                  key={item.id}
                  className="flex flex-col justify-between bg-[#FAF7F4] border border-[#E6DDD7] rounded-2xl p-6 space-y-5"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-1 text-[#B48A5A]" aria-label={`${item.rating} out of 5 stars`}>
                      {Array.from({ length: Math.min(5, Math.max(1, item.rating)) }).map(
                        (_, idx) => (
                          <Star key={idx} className="w-4 h-4 fill-current" />
                        )
                      )}
                    </div>
                    <p className="text-sm text-[#2C2220] leading-relaxed">“{item.quote}”</p>
                  </div>

                  <footer className="pt-4 border-t border-[#E6DDD7] text-xs text-[#5A4C48] space-y-0.5">
                    <p className="font-semibold text-[#2C2220] text-sm">{item.clientName}</p>
                    <p>
                      {item.suburb} · {item.treatmentName}
                      {item.isSample ? ' · Sample review' : ''}
                    </p>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact & Booking CTA Strip */}
      <section className="py-16 bg-[#F4EBE8]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="bg-white border border-[#E6DDD7] rounded-2xl p-8 sm:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-3 max-w-xl">
              <p className="text-xs font-medium text-[#9A7245]">Ready to Unwind?</p>
              <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#2C2220] [text-wrap:balance]">
                Reserve Your In-Home Spa Session in Cape Town
              </h2>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#5A4C48] pt-1">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#7D4A4C]" />
                  {settings.locationText}
                </span>
                <span className="inline-flex items-center gap-1.5 tabular-nums">
                  <MessageCircle className="w-4 h-4 text-[#1F6F54]" />
                  WhatsApp: {settings.whatsappNumber}
                </span>
                <span className="inline-flex items-center gap-1.5 tabular-nums">
                  <Phone className="w-4 h-4 text-[#7D4A4C]" />
                  Call: {settings.phoneNumber}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => navigate('/booking')}
                className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3 text-sm font-medium text-white bg-[#7D4A4C] hover:bg-[#663A3C] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Request Appointment</span>
              </button>

              <a
                href={`tel:${formatPhoneForTel(settings.phoneNumber)}`}
                className="inline-flex items-center justify-center gap-2 min-h-[48px] px-5 py-3 text-sm font-medium text-[#2C2220] bg-[#FAF7F4] hover:bg-[#EFE8E2] border border-[#DDD1C9] rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <Phone className="w-4 h-4 text-[#7D4A4C]" />
                <span>Call {settings.phoneNumber}</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
