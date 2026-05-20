# 🚀 Smart Leads Dashboard

A full-stack Lead Management System built with the MERN stack (MongoDB, Express, React, Node.js) and TypeScript.

---

## 📁 Project Structure

```
smart-leads/
├── backend/          # Express + TypeScript API
│   ├── src/
│   │   ├── config/       # Database connection
│   │   ├── controllers/  # Route handlers (auth, leads)
│   │   ├── middleware/   # JWT auth, rate limiting, error handler
│   │   ├── models/       # Mongoose schemas (with indexes)
│   │   ├── routes/       # API route definitions + validation
│   │   ├── types/        # Shared TypeScript types/interfaces
│   │   ├── utils/        # Response helpers
│   │   └── index.ts      # Server entry point
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/         # React + TypeScript + Tailwind
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/     # ProtectedRoute
│   │   │   ├── layout/   # Navbar
│   │   │   ├── leads/    # LeadTable, LeadForm, LeadFiltersBar, PaginationBar
│   │   │   └── ui/       # Badge, Button, Input, Modal, Select, Spinner
│   │   ├── hooks/        # useDebounce, useDarkMode
│   │   ├── pages/        # LoginPage, RegisterPage, DashboardPage
│   │   ├── services/     # API call functions (api.ts, authService, leadService)
│   │   ├── store/        # Zustand global state (authStore)
│   │   └── types/        # Shared TypeScript types
│   └── package.json
│
└── docker-compose.yml
```

---

## ⚙️ Local Setup (Without Docker)

### Prerequisites
- Node.js v18+
- MongoDB running locally

### 1. Backend Setup
```bash
cd backend
npm install

# Create .env file
cp .env.example .env
```

Edit `.env` with your values:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-leads
JWT_SECRET=your_strong_random_secret_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

Generate a strong JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Start the backend:
```bash
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install

# (Optional) For production deployment
cp .env.example .env
# Set VITE_API_URL=https://your-backend-url.com/api
```

```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

---

## 🌱 Seed Data (For Testing)

To populate the database with sample data:

```bash
cd backend
npm run seed
```

This creates:
- 👑 Admin account: `admin@smartleads.com` / `admin123`
- 👤 Sales account: `sales@smartleads.com` / `sales123`
- 📋 25 sample leads (various status/source combinations)

> **Note:** Seed will clear all existing users and leads before inserting fresh data.

---

## 🐳 Docker Setup

1. Create `backend/.env` from `backend/.env.example` and fill in your `JWT_SECRET`.
2. Run:

```bash
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MongoDB: localhost:27017

```bash
# Stop containers
docker-compose down

# Stop and delete all data volumes
docker-compose down -v
```

---

## 🔐 Roles & Permissions

| Action              | Admin | Sales         |
|---------------------|-------|---------------|
| View all leads      | ✅    | ❌ (own only) |
| Create lead         | ✅    | ✅            |
| Edit any lead       | ✅    | ❌ (own only) |
| Delete any lead     | ✅    | ❌ (own only) |
| Export CSV          | ✅    | ✅ (own only) |

> **Note:** New registrations default to `Sales` role. Admin accounts are created via seed script or directly in MongoDB — this is an intentional security decision (Principle of Least Privilege).

---

## 📡 API Documentation

**Base URL:** `http://localhost:5000/api`

All protected routes require:
```
Authorization: Bearer <token>
```

---

### Auth Routes

#### `POST /api/auth/register`
Register a new user (defaults to `sales` role).

**Request Body:**
```json
{
  "name": "Rahul Sharma",
  "email": "rahul@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful!",
  "data": {
    "token": "eyJhbGci...",
    "user": {
      "id": "...",
      "name": "Rahul Sharma",
      "email": "rahul@example.com",
      "role": "sales"
    }
  }
}
```

---

#### `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "rahul@example.com",
  "password": "password123"
}
```

Response: same shape as register.

---

#### `GET /api/auth/me` 🔒
Returns currently logged-in user (no password field).

---

### Lead Routes (All Protected 🔒)

#### `GET /api/leads`
Get all leads with filters, search, sort, pagination.

| Param    | Type   | Example          | Description                  |
|----------|--------|------------------|------------------------------|
| `status` | string | `New`            | Filter by status             |
| `source` | string | `Website`        | Filter by source             |
| `search` | string | `rahul`          | Search by name or email      |
| `sort`   | string | `latest/oldest`  | Sort order                   |
| `page`   | number | `1`              | Page number                  |

> Limit is fixed at **10 records per page** as per requirement.

**Example:** `GET /api/leads?status=Qualified&source=Instagram&search=rahul&sort=latest&page=1`

**Response:**
```json
{
  "success": true,
  "message": "Leads fetched successfully.",
  "data": [...],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  }
}
```

---

#### `POST /api/leads` 🔒
Create a new lead.

**Request Body:**
```json
{
  "name": "Priya Singh",
  "email": "priya@example.com",
  "source": "Instagram",
  "status": "New"
}
```

Valid `status`: `New | Contacted | Qualified | Lost`
Valid `source`: `Website | Instagram | Referral`

---

#### `GET /api/leads/:id` 🔒
Get a single lead by ID.

---

#### `PUT /api/leads/:id` 🔒
Update a lead. All fields optional.

**Request Body:**
```json
{
  "status": "Qualified"
}
```

---

#### `DELETE /api/leads/:id` 🔒
Delete a lead.

---

#### `GET /api/leads/export/csv` 🔒
Download all leads as a CSV file.

---

## 🛡️ Security Features

- **JWT Authentication** with 7-day expiry
- **bcrypt** password hashing (salt rounds: 10)
- **Rate Limiting**: 20 auth requests / 15 min, 200 API requests / 15 min per IP
- **CORS** restricted to `CLIENT_URL` env variable
- **Role-based access control** enforced on every route
- **Input validation** via `express-validator` on all routes
- **No secrets** in source code — all via `.env`
- **Principle of Least Privilege** — users get minimum required access

---

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express** + **TypeScript**
- **MongoDB** + **Mongoose** (with compound indexes for performance)
- **JWT** + **bcryptjs**
- **express-validator** + **express-rate-limit**

### Frontend
- **React 18** + **TypeScript** + **Tailwind CSS**
- **React Router v6** + **Zustand** + **Axios**
- **react-hot-toast** + **Vite**

---

## ✅ Features Checklist

- [x] JWT Authentication (Register / Login / Protected Routes)
- [x] Role-Based Access Control (Admin / Sales)
- [x] Full CRUD for Leads
- [x] Advanced Filtering (Status + Source + Search — all combinable)
- [x] Debounced Search
- [x] Sort (Latest / Oldest)
- [x] Backend Pagination (skip/limit, fixed 10/page, metadata in response)
- [x] CSV Export
- [x] Dark Mode (Bonus)
- [x] Responsive Design
- [x] Loading / Empty / Error States
- [x] Form Validation (frontend + backend)
- [x] Docker Setup
- [x] Rate Limiting
- [x] MongoDB Indexes for query performance
- [x] Seed Script for test data