# AuraSole Footwear — Dedicated Slipper E-Commerce Platform

A production-ready, full-stack dedicated slipper-only e-commerce web platform engineered for physical retail footwear showrooms and high-scale online footwear commerce.

---

## 🌟 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion, Lucide Icons, React Router v6.
- **Backend**: Node.js, Express.js, Helmet, Express Rate Limit, Morgan, CORS, JWT.
- **Database & ORM**: Neon Serverless PostgreSQL & Prisma ORM (21 relational schema models).
- **Deployment**:
  - Frontend: **Vercel** (`VITE_API_URL`)
  - Backend: **Render** (`DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`)
  - Database: **Neon PostgreSQL**

---

## 🗂️ Project Structure

```text
├── client/                     # Frontend React + Vite Application
│   ├── public/                 # Favicon, static assets
│   ├── src/
│   │   ├── components/         # 3D visuals, product cards, modals, checkout, header, footer
│   │   ├── context/            # AuthContext, CartContext, WishlistContext
│   │   ├── pages/              # Home, Shop, ProductDetails, Cart, Checkout, Account, Admin, Policy pages
│   │   ├── routes/             # ProtectedRoute, AdminRoute
│   │   ├── services/           # api.js, authService, productService, orderService, adminService
│   │   └── App.jsx             # Master URL routing
│   └── vercel.json             # Vercel SPA rewrite fallback
│
├── server/                     # Backend Node.js & Express REST API
│   ├── prisma/
│   │   ├── schema.prisma       # 21 PostgreSQL Relational Models
│   │   └── seed.js             # Initial database seed script
│   └── src/
│       ├── config/             # Prisma DB client
│       ├── controllers/        # admin, auth, user, order, product, review, coupon controllers
│       ├── middleware/         # authMiddleware (requireRole, JWT verification), rate limiter
│       ├── routes/             # Express API routers
│       └── app.js              # Express app entry & CORS configuration
│
└── package.json                # Monorepo scripts
```

---

## 🚀 Quickstart & Local Setup

### 1. Prerequisites
- Node.js v18+ & npm v9+
- PostgreSQL database or Neon Cloud PostgreSQL connection URL

### 2. Install Dependencies
```bash
# Install all root, client, and server dependencies
npm run install:all
```

### 3. Configure Environment Variables
Copy the `.env.example` templates:
```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

Fill in your `DATABASE_URL` in `server/.env` and `VITE_API_URL` in `client/.env`.

### 4. Database Setup & Seed
```bash
cd server
npx prisma generate
npx prisma db push
node prisma/seed.js
cd ..
```

### 5. Start Development Server
```bash
npm run dev
```
- Client running at `http://localhost:5173`
- Backend API running at `http://localhost:5000`

---

## 🔐 Credentials & Admin Initialization

- **Admin Login**: Use the email and password configured in your environment/seed.
- **Customer Login**: Use the email and password configured in your environment/seed.

---

## 🚢 Production Deployment Guide

### Deploying Frontend to Vercel
1. Link your GitHub repository to Vercel.
2. Set Root Directory to `client`.
3. Set Build Command to `npm run build` and Output Directory to `dist`.
4. Add Environment Variable:
   - `VITE_API_URL`: `https://your-render-backend.onrender.com/api`

### Deploying Backend to Render
1. Create a new **Web Service** on Render linked to your repository.
2. Set Root Directory to `server`.
3. Set Build Command to `npm install && npx prisma generate`.
4. Set Start Command to `npm start`.
5. Add Environment Variables:
   - `DATABASE_URL`: `postgresql://...` (Neon pooled connection string)
   - `JWT_SECRET`: `your_random_64_character_secret`
   - `FRONTEND_URL`: `https://your-app.vercel.app`
   - `NODE_ENV`: `production`

---

## 🧪 Testing & Verification Matrix

- `npm --prefix client run build`: Runs production build with 0 TypeScript/Vite errors.
- `node -c server/src/app.js`: Validates backend server syntax.
