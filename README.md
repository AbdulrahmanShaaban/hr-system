# Qawam (قَوام) — HR & Payroll System

> Multi-tenant HR & Payroll management system built as a portfolio piece demonstrating production-grade backend engineering, advanced database design, and async processing.

**"Qawam"** — from Arabic "القوام" meaning the structure and foundation upon which an entity stands. A fitting name for an HR system that forms the organizational backbone of a company.

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Owner | owner@qawam.sa | Owner@1234 |
| HR Manager | hr@qawam.sa | Hr@12345 |
| Accountant | accountant@qawam.sa | Accountant@123 |
| Employee | employee@qawam.sa | Employee@123 |
| Platform Admin | platform@admin.com | Platform@123 |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Node.js + NestJS, TypeScript, Prisma ORM |
| **Frontend** | Next.js (App Router), React, TypeScript, TailwindCSS |
| **Database** | PostgreSQL 16 |
| **Queue** | BullMQ + Redis |
| **Search** | Meilisearch (Arabic + English full-text) |
| **Auth** | Passport JWT + Refresh Tokens, bcrypt |
| **Validation** | class-validator + class-transformer (backend), react-hook-form + zod (frontend) |
| **UI** | Radix UI primitives, Lucide icons, custom design system |
| **DevOps** | Docker + docker-compose, GitHub Actions CI |

---

## Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- npm 10+

### 1. Start infrastructure
```bash
docker-compose up -d postgres redis meilisearch
```

### 2. Setup backend
```bash
cd apps/backend
npm install
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

### 3. Setup frontend
```bash
cd apps/frontend
npm install
npm run dev
```

### 4. Or use Docker for everything
```bash
docker-compose up -d
```

---

## NestJS Backend Documentation

This backend is built with NestJS — a progressive Node.js framework for building efficient and scalable server-side applications.

### Key NestJS Concepts Used
- **Modules**: Feature-based module organization (Auth, Employee, Payroll, etc.)
- **Providers**: Services with dependency injection for business logic
- **Controllers**: RESTful API endpoints with decorators
- **Guards**: JWT authentication and role-based authorization
- **Interceptors**: Audit logging for sensitive operations
- **Pipes**: Input validation using class-validator
- **Decorators**: Custom decorators for current user, tenant, and permissions

### API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/v1/auth/login | Login with email/password |
| POST | /api/v1/auth/refresh | Refresh access token |
| POST | /api/v1/auth/logout | Invalidate refresh token |
| GET | /api/v1/auth/me | Get current user profile |
| GET | /api/v1/employees | List employees (paginated) |
| POST | /api/v1/employees | Create new employee |
| GET | /api/v1/payroll/cycles | List payroll cycles |
| POST | /api/v1/payroll/cycles/:id/process | Process payroll cycle |
| POST | /api/v1/payroll/cycles/:id/finalize | Finalize payroll cycle |
| GET | /api/v1/attendance | List attendance records |
| POST | /api/v1/attendance/clock-in | Clock in |
| POST | /api/v1/attendance/clock-out | Clock out |
| POST | /api/v1/leave | Request leave |
| POST | /api/v1/loans | Request loan |

### Swagger Documentation
When the backend is running, visit `http://localhost:3000/api` for interactive API documentation.

---

## Architecture

### Multi-Tenancy
Row-level tenancy — every table has `tenantId`. Tenant isolation enforced via Prisma middleware. Current tenant resolved from JWT at request time.

### RBAC (Role-Based Access Control)
- **Roles:** Owner, HR Manager, Accountant, Manager, Employee
- **Permissions:** Granular strings (e.g., `employee.create`, `payroll.finalize`)
- Custom `@RequirePermission()` decorator on controllers
- Guards check JWT → employee → roles → permissions

### Payroll Rule Engine
- Salary components stored as structured JSON (operations tree)
- **No `eval()`** — tree traversed node-by-node (FIXED, VARIABLE, ADD, SUBTRACT, MULTIPLY, DIVIDE)
- All monetary calculations use `Decimal` (Prisma) — never floating-point
- Payslips are immutable snapshots after payroll cycle finalization
- Adjustment entries for post-finalization corrections (never modify frozen payslips)

### Approval Workflow Engine
- Configurable per-tenant per-request-type (leave, loan, resignation)
- State machine: PENDING → step1 → step2 → ... → APPROVED/REJECTED
- EventEmitter drives step transitions
- Frontend polls status endpoint (no WebSocket dependency)

### Background Jobs (BullMQ)
- Bulk payslip PDF generation
- Email notifications (contract expiry, pending leave)
- Meilisearch index rebuild after bulk data changes
- Job status exposed via simple polling endpoint

---

## Project Structure

```
qawam/
├── apps/
│   ├── backend/           # NestJS API
│   │   ├── src/
│   │   │   ├── modules/   # Feature modules (auth, employee, payroll, etc.)
│   │   │   ├── common/    # Guards, decorators, interceptors, pipes
│   │   │   ├── core/      # Config, database, Redis
│   │   │   └── jobs/      # BullMQ processors
│   │   └── prisma/        # Schema + migrations + seed
│   └── frontend/          # Next.js App
│       └── src/
│           ├── features/   # Feature-based (auth, dashboard, employees, payroll)
│           ├── components/ # Shared UI components
│           ├── lib/        # Utils, API client
│           └── app/        # Routes (App Router)
├── docker-compose.yml
├── .github/workflows/ci.yml
└── .agent/current-task/    # Architecture decisions
```

---

## Key Features

1. **Multi-tenant company management** — Each company has its own data isolation
2. **Employee lifecycle** — Onboarding, attendance, leave, loans, termination
3. **Payroll processing** — Rule-based engine with formula evaluation, audit trail
4. **Approval workflows** — Configurable multi-step approval for leave, loans, resignations
5. **Attendance tracking** — Clock in/out, overtime calculation, shift management
6. **Leave management** — Leave types, balance tracking, approval workflow
7. **Loan & installments** — Auto-generated installment schedules, payment tracking
8. **Document management** — Employee document storage
9. **Notifications** — In-app notifications for important events
10. **Audit logging** — Complete trail of sensitive operations with before/after values

---

## Testing

```bash
# Backend unit tests
cd apps/backend && npm test

# Backend E2E tests (requires running database)
cd apps/backend && npm run test:e2e

# Frontend build check
cd apps/frontend && npm run build
```

**106 unit tests** covering:
- Payroll Rule Engine (formula evaluation, edge cases)
- Approval Workflow (state transitions, ordering)
- Auth (JWT, refresh tokens, RBAC)
- Attendance (clock in/out, overtime, late calculation)
- Leave (day validation, approval effects)
- Loans (installment generation, payment tracking)

---

## API Documentation

Swagger/OpenAPI documentation available at `http://localhost:3000/api` when the backend is running.

---

## Architecture Decisions

See `.agent/current-task/decisions.md` for detailed explanations of every architectural decision made in this project. This file is intended for interview preparation and technical discussions.

---

## License

MIT
