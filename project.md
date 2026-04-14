# RideFlex Project Guide

## Overview

This repository contains a car rental platform branded as **RideFlex**.

At a high level, the app lets users:

- browse a curated fleet of rental vehicles
- filter inventory by location, category, and budget
- open a vehicle detail page and create a booking
- register, log in, and manage sessions
- submit contact/support inquiries
- complete checkout with Paystack
- manage bookings from a dashboard
- handle role-based operations for members, agents, and owners

The platform is built as a **Next.js 16 frontend** plus a **Node/Express backend** with **Postgres/Neon** persistence.

## What Runs In This App

### 1. Frontend web app

- Framework: `Next.js 16.2.2`
- React version: `React 19.2.4`
- Location: `frontend/`
- Main UI router: `frontend/app/`
- Styling: global CSS plus component/page-level Tailwind utility classes

The frontend is responsible for:

- marketing pages
- car browsing
- deal browsing
- auth forms
- dashboard UI
- payment status and checkout UI
- route handlers under `frontend/app/api/*`

### 2. Backend API service

- Runtime: Node.js + `express`
- Location: `backend/src/`
- Default local port: `4000`
- API base path: `/api`

The backend is responsible for:

- authentication
- session-backed user lookup
- bookings
- contact inquiries
- dashboard data aggregation
- password reset token lifecycle
- Paystack payment initialization and verification
- database schema bootstrapping and seed data

### 3. Database

- Driver: `postgres`
- Intended provider: Postgres / Neon

Main database tables created by the backend:

- `rideflex_users`
- `rideflex_sessions`
- `rideflex_payments`
- `rideflex_bookings`
- `rideflex_contact_inquiries`
- `rideflex_password_reset_tokens`

### 4. Payments

- Provider: `Paystack`
- Main backend integration file: `backend/src/paystack.mjs`
- Frontend payment endpoints: `frontend/app/api/payments/*`
- Webhook endpoint: `frontend/app/api/payment/webhook/route.ts`
- Payment callback UI: `frontend/app/payment-callback/page.tsx`

### 5. Email delivery

- Library: `nodemailer`
- Main file: `backend/src/mailer.mjs`

If SMTP is not configured, password reset still works in development by returning/logging a preview URL instead of sending a real email.

## How The App Runs

### Local development

Root scripts from `package.json`:

- `npm run dev`
  Runs frontend and backend together with `concurrently`.
- `npm run dev:frontend`
  Starts Next.js in `frontend/`.
- `npm run dev:backend`
  Starts the Express backend.
- `npm run db:bootstrap`
  Ensures schema exists and seeds initial users/data.
- `npm run build`
  Builds the frontend app.
- `npm run start`
  Starts the built frontend app.
- `npm run lint`
  Runs ESLint on `backend` and `frontend`.
- `npm run typecheck`
  Runs the frontend TypeScript check.

### Expected local URLs

- Frontend app: `http://127.0.0.1:3000`
- Backend API: `http://127.0.0.1:4000/api`

### Deployment shape

- `vercel.json` builds the frontend and uses `frontend/.next` as output.
- `frontend/pages/api/backend/[[...slug]].js` acts as a backend bridge/proxy path for deployments.
- On Vercel, frontend code can resolve backend calls through `/api/backend` when `BACKEND_API_URL` is not set.

## Core Functionality

### Public customer experience

- Home page with a search-led hero and featured cars
- Browse cars page with filters for:
  - location
  - vehicle type
  - search query
  - max price
- Car detail pages with:
  - gallery
  - specs
  - related cars
  - reserved time slot visibility
  - booking form
- Deals page with promo-driven booking entry points
- Contact page for support and vehicle inquiries

### Authentication and account management

- register
- login
- logout
- forgot password
- token-based password reset

Auth flow details:

- backend creates a session token
- frontend signs that token into the `rideflex_session` cookie
- protected pages verify the cookie signature before calling backend auth endpoints

### Booking flow

