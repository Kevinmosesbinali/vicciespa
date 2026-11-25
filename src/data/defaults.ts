import type {
  BusinessSettings,
  GalleryItem,
  SpaService,
  TestimonialItem,
} from '../types';

export const HERO_IMAGE_URL = '/src/assets/images/hero_spa_sanctuary_1795530687080.jpg';

export const DEFAULT_BUSINESS_SETTINGS: BusinessSettings = {
  businessName: 'Viccie Mobile Spa',
  slogan: 'Relax, Refresh, Rejuvenate – Beauty and Wellness at Your Convenience.',
  heroHeading: 'Your Beauty, Your Relaxation, Your Convenience.',
  heroIntro:
    'Thoughtfully curated mobile beauty and wellness treatments delivered straight to your home, apartment, hotel suite, or private event across Cape Town.',
  aboutHeadline: 'Calm, Restorative Beauty Care Brought to Your Doorstep in Cape Town.',
  aboutStory:
    'Viccie Mobile Spa is a Cape Town-based mobile beauty and wellness service created for clients who value unhurried self-care without the stress of traffic or waiting rooms. Whether you are preparing for a special occasion, unwinding after a demanding week, or hosting an intimate pamper gathering, we transform your own space into a quiet, hygienic, candlelit sanctuary.\n\nEvery appointment is delivered with attentive personal care, gentle precision, and respect for your privacy and comfort. From glowing facial treatments and tension-relieving massages to meticulous manicures, pedicures, reflexology, Gelish finishes, and classic lashes, our focus is simple: helping you feel refreshed, confident, and deeply cared for.',
  locationText: 'Cape Town, South Africa',
  serviceAreaLabel: 'Atlantic Seaboard · City Bowl · Southern Suburbs · Northern Suburbs',
  whatsappNumber: '0679830644',
  whatsappIntl: '27679830644',
  phoneNumber: '0704285110',
  email: '',
  operatingHours: 'Monday – Sunday · By Appointment',
  mapLat: -33.9249,
  mapLng: 18.4241,
  mapZoom: 11,
};

export const DEFAULT_SERVICES: SpaService[] = [
  {
    id: 'facial-treatments',
    name: 'Facial Treatments',
    slug: 'facial-treatments',
    category: 'Skin & Body',
    description: 'Professional facial care to cleanse, refresh and rejuvenate the skin.',
    priceText: '',
    durationText: 'In-home session',
    imageUrl: '/src/assets/images/service_facial_treatment_1795530688175.jpg',
    featured: true,
    active: true,
    sortOrder: 1,
  },
  {
    id: 'massage',
    name: 'Massage',
    slug: 'massage',
    category: 'Skin & Body',
    description: 'Relaxing massage treatments designed to relieve tension and promote relaxation.',
    priceText: '',
    durationText: 'In-home session',
    imageUrl: '/src/assets/images/service_relaxing_massage_1795530689336.jpg',
    featured: true,
    active: true,
    sortOrder: 2,
  },
  {
    id: 'pedicure',
    name: 'Pedicure',
    slug: 'pedicure',
    category: 'Hands & Feet',
    description: 'Professional foot care and nail treatments for beautiful, well-maintained feet.',
    priceText: '',
    durationText: 'In-home session',
    imageUrl: '/src/assets/images/service_pedicure_care_1795530689262.jpg',
    featured: true,
    active: true,
    sortOrder: 3,
  },
  {
    id: 'manicure',
    name: 'Manicure',
    slug: 'manicure',
    category: 'Hands & Feet',
    description: 'Nail care and grooming for elegant, beautiful hands.',
    priceText: '',
    durationText: 'In-home session',
    imageUrl: '/src/assets/images/service_manicure_care_1795530689693.jpg',
    featured: true,
    active: true,
    sortOrder: 4,
  },
  {
    id: 'reflexology',
    name: 'Reflexology',
    slug: 'reflexology',
    category: 'Skin & Body',
    description: 'Relaxing pressure-point treatments designed to promote comfort and relaxation.',
    priceText: '',
    durationText: 'In-home session',
    imageUrl: '/src/assets/images/service_reflexology_therapy_1795530689333.jpg',
    featured: false,
    active: true,
    sortOrder: 5,
  },
  {
    id: 'gelish',
    name: 'Gelish',
    slug: 'gelish',
    category: 'Hands & Feet',
    description: 'Beautiful, long-lasting gel nail finishes with stylish designs.',
    priceText: '',
    durationText: 'In-home session',
    imageUrl: '/src/assets/images/service_gelish_nails_1795530689833.jpg',
    featured: true,
    active: true,
    sortOrder: 6,
  },
  {
    id: 'classic-lashes',
    name: 'Classic Lashes',
    slug: 'classic-lashes',
    category: 'Lashes',
    description: 'Elegant classic eyelash extensions to enhance natural beauty.',
    priceText: '',
    durationText: 'In-home session',
    imageUrl: '/src/assets/images/service_classic_lashes_1795530690262.jpg',
    featured: true,
    active: true,
    sortOrder: 7,
  },
];

