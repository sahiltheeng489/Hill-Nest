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

## 📖 Overview

**HillNest** is a full-stack web application for booking mountain homestays online. It consists of:

- 🌐 **Customer-facing frontend** — Browse rooms, make bookings, manage your account and view your booking history
- 🔧 **Customer API** — Handles user authentication, room listings, bookings, and Razorpay payments
- 🛡️ **Admin Service** — A secure, enterprise-grade backend powering the Admin Dashboard
- 📊 **Admin Dashboard** — A feature-rich internal tool for managing every aspect of the business

---

## 🏗️ Architecture

```
Project F/
├── frontend/            # Next.js 15 App Router (TypeScript, Tailwind CSS v4)
│   └── src/app/
│       ├── rooms/       # Room listings & detail pages
│       ├── booking/     # Booking flow
│       ├── bookings/    # User booking history
│       ├── login/       # Authentication
│       ├── register/    # Registration
│       ├── user/        # User profile & account
│       ├── menu/        # Navigation
│       └── admin/       # Admin Dashboard (protected)
│
├── backend/             # Customer API (Node.js + Express + MongoDB)
│   ├── controllers/     # Route handlers
│   ├── models/          # Mongoose models
│   ├── routes/          # Express routes
│   ├── middleware/       # Auth, error handling
│   └── admin/           # Admin Service (TypeScript + Express + PostgreSQL + Prisma)
│
├── k8s/                 # Kubernetes manifests
└── docker-compose.yml   # Local development environment
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites

Make sure you have the following installed:

| Tool | Version | Notes |
|---|---|---|
| [Node.js](https://nodejs.org) | 20+ | Required for all services |
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | Latest | For running Postgres, Redis, MinIO |
| [Git](https://git-scm.com) | Latest | Clone the repository |

> **MongoDB** is hosted on Atlas — no local container needed.

---

### Option A: Run Everything with Docker (Recommended)

The easiest way to run the full stack locally:

```bash
# 1. Clone the repo
git clone https://github.com/your-username/Project-F.git
cd "Project F"

# 2. Set up environment files (see Environment Variables section below)
cp backend/admin/.env.example backend/admin/.env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# 3. Start all services
docker-compose up
```

All services will start automatically in the correct order. Visit:

| Service | URL |
|---|---|
| 🌐 Frontend | http://localhost:3000 |
| 🔧 Customer API | http://localhost:5000 |
| 🛡️ Admin API | http://localhost:5001 |
| 🗄️ MinIO Console | http://localhost:9001 |

---

### Option B: Run Services Manually (Step-by-Step)

#### Step 1 — Start infrastructure

```bash
docker-compose up postgres redis minio -d
```

This starts PostgreSQL (port 5432), Redis (port 6379), and MinIO (port 9000/9001).

---

#### Step 2 — Set up the Admin Service

```bash
cd backend/admin

# Copy and configure the environment file
cp .env.example .env
# Edit .env — set DATABASE_URL, REDIS_URL, JWT secrets, etc.

# Install dependencies
npm install

# Run database migrations and seed default users
npx prisma migrate dev --name init
npx prisma db seed

# Start the admin service
npm run dev
```

✅ Admin API running at: **http://localhost:5001**

---

#### Step 3 — Start the Customer API

```bash
cd backend

# Configure your environment
cp .env.example .env
# Edit .env — set MONGO_URI, JWT_SECRET, RAZORPAY keys, etc.

# Install dependencies & start
npm install
npm run dev
```

✅ Customer API running at: **http://localhost:5000**

---

#### Step 4 — Start the Frontend

```bash
cd frontend

# Configure your environment
cp .env.example .env.local
# Edit .env.local — set API URLs

# Install dependencies & start
npm install
npm run dev
```

✅ Frontend running at: **http://localhost:3000**

---

### Admin Dashboard Access

Navigate to **http://localhost:3000/admin**

Default credentials seeded by `prisma db seed`:

| Role | Email | Password |
|---|---|---|
| Super Admin | `superadmin@hillnest.in` | `Admin@HillNest2024!` |
| Admin | `admin@hillnest.in` | `AdminPass@123!` |

> ⚠️ **Change these passwords immediately after your first login!**

---

## 🔑 Environment Setup

There are **three** `.env` files to configure — one per service. Follow each step carefully.

---

### Step 1 — Customer API (`backend/.env`)

```bash
cd backend
cp .env.example .env
```

Open `backend/.env` and fill in the following:

```env
# ── Server ──
PORT=5000
HOST=0.0.0.0

