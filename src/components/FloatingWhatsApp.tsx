import { MessageCircle } from 'lucide-react';
import { useSpa } from '../context/SpaContext';
import { buildWhatsAppUrl } from '../data/defaults';

export function FloatingWhatsApp() {
  const { route, settings } = useSpa();

  if (route === '/admin') {
    return null;
  }

  const href = buildWhatsAppUrl(
    settings.whatsappIntl,
    'Hello Viccie Mobile Spa, I would like to enquire about your beauty treatments and make an appointment.'
  );

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Viccie Mobile Spa on WhatsApp"
      className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2.5 h-12 px-4 sm:px-5 rounded-full bg-[#1F6F54] hover:bg-[#185943] text-white shadow-lg transition-transform duration-150 hover:-translate-y-0.5"
    >
      <MessageCircle className="w-5 h-5 shrink-0" />
      <span className="text-sm font-medium whitespace-nowrap">WhatsApp Us</span>
    </a>
  );
}
