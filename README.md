# ExpenseFlow - Expense Management SaaS

A modern, enterprise-grade Expense Management Web Application built with Next.js 15, Node.js/Express, and MongoDB.

## Features

- **Authentication**: Register, Login, JWT + Refresh Tokens, Forgot/Reset Password, Email Verification
- **Dashboard**: Financial KPIs, charts (monthly/weekly/daily trends, category breakdown, income vs expense)
- **Expense Management**: CRUD, receipt upload, OCR scanning, categories, tags, payment methods
- **Income Tracking**: Multiple income sources (salary, freelancing, business, investment)
- **EMI Management**: Loan tracking, payment scheduling, EMI dashboard
- **Budget Planning**: Monthly budgets with 80%/90%/100% alerts
- **Goals**: Savings goals with progress tracking
- **Analytics**: Growth metrics, top categories, EMI ratio
- **Reports**: Daily/Weekly/Monthly/Yearly with PDF, Excel, CSV export
- **Notifications**: EMI due, budget alerts, monthly summaries
- **Recurring Transactions**: Daily/Weekly/Monthly/Yearly automation
- **Admin Panel**: User management, system analytics
- **Dark Mode**: Light/Dark/System theme support
- **PWA Ready**: Manifest and responsive mobile design

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, Tailwind CSS, ShadCN UI, Recharts, Zustand, Zod |
| Backend | Node.js, Express.js, Mongoose |
| Database | MongoDB |
| Auth | JWT + Refresh Tokens |
| API Docs | Swagger (OpenAPI 3.0) |
| Deployment | Docker, Docker Compose |

## Quick Start

### Prerequisites

- Node.js 20+
- MongoDB (via Docker Desktop or local install)
- npm

> **Windows note:** Use `mongodb://127.0.0.1:27017` (not `localhost`) to avoid IPv6 connection issues.

### Quick Start (Windows)

1. Start **Docker Desktop**
2. Run:
```powershell
.\scripts\start-dev.ps1
```
This starts MongoDB, seeds demo users, and launches backend + frontend.

### Backend Setup

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Backend runs at `http://localhost:5000`
API docs at `http://localhost:5000/api/docs`

### Frontend Setup

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`

### Seed Demo Data

```bash
cd backend
npm run seed
```

**Demo credentials:**
- Admin: `admin@expenseflow.com` / `admin12345`
- User: `demo@expenseflow.com` / `demo12345`

### Docker (Production)

```bash
docker-compose up -d
```

## API Endpoints

| Route | Description |
|-------|------------|
| `/api/auth` | Authentication (register, login, profile) |
| `/api/users` | User management (admin) |
| `/api/expenses` | Expense CRUD + receipt scan |
| `/api/income` | Income management |
| `/api/emi` | EMI/loan management |
| `/api/budgets` | Budget planning |
| `/api/goals` | Financial goals |
| `/api/analytics` | Dashboard & analytics |
| `/api/reports` | Report generation & export |
| `/api/notifications` | Notification system |
| `/api/categories` | Expense categories |
| `/api/recurring` | Recurring transactions |
| `/api/credit-cards` | Credit card management & payments |

## User Roles

- **Admin**: Manage users, view all expenses, system analytics, manage categories
- **User**: Manage own finances, budgets, reports, goals

## Testing

```bash
cd backend
npm test
```

## Project Structure

```
Product_6/
├── backend/
│   ├── src/
│   │   ├── config/       # DB, env, swagger
│   │   ├── controllers/  # Route handlers
│   │   ├── middleware/   # Auth, upload, errors
│   │   ├── models/       # Mongoose schemas
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   └── utils/        # Helpers, validators
│   ├── tests/
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/          # Next.js App Router pages
│   │   ├── components/   # UI components
│   │   ├── lib/          # API client, utils
│   │   └── store/        # Zustand stores
│   └── Dockerfile
└── docker-compose.yml
```

## Environment Variables

See `backend/.env.example` and `frontend/.env.example` for required configuration.

## License

MIT
