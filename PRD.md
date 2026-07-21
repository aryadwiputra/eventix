# Tickety Revamp - Product Requirements Document

**Project:** Tickety Event Ticketing System  
**Version:** 1.0  
**Date:** 2026-07-21  
**Status:** Draft

---

## 1. Executive Summary

### 1.1 Problem Statement
Sistem tickety existing adalah monolith Laravel Livewire yang perlu dipisah menjadi backend API (Laravel 13) dan frontend (React 19). Sistem ini tidak memiliki role-based access control (RBAC), hanya support pembayaran manual bank transfer, dan database schema perlu dinormalisasi.

### 1.2 Proposed Solution
Memisahkan aplikasi menjadi:
- **Backend:** Laravel 13 API dengan database normalized, dynamic RBAC, dan integrasi Midtrans
- **Frontend:** React 19 SPA dengan UI modern untuk admin dashboard dan public event pages
- **Integrations:** Midtrans (VA + QRIS), Email (ticket confirmation), QR Code (check-in)

### 1.3 Success Criteria
| KPI | Target |
|-----|--------|
| Payment success rate | >= 95% via Midtrans |
| Check-in scan latency | < 500ms |
| API response time | < 200ms (p95) |
| User roles | 3 roles dengan granular permissions |
| Database normalization | 3NF compliant |

---

## 2. User Roles & Permissions (Dynamic RBAC)

### 2.1 Roles

| Role | Scope | Description |
|------|-------|-------------|
| **Super Admin** | Global | Akses penuh ke semua fitur, manage users & roles |
| **Organizer** | Own events only | Buat & kelola event sendiri, lihat sales |
| **Attendee** | Self only | Beli tiket, lihat history, check-in |

### 2.2 Dynamic Permissions Matrix

```
PERMISSIONS:
- events.create, events.read, events.update, events.delete
- tickets.create, tickets.read, tickets.update, tickets.delete
- transactions.read, transactions.update (approve/reject)
- reports.view, reports.export
- users.manage, roles.manage, settings.manage
- checkin.perform
- checkout.perform
```

### 2.3 Role-Permission Mapping

| Permission | Super Admin | Organizer | Attendee |
|------------|:-----------:|:---------:|:--------:|
| events.* (own) | ✅ | ✅ | ❌ |
| events.* (all) | ✅ | ❌ | ❌ |
| tickets.* (own) | ✅ | ✅ | ❌ |
| transactions.read (own) | ✅ | ✅ | ✅ |
| transactions.update | ✅ | ❌ | ❌ |
| reports.view (own) | ✅ | ✅ | ❌ |
| reports.view (all) | ✅ | ❌ | ❌ |
| users.manage | ✅ | ❌ | ❌ |
| roles.manage | ✅ | ❌ | ❌ |
| settings.manage | ✅ | ❌ | ❌ |
| checkin.perform | ✅ | ✅ | ❌ |
| checkout.perform | ✅ | ❌ | ✅ |

---

## 3. User Stories & Acceptance Criteria

### 3.1 Authentication

| Story | Acceptance Criteria |
|-------|---------------------|
| **US-01:** Register | User bisa register dengan name, email, password; auto jadi Attendee |
| **US-02:** Login | User bisa login dengan email/password; dapat JWT token |
| **US-03:** Logout | User bisa logout; token di-invalidate |

### 3.2 Event Management

| Story | Acceptance Criteria |
|-------|---------------------|
| **US-10:** Create Event | Organizer bisa buat event dengan status draft/published; input: name, slug, headline, description, start_time, location, type, category, photos |
| **US-11:** Publish Event | Organizer bisa publish draft event; published event visible di public listing |
| **US-12:** List Events | User bisa lihat list event (published only) dengan filter category, date, search |
| **US-13:** Event Detail | User bisa lihat detail event dengan semua ticket types |
| **US-14:** Update Event | Organizer bisa update event miliknya (jika draft); update locked jika sudah ada transaction |
| **US-15:** Delete Event | Organizer/Admin bisa soft-delete event |
| **US-16:** Popular Toggle | Admin bisa toggle event jadi popular/not |
| **US-17:** Event Reports | Organizer bisa lihat sales & attendance report per event |