# ── MongoDB ──
# Get this from your MongoDB Atlas dashboard → Connect → Drivers
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
MONGO_DB=hillnest          # The database name to use inside your cluster

# ── JWT ──
# Use a long random string (min 32 chars). Generate one with:
#   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
JWT_SECRET=replace_with_a_long_random_secret_at_least_32_chars
JWT_EXPIRES_IN=7d

# ── CORS ──
CLIENT_URL=http://localhost:3000   # Your frontend URL

# ── Razorpay (Payments) ──
# Get these from https://dashboard.razorpay.com → Settings → API Keys
# Use test keys (rzp_test_...) during development
RAZORPAY_KEY_ID=rzp_test_REPLACE_ME
RAZORPAY_KEY_SECRET=REPLACE_ME_WITH_SECRET

# ── Rate Limiting ──
AUTH_RATE_LIMIT_WINDOW_MS=600000   # 10 minutes in ms
AUTH_RATE_LIMIT_MAX=10             # Max auth attempts per window
```

> 💡 **MongoDB Atlas setup**: Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas), add a database user, whitelist your IP (`0.0.0.0/0` for dev), then copy the connection string.

> 💡 **Razorpay**: Sign up at [razorpay.com](https://razorpay.com). Use **Test Mode** keys during development — no real money is charged.

---

### Step 2 — Admin Service (`backend/admin/.env`)

```bash
cd backend/admin
cp .env.example .env
```

Open `backend/admin/.env` and fill in the following:

```env
# ── Server ──
NODE_ENV=development
PORT=5001
HOST=0.0.0.0
API_VERSION=v1

# ── PostgreSQL ──
# If using Docker (recommended): use the values from docker-compose.yml
DATABASE_URL=postgresql://hillnest_admin:hillnest_dev_password@localhost:5432/hillnest_admin?schema=public
# If using a hosted DB (e.g. Supabase, Neon), paste your connection string here

# ── Redis ──
# If using Docker: use these defaults
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=hillnest_redis_dev   # Must match the password in docker-compose.yml

# ── JWT Secrets ──
# Generate a strong secret (min 64 chars):
#   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_ACCESS_SECRET=CHANGE_ME_STRONG_SECRET_MIN_64_CHARS
JWT_ACCESS_EXPIRES_IN=15m    # Short-lived access token
JWT_REFRESH_EXPIRES_IN=7d    # Longer-lived refresh token
JWT_ISSUER=hillnest-admin

# ── MFA Encryption Key ──
# Must be exactly 64 hex characters (= 32 bytes for AES-256)
# Generate one with:
#   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
MFA_ENCRYPTION_KEY=CHANGE_ME_EXACTLY_64_HEX_CHARS_HERE_0000000000000000000000000000
MFA_APP_NAME=HillNest Admin

# ── CORS ──
ADMIN_FRONTEND_URL=http://localhost:3000   # Must match your frontend origin

# ── Rate Limiting ──
RATE_LIMIT_WINDOW_MS=60000        # 1 minute
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX=10
AUTH_RATE_LIMIT_WINDOW_MS=300000  # 5 minutes

# ── Account Lockout ──
MAX_FAILED_LOGIN_ATTEMPTS=5
LOCKOUT_DURATION_MINUTES=15

# ── File Storage (choose one) ──

# Option A: Local MinIO (Docker — recommended for development)
S3_ENDPOINT=http://localhost:9000
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=hillnest_minio              # Matches MINIO_ROOT_USER in docker-compose.yml
S3_SECRET_ACCESS_KEY=hillnest_minio_secret   # Matches MINIO_ROOT_PASSWORD in docker-compose.yml
S3_BUCKET_NAME=hillnest-uploads
S3_PUBLIC_URL=http://localhost:9000/hillnest-uploads

# Option B: AWS S3 (production)
# S3_ENDPOINT=https://s3.amazonaws.com
# S3_REGION=ap-south-1
# S3_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID
# S3_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY
# S3_BUCKET_NAME=hillnest-uploads
# S3_PUBLIC_URL=https://hillnest-uploads.s3.ap-south-1.amazonaws.com

# ── Email (SMTP) ──
# For development, use a service like Mailtrap (https://mailtrap.io) to catch emails
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password   # Gmail: use an App Password, NOT your login password
EMAIL_FROM_NAME=HillNest Admin
EMAIL_FROM_ADDRESS=noreply@hillnest.in

# ── Logging ──
LOG_LEVEL=info      # Options: error | warn | info | debug
LOG_FORMAT=json

