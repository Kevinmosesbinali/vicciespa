export type AppRoute =
  | '/'
  | '/about'
  | '/services'
  | '/booking'
  | '/gallery'
  | '/contact'
  | '/admin';

export interface SpaService {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  priceText: string;
  durationText: string;
  imageUrl: string;
  featured: boolean;
  active: boolean;
  sortOrder: number;
  updatedAt?: unknown;
}

export type BookingStatus = 'pending' | 'approved' | 'completed' | 'rejected';

export interface BookingRequest {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  treatmentId: string;
  treatmentName: string;
  preferredDate: string;
  preferredTime: string;
  location: string;
  message: string;
  status: BookingStatus;
  adminNote: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export type EnquiryStatus = 'new' | 'replied' | 'archived';

export interface ContactEnquiry {
  id: string;
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  status: EnquiryStatus;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  caption: string;
  imageUrl: string;
  sortOrder: number;
  updatedAt?: unknown;
}

export interface TestimonialItem {
  id: string;
  clientName: string;
  suburb: string;
  treatmentName: string;
  quote: string;
  rating: number;
  isSample: boolean;
  published: boolean;
  updatedAt?: unknown;
}

export interface BusinessSettings {
  businessName: string;
  slogan: string;
  heroHeading: string;
  heroIntro: string;
  aboutHeadline: string;
  aboutStory: string;
  locationText: string;
  serviceAreaLabel: string;
  whatsappNumber: string;
  whatsappIntl: string;
  phoneNumber: string;
  email: string;
  operatingHours: string;
  mapLat: number;
  mapLng: number;
  mapZoom: number;
  updatedAt?: unknown;
}