### 3.3 Ticket & Waitlist Management

| Story | Acceptance Criteria |
|-------|---------------------|
| **US-20:** Create Ticket | Organizer bisa buat ticket type dengan name, price, quantity, max_buy |
| **US-21:** List Tickets | User bisa lihat semua ticket types untuk satu event |
| **US-22:** Update Ticket | Organizer bisa update ticket type (locked if has transactions) |
| **US-23:** Delete Ticket | Organizer bisa soft-delete ticket type |
| **US-24:** Stock Management | Sistem auto-decrement stock saat checkout berhasil |
| **US-25:** Join Waitlist | Attendee bisa join waitlist saat ticket sold out |
| **US-26:** Waitlist Notification | Attendee di-notify via email jika ticket available (FIFO) |
| **US-27:** Waitlist Claim | Attendee klaim ticket dalam 24 jam jika available |

### 3.4 Checkout & Payment

| Story | Acceptance Criteria |
|-------|---------------------|
| **US-30:** Browse & Select | Attendee pilih ticket type & quantity |
| **US-31:** Checkout | Attendee input name, email; sistem generate unique_code |
| **US-32:** Midtrans Payment | Sistem create Midtrans transaction; return payment URL (VA/QRIS) |
| **US-33:** Payment Callback | Handle Midtrans notification; update transaction status |
| **US-34:** Payment Expiry | Auto-cancel transaction jika payment > 24 jam |
| **US-35:** Payment Success | Generate ticket codes; send email confirmation |

### 3.5 Ticket & Check-in

| Story | Acceptance Criteria |
|-------|---------------------|
| **US-40:** View Tickets | Attendee bisa lihat ticket miliknya |
| **US-41:** QR Code Display | Ticket include QR code dengan embedded ticket_code |
| **US-42:** PDF Download | Attendee bisa download PDF ticket |
| **US-43:** Check-in Scan | Admin/Organizer bisa scan QR; sistem validasi & mark as redeemed |
| **US-44:** Prevent Double Redeem | Same QR code tidak bisa di-scan dua kali |

### 3.6 Transaction Management

| Story | Acceptance Criteria |
|-------|---------------------|
| **US-50:** List Transactions | Admin/Organizer bisa lihat semua transaction |
| **US-51:** Transaction Detail | Admin bisa lihat full transaction dengan semua ticket codes |
| **US-52:** Filter Transactions | Admin bisa filter by status, date, event |

### 3.7 Reports (Basic)

| Story | Acceptance Criteria |
|-------|---------------------|
| **US-60:** Sales Summary | Organizer bisa lihat total sales, revenue per event |
| **US-61:** Check-in Stats | Admin bisa lihat check-in rate per event |

### 3.8 Admin Management

| Story | Acceptance Criteria |
|-------|---------------------|
| **US-70:** Manage Users | Super Admin bisa list, create, update, delete users |
| **US-71:** Manage Roles | Super Admin bisa assign/revoke permissions ke roles |
| **US-72:** Category CRUD | Super Admin bisa manage event categories |

---

## 4. Technical Specifications

### 4.1 Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React 19 SPA  │────▶│   Laravel 13    │────▶│     MySQL       │
│   (Frontend)    │◀────│   (Backend API) │     │   (Database)    │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
               ┌────────┐  ┌─────────┐  ┌─────────┐
               │Midtrans│  │  SMTP   │  │  File   │
               │Payment │  │  Email  │  │ Storage │
               └────────┘  └─────────┘  └─────────┘
