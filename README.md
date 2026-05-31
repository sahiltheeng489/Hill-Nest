# Project-F: Hotel Booking Web App (Full Stack)

Project-F is a full-stack hotel booking application with a Next.js frontend and an Express + MongoDB backend.

## Features

- Browse all room listings in one view on the frontend (`/rooms`)
- Create bookings from room cards via booking form (`/booking?roomId=...`)
- View user-specific bookings on `/bookings`
- Register and login users with JWT-based authentication
- Protected profile and booking APIs

## Tech Stack

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS
- Backend: Node.js, Express 5, Mongoose
- Database: MongoDB Atlas (or local MongoDB)
- Auth: bcryptjs + jsonwebtoken

## Project Structure

```text
Project-F/
|- frontend/
|  |- public/
|  `- src/
|     |- app/
|     |  |- booking/
|     |  |- bookings/
|     |  |- login/
|     |  |- register/
|     |  |- rooms/
|     |  `- user/
|     |- components/
|     `- services/
`- backend/
   |- config/
   |- controllers/
   |- middleware/
   |- models/
   |- routes/
   `- server.js
```

## API Endpoints

### Health
- `GET /` - Backend status check

### Rooms
- `GET /api/rooms` - Get all rooms (supports filters)
- `POST /api/rooms` - Create a room
- `GET /api/rooms/:id` - Get room by ID

### Bookings (JWT Protected)
- `POST /api/bookings` - Create booking for logged-in user
- `GET /api/bookings` - Get logged-in user bookings
- `GET /api/bookings/:id` - Get one booking (owner only)

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user and get JWT

### Profile
- `GET /api/profile` - Get current user profile (requires `Authorization: Bearer <token>`)

## Setup

### 1. Clone repository

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
MONGO_URI=your_mongodb_connection_string
MONGO_DB=your_database_name
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

Run backend:

```bash
npm start
```

Backend default URL: `http://localhost:5000`

### 3. Frontend setup

```bash
cd ../frontend
npm install
npm run dev
```

Frontend default URL: `http://localhost:3000`

Optional frontend env (`frontend/.env.local`) if backend URL differs:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Quick API Examples

Register:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"secret123"}'
```

Login:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"secret123"}'
```

Get bookings (JWT required):

```bash
curl http://localhost:5000/api/bookings \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Contribution Workflow (Step-by-Step)

### 1. User Authentication
1. User registers with `POST /api/auth/register`.
2. User logs in with `POST /api/auth/login`.
3. Backend returns JWT + user data.
4. Frontend stores token and user locally for authenticated actions.

### 2. Room Listing and Discovery
1. Frontend opens `/rooms`.
2. Rooms page fetches data from `GET /api/rooms`.
3. User applies filters (check-in, check-out, guests, min/max price, room type).
4. Backend returns matching rooms and frontend renders all room cards.

### 3. Booking Creation
1. User clicks `Book Room` from a room card.
2. App redirects to booking flow with selected `roomId` and filter context.
3. User fills booking form (name, email, dates, guests).
4. Frontend submits booking to `POST /api/bookings` with bearer token.
5. Backend validates room id, email format, guest count, and date range.
6. Booking is saved with linked `user` and `room`.

### 4. Protected Booking Access
1. User opens `/bookings`.
2. Frontend calls `GET /api/bookings` with JWT token.
3. Backend verifies token and returns only the logged-in user's bookings.
4. For booking detail lookup, `GET /api/bookings/:id` is owner-restricted.

### 5. Profile Access
1. User opens profile page.
2. Frontend calls `GET /api/profile` with bearer token.
3. Backend returns current authenticated user profile data.

### 6. UI Enhancements Added
1. Rooms tab displays all listings at once (no slider in Book Now tab).
2. Room cards support fallback image when DB image is missing.
3. Footer palette and text visibility were improved.
4. Guest Stories section palette was updated for clearer readability.

## Notes

- Start backend before testing frontend data pages.
- Keep `.env` files out of git.
- Store room images in `frontend/public/` and reference by filename or URL.

## Future Updates (Roadmap)

### Phase 1: Stability and Quality
- Remove remaining frontend lint warnings and keep CI lint-clean.
- Add backend test setup (Jest + Supertest) for auth, rooms, and bookings routes.
- Add frontend test setup (React Testing Library) for key pages and auth flows.
- Standardize error responses across all backend controllers.

### Phase 2: Booking Experience
- Add room availability calendar UI to prevent invalid date selections.
- Add booking cancellation/update endpoints with ownership checks.
- Add booking status fields (e.g., `pending`, `confirmed`, `cancelled`).
- Add booking confirmation email workflow.

### Phase 3: Role-Based Admin Features
- Add admin-only room management dashboard (create/update/delete rooms).
- Protect admin routes using role-based middleware (`authorizeRoles`).
- Add booking management view for admin users.
- Add image upload support for room listings (Cloudinary/S3 integration).

### Phase 4: Payments and Business Flow
- Integrate payment gateway (Razorpay/Stripe) for booking checkout.
- Add price breakdown (nights, taxes, fees) in booking summary.
- Support coupon/discount codes and seasonal pricing.
- Persist payment transaction metadata with bookings.

### Phase 5: Production Readiness
- Add Docker setup for frontend + backend deployment.
- Configure environment-specific settings for dev/staging/prod.
- Add structured logging and monitoring (request logs, error tracking).
- Improve SEO and performance (LCP/CLS optimization, image strategy).

### Phase 6: UX Enhancements
- Add user booking search/sort/filter in `/bookings`.
- Add pagination or infinite scroll for large room datasets.
- Add multilingual support and accessibility improvements (a11y audit).
- Add responsive micro-interactions and loading states across all pages.
