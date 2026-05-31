# Project-F: Hotel Booking Web App (Full Stack)

Project-F is a full-stack hotel booking application with a Next.js frontend and an Express + MongoDB backend.

## Features

- Browse rooms on the frontend (`/rooms`)
- Create and view bookings through backend APIs
- Register and login users with JWT-based authentication
- Access authenticated profile data via protected route
- Reusable UI components and service-based frontend API calls

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
- `GET /api/rooms` - Get all rooms
- `POST /api/rooms` - Create a room
- `GET /api/rooms/:id` - Get room by ID

### Bookings
- `POST /api/bookings` - Create a booking
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/:id` - Get booking by ID

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
NEXT_PUBLIC_API_URL=http://localhost:5000/api
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

Profile:

```bash
curl http://localhost:5000/api/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Notes

- Start backend before testing frontend data pages.
- Keep `.env` files out of git.
- Store room images in `frontend/public/` and reference by filename or URL.
