# Zepnest — Service Request Application

> **Home Care, At a Tap** — A full-stack service request management platform built for the Zepnest Engineering Internship assignment.

![Stack](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?logo=react)
![Stack](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?logo=node.js)
![Stack](https://img.shields.io/badge/Database-MySQL%20%2B%20Sequelize-4479A1?logo=mysql)
![Stack](https://img.shields.io/badge/Auth-JWT-orange)

---

## Features

| Feature | Description |
|---------|-------------|
| ✅ User Registration & Login | Secure signup with bcrypt-hashed passwords, JWT auth |
| ✅ Create Service Request | Title, description, category, address, preferred time, photo |
| ✅ View Requests | Paginated list with search, status & category filters |
| ✅ Update Status | State machine: Pending → In Progress → Completed / Cancelled |
| ✅ Delete Request | Soft-delete with image cleanup |
| ✅ Image Upload | Attach reference photos via Multer (local storage) |
| ✅ Swagger Docs | Interactive API docs at `/api/docs` |
| ✅ Pagination & Search | Full-text search + offset pagination |
| ✅ Error Handling | Centralized handler, validation errors, meaningful messages |
| ✅ Premium Dark UI | Glassmorphism, gradients, micro-animations |

---

## Project Structure

```
zepnest/
├── backend/            # Node.js + Express API
│   ├── src/
│   │   ├── config/     # DB + Swagger config
│   │   ├── controllers/
│   │   ├── middleware/ # auth, errorHandler, upload
│   │   ├── models/     # Sequelize models
│   │   ├── routes/     # Express routers (with Swagger JSDoc)
│   │   └── utils/      # Response helpers
│   ├── uploads/        # Uploaded images (auto-created)
│   ├── .env
│   └── server.js
├── frontend/           # React + Vite SPA
│   └── src/
│       ├── api/        # Axios client + API calls
│       ├── components/ # Navbar, Modal, Loader, StatusBadge
│       ├── contexts/   # AuthContext
│       └── pages/      # Landing, Auth, Dashboard, Requests, Detail
├── database/
│   └── schema.sql      # MySQL schema + seed data
└── README.md
```

---

## Prerequisites

- **Node.js** v18+
- **MySQL** 8.0+ (running locally or remotely)
- **npm** v9+

---

## Setup & Run

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd zepnest
```

### 2. Setup the Database

Open MySQL and run:

```bash
mysql -u root -p < database/schema.sql
```

This creates the `zepnest_db` database, tables, indexes, and optional seed data.

### 3. Configure the Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` and set your MySQL credentials:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=zepnest_db
DB_USER=root
DB_PASSWORD=your_mysql_password
JWT_SECRET=your_secret_key_here
```

### 4. Start the Backend

```bash
cd backend
npm start
# or for development (auto-restart on file change):
npm run dev
```

Backend runs on **http://localhost:5000**

### 5. Configure the Frontend

```bash
cd frontend
# .env is already created with default:
# VITE_API_URL=http://localhost:5000/api
```

### 6. Start the Frontend

```bash
cd frontend
npm run dev
```

Frontend runs on **http://localhost:5173**

---

## API Documentation

Interactive Swagger UI is available at:

```
http://localhost:5000/api/docs
```

### API Endpoints

#### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login, get JWT |
| GET | `/api/auth/me` | ✅ | Get current user |

#### Service Requests
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/requests` | ✅ | List requests (paginated, searchable) |
| POST | `/api/requests` | ✅ | Create request |
| GET | `/api/requests/stats` | ✅ | Get request stats |
| GET | `/api/requests/:id` | ✅ | Get single request |
| PUT | `/api/requests/:id` | ✅ | Update request details |
| PATCH | `/api/requests/:id/status` | ✅ | Update status |
| DELETE | `/api/requests/:id` | ✅ | Delete request |
| POST | `/api/requests/:id/image` | ✅ | Upload image |

#### Query Parameters for `GET /api/requests`
| Param | Type | Example |
|-------|------|---------|
| `page` | integer | `1` |
| `limit` | integer | `10` |
| `search` | string | `"plumbing"` |
| `status` | string | `"pending"` |
| `category` | string | `"cleaning"` |

---

## Status Transition Rules

```
pending  ──►  in_progress  ──►  completed
    │                │
    └──────────────► cancelled
```

- Completed and Cancelled requests are **terminal** — no further transitions allowed.
- Editing request details is also blocked for terminal-state requests.

---

## Database Schema

See [`database/schema.sql`](./database/schema.sql) for the full schema.

### Entity Relationship

```
users (1) ──────────── (many) service_requests
  id                              id
  name                            user_id (FK)
  email (unique)                  title
  password_hash                   description
  created_at                      category (ENUM)
  updated_at                      address
                                  preferred_time
                                  status (ENUM)
                                  image_url
                                  created_at
                                  updated_at
```

---

## Architecture Decisions

| Decision | Rationale |
|----------|-----------|
| **Sequelize ORM** | Type-safe queries, easy migrations via `sync({ alter: true })` |
| **bcrypt cost factor 12** | Balance between security and performance |
| **JWT stateless auth** | No session storage needed, horizontally scalable |
| **Status state machine** | Enforces valid transitions server-side, prevents data inconsistency |
| **Centralized error handler** | Single place to handle and format all errors |
| **Multer with UUID filenames** | Prevents filename collisions and path traversal attacks |
| **Helmet + CORS** | Defense-in-depth security headers |

---

## Test Credentials (Seed Data)

If you ran the seed data in `schema.sql`:

| Email | Password |
|-------|----------|
| jane@example.com | password123 |
| john@example.com | password123 |

---

## Health Check

```
GET http://localhost:5000/api/health
```

Response:
```json
{
  "success": true,
  "message": "Zepnest API is running.",
  "timestamp": "2025-06-17T08:00:00.000Z"
}
```

---

## Tech Stack Summary

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite 6, React Router v6 |
| Styling | Vanilla CSS (design system with CSS variables) |
| HTTP Client | Axios with interceptors |
| Backend | Node.js 18 + Express 5 |
| ORM | Sequelize 6 |
| Database | MySQL 8 |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Validation | express-validator |
| File Upload | Multer |
| API Docs | Swagger UI (swagger-jsdoc + swagger-ui-express) |
| Security | Helmet, CORS |
| Logging | Morgan |

---

*Built with ❤️ for the Zepnest Engineering Team — 2025*