```

### 4.2 Backend (Laravel 13)

**Folder Structure:**
```
backend/
├── app/
│   ├── Http/Controllers/Api/
│   │   ├── AuthController.php
│   │   ├── EventController.php
│   │   ├── TicketController.php
│   │   ├── TransactionController.php
│   │   ├── CheckinController.php
│   │   ├── ReportController.php
│   │   └── Admin/
│   │       ├── UserController.php
│   │       ├── RoleController.php
│   │       └── CategoryController.php
│   ├── Models/
│   ├── Services/
│   │   ├── MidtransService.php
│   │   ├── TicketService.php
│   │   └── CheckinService.php
│   ├── Enums/
│   │   ├── TransactionStatus.php
│   │   └── Role.php
│   └── Policies/
├── database/
│   └── migrations/
├── routes/api.php
└── config/
```

### 4.3 Database Schema (Normalized 3NF)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CORE TABLES                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────┐      ┌──────────────┐      ┌──────────────────────────┐  │
│  │  users   │◀────▶│organizers────│      │        events           │  │
│  ├──────────┤      ├──────────────┤      ├──────────────────────────┤  │
│  │id        │1     │id            │      │id                       │  │
│  │name      │      │user_id (FK)  │◀─────│organizer_id (FK)        │  │
│  │email     │      │company_name  │      │category_id (FK)         │  │
│  │password  │      │is_active     │      │name                     │  │
│  │created_at│      │created_at    │      │slug                     │  │
│  │updated_at│      │updated_at    │      │headline                 │  │
│  └──────────┘      └──────────────┘      │description              │  │
│       │                                   │start_time               │  │
│       │ 1:1                               │location                 │  │
│       ▼                                   │type (online/offline)    │  │
│  ┌────────────────┐                       │is_popular (boolean)     │  │
│  │   roles        │     ┌──────────┐      │photos (JSON)            │  │
│  ├────────────────┤     │categories│      │created_at               │  │
│  │id              │◀────│id (PK)   │      │updated_at               │  │
│  │name            │     │name      │      └──────────────────────────┘  │
│  │guard_name      │     │icon      │                    │              │
│  │created_at      │     │is_active │                    │1:N           │
│  │updated_at      │     └──────────┘                    ▼              │
│  └────────────────┘                            ┌──────────────────┐   │
│       │                                        │      tickets      │   │
│       │ N:M                                   ├──────────────────┤   │
│       ▼                                        │id                 │   │
│  ┌────────────────────────┐                    │event_id (FK)      │◀──┘  │
│  │   permissions          │                    │name               │      │
│  ├────────────────────────┤                    │description        │      │
│  │id                      │                    │price              │      │
│  │name                    │                    │quantity           │      │
│  │guard_name              │                    │sold_count         │      │
│  │created_at              │                    │max_per_transaction│      │
│  │updated_at              │                    │is_active          │      │
│  └────────────────────────┘                    │created_at         │      │
│       │                                        │updated_at         │      │
│       │ N:M                                    └───────────────────┘      │
│       ▼                                               │                    │
│  ┌────────────────────────────────────────────────────┼───────────────┐   │
│  │              role_permissions (pivot)              │               │   │
│  ├────────────────────────────────────────────────────┼───────────────┤   │
│  │role_id (FK)                                       │               │   │
│  │permission_id (FK)                                 │               │   │
│  └────────────────────────────────────────────────────┘               │   │
│                                                                     │   │
│  ┌─────────────────────┐                                            │   │
│  │     organizers      │◀───────────────────────────────────────────┘   │
│  │  (pivot for events) │ (satu organizer bisa punya banyak events)        │
│  └─────────────────────┘                                                │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                        TRANSACTION TABLES                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────┐      ┌─────────────────────────┐                 │
│  │  transactions    │◀─────│   transaction_items     │                 │
│  ├──────────────────┤      ├─────────────────────────┤                 │
│  │id                │1     │id                       │                 │
│  │code (TRX****)    │      │transaction_id (FK)      │                 │
│  │event_id (FK)     │      │ticket_id (FK)           │                 │
│  │buyer_user_id (FK)│      │quantity                 │                 │
│  │name              │      │price_at_purchase        │                 │
│  │email             │      │subtotal                  │                 │
│  │status            │      └─────────────────────────┘                 │
│  │fee_amount        │                                                  │
│  │unique_amount     │      ┌─────────────────────────┐                 │
│  │total_amount      │      │     tickets            │                 │
│  │midtrans_order_id │      │  (for reference)        │                 │
│  │midtrans_status   │      └─────────────────────────┘                 │
│  │payment_method    │                                                  │
│  │payment_deadline  │      ┌─────────────────────────┐                 │
│  │paid_at           │      │   ticket_codes         │                 │
│  │created_at        │      ├─────────────────────────┤                 │
│  │updated_at        │      │id                       │                 │
│  └──────────────────┘      │transaction_item_id(FK)│                 │
│                            │code (TIX****)         │                 │
│                            │is_redeemed            │                 │
│                            │redeemed_at            │                 │
│                            │redeemed_by (FK→users) │                 │
│                            │created_at             │                 │
│                            │updated_at             │                 │
│                            └─────────────────────────┘                 │
│                                                                         │
│  ┌─────────────────────────┐                                            │
│  │      waitlists          │                                            │
│  ├─────────────────────────┤                                            │
│  │id                       │                                            │
│  │event_id (FK)            │                                            │
│  │ticket_id (FK)          │                                            │
│  │user_id (FK)             │                                            │
│  │status (waiting/notified/claimed/expired)│                             │
│  │notified_at              │                                            │
│  │claimed_at              │                                            │
│  │expires_at              │                                            │
│  │created_at              │                                            │
│  │updated_at              │                                            │
│  └─────────────────────────┘                                            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.4 Database Relationships

| Table | Relationships |
|-------|---------------|
| users | hasOne organizer (if role=organizer), belongsToMany roles, hasMany transactions (as buyer), hasMany waitlists |
| roles | belongsToMany permissions, belongsToMany users |
| permissions | belongsToMany roles |
| organizers | belongsTo user, hasMany events |
| events | belongsTo organizer, belongsTo category, hasMany tickets, hasMany transactions, hasMany waitlists |
| categories | hasMany events |
| tickets | belongsTo event, hasMany transactionItems, hasMany waitlists |
| transactions | belongsTo event, belongsTo user (buyer), hasMany transactionItems, hasMany ticketCodes |
| transaction_items | belongsTo transaction, belongsTo ticket |
| ticket_codes | belongsTo transactionItem, belongsTo user (redeemer optional) |
| waitlists | belongsTo event, belongsTo ticket, belongsTo user |

### 4.5 API Endpoints

```
AUTH
──────────────────────────────────────────────────────────────────────────
POST   /api/auth/register          # Register new user (role: attendee)
POST   /api/auth/login              # Login, return JWT
POST   /api/auth/logout             # Invalidate token
GET    /api/auth/me                 # Get current user + roles