- Booking begins on a car detail page
- The booking form collects start and end date/time
- Booking total is calculated from the vehicle rate, with optional deal pricing
- Backend validates and creates the booking
- Booking starts in a `pending` state until payment succeeds

### Payment flow

- Booking form initializes payment after booking creation
- User is redirected to Paystack
- Payment status is tracked as:
  - `pending`
  - `success`
  - `failed`
  - `abandoned`
- Successful verification confirms the booking
- Dashboard shows payment badges and a "complete checkout" / "retry checkout" action for unresolved bookings
- Webhook support exists for Paystack event processing

### Contact and support flow

- Customers can submit support/contact requests
- Inquiries are stored and attached to user context when available
- Inquiry statuses:
  - `new`
  - `in_progress`
  - `resolved`

### Dashboard roles

The app supports three roles:

- `member`
- `agent`
- `owner`

#### Member dashboard

- upcoming trips
- booking history
- total spend and trip stats
- payment status per booking
- complete/retry checkout from dashboard
- support requests tied to the member

#### Agent dashboard

- inquiry queue
- ability to update inquiry status
- assigned upcoming bookings
- recent member list
- operational stats

#### Owner dashboard

- platform-wide booking overview
- inquiry supervision
- team member visibility
- location performance metrics
- monthly revenue and booking counts

## Important Architecture Notes

### 1. Frontend and backend responsibilities are split

The app is not a pure single-process Next.js app.

- `frontend/app/*` renders UI and hosts route handlers
- `backend/src/server.mjs` is the main business-logic API service

### 2. Some catalog logic exists in both frontend and backend

This repo currently has a mixed architecture:

- `frontend/lib/store.ts` and `frontend/lib/mock-data.ts` power car browsing, UI filtering, and some local display logic
- `backend/src/car-catalog.mjs` and `backend/src/deals.mjs` power backend-side booking enrichment and deal lookups

That means fleet/deal definitions are represented in both layers today.

### 3. Backend-backed flows vs local display flows

As of the current structure:

- auth, dashboard, persistent bookings, inquiries, payments, and password reset are backend/database-driven
- browsing-oriented catalog and deal display behavior still depends heavily on frontend-side catalog helpers

### 4. Seed/bootstrap behavior

`npm run db:bootstrap` prepares schema and seed data.

Seeded users include:

- owner user from `OWNER_EMAIL` / `OWNER_PASSWORD`
- agent user from `AGENT_EMAIL` / `AGENT_PASSWORD`
- demo member: `alex@rideflex.io`
- guest/demo member: `jordan@rideflex.io`

The bootstrap also seeds example bookings and inquiries.

## Main Routes

### Frontend pages

- `/` - homepage
- `/cars` - browse inventory
- `/cars/[id]` - car details + booking
- `/deals` - promo/deal landing page
- `/contact` - inquiry form
- `/login` - sign in
- `/register` - create account
- `/forgot-password` - request reset
- `/reset-password` - reset entry page
- `/reset-password/[token]` - token-based reset page
- `/dashboard` - role-aware dashboard
- `/payment-callback` - payment verification UI

### Frontend app route handlers

Located in `frontend/app/api/`:

- `auth/*`
- `bookings`
- `cars`
- `contact`
- `inquiries/[id]`
- `payments/initialize`
- `payments/status`
- `payments/verify`
- `payment/webhook`
- `admin/payments/report`

### Backend API routes

Implemented in `backend/src/server.mjs`:

