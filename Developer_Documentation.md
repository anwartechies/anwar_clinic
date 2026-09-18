# NexGen Clinic — Master Developer Documentation

**Project Name:** NexGen Clinic (NexGen Hair Transplant & Aesthetic Surgery)  
**Repository:** Monorepo (`backend`, `admin-panel`, `landing_page`, `ecommerce`)  
**Version:** 1.0.0  
**Target Audience:** Software Engineers, Solution Architects, Technical Leads, DevOps  
**Last Updated:** September 2026  
**Document Status:** Approved & Production-Ready  

---

## Table of Contents
1. [Executive Summary & Purpose](#1-executive-summary--purpose)
2. [System Architecture & Communication Flow](#2-system-architecture--communication-flow)
3. [Monorepo Directory Layout](#3-monorepo-directory-layout)
4. [Technology Stack Matrix](#4-technology-stack-matrix)
5. [Local Development & Environment Setup](#5-local-development--environment-setup)
6. [Master Environment Variables Matrix](#6-master-environment-variables-matrix)
7. [Core Architectural Subsystems](#7-core-architectural-subsystems)
   - [7.1 Dynamic Role-Based Access Control (RBAC)](#71-dynamic-role-based-access-control-rbac)
   - [7.2 Service Builder Engine (21 Dynamic Sections)](#72-service-builder-engine-21-dynamic-sections)
   - [7.3 Media Library & Dual-Driver Storage (Local vs S3)](#73-media-library--dual-driver-storage-local-vs-s3)
   - [7.4 Content Management System (Blogs & Rich Text)](#74-content-management-system-blogs--rich-text)
   - [7.5 E-Commerce & Product Management](#75-e-commerce--product-management)
   - [7.6 Lead Capture & Patient Inquiries Pipeline](#76-lead-capture--patient-inquiries-pipeline)
   - [7.7 Careers & Candidate CV Handling (Private Storage)](#77-careers--candidate-cv-handling-private-storage)
   - [7.8 Google Reviews Integration (Places API New)](#78-google-reviews-integration-places-api-new)
   - [7.9 Platform Admin & In-Panel Deployment Pipeline](#79-platform-admin--in-panel-deployment-pipeline)
8. [Database Schema & Entity Relationships](#8-database-schema--entity-relationships)
9. [API Architecture & Swagger Reference](#9-api-architecture--swagger-reference)
10. [Security, Authentication & CORS Policy](#10-security-authentication--cors-policy)
11. [Testing, Build & Production Deployment](#11-testing-build--production-deployment)
12. [Troubleshooting & Developer Runbook](#12-troubleshooting--developer-runbook)

---

## 1. Executive Summary & Purpose

The **Anwar Clinic** platform is a full-stack, enterprise-grade healthcare management and patient-facing digital portal. Built as a unified monorepo, it powers the digital operations, patient consultations, aesthetic surgery services, content publication, and medical e-commerce for Anwar Clinic (branded as NexGen Hair Transplant).

### Key Architectural Pillars
- **Single Source of Truth (SSOT):** A central PostgreSQL database and Express API serving three client applications without data fragmentation.
- **Dynamic RBAC:** Complete runtime permission controls where roles, grants, and route accessibility can be updated live from the UI without code redeployments.
- **Schema-Driven Service Generator:** 21 customizable medical service sections configured via a single backend schema that simultaneously constructs admin forms and public landing pages.
- **Unified Media Management:** Pluggable local disk or AWS S3 storage with automatic public/private isolation.
- **High-Performance Marketing Frontends:** Next.js Server-Side Rendering (SSR) and Incremental Static Regeneration (ISR) for sub-second SEO delivery.

---

## 2. System Architecture & Communication Flow

The system consists of three frontend applications consuming a shared Node.js/Express REST API backed by PostgreSQL, AWS services, and external APIs:

```
                                  +-------------------------------------------------------------+
                                  |                    CLIENT APPLICATIONS                      |
                                  |                                                             |
                                  |   +-------------------+  +------------------+  +----------+ |
                                  |   |    Admin Panel    |  |   Landing Page   |  | E-Comm   | |
                                  |   |   Next.js 16 App  |  |  Next.js 14 SSR  |  | Store    | |
                                  |   |     Port :3100    |  |    Port :3200    |  | Port:3300| |
                                  |   +---------+---------+  +--------+---------+  +----+-----+ |
                                  +-------------|---------------------|-----------------|-------+
                                                |                     |                 |
                                    JWT Auth /  |          Public SSR |     Public SSR  |
                                    RBAC Admin  |          & Leads    |     & Products  |
                                                v                     v                 v
+-----------------------------------------------------------------------------------------------+
|                                    BACKEND REST API (:5050)                                   |
|                                     Node.js + Express + TS                                    |
|                                                                                               |
|  +--------------------+  +--------------------+  +--------------------+  +-----------------+  |
|  | /auth, /roles,     |  | /services, /blogs, |  | /leads, /jobs,     |  | /api-docs       |  |
|  | /permissions       |  | /products, /media  |  | /deploy, /reviews  |  | Swagger OpenAPI |  |
|  +---------+----------+  +---------+----------+  +---------+----------+  +-----------------+  |
+------------|-----------------------|-----------------------|----------------------------------+
             |                       |                       |
             v                       v                       v
+------------------------+  +------------------+  +---------------------------------------------+
|    PostgreSQL 14+      |  |  Storage Driver  |  |             Third-Party Services            |
|     (Sequelize)        |  |  Local / AWS S3  |  |                                             |
|                        |  |                  |  |  * Google Places API (New) (Live Reviews)   |
| - Users & Roles        |  |  - /uploads      |  |  * AWS SES (Transactional Clinic Emails)    |
| - Service Content      |  |  - S3 public     |  |  * Git & PM2 (In-panel Deploy Engine)       |
| - Blogs, Leads, Orders |  |  - S3 private    |  |                                             |
+------------------------+  +------------------+  +---------------------------------------------+
```

### Network Topology & Port Allocations
| Component | Directory | Runtime / Framework | Default Port | Internal / External Access |
|---|---|---|---|---|
| **Backend API** | `backend/` | Node.js (v18+) / Express / TS | `5050` | REST API / Public & Protected |
| **Admin Panel** | `admin-panel/` | Next.js 16 (React 19) / Tailwind v4 | `3100` | Internal Staff & Clinic Admins |
| **Landing Page**| `landing_page/`| Next.js 14 (React 18) / Tailwind v3 | `3200` | Public Patient Portal & Marketing |
| **E-Commerce**  | `ecommerce/`   | Next.js 14 (React 18) / Tailwind v3 | `3300` | Public Aesthetic & Hair Store |
| **Database**    | N/A | PostgreSQL | `5432` | Backend Access Only |

---

## 3. Monorepo Directory Layout

```
anwar_clinic/
├── admin-panel/                 # Next.js 16 Admin Dashboard
│   ├── src/
│   │   ├── app/                 # App Router pages (auth, services, blogs, leads, roles, etc.)
│   │   ├── components/          # Reusable UI, TipTap WYSIWYG editor, Nav, Modals
│   │   ├── hooks/               # Custom React hooks (auth, permissions, fetch)
│   │   └── lib/                 # API client utilities, cookie handling, token decode
│   ├── package.json
│   └── .env.example
│
├── backend/                     # Node.js Express REST API
│   ├── src/
│   │   ├── config/              # DB connection, permissions catalog, 21-section schemas, swagger
│   │   ├── middleware/          # JWT authentication, RBAC authorization, upload multer
│   │   ├── models/              # Sequelize ORM models (User, Role, Service, Blog, Lead, etc.)
│   │   ├── routes/              # Express API route definitions (/auth, /services, /public, etc.)
│   │   ├── services/            # Storage drivers (S3, local), Google Reviews, deploy logic
│   │   ├── app.ts               # Express application pipeline, CORS, static routes
│   │   └── server.ts            # Server bootstrap, DB sync, catalog synchronization
│   ├── uploads/                 # Local media storage directory (when STORAGE_DRIVER=local)
│   ├── package.json
│   └── .env.example
│
├── landing_page/                # Next.js 14 Public Clinic Website
│   ├── src/
│   │   ├── app/                 # Public routes (/services/[slug], /blogs/[slug], /careers)
│   │   ├── components/          # 21 Service Sections, Reviews Carousel, Booking Forms
│   │   └── lib/                 # Server-side API consumers with ISR caching
│   ├── package.json
│   └── .env.example
│
├── ecommerce/                   # Next.js 14 Storefront
│   ├── src/
│   │   ├── app/                 # Product listings, product details, enquiry checkout
│   │   └── components/          # Product cards, filter sidebars, Cart/Lead forms
│   ├── package.json
│   └── .env.example
│
├── BLOGS_DOCUMENTATION.md       # Dedicated Blogs deep-dive specification
├── ECOMMERCE_DOCUMENTATION.md   # Dedicated E-Commerce specification
├── google-reviews-implementation.md # Google Places integration specification
└── Developer_Documentation.md  # Master Engineering Handover Document (This file)
```

---

## 4. Technology Stack Matrix

| Layer | Technology | Version | Purpose & Rationale |
|---|---|---|---|
| **Backend Language** | TypeScript | `^5.4.5` | Type safety, maintainability, and enterprise readability |
| **Backend Framework**| Express.js | `^4.19.2` | Minimalist, fast, industry standard for Node.js REST services |
| **Database** | PostgreSQL | `14+` | ACID-compliant relational DB with robust JSONB support |
| **ORM** | Sequelize | `^6.37.3` | Schema definition, automated migrations, relational joins |
| **API Documentation**| Swagger / OpenAPI | `3.0` | Live interactive UI at `/api-docs` |
| **Cloud Storage** | AWS S3 SDK | `^3.1119` | Cloud asset storage, presigned URLs for private CVs |
| **Admin Frontend** | Next.js (App Router)| `16.3.3` | React 19, server components, Tailwind v4 |
| **Public Frontends** | Next.js (App Router)| `14.2.18` | SSR + ISR (Incremental Static Regeneration) for high-speed SEO |
| **Rich Text Editing**| TipTap Headless | `^3.31.3` | Semantic HTML output for blogs without bloat |
| **Authentication** | JWT + bcryptjs | `9.0.2 / 2.4.3` | Stateless token authentication with salted hashing |

---

## 5. Local Development & Environment Setup

### 5.1 System Prerequisites
Ensure the host machine has the following installed:
- **Node.js**: `v18.17.0` or `v20.x` LTS
- **npm**: `v9.x` or `v10.x`
- **PostgreSQL**: `14.x`, `15.x`, or `16.x`
- **Git**: Installed and configured

### 5.2 Step-by-Step Installation

#### Step 1: Database Initialization
Open your PostgreSQL shell or GUI (e.g., pgAdmin, DBeaver) and create the database:
```sql
CREATE DATABASE anwar_clinic;
```

#### Step 2: Backend Setup & Seeding
```bash
cd backend
npm install
cp .env.example .env

# Run database synchronization and seed core roles, permissions, and admin user
npm run db:seed

# (Optional) Seed standard clinic medical services (Hair transplant, PRP, etc.)
npm run db:seed:services

# Start the backend development server
npm run dev
```
*Backend runs on:* `http://localhost:5050`  
*Swagger API Docs:* `http://localhost:5050/api-docs`

#### Step 3: Admin Panel Setup
```bash
cd ../admin-panel
npm install
cp .env.example .env.local
npm run dev
```
*Admin Panel runs on:* `http://localhost:3100`

#### Step 4: Landing Page Setup
```bash
cd ../landing_page
npm install
cp .env.example .env.local
npm run dev
```
*Landing Page runs on:* `http://localhost:3200`

#### Step 5: E-Commerce Storefront Setup
```bash
cd ../ecommerce
npm install
cp .env.example .env.local
npm run dev
```
*E-Commerce runs on:* `http://localhost:3300`

### 5.3 Default Local Credentials
After executing `npm run db:seed`, the database is populated with the following default Super Administrator:
- **Email:** `admin@anwarclinic.com`
- **Password:** `Admin@123`
- **Role:** `superadmin` (Holds all permissions across all modules)

---

## 6. Master Environment Variables Matrix

### 6.1 Backend (`backend/.env`)
| Variable | Required | Default Value | Description |
|---|---|---|---|
| `PORT` | Yes | `5050` | Port on which the Express server listens. |
| `DATABASE_URL` | Yes | `postgres://postgres:postgres@localhost:5432/anwar_clinic` | PostgreSQL connection string. |
| `JWT_SECRET` | Yes | *Custom Secret* | Secret key for signing and verifying JWT tokens. |
| `JWT_EXPIRES_IN`| Yes | `7d` | Expiration lifespan of issued JWT sessions. |
| `FRONTEND_URL` | Yes | `http://localhost:3100` | Primary frontend origin for CORS policies. |
| `FRONTEND_URLS`| No | `http://localhost:3200,http://localhost:3300` | Comma-separated secondary origins. |
| `PUBLIC_URL` | Yes | `http://localhost:5050` | Base URL used to prefix locally uploaded assets. |
| `STORAGE_DRIVER`| Yes | `local` | `local` for disk storage, `s3` for AWS S3. |
| `MAX_UPLOAD_BYTES`| No| `10485760` (10MB) | Maximum allowed file upload size. |
| `S3_BUCKET` | If S3 | `""` | AWS S3 Bucket name. |
| `S3_REGION` | If S3 | `""` | AWS Region (e.g., `ap-south-1`). |
| `S3_ACCESS_KEY_ID`| If S3 | `""` | AWS IAM Access Key (leave empty on EC2 role). |
| `S3_SECRET_ACCESS_KEY`| If S3 | `""` | AWS IAM Secret Key (leave empty on EC2 role). |
| `S3_KEY_PREFIX`| If S3 | `media` | Public folder inside the S3 bucket. |
| `S3_PRIVATE_PREFIX`| If S3 | `private` | Protected folder for candidate CVs. |
| `GOOGLE_PLACES_API_KEY`| No | `""` | Google Cloud API key for Places API (New). |
| `GOOGLE_PLACE_ID`| No | `""` | Google Business Profile Place ID. |
| `GOOGLE_REVIEWS_CACHE_SECONDS`| No | `3600` | In-memory cache TTL for Google reviews. |
| `PLATFORM_ADMIN_EMAIL`| No | `prabhat@rhinon.tech` | Dedicated platform administrator email. |
| `DEPLOY_ENABLED`| No | `false` | Enables the `/deploy` controller for Git pulling. |

### 6.2 Admin Panel (`admin-panel/.env.local`)
| Variable | Required | Default Value | Description |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | `http://localhost:5050` | Public URL to the backend Express API. |
| `NEXT_PUBLIC_LANDING_URL`| Yes | `http://localhost:3200` | Link back to the public landing website. |
| `NEXT_PUBLIC_ECOMMERCE_URL`| Yes | `http://localhost:3300`| Link to the e-commerce storefront. |

### 6.3 Landing Page (`landing_page/.env.local`)
| Variable | Required | Default Value | Description |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | `http://localhost:5050` | Client-side requests endpoint. |
| `API_URL` | Yes | `http://localhost:5050` | Server-side SSR/ISR endpoint. |
| `SERVICES_REVALIDATE` | No | `60` | ISR revalidation frequency in seconds. |
| `NEXT_PUBLIC_COMPANY_NAME` | No | `NexGen` | Brand name displayed throughout UI. |
| `NEXT_PUBLIC_CLINIC_PHONE` | No | `+91-9084726916` | Clinic telephone contact. |
| `NEXT_PUBLIC_WHATSAPP_NUMBER`| No | `919999999999` | Clinic WhatsApp API receiver. |

---

## 7. Core Architectural Subsystems

### 7.1 Dynamic Role-Based Access Control (RBAC)
Unlike static RBAC architectures that hardcode user levels into tokens, Anwar Clinic uses **Database-Driven Runtime RBAC**:

```
 [User] <---> [UserRoles] <---> [Role] <---> [RolePermissions] <---> [Permission]
```

#### How It Operates:
1. **Catalog Definition (`backend/src/config/permissions.ts`):**  
   Every atomic permission is declared as `{ name: "resource:action", resource, action }` (e.g., `services:read`, `leads:write`, `deploy:trigger`).
2. **Boot-Time Synchronization (`syncPermissionCatalog`):**  
   On every API startup, Sequelize inspects the DB table `Permissions`. Any new permissions added to the codebase are automatically inserted. Existing grants are never deleted or overridden.
3. **API Enforcement (`requirePermission` Middleware):**  
   Protected endpoints verify the requesting user's live permissions from database associations:
   ```typescript
   router.post("/services", authenticate, requirePermission("services:write"), createService);
   ```
4. **Admin UI Adaptation:**  
   The admin panel fetches the user's active permissions upon login. Navigation links, action buttons, and write controls are dynamically hidden or disabled.

---

### 7.2 Service Builder Engine (21 Dynamic Sections)
The clinic offers complex medical treatments (FUE Hair Transplant, Sapphire Micro-FUE, Beard Transplant, GFC Therapy, etc.). Each service requires rich, informative content structured across up to 21 distinct landing sections.

#### Architecture:
- **Central Schema (`backend/src/config/serviceSections.ts`):** Defines each section’s key, title, fields, and default fallback content (e.g., `hero`, `procedureOverview`, `candidateEligibility`, `techniqueComparison`, `beforeAfterGallery`, `pricingPlans`, `doctorBio`, `faqs`).
- **Dynamic Form Generation:** The Admin Panel reads this schema to build comprehensive editing interfaces automatically.
- **Graceful Fallbacks:** If an admin leaves a section blank, the public landing page renders the verified medical defaults from `serviceSections.ts`, preventing empty website blocks.

---

### 7.3 Media Library & Dual-Driver Storage (Local vs S3)
File uploads support a **Dual-Driver Storage Architecture** configured via `STORAGE_DRIVER`:

```
                           +---> [STORAGE_DRIVER=local] ---> /backend/uploads (Static Express Host)
[Multer Upload Pipeline] --+
                           +---> [STORAGE_DRIVER=s3]    ---> AWS S3 Bucket (Public 'media/*' Prefix)
```

- **Local Driver (`STORAGE_DRIVER=local`):** Files are written to `/backend/uploads`. Express serves them as static assets at `PUBLIC_URL/uploads/:filename` with `Cache-Control: public, max-age=31536000, immutable`.
- **AWS S3 Driver (`STORAGE_DRIVER=s3`):** Files are uploaded via `@aws-sdk/client-s3` under the `S3_KEY_PREFIX` (default: `media/`). CloudFront or direct S3 URLs are returned.
- **Switching Storage:** Requires changing environment variables only. Zero code modifications needed.

---

### 7.4 Content Management System (Blogs & Rich Text)
- **TipTap WYSIWYG Editor:** Provides semantic HTML editing, image embedding from the Media Library, typography headings, and custom links.
- **SEO & Social Graphs:** Generates OpenGraph title, description, keywords, canonical URLs, and estimated reading time.
- **Interactive FAQs:** Each blog post supports an accordion FAQ array that generates structured Google FAQ Schema (`Schema.org/FAQPage`).
- **View Analytics:** Safe counter incrementing on public page loads (`POST /public/blogs/:slug/view`).

---

### 7.5 E-Commerce & Product Management
- **Catalog Management:** Products support SKU, slug, category, prescription requirement flags (`requiresPrescription`), stock quantity, and variant pricing.
- **Sectional Showcase:** Product detail pages support clinical usage instructions, ingredient disclosures, clinical benefits, and safety warnings.
- **Consultation Routing:** Products requiring medical supervision redirect to consultation inquiry forms rather than direct checkout.

---

### 7.6 Lead Capture & Patient Inquiries Pipeline
- **Omnichannel Ingestion:** Captures inquiries from Landing Page Hero, Contact Form, Service Booking Modals, and E-Commerce.
- **Status Lifecycle:** `new` $\rightarrow$ `contacted` $\rightarrow$ `consultation_booked` $\rightarrow$ `converted` $\rightarrow$ `archived`.
- **Field Tracking:** Captures Patient Name, Phone, Email, Preferred Date, Desired Service/Procedure, Consultation Type (In-Clinic vs Video), and UTM tracking parameters.

---

### 7.7 Careers & Candidate CV Handling (Private Storage)
- **Job Postings:** Admin manages open positions (`/jobs`) with department, requirements, and status (`open`/`closed`).
- **Secure File Isolation:** Unlike public media, candidate CVs (PDF/DOCX) are stored under `S3_PRIVATE_PREFIX` (`private/cvs/`).
- **Presigned Download URLs:** CVs are never publicly readable. Staff members with `careers:read` permission request time-limited signed S3 URLs (`@aws-sdk/s3-request-presigner`) to view resumes.

---

### 7.8 Google Reviews Integration (Places API New)
- **Direct Integration:** Communicates with Google Places API (New) using either `GOOGLE_PLACE_ID` or `GOOGLE_PLACE_CID`.
- **In-Memory Caching:** To avoid excessive API bills and rate limits, responses are cached in memory for `GOOGLE_REVIEWS_CACHE_SECONDS` (default: 3600s / 1 hour).
- **Graceful Degradation:** If Google credentials are missing or the API rate-limits, the landing page falls back to local curated testimonials.

---

### 7.9 Platform Admin & In-Panel Deployment Pipeline
- **Dedicated Super Admin:** A second administrative layer (`PLATFORM_ADMIN_EMAIL`) intended for DevOps/Agencies.
- **In-Panel Deployment (`/deploy`):** Restricted to platform administrators. Can trigger automated Git fetches, branch checkouts, and PM2 process reloads directly from the Admin Panel.

---

## 8. Database Schema & Entity Relationships

```
+-----------------------------------------------------------------------------------------------+
|                                    ENTITY RELATIONSHIP OVERVIEW                               |
+-----------------------------------------------------------------------------------------------+

  [users] 1 ----- * [user_roles] * ----- 1 [roles] 1 ----- * [role_permissions] * ----- 1 [permissions]
     |
     +--- (Created By) ---> [blogs]
     +--- (Created By) ---> [services]
     +--- (Created By) ---> [products]
     +--- (Uploaded By) --> [media_assets]

  [jobs] 1 ----- * [job_applications] (Candidate CVs)

  [services] (21 Schema-driven Content Sections in JSONB/TEXT)

  [leads] (Patient Consultation & Contact Inquiries)

  [offers] (Discount Banners & Vouchers)

  [deployments] (Audit trail of git commits and deploy runs)
```

### Key Models & Tables
1. `users`: System accounts (`id`, `fullName`, `email`, `passwordHash`, `status`).
2. `roles`: Access control roles (`id`, `name`, `slug`, `description`).
3. `permissions`: Atomic actions (`id`, `name`, `resource`, `action`).
4. `services`: Medical treatments (`id`, `name`, `slug`, `category`, `sections`, `isPublished`).
5. `blogs`: Clinical publications (`id`, `title`, `slug`, `content`, `seo`, `faqs`, `isPublished`).
6. `products`: Hair care & medications (`id`, `name`, `slug`, `price`, `stock`, `sections`).
7. `leads`: Patient inquiries (`id`, `name`, `phone`, `email`, `serviceId`, `status`, `notes`).
8. `media_assets`: Uploaded media files (`id`, `filename`, `url`, `mimeType`, `sizeBytes`, `driver`).
9. `jobs`: Career listings (`id`, `title`, `department`, `location`, `status`).
10. `job_applications`: Resumes & submissions (`id`, `jobId`, `candidateName`, `cvUrl`).

---

## 9. API Architecture & Swagger Reference

The backend exposes an interactive **OpenAPI 3.0 (Swagger)** dashboard accessible in both development and production environments:

- **Interactive UI:** `http://localhost:5050/api-docs`
- **Raw JSON Specification:** `http://localhost:5050/api-docs.json`

### Route Catalog Summary
| Base Path | Auth Required | Purpose |
|---|---|---|
| `/auth` | No / Yes | Login, current user verification (`/auth/me`), password reset. |
| `/roles` | `settings:read/write` | Role CRUD, role permission assignment matrix. |
| `/permissions` | `settings:read` | Read-only catalog of all available system permissions. |
| `/services` | `services:read/write`| Management of medical service pages and sections. |
| `/blogs` | `blogs:read/write` | Authoring, publishing, and updating clinical articles. |
| `/products` | `products:read/write`| E-commerce inventory, pricing, and product details. |
| `/leads` | `leads:read/write` | Triage and status progression for patient inquiries. |
| `/jobs` | `careers:read/write`| Job opening creation and candidate application reviews. |
| `/media` | `media:read/write` | File upload handling, asset listing, and deletion. |
| `/offers` | `offers:read/write` | Promotional banner management and seasonal discounts. |
| `/deploy` | Platform Admin Only | Git pull & PM2 restart triggers. |
| `/public` | **None (Open CORS)** | Public APIs consumed by Landing Page and E-Commerce. |

---

## 10. Security, Authentication & CORS Policy

### 10.1 Authentication Flow
1. User submits credentials to `POST /auth/login`.
2. Password is verified using `bcrypt.compare` against salted hashes.
3. Upon validation, a signed JWT is returned containing `{ id, email, role }`.
4. Clients pass the token either via:
   - **Authorization Header:** `Bearer <token>` (Recommended for APIs and SSR)
   - **Cookie:** `token=<token>` (Used by browser clients)

### 10.2 CORS Configuration
The backend applies a strict origin whitelist defined by `FRONTEND_URL` and `FRONTEND_URLS`:
```typescript
const allowedOrigins = [
  ...env.frontendUrls,
  "http://localhost:3100",
  "http://localhost:3200",
  "http://localhost:3300"
].filter(Boolean);
```
- **Public Endpoints (`/public/*` and `/uploads/*`):** Use open CORS (`origin: true`) to allow public consumers and CDNs to fetch content and images seamlessly.

---

## 11. Testing, Build & Production Deployment

### 11.1 Production Builds
Run the build script in each directory to compile TypeScript and Next.js bundles:

```bash
# 1. Compile Backend
cd backend
npm run build
# Output: /backend/dist

# 2. Compile Admin Panel
cd ../admin-panel
npm run build
# Output: /admin-panel/.next

# 3. Compile Landing Page
cd ../landing_page
npm run build
# Output: /landing_page/.next

# 4. Compile E-Commerce
cd ../ecommerce
npm run build
# Output: /ecommerce/.next
```

### 11.2 PM2 Process Management
In a production Linux environment (Ubuntu 22.04 / 24.04), manage processes using **PM2**:

```bash
# Start Backend API
pm2 start dist/server.js --name "anwar-clinic-api" --cwd /var/www/anwar_clinic/backend

# Start Admin Panel
pm2 start npm --name "anwar-clinic-admin" --cwd /var/www/anwar_clinic/admin-panel -- run start -- -p 3100

# Start Landing Page
pm2 start npm --name "anwar-clinic-landing" --cwd /var/www/anwar_clinic/landing_page -- run start -- -p 3200

# Start E-Commerce
pm2 start npm --name "anwar-clinic-ecommerce" --cwd /var/www/anwar_clinic/ecommerce -- run start -- -p 3300

# Persist PM2 across server reboots
pm2 save
pm2 startup
```

### 11.3 Nginx Reverse Proxy & SSL Configuration
Sample Nginx block routing incoming web traffic to their respective internal ports:

```nginx
# Backend API & Uploads
server {
    server_name api.nexgenhairtransplant.com;
    client_max_body_size 15M;

    location / {
        proxy_pass http://127.0.0.1:5050;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Admin Panel
server {
    server_name admin.nexgenhairtransplant.com;

    location / {
        proxy_pass http://127.0.0.1:3100;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}

# Public Landing Website
server {
    server_name nexgenhairtransplant.com www.nexgenhairtransplant.com;

    location / {
        proxy_pass http://127.0.0.1:3200;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
```

---

## 12. Troubleshooting & Developer Runbook

### Common Issues & Solutions

#### Q1: Database connection fails on `npm run db:seed`
- **Cause:** PostgreSQL service is stopped, or credentials in `DATABASE_URL` do not match.
- **Fix:** Confirm PostgreSQL is running (`sudo systemctl status postgresql` or Windows Services). Verify user credentials by testing `psql postgres://postgres:postgres@localhost:5432/anwar_clinic`.

#### Q2: Uploaded images show broken icons on the Landing Page
- **Cause:** `PUBLIC_URL` in `backend/.env` is set to `http://localhost:5050` while the frontend is deployed on a live domain.
- **Fix:** Set `PUBLIC_URL=https://api.yourdomain.com` in production so image URLs resolve to the public API hostname.

#### Q3: New permission added in code is not appearing in the Admin Matrix
- **Cause:** Permission was not registered in `PERMISSION_CATALOG`.
- **Fix:** Open `backend/src/config/permissions.ts`, append `{ name: "module:action", resource: "module", action: "action" }`, and restart the backend server. The catalog will auto-sync on boot.

#### Q4: Next.js 16 build warnings in `admin-panel`
- **Cause:** React 19 peer dependency warnings from third-party component libraries.
- **Fix:** Run `npm install --legacy-peer-deps` inside `admin-panel`.

---

*End of Developer Documentation. For specialized sub-system details, refer to `BLOGS_DOCUMENTATION.md` and `ECOMMERCE_DOCUMENTATION.md`.*
