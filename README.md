<<<<<<< HEAD
# Project-F: HillNest Hotel Booking App

Project-F is a full-stack hotel booking application with a Next.js frontend and an Express + MongoDB backend. The current build includes authenticated bookings, Razorpay checkout, booking cancellation and conflict checks, admin-protected room creation, and a refreshed guest-facing UI.

## Features

- Browse rooms with filters for dates, guests, price range, and room type
- Create paid bookings with Razorpay checkout and server-side payment verification
- Prevent overlapping bookings for active stays (`pending` and `confirmed`)
- View booking history with status-aware cards and recent-booking summaries
- Cancel existing bookings from the user booking dashboard
- Register and login with JWT authentication
- Rate-limit auth requests to reduce repeated login/register abuse
- Restrict room creation to authenticated admin users
- Use floating WhatsApp and FAQ chat widgets on the frontend
- Run frontend requests through a local `/api` rewrite for easier local development
=======
# Project-F: Hotel Booking Web App

Project-F is a full-stack hotel booking application with a Next.js frontend and an Express + MongoDB backend. The latest merge combines Sahil’s production-ready auth scaling, admin authorization, validation middleware, and frontend service improvements with the existing room booking and user workflow features.

## Features

### Frontend
- Responsive hotel booking UI built with Next.js and Tailwind CSS
- Dynamic room listing from the backend API
- Reusable UI components for layout, cards, buttons, and room displays
- Login and registration pages with JWT auth and refresh-cookie recovery
- User profile page and bookings dashboard
- Booking page that supports room-specific booking via query params
- Homepage Future Scaling section showing roadmap and milestones
>>>>>>> 6c7e99b (Add auth scaling and admin route protection)

### Backend
- REST API with Express.js and Mongoose
- Room management endpoints with admin-protected creation
- Booking creation with user-specific access
- Auth endpoints for registration, login, refresh, logout, email verification, and password reset
- Password hashing with bcryptjs and JWT access tokens
- Role-based admin authorization middleware
- Reusable validation middleware for auth, rooms, bookings, and route params
- Focused backend validation tests for request handling

<<<<<<< HEAD
- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS
- Backend: Node.js, Express 5, Mongoose
- Database: MongoDB Atlas or local MongoDB
- Auth: bcryptjs, jsonwebtoken
- Payments: Razorpay
- Tests: Node test runner (`node --test`)
=======
### Database
- MongoDB Atlas or local MongoDB
- Stores room data, booking data, and user accounts
- User accounts include hashed passwords, roles, email verification, and password reset fields

## Code Architecture

This release updates the code architecture to keep the backend controllers focused on business logic while moving request validation and authorization into reusable middleware layers.

- `backend/controllers/` handles core request processing for auth, rooms, bookings, and profile actions
- `backend/routes/` wires routes to controllers and applies middleware for auth, roles, and validation
- `backend/middleware/` centralizes authentication, authorization, and input validation logic
- `backend/models/` defines Mongoose schemas for `User`, `Room`, and `Booking`
- `frontend/src/services/authService.ts` contains session and token operations separate from UI components
- `frontend/src/app/components/` hosts reusable UI pieces for navigation, room cards, and user pages
>>>>>>> 6c7e99b (Add auth scaling and admin route protection)

## Project Structure

```text
Project-F/
|- frontend/
|  |- src/
|  |  |- app/
|  |  |  |- booking/page.tsx
|  |  |  |- bookings/page.tsx
|  |  |  |- rooms/page.tsx
|  |  |  |- user/page.tsx
|  |  |  |- components/
|  |  |  |  |- auth/AuthForm.tsx
|  |  |  |  |- ui/
|  |  |  |  |  |- layout/{Navbar.tsx, Footer.tsx}
|  |  |  |  |  |- payment/PaymentButton.tsx
|  |  |  |  |  |- room/RoomCard.tsx
|  |  |  |  |  `- ui/{ChatBot.tsx, WhatsAppButton.tsx, Button.tsx, Card.tsx}
|  |  |  `- sections/{Hero.tsx, Rooms.tsx, Amenities.tsx, GalleryAndTestimonials.tsx}
|  |  |- services/authService.ts
|  |  `- globals.css
|  `- next.config.ts
`- backend/
   |- controllers/
   |  |- authController.js
   |  |- bookingController.js
   |  |- paymentController.js
   |  |- profileController.js
   |  `- roomController.js
   |- middleware/
   |  |- authMiddleware.js
   |  `- rateLimitMiddleware.js
   |- models/
   |  |- Booking.js
   |  |- Room.js
   |  `- User.js
   |- routes/
   |  |- authRoutes.js
   |  |- bookingRoutes.js
   |  |- paymentRoutes.js
   |  |- profileRoutes.js
   |  `- roomRoutes.js
   |- tests/payment-and-routes.test.js
   `- server.js
```

