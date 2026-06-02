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

## Tech Stack

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS
- Backend: Node.js, Express 5, Mongoose
- Database: MongoDB Atlas or local MongoDB
- Auth: bcryptjs, jsonwebtoken
- Payments: Razorpay
- Tests: Node test runner (`node --test`)

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

## API Endpoints

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

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
HOST=0.0.0.0
MONGO_URI=your_mongodb_connection_string
MONGO_DB=your_database_name
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
AUTH_RATE_LIMIT_WINDOW_MS=600000
AUTH_RATE_LIMIT_MAX=10
```

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
npm install
npm run dev
```

Frontend default URL: `http://localhost:3000`

Optional frontend env:

```env
NEXT_PUBLIC_API_URL=
BACKEND_URL=http://127.0.0.1:5000
```

Notes:

- The frontend now rewrites `/api/*` requests to `BACKEND_URL` or `http://127.0.0.1:5000`.
- Leaving `NEXT_PUBLIC_API_URL` empty keeps browser requests same-origin and works well with the rewrite setup.
- If you prefer calling the backend directly from the browser, set `NEXT_PUBLIC_API_URL=http://localhost:5000`.

## Booking and Payment Flow

1. A user registers or logs in to receive a JWT.
2. The rooms page fetches available rooms and filters out conflicting active bookings for selected dates.
3. The booking flow redirects into `/bookings`, where the selected room and stay details are prefilled.
4. The frontend creates a Razorpay order through `POST /api/payment/create-order`.
5. Razorpay completes checkout in the browser modal.
6. The frontend sends payment identifiers to `POST /api/payment/verify`.
7. The backend verifies the Razorpay signature, checks order integrity, rechecks room availability, and creates a `confirmed` booking with stored payment metadata.

## Current Behavior Highlights

- Booking conflicts are checked both before creating a booking and again during payment verification.
- Cancelled bookings no longer block room availability.
- User booking lists are sorted newest first.
- Room creation is protected by both JWT auth and admin-role authorization.
- Auth endpoints expose rate-limit headers such as `X-RateLimit-Remaining` and `Retry-After`.
- The user dashboard surfaces booking totals, active stays, cancelled stays, and recent bookings.

## Tests Included

- Payment verification rejects mismatched Razorpay order details
- Payment verification blocks overlapping bookings after successful payment
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
- Configure real Razorpay keys before testing checkout.
