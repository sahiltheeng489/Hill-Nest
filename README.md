<div align="center">

# 🏔️ HillNest

### A production-ready mountain homestay booking platform with a full-featured Admin Dashboard

[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://postgresql.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://mongodb.com)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)](https://redis.io)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://docker.com)

</div>

---

## Quick Jump

- [Overview](#overview)
- [What Changed Since Yesterday](#what-changed-since-yesterday)
- [UI Route Map](#ui-route-map)
- [Architecture](#architecture)
- [Security Architecture](#security-architecture)
- [Run Locally](#run-locally)
- [Project Structure](#project-structure)

---

## Overview

HillNest is a full-stack mountain homestay platform for browsing rooms, booking stays, managing customer accounts, and operating a protected admin console.

The product now leans into a calmer glassmorphism direction: transparent layers, blurred surfaces, a darker palette, minimal room layouts, and a full-home gallery experience that feels smoother and more premium across desktop and mobile.

> **Major update:** this README now documents the latest UI overhaul, gallery rebuild, navbar refresh, auth glassmorphism pass, and homepage route consolidation as a release-sized change.

---

## What Changed Since Yesterday

<details open>
<summary><strong>Open the compact patch notes</strong></summary>

- Global UI palette was updated to the requested balanced set:
  `#FFFFFF`, `#E7E7E7`, `#D1D1D1`, `#9B9B9B`, `#04151A`, `#092828`, `#163E3C`, `#325F57`, `#6F9487`
- Glassmorphism now drives the main visual language across the app.
- The navbar is now transparent and blurred on scroll instead of turning white.
- The thin top-gap / offset issue in the navbar was corrected so the header feels aligned again.
- Navbar text contrast was tuned so links stay readable on top of the hero and gallery backgrounds.
- Nav highlights were simplified to fit the glass style instead of using bright boxed emphasis.
- The gallery is now embedded directly into the homepage instead of living as a separate test-only page.
- The old gallery route now redirects to `/#gallery`, so the gallery stays centralized on the home page.
- The gallery now uses a vertical dot navigator on the right side with subtle glass styling.
- Gallery images fill the screen and are intended to feel immersive, minimal, and distraction-free.
- Gallery titles were kept, centered on each image, and given a smoother text pop treatment.
- Scroll behavior in the gallery was tuned to feel smoother and less jumpy on trackpads.
- The gallery interaction now favors calm ease-in / ease-out motion instead of snappy movement.
- Login and register pages were redesigned as translucent glass cards with blurred layers.
- White static blocks were reduced and replaced with darker gradients or glass surfaces where needed.
- The Open Sans font is now used as the primary readable UI font, with the local asset fallback preserved.
- Home, menu, and auth routes were adjusted to keep navigation centered around the homepage sections.
- The room layout and supporting surfaces were kept minimal so the content feels cleaner and more premium.
- This README itself was updated as a major release note for the current commit.

</details>

<details>
<summary><strong>Design notes that stay consistent</strong></summary>

- Minimal layout
- Soft transparency
- Blurred layers
- No harsh green highlight blocks
- No heavy glow treatment
- No bright white panels
- Smooth motion instead of sudden transitions

</details>

---

## UI Route Map

| Route | Behavior |
|---|---|
| `/` | Main homepage with hero, rooms, amenities, embedded gallery, and footer |
| `/#gallery` | Jumps directly to the homepage gallery section |
| `/gallery` | Redirects to `/#gallery` so the gallery is not split into a second experience |
| `/menu` | Mobile-style navigation hub with quick links back to homepage sections |
| `/login` | Glassmorphism sign-in page |
| `/register` | Glassmorphism registration page |
| `/rooms` | Room browsing experience |
| `/bookings` | User booking history |
| `/admin` | Protected admin area |

---

## Architecture

```text
Project F/
├── frontend/            # Next.js 15 App Router (TypeScript, Tailwind CSS v4)
│   └── src/app/
│       ├── page.tsx     # Homepage shell
│       ├── rooms/       # Room listings & detail pages
│       ├── booking/     # Booking flow
│       ├── bookings/    # User booking history
│       ├── login/       # Authentication
│       ├── register/    # Registration
│       ├── user/        # User profile & account
│       ├── menu/        # Navigation hub
│       └── admin/       # Protected admin dashboard
│
├── backend/             # Customer API (Node.js + Express + MongoDB)
│   ├── controllers/     # Route handlers
│   ├── models/          # Mongoose models
│   ├── routes/          # Express routes
│   ├── middleware/      # Auth and error handling
│   └── admin/           # Admin service (TypeScript + Express + PostgreSQL + Prisma)
│
├── k8s/                 # Kubernetes manifests
└── docker-compose.yml   # Local development environment
```

---

## Security Architecture

The security model is still intentionally split so customer auth, admin access, audit trails, and security testing do not depend on a single layer.

For the full write-up, see [SECURITY_ARCHITECTURE.md](./SECURITY_ARCHITECTURE.md).

### Core controls

- Customer and admin sessions stay separate.
- Browser sessions use `httpOnly` cookies.
- Access tokens stay short-lived, with refresh rotation.
- Admin logins require MFA.
- Requests are validated at the edge and again in the app.
- Sensitive responses are trimmed to the minimum fields needed by the UI.
- Security events are logged with structured metadata and stable actor names.
- Security regressions are preserved through local test logs and CI gates.

<details>
<summary><strong>Open the layered controls table</strong></summary>

| Layer | Control | Why it matters |
|---|---|---|
| Edge | WAF, TLS, reverse proxy | Blocks noisy attacks before they reach the app |
| Session | `httpOnly` cookies, `SameSite`, refresh rotation | Reduces token theft and replay risk |
| Identity | RBAC, admin MFA, account lockout | Limits what a compromised account can do |
| Input | Validation, escaping, ObjectId checks | Prevents malformed input and injection-style bugs |
| App | Rate limits, body size limits, safe response shaping | Shrinks the attack surface |
| Data | Parameterized queries, minimal projections | Prevents data leakage and unsafe access |
| Logging | Audit logs, security logs, correlation IDs | Makes incident review possible |
| Testing | Security regression tests, CI gate, saved reports | Catches regressions before deployment |

</details>

---

## Run Locally

<details>
<summary><strong>Recommended quick start</strong></summary>

```bash
git clone https://github.com/your-username/Project-F.git
cd "Project F"

cp backend/admin/.env.example backend/admin/.env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

docker-compose up
```

</details>

<details>
<summary><strong>Manual startup</strong></summary>

- Start infrastructure: `docker-compose up postgres redis minio -d`
- Start admin service: `cd backend/admin && npm install && npm run dev`
- Start customer API: `cd backend && npm install && npm run dev`
- Start frontend: `cd frontend && npm install && npm run dev`

</details>

### Default admin access

| Role | Email | Password |
|---|---|---|
| Super Admin | `admin@hillnest.in` | `admin@123` |
| Admin | `somadmin@hillnest.in` | `AdminPass@123` |

> Change these passwords immediately after first login.

---

## Project Structure

### Frontend highlights

- `frontend/src/app/page.tsx` keeps the homepage as the primary entry point.
- `frontend/src/app/sections/GalleryAndTestimonials.tsx` now embeds the gallery directly in the homepage.
- `frontend/src/app/components/ui/gallery/FullscreenGallery.tsx` powers the fullscreen gallery experience.
- `frontend/src/app/components/ui/layout/Navbar.tsx` handles the scroll-aware glass navigation.
- `frontend/src/app/login/page.tsx` and `frontend/src/app/register/page.tsx` use the glassmorphism auth shell.
- `frontend/src/app/globals.css` centralizes the palette, motion, blur, and typography rules.

### Backend highlights

- `backend/` powers the customer API.
- `backend/admin/` powers the protected admin service.
- The architecture stays split so the customer experience and admin tooling evolve independently.

## Major Update Marker

Treat this README as the major documentation update for the current commit. It now captures:

- the embedded homepage gallery experience
- the transparent blurred navbar treatment
- the login and register glassmorphism redesign
- the updated palette and Open Sans font setup
- the gallery route consolidation around `/#gallery`
- the current security architecture summary and split-service layout