## Tech Stack
- Frontend: Next.js, React, TypeScript, Tailwind CSS
- Backend: Node.js, Express.js
- Database: MongoDB + Mongoose
- Auth: bcryptjs, jsonwebtoken

## API Endpoints

<<<<<<< HEAD
### Health

- `GET /` - backend status check

### Auth

- `POST /api/auth/register` - register user
- `POST /api/auth/login` - login user and receive JWT

### Rooms

- `GET /api/rooms` - get all rooms with optional filters
- `GET /api/rooms/:id` - get one room by id
- `POST /api/rooms` - create a room (`admin` only, JWT required)

### Bookings

- `POST /api/bookings` - create a non-payment booking for logged-in user
- `GET /api/bookings` - get current user's bookings, newest first
- `GET /api/bookings/:id` - get one booking owned by current user
- `PUT /api/bookings/:id` - update an owned booking if not cancelled
- `PATCH /api/bookings/:id/cancel` - cancel an owned booking

### Payments

- `POST /api/payment/create-order` - create Razorpay order for selected booking details
- `POST /api/payment/verify` - verify Razorpay payment and create confirmed booking

### Profile

- `GET /api/profile` - get current authenticated user profile

## Setup

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd Project-F
```

### 2. Backend setup

=======
### Auth
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login an existing user and receive an access token
- `POST /api/auth/refresh` - Refresh the session using the HTTP-only refresh cookie
- `POST /api/auth/logout` - Clear the refresh cookie
- `GET /api/auth/verify-email/:token` - Verify a user's email address
- `POST /api/auth/forgot-password` - Create a password reset token
- `POST /api/auth/reset-password/:token` - Reset a user's password

### Profile
- `GET /api/profile` - Get the authenticated user's profile

### Rooms
- `GET /api/rooms` - Get all rooms
- `GET /api/rooms/:id` - Get room by ID
- `POST /api/rooms` - Create a room (admin only)

### Bookings
- `POST /api/bookings` - Create a booking
- `GET /api/bookings` - Get all bookings (admin only)
- `GET /api/bookings/:id` - Get booking by ID (admin only)

### User Bookings
- `POST /api/bookings` - Create booking for logged-in user
- `GET /api/bookings` - Get logged-in user bookings
- `GET /api/bookings/:id` - Get one booking (owner only)

## Auth and Session Flows

1. A user registers through `/register`.
2. The frontend sends `name`, `email`, and `password` to `POST /api/auth/register`.
3. Validation middleware checks the request before the controller runs.
4. The backend hashes the password, creates the user, generates an email verification token, returns a short-lived access token, and sets an HTTP-only refresh cookie.
5. The frontend stores the access token and user details in `localStorage`.
6. In development, the register response may include a verification URL that can be opened directly.
7. A returning user logs in through `/login`.
8. The backend verifies the password, returns a fresh access token, and refreshes the HTTP-only cookie.
9. Protected requests send the access token in the `Authorization` header as `Bearer <token>`.
10. If the access token expires, the frontend can call `POST /api/auth/refresh` to recover the session from the refresh cookie.
11. The auth middleware verifies the token and attaches the current user to `req.user`.

## Authorization Flow

Admin-only routes first run `protect` to confirm the user has a valid token, then run `authorizeRoles("admin")`.

Current admin-protected routes:
- `POST /api/rooms`
- `GET /api/bookings`
- `GET /api/bookings/:id`

## Validation Flow

Reusable validation middleware now runs before controllers for core request types:

- `validateRegister`
- `validateLogin`
- `validatePasswordResetRequest`
- `validatePasswordReset`
- `validateRoom`
- `validateBooking`
- `validateObjectIdParam`

This keeps controllers focused on business logic instead of repeated request-shape checks.

## Password Reset Flow

1. A user submits their email to `POST /api/auth/forgot-password`.
2. The backend creates a temporary reset token if the account exists.
3. In development, the response includes a reset URL for testing.
4. The user submits a new password to `POST /api/auth/reset-password/:token`.
5. The backend validates the token, hashes the new password, clears the reset fields, and returns a fresh authenticated session.

## Email Verification Flow

1. Registration creates a temporary email verification token.
2. The token is stored as a hash in MongoDB.
3. In development, the API response may include a verification URL.
4. Opening `GET /api/auth/verify-email/:token` marks the user's email as verified.

## Security Notes

- Passwords are hashed before being saved to MongoDB.
- Password fields are excluded from normal user queries.
- JWT secrets are stored in environment variables.
- Refresh tokens are stored in HTTP-only cookies.
- Email verification and password reset tokens are stored as hashes.
- Admin routes use both authentication and role authorization middleware.
- CORS is configured through `CLIENT_URL`.
- Protected routes use reusable middleware instead of repeating token and role logic.

## Setup

>>>>>>> 6c7e99b (Add auth scaling and admin route protection)
```bash
cd backend
npm install
npm test

