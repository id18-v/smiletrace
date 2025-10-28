# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SmileTrace is a comprehensive dental practice management system built with Next.js 14, TypeScript, and PostgreSQL. It enables dental practices to manage patients, record treatments, generate receipts with QR codes, handle appointments with automated reminders, and track treatment plans.

## Development Commands

### Core Development
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production application
- `npm start` - Start production server
- `npm run lint` - Run ESLint for code quality

### Database Management
- `npm run db:generate` - Generate Prisma client after schema changes
- `npm run db:migrate` - Create and apply new migration in development
- `npm run db:migrate:prod` - Apply migrations in production
- `npm run db:push` - Push schema changes directly to database (for prototyping)
- `npm run db:seed` - Populate database with seed data
- `npm run db:studio` - Open Prisma Studio for database management
- `npm run db:reset` - Reset database and apply all migrations

### Development Workflow
1. Always run `npm run db:generate` after making schema changes
2. Use `npm run db:migrate` for schema changes in development
3. Run `npm run lint` before committing code
4. Use `npm run db:studio` to inspect database contents

## Architecture Overview

### Authentication System
- NextAuth.js v5 (beta) with Google OAuth provider
- Session-based authentication with PostgreSQL adapter
- User roles: ADMIN, DENTIST, ASSISTANT
- Protected routes use Next.js middleware

### Database Architecture
- **PostgreSQL** with Prisma ORM
- **Key entities**: User, Patient, Treatment, Appointment, Receipt, Procedure
- **Relationships**: 
  - User → has many → Patients, Treatments, Appointments
  - Patient → has many → Treatments, Appointments
  - Treatment → has many → TreatmentItems (procedures per treatment)
  - Treatment → has one → Receipt

### Application Structure

#### Route Organization
- `src/app/(auth)/` - Authentication pages (login, register)
- `src/app/(dashboard)/` - Protected dashboard pages
- `src/app/api/` - API routes for CRUD operations

#### Component Organization
- `src/components/ui/` - Base UI components (shadcn/ui)
- `src/components/layout/` - App layout components (header, sidebar, footer)
- `src/components/patients/` - Patient management components
- `src/components/treatments/` - Treatment recording components including interactive tooth chart
- `src/components/appointments/` - Appointment scheduling components
- `src/components/receipts/` - Receipt generation and QR code components

#### Business Logic Layer
- `src/services/` - Business logic services for each domain
- `src/hooks/` - Custom React hooks for data fetching
- `src/lib/validations/` - Zod schemas for form validation
- `src/types/` - TypeScript type definitions

### Key Features

#### Interactive Tooth Chart
Located in `src/components/treatments/tooth-chart.tsx` - Visual tooth selection for treatment recording with click-to-select functionality.

#### Receipt System
- PDF generation with treatment details
- QR code integration for appointment booking
- Email delivery capability
- Located in `src/components/receipts/` and `src/lib/pdf.ts`

#### Appointment Reminders
- Automated reminder system using cron jobs
- Email notifications 24 hours before appointments
- Reminder tracking in database

## Technology Stack

### Frontend
- **Next.js 14** with App Router and Turbopack
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **React Hook Form** with Zod validation

### Backend
- **Next.js API Routes** for backend logic
- **Prisma** ORM with PostgreSQL
- **NextAuth.js** for authentication

### External Integrations
- **@calcom/embed-react** for calendar functionality
- **Resend** for email services (configured in `src/lib/email.ts`)
- **QR code generation** for receipts

## Environment Variables Required

```env
DATABASE_URL="postgresql://user:password@localhost:5432/dental_mvp"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
RESEND_API_KEY="your-resend-api-key"
FROM_EMAIL="noreply@yourdomain.com"
```

## Database Schema Notes

- Uses Prisma with PostgreSQL
- All models use `cuid()` for primary keys
- Soft deletes implemented via `isActive` boolean fields
- Comprehensive audit logging in `AuditLog` model
- Treatment items link procedures to specific teeth (toothNumbers array)

## Common Development Patterns

### API Routes
- Follow RESTful conventions: GET, POST for collections; GET, PUT, DELETE for individual resources
- Use Zod schemas for request validation
- Implement proper error handling and status codes
- Authentication checks using NextAuth session

### Form Handling
- React Hook Form with Zod validation schemas
- Form schemas located in `src/lib/validations/`
- Consistent error handling and user feedback

### Data Fetching
- Custom hooks in `src/hooks/` for API interactions
- SWR-like patterns for caching and revalidation
- Proper loading states and error handling

## Special Considerations

- The project uses Next.js 15 with React 19 (cutting-edge versions)
- Prisma seed script uses tsx for TypeScript execution
- Turbopack enabled for faster development builds
- Component library follows shadcn/ui conventions
- Authentication flow requires Google OAuth setup