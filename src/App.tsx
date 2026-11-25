import { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { SpaProvider, useSpa } from './context/SpaContext';
import { AboutPage } from './pages/AboutPage';
import { AdminPage } from './pages/AdminPage';
import { BookingPage } from './pages/BookingPage';
import { ContactPage } from './pages/ContactPage';
import { GalleryPage } from './pages/GalleryPage';
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';

function AppShell() {
  const { route, toast, dismissToast } = useSpa();
  const [mapsQuotaExceeded, setMapsQuotaExceeded] = useState(false);

  useEffect(() => {
    const onQuotaExceeded = () => setMapsQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', onQuotaExceeded);
    return () => window.removeEventListener('gmp-quota-exceeded', onQuotaExceeded);
  }, []);

  const renderPage = () => {
    switch (route) {
      case '/about':
        return <AboutPage />;
      case '/services':
        return <ServicesPage />;
      case '/booking':
        return <BookingPage />;
      case '/gallery':
        return <GalleryPage />;
      case '/contact':
        return <ContactPage />;
      case '/admin':
        return <AdminPage />;
      case '/':
      default:
        return <HomePage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F4] text-[#2C2220]">
      {mapsQuotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      <Navbar />

      <main className="flex-1">{renderPage()}</main>

      <Footer />
      <FloatingWhatsApp />

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-5 left-5 z-50 max-w-sm flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm ${
            toast.type === 'success'
              ? 'bg-white border-[#B6DEC9] text-[#1F6F54]'
              : 'bg-white border-[#E8BABA] text-[#8E2A2A]'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          )}
          <span className="flex-1 text-[#2C2220]">{toast.text}</span>
          <button
            type="button"
            onClick={dismissToast}
            aria-label="Dismiss notification"
            className="text-[#6E5F5B] hover:text-[#2C2220] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <SpaProvider>
        <AppShell />
      </SpaProvider>
    </ErrorBoundary>
  );
}
