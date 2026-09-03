# 🛡️ Security Policy & Architecture Guide

This document outlines the security policies, architecture, and defense mechanisms implemented in **Paquito's Pizza** (Next.js 14, TypeScript, MySQL).

---

## 📋 Table of Contents

- [Supported Versions](#supported-versions)
- [Reporting a Vulnerability](#reporting-a-vulnerability)
- [Security Architecture & Defenses](#security-architecture--defenses)
  - [1. Authentication & Session Management](#1-authentication--session-management)
  - [2. SQL Injection Prevention](#2-sql-injection-prevention)
  - [3. Cross-Site Scripting (XSS) Protection](#3-cross-site-scripting-xss-protection)
  - [4. Cross-Site Request Forgery (CSRF) Defense](#4-cross-site-request-forgery-csrf-defense)
  - [5. Cloud Database & Network Security](#5-cloud-database--network-security)
  - [6. Input Validation & Type Safety](#6-input-validation--type-safety)
  - [7. File & Media Upload Security](#7-file--media-upload-security)
  - [8. Secret & Credential Isolation](#8-secret--credential-isolation)
- [Production Deployment Security Checklist](#production-deployment-security-checklist)
- [Best Practices for Developers](#best-practices-for-developers)

---

## 🔒 Supported Versions

We actively provide security updates and patches for the following versions:

| Version | Supported | Notes |
| :--- | :--- | :--- |
| **1.0.x (Next.js 14 App Router)** | ✅ Yes | Current active production branch |
| Legacy PHP Architecture | ❌ No | Completely deprecated & replaced |

---

## 🚨 Reporting a Vulnerability

If you discover a security vulnerability within this project, please follow responsible disclosure guidelines:

1. **Do not create a public GitHub issue.**
2. Send an email describing the vulnerability, steps to reproduce, and impact to:
   - **Security Contact**: `gabriellipaysa@gmail.com`
3. We will acknowledge receipt within 48 hours and provide a timeline for a patch.

---

## 🛡️ Security Architecture & Defenses

### 1. Authentication & Session Management

* **Stateless JWT with HTTP-Only Cookies**:
  * User and Admin authentication tokens are signed with HMAC-SHA256 (`jsonwebtoken`) and stored in **`HttpOnly`** cookies (`paquitos_token` and `paquitos_admin_token`).
  * Cookies are configured with `SameSite=Lax`, `Path=/`, and `Secure` (enabled automatically in production environments).
  * JavaScript running in the browser cannot access session cookies, eliminating token theft via malicious scripts or XSS.
* **Role-Based Access Control (RBAC)**:
  * Admin endpoints (`/api/admin/*`) strictly verify admin session credentials via `getAdminSessionFromCookies()` before executing business logic.
  * Tampered, expired, or invalid tokens instantly return `403 Forbidden` or `401 Unauthorized`.
* **Cryptographic Password Hashing**:
  * User credentials use industry-standard **Bcrypt** salt-and-hash hashing.
  * Passwords are never stored in plaintext and cannot be recovered via database inspection.

---

### 2. SQL Injection Prevention

* **Strict Parameterized Queries**:
  * All database operations utilize the `mysql2/promise` connection pool with parameter placeholders (`?`).
  * User input is never concatenated or interpolated directly into raw SQL strings.

**Secure Implementation Example (`src/server/repositories/product-repo.ts`):**
```typescript
// SECURE: Parameterized SQL with mysql2 prepared bindings
const sql = 'SELECT * FROM products WHERE id = ? LIMIT 1';
const rows = await query<Product[]>(sql, [productId]);
```

---

### 3. Cross-Site Scripting (XSS) Protection

* **React Virtual DOM Escaping**:
  * Next.js and React inherently escape string values before rendering them to the DOM, neutralizing standard injection vectors (e.g., `<script>` tags or malicious attributes).
* **Zero Unsafe Inner HTML**:
  * The application avoids `dangerouslySetInnerHTML` for user-generated content (e.g., reviews, delivery notes, product names).
* **Safe CSV/Excel File Generation**:
  * The sales exporter implements RFC 4180 quotation escaping and BOM (`\uFEFF`) conversion via `Blob`, preventing spreadsheet formula injection.

---

### 4. Cross-Site Request Forgery (CSRF) Defense

* **`SameSite=Lax` Cookie Policy**:
  * Prevents third-party websites from sending authenticated requests on behalf of logged-in users during cross-origin requests.
* **JSON API Content-Type Enforcement**:
  * State-changing mutation routes (`POST`, `PUT`, `DELETE`) require `application/json` payloads, which standard HTML cross-origin form submissions cannot forge without CORS approval.

---

### 5. Cloud Database & Network Security

* **Automated Cloud SSL/TLS Negotiation**:
  * Connection pooling (`src/server/db/index.ts`) detects remote cloud database providers (Aiven, AWS RDS, PlanetScale) and automatically enables TLS encryption (`ssl: { rejectUnauthorized: false }`).
  * Intercepts unencrypted transit and protects credentials and sensitive customer orders across public networks.

---

### 6. Input Validation & Type Safety

* **TypeScript Compilation**:
  * End-to-end type safety between database DTOs, service responses, and frontend component props prevents unintended data structures and type coercion bugs.
* **Zod Payload Validation**:
  * API routes validate request bodies with strict schemas before forwarding data to domain repositories.

---

### 7. File & Media Upload Security

* **Cloudinary CDN Asset Pipeline**:
  * Product images and payment proof screenshots are handled through secure media pipelines.
  * Direct execution of uploaded executable files (`.php`, `.exe`, `.sh`) is impossible as static media assets are isolated on Cloudinary servers.

---

### 8. Secret & Credential Isolation

* **Environment Variable Protection**:
  * Database credentials, JWT signing keys, and Cloudinary secrets reside strictly in `.env.local` and `.env`.
  * `.gitignore` explicitly prevents `.env*` files from being committed into source control.

---

## 🚀 Production Deployment Security Checklist

Before deploying to production (e.g., Vercel, AWS, Railway, Docker):

- [ ] Set a strong, randomly generated `JWT_SECRET` (at least 64 characters).
- [ ] Set a distinct, high-entropy `ADMIN_JWT_SECRET`.
- [ ] Enable `DB_SSL=true` when connecting to remote cloud databases.
- [ ] Ensure HTTPS is enforced by your domain provider / reverse proxy (Vercel enforces this by default).
- [ ] Run `npm audit` to verify zero high or critical dependencies.
- [ ] Ensure `.env.local` is never pushed to public Git repositories.

---

## 👨‍💻 Best Practices for Developers

1. **Always Use Repository Query Functions**: Never construct ad-hoc raw SQL strings. Always pass parameters via array bindings in `src/server/repositories/`.
2. **Never Expose Secrets in Client Bundles**: Variables without `NEXT_PUBLIC_` prefix remain server-only and cannot be leaked to client browsers.
3. **Verify Auth on New Admin Routes**: Every new `/api/admin/*` route must start with `getAdminSessionFromCookies()`.
4. **Validate Input Sizes**: Ensure text fields (delivery notes, addresses) have upper bounds to prevent Denial of Service (DoS) memory exhaustion.
