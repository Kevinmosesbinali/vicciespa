# Security Specification — Viccie Mobile Spa

## 1. Data Invariants
1. **Default Deny**: All unmatched Firestore paths deny read and write by default.
2. **PII Isolation (`bookings`, `enquiries`)**: Customer phone numbers, emails, and Cape Town addresses are strictly private. Public clients may only `create` a new `pending` booking or `new` enquiry with strict schema bounds and `request.time` timestamps; `get`, `list`, `update`, and `delete` are strictly restricted to verified admins.
3. **No Self-Assigned Admin**: Users cannot create or modify `/admins/{uid}` documents unless they are already verified admins.
4. **Email Spoofing Guard**: Admin email checks always enforce `request.auth.token.email_verified == true`.
5. **Immutable Creation Timestamps**: `bookings.createdAt` and `enquiries.createdAt` must equal `request.time` on create and cannot be altered on update.
6. **Strict Schema Enforcement**: Every write requires `keys().hasAll(...)` and `keys().hasOnly(...)` with explicit string `.size()` limits to prevent shadow fields or oversized payloads.
7. **Published Testimonials Isolation**: Public queries on `testimonials` are strictly gated by `resource.data.published == true`.
8. **Path Variable Hardening**: All document IDs are validated against `^[a-zA-Z0-9_-]+$` with max length 128.

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Shadow Field Injection on Booking Create**: Sending `status: 'pending'` plus an extra ghost key `isVip: true` -> MUST be denied.
2. **Pre-Approved Booking Spoofing**: Submitting a booking with `status: 'approved'` from an unauthenticated client -> MUST be denied.
3. **Unauthenticated PII Read (`bookings`)**: Attempting `get` or `list` on `/bookings` without admin auth -> MUST be denied.
4. **Unauthenticated PII Read (`enquiries`)**: Attempting `get` or `list` on `/enquiries` without admin auth -> MUST be denied.
5. **Client Timestamp Forgery**: Creating a booking with a backdated `createdAt` instead of `request.time` -> MUST be denied.
6. **Oversized String Poisoning**: Submitting a `10KB` `message` or `1.5KB` document ID on `/bookings/{id}` -> MUST be denied.
7. **Unverified Admin Email Spoof**: Auth token with admin email but `email_verified: false` -> MUST be denied admin access.
8. **Self-Privilege Escalation**: Signed-in non-admin writing to `/admins/{theirUid}` -> MUST be denied.
9. **Unpublished Testimonial Scraping**: Public user attempting `get` on an unpublished testimonial (`published: false`) -> MUST be denied.
10. **Service Catalog Tampering**: Non-admin attempting `create` or `update` on `/services/{id}` -> MUST be denied.
11. **Settings Hijack**: Non-admin attempting to alter `whatsappNumber` or `mapLat` in `/settings/business` -> MUST be denied.
12. **Immortal Timestamp Mutation**: Admin updating a booking while attempting to overwrite `createdAt` -> MUST be denied.
