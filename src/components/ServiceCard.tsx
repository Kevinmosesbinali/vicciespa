import { Calendar, MessageCircle } from 'lucide-react';
import { useSpa } from '../context/SpaContext';
import { buildWhatsAppUrl, displayServicePrice } from '../data/defaults';
import type { SpaService } from '../types';
import { ResilientImage } from './ResilientImage';

interface ServiceCardProps {
  service: SpaService;
}

export function ServiceCard({ service }: ServiceCardProps) {
  const { navigate, settings } = useSpa();
  const priceDisplay = displayServicePrice(service.priceText);
  const hasExplicitPrice = Boolean(service.priceText?.trim());

  const whatsappHref = buildWhatsAppUrl(
    settings.whatsappIntl,
    `Hello Viccie Mobile Spa, I would like to enquire about ${service.name} and request an appointment in Cape Town.`
  );

  return (
    <article className="group flex flex-col bg-white border border-[#E6DDD7] rounded-2xl overflow-hidden transition-transform duration-200 hover:-translate-y-0.5">
      <div className="aspect-[4/3] w-full overflow-hidden bg-[#F4EBE8]">
        <ResilientImage
          src={service.imageUrl}
          alt={`${service.name} mobile spa treatment in Cape Town`}
          fallbackTitle={service.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
        />
      </div>

      <div className="flex flex-col flex-1 p-6">
        <div className="flex items-center gap-2 text-xs text-[#6E5F5B] mb-2">
          <span>{service.category}</span>
          {service.durationText && (
            <>
              <span aria-hidden="true">·</span>
              <span>{service.durationText}</span>
            </>
          )}
        </div>

        <h3 className="font-display text-2xl font-semibold text-[#2C2220] leading-snug mb-2">
          {service.name}
        </h3>

        <p className="text-sm text-[#5A4C48] leading-relaxed mb-5 flex-1">
          {service.description}
        </p>

        <div className="pt-4 border-t border-[#EFE8E2] space-y-4">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-xs text-[#6E5F5B]">Treatment Rate</span>
            <span
              className={`tabular-nums text-sm ${
                hasExplicitPrice
                  ? 'font-semibold text-[#2C2220]'
                  : 'text-[#6E5F5B] italic'
              }`}
            >
              {priceDisplay}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => navigate('/booking', { treatmentId: service.id })}
              className="inline-flex items-center justify-center gap-1.5 min-h-[42px] px-3 py-2 text-xs font-medium text-white bg-[#7D4A4C] hover:bg-[#663A3C] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>Book Now</span>
            </button>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 min-h-[42px] px-3 py-2 text-xs font-medium text-[#2C2220] bg-[#FAF7F4] hover:bg-[#F4EBE8] border border-[#DDD1C9] rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#1F6F54] shrink-0" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
