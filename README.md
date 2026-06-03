# Project-F: HillNest Hotel Booking Platform

## Overview

Project-F (HillNest) is a modern full-stack hotel booking platform designed to provide a seamless reservation experience for guests while maintaining secure, scalable, and maintainable backend infrastructure.

The platform combines a responsive Next.js frontend with a robust Express.js and MongoDB backend, supporting secure authentication, role-based authorization, room management, booking workflows, payment integration, and future enterprise-grade scalability.

---

## Project Vision

HillNest aims to become a production-ready hospitality platform capable of supporting:

* Secure guest registration and authentication
* Real-time room availability management
* Online booking and payment processing
* Administrative room and booking management
* Scalable cloud deployment
* Enterprise-grade security practices
* Future multi-property support

---

# Current Features

## Guest Features

* User Registration & Login
* JWT Authentication
* Secure Session Management
* Room Discovery and Filtering
* Room Details View
* Online Booking Workflow
* Booking History Dashboard
* Booking Cancellation
* Responsive Mobile-Friendly Interface
* WhatsApp Support Integration
* FAQ Assistant Integration

## Payment Features

* Razorpay Integration
* Secure Payment Verification
* Server-side Signature Validation
* Booking Confirmation After Successful Payment

## Administrative Features

* Admin-Protected Room Creation
* Role-Based Access Control (RBAC)
* Protected API Endpoints
* Backend Validation Middleware
* Authentication Rate Limiting

---

# Technology Stack

## Frontend

* Next.js 16
* React 19
* TypeScript
* Tailwind CSS

## Backend

* Node.js
* Express.js 5
* MongoDB
* Mongoose

## Authentication & Security

* JWT Access Tokens
* Refresh Tokens
* HTTP-only Cookies
* bcryptjs Password Hashing
* Role-Based Authorization
* Request Validation Middleware
* Authentication Rate Limiting

## Payments

* Razorpay

## Testing

* Node.js Test Runner
* Backend Route Validation Testing

---

# System Architecture

```text
Client (Next.js)
        |
        V
Express API Layer
        |
        +--> Authentication Middleware
        |
        +--> Authorization Middleware
        |
        +--> Validation Middleware
        |
        +--> Business Controllers
        |
        V
MongoDB Database
        |
        V
Payment Gateway (Razorpay)
```

---

# Project Structure

```text
Project-F
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── services/
│   │   └── sections/
│   │
│   └── next.config.ts
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── tests/
│   └── server.js
│
└── README.md
```

---

# Security Architecture

Security is treated as a core design principle rather than an afterthought.

Current security controls include:

* JWT Authentication
* Refresh Token Rotation
* Password Hashing with bcrypt
* Protected Routes
* Role-Based Access Control
* Validation Middleware
* Authentication Rate Limiting
* Secure Environment Variable Usage
* HTTP-only Cookie Sessions

Future security controls include:

* Multi-Factor Authentication (MFA)
* Security Audit Logging
* Refresh Token Revocation Lists
* Account Lockout Protection
* Advanced Rate Limiting
* OWASP Security Hardening
* Centralized Monitoring & Alerting

---

# Contributors

## Sahil – Full Stack & Platform Development

### Responsibilities

* Core platform architecture
* Frontend development
* Booking workflow implementation
* Payment integration
* UI/UX improvements
* Feature planning
* Deployment preparation

### Key Contributions

* Booking management system
* Razorpay integration
* Room management APIs
* Frontend architecture
* User dashboard implementation
* Hotel booking workflows

---

## Pradhumna Som – Security Researcher & Backend Collaborator

### Responsibilities

* Authentication architecture
* Authorization systems
* API security
* Validation framework
* Security testing
* Backend hardening
* Production-readiness initiatives

### Key Contributions

* JWT Authentication System
* Refresh Token Management
* Role-Based Access Control
* Validation Middleware Architecture
* Password Reset Flow
* Email Verification Flow
* Authentication Security Enhancements
* Backend Testing Infrastructure
* Secure Session Management

### Security Focus Areas

* Authentication Security
* Access Control
* API Protection
* Secure Coding Practices
* Threat Mitigation
* Future Compliance Readiness

---

# API Overview

## Authentication

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
POST /api/auth/forgot-password
POST /api/auth/reset-password/:token
GET  /api/auth/verify-email/:token
```

## Profile

```http
GET /api/profile
```

## Rooms

```http
GET  /api/rooms
GET  /api/rooms/:id
POST /api/rooms
```

## Bookings

```http
POST /api/bookings
GET  /api/bookings
GET  /api/bookings/:id
PATCH /api/bookings/:id/cancel
```

## Payments

```http
POST /api/payment/create-order
POST /api/payment/verify
```

---

# Local Development Setup

## Backend

```bash
cd backend

npm install

npm start
```

Create a `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_uri

JWT_SECRET=your_secret
REFRESH_TOKEN_SECRET=your_refresh_secret

CLIENT_URL=http://localhost:3000

RAZORPAY_KEY_ID=your_key
RAZORPAY_KEY_SECRET=your_secret
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

Frontend URL:

```text
http://localhost:3000
```

Backend URL:

```text
http://localhost:5000
```

---

# Development Workflow

## For Contributors

### Create Feature Branch

```bash
git checkout main
git pull origin main

git checkout -b feature/feature-name
```

### Commit Changes

```bash
git add .
git commit -m "feat: add new feature"
```

### Push Changes

```bash
git push origin feature/feature-name
```

### Open Pull Request

* Create Pull Request
* Request Review
* Resolve Feedback
* Merge into Main

---

# Future Scalability Roadmap

## Phase 1 – Stability & Quality

### Sahil

* Improve booking UX
* Refine room discovery
* Enhance frontend performance
* Expand user dashboard

### Pradhumna

* Increase authentication coverage
* Improve validation testing
* Expand security documentation
* Standardize API error handling

---

## Phase 2 – Booking Intelligence

### Sahil

* Availability Calendar
* Booking Modifications
* Email Notifications
* Reservation Analytics

### Pradhumna

* Booking Fraud Prevention
* Abuse Detection Rules
* Session Security Monitoring
* Secure Notification Pipelines

---

## Phase 3 – Administrative Platform

### Sahil

* Admin Dashboard
* Room CRUD Management
* Booking Management Console
* Reporting Tools

### Pradhumna

* Granular RBAC
* Audit Logging
* Privileged Access Controls
* Administrative Security Reviews

---

## Phase 4 – Enterprise Payments

### Sahil

* Stripe Integration
* Discount Engine
* Dynamic Pricing
* Multi-Currency Support

### Pradhumna

* Payment Security Controls
* Transaction Monitoring
* Fraud Detection
* PCI Readiness Planning

---

## Phase 5 – Production Readiness

### Sahil

* Docker Deployment
* CI/CD Pipelines
* Monitoring Dashboards
* Cloud Infrastructure

### Pradhumna

* Security Hardening
* Secrets Management
* Vulnerability Assessment
* Penetration Testing

---

## Phase 6 – Enterprise Scale

### Sahil

* Multi-Hotel Support
* Multi-Tenant Architecture
* Mobile Applications
* Global Deployment

### Pradhumna

* Zero-Trust Security Model
* SIEM Integration
* Compliance Readiness
* Advanced Threat Detection

---

# Long-Term Goals

* Production-grade booking platform
* Enterprise-ready architecture
* Secure payment ecosystem
* High availability infrastructure
* Cloud-native deployment
* Industry-standard security controls
* Sustainable contributor workflow

---

# License

This project is currently under active development.

All contributors should follow secure coding practices, proper Git workflows, and code review requirements before merging changes.
