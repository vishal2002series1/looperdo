# LooperDo - Adaptive Exam Prep Platform

Professional marketing and product website for LooperDo, an adaptive exam preparation platform that uses the Flywheel method to build exam readiness.

## Quick Start

```bash
cd nextjs_space
yarn install
yarn prisma generate
yarn prisma db push
yarn prisma db seed
yarn dev
```

Open [http://localhost:3000](http://localhost:3000)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI**: Tailwind CSS, Framer Motion, Radix UI
- **Auth**: NextAuth.js v4 with Credentials Provider
- **Database**: PostgreSQL via Prisma ORM
- **Charts**: Recharts

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with hero, flywheel, benefits, testimonials |
| `/certifications` | Certification hub with all supported certs |
| `/certifications/[slug]` | Individual certification detail pages |
| `/dashboard` | Student portal (authenticated) with readiness score |
| `/pricing` | Three-tier pricing with comparison table |
| `/login` | Login page |
| `/signup` | Registration page |
| `/profile` | User profile settings (authenticated) |
| `/about` | Mission and how it works |
| `/faq` | Frequently asked questions |
| `/contact` | Contact form |

## Mock API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/generate-test` | POST | Generate adaptive test questions |
| `/api/evaluate-test` | POST | Evaluate test answers and return diagnosis |
| `/api/generate-workbook` | POST | Generate personalized study workbook |
| `/api/student-profile` | GET | Get student readiness score and progress |
| `/api/signup` | POST | Create new user account |
| `/api/auth/login` | POST | Authenticate user |
| `/api/contact` | POST | Submit contact form |

## Supported Certifications

- AWS Solutions Architect Associate (SAA-C03)
- Lean Six Sigma Black Belt (IASSC)
- Microsoft Azure Administrator (AZ-104)
- Power BI Data Analyst (PL-300)
- Google Cloud Associate Cloud Engineer
- PMP (Project Management Professional)

## Backend Integration

See [INTEGRATION.md](./INTEGRATION.md) for a complete guide on connecting the real FastAPI backend deployed on AWS Lambda.

## Environment Variables

```env
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=  # Set when connecting real backend
```
