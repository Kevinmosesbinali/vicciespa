import React, { useEffect, useMemo, useState } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  Calendar,
  Check,
  Image as ImageIcon,
  Loader2,
  Lock,
  LogOut,
  Mail,
  MessageCircle,
  Plus,
  Save,
  Settings,
  Sparkles,
  Star,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { ResilientImage } from '../components/ResilientImage';
import { useSpa } from '../context/SpaContext';
import {
  buildWhatsAppUrl,
  displayServicePrice,
  sanitizeSlug,
} from '../data/defaults';
import {
  db,
  handleFirestoreError,
  OperationType,
  signInWithGoogle,
  signOutAdmin,
} from '../firebase';
import type {
  BookingRequest,
  BookingStatus,
  BusinessSettings,
  ContactEnquiry,
  EnquiryStatus,
  GalleryItem,
  SpaService,
  TestimonialItem,
} from '../types';

type AdminTab =
  | 'appointments'
  | 'services'
  | 'gallery'
  | 'enquiries'
  | 'testimonials'
  | 'settings';

function formatClientWhatsApp(phone: string, text: string): string {
  const digits = phone.replace(/\D/g, '');
  const intl = digits.startsWith('0') && digits.length === 10 ? `27${digits.slice(1)}` : digits;
  return `https://wa.me/${intl}?text=${encodeURIComponent(text)}`;
}

const BOOKING_STATUS_STYLES: Record<BookingStatus, string> = {
  pending: 'text-[#8C5B19] bg-[#FDF6E9] border-[#EAD3A8]',
  approved: 'text-[#1F6F54] bg-[#E8F5EF] border-[#B6DEC9]',
  completed: 'text-[#394A59] bg-[#EEF2F6] border-[#C9D4DF]',
  rejected: 'text-[#8E2A2A] bg-[#FDF2F2] border-[#E8BABA]',
};

const ENQUIRY_STATUS_STYLES: Record<EnquiryStatus, string> = {
  new: 'text-[#8C5B19] bg-[#FDF6E9] border-[#EAD3A8]',
  replied: 'text-[#1F6F54] bg-[#E8F5EF] border-[#B6DEC9]',
  archived: 'text-[#5A4C48] bg-[#F4EBE8] border-[#DDD1C9]',
};

