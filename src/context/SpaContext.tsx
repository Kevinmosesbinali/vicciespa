import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import {
  auth,
  BOOTSTRAPPED_ADMIN_EMAIL,
  db,
  handleFirestoreError,
  OperationType,
} from '../firebase';
import {
  DEFAULT_BUSINESS_SETTINGS,
  DEFAULT_GALLERY_ITEMS,
  DEFAULT_SERVICES,
  DEFAULT_TESTIMONIALS,
} from '../data/defaults';
import type {
  AppRoute,
  BusinessSettings,
  GalleryItem,
  SpaService,
  TestimonialItem,
} from '../types';

interface ToastMessage {
  id: number;
  type: 'success' | 'error';
  text: string;
}

interface SpaContextValue {
  route: AppRoute;
  navigate: (to: AppRoute, options?: { treatmentId?: string }) => void;
  preselectedTreatmentId: string;
  setPreselectedTreatmentId: (id: string) => void;
  settings: BusinessSettings;
  services: SpaService[];
  gallery: GalleryItem[];
  testimonials: TestimonialItem[];
  loadingPublicData: boolean;
  user: User | null;
  authReady: boolean;
  isAdmin: boolean;
  googleMapsApiKey: string;
  toast: ToastMessage | null;
  showToast: (type: 'success' | 'error', text: string) => void;
  dismissToast: () => void;
}

const VALID_ROUTES: AppRoute[] = [
  '/',
  '/about',
  '/services',
  '/booking',
  '/gallery',
  '/contact',
  '/admin',
];

function parseRoute(pathname: string): AppRoute {
  const clean = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
  if (VALID_ROUTES.includes(clean as AppRoute)) {
    return clean as AppRoute;
  }
  return '/';
}

const SpaContext = createContext<SpaContextValue | undefined>(undefined);

export function SpaProvider({ children }: { children: React.ReactNode }) {
  const [route, setRoute] = useState<AppRoute>(() => parseRoute(window.location.pathname));
  const [preselectedTreatmentId, setPreselectedTreatmentId] = useState<string>('');
  const [settings, setSettings] = useState<BusinessSettings>(DEFAULT_BUSINESS_SETTINGS);
  const [services, setServices] = useState<SpaService[]>(DEFAULT_SERVICES);
  const [gallery, setGallery] = useState<GalleryItem[]>(DEFAULT_GALLERY_ITEMS);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(DEFAULT_TESTIMONIALS);
  const [loadingPublicData, setLoadingPublicData] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string>(
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  );
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = useCallback((type: 'success' | 'error', text: string) => {
    setToast({ id: Date.now(), type, text });
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 5000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  // Sync browser history navigation
  useEffect(() => {
    const onPopState = () => {
      setRoute(parseRoute(window.location.pathname));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // Update document title per route for SEO
  useEffect(() => {
    const brand = settings.businessName || 'Viccie Mobile Spa';
    const titles: Record<AppRoute, string> = {
      '/': `${brand} | Luxury Mobile Beauty & Wellness in Cape Town`,
      '/about': `About Us | ${brand} – Cape Town Mobile Beauty`,
      '/services': `Treatments & Services | ${brand} Cape Town`,
      '/booking': `Book an Appointment | ${brand} Cape Town`,
      '/gallery': `Treatment Gallery | ${brand} Cape Town`,
      '/contact': `Contact & Areas Served | ${brand} Cape Town`,
      '/admin': `Admin Dashboard | ${brand}`,
    };
    document.title = titles[route];
  }, [route, settings.businessName]);

  const navigate = useCallback((to: AppRoute, options?: { treatmentId?: string }) => {
    if (options?.treatmentId) {
      setPreselectedTreatmentId(options.treatmentId);
    }
    if (window.location.pathname !== to) {
      window.history.pushState({}, '', to);
    }
    setRoute(to);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Load runtime Maps key if not bundled at build time
  useEffect(() => {
    if (googleMapsApiKey) return;
    let active = true;
    fetch('/api/public-config')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { googleMapsApiKey?: string } | null) => {
        if (active && data?.googleMapsApiKey) {
          setGoogleMapsApiKey(data.googleMapsApiKey);
        }
      })
      .catch(() => {
        // Fallback handled gracefully by CapeTownMap
      });
    return () => {
      active = false;
    };
  }, [googleMapsApiKey]);

  // Listen to Firebase Auth state & resolve admin access
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setIsAdmin(false);
        setAuthReady(true);
        return;
      }

      const isBootstrapped =
        currentUser.emailVerified &&
        currentUser.email?.toLowerCase() === BOOTSTRAPPED_ADMIN_EMAIL;

      if (isBootstrapped) {
        setIsAdmin(true);
        setAuthReady(true);
        return;
      }

      try {
        const adminDoc = await getDoc(doc(db, 'admins', currentUser.uid));
        setIsAdmin(currentUser.emailVerified && adminDoc.exists());
      } catch {
        setIsAdmin(false);
      } finally {
        setAuthReady(true);
      }
    });
    return () => unsub();
  }, []);

  // Seed initial catalog into Firestore when an admin signs in and collections are empty
  useEffect(() => {
    if (!isAdmin) return;

    const seedDefaultsIfMissing = async () => {
      try {
        const settingsRef = doc(db, 'settings', 'business');
        const settingsSnap = await getDoc(settingsRef);
        if (!settingsSnap.exists()) {
          await setDoc(settingsRef, {
            ...DEFAULT_BUSINESS_SETTINGS,
            updatedAt: serverTimestamp(),
          });
        }

        const servicesSnap = await getDocs(collection(db, 'services'));
        if (servicesSnap.empty) {
          await Promise.all(
            DEFAULT_SERVICES.map((svc) =>
              setDoc(doc(db, 'services', svc.id), {
                name: svc.name,
                slug: svc.slug,
                category: svc.category,
                description: svc.description,
                priceText: svc.priceText,
                durationText: svc.durationText,
                imageUrl: svc.imageUrl,
                featured: svc.featured,
                active: svc.active,
                sortOrder: svc.sortOrder,
                updatedAt: serverTimestamp(),
              })
            )
          );
        }

        const gallerySnap = await getDocs(collection(db, 'gallery'));
        if (gallerySnap.empty) {
          await Promise.all(
            DEFAULT_GALLERY_ITEMS.map((item) =>
              setDoc(doc(db, 'gallery', item.id), {
                title: item.title,
                category: item.category,
                caption: item.caption,
                imageUrl: item.imageUrl,
                sortOrder: item.sortOrder,
                updatedAt: serverTimestamp(),
              })
            )
          );
        }

        const testimonialsSnap = await getDocs(
          query(collection(db, 'testimonials'), where('published', '==', true))
        );
        if (testimonialsSnap.empty) {
          await Promise.all(
            DEFAULT_TESTIMONIALS.map((item) =>
              setDoc(doc(db, 'testimonials', item.id), {
                clientName: item.clientName,
                suburb: item.suburb,
                treatmentName: item.treatmentName,
                quote: item.quote,
                rating: item.rating,
                isSample: item.isSample,
                published: item.published,
                updatedAt: serverTimestamp(),
              })
            )
          );
        }
      } catch (error) {
        console.error('Seed check error:', error);
      }
    };

    void seedDefaultsIfMissing();
  }, [isAdmin]);

  // Public real-time Firestore listeners
  useEffect(() => {
    const unsubSettings = onSnapshot(
      doc(db, 'settings', 'business'),
      (snap) => {
        if (snap.exists()) {
          setSettings({
            ...DEFAULT_BUSINESS_SETTINGS,
            ...(snap.data() as Partial<BusinessSettings>),
          });
        }
        setLoadingPublicData(false);
      },
      (err) => {
        console.warn('Settings listener fallback:', err.message);
        setLoadingPublicData(false);
      }
    );

    const unsubServices = onSnapshot(
      query(collection(db, 'services'), orderBy('sortOrder', 'asc')),
      (snap) => {
        if (!snap.empty) {
          const items = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<SpaService, 'id'>),
          }));
          setServices(items);
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'services');
      }
    );

    const unsubGallery = onSnapshot(
      query(collection(db, 'gallery'), orderBy('sortOrder', 'asc')),
      (snap) => {
        if (!snap.empty) {
          const items = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<GalleryItem, 'id'>),
          }));
          setGallery(items);
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'gallery');
      }
    );

    const unsubTestimonials = onSnapshot(
      query(collection(db, 'testimonials'), where('published', '==', true)),
      (snap) => {
        if (!snap.empty) {
          const items = snap.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<TestimonialItem, 'id'>),
          }));
          setTestimonials(items);
        }
      },
      (err) => {
        handleFirestoreError(err, OperationType.LIST, 'testimonials');
      }
    );

    return () => {
      unsubSettings();
      unsubServices();
      unsubGallery();
      unsubTestimonials();
    };
  }, []);

  return (
    <SpaContext.Provider
      value={{
        route,
        navigate,
        preselectedTreatmentId,
        setPreselectedTreatmentId,
        settings,
        services,
        gallery,
        testimonials,
        loadingPublicData,
        user,
        authReady,
        isAdmin,
        googleMapsApiKey,
        toast,
        showToast,
        dismissToast,
      }}
    >
      {children}
    </SpaContext.Provider>
  );
}

export function useSpa(): SpaContextValue {
  const ctx = useContext(SpaContext);
  if (!ctx) {
    throw new Error('useSpa must be used within a SpaProvider');
  }
  return ctx;
}