# ── Monitoring (optional for local dev) ──
PROMETHEUS_METRICS_PATH=/metrics
OTEL_SERVICE_NAME=hillnest-admin-service
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318

# ── MongoDB (read-only access to customer data) ──
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/
MONGO_DB=hillnest
```

> 💡 **Gmail App Password**: Go to your Google Account → Security → 2-Step Verification → App passwords. Generate one for "Mail". Do **not** use your real Gmail password.

> 💡 **MinIO (local S3)**: If you started MinIO via Docker Compose, the default credentials are already set in `docker-compose.yml`. The MinIO console is accessible at http://localhost:9001. Create the `hillnest-uploads` bucket there before uploading files.

> ⚠️ **Never commit your `.env` files to Git.** They are already listed in `.gitignore`.

---

### Step 3 — Frontend (`frontend/.env.local`)

```bash
cd frontend
cp .env.example .env.local
```

Open `frontend/.env.local` and fill in the following:

```env
# ── API URLs ──

# Public URL of the Customer API (accessible from the browser)
# For local dev, leave blank to use Next.js API routes as a proxy
NEXT_PUBLIC_API_URL=

# Internal URL of the Customer API (used by Next.js server-side rendering)
BACKEND_URL=http://127.0.0.1:5000

# Public URL of the Admin API (accessed directly from the browser)
NEXT_PUBLIC_ADMIN_API_URL=http://localhost:5001/api/admin
```

> 💡 `NEXT_PUBLIC_*` variables are **embedded into the browser bundle** — never put secrets here.
> Server-only variables like `BACKEND_URL` are safe because they are only used during SSR.

---

### Verify your setup

After filling in all `.env` files, run a quick check:

```bash
# Customer API — should print "Connected to MongoDB" and start on port 5000
cd backend && npm run dev

# Admin API — should print "Server running on port 5001"
cd backend/admin && npm run dev

