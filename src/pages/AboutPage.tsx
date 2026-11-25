import { Calendar, Heart, Home, MessageCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { ResilientImage } from '../components/ResilientImage';
import { useSpa } from '../context/SpaContext';
import { buildWhatsAppUrl, HERO_IMAGE_URL } from '../data/defaults';

const VALUES = [
  {
    icon: Home,
    title: 'True Mobile Convenience',
    body: 'Enjoy restorative beauty treatments in the privacy and warmth of your Cape Town home, apartment, or hotel room without travel stress.',
  },
  {
    icon: Sparkles,
    title: 'Calm & Self-Care',
    body: 'Each appointment is designed to slow down a busy schedule—creating quiet space to breathe, rest, and feel renewed.',
  },
  {
    icon: Heart,
    title: 'Beauty & Confidence',
    body: 'From glowing skin and nourished hands to soft classic lashes, our treatments help you step out feeling naturally confident.',
  },
  {
    icon: ShieldCheck,
    title: 'Careful, Client-First Service',
    body: 'We prioritise punctuality, thoughtful preparation, clean equipment, and attentive communication from enquiry to aftercare.',
  },
];

export function AboutPage() {
  const { navigate, settings } = useSpa();

  const whatsappUrl = buildWhatsAppUrl(
    settings.whatsappIntl,
    'Hello Viccie Mobile Spa, I would love to learn more about your mobile spa services in Cape Town.'
  );

  return (
    <div className="bg-[#FAF7F4]">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-14 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-6">
            <p className="text-xs font-medium text-[#9A7245]">
              About {settings.businessName} · {settings.locationText}
            </p>
            <h1
              className="font-display font-semibold text-[#2C2220] leading-[1.1] [text-wrap:balance]"
              style={{ fontSize: 'clamp(2.15rem, 3.6vw, 3.25rem)' }}
            >
              {settings.aboutHeadline}
            </h1>

            <div className="space-y-4 text-sm sm:text-base text-[#5A4C48] leading-relaxed whitespace-pre-line">
              {settings.aboutStory}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/booking')}
                className="inline-flex items-center justify-center gap-2 min-h-[46px] px-6 py-2.5 text-sm font-medium text-white bg-[#7D4A4C] hover:bg-[#663A3C] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>Book an Appointment</span>
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 min-h-[46px] px-5 py-2.5 text-sm font-medium text-[#2C2220] bg-white hover:bg-[#F4EBE8] border border-[#DDD1C9] rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <MessageCircle className="w-4 h-4 text-[#1F6F54]" />
                <span>WhatsApp Us</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-[#E6DDD7] bg-[#F4EBE8]">
              <ResilientImage
                src={HERO_IMAGE_URL}
                alt="Viccie Mobile Spa in-home sanctuary in Cape Town"
                fallbackTitle={settings.businessName}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Core Ethos */}
      <section className="bg-white border-y border-[#E6DDD7] py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-10 space-y-2">
            <p className="text-xs font-medium text-[#9A7245]">Our Philosophy</p>
            <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[#2C2220]">
              Built Around Relaxation, Care &amp; Convenience
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {VALUES.map((val) => {
              const Icon = val.icon;
              return (
                <div
                  key={val.title}
                  className="bg-[#FAF7F4] border border-[#E6DDD7] rounded-2xl p-6 space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#F4EBE8] flex items-center justify-center text-[#7D4A4C]">
                    <Icon className="w-5 h-5" strokeWidth={1.75} />
                  </div>
                  <h3 className="font-display text-2xl font-semibold text-[#2C2220]">
                    {val.title}
                  </h3>
                  <p className="text-sm text-[#5A4C48] leading-relaxed">{val.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
