import { Lock, MapPin, MessageCircle, Phone } from 'lucide-react';
import { useSpa } from '../context/SpaContext';
import { buildWhatsAppUrl, formatPhoneForTel } from '../data/defaults';

export function Footer() {
  const { navigate, settings } = useSpa();

  const whatsappLink = buildWhatsAppUrl(
    settings.whatsappIntl,
    'Hello Viccie Mobile Spa, I would like to enquire about your beauty treatments and make an appointment.'
  );

  return (
    <footer className="bg-[#2C2220] text-[#FAF7F4] border-t border-[#3E312E]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand overview */}
          <div className="md:col-span-5 space-y-4">
            <p className="font-display text-2xl font-semibold tracking-tight text-white">
              {settings.businessName}
            </p>
            <p className="text-sm text-[#D8CCC6] leading-relaxed max-w-md">
              {settings.slogan}
            </p>
            <div className="flex items-start gap-2.5 text-xs text-[#C8B9B1]">
              <MapPin className="w-4 h-4 text-[#C9A374] shrink-0 mt-0.5" />
              <span>
                {settings.locationText} · {settings.serviceAreaLabel}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div className="md:col-span-3 space-y-3">
            <p className="text-xs font-semibold tracking-wider text-[#C9A374]">
              Explore
            </p>
            <ul className="space-y-2 text-sm text-[#E5DBD6]">
              <li>
                <a
                  href="/"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/');
                  }}
                  className="hover:text-white transition-colors"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/about');
                  }}
                  className="hover:text-white transition-colors"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="/services"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/services');
                  }}
                  className="hover:text-white transition-colors"
                >
                  Spa Treatments
                </a>
              </li>
              <li>
                <a
                  href="/booking"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/booking');
                  }}
                  className="hover:text-white transition-colors"
                >
                  Book Appointment
                </a>
              </li>
              <li>
                <a
                  href="/gallery"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/gallery');
                  }}
                  className="hover:text-white transition-colors"
                >
                  Gallery
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/contact');
                  }}
                  className="hover:text-white transition-colors"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Direct Contact */}
          <div className="md:col-span-4 space-y-3">
            <p className="text-xs font-semibold tracking-wider text-[#C9A374]">
              Direct Contact
            </p>
            <div className="space-y-2.5 text-sm text-[#E5DBD6]">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 hover:text-white transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-[#C9A374]" />
                <span>WhatsApp: {settings.whatsappNumber}</span>
              </a>
              <a
                href={`tel:${formatPhoneForTel(settings.phoneNumber)}`}
                className="flex items-center gap-2.5 hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4 text-[#C9A374]" />
                <span>Call: {settings.phoneNumber}</span>
              </a>
              <p className="text-xs text-[#C8B9B1] pt-1">{settings.operatingHours}</p>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[#3E312E] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#B5A59D]">
          <p>
            © {new Date().getFullYear()} {settings.businessName}. Cape Town, South Africa.
          </p>
          <a
            href="/admin"
            onClick={(e) => {
              e.preventDefault();
              navigate('/admin');
            }}
            className="inline-flex items-center gap-1.5 text-[#C8B9B1] hover:text-white transition-colors"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Admin Portal</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
