import React, { useState } from 'react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { CheckCircle2, Clock, Loader2, MapPin, MessageCircle, Phone, Send } from 'lucide-react';
import { CapeTownMap } from '../components/CapeTownMap';
import { useSpa } from '../context/SpaContext';
import { buildWhatsAppUrl, formatPhoneForTel } from '../data/defaults';
import { db, handleFirestoreError, OperationType } from '../firebase';

export function ContactPage() {
  const { settings, showToast } = useSpa();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [sent, setSent] = useState(false);

  const whatsappUrl = buildWhatsAppUrl(
    settings.whatsappIntl,
    'Hello Viccie Mobile Spa, I would like to enquire about your beauty treatments and availability in Cape Town.'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    const cleanEmail = email.trim();
    const cleanSubject = subject.trim() || 'General Spa Enquiry';
    const cleanMessage = message.trim();

    if (cleanName.length < 2 || cleanName.length > 120) {
      setErrorMsg('Please enter your name (at least 2 characters).');
      return;
    }

    if (cleanPhone.replace(/\D/g, '').length < 7 || cleanPhone.length > 30) {
      setErrorMsg('Please enter a valid phone or WhatsApp number.');
      return;
    }

    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMsg('Please enter a valid email address, or leave it blank.');
      return;
    }

    if (cleanMessage.length < 5 || cleanMessage.length > 1500) {
      setErrorMsg('Please enter your enquiry message (at least 5 characters).');
      return;
    }

    const docId = `enq-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setSubmitting(true);

    try {
      await setDoc(doc(db, 'enquiries', docId), {
        name: cleanName,
        phone: cleanPhone,
        email: cleanEmail,
        subject: cleanSubject.slice(0, 160),
        message: cleanMessage,
        status: 'new',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setSent(true);
      setName('');
      setPhone('');
      setEmail('');
      setSubject('');
      setMessage('');
      showToast('success', 'Your enquiry has been sent to Viccie Mobile Spa.');
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.CREATE, `enquiries/${docId}`);
      } catch {
        setErrorMsg('Unable to submit enquiry right now. Please contact us on WhatsApp.');
        showToast('error', 'Failed to send enquiry.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#FAF7F4] py-14 lg:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-14">
        {/* Header */}
        <div className="max-w-2xl space-y-3">
          <p className="text-xs font-medium text-[#9A7245]">
            Get in Touch · {settings.locationText}
          </p>
          <h1
            className="font-display font-semibold text-[#2C2220] leading-[1.1] [text-wrap:balance]"
            style={{ fontSize: 'clamp(2.15rem, 3.6vw, 3.25rem)' }}
          >
            Contact {settings.businessName}
          </h1>
          <p className="text-sm sm:text-base text-[#5A4C48] leading-relaxed">
            Reach out via WhatsApp, direct phone call, or the enquiry form below for pricing, Cape Town travel coverage, or group pamper requests.
          </p>
        </div>

        {/* Contact Details + Enquiry Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Direct Contact Card */}
          <div className="lg:col-span-5 bg-white border border-[#E6DDD7] rounded-2xl p-7 space-y-6">
            <div className="space-y-1">
              <h2 className="font-display text-2xl font-semibold text-[#2C2220]">
                {settings.businessName}
              </h2>
              <p className="text-sm text-[#5A4C48]">Mobile Beauty Spa &amp; Wellness Services</p>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#7D4A4C] shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-[#2C2220]">{settings.locationText}</p>
                  <p className="text-xs text-[#6E5F5B] mt-0.5">{settings.serviceAreaLabel}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-[#1F6F54] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-[#6E5F5B]">WhatsApp</p>
                  <p className="font-medium text-[#2C2220] tabular-nums">
                    {settings.whatsappNumber}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#7D4A4C] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-[#6E5F5B]">Phone / Call</p>
                  <p className="font-medium text-[#2C2220] tabular-nums">
                    {settings.phoneNumber}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#9A7245] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-[#6E5F5B]">Hours</p>
                  <p className="font-medium text-[#2C2220]">{settings.operatingHours}</p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#EFE8E2] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 min-h-[46px] px-5 py-2.5 text-sm font-medium text-white bg-[#1F6F54] hover:bg-[#185943] rounded-lg transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp ({settings.whatsappNumber})</span>
              </a>

              <a
                href={`tel:${formatPhoneForTel(settings.phoneNumber)}`}
                className="inline-flex items-center justify-center gap-2 min-h-[46px] px-5 py-2.5 text-sm font-medium text-[#2C2220] bg-[#FAF7F4] hover:bg-[#EFE8E2] border border-[#DDD1C9] rounded-lg transition-colors"
              >
                <Phone className="w-4 h-4 text-[#7D4A4C]" />
                <span>Call ({settings.phoneNumber})</span>
              </a>
            </div>
          </div>

          {/* Enquiry Form */}
          <div className="lg:col-span-7 bg-white border border-[#E6DDD7] rounded-2xl p-7 sm:p-9">
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#2C2220] mb-2">
              Send an Enquiry
            </h2>
            <p className="text-sm text-[#5A4C48] mb-6">
              Ask about treatment pricing, mobile call-out areas, or custom spa packages.
            </p>

            {sent ? (
              <div className="bg-[#FAF7F4] border border-[#E6DDD7] rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-3 text-[#1F6F54]">
                  <CheckCircle2 className="w-6 h-6 shrink-0" />
                  <h3 className="font-display text-2xl font-semibold text-[#2C2220]">
                    Enquiry Received
                  </h3>
                </div>
                <p className="text-sm text-[#5A4C48]">
                  Thank you for contacting {settings.businessName}. We will respond via WhatsApp or phone shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setSent(false)}
                  className="px-4 py-2.5 text-xs font-medium text-white bg-[#7D4A4C] hover:bg-[#663A3C] rounded-lg cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {errorMsg && (
                  <div
                    role="alert"
                    className="bg-[#FDF2F2] border border-[#E8BABA] text-[#8E2A2A] rounded-xl px-4 py-3 text-sm"
                  >
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="contact-name" className="block text-sm font-medium text-[#2C2220]">
                      Your Name <span className="text-[#7D4A4C]">*</span>
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      maxLength={120}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full name"
                      className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-[#FAF7F4] border border-[#DDD1C9] rounded-lg"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="contact-phone" className="block text-sm font-medium text-[#2C2220]">
                      Phone / WhatsApp <span className="text-[#7D4A4C]">*</span>
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      required
                      maxLength={30}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="082 555 0148"
                      className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-[#FAF7F4] border border-[#DDD1C9] rounded-lg tabular-nums"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="contact-email" className="block text-sm font-medium text-[#2C2220]">
                      Email <span className="text-xs text-[#6E5F5B] font-normal">(Optional)</span>
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      maxLength={150}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-[#FAF7F4] border border-[#DDD1C9] rounded-lg"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="contact-subject" className="block text-sm font-medium text-[#2C2220]">
                      Subject
                    </label>
                    <input
                      id="contact-subject"
                      type="text"
                      maxLength={160}
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Treatment pricing or group booking"
                      className="w-full min-h-[44px] px-3.5 py-2 text-sm bg-[#FAF7F4] border border-[#DDD1C9] rounded-lg"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="contact-message" className="block text-sm font-medium text-[#2C2220]">
                    Message <span className="text-[#7D4A4C]">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    required
                    maxLength={1500}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="How can we help you?"
                    className="w-full px-3.5 py-3 text-sm bg-[#FAF7F4] border border-[#DDD1C9] rounded-lg"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 min-h-[46px] px-6 py-2.5 text-sm font-medium text-white bg-[#7D4A4C] hover:bg-[#663A3C] disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Enquiry</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Google Maps Service Location Section */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <p className="text-xs font-medium text-[#9A7245]">Service Coverage</p>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#2C2220]">
                Serving {settings.locationText}
              </h2>
            </div>
            <p className="text-xs text-[#6E5F5B]">{settings.serviceAreaLabel}</p>
          </div>
          <CapeTownMap />
        </section>
      </div>
    </div>
  );
}