PUBLIC
──────────────────────────────────────────────────────────────────────────
GET    /api/events                  # List events (public)
GET    /api/events/{slug}           # Event detail
GET    /api/categories              # List categories

CHECKOUT
──────────────────────────────────────────────────────────────────────────
POST   /api/checkout                # Create transaction + Midtrans
GET    /api/checkout/{code}/status  # Check payment status
POST   /api/checkout/{code}/retry   # Retry expired payment

MIDTRANS WEBHOOK
──────────────────────────────────────────────────────────────────────────
POST   /api/webhooks/midtrans       # Handle payment notification

USER TICKETS (Authenticated)
──────────────────────────────────────────────────────────────────────────
GET    /api/tickets                 # List own tickets
GET    /api/tickets/{code}          # Ticket detail with QR
GET    /api/tickets/{code}/pdf      # Download PDF

WAITLIST (Authenticated)
──────────────────────────────────────────────────────────────────────────
POST   /api/waitlist                # Join waitlist for sold out ticket
GET    /api/waitlist                # List own waitlist entries
DELETE /api/waitlist/{id}           # Leave waitlist
POST   /api/waitlist/{id}/claim     # Claim ticket when notified

ORGANIZER (Authenticated + Organizer role)
──────────────────────────────────────────────────────────────────────────
GET    /api/organizer/events        # List own events
POST   /api/organizer/events        # Create event
GET    /api/organizer/events/{id}   # Edit event
PUT    /api/organizer/events/{id}   # Update event
DELETE /api/organizer/events/{id}   # Delete event

GET    /api/organizer/events/{id}/tickets      # List tickets
POST   /api/organizer/events/{id}/tickets     # Create ticket
PUT    /api/organizer/tickets/{id}            # Update ticket
DELETE /api/organizer/tickets/{id}            # Delete ticket

GET    /api/organizer/transactions             # List transactions
GET    /api/organizer/events/{id}/reports      # Sales report