- `GET /api/health`
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/forgot-password`
- `GET /api/auth/reset-password/validate`
- `POST /api/auth/reset-password`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `GET /api/dashboard/me`
- `GET /api/bookings/me`
- `POST /api/bookings`
- `POST /api/contact`
- `PATCH /api/inquiries/:id`
- `POST /api/payment/initialize`
- `POST /api/payment/verify`
- `GET /api/payment/status`
- `POST /api/payment/webhook`
- `GET /api/admin/payments/report`

## Environment Variables

### Required

From `.env.example` and current code usage:

- `SESSION_SECRET`
- `DATABASE_URL` or another supported Postgres URL
- `OWNER_EMAIL`
- `OWNER_PASSWORD`

### Common backend/runtime variables

- `BACKEND_PORT`
- `BACKEND_API_URL`
- `DATABASE_URL_UNPOOLED`
- `POSTGRES_URL`
- `POSTGRES_URL_NON_POOLING`
- `AGENT_EMAIL`
- `AGENT_PASSWORD`

### Payment variables

- `PAYSTACK_SECRET_KEY`
- `PAYSTACK_PUBLIC_KEY`
- `BACKEND_URL` (used by webhook forwarding code)
- `APP_BASE_URL` or `FRONTEND_APP_URL` or `NEXT_PUBLIC_APP_URL`

### SMTP variables

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `SMTP_SECURE`

## Project Structure

```text
car-rental-platform/
├── backend/
│   └── src/
│       ├── bootstrap.mjs        # schema/bootstrap entry point
│       ├── car-catalog.mjs      # backend vehicle catalog summaries
│       ├── db.mjs               # Postgres client and schema creation
│       ├── deals.mjs            # backend deal definitions
│       ├── env.mjs              # backend env helpers
│       ├── mailer.mjs           # SMTP / reset email delivery
│       ├── paystack.mjs         # Paystack integration
│       ├── server.mjs           # Express API server
│       ├── store.mjs            # DB-backed business logic
│       └── utils.mjs            # hashing, dates, helpers
├── frontend/
│   ├── app/
│   │   ├── api/                 # Next route handlers
│   │   ├── cars/                # list/detail vehicle pages
│   │   ├── contact/             # support/contact page
│   │   ├── dashboard/           # role-aware dashboard
│   │   ├── deals/               # offer landing page
│   │   ├── forgot-password/     # reset request page
│   │   ├── login/               # login page
│   │   ├── payment-callback/    # post-payment UI
│   │   ├── register/            # signup page
│   │   ├── reset-password/      # reset flows
│   │   ├── globals.css          # global styling
│   │   ├── layout.tsx           # root layout
│   │   └── page.tsx             # homepage
│   ├── components/              # reusable UI building blocks
│   ├── lib/
│   │   ├── api-client.ts        # frontend booking/contact client helpers
│   │   ├── backend-auth.ts      # server-side backend API wrapper
│   │   ├── env.ts               # frontend/server env helpers
│   │   ├── format.ts            # currency/date/booking math
│   │   ├── mock-data.ts         # frontend catalog source data
│   │   ├── query.ts             # URL/search param helpers
│   │   ├── session.ts           # signed session cookie helpers
│   │   ├── store.ts             # frontend catalog/filter/deal helpers
│   │   └── types.ts             # shared frontend types
│   ├── pages/
│   │   └── api/
│   │       ├── backend/         # backend proxy for deployment/runtime bridge
│   │       ├── debug-env.js     # env diagnostics
│   │       ├── diagnostic.js    # diagnostics
│   │       └── health.js        # legacy health endpoint
│   ├── public/                  # static assets
│   ├── next.config.ts
│   └── tsconfig.json
├── .env.example
├── PAYSTACK_INTEGRATION.md
├── PAYSTACK_SETUP.md
├── vercel.json
├── eslint.config.mjs
└── package.json
```

## Quality Checks

Available repo checks:

- `npm run lint`
- `npm run typecheck`

Current note:

- TypeScript checking is configured for the frontend via `frontend/tsconfig.json`
- there is no separate backend TypeScript project because the backend is written in `.mjs`

## Quick Mental Model

If you are new to the codebase, the shortest useful mental model is:

1. `frontend/app/*` is the customer and dashboard UI.
2. `frontend/app/api/*` is the Next-side HTTP wrapper layer.
3. `frontend/lib/backend-auth.ts` is the bridge from Next server code to the backend API.
4. `backend/src/server.mjs` exposes the real persistent API.
5. `backend/src/store.mjs` contains most of the business rules and database operations.
6. `backend/src/db.mjs` creates and maintains the schema.
7. `backend/src/paystack.mjs` handles payments.

That path is the core of how the application works end to end.
