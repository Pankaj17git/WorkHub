# WorkHub — Authentication & Roles Setup

This document describes the authentication system that was implemented: account creation (signup) with email OTP verification, login with email + password, role-based routing (Customer / Worker), session handling via cookies, and route protection.

---

## 1. What Was Changed

### Backend (API layer)

| File | Change |
|---|---|
| `client/app/api/auth/auth.ts` | `registerSchema`: `phone` is now **optional**, `role` restricted to enum `["CUSTOMER", "WORKER"]` |
| `client/controller/auth.controller.ts` | `register` now upserts the chosen role into the new `roles` table and links it to the created user (`roleId`). `verifyOtp` now sets `emailVerifiedAt` on the user when OTP verification succeeds |
| `client/lib/swagger.ts` | `RegisterRequest` schema updated: `phone` optional/nullable, role enum narrowed to CUSTOMER / WORKER |

### Database (Prisma)

| File | Change |
|---|---|
| `prisma/models/role.prisma` (**new**) | New `Role` model — separate `roles` table |
| `prisma/models/user.prisma` | Added `roleId BigInt?` + relation `roleRef Role?` on `User` |
| `prisma/migrations/20260826120000_add_roles_table/migration.sql` (**new**) | Creates `roles` table, adds `users.role_id` FK, and seeds `CUSTOMER` and `WORKER` roles |
| `prisma/seed.ts` (**new**) | Standalone seed script for the two roles |

### Frontend

| File | Change |
|---|---|
| `lib/auth-client.ts` (**new**) | Cookie-based session helpers (`saveSession`, `getToken`, `getUser`, `clearSession`, plus a `useSyncExternalStore`-compatible snapshot) |
| `app/login/page.tsx` | Rewritten: Step 1 = choose role (Customer / Worker), Step 2 = email + password → real call to `/api/auth/login`. Redirects by role. Phone/PIN/demo-OTP UI removed |
| `app/signup/page.tsx` | Rewritten: Step 1 = choose role, Step 2 = name + email + password → `/api/auth/register`, then automatically sends a 6-digit OTP to the email (`/api/auth/otp/send`), Step 3 = verify OTP (`/api/auth/otp/verify`) → logged in and redirected by role. Phone number field removed entirely |
| `app/worker/login/page.tsx` | **Deleted** (unified login handles both roles) |
| `app/worker/signup/page.tsx` | **Deleted** (unified signup handles both roles) |
| `app/worker/layout.tsx` | Removed references to deleted worker auth pages; header links point to unified `/login` and `/signup` |
| `components/layout/Navbar.tsx` | "Worker Portal" link removed from desktop nav and mobile menu; navbar is now session-aware: shows Log In / Sign Up when logged out, shows user name + Logout button when logged in |
| `middleware.ts` (**new**) | Protects all `/worker/*` routes: requires a valid session cookie whose JWT payload has `role === "WORKER"`, otherwise redirects to `/login?role=WORKER` |

### Build fixes (pre-existing breakage, required to make the app compile)

| File | Fix |
|---|---|
| `lib/supabase.ts` | Supabase client is now created lazily so builds don't fail when Supabase env vars are missing |
| `services/upload.service.ts` | Fixed broken Prisma import; uploads now require a `userId` (matches the `Upload.userId` column) |
| `.env.example` (**new**) | Documents every environment variable the app needs |

---

## 2. Auth Flows

### Signup (first-time users)

```
User opens /signup
   │
   ├─ Step 1: Choose account type ──►  [ I'm a Customer ]  or  [ I'm a Service Pro ]
   │
   ├─ Step 2: Enter Full Name + Email + Password
   │     POST /api/auth/register  { name, email, password, role }
   │     → creates the user (no phone needed)
   │
   ├─ Step 3: App automatically sends a 6-digit code
   │     POST /api/auth/otp/send  { email }
   │     → emailed to the user (dev mode also returns `otp` in the response)
   │
   ├─ User enters the code
   │     POST /api/auth/otp/verify { email, otp }
   │     → sets emailVerifiedAt, returns JWT + user
   │
   └─ Session saved in cookies → redirect:
         WORKER   → /worker/dashboard
         CUSTOMER → /
```

