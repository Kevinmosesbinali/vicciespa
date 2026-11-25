/**
 * Security Rules Verification Suite (Dirty Dozen Adversarial Payloads)
 * Intended for execution with @firebase/rules-unit-testing against the Firebase Emulator.
 */

export const DIRTY_DOZEN_PAYLOADS = [
  {
    name: '1. Shadow Field Injection on Booking Create',
    collection: 'bookings',
    operation: 'create',
    auth: null,
    payload: {
      customerName: 'Test Client',
      phone: '0821234567',
      email: '',
      treatmentId: 'facial-treatments',
      treatmentName: 'Facial Treatments',
      preferredDate: '2026-12-01',
      preferredTime: '10:00',
      location: 'Sea Point',
      message: 'Please bring warm towels',
      status: 'pending',
      adminNote: '',
      isVip: true, // Ghost field
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '2. Pre-Approved Booking Spoofing',
    collection: 'bookings',
    operation: 'create',
    auth: null,
    payload: {
      customerName: 'Test Client',
      phone: '0821234567',
      email: '',
      treatmentId: 'massage',
      treatmentName: 'Massage',
      preferredDate: '2026-12-01',
      preferredTime: '11:00',
      location: 'Camps Bay',
      message: '',
      status: 'approved', // Must only allow pending
      adminNote: '',
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '3. Unauthenticated PII Read on Bookings',
    collection: 'bookings',
    operation: 'list',
    auth: null,
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '4. Unauthenticated PII Read on Enquiries',
    collection: 'enquiries',
    operation: 'list',
    auth: null,
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '5. Client Timestamp Forgery on Booking Create',
    collection: 'bookings',
    operation: 'create',
    auth: null,
    payload: {
      createdAt: '2020-01-01T00:00:00Z', // Not request.time
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '6. Oversized String Poisoning on Document ID & Message',
    collection: 'bookings',
    docId: 'a'.repeat(200),
    operation: 'create',
    auth: null,
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '7. Unverified Admin Email Spoof',
    collection: 'bookings',
    operation: 'list',
    auth: { uid: 'spoof-uid', token: { email: 'kevinmosesbinali@gmail.com', email_verified: false } },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '8. Self-Privilege Escalation on Admins Collection',
    collection: 'admins',
    docId: 'attacker-uid',
    operation: 'create',
    auth: { uid: 'attacker-uid', token: { email: 'attacker@example.com', email_verified: true } },
    payload: { email: 'attacker@example.com' },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '9. Unpublished Testimonial Read by Public User',
    collection: 'testimonials',
    operation: 'get',
    existingDoc: { published: false },
    auth: null,
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '10. Service Catalog Tampering by Non-Admin',
    collection: 'services',
    operation: 'update',
    auth: { uid: 'user-1', token: { email: 'user@example.com', email_verified: true } },
    payload: { priceText: 'R1' },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '11. Business Settings Hijack by Non-Admin',
    collection: 'settings',
    docId: 'business',
    operation: 'update',
    auth: { uid: 'user-1', token: { email: 'user@example.com', email_verified: true } },
    payload: { whatsappNumber: '0000000000' },
    expected: 'PERMISSION_DENIED',
  },
  {
    name: '12. Immortal createdAt Mutation on Booking Update',
    collection: 'bookings',
    operation: 'update',
    auth: { uid: 'admin-uid', token: { email: 'kevinmosesbinali@gmail.com', email_verified: true } },
    payload: { status: 'approved', createdAt: '2020-01-01T00:00:00Z' },
    expected: 'PERMISSION_DENIED',
  },
];
