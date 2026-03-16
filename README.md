# Naturals Salon Management System

A premium Admin-only ERP and POS platform.

## Structure
- `/backend`: Node.js Express server with Prisma (SQLite).
- `/frontend`: Next.js App Router with Tailwind CSS.

## How to Start

### 1. Backend
```bash
cd backend
npm install
npx prisma db push
npm run dev
```

### 2. Frontend
```bash
cd frontend
npm install
npm run dev
```

## Features Implemented
- **Dashboard**: High-impact metric cards and real-time daily sales overview.
- **Salon Menu**: Tabbed navigation (Services, Products, Packages) with Gender and Category filters.
- **Billing POS**: Interactive billing table with Staff attribution and multi-tender payment support.
- **Client Management**: Customer search and basic profile integration.
- **Branding**: Full "Naturals" color palette (Teal, Rose, Amber, Deep Blue).