export function AdminPage() {
  const { user, authReady, isAdmin, services, gallery, settings, showToast } = useSpa();

  const [activeTab, setActiveTab] = useState<AdminTab>('appointments');
  const [signingIn, setSigningIn] = useState(false);

  // Admin-only collections
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [enquiries, setEnquiries] = useState<ContactEnquiry[]>([]);
  const [allTestimonials, setAllTestimonials] = useState<TestimonialItem[]>([]);
  const [bookingFilter, setBookingFilter] = useState<'all' | BookingStatus>('all');
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});

  // Service Editor state
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [svcName, setSvcName] = useState('');
  const [svcCategory, setSvcCategory] = useState('Skin & Body');
  const [svcDescription, setSvcDescription] = useState('');
  const [svcPriceText, setSvcPriceText] = useState('');
  const [svcDurationText, setSvcDurationText] = useState('In-home session');
  const [svcImageUrl, setSvcImageUrl] = useState(
    '/src/assets/images/service_facial_treatment_1795530688175.jpg'
  );
  const [svcFeatured, setSvcFeatured] = useState(true);
  const [svcActive, setSvcActive] = useState(true);
  const [svcSortOrder, setSvcSortOrder] = useState(1);
  const [savingService, setSavingService] = useState(false);

  // Gallery Form state
  const [galTitle, setGalTitle] = useState('');
  const [galCategory, setGalCategory] = useState('Facials');
  const [galCaption, setGalCaption] = useState('');
  const [galImageUrl, setGalImageUrl] = useState('');
  const [galSortOrder, setGalSortOrder] = useState(1);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [savingGallery, setSavingGallery] = useState(false);

  // Testimonial Form state
  const [testiClientName, setTestiClientName] = useState('');
  const [testiSuburb, setTestiSuburb] = useState('Cape Town');
  const [testiTreatment, setTestiTreatment] = useState('Facial Treatments');
  const [testiQuote, setTestiQuote] = useState('');
  const [testiRating, setTestiRating] = useState(5);
  const [testiIsSample, setTestiIsSample] = useState(false);
  const [testiPublished, setTestiPublished] = useState(true);
  const [savingTestimonial, setSavingTestimonial] = useState(false);

  // Business Settings Form state
  const [bizForm, setBizForm] = useState<BusinessSettings>(settings);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    setBizForm(settings);
  }, [settings]);

  // Attach admin-only Firestore listeners ONLY when authenticated as admin
  useEffect(() => {
    if (!authReady || !isAdmin) return;

    const unsubBookings = onSnapshot(
      query(collection(db, 'bookings'), orderBy('createdAt', 'desc')),
      (snap) => {
        const items = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<BookingRequest, 'id'>),
        }));
        setBookings(items);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'bookings')
    );

    const unsubEnquiries = onSnapshot(
      query(collection(db, 'enquiries'), orderBy('createdAt', 'desc')),
      (snap) => {
        const items = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<ContactEnquiry, 'id'>),
        }));
        setEnquiries(items);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'enquiries')
    );

    const unsubTestimonials = onSnapshot(
      collection(db, 'testimonials'),
      (snap) => {
        const items = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<TestimonialItem, 'id'>),
        }));
        setAllTestimonials(items);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'testimonials')
    );

    return () => {
      unsubBookings();
      unsubEnquiries();
      unsubTestimonials();
    };
  }, [authReady, isAdmin]);

  const handleSignIn = async () => {
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } catch {
      showToast('error', 'Google sign-in was cancelled or blocked.');
    } finally {
      setSigningIn(false);
    }
  };

  const filteredBookings = useMemo(() => {
    if (bookingFilter === 'all') return bookings;
    return bookings.filter((b) => b.status === bookingFilter);
  }, [bookings, bookingFilter]);

  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const approvedCount = bookings.filter((b) => b.status === 'approved').length;
  const unreadEnquiries = enquiries.filter((e) => e.status === 'new').length;

  const updateBookingStatus = async (booking: BookingRequest, nextStatus: BookingStatus) => {
    const note = (adminNotes[booking.id] ?? booking.adminNote ?? '').slice(0, 500);
    try {
      await updateDoc(doc(db, 'bookings', booking.id), {
        status: nextStatus,
        adminNote: note,
        updatedAt: serverTimestamp(),
      });
      showToast('success', `Appointment marked as ${nextStatus}.`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `bookings/${booking.id}`);
    }
  };

  const removeBooking = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'bookings', id));
      showToast('success', 'Appointment request removed.');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `bookings/${id}`);
    }
  };

  const updateEnquiryStatus = async (id: string, status: EnquiryStatus) => {
    try {
      await updateDoc(doc(db, 'enquiries', id), {
        status,
        updatedAt: serverTimestamp(),
      });
      showToast('success', `Enquiry marked as ${status}.`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `enquiries/${id}`);
    }
  };

  const removeEnquiry = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'enquiries', id));
      showToast('success', 'Enquiry deleted.');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `enquiries/${id}`);
    }
  };

  const loadServiceIntoEditor = (svc: SpaService) => {
    setEditingServiceId(svc.id);
    setSvcName(svc.name);
    setSvcCategory(svc.category);
    setSvcDescription(svc.description);
    setSvcPriceText(svc.priceText);
    setSvcDurationText(svc.durationText);
    setSvcImageUrl(svc.imageUrl);
    setSvcFeatured(svc.featured);
    setSvcActive(svc.active);
    setSvcSortOrder(svc.sortOrder);
  };

  const resetServiceEditor = () => {
    setEditingServiceId(null);
    setSvcName('');
    setSvcCategory('Skin & Body');
    setSvcDescription('');
    setSvcPriceText('');
    setSvcDurationText('In-home session');
    setSvcImageUrl('/src/assets/images/service_facial_treatment_1795530688175.jpg');
    setSvcFeatured(true);
    setSvcActive(true);
    setSvcSortOrder(services.length + 1);
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = svcName.trim();
    const cleanDesc = svcDescription.trim();
    if (cleanName.length < 2 || cleanDesc.length < 10) {
      showToast('error', 'Service name (min 2 chars) and description (min 10 chars) are required.');
      return;
    }

    const slug = sanitizeSlug(cleanName) || `service-${Date.now()}`;
    const docId = editingServiceId || slug;
    setSavingService(true);
    try {
      await setDoc(doc(db, 'services', docId), {
        name: cleanName.slice(0, 100),
        slug,
        category: svcCategory.trim().slice(0, 60) || 'Beauty & Wellness',
        description: cleanDesc.slice(0, 800),
        priceText: svcPriceText.trim().slice(0, 80),
        durationText: svcDurationText.trim().slice(0, 60),
        imageUrl: svcImageUrl.trim().slice(0, 500),
        featured: svcFeatured,
        active: svcActive,
        sortOrder: Number(svcSortOrder) || 1,
        updatedAt: serverTimestamp(),
      });
      showToast('success', `Saved treatment "${cleanName}".`);
      resetServiceEditor();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `services/${docId}`);
    } finally {
      setSavingService(false);
    }
  };

  const handleDeleteService = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'services', id));
      showToast('success', 'Treatment removed.');
      if (editingServiceId === id) {
        resetServiceEditor();
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `services/${id}`);
    }
  };

  const handleFileUpload = async (
    file: File | undefined,
    onUrlReady: (url: string) => void
  ) => {
    if (!file || !user) return;
    if (file.size > 2.8 * 1024 * 1024) {
      showToast('error', 'Please choose an image smaller than 2.8MB.');
      return;
    }

    setUploadingImage(true);
    try {
      const idToken = await user.getIdToken();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });

      const res = await fetch('/api/uploads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ dataUrl }),
      });

      const body = (await res.json()) as { imageUrl?: string; error?: string };
      if (!res.ok || !body.imageUrl) {
        throw new Error(body.error || 'Upload failed.');
      }
      onUrlReady(body.imageUrl);
      showToast('success', 'Image uploaded securely.');
    } catch (error) {
      showToast(
        'error',
        error instanceof Error ? error.message : 'Failed to upload image.'
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (galTitle.trim().length < 2 || galImageUrl.trim().length < 1) {
      showToast('error', 'Please provide an image title and upload or paste an image URL.');
      return;
    }
    const docId = `gal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setSavingGallery(true);
    try {
      await setDoc(doc(db, 'gallery', docId), {
        title: galTitle.trim().slice(0, 120),
        category: galCategory.trim().slice(0, 60) || 'Spa Ambience',
        caption: galCaption.trim().slice(0, 300),
        imageUrl: galImageUrl.trim().slice(0, 500),
        sortOrder: Number(galSortOrder) || gallery.length + 1,
        updatedAt: serverTimestamp(),
      });
      showToast('success', 'Gallery image published.');
      setGalTitle('');
      setGalCaption('');
      setGalImageUrl('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `gallery/${docId}`);
    } finally {
      setSavingGallery(false);
    }
  };

  const handleDeleteGalleryItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'gallery', id));
      showToast('success', 'Gallery image removed.');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `gallery/${id}`);
    }
  };

  const handleAddTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (testiClientName.trim().length < 2 || testiQuote.trim().length < 10) {
      showToast('error', 'Client name and testimonial quote (min 10 chars) are required.');
      return;
    }
    const docId = `rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setSavingTestimonial(true);
    try {
      await setDoc(doc(db, 'testimonials', docId), {
        clientName: testiClientName.trim().slice(0, 100),
        suburb: testiSuburb.trim().slice(0, 80) || 'Cape Town',
        treatmentName: testiTreatment.trim().slice(0, 100) || 'Spa Treatment',
        quote: testiQuote.trim().slice(0, 600),
        rating: Math.min(5, Math.max(1, Number(testiRating) || 5)),
        isSample: testiIsSample,
        published: testiPublished,
        updatedAt: serverTimestamp(),
      });
      showToast('success', 'Testimonial saved.');
      setTestiClientName('');
      setTestiQuote('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `testimonials/${docId}`);
    } finally {
      setSavingTestimonial(false);
    }
  };

  const toggleTestimonialPublish = async (item: TestimonialItem) => {
    try {
      await updateDoc(doc(db, 'testimonials', item.id), {
        published: !item.published,
        updatedAt: serverTimestamp(),
      });
      showToast('success', item.published ? 'Testimonial hidden.' : 'Testimonial published.');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `testimonials/${item.id}`);
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'testimonials', id));
      showToast('success', 'Testimonial deleted.');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `testimonials/${id}`);
    }
  };

  const handleSaveBusinessSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await setDoc(doc(db, 'settings', 'business'), {
        businessName: bizForm.businessName.trim().slice(0, 120),
        slogan: bizForm.slogan.trim().slice(0, 200),
        heroHeading: bizForm.heroHeading.trim().slice(0, 200),
        heroIntro: bizForm.heroIntro.trim().slice(0, 600),
        aboutHeadline: bizForm.aboutHeadline.trim().slice(0, 200),
        aboutStory: bizForm.aboutStory.trim().slice(0, 2500),
        locationText: bizForm.locationText.trim().slice(0, 160),
        serviceAreaLabel: bizForm.serviceAreaLabel.trim().slice(0, 200),
        whatsappNumber: bizForm.whatsappNumber.trim().slice(0, 20),
        whatsappIntl: bizForm.whatsappIntl.trim().slice(0, 20),
        phoneNumber: bizForm.phoneNumber.trim().slice(0, 20),
        email: bizForm.email.trim().slice(0, 150),
        operatingHours: bizForm.operatingHours.trim().slice(0, 160),
        mapLat: Number(bizForm.mapLat) || -33.9249,
        mapLng: Number(bizForm.mapLng) || 18.4241,
        mapZoom: Math.min(22, Math.max(1, Number(bizForm.mapZoom) || 11)),
        updatedAt: serverTimestamp(),
      });
      showToast('success', 'Business details & website content updated.');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/business');
    } finally {
      setSavingSettings(false);
    }
  };

  if (!authReady) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-[#FAF7F4]">
        <Loader2 className="w-7 h-7 animate-spin text-[#7D4A4C]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-[#FAF7F4] py-20 px-4">
        <div className="max-w-md mx-auto bg-white border border-[#E6DDD7] rounded-2xl p-8 text-center space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-[#F4EBE8] text-[#7D4A4C] flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h1 className="font-display text-3xl font-semibold text-[#2C2220]">
              Admin Portal
            </h1>
            <p className="text-sm text-[#5A4C48] leading-relaxed">
              Sign in with your authorized Viccie Mobile Spa administrator Google account to manage appointments, services, pricing, gallery images, and website content.
            </p>
          </div>
          <button
            type="button"
            disabled={signingIn}
            onClick={handleSignIn}
            className="w-full min-h-[48px] inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium text-white bg-[#7D4A4C] hover:bg-[#663A3C] disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
          >
            {signingIn ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign in with Google</span>
            )}
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="bg-[#FAF7F4] py-20 px-4">
        <div className="max-w-md mx-auto bg-white border border-[#E6DDD7] rounded-2xl p-8 text-center space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-[#FDF2F2] text-[#8E2A2A] flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h1 className="font-display text-3xl font-semibold text-[#2C2220]">
              Access Restricted
            </h1>
            <p className="text-sm text-[#5A4C48] leading-relaxed">
              Signed in as <strong className="text-[#2C2220]">{user.email}</strong>. This account does not have administrator permissions for Viccie Mobile Spa.
            </p>
          </div>
          <button
            type="button"
            onClick={() => signOutAdmin()}
            className="w-full min-h-[46px] inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-[#2C2220] bg-[#FAF7F4] hover:bg-[#EFE8E2] border border-[#DDD1C9] rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#FAF7F4] py-10 lg:py-14 min-h-[80vh]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-8">
        {/* Admin Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E6DDD7]">
          <div className="space-y-1">
            <p className="text-xs font-medium text-[#9A7245]">
              Viccie Mobile Spa Management · {user.email}
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#2C2220]">
              Admin Dashboard
            </h1>
          </div>

          <button
            type="button"
            onClick={() => signOutAdmin()}
            className="inline-flex items-center gap-2 min-h-[42px] px-4 py-2 text-xs font-medium text-[#2C2220] bg-white hover:bg-[#F4EBE8] border border-[#DDD1C9] rounded-lg transition-colors self-start sm:self-auto cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Summary KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-[#E6DDD7] rounded-2xl p-5">
            <p className="text-xs text-[#6E5F5B]">Pending Requests</p>
            <p className="font-display text-3xl font-semibold text-[#2C2220] mt-1 tabular-nums">
              {pendingCount}
            </p>
          </div>
          <div className="bg-white border border-[#E6DDD7] rounded-2xl p-5">
            <p className="text-xs text-[#6E5F5B]">Approved Bookings</p>
            <p className="font-display text-3xl font-semibold text-[#1F6F54] mt-1 tabular-nums">
              {approvedCount}
            </p>
          </div>
          <div className="bg-white border border-[#E6DDD7] rounded-2xl p-5">
            <p className="text-xs text-[#6E5F5B]">New Enquiries</p>
            <p className="font-display text-3xl font-semibold text-[#7D4A4C] mt-1 tabular-nums">
              {unreadEnquiries}
            </p>
          </div>
          <div className="bg-white border border-[#E6DDD7] rounded-2xl p-5">
            <p className="text-xs text-[#6E5F5B]">Active Treatments</p>
            <p className="font-display text-3xl font-semibold text-[#2C2220] mt-1 tabular-nums">
              {services.filter((s) => s.active).length}
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div
          role="tablist"
          aria-label="Admin dashboard sections"
          className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#EFE8E2] rounded-xl"
        >
          {(
            [
              { id: 'appointments', label: 'Appointments', icon: Calendar },
              { id: 'services', label: 'Services & Pricing', icon: Sparkles },
              { id: 'gallery', label: 'Gallery', icon: ImageIcon },
              { id: 'enquiries', label: 'Enquiries', icon: Mail },
              { id: 'testimonials', label: 'Testimonials', icon: Star },
              { id: 'settings', label: 'Business & Content', icon: Settings },
            ] as const
          ).map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-white text-[#2C2220] shadow-xs'
                    : 'text-[#5A4C48] hover:text-[#2C2220]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: APPOINTMENTS */}
        {activeTab === 'appointments' && (
          <section className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 className="font-display text-2xl font-semibold text-[#2C2220]">
                Appointment Requests
              </h2>
              <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-[#EFE8E2] rounded-lg">
                {(['all', 'pending', 'approved', 'completed', 'rejected'] as const).map(
                  (status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setBookingFilter(status)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize cursor-pointer ${
                        bookingFilter === status
                          ? 'bg-white text-[#2C2220] shadow-xs'
                          : 'text-[#5A4C48]'
                      }`}
                    >
                      {status}
                    </button>
                  )
                )}
              </div>
            </div>

            {filteredBookings.length === 0 ? (
              <div className="bg-white border border-[#E6DDD7] rounded-2xl p-10 text-center text-sm text-[#6E5F5B]">
                No appointment requests match this filter yet.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-white border border-[#E6DDD7] rounded-2xl p-6 space-y-4"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <h3 className="font-display text-2xl font-semibold text-[#2C2220]">
                            {booking.customerName}
                          </h3>
                          <span
                            className={`px-2.5 py-0.5 text-xs font-medium rounded-md border capitalize ${
                              BOOKING_STATUS_STYLES[booking.status]
                            }`}
                          >
                            {booking.status}
                          </span>
                        </div>
                        <p className="text-xs text-[#6E5F5B]">
                          Ref: <span className="font-mono">{booking.id}</span> ·{' '}
                          <span className="tabular-nums">
                            {booking.preferredDate} at {booking.preferredTime}
                          </span>{' '}
                          · {booking.location}
                        </p>
                      </div>

                      <a
                        href={formatClientWhatsApp(
                          booking.phone,
                          `Hello ${booking.customerName}, this is ${settings.businessName} regarding your ${booking.treatmentName} request for ${booking.preferredDate} at ${booking.preferredTime} (${booking.location}).`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-[#1F6F54] hover:bg-[#185943] rounded-lg whitespace-nowrap shrink-0 self-start"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp Client</span>
                      </a>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#FAF7F4] border border-[#EFE8E2] rounded-xl p-4 text-sm">
                      <div>
                        <p className="text-xs text-[#6E5F5B]">Treatment</p>
                        <p className="font-medium text-[#2C2220]">{booking.treatmentName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#6E5F5B]">Phone / WhatsApp</p>
                        <p className="font-medium text-[#2C2220] tabular-nums">{booking.phone}</p>
                      </div>
                      <div>
                        <p className="text-xs text-[#6E5F5B]">Email</p>
                        <p className="text-[#2C2220] break-all">
                          {booking.email || 'Not provided'}
                        </p>
                      </div>
                      {booking.message && (
                        <div className="sm:col-span-3">
                          <p className="text-xs text-[#6E5F5B]">Customer Notes</p>
                          <p className="text-[#5A4C48]">{booking.message}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-center gap-3 pt-1">
                      <input
                        type="text"
                        maxLength={500}
                        value={adminNotes[booking.id] ?? booking.adminNote ?? ''}
                        onChange={(e) =>
                          setAdminNotes((prev) => ({
                            ...prev,
                            [booking.id]: e.target.value,
                          }))
                        }
                        placeholder="Internal therapist / dispatch note..."
                        className="flex-1 min-h-[40px] px-3.5 py-2 text-xs bg-[#FAF7F4] border border-[#DDD1C9] rounded-lg"
                      />

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateBookingStatus(booking, 'approved')}
                          className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-white bg-[#1F6F54] hover:bg-[#185943] rounded-lg cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => updateBookingStatus(booking, 'completed')}
                          className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-[#2C2220] bg-[#EFE8E2] hover:bg-[#E2D5CC] rounded-lg cursor-pointer"
                        >
                          <span>Complete</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => updateBookingStatus(booking, 'rejected')}
                          className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-[#8E2A2A] bg-[#FDF2F2] hover:bg-[#F9E1E1] border border-[#E8BABA] rounded-lg cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => removeBooking(booking.id)}
                          aria-label="Delete booking"
                          className="inline-flex items-center justify-center w-9 h-9 text-[#8E2A2A] hover:bg-[#FDF2F2] rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* TAB 2: SERVICES & PRICING */}
        {activeTab === 'services' && (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Service Editor Form */}
            <form
              onSubmit={handleSaveService}
              className="lg:col-span-5 bg-white border border-[#E6DDD7] rounded-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl font-semibold text-[#2C2220]">
                  {editingServiceId ? 'Edit Treatment' : 'Add New Treatment'}
                </h2>
                {editingServiceId && (
                  <button
                    type="button"
                    onClick={resetServiceEditor}
                    className="text-xs text-[#7D4A4C] hover:underline cursor-pointer"
                  >
                    New Treatment
                  </button>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#2C2220]">
                  Treatment Name
                </label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={svcName}
                  onChange={(e) => setSvcName(e.target.value)}
                  placeholder="e.g. Hot Stone Massage"
                  className="w-full min-h-[42px] px-3.5 py-2 text-sm bg-[#FAF7F4] border border-[#DDD1C9] rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#2C2220]">
                    Category
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={60}
                    value={svcCategory}
                    onChange={(e) => setSvcCategory(e.target.value)}
                    className="w-full min-h-[42px] px-3 py-2 text-sm bg-[#FAF7F4] border border-[#DDD1C9] rounded-lg"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#2C2220]">
                    Price (blank = Contact us)
                  </label>
                  <input
                    type="text"
                    maxLength={80}
                    value={svcPriceText}
                    onChange={(e) => setSvcPriceText(e.target.value)}
                    placeholder="e.g. R450"
                    className="w-full min-h-[42px] px-3 py-2 text-sm bg-[#FAF7F4] border border-[#DDD1C9] rounded-lg tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#2C2220]">
                    Session Label
                  </label>
                  <input
                    type="text"
                    maxLength={60}
                    value={svcDurationText}
                    onChange={(e) => setSvcDurationText(e.target.value)}
                    placeholder="In-home session"
                    className="w-full min-h-[42px] px-3 py-2 text-sm bg-[#FAF7F4] border border-[#DDD1C9] rounded-lg"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#2C2220]">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={1000}
                    value={svcSortOrder}
                    onChange={(e) => setSvcSortOrder(Number(e.target.value))}
                    className="w-full min-h-[42px] px-3 py-2 text-sm bg-[#FAF7F4] border border-[#DDD1C9] rounded-lg tabular-nums"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#2C2220]">
                  Description
                </label>
                <textarea
                  rows={3}
                  required
                  maxLength={800}
                  value={svcDescription}
                  onChange={(e) => setSvcDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F4] border border-[#DDD1C9] rounded-lg"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#2C2220]">
                  Image URL or Upload
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    maxLength={500}
                    value={svcImageUrl}
                    onChange={(e) => setSvcImageUrl(e.target.value)}
                    className="flex-1 min-h-[42px] px-3 py-2 text-xs bg-[#FAF7F4] border border-[#DDD1C9] rounded-lg"
                  />
                  <label className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-[#EFE8E2] hover:bg-[#E2D5CC] text-[#2C2220] rounded-lg cursor-pointer shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploadingImage ? '...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleFileUpload(e.target.files?.[0], (url) => setSvcImageUrl(url))
                      }
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs text-[#2C2220]">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={svcFeatured}
                    onChange={(e) => setSvcFeatured(e.target.checked)}
                  />
                  <span>Featured on Homepage</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={svcActive}
                    onChange={(e) => setSvcActive(e.target.checked)}
                  />
                  <span>Visible to Clients</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={savingService}
                className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#7D4A4C] hover:bg-[#663A3C] rounded-lg cursor-pointer"
              >
                {savingService ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{editingServiceId ? 'Update Treatment' : 'Add Treatment'}</span>
              </button>
            </form>

            {/* Services List */}
            <div className="lg:col-span-7 space-y-3">
              {services.map((svc) => (
                <div
                  key={svc.id}
                  className="bg-white border border-[#E6DDD7] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  <div className="w-full sm:w-24 h-20 rounded-xl overflow-hidden bg-[#F4EBE8] shrink-0">
                    <ResilientImage
                      src={svc.imageUrl}
                      alt={svc.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 text-xs text-[#6E5F5B]">
                      <span>{svc.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">{displayServicePrice(svc.priceText)}</span>
                      {!svc.active && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-[#8E2A2A]">Hidden</span>
                        </>
                      )}
                    </div>
                    <h3 className="font-display text-xl font-semibold text-[#2C2220] truncate">
                      {svc.name}
                    </h3>
                    <p className="text-xs text-[#5A4C48] line-clamp-2">{svc.description}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => loadServiceIntoEditor(svc)}
                      className="px-3 py-1.5 text-xs font-medium text-[#2C2220] bg-[#FAF7F4] hover:bg-[#EFE8E2] border border-[#DDD1C9] rounded-lg cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteService(svc.id)}
                      aria-label={`Delete ${svc.name}`}
                      className="p-2 text-[#8E2A2A] hover:bg-[#FDF2F2] rounded-lg cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 3: GALLERY */}
        {activeTab === 'gallery' && (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <form
              onSubmit={handleSaveGalleryItem}
              className="lg:col-span-5 bg-white border border-[#E6DDD7] rounded-2xl p-6 space-y-4"
            >
              <h2 className="font-display text-2xl font-semibold text-[#2C2220]">
                Upload Gallery Image
              </h2>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#2C2220]">
                  Image File Upload
                </label>
                <label className="flex flex-col items-center justify-center gap-2 border border-dashed border-[#CBB8AA] bg-[#FAF7F4] hover:bg-[#F4EBE8] rounded-xl p-5 text-center cursor-pointer transition-colors">
                  <Upload className="w-5 h-5 text-[#7D4A4C]" />
                  <span className="text-xs font-medium text-[#2C2220]">
                    {uploadingImage
                      ? 'Uploading image...'
                      : 'Choose JPEG, PNG, or WebP from your device'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleFileUpload(e.target.files?.[0], (url) => setGalImageUrl(url))
                    }
                  />
                </label>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#2C2220]">
                  Or Paste Image URL
                </label>
                <input
                  type="text"
                  required
                  maxLength={500}
                  value={galImageUrl}
                  onChange={(e) => setGalImageUrl(e.target.value)}
                  placeholder="/uploads/... or https://..."
                  className="w-full min-h-[42px] px-3.5 py-2 text-xs bg-[#FAF7F4] border border-[#DDD1C9] rounded-lg"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#2C2220]">
                  Photo Title
                </label>
                <input
                  type="text"
                  required
                  maxLength={120}
                  value={galTitle}
                  onChange={(e) => setGalTitle(e.target.value)}
                  placeholder="e.g. Blush Gelish Nails"
                  className="w-full min-h-[42px] px-3.5 py-2 text-sm bg-[#FAF7F4] border border-[#DDD1C9] rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#2C2220]">
                    Category
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={60}
                    value={galCategory}
                    onChange={(e) => setGalCategory(e.target.value)}
                    className="w-full min-h-[42px] px-3 py-2 text-sm bg-[#FAF7F4] border border-[#DDD1C9] rounded-lg"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#2C2220]">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={1000}
                    value={galSortOrder}
                    onChange={(e) => setGalSortOrder(Number(e.target.value))}
                    className="w-full min-h-[42px] px-3 py-2 text-sm bg-[#FAF7F4] border border-[#DDD1C9] rounded-lg tabular-nums"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#2C2220]">
                  Caption
                </label>
                <input
                  type="text"
                  maxLength={300}
                  value={galCaption}
                  onChange={(e) => setGalCaption(e.target.value)}
                  placeholder="Short description shown in lightbox"
                  className="w-full min-h-[42px] px-3.5 py-2 text-sm bg-[#FAF7F4] border border-[#DDD1C9] rounded-lg"
                />
              </div>

              <button
                type="submit"
                disabled={savingGallery || uploadingImage}
                className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#7D4A4C] hover:bg-[#663A3C] rounded-lg cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add to Gallery</span>
              </button>
            </form>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {gallery.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-[#E6DDD7] rounded-2xl overflow-hidden flex flex-col"
                >
                  <div className="aspect-[4/3] bg-[#F4EBE8]">
                    <ResilientImage
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-[#9A7245]">{item.category}</p>
                      <h3 className="font-display text-lg font-semibold text-[#2C2220]">
                        {item.title}
                      </h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteGalleryItem(item.id)}
                      aria-label={`Delete ${item.title}`}
                      className="p-2 text-[#8E2A2A] hover:bg-[#FDF2F2] rounded-lg cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 4: ENQUIRIES */}
        {activeTab === 'enquiries' && (
          <section className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-[#2C2220]">
              Customer Enquiries
            </h2>
            {enquiries.length === 0 ? (
              <div className="bg-white border border-[#E6DDD7] rounded-2xl p-10 text-center text-sm text-[#6E5F5B]">
                No contact enquiries received yet.
              </div>
            ) : (
              enquiries.map((enq) => (
                <div
                  key={enq.id}
                  className="bg-white border border-[#E6DDD7] rounded-2xl p-6 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h3 className="font-display text-2xl font-semibold text-[#2C2220]">
                          {enq.name}
                        </h3>
                        <span
                          className={`px-2.5 py-0.5 text-xs font-medium rounded-md border capitalize ${
                            ENQUIRY_STATUS_STYLES[enq.status]
                          }`}
                        >
                          {enq.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#6E5F5B] tabular-nums">
                        {enq.phone} {enq.email ? `· ${enq.email}` : ''}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={formatClientWhatsApp(
                          enq.phone,
                          `Hello ${enq.name}, thank you for contacting ${settings.businessName}. Regarding "${enq.subject}":`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#1F6F54] rounded-lg"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Reply on WhatsApp</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => updateEnquiryStatus(enq.id, 'replied')}
                        className="px-3 py-1.5 text-xs font-medium text-[#2C2220] bg-[#FAF7F4] border border-[#DDD1C9] rounded-lg cursor-pointer"
                      >
                        Mark Replied
                      </button>
                      <button
                        type="button"
                        onClick={() => updateEnquiryStatus(enq.id, 'archived')}
                        className="px-3 py-1.5 text-xs font-medium text-[#5A4C48] bg-[#FAF7F4] border border-[#DDD1C9] rounded-lg cursor-pointer"
                      >
                        Archive
                      </button>
                      <button
                        type="button"
                        onClick={() => removeEnquiry(enq.id)}
                        aria-label="Delete enquiry"
                        className="p-2 text-[#8E2A2A] hover:bg-[#FDF2F2] rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#FAF7F4] border border-[#EFE8E2] rounded-xl p-4 space-y-1">
                    <p className="text-xs font-semibold text-[#2C2220]">{enq.subject}</p>
                    <p className="text-sm text-[#5A4C48]">{enq.message}</p>
                  </div>
                </div>
              ))
            )}
          </section>
        )}

        {/* TAB 5: TESTIMONIALS */}
        {activeTab === 'testimonials' && (
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <form
              onSubmit={handleAddTestimonial}
              className="lg:col-span-5 bg-white border border-[#E6DDD7] rounded-2xl p-6 space-y-4"
            >
              <h2 className="font-display text-2xl font-semibold text-[#2C2220]">
                Add Client Testimonial
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#2C2220]">
                    Client Name
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={testiClientName}
                    onChange={(e) => setTestiClientName(e.target.value)}
                    placeholder="e.g. Sarah T."
                    className="w-full min-h-[42px] px-3 py-2 text-sm bg-[#FAF7F4] border border-[#DDD1C9] rounded-lg"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#2C2220]">
                    Cape Town Suburb
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={80}
                    value={testiSuburb}
                    onChange={(e) => setTestiSuburb(e.target.value)}
                    className="w-full min-h-[42px] px-3 py-2 text-sm bg-[#FAF7F4] border border-[#DDD1C9] rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#2C2220]">
                    Treatment
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    value={testiTreatment}
                    onChange={(e) => setTestiTreatment(e.target.value)}
                    className="w-full min-h-[42px] px-3 py-2 text-sm bg-[#FAF7F4] border border-[#DDD1C9] rounded-lg"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#2C2220]">
                    Rating (1–5)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={testiRating}
                    onChange={(e) => setTestiRating(Number(e.target.value))}
                    className="w-full min-h-[42px] px-3 py-2 text-sm bg-[#FAF7F4] border border-[#DDD1C9] rounded-lg tabular-nums"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#2C2220]">
                  Client Quote
                </label>
                <textarea
                  rows={3}
                  required
                  maxLength={600}
                  value={testiQuote}
                  onChange={(e) => setTestiQuote(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F4] border border-[#DDD1C9] rounded-lg"
                />
              </div>

              <div className="flex items-center gap-6 text-xs text-[#2C2220]">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={testiPublished}
                    onChange={(e) => setTestiPublished(e.target.checked)}
                  />
                  <span>Publish on Website</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={testiIsSample}
                    onChange={(e) => setTestiIsSample(e.target.checked)}
                  />
                  <span>Mark as Sample</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={savingTestimonial}
                className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#7D4A4C] hover:bg-[#663A3C] rounded-lg cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{savingTestimonial ? 'Saving...' : 'Save Testimonial'}</span>
              </button>
            </form>

            <div className="lg:col-span-7 space-y-3">
              {allTestimonials.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-[#E6DDD7] rounded-2xl p-5 space-y-2"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-sm text-[#2C2220]">
                        {item.clientName}{' '}
                        <span className="font-normal text-[#6E5F5B]">
                          · {item.suburb} · {item.treatmentName}
                          {item.isSample ? ' · Sample' : ''}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleTestimonialPublish(item)}
                        className="px-3 py-1 text-xs font-medium rounded-lg border border-[#DDD1C9] bg-[#FAF7F4] cursor-pointer"
                      >
                        {item.published ? 'Published (Hide)' : 'Hidden (Publish)'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTestimonial(item.id)}
                        aria-label="Delete testimonial"
                        className="p-1.5 text-[#8E2A2A] hover:bg-[#FDF2F2] rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-[#5A4C48]">“{item.quote}”</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 6: BUSINESS SETTINGS & CONTENT */}
        {activeTab === 'settings' && (
          <form
            onSubmit={handleSaveBusinessSettings}
            className="bg-white border border-[#E6DDD7] rounded-2xl p-6 sm:p-8 space-y-6"
          >
            <div className="flex items-center justify-between border-b border-[#EFE8E2] pb-4">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#2C2220]">
                  Business Contact, Location &amp; Website Copy
                </h2>
                <p className="text-xs text-[#6E5F5B] mt-1">
                  Updates reflect immediately across the Home, About, Services, Booking, and Contact pages.
                </p>
              </div>
              <a
                href={buildWhatsAppUrl(
                  bizForm.whatsappIntl,
                  'Testing Viccie Mobile Spa WhatsApp link.'
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium text-[#1F6F54] hover:underline shrink-0"
              >
                Test WhatsApp Link
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#2C2220]">
                  Business Name
                </label>
                <input
                  type="text"
                  required
                  maxLength={120}
                  value={bizForm.businessName}
                  onChange={(e) => setBizForm({ ...bizForm, businessName: e.target.value })}
                  className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-[#FAF7F4] border border-[#DDD1C9] rounded-lg"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#2C2220]">
                  Location Label
                </label>
                <input
                  type="text"
                  required
                  maxLength={160}
                  value={bizForm.locationText}
                  onChange={(e) => setBizForm({ ...bizForm, locationText: e.target.value })}
                  className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-[#FAF7F4] border border-[#DDD1C9] rounded-lg"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#2C2220]">
                  WhatsApp Display Number
                </label>
                <input
                  type="text"
                  required
                  maxLength={20}
                  value={bizForm.whatsappNumber}
                  onChange={(e) => setBizForm({ ...bizForm, whatsappNumber: e.target.value })}
                  className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-[#FAF7F4] border border-[#DDD1C9] rounded-lg tabular-nums"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#2C2220]">
                  WhatsApp International Digits (e.g. 27679830644)
                </label>
                <input
                  type="text"
                  required
                  maxLength={20}
                  value={bizForm.whatsappIntl}
                  onChange={(e) => setBizForm({ ...bizForm, whatsappIntl: e.target.value })}
                  className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-[#FAF7F4] border border-[#DDD1C9] rounded-lg tabular-nums"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#2C2220]">
                  Phone / Call Number
                </label>
                <input
                  type="text"
                  required
                  maxLength={20}
                  value={bizForm.phoneNumber}
                  onChange={(e) => setBizForm({ ...bizForm, phoneNumber: e.target.value })}
                  className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-[#FAF7F4] border border-[#DDD1C9] rounded-lg tabular-nums"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#2C2220]">
                  Operating Hours
                </label>
                <input
                  type="text"
                  maxLength={160}
                  value={bizForm.operatingHours}
                  onChange={(e) => setBizForm({ ...bizForm, operatingHours: e.target.value })}
                  className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-[#FAF7F4] border border-[#DDD1C9] rounded-lg"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-xs font-medium text-[#2C2220]">
                  Cape Town Service Area Subtitle
                </label>
                <input
                  type="text"
                  required
                  maxLength={200}
                  value={bizForm.serviceAreaLabel}
                  onChange={(e) => setBizForm({ ...bizForm, serviceAreaLabel: e.target.value })}
                  className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-[#FAF7F4] border border-[#DDD1C9] rounded-lg"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-xs font-medium text-[#2C2220]">
                  Main Slogan
                </label>
                <input
                  type="text"
                  required
                  maxLength={200}
                  value={bizForm.slogan}
                  onChange={(e) => setBizForm({ ...bizForm, slogan: e.target.value })}
                  className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-[#FAF7F4] border border-[#DDD1C9] rounded-lg"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-xs font-medium text-[#2C2220]">
                  Homepage Hero Heading
                </label>
                <input
                  type="text"
                  required
                  maxLength={200}
                  value={bizForm.heroHeading}
                  onChange={(e) => setBizForm({ ...bizForm, heroHeading: e.target.value })}
                  className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-[#FAF7F4] border border-[#DDD1C9] rounded-lg"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-xs font-medium text-[#2C2220]">
                  Homepage Introduction
                </label>
                <textarea
                  rows={2}
                  required
                  maxLength={600}
                  value={bizForm.heroIntro}
                  onChange={(e) => setBizForm({ ...bizForm, heroIntro: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F4] border border-[#DDD1C9] rounded-lg"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-xs font-medium text-[#2C2220]">
                  About Page Headline
                </label>
                <input
                  type="text"
                  required
                  maxLength={200}
                  value={bizForm.aboutHeadline}
                  onChange={(e) => setBizForm({ ...bizForm, aboutHeadline: e.target.value })}
                  className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-[#FAF7F4] border border-[#DDD1C9] rounded-lg"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-xs font-medium text-[#2C2220]">
                  About Us Story
                </label>
                <textarea
                  rows={5}
                  required
                  maxLength={2500}
                  value={bizForm.aboutStory}
                  onChange={(e) => setBizForm({ ...bizForm, aboutStory: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FAF7F4] border border-[#DDD1C9] rounded-lg"
                />
              </div>

              <div className="grid grid-cols-3 gap-3 md:col-span-2">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#2C2220]">
                    Map Latitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={bizForm.mapLat}
                    onChange={(e) =>
                      setBizForm({ ...bizForm, mapLat: Number(e.target.value) })
                    }
                    className="w-full min-h-[42px] px-3 py-2 text-sm bg-[#FAF7F4] border border-[#DDD1C9] rounded-lg tabular-nums"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#2C2220]">
                    Map Longitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={bizForm.mapLng}
                    onChange={(e) =>
                      setBizForm({ ...bizForm, mapLng: Number(e.target.value) })
                    }
                    className="w-full min-h-[42px] px-3 py-2 text-sm bg-[#FAF7F4] border border-[#DDD1C9] rounded-lg tabular-nums"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-[#2C2220]">
                    Map Zoom (1–22)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={22}
                    value={bizForm.mapZoom}
                    onChange={(e) =>
                      setBizForm({ ...bizForm, mapZoom: Number(e.target.value) })
                    }
                    className="w-full min-h-[42px] px-3 py-2 text-sm bg-[#FAF7F4] border border-[#DDD1C9] rounded-lg tabular-nums"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={savingSettings}
              className="inline-flex items-center gap-2 min-h-[46px] px-6 py-2.5 text-sm font-medium text-white bg-[#7D4A4C] hover:bg-[#663A3C] rounded-lg cursor-pointer"
            >
              {savingSettings ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Save Website &amp; Contact Settings</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