ADMIN (Authenticated + Super Admin role)
──────────────────────────────────────────────────────────────────────────
CRUD   /api/admin/users               # User management
CRUD   /api/admin/roles               # Role & permission management
CRUD   /api/admin/categories          # Category management
GET    /api/admin/transactions        # All transactions
PUT    /api/admin/transactions/{id}/status  # Manual override status

CHECK-IN (Authenticated + Organizer/Admin)
──────────────────────────────────────────────────────────────────────────
POST   /api/checkin/verify           # Verify ticket code
POST   /api/checkin/redeem           # Redeem ticket
```

### 4.6 Frontend (React 19)

**Folder Structure:**
```
frontend/
├── src/
│   ├── api/              # API client (axios + interceptors)
│   ├── components/
│   │   ├── common/       # Button, Input, Modal, etc.
│   │   ├── layout/       # Header, Sidebar, Footer
│   │   └── features/     # EventCard, TicketSelector, etc.
│   ├── pages/
│   │   ├── public/       # Home, EventDetail, Checkout
│   │   ├── auth/         # Login, Register
│   │   ├── dashboard/    # User tickets
│   │   ├── organizer/    # Event CRUD, Reports
│   │   └── admin/        # User/Role/Category management
│   ├── hooks/            # Custom hooks
│   ├── context/          # AuthContext, ThemeContext
│   ├── lib/              # Utils, constants
│   ├── locales/          # i18n translations (en, id)
│   │   ├── en.json
│   │   └── id.json
│   └── stores/           # Zustand stores
├── package.json
└── vite.config.js
```

**Dependencies:**
- React 19 + Vite
- React Router 7
- Tailwind CSS
- Zustand (state management)
- React Query (server state)
- Axios (HTTP client)
- react-hot-toast (notifications)
- React Hook Form + Zod (forms)
- QRCode.react (QR display)
- i18next + react-i18next (internationalization)

### 4.6.1 Internationalization (i18n)

| Language | Code | Status |
|----------|------|--------|
| Indonesia | id | Primary (default) |
| English | en | Secondary |

**Implementation:**
- i18next with namespace separation (common, auth, event, ticket, etc.)
- Language switcher in header
- User preference stored in localStorage + synced to backend
- Backend stores user language preference
- All UI strings externalized to locale files

### 4.7 Integrations

#### 4.7.1 Midtrans

| Feature | Implementation |
|---------|---------------|
| Payment Types | Virtual Account (BNI, BRI, BCA, Mandiri), QRIS |
| Flow | Create transaction → Get snap_token → Redirect to Midtrans → Webhook notification |
| Expiry | 24 hours auto-expire |
| Sandbox | Use Midtrans Sandbox for development |

**Midtrans Config:**
```env
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
MIDTRANS_IS_PRODUCTION=false
MIDTRANS_SANDBOX=true
```

#### 4.7.2 Email

| Email | Trigger |
|-------|---------|
| Ticket Confirmation | Payment success |
| Payment Instructions | Transaction created |
| Payment Expired | Expiry reminder (1 hour before) |

**Email Service:** SMTP (configurable via .env)

#### 4.7.3 QR Code

| QR Content | Format |
|-------------|--------|
| Ticket Code | `TICKETY:{ticket_code}` |

QR contains only the ticket code. Server validates all ticket data.

---

## 5. Non-Goals (What's NOT Being Built)

1. **Multi-tenancy** — Single standalone application, not SaaS
2. **Mobile apps** — Web only (PWA acceptable later)
3. **Social login** — Email/password only
4. **Refund system** — Manual process (not in MVP)
5. **Seat selection** — Simple ticket quantity selection only
6. **Recurring events** — Single occurrence events only
7. **Promo codes/discounts** — Not in MVP
8. **Analytics dashboard** — Basic reports only
9. **Organization management** — Single organizer per event only

---

## 6. Security Considerations

1. **JWT Authentication** — Access token (15 min) + Refresh token (7 days)
2. **Password Hashing** — bcrypt via Laravel Hash
3. **RBAC Middleware** — Check permissions on every API request
4. **Input Validation** — Zod (frontend) + FormRequest (backend)
5. **Rate Limiting** — 60 requests/minute per IP
6. **CORS** — Whitelist frontend domain only
7. **SQL Injection** — Eloquent ORM with parameterized queries
8. **XSS** — Sanitize output, CSP headers
9. **CSRF** — Not applicable (JWT-based API)

---

## 7. Configuration

### 7.1 Environment Variables (Backend)

```env
# App
APP_NAME=Tickety
APP_ENV=local
APP_URL=http://localhost:8000

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=tickety
DB_USERNAME=root
DB_PASSWORD=