### Login (returning users)

```
User opens /login
   │
   ├─ Step 1: Choose role (Customer / Worker)
   │
   ├─ Step 2: Email + Password
   │     POST /api/auth/login { email, password }
   │
   └─ Session saved in cookies → redirect by stored role:
         WORKER   → /worker/dashboard
         CUSTOMER → /
```

> Note: the role picker on login is a UX choice only — the actual authorization comes from the role stored in the database and embedded in the JWT.

---

## 3. Roles Model

- Separate `roles` table (`prisma/models/role.prisma`) with two seeded rows:

| id | name |
|----|----------|
| 1 | CUSTOMER |
| 2 | WORKER |

- `users.role_id` is a nullable FK to `roles.id`. Registration upserts the role row if it's missing (self-healing), so the seed is a convenience rather than a hard requirement.
- The legacy `users.role` string column is kept in sync and remains the source used inside the JWT payload (`signToken`).

### Route access rules

| Route | Access |
|---|---|
| `/`, `/search`, `/pro/*`, `/book/*`, `/bookings/*`, `/login`, `/signup` | Public |
| `/worker/*` (dashboard, jobs, earnings, services, profile) | Requires valid session cookie with `role=WORKER`; everyone else is redirected to `/login?role=WORKER` |

Protection lives in `client/middleware.ts`. It decodes the JWT payload (without signature verification — that happens server-side in the API routes) purely to gate navigation.

---

## 4. Session Handling

Implemented in `lib/auth-client.ts` using `document.cookie`:

| Cookie | Contents | Expiry |
|---|---|---|
| `wh_token` | JWT returned by the API | 7 days |
| `wh_user` | JSON user object `{ id, email, name, phone, role }` | 7 days |

Helpers: `saveSession(token, user)`, `getToken()`, `getUser()`, `clearSession()`, `getSessionSnapshot()` (for React `useSyncExternalStore`).

Logout (navbar button) calls `clearSession()` and navigates to `/login`.

> Because these are plain JS-set cookies they are not `httpOnly`. For production, consider moving token storage to an httpOnly cookie set by the server.

---

## 5. API Endpoints Used

All documented at `/api-docs` (Swagger):

| Endpoint | Body | Response |
|---|---|---|
| `POST /api/auth/register` | `{ name, email, password, role }` (phone optional) | `{ user, token }` |
| `POST /api/auth/login` | `{ email, password }` | `{ user, token }` |
| `POST /api/auth/otp/send` | `{ email }` | `{ otpId, expiresAt, emailSent, otp? }` (`otp` only in dev) |
| `POST /api/auth/otp/verify` | `{ email, otp }` (6 digits) | `{ verified, token, user }` |

Roles accepted at registration: `CUSTOMER` | `WORKER`.

---

## 6. Setup Steps

```bash
cd client

# 1. Create your .env from the example and fill in values
cp .env.example .env
#    Required: DATABASE_*, JWT_SECRET, SMTP_* (for real OTP emails)

# 2. Generate the Prisma client
npx prisma generate

# 3. Apply migrations (creates the roles table and seeds CUSTOMER/WORKER)
npx prisma migrate deploy

# 4. (Optional) Re-seed roles manually
npx tsx prisma/seed.ts

# 5. Run
npm run dev        # http://localhost:3001
```

### Environment variables

| Variable | Purpose |
|---|---|
| `DATABASE_HOST/PORT/USER/PASSWORD/NAME/URL` | MySQL/MariaDB connection for Prisma |
| `JWT_SECRET` | Signs session JWTs (7-day expiry). **Required** |
| `SMTP_HOST/PORT/USER/PASS` | Nodemailer transport for sending OTP emails. If unset, OTP delivery fails gracefully and the API surfaces a notice |
| `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_BUCKET` | Only needed for file uploads (`/api/uploads`) — lazy-loaded, safe to omit otherwise |

### Testing OTP without SMTP configured

In dev, `/api/auth/otp/send` returns the plain `otp` value in its JSON response, so you can complete verification locally without an email server. This must be removed before production (flagged in the swagger docs).