# Frontend — should compile and open on port 3000
cd frontend && npm run dev
```

If anything fails, double-check that:
- Docker containers for Postgres and Redis are running (`docker-compose up postgres redis -d`)
- Your `DATABASE_URL` host is `localhost` (not `postgres`) when running the admin service outside Docker
- Your MongoDB Atlas IP whitelist includes your current IP address

---

## 📊 Admin Dashboard Modules

The Admin Dashboard provides full operational control over the platform:

| # | Module | What it does |
|---|---|---|
| 1 | **Dashboard** | KPIs, revenue charts, booking trends, recent activity feed |
| 2 | **Bookings** | Full lifecycle management: Pending → Confirmed → Completed / Cancelled / Refunded |
| 3 | **Customers** | View profiles, booking history, activity logs, suspend or reactivate accounts |
| 4 | **Payments** | Transaction monitoring, failed payment tracking |
| 5 | **Refunds** | Approval workflow for partial and full refunds |
| 6 | **Support Tickets** | Ticket assignment, internal notes, escalation |
| 7 | **CMS** | Manage Pages, FAQs, Blogs, Terms, and Privacy Policy (with version history) |
| 8 | **Analytics** | Revenue, bookings, customer, and refund reports with CSV / Excel / PDF export |
| 9 | **Security Center** | View active sessions, failed login attempts, blocked IPs, revoke sessions |
| 10 | **Monitoring** | Database health, Redis health, and system metrics |
| 11 | **Notifications** | Email, SMS, Push, and In-App notifications with delivery tracking |
| 12 | **Roles & Permissions** | Dynamic RBAC configuration |

---

## 👥 Roles & Permissions (RBAC)

Access is enforced through a 5-tier Role-Based Access Control system with 24 granular permissions:

| Role | Capabilities |
|---|---|
| **Super Admin** | Full access to everything (`admin:super`) |
| **Admin** | Bookings, Customers, Payments, Refunds, Tickets, Analytics |
| **Finance Manager** | Payments (read), Refunds (approve / read / write), Analytics |
| **Support Agent** | Tickets (read / write), Customers (read), Bookings (read) |
| **Moderator** | CMS (read / write) |

---

## 🔐 Security Features

| Feature | Implementation |
|---|---|
| **JWT Access Tokens** | 15-min expiry, HMAC-SHA256 signed |
| **Refresh Token Rotation** | httpOnly cookie, hashed in DB, rotated on each use |
| **MFA (TOTP)** | speakeasy + AES-256 encrypted secrets |
| **RBAC** | 24 permissions across 5 roles, deny-by-default |
| **Account Lockout** | 5 failed attempts → 15-min lockout via Redis |
| **Rate Limiting** | Redis-backed; per-user for API, per-IP for auth endpoints |
| **Security Headers** | Full Helmet.js (CSP, HSTS, XSS protection, no-sniff) |
| **Audit Logs** | Immutable log for every admin action |
| **Input Validation** | Zod schemas on every endpoint |
| **IP Blocking** | Admin-managed blocklist checked on every login |

---

## 🛡️ OWASP Top 10 Compliance

| Risk | Mitigation |
|---|---|
| ✅ A01 — Broken Access Control | RBAC + deny-by-default |
| ✅ A02 — Cryptographic Failures | bcrypt, AES-256, HTTPS enforced |
| ✅ A03 — Injection | Prisma ORM (parameterized queries), Zod validation |
| ✅ A04 — Insecure Design | Principle of least privilege applied |
| ✅ A05 — Security Misconfiguration | Helmet.js, no stack traces in production |
| ✅ A06 — Vulnerable Components | `npm audit` scripts in CI |
| ✅ A07 — Auth Failures | Account lockout, MFA, refresh token rotation |
| ✅ A09 — Logging & Monitoring | Winston + immutable `AuditLog` table |
| ✅ A10 — SSRF | No outbound requests based on user-supplied input |

---

## 🗄️ Database Schema Overview

### PostgreSQL (Admin Service)

| Category | Tables |
|---|---|
| **Identity & Auth** | `admin_users`, `roles`, `permissions`, `role_permissions`, `user_roles`, `admin_sessions`, `mfa_secrets`, `login_attempts` |
| **Business Data** | `customers`, `bookings`, `booking_history`, `payments`, `refunds` |
| **Support** | `tickets`, `ticket_notes` |
| **Content** | `cms_pages`, `cms_page_versions` |
| **Observability** | `audit_logs` (immutable), `activity_logs` (immutable) |
| **System** | `notifications`, `blocked_ips`, `system_settings` |

### MongoDB (Customer Service)

Stores customer-facing data: user accounts, room listings, bookings, and reviews.

---

## 🐳 Docker & Deployment

### Local Development (all services)
```bash
docker-compose up
```

### Production Build
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Kubernetes
```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/databases.yaml
kubectl apply -f k8s/admin-backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
```

---

## 📦 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15, TypeScript, Tailwind CSS v4 |
| **Customer API** | Node.js, Express 5, MongoDB, Mongoose |
| **Admin API** | Node.js, Express, TypeScript, PostgreSQL 16, Prisma ORM |
| **Auth** | JWT (Access + Refresh Tokens), TOTP MFA (speakeasy) |
| **Payments** | Razorpay |
| **Caching / Sessions** | Redis 7 (ioredis) |
| **File Storage** | AWS S3 / MinIO (S3-compatible) |
| **Logging** | Winston |
| **Metrics** | Prometheus (prom-client), OpenTelemetry |
| **Deployment** | Docker, Docker Compose, Kubernetes |

---

## 📁 Project Structure (Detailed)

<details>
<summary>Click to expand</summary>

```
Project F/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── admin/           # Admin dashboard pages (protected)
│   │   │   ├── booking/         # Booking flow pages
│   │   │   ├── bookings/        # Booking history
│   │   │   ├── login/           # Login page
│   │   │   ├── register/        # Registration page
│   │   │   ├── rooms/           # Room listings & detail
│   │   │   ├── user/            # User account & profile
│   │   │   ├── menu/            # Navigation/menu
│   │   │   └── sections/        # Reusable page sections
│   │   ├── components/          # Shared React components
│   │   ├── services/            # API client functions
│   │   └── store/               # Global state (e.g., Zustand/Redux)
│   └── Dockerfile
│
├── backend/
│   ├── controllers/             # Customer API route handlers
│   ├── models/                  # Mongoose schemas
│   ├── routes/                  # Express route definitions
│   ├── middleware/              # Auth, error, rate-limit middleware
│   ├── config/                  # DB connection, config files
│   ├── server.js                # Entry point
│   └── admin/
│       ├── src/                 # Admin service source
│       ├── prisma/              # Database schema & migrations
│       └── Dockerfile
│
├── k8s/                         # Kubernetes deployment manifests
├── docker-compose.yml           # Full local dev environment
└── .gitignore
```

</details>

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages.

---

## 📄 License

This project is licensed under the **ISC License**.

---

<div align="center">
Built with ❤️ for the mountains
</div>
