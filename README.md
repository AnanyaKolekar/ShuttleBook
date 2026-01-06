# Badminton Court Booking System (MERN)

Full-stack MERN application for booking badminton courts with equipment and coaches, backed by a configuration-driven pricing engine and admin management.
🔗 **Live Demo:** https://shuttle-book-qk96psw0o-ananyas-projects-64c5647f.vercel.app

## Prerequisites
- Node.js 18+
- MongoDB 5+ running locally or a connection string

## Quick Start (localhost:3000 backend)
1) Clone this repo and open a terminal in the project root.  
2) Backend setup:
```
cd backend
npm install
# create .env (see below) or rely on defaults
npm run seed           # load users, courts, equipment, coaches, pricing rules
npm run dev            # starts on http://localhost:3000
```
3) Frontend setup (new terminal):
```
cd frontend
npm install
npm run dev            # Vite dev server on http://localhost:5173
```
The frontend uses API base `http://localhost:3000/api` by default (set `VITE_API_URL` to override).

## Environment Variables
Create `backend/.env` (or set in shell):
```
MONGO_URI=mongodb://127.0.0.1:27017/badminton
PORT=3000
NODE_ENV=development
JWT_SECRET=supersecret
```
Frontend: optionally set `frontend/.env` with `VITE_API_URL`.

## Key Features
- Auth with JWT, bcrypt passwords, roles (`user`, `admin`); login page supports “Login as Admin” gate.
- Atomic multi-resource booking (court + optional equipment + optional coach) via MongoDB transactions.
- Live, configuration-driven pricing with stackable rules (peak, weekend, indoor premium, equipment/coach adjustments).
- Availability lookup by date with per-court slots.
- Booking history with cancellation and waitlist enrollment.
- Admin console to manage courts, equipment inventory, coaches/availability, pricing rules (JWT + role protected).
- Modern UI: avatar dropdown (settings placeholder + logout), card layout, INR currency.

## API Overview (base `/api`)
- `POST /auth/signup`, `POST /auth/login`, `GET /auth/me`
- `GET /meta` – active courts/equipment/coaches.  
- `GET /bookings/availability?date=YYYY-MM-DD&courtId=` – open slots for a court.  
- `POST /bookings/price` – live quote (auth).  
- `POST /bookings` – create booking (auth).  
- `GET /bookings/history` – user history (auth).  
- `POST /bookings/waitlist` – join waitlist (auth).  
- `PATCH /bookings/:id/cancel` – cancel + notify waitlist (auth).  
- Admin (JWT admin role): CRUD for courts, equipment, coaches, pricing rules under `/admin/*`.

## Seed Data
`npm run seed` loads:
- Users: `admin@example.com` / `Admin@123`, `user@example.com` / `User@123`
- 4 courts (2 indoor, 2 outdoor) with base rates.
- Equipment: rackets, shoes with inventory.
- 3 coaches with weekday availability and hourly rates.
- Pricing rules: weekend boost, peak hours, indoor premium, equipment handling flat fee, coach weekend premium.

## Testing Notes
- Booking assumes 1-hour slots by default UI; backend supports arbitrary ISO start/end.
- Waitlist notification is a console log on cancellation.
- Pricing is recomputed server-side; frontend shows live breakdown via `/bookings/price`.

## Design Write-up (≈400 words)
**Schema & Auth.** Core models include `User` (name, email, bcrypt password, role), `Court`, `Equipment`, `Coach`, `PricingRule`, `Booking`, and `Waitlist`. `Booking` references `user`, carries embedded equipment selections and a persisted price breakdown for auditability. A partial unique index on bookings prevents duplicate confirmed court slots. Users authenticate via JWT; admin-only routes are guarded on both API and UI. Seeded admin/user accounts accelerate testing.

**Pricing Engine.** `pricing.service.js` accepts court, coach, equipment set, time window, and all active rules from MongoDB. It computes duration, then layers domain costs: court base (baseRate × hours) plus court rules (peak, weekend, indoor premium), equipment subtotal with equipment rules, and coach subtotal with coach rules. Rules are filtered by criteria (day-of-week, hour window, court type, appliesTo) and applied in priority order as multipliers or flats. The service returns INR totals and a breakdown used for both live quotes and committed bookings, guaranteeing parity while keeping controllers free of pricing conditionals. Because rules are stored and editable via admin APIs, pricing stays configuration-driven.

**Atomic Booking & Concurrency.** `booking.service.js` attempts MongoDB transactions; if the server isn’t a replica set, it transparently falls back to non-transactional saves (with warnings) while still performing conflict checks. The service checks court conflicts, coach conflicts plus schedule windows, and equipment inventory via aggregations of overlapping bookings. All-or-nothing booking is preserved when sessions are available; otherwise, the unique index plus preflight checks mitigate double booking. Availability generation builds hourly slots (06:00–22:00) per requested court and removes any overlapping confirmed bookings. Cancellations flip status and trigger a waitlist notifier (console log) that promotes the next waiting user to “notified”.

**Admin Configurability.** Admin endpoints manage courts (enable/disable, base rates), equipment inventory, coach profiles with availability windows, and pricing rules with criteria/adjustments/priority and enable flags. Everything that influences booking or pricing is data-driven and lives in MongoDB, avoiding code changes for operational tweaks.

**Frontend Flow & UX.** React + Vite with hooks and Axios powers a modern, card-based UI. An AuthProvider persists JWT, injects authorization headers, and exposes login/signup/logout. The header shows role-aware navigation and an avatar dropdown with logout. Login supports “Login as Admin” guard; admins see the dashboard plus booking/history, while users see booking/history only. The booking page fetches metadata, shows per-court availability based on the selected court, and recalculates live INR pricing on every change. Confirmation posts a booking; failures surface a one-click waitlist join. History auto-loads for the signed-in user and supports cancellations. Admin dashboard allows CRUD for courts, equipment, coaches, and pricing rules with enable/disable toggles—all powered through the protected APIs.

## Assumptions
- Bookings are at least 1 hour (UI enforces 1-hour increments, backend accepts any ISO range).
- Time values are stored in ISO (server timezone); for strict TZ handling, layer on UTC normalization.