cd ../frontend
npm install
npm run lint
npm run build
```

<<<<<<< HEAD
Create `backend/.env` from `backend/.env.example`:
=======

### Backend

```bash
cd backend
npm install
npm start
```

Create a `backend/.env` file:
>>>>>>> 6c7e99b (Add auth scaling and admin route protection)

```env
PORT=5000
HOST=0.0.0.0
MONGO_URI=your_mongodb_connection_string
MONGO_DB=your_database_name
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=replace_with_another_long_random_secret
REFRESH_TOKEN_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
AUTH_RATE_LIMIT_WINDOW_MS=600000
AUTH_RATE_LIMIT_MAX=10
```

<<<<<<< HEAD
Razorpay setup:

- Put your Razorpay test key id into `RAZORPAY_KEY_ID`.
- Put the matching secret you downloaded from Razorpay into `RAZORPAY_KEY_SECRET`.
- The screenshot you shared shows a key id only; checkout will not work until the secret is also added to `backend/.env`.

Run backend:

```bash
npm start
```

Run backend tests:

```bash
npm test
```

Backend default URL: `http://localhost:5000`

### 3. Frontend setup

```bash
cd ../frontend
=======
### Frontend

```bash
cd frontend
>>>>>>> 6c7e99b (Add auth scaling and admin route protection)
npm install
npm run dev
```

Frontend default URL: `http://localhost:3000`

<<<<<<< HEAD
Optional frontend env in `frontend/.env.local` from `frontend/.env.example`:
=======
Create `frontend/.env.local` if the backend URL is different:
>>>>>>> 6c7e99b (Add auth scaling and admin route protection)

```env
NEXT_PUBLIC_API_URL=
BACKEND_URL=http://127.0.0.1:5000
```

<<<<<<< HEAD
Notes:

- The frontend now rewrites `/api/*` requests to `BACKEND_URL` or `http://127.0.0.1:5000`.
- Leaving `NEXT_PUBLIC_API_URL` empty keeps browser requests same-origin and works well with the rewrite setup.
- If you prefer calling the backend directly from the browser, set `NEXT_PUBLIC_API_URL=http://localhost:5000`.
- For the simplest local Razorpay setup, keep `NEXT_PUBLIC_API_URL=` empty and keep `BACKEND_URL=http://127.0.0.1:5000`.
=======

## API Testing Examples

Register a user:
>>>>>>> 6c7e99b (Add auth scaling and admin route protection)

## Booking and Payment Flow

1. A user registers or logs in to receive a JWT.
2. The rooms page fetches available rooms and filters out conflicting active bookings for selected dates.
3. The booking flow redirects into `/bookings`, where the selected room and stay details are prefilled.
4. The frontend creates a Razorpay order through `POST /api/payment/create-order`.
5. Razorpay completes checkout in the browser modal.
6. The frontend sends payment identifiers to `POST /api/payment/verify`.
7. The backend verifies the Razorpay signature, checks order integrity, rechecks room availability, and creates a `confirmed` booking with stored payment metadata.

## Razorpay Test Checklist

1. Start MongoDB and the backend on `http://localhost:5000`.
2. Add valid Razorpay test credentials to `backend/.env`.
3. Start the frontend on `http://localhost:3000`.
4. Register or log in.
5. Open a room, continue to checkout, and click the pay button.
6. Complete the Razorpay test modal with a test payment method.
7. Confirm the booking appears in `/bookings` with `Payment Confirmed`.

## Current Behavior Highlights

<<<<<<< HEAD
- Booking conflicts are checked both before creating a booking and again during payment verification.
- Cancelled bookings no longer block room availability.
- User booking lists are sorted newest first.
- Room creation is protected by both JWT auth and admin-role authorization.
- Auth endpoints expose rate-limit headers such as `X-RateLimit-Remaining` and `Retry-After`.
- The user dashboard surfaces booking totals, active stays, cancelled stays, and recent bookings.

