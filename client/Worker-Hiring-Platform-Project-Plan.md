# Worker Hiring Platform — Project Plan

**Purpose:** A web platform to connect customers with skilled workers (carpenters, masons, electricians, etc.). Customers can post jobs or hire workers directly. Workers can browse/apply to nearby jobs or be hired on the spot.

**Roles for v1:** Customer, Worker
**Roles planned later:** Admin

This document breaks the build into phases so the team can plan sprints, assign ownership, and track progress. Each phase lists the features, the core data involved, and what "done" looks like.

---

## Phase 0 — Foundations & Planning

**Goal:** Align on architecture before writing feature code.

- Finalize tech stack (frontend, backend, DB, hosting, maps/geo provider)
- Define core data models: User, Customer, Worker, Job, JobApplication, Skill, Address/Location, Rating/Review
- Decide on authentication approach (email/password, OTP, social login)
- Set up repo, CI/CD, environments (dev/staging/prod)
- Decide on image storage (S3 or equivalent) for job photos and profile photos
- Decide on geolocation strategy (lat/long storage + distance search — e.g. PostGIS, geohashing, or simple bounding-box + Haversine)

**Done when:** Architecture doc + data model agreed and repo is bootstrapped.

---

## Phase 1 — Authentication & Core Profiles

**Goal:** A user can sign up as Customer or Worker and manage a basic profile.

- Sign up / login (Customer, Worker)
- Role selection at signup
- Basic profile CRUD:
  - Customer: name, phone, email, address, profile photo
  - Worker: name, phone, email, bio, skills, city/state/country, lat/long, profile photo, hourly/fixed rate preference
- Password reset / OTP verification (if applicable)
- Basic account settings (edit profile, deactivate account)

**Done when:** Both roles can register, log in, and edit their own profile.

---

## Phase 2 — Job Posting (Customer Side)

**Goal:** A customer can create and manage a job listing.

- Create job: title, description, category/skills needed, budget (range or fixed), job location (address + lat/long), multiple photos
- Edit / delete / close a job
- View "My Jobs" list with status (open, in progress, completed, cancelled)
- Job status lifecycle: `open → assigned → in progress → completed / cancelled`

**Done when:** A customer can fully create, edit, and manage the lifecycle of a job posting with photos and location.

---

## Phase 3 — Job Discovery & Search (Worker Side)

**Goal:** A worker can find relevant jobs near them.

- Job feed/listing filtered by:
  - Distance from worker's location (adjustable radius)
  - Skill/category match
  - Budget range
- Job detail view (photos, description, budget, location, customer info)
- Sort options (nearest, newest, highest budget)

**Done when:** A worker can search and filter jobs by distance and skill, and view full job details.

---

## Phase 4 — Worker Search & Direct Hire (Customer Side)

**Goal:** A customer can find and hire a worker directly, without posting a job.

- Worker search/browse filtered by:
  - Distance from customer's location
  - Skill/category
  - Rating (once reviews exist)
- Worker profile view (bio, skills, rate, past work/rating if available)
- "Hire directly" action — creates a direct engagement without going through the open-job/application flow

**Done when:** A customer can search nearby workers by skill and initiate a direct hire.

---

## Phase 5 — Applications & Hiring Flow

**Goal:** Connect the two sides — applying, accepting, and assigning.

- Worker applies to an open job (with optional message/quote)
- Customer views applicants for a job
- Customer accepts an applicant → job status becomes "assigned"
- Reject/withdraw application flows
- Notification to both parties on key events (new application, accepted, job status change) — can start as in-app notifications, email/SMS later

**Done when:** Full loop works: job posted → worker applies → customer accepts → job assigned to worker.

---

## Phase 6 — Rates, Budget & Payment Groundwork

**Goal:** Handle how money is represented (actual payment processing can be a later phase if out of scope for v1).

- Customer sets job budget: fixed amount or budget range
- Worker sets rate: per-hour or fixed, shown on profile
- Budget/rate shown consistently across job posting, search results, and applications
- (Future) Payment gateway integration, escrow/milestones, invoicing

**Done when:** Budget and rate data is captured, displayed, and consistent across all screens. Payment processing scoped separately.

---

## Phase 7 — Trust & Quality Features

**Goal:** Build confidence between customers and workers.

- Ratings & reviews after job completion (customer rates worker, optionally vice versa)
- Worker verification badge (optional, manual or doc-based)
- Report/flag a user or job

**Done when:** Completed jobs generate a review, and ratings show on worker profiles/search results.

---

## Phase 8 — Admin Panel

**Goal:** Give the platform operator visibility and control.

- Admin login (separate role)
- View/manage all users (customers, workers)
- View/manage all jobs
- Handle reported users/jobs
- Basic analytics (active jobs, active users, completed jobs)

**Done when:** Admin can view and moderate all platform activity.

---

## Cross-Cutting Concerns (apply throughout, not a single phase)

- Responsive UI (mobile-first, since workers/customers will likely use phones on the go)
- Notifications (in-app → email/SMS as it matures)
- Location permission handling (browser geolocation + manual address entry fallback)
- Image upload/compression for job and profile photos
- Basic analytics/logging for debugging and usage tracking

---

## Suggested Team Coordination Approach

- Treat **Phase 0–1** as a blocking foundation — nothing else should start until auth + profile + data models are settled.
- **Phase 2 and Phase 3** can be worked in parallel by two devs once Phase 1 is done (one owns job creation, the other owns job search).
- **Phase 4** can start alongside Phase 3 since it reuses the same search/location logic on workers instead of jobs.
- **Phase 5** depends on both Phase 2 and Phase 3/4 being functional — plan it right after.
- **Phase 6** (budget/rate display) is mostly data + UI polish and can be threaded through Phases 2–5 rather than done as a hard-blocking phase.
- **Phase 7 and 8** are safe to defer until the core marketplace loop (post → discover → apply/hire → complete) is working end-to-end.