# JWT
JWT_SECRET=
JWT_TTL=15
JWT_REFRESH_TTL=10080

# Midtrans
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
MIDTRANS_IS_PRODUCTION=false

# Email
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM_ADDRESS=noreply@tickety.test
MAIL_FROM_NAME="${APP_NAME}"

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### 7.2 Environment Variables (Frontend)

```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=Tickety
```

---

## 8. Development Phases

### Phase 1: Foundation (Backend Core)
- [ ] Laravel 13 setup dengan clean install
- [ ] Database migration & seeder
- [ ] JWT authentication (register, login, logout)
- [ ] RBAC system (roles, permissions tables)
- [ ] User, Role, Category CRUD (admin)
- [ ] Basic API structure + error handling

### Phase 2: Event & Ticket (Organizer)
- [ ] Event CRUD with draft/publish workflow
- [ ] Ticket CRUD (organizer)
- [ ] Stock management
- [ ] Event listing (public, published only)

### Phase 3: Checkout & Payment
- [ ] Midtrans integration (VA + QRIS)
- [ ] Transaction flow
- [ ] Webhook handler
- [ ] Payment expiry job (24 hours)
- [ ] Email notifications

### Phase 4: Tickets & Check-in
- [ ] Ticket code generation
- [ ] QR code display (frontend)
- [ ] PDF generation
- [ ] Check-in API
- [ ] Redeem validation
- [ ] Waitlist system (join, notify, claim)

### Phase 5: Frontend
- [ ] React 19 setup
- [ ] Auth pages (login, register)
- [ ] Public pages (home, event detail)
- [ ] Checkout flow
- [ ] User dashboard (my tickets)
- [ ] Organizer dashboard
- [ ] Admin dashboard

### Phase 6: i18n & Polish
- [ ] i18n setup (Indonesian + English)
- [ ] Language switcher
- [ ] Reports (basic sales)
- [ ] Error handling
- [ ] Loading states
- [ ] Responsive design
- [ ] Testing (basic)

---

## 9. Open Questions

- [x] Apakah perlu support event draft/publish workflow? **Ya**
- [x] Apakah perlu waitlist saat ticket sold out? **Ya**
- [x] Apakah perlu multiple organizer dalam satu organization? **Tidak**
- [x] Berapa lama payment expiry? **24 jam**
- [x] Apakah perlu support bahasa lain (i18n)? **Ya (ID + EN)**

---

## 10. Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-07-21 | Initial PRD draft |
| 1.1 | 2026-07-21 | Added: draft/publish workflow, waitlist, i18n (ID+EN), organization=N/A |

---

## 11. Appendix

### A. Status Enums

```
TransactionStatus:
- pending      # Menunggu payment
- paid         # Payment success (via Midtrans webhook)
- expired      # Payment timeout
- cancelled    # Dibatalkan user
- failed       # Payment gagal

EventType:
- offline      # Event fisik
- online       # Event online/zoom/etc

EventStatus:
- draft        # Belum dipublish
- published    # Visible di public listing
- cancelled    # Event dibatalkan

WaitlistStatus:
- waiting      # Dalam antrian
- notified     # Sudah di-notify (ticket available)
- claimed      # Ticket sudah diklaim
- expired      # Masa klaim habis (24 jam)
```

### B. Code Formats

```
Transaction Code:  TRX + 6 alphanumeric (e.g., TRX8K4M2N)
Ticket Code:       TIX + 6 alphanumeric (e.g., TIX7P9Q2R)
```

### C. Error Codes

| Code | Message |
|------|---------|
| 400 | Validation error |
| 401 | Unauthorized |
| 403 | Forbidden (no permission) |
| 404 | Resource not found |
| 409 | Conflict (e.g., ticket sold out) |
| 422 | Unprocessable entity |
| 500 | Server error |