## Tests Included

- Payment order creation blocks unavailable rooms before checkout opens
- Payment verification rejects mismatched Razorpay order details
- Payment verification blocks overlapping bookings after successful payment
- Booking updates reject user-driven status changes
- Room creation route requires auth middleware and admin-only authorization

## Roadmap

- Add booking reschedule and edit controls to the frontend UI
- Add refund handling for cancelled paid bookings
- Expand automated coverage for auth, bookings, and frontend flows
- Add admin dashboards for room and booking management
- Add email and notification workflows around booking confirmation

## Notes

- Start the backend before testing protected frontend flows.
- Keep `.env` files out of git.
- Store room images in `frontend/public/` and reference by filename or URL.

## Secrets Setup

1. Copy `backend/.env.example` to `backend/.env`.
2. Put your real values in `backend/.env` (Mongo URI, JWT secret, etc.).
3. Never commit `backend/.env` to git.
4. If any secret is exposed, rotate it immediately (MongoDB user password, JWT secret).
- Configure real Razorpay keys before testing checkout.
=======
Create a booking:

```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{"room":"ROOM_OBJECT_ID","name":"John Doe","email":"john@example.com","checkIn":"2026-06-05","checkOut":"2026-06-08","guests":2}'
```

Create an admin-only room:

```bash
curl -X POST http://localhost:5000/api/rooms \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -d '{"name":"Deluxe Valley Room","price":2999,"description":"A valley-view room","image":"/room-deluxe.png","available":true}'
```

## Future Updates (Roadmap)

### Phase 1: Stability and Quality
- Remove remaining frontend lint warnings and keep CI lint-clean.
- Add backend test setup (Jest + Supertest) for auth, rooms, and bookings routes.
- Add frontend test setup (React Testing Library) for key pages and auth flows.
- Standardize error responses across all backend controllers.
- Add broader integration tests for auth, admin routes, room creation, and booking creation.

### Phase 2: Booking Experience
- Add room availability calendar UI to prevent invalid date selections.
- Add booking cancellation/update endpoints with ownership checks.
- Add booking status fields (`pending`, `confirmed`, `cancelled`).
- Add booking confirmation email workflow.
- Add booking availability checks to prevent overlapping reservations for the same room.

### Phase 3: Role-Based Admin Features
- Add admin-only room management dashboard (create/update/delete rooms).
- Protect admin routes using role-based middleware (`authorizeRoles`).
- Add booking management view for admin users.
- Add image upload support for room listings (Cloudinary/S3 integration).
- Add role management so an existing admin can promote or demote users safely.

### Phase 4: Payments and Business Flow
- Integrate payment gateway (Razorpay/Stripe) for booking checkout.
- Add price breakdown (nights, taxes, fees) in booking summary.
- Support coupon/discount codes and seasonal pricing.
- Persist payment transaction metadata with bookings.
- Add payment integration for deposits or full booking payments.

### Phase 5: Production Readiness
- Add Docker setup for frontend + backend deployment.
- Configure environment-specific settings for dev/staging/prod.
- Add structured logging and monitoring (request logs, error tracking).
- Improve SEO and performance (LCP/CLS optimization, image strategy).
- Add deployment-ready environment documentation for frontend, backend, MongoDB, and secrets.

### Phase 6: UX Enhancements
- Add user booking search/sort/filter in `/bookings`.
- Add pagination or infinite scroll for large room datasets.
- Add multilingual support and accessibility improvements (a11y audit).
- Add responsive micro-interactions and loading states across all pages.
- Add frontend pages for email verification success, forgot password, and reset password.

## Future Goals

- Deliver a complete end-to-end booking experience from discovery to payment confirmation.
- Improve trust and reliability with robust validations, meaningful error handling, and test coverage.
- Enable seamless collaboration by keeping APIs, folder structure, and docs easy to maintain.
- Scale room and booking management with admin tools and role-based access control.
- Optimize performance and UX for mobile-first usage and low-bandwidth conditions.
- Prepare production readiness with monitoring, secure secrets handling, and deployment automation.

## Notes

- Start the backend before opening API-powered frontend pages.
- Keep `.env` files out of version control.
- Place room images in `frontend/public/` and store the filename or full URL in the room `image` field.
>>>>>>> 6c7e99b (Add auth scaling and admin route protection)