export const DEFAULT_GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'gallery-sanctuary',
    title: 'Private Cape Town Mobile Spa Setup',
    category: 'Spa Ambience',
    caption: 'Warm linen, botanical oils, and calming candlelight prepared inside your home.',
    imageUrl: HERO_IMAGE_URL,
    sortOrder: 1,
  },
  {
    id: 'gallery-facial',
    title: 'Botanical Glow Facial Care',
    category: 'Facials',
    caption: 'Gentle cleansing, soothing facial massage, and hydrating skincare care.',
    imageUrl: '/src/assets/images/service_facial_treatment_1795530688175.jpg',
    sortOrder: 2,
  },
  {
    id: 'gallery-massage',
    title: 'Aromatherapy Relaxation Massage',
    category: 'Massage',
    caption: 'Unwind deep shoulder and back tension in complete privacy.',
    imageUrl: '/src/assets/images/service_relaxing_massage_1795530689336.jpg',
    sortOrder: 3,
  },
  {
    id: 'gallery-pedicure',
    title: 'Rose-Petal Spa Pedicure',
    category: 'Manicure & Pedicure',
    caption: 'Restorative foot soak, gentle exfoliation, and polished finishing care.',
    imageUrl: '/src/assets/images/service_pedicure_care_1795530689262.jpg',
    sortOrder: 4,
  },
  {
    id: 'gallery-manicure',
    title: 'Refined Natural Manicure',
    category: 'Manicure & Pedicure',
    caption: 'Clean cuticle grooming, nourishing hand cream, and timeless nail shaping.',
    imageUrl: '/src/assets/images/service_manicure_care_1795530689693.jpg',
    sortOrder: 5,
  },
  {
    id: 'gallery-reflexology',
    title: 'Pressure-Point Reflexology',
    category: 'Massage',
    caption: 'Targeted foot reflexology designed to promote deep comfort and calm.',
    imageUrl: '/src/assets/images/service_reflexology_therapy_1795530689333.jpg',
    sortOrder: 6,
  },
  {
    id: 'gallery-gelish',
    title: 'Luminous Blush Gelish Finish',
    category: 'Gelish Nails',
    caption: 'Chip-resistant Gelish colour with high-gloss champagne & blush elegance.',
    imageUrl: '/src/assets/images/service_gelish_nails_1795530689833.jpg',
    sortOrder: 7,
  },
  {
    id: 'gallery-lashes',
    title: 'Feathery Classic Eyelash Extensions',
    category: 'Classic Lashes',
    caption: 'Softly defined one-by-one lash extensions tailored to frame your eyes naturally.',
    imageUrl: '/src/assets/images/service_classic_lashes_1795530690262.jpg',
    sortOrder: 8,
  },
];

export const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  {
    id: 'sample-review-1',
    clientName: 'Nomsa M.',
    suburb: 'Sea Point',
    treatmentName: 'Massage & Facial Treatments',
    quote:
      'Having a full facial and relaxing massage at home without fighting Atlantic Seaboard traffic felt wonderful. Everything was spotless, calm, and unrushed.',
    rating: 5,
    isSample: true,
    published: true,
  },
  {
    id: 'sample-review-2',
    clientName: 'Claire V.',
    suburb: 'Claremont',
    treatmentName: 'Gelish & Pedicure',
    quote:
      'My Gelish manicure and rose-water pedicure lasted beautifully for weeks. So convenient before a weekend wedding in Constantia.',
    rating: 5,
    isSample: true,
    published: true,
  },
  {
    id: 'sample-review-3',
    clientName: 'Amina K.',
    suburb: 'Century City',
    treatmentName: 'Classic Lashes & Reflexology',
    quote:
      'The classic lashes looked effortless and natural, and the reflexology session melted away a week of tension right in my living room.',
    rating: 5,
    isSample: true,
    published: true,
  },
];

export const CAPE_TOWN_AREAS = [
  'Sea Point',
  'Camps Bay',
  'Green Point',
  'City Bowl / Gardens',
  'Claremont',
  'Constantia',
  'Newlands',
  'Rondebosch',
  'Century City',
  'Bloubergstrand',
  'Durbanville',
  'Hout Bay',
];

export const BOOKING_TIME_SLOTS = [
  '08:30',
  '09:30',
  '10:30',
  '11:30',
  '13:00',
  '14:30',
  '16:00',
  '17:30',
];

export function buildWhatsAppUrl(whatsappIntl: string, message: string): string {
  const digits = whatsappIntl.replace(/\D/g, '') || '27679830644';
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function formatPhoneForTel(phoneNumber: string): string {
  const digits = phoneNumber.replace(/\D/g, '');
  if (digits.startsWith('0') && digits.length === 10) {
    return `+27${digits.slice(1)}`;
  }
  return `+${digits || '27704285110'}`;
}

export function displayServicePrice(priceText?: string): string {
  const trimmed = (priceText || '').trim();
  return trimmed.length > 0 ? trimmed : 'Contact us for pricing';
}

export function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}
