# Qawam (قَوام) — HR & Payroll System

> Multi-tenant HR & Payroll management system built as a portfolio piece demonstrating production-grade backend engineering, advanced database design, and async processing.

**"Qawam"** — from Arabic "القوام" meaning the structure and foundation upon which an entity stands. A fitting name for an HR system that forms the organizational backbone of a company.

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Owner | faisal@qawam.sa | Owner@1234 |
| Employee | sultan.midhani@qawam.sa | Emp@12345 |
| Platform Admin | admin@qawam.sa | Platform@123 |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Node.js + NestJS 12, TypeScript 6, Prisma ORM |
| **Frontend** | Next.js 16 (App Router), React, TypeScript 7, TailwindCSS |
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
# Backend runs on http://localhost:4000
```

### 3. Setup frontend
```bash
cd apps/frontend
npm install
npm run dev
# Frontend runs on http://localhost:3000
```

### 4. Or use Docker for everything
```bash
docker-compose up -d
```

---

## API Documentation

Swagger/OpenAPI documentation available at `http://localhost:4000/api/docs` when the backend is running.

### Key Endpoints
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
| GET | /api/v1/attendance | List attendance records |
| POST | /api/v1/attendance/clock-in | Clock in |
| POST | /api/v1/attendance/clock-out | Clock out |
| POST | /api/v1/leave | Request leave |
| POST | /api/v1/loans | Request loan |

---

## Architecture

### Multi-Tenancy
Row-level tenancy — every table has `tenantId`. Tenant isolation enforced via Prisma middleware. Current tenant resolved from JWT at request time.

### RBAC (Role-Based Access Control)
- **Roles:** Owner, HR Manager, Accountant, Manager, Employee
- **Permissions:** Granular strings (e.g., `employee.create`, `payroll.finalize`)
- Global JWT guard with `@Public()` decorator for unprotected routes
- Custom `@CurrentUser()` and `@CurrentTenant()` decorators

### Payroll Rule Engine
- Salary components stored as structured JSON (operations tree)
- **No `eval()`** — tree traversed node-by-node (FIXED, VARIABLE, ADD, SUBTRACT, MULTIPLY, DIVIDE)
- All monetary calculations use `Decimal` (Prisma) — never floating-point
- Payslips are immutable snapshots after payroll cycle finalization

### Approval Workflow Engine
- Configurable per-tenant per-request-type (leave, loan, resignation)
- State machine: PENDING → step1 → step2 → ... → APPROVED/REJECTED
- EventEmitter drives step transitions
- Frontend polls status endpoint (no WebSocket dependency)

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

# Backend type check
cd apps/backend && npx tsc --noEmit

# Frontend type check
cd apps/frontend && npx tsc --noEmit
```

---

## License

MIT
