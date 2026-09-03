# 🍕 Paquito's Pizza – Modern Restaurant & Online Ordering Platform

A high-performance, full-stack online ordering and restaurant management platform built with **Next.js 14 (App Router)**, **React 18**, **TypeScript**, and **MySQL**. Designed from the ground up to deliver a seamless food ordering experience for customers and a comprehensive management back-office for restaurant operators.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [For Non-Technical Stakeholders & Business Operators](#-for-non-technical-stakeholders--business-operators)
  - [Customer Experience & Features](#1-customer-experience--features)
  - [Admin & Store Operations](#2-admin--store-operations)
  - [Business Value & Analytics](#3-business-value--analytics)
- [For Developers & Technical Stakeholders](#-for-developers--technical-stakeholders)
  - [Tech Stack](#tech-stack)
  - [System Architecture](#system-architecture)
  - [Directory Structure](#directory-structure)
  - [Getting Started & Local Setup](#getting-started--local-setup)
  - [Environment Variables](#environment-variables)
  - [Database Schema & Migrations](#database-schema--migrations)
  - [API Endpoints Reference](#api-endpoints-reference)
  - [Production Deployment](#production-deployment)
- [Security & Performance](#-security--performance)
- [License](#-license)

---

## 🌟 Overview

**Paquito's Pizza** is an end-to-end digital restaurant solution. It replaces legacy, clunky ordering systems with an ultra-responsive, mobile-first web app backed by resilient database auto-migrations, cloud media hosting, and real-time sales reporting.

---

## 👥 For Non-Technical Stakeholders & Business Operators

### 1. Customer Experience & Features

* **Interactive Digital Menu**: Browse freshly baked pizzas, pasta, drinks, and combos with instant category filters (Pizza, Pasta, Drinks, Desserts, Deals).
* **Progressive Shimmer Skeleton Loading**: Fast perceived performance with placeholder animations while content loads smoothly.
* **Custom Product Configurator**: Select crust sizes (Personal, Regular, Large, Party), crust types (Thin, Hand-Tossed, Cheese Crust), and toppings with real-time price updates.
* **Smart Shopping Cart**: Add, update, or remove items with automatic total computation and delivery note support.
* **One-Click Favorites Drawer**: Bookmark favorite meals for instant re-ordering.
* **Saved Address Book**: Save multiple delivery addresses (Home, Office, Condo) with landmarks and delivery instructions.
* **Flexible Checkout & Payment**:
  * Cash on Delivery (COD)
  * Online / GCash / Bank Transfer with direct payment proof screenshot upload
  * Delivery vs. Store Pickup options
* **Real-Time Order Lifecycle Tracking**: Live status updates across 5 order stages: *Pending* ➔ *Preparing* ➔ *Ready* ➔ *Out for Delivery / Completed* ➔ *Cancelled*.

---

### 2. Admin & Store Operations

* **Executive Analytics Dashboard**: Live metrics for Total Period Revenue, Units Sold, Completed Transactions, and Average Order Value.
* **Top Performing Products Board**: View bestselling items ranked by gross revenue and units sold with revenue-share percentage bars. Toggle between **Top 5** and **Top 10** views.
* **One-Click CSV / Excel Export**: Generate clean, UTF-8 formatted spreadsheets with executive summaries, product rankings, and line-item transaction logs.
* **Printable / PDF Sales Invoices**: High-resolution print styling formatted for physical thermal printing or digital PDF export.
* **Order Management & Kitchen Pipeline**: Update order payment statuses, advance preparation states, and add cancellation notes.
* **Menu & Inventory Control**: Add new products, update prices, change descriptions, mark items as *Available* / *Sold Out* / *Inactive*, and upload images directly to Cloudinary.
* **Category Manager**: Create, rename, re-order, and manage product categories dynamically.
* **User & Staff Account Administration**: Manage customer records and assign admin roles with secure credential management.

---

### 🔑 How to Access & Use the Admin Panel

#### Default Seed Credentials
For testing and local development, the following accounts are pre-seeded in the database:

| Account Role | Portal URL | Username / Email | Default Password | Authority & Scope |
| :--- | :--- | :--- | :--- | :--- |
| **Root Super-User** | `/admin/login` | `root` | `root` | **Exclusive Account Authority**: The ONLY user capable of managing (creating, editing, deleting) administrator accounts and customer accounts. |
| **Store Administrator** | `/admin/login` | `admin` | `admin123` | **Store Operations Authority**: Dedicated exclusively to store management (Dashboard, Orders, Products, Categories, Sales Reports). Restricted from modifying other admin/customer accounts. |
| **Demo Customer** | `/` (Login modal) | `user@gmail.com` | `111` | Standard customer ordering, cart checkout, and profile settings. |

> [!NOTE]
> **Password Complexity Policy**: While the seed passwords above are provided for initial quick-login convenience, all newly registered accounts or modified passwords (Customer, Admin, and Root) **must be at least 8 characters long and contain at least one special character** (`!@#$%^&*...`). Missing requirements are highlighted in real-time.

---

#### Step 1: Log In to the Admin Portal
1. Navigate to `/admin/login` (or `/admin`).
2. Log in with either:
   - **`root` / `root`** &rarr; For managing administrator accounts (`/admin/accounts`) and customer user accounts (`/admin/users`).
   - **`admin` / `admin123`** &rarr; For daily restaurant operations (`/admin/orders`, `/admin/products`, `/admin/sales`, `/admin/categories`).
3. The interface automatically routes and configures sidebar modules based on your role authority.

#### Step 2: Role Separation & Capabilities by Module
| Module | URL Route | Root Super-User (`root`) | Store Admin (`admin` / Staff) |
| :--- | :--- | :--- | :--- |
| **Admin Accounts** | `/admin/accounts` | **Full Control**: Create new admins, edit credentials, delete accounts | ⛔ *Access Denied (403)* |
| **Customer Users** | `/admin/users` | **Full Control**: Create, view profiles, delete customer accounts | ⛔ *Access Denied (403)* |
| **Root Profile** | `/admin/profile` | **Full Control**: Update root credentials with password validation | ⛔ *Access Denied (403)* |
| **Dashboard** | `/admin` | View-only overview | **Full Control**: Live store metrics & revenue |
| **Orders Pipeline** | `/admin/orders` | View-only | **Full Control**: Update kitchen statuses & payment proofs |
| **Products & Menu** | `/admin/products` | View-only | **Full Control**: Add items, pricing, inventory availability |
| **Categories** | `/admin/categories` | View-only | **Full Control**: Create and organize menu categories |
| **Sales & Reports** | `/admin/sales` | View-only | **Full Control**: Top products leaderboard, Excel & PDF exports |

---

### 3. Business Value & Analytics

| Advantage | Benefit |
| :--- | :--- |
| **Zero Ordering Friction** | Mobile-first checkout and fast loading minimize cart abandonment. |
| **Data-Driven Menu Decisions** | Real-time bestseller analytics highlight high-margin and popular items. |
| **Reliable Order Fulfillment** | Clear order statuses eliminate kitchen confusion and delivery delays. |
| **Cloud-Native Resilience** | Automatic SSL connection pooling supports cloud databases with zero downtime. |

---

## 💻 For Developers & Technical Stakeholders

### Tech Stack

* **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind/Vanilla CSS Utilities
* **Backend**: Next.js Route Handlers (Node.js runtime), Layered Architecture (Controllers ➔ Services ➔ Repositories)
* **Database**: MySQL 8.0 / Remote Cloud MySQL (Aiven, AWS RDS, PlanetScale) with SSL pooling (`mysql2/promise`)
* **Authentication**: Stateless HTTP-Only JWT cookies with role-based access control (User vs. Admin)
* **Image CDN**: Cloudinary with fallback seed utilities
* **Monitoring & Web Vitals**: `@vercel/speed-insights` for Core Web Vitals (LCP, FID, CLS, INP)
* **Containerization**: Docker & Docker Compose for rapid database provisioning

---

### System Architecture

The application adopts a clean, decoupled **Repository-Service Pattern**:

```
Client Requests (Browser)
       │
       ▼
Next.js App Router (src/app/...)
       │
       ▼
API Route Handlers (src/app/api/...)
       │
       ▼
Business Service Layer (src/server/services/...)
       │
       ▼
Data Repository Layer (src/server/repositories/...)
       │
       ▼
Database Connection Pool & Auto-Migrator (src/server/db/...)
       │
       ▼
MySQL 8.0 Database (Local Docker / Cloud SSL)
```

---

### Directory Structure

```
pizzaETR/
├── migrations/                # SQL schema migration files (001 - 010)
├── public/                    # Static assets & default food images
├── scripts/
│   └── seed-cloudinary.mjs    # Cloudinary media seeding script
├── src/
│   ├── app/                   # Next.js App Router pages & API routes
│   │   ├── admin/             # Admin dashboard, orders, products, sales
│   │   ├── api/               # Serverless REST endpoints
│   │   ├── cart/              # Shopping cart & checkout flow
│   │   ├── menu/              # Customer menu & category filtering
│   │   ├── orders/            # Order history & live status tracking
│   │   └── product/[id]/      # Product detail & customizer modal
│   ├── components/            # Reusable UI widgets & Skeleton loaders
│   ├── context/               # Global state (Cart, Auth, Toast, Favorites)
│   ├── lib/                   # Utility helpers & JWT signing/verification
│   ├── server/                # Backend domain layer
│   │   ├── db/                # MySQL connection pool & auto-migrations
│   │   ├── repositories/      # SQL queries & DB access objects
│   │   └── services/          # Business logic & analytics aggregations
│   └── types/                 # Shared TypeScript interfaces & DTOs
├── database.sql               # Base database schema dump
├── docker-compose.yml         # Local MySQL Docker container
├── package.json               # Node.js dependencies & npm scripts
└── README.md                  # Project documentation
```

---

### Getting Started & Local Setup

#### 1. Prerequisites
* **Node.js**: `v18.17.0` or higher
* **npm**: `v9.0.0` or higher
* **MySQL**: Local instance or Docker installed

#### 2. Clone and Install Dependencies
```bash
git clone https://github.com/Gabriel-Lipaysa/Paquitos_Reimagined.git
cd Paquitos_Reimagined
npm install
```

#### 3. Start Local MySQL with Docker (Optional)
```bash
docker compose up -d
```
*This starts a local MySQL 8.0 instance on port `3306` with database `pizza_pizza` and auto-loads `database.sql`.*

#### 4. Configure Environment Variables
Create a `.env.local` file in the root directory (see [Environment Variables](#environment-variables)).

#### 5. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### Environment Variables

Create `.env.local` or configure your hosting environment:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=pizza_pizza
DB_SSL=false                       # Set to true for Aiven/AWS cloud databases

# Authentication Security
JWT_SECRET=your_super_secret_jwt_key_here
ADMIN_JWT_SECRET=your_admin_secret_key_here

# Cloudinary CDN (Optional for product image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Next.js Public Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

### Database Schema & Migrations

The platform includes an **Automatic Schema Migrator** (`src/server/db/auto-migrate.ts`) that verifies table structures and applies incremental migrations idempotently on startup.

#### Key Database Tables:
* **`products`**: Item catalog, base pricing, status, and JSON custom options.
* **`categories`**: Dynamic category hierarchy and ordering.
* **`orders` & `order_items`**: Order headers, customer details, payment proof, and line-item details.
* **`sales`**: Denormalized transaction ledger for rapid analytics aggregation.
* **`cart`**: Persistent shopping cart line items with option breakdowns.
* **`user` & `admin`**: Customer accounts and administrative credentials with bcrypt hashes.
* **`favorites`**: User-pinned products for instant re-ordering.

---

### API Endpoints Reference

#### Customer API Endpoints
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Retrieve active products (supports category filter) | No |
| `GET` | `/api/products/:id` | Fetch product details & option groups | No |
| `GET` | `/api/categories` | List all active menu categories | No |
| `GET/POST` | `/api/cart` | Get or add items to customer cart | Yes (User) |
| `DELETE` | `/api/cart/:id` | Remove line item from cart | Yes (User) |
| `POST` | `/api/orders` | Submit new order & upload payment proof | Yes (User) |
| `GET` | `/api/orders` | Retrieve customer order history | Yes (User) |
| `GET/POST` | `/api/favorites` | List or toggle bookmarked favorites | Yes (User) |

#### Admin API Endpoints
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard` | KPI metrics (Revenue, Orders, Products, Users) | Yes (Admin) |
| `GET` | `/api/admin/sales` | Sales analytics, bestseller rankings, date filter | Yes (Admin) |
| `GET/PUT` | `/api/admin/orders` | List and update order fulfillment statuses | Yes (Admin) |
| `POST/PUT`| `/api/admin/products`| Create or edit menu products & availability | Yes (Admin) |
| `DELETE` | `/api/admin/products/:id` | Remove product from catalog | Yes (Admin) |
| `GET/POST`| `/api/admin/categories`| Manage menu categories | Yes (Admin) |

---

### Production Deployment

#### Vercel Deployment (Recommended)
1. Push your repository to GitHub.
2. Import the repository into **Vercel**.
3. Set your production environment variables (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SSL=true`, `JWT_SECRET`).
4. Vercel automatically builds and deploys the Next.js App Router project with `@vercel/speed-insights` enabled.

#### Self-Hosted Node.js / Docker
```bash
# Build production bundle
npm run build

# Start production server on port 3000
npm start
```

---

## 🔒 Security & Performance

* **Encrypted Sessions**: Stateless HTTP-Only cookies prevent XSS session hijacking.
* **SQL Injection Protection**: All queries utilize parameterized statements (`mysql2/promise`).
* **Optimized Image Delivery**: Transparent image rendering, lazy loading, and Cloudinary CDN caching.
* **Core Web Vitals**: Integrated `@vercel/speed-insights` tracks real-user interaction metrics.

---

## 📄 License

This project is licensed under the **MIT License**.
