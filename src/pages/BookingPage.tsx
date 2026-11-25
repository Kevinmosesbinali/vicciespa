import React, { useEffect, useState } from 'react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { CalendarCheck2, CheckCircle2, Info, Loader2, MessageCircle } from 'lucide-react';
import { useSpa } from '../context/SpaContext';
import {
  BOOKING_TIME_SLOTS,
  buildWhatsAppUrl,
  CAPE_TOWN_AREAS,
  displayServicePrice,
} from '../data/defaults';
import { db, handleFirestoreError, OperationType } from '../firebase';

interface SubmittedBookingSummary {
  referenceId: string;
  customerName: string;
  phone: string;
  email: string;
  treatmentName: string;
  preferredDate: string;
  preferredTime: string;
  location: string;
  message: string;
  whatsappMessage: string;
  whatsappUrl: string;
}

export function BookingPage() {
  const {
    services,
    preselectedTreatmentId,
    setPreselectedTreatmentId,
    settings,
    showToast,
  } = useSpa();

  const activeServices = services.filter((s) => s.active);

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [treatmentId, setTreatmentId] = useState(
    preselectedTreatmentId || activeServices[0]?.id || 'facial-treatments'
  );
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState(BOOKING_TIME_SLOTS[1]);
  const [location, setLocation] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [confirmed, setConfirmed] = useState<SubmittedBookingSummary | null>(null);

  useEffect(() => {
    if (preselectedTreatmentId) {
      setTreatmentId(preselectedTreatmentId);
      setPreselectedTreatmentId('');
    }
  }, [preselectedTreatmentId, setPreselectedTreatmentId]);

  const todayIso = new Date().toISOString().split('T')[0];

  const selectedService =
    activeServices.find((s) => s.id === treatmentId) || activeServices[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const cleanName = customerName.trim();
    const cleanPhone = phone.trim();
    const cleanEmail = email.trim();
    const cleanLocation = location.trim();
    const cleanMessage = message.trim();

    if (cleanName.length < 2 || cleanName.length > 120) {
      setFormError('Please enter your full name (at least 2 characters).');
      return;
    }

    const phoneDigits = cleanPhone.replace(/\D/g, '');
    if (phoneDigits.length < 7 || cleanPhone.length > 30) {
      setFormError('Please provide a valid WhatsApp or contact phone number.');
      return;
    }

    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setFormError('Please enter a valid email address, or leave it blank.');
      return;
    }

    if (!preferredDate) {
      setFormError('Please choose a preferred appointment date.');
      return;
    }

    if (!preferredTime) {
      setFormError('Please choose a preferred appointment time.');
      return;
    }

    if (cleanLocation.length < 2 || cleanLocation.length > 200) {
      setFormError('Please specify your suburb or service location in Cape Town.');
      return;
    }

    if (cleanMessage.length > 1000) {
      setFormError('Additional message must be 1,000 characters or fewer.');
      return;
    }

    const chosenTreatmentName = selectedService?.name || 'Spa Treatment';
    const chosenTreatmentId = selectedService?.id || 'general';
    const docId = `bk-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    setSubmitting(true);
    try {
      await setDoc(doc(db, 'bookings', docId), {
        customerName: cleanName,
        phone: cleanPhone,
        email: cleanEmail,
        treatmentId: chosenTreatmentId,
        treatmentName: chosenTreatmentName,
        preferredDate,
        preferredTime,
        location: cleanLocation,
        message: cleanMessage,
        status: 'pending',
        adminNote: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const whatsappMessage = [
        `Hello ${settings.businessName}, I have submitted an appointment request:`,
        `Reference: ${docId}`,
        `Name: ${cleanName}`,
        `Contact: ${cleanPhone}`,
        cleanEmail ? `Email: ${cleanEmail}` : '',
        `Treatment: ${chosenTreatmentName}`,
        `Preferred Date: ${preferredDate}`,
        `Preferred Time: ${preferredTime}`,
        `Cape Town Area: ${cleanLocation}`,
        cleanMessage ? `Notes: ${cleanMessage}` : '',
        `Please confirm availability.`,
      ]
        .filter(Boolean)
        .join('\n');

      const whatsappUrl = buildWhatsAppUrl(settings.whatsappIntl, whatsappMessage);

      setConfirmed({
        referenceId: docId,
        customerName: cleanName,
        phone: cleanPhone,
        email: cleanEmail,
        treatmentName: chosenTreatmentName,
        preferredDate,
        preferredTime,
        location: cleanLocation,
        message: cleanMessage,
        whatsappMessage,
        whatsappUrl,
      });

      showToast(
        'success',
        'Appointment request saved! Send via WhatsApp below to speed up confirmation.'
      );
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.CREATE, `bookings/${docId}`);
      } catch {
        setFormError(
          'Could not submit your booking request right now. Please try again or contact us directly on WhatsApp.'
        );
        showToast('error', 'Unable to submit booking request. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FAF7F4] py-14 lg:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-10">
        <div className="max-w-2xl space-y-3">
          <p className="text-xs font-medium text-[#9A7245]">
            Appointment Request · {settings.locationText}
          </p>
          <h1
            className="font-display font-semibold text-[#2C2220] leading-[1.1] [text-wrap:balance]"
            style={{ fontSize: 'clamp(2.15rem, 3.6vw, 3.25rem)' }}
          >
            Request Your Mobile Spa Appointment
          </h1>
          <p className="text-sm sm:text-base text-[#5A4C48] leading-relaxed">
            Share your preferred treatment, date, and Cape Town suburb below. After submitting, you can send your booking summary straight to our WhatsApp ({settings.whatsappNumber}).
          </p>
        </div>

        {/* Availability Notice */}
        <div className="bg-[#F4EBE8] border border-[#E2D2CA] rounded-2xl p-5 flex items-start gap-3.5 text-sm text-[#4A3B38]">
          <Info className="w-5 h-5 text-[#7D4A4C] shrink-0 mt-0.5" />
          <p>
            <strong className="font-semibold text-[#2C2220]">Important:</strong> Submitting a booking request is not a confirmed appointment until {settings.businessName} confirms therapist availability for your requested date, time, and Cape Town area.
          </p>
        </div>

        {confirmed ? (
          <div className="bg-white border border-[#E6DDD7] rounded-2xl p-8 sm:p-10 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-full bg-[#E6F4EE] flex items-center justify-center text-[#1F6F54] shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h2 className="font-display text-3xl font-semibold text-[#2C2220]">
                  Booking Request Received
                </h2>
                <p className="text-sm text-[#5A4C48]">
                  Reference <span className="font-mono text-xs text-[#2C2220]">{confirmed.referenceId}</span> · Pending availability confirmation
                </p>
              </div>
            </div>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FAF7F4] border border-[#E6DDD7] rounded-xl p-5 text-sm">
              <div>
                <dt className="text-xs text-[#6E5F5B]">Client Name</dt>
                <dd className="font-medium text-[#2C2220] mt-0.5">{confirmed.customerName}</dd>
              </div>
              <div>
                <dt className="text-xs text-[#6E5F5B]">WhatsApp / Phone</dt>
                <dd className="font-medium text-[#2C2220] mt-0.5 tabular-nums">{confirmed.phone}</dd>
              </div>
              <div>
                <dt className="text-xs text-[#6E5F5B]">Preferred Treatment</dt>
                <dd className="font-medium text-[#2C2220] mt-0.5">{confirmed.treatmentName}</dd>
              </div>
              <div>
                <dt className="text-xs text-[#6E5F5B]">Date &amp; Time</dt>
                <dd className="font-medium text-[#2C2220] mt-0.5 tabular-nums">
                  {confirmed.preferredDate} at {confirmed.preferredTime}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-[#6E5F5B]">Service Area in Cape Town</dt>
                <dd className="font-medium text-[#2C2220] mt-0.5">{confirmed.location}</dd>
              </div>
              {confirmed.message && (
                <div className="sm:col-span-2">
                  <dt className="text-xs text-[#6E5F5B]">Additional Notes</dt>
                  <dd className="text-[#5A4C48] mt-0.5">{confirmed.message}</dd>
                </div>
              )}
            </dl>

            <div className="space-y-3">
              <p className="text-xs font-medium text-[#6E5F5B]">
                Prepared WhatsApp Message
              </p>
              <pre className="whitespace-pre-wrap text-xs sm:text-sm text-[#2C2220] bg-[#FAF7F4] border border-[#E6DDD7] rounded-xl p-4 font-sans leading-relaxed">
                {confirmed.whatsappMessage}
              </pre>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href={confirmed.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 min-h-[48px] px-6 py-3 text-sm font-medium text-white bg-[#1F6F54] hover:bg-[#185943] rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Send Booking to WhatsApp ({settings.whatsappNumber})</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  setConfirmed(null);
                  setMessage('');
                }}
                className="inline-flex items-center justify-center min-h-[48px] px-5 py-3 text-sm font-medium text-[#2C2220] bg-[#FAF7F4] hover:bg-[#EFE8E2] border border-[#DDD1C9] rounded-lg transition-colors cursor-pointer"
              >
                Make Another Request
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            noValidate
            className="bg-white border border-[#E6DDD7] rounded-2xl p-6 sm:p-10 space-y-6"
          >
            {formError && (
              <div
                role="alert"
                className="bg-[#FDF2F2] border border-[#E8BABA] text-[#8E2A2A] rounded-xl px-4 py-3 text-sm"
              >
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="booking-name" className="block text-sm font-medium text-[#2C2220]">
                  Customer Full Name <span className="text-[#7D4A4C]">*</span>
                </label>
                <input
                  id="booking-name"
                  type="text"
                  required
                  maxLength={120}
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Thandiwe Petersen"
                  className="w-full min-h-[46px] px-4 py-2.5 text-sm bg-[#FAF7F4] border border-[#DDD1C9] rounded-lg text-[#2C2220] placeholder:text-[#9C8D87]"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="booking-phone" className="block text-sm font-medium text-[#2C2220]">
                  WhatsApp / Contact Number <span className="text-[#7D4A4C]">*</span>
                </label>
                <input
                  id="booking-phone"
                  type="tel"
                  required
                  maxLength={30}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 082 555 0148"
                  className="w-full min-h-[46px] px-4 py-2.5 text-sm bg-[#FAF7F4] border border-[#DDD1C9] rounded-lg text-[#2C2220] placeholder:text-[#9C8D87] tabular-nums"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="booking-email" className="block text-sm font-medium text-[#2C2220]">
                  Email Address <span className="text-xs text-[#6E5F5B] font-normal">(Optional)</span>
                </label>
                <input
                  id="booking-email"
                  type="email"
                  maxLength={150}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full min-h-[46px] px-4 py-2.5 text-sm bg-[#FAF7F4] border border-[#DDD1C9] rounded-lg text-[#2C2220] placeholder:text-[#9C8D87]"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="booking-treatment" className="block text-sm font-medium text-[#2C2220]">
                  Preferred Treatment <span className="text-[#7D4A4C]">*</span>
                </label>
                <select
                  id="booking-treatment"
                  required
                  value={treatmentId}
                  onChange={(e) => setTreatmentId(e.target.value)}
                  className="w-full min-h-[46px] px-4 py-2.5 text-sm bg-[#FAF7F4] border border-[#DDD1C9] rounded-lg text-[#2C2220]"
                >
                  {activeServices.map((svc) => (
                    <option key={svc.id} value={svc.id}>
                      {svc.name} — {displayServicePrice(svc.priceText)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="booking-date" className="block text-sm font-medium text-[#2C2220]">
                  Preferred Appointment Date <span className="text-[#7D4A4C]">*</span>
                </label>
                <input
                  id="booking-date"
                  type="date"
                  required
                  min={todayIso}
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full min-h-[46px] px-4 py-2.5 text-sm bg-[#FAF7F4] border border-[#DDD1C9] rounded-lg text-[#2C2220] tabular-nums"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="booking-time" className="block text-sm font-medium text-[#2C2220]">
                  Preferred Appointment Time <span className="text-[#7D4A4C]">*</span>
                </label>
                <select
                  id="booking-time"
                  required
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full min-h-[46px] px-4 py-2.5 text-sm bg-[#FAF7F4] border border-[#DDD1C9] rounded-lg text-[#2C2220] tabular-nums"
                >
                  {BOOKING_TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="booking-location" className="block text-sm font-medium text-[#2C2220]">
                Service Location or Area in Cape Town <span className="text-[#7D4A4C]">*</span>
              </label>
              <input
                id="booking-location"
                type="text"
                required
                maxLength={200}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Sea Point, Camps Bay, Claremont, Century City"
                className="w-full min-h-[46px] px-4 py-2.5 text-sm bg-[#FAF7F4] border border-[#DDD1C9] rounded-lg text-[#2C2220] placeholder:text-[#9C8D87]"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {CAPE_TOWN_AREAS.slice(0, 8).map((area) => (
                  <button
                    key={area}
                    type="button"
                    onClick={() => setLocation(area)}
                    className="px-2.5 py-1 text-xs text-[#5A4C48] bg-[#FAF7F4] hover:bg-[#F4EBE8] border border-[#E6DDD7] rounded-md transition-colors cursor-pointer"
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="booking-message" className="block text-sm font-medium text-[#2C2220]">
                Additional Message <span className="text-xs text-[#6E5F5B] font-normal">(Optional)</span>
              </label>
              <textarea
                id="booking-message"
                rows={4}
                maxLength={1000}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Let us know if you are booking for multiple guests, specific skin sensitivities, parking access, or preferred nail shades."
                className="w-full px-4 py-3 text-sm bg-[#FAF7F4] border border-[#DDD1C9] rounded-lg text-[#2C2220] placeholder:text-[#9C8D87]"
              />
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 min-h-[48px] px-7 py-3 text-sm font-medium text-white bg-[#7D4A4C] hover:bg-[#663A3C] disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Request...</span>
                  </>
                ) : (
                  <>
                    <CalendarCheck2 className="w-4 h-4" />
                    <span>Submit Booking Request</span>
                  </>
                )}
              </button>

              <p className="text-xs text-[#6E5F5B]">
                Prefer chatting directly?{' '}
                <a
                  href={buildWhatsAppUrl(
                    settings.whatsappIntl,
                    'Hello Viccie Mobile Spa, I would like to enquire about booking an appointment in Cape Town.'
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#1F6F54] font-medium hover:underline"
                >
                  Message {settings.whatsappNumber} on WhatsApp
                </a>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
