# Changelog

All notable changes to the SmileTrace - Dental Management Platform will be documented in this file.

## [0.5.0] - 02-11-2025 to 29-11-2025

### Added

#### 🦷 Dental Chart System
- **Initial Dental Chart Implementation**: Added new Prisma tables for dental chart functionality ([@id18-v](https://github.com/id18-v) in [#31](https://github.com/id18-v/smiletrace/pull/31))
  - Database schema for storing tooth-level information per user
  - User-to-dental-chart relationships
  - Tooth numbering system (1-32 Universal System)

- **Custom Dental Chart Enhancement**: Made dental chart more customizable ([@id18-v](https://github.com/id18-v) in [#32](https://github.com/id18-v/smiletrace/pull/32))
  - Feature to choose between different users
  - Ability to make changes to individual teeth
  - Custom status assignment per tooth
  - Notes field for detailed information

- **Dental Chart UI with Theme Support**: Complete UI for dental chart visualization ([@id18-v](https://github.com/id18-v) in [#33](https://github.com/id18-v/smiletrace/pull/33))
  - Color-coded tooth status indicators
  - Theme toggle support (light/dark mode)
  - Interactive tooth selection interface
  - Visual representation of all 32 teeth

- **Improved User Selection Menu**: Better method for finding users ([@id18-v](https://github.com/id18-v) in [#34](https://github.com/id18-v/smiletrace/pull/34))
  - Redesigned user selection interface
  - Enhanced search/filter functionality
  - Faster patient lookup

- **Dental Chart Page Enhancement**: Improved dental chart page for better usage ([@id18-v](https://github.com/id18-v) in [#35](https://github.com/id18-v/smiletrace/pull/35))
  - Refactored page layout
  - Enhanced navigation and workflow
  - Optimized page performance

- **View Page Integration**: Added dental chart to person view page ([@id18-v](https://github.com/id18-v) in [#36](https://github.com/id18-v/smiletrace/pull/36))
  - Inline dental chart display
  - Quick access to tooth history
  - Visual tooth status overview

- **Calendar Booking Integration**: Added calendar for booking in appointments page ([@id18-v](https://github.com/id18-v) in [#37](https://github.com/id18-v/smiletrace/pull/37))
  - Interactive calendar interface
  - Appointment booking workflow
  - Integration with patient dental history

#### ⚙️ Settings & User Management
- **User Page Modifications**: Improvements to the user page ([@id18-v](https://github.com/id18-v) in [#22](https://github.com/id18-v/smiletrace/pull/22))
- **Email Settings**: New settings page for email configuration ([@id18-v](https://github.com/id18-v) in [#21](https://github.com/id18-v/smiletrace/pull/21))

### Changed
- **Clinic Settings Simplification**: Simplified clinic settings page for better user experience ([@id18-v](https://github.com/id18-v) in [#20](https://github.com/id18-v/smiletrace/pull/20))

---

## [0.4.0] - 02-11-2025

### Added

#### 💳 Digital Receipts & Payment Tracking
- **Receipt Generation System**: Complete digital receipt generation system ([@id18-v](https://github.com/id18-v))
  - Automatic unique receipt number generation
  - Automatic totals calculation with taxes and discounts
  - Professional template with clinic header and logo
  - Detailed itemization of procedures and costs

- **QR Code Integration**: QR code integration in receipts ([@id18-v](https://github.com/id18-v))
  - QR code generation with appointment booking links
  - QR codes for receipt verification
  - Patient portal links
  - Download QR as image
  - Print-friendly formatting

- **PDF Generation**: PDF generation system for receipts ([@id18-v](https://github.com/id18-v))
  - Export receipts to professional PDF format
  - Include QR code in PDF
  - Print optimization
  - Batch generation
  - Send PDF as email attachment

- **Payment Tracking Dashboard**: Dashboard for payment tracking ([@id18-v](https://github.com/id18-v))
  - Outstanding balances view
  - Complete payment history
  - Daily collection reports
  - Payment recording for receipts

#### 👥 Enhanced Patient Management
- **Advanced Patient Service**: Extended services for patient management ([@id18-v](https://github.com/id18-v))
  - Complete patient registration with multi-step form
  - Detailed medical history
  - Medical insurance information
  - Emergency contacts
  - Duplicate record merging

- **Patient Search & Filtering**: Advanced patient search system ([@id18-v](https://github.com/id18-v))
  - Real-time search
  - Advanced filters (age, last visit, etc.)
  - Search by name/phone/email
  - Search suggestions
  - Quick access to recent patients

- **Patient Profile Page**: Complete patient profile page ([@id18-v](https://github.com/id18-v))
  - Patient information overview
  - Medical history timeline
  - Treatment history
  - Upcoming appointments
  - Summary card with quick edit

- **Data Import/Export**: Patient data management ([@id18-v](https://github.com/id18-v))
  - CSV patient import
  - Patient data export
  - Patient records backup
  - Data validation on import
  - Bulk operations

#### ⚙️ Clinic Configuration & User Management
- **Clinic Settings System**: Complete clinic configuration system ([@id18-v](https://github.com/id18-v))
  - Clinic information form
  - Address and contact details
  - Tax and license numbers
  - Clinic logo upload
  - Configurable working hours
  - Holiday calendar

- **User Management**: User administration system ([@id18-v](https://github.com/id18-v))
  - System users list
  - Add/edit/deactivate users
  - Role and permission assignment
  - Permission matrix
  - Password reset

- **Email Template Editor**: Email template editor ([@id18-v](https://github.com/id18-v))
  - Appointment confirmation template
  - Reminder email template
  - Receipt template
  - Variables/placeholders system
  - Email functionality testing

- **Notification System**: Notification configuration system ([@id18-v](https://github.com/id18-v))
  - Reminder timing configuration
  - Email/SMS toggle
  - Notification preferences
  - Special hours settings
  - Break time configuration

- **System Utilities**: System utilities and maintenance ([@id18-v](https://github.com/id18-v))
  - Database backup interface
  - Audit log viewer
  - System health check
  - Data cleanup tools

### Improved
- **Performance**: Optimizations for search and data display
- **Validation**: Extended validation for forms (phone, email, SSN, insurance)
- **Responsive Design**: Improvements for mobile experience
- **User Experience**: More intuitive interface for all modules

### New Files Created
```
src/
├── services/
│   ├── receipt.service.ts         # Receipt generation service
│   ├── patient.service.ts         # Extended patient service
│   └── settings.service.ts        # Clinic settings service
├── lib/
│   ├── qr.ts                      # QR code generation
│   ├── pdf.ts                     # PDF generation
│   ├── email-templates.ts         # Email templates
│   └── validations/
│       └── patient.ts             # Patient validations
├── components/
│   ├── receipts/
│   │   ├── receipt-template.tsx   # Receipt template
│   │   ├── receipt-preview.tsx    # Receipt preview
│   │   └── qr-code.tsx           # QR code component
│   ├── patients/
│   │   ├── patient-form.tsx       # Extended patient form
│   │   ├── patient-list.tsx       # Patient list
│   │   ├── patient-search.tsx     # Patient search
│   │   └── patient-card.tsx       # Patient info card
│   ├── settings/
│   │   └── clinic-form.tsx        # Clinic settings form
│   └── users/
│       ├── user-form.tsx          # User form
│       ├── user-list.tsx          # User list
│       ├── role-selector.tsx      # Role selector
│       └── user-permissions.tsx   # Permissions
├── app/
│   ├── api/
│   │   ├── receipts/
│   │   │   ├── route.ts           # Receipt CRUD
│   │   │   └── [id]/
│   │   │       ├── pdf/route.ts   # PDF generation
│   │   │       ├── payment/route.ts
│   │   │       └── email/route.ts
│   │   ├── patients/
│   │   │   ├── search/route.ts    # Advanced search
│   │   │   ├── import/route.ts    # CSV import
│   │   │   └── [id]/
│   │   │       ├── medical/route.ts
│   │   │       └── summary/route.ts
│   │   └── settings/
│   │       ├── route.ts           # General settings
│   │       ├── clinic/route.ts    # Clinic info
│   │       ├── working-hours/route.ts
│   │       └── notifications/route.ts
│   └── (dashboard)/
│       ├── payments/page.tsx      # Payments dashboard
│       ├── patients/
│       │   └── [id]/page.tsx      # Patient profile
│       ├── settings/page.tsx      # Settings page
│       └── users/page.tsx         # User management
└── hooks/
    └── use-patients.ts            # Patient custom hooks
```

---

## [1.0.0] - 28-10-2025

### 🚀 Production Deployment
- **Production Launch**: SmileTrace application deployed to production ([@id18-v](https://github.com/id18-v) in [#19](https://github.com/id18-v/smiletrace/pull/19))
  - Cloud platform deployment
  - Production environment variables configuration
  - Cloud PostgreSQL database setup

### Fixed
- **Next.js 15 Compatibility**: Update for Next.js 15 compatibility ([@id18-v](https://github.com/id18-v) in [eb52ff8](https://github.com/id18-v/smiletrace/commit/eb52ff8))
  - Implemented `async params` for dynamic routes
  - Added `Suspense boundaries` for async component loading
- **Build Process**: Added `prisma generate` to build and postinstall process for more stable deployment ([@id18-v](https://github.com/id18-v) in [29f7f47](https://github.com/id18-v/smiletrace/commit/29f7f47))

---

## [0.2.0] - 02-10-2025

### Added
- **Patient Management**: Complete patient management system ([@id18-v](https://github.com/id18-v) in [#17](https://github.com/id18-v/smiletrace/pull/17))
  - Patient creation and editing pages
  - Detailed patient information form

- **Cal.com Integration**: Integration with Cal.com appointment system ([@id18-v](https://github.com/id18-v) in [#16](https://github.com/id18-v/smiletrace/pull/16))
  - Automatic database synchronization with Cal.com
  - Real-time appointment management

- **Appointment System**: Complete appointment system ([@id18-v](https://github.com/id18-v) in [#15](https://github.com/id18-v/smiletrace/pull/15))
  - Create and manage appointments
  - Intuitive appointment interface
  - Complete appointment management functionality

### Changed
- **Header Layout**: Modified header layout to display logged-in user name ([@CristianProdius](https://github.com/CristianProdius) in [#14](https://github.com/id18-v/smiletrace/pull/14))
  - Improved user experience
  - More intuitive design for active account identification

---

## [0.1.0] - 04-10-2025

### Added
- **Authentication System**: Complete authentication system ([@CristianProdius](https://github.com/CristianProdius) in [398ffbc](https://github.com/id18-v/smiletrace/commit/398ffbc))
  - Login page with validation
  - Registration page for new users
  - NextAuth.js integration for secure sessions

- **Main Dashboard**: Platform main page
  - Dashboard with general statistics
  - Intuitive navigation between sections
  - Responsive design

- **Project Documentation**: 
  - Complete README.md with setup instructions
  - CLAUDE.md for development guide
  - Detailed technical documentation

### Improved
- **UX Improvements**: Added meaningful placeholders in forms
- **Developer Experience**: Completed Copilot suggestions for improved productivity ([@id18-v](https://github.com/id18-v) in [d64c397](https://github.com/id18-v/smiletrace/commit/d64c397))

---

## [0.0.1] - 11-09-2025

### Added
- **Initial Project Setup**: Initial project configuration
  - Next.js 14 with App Router
  - TypeScript configuration
  - Tailwind CSS and shadcn/ui
  - Prisma ORM for PostgreSQL
  - ESLint and PostCSS configuration
  - Git repository initialization

- **Core Structure**: Application base structure
  - Organized folder structure
  - API routes setup
  - Components directory
  - Initial Prisma schema

---

## 🚀 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Backend
- **Next.js API Routes** - Backend API
- **Prisma** - ORM for database
- **PostgreSQL** - Database
- **NextAuth.js** - Authentication

### Additional Services
- **@react-pdf/renderer** - PDF generation
- **qrcode** - QR code generation
- **Resend** - Email service
- **node-cron** - Scheduled tasks
- **date-fns** - Date utilities
- **Cal.com** - Appointment system

---

## 👥 Contributors

- [@id18-v](https://github.com/id18-v) - Lead Developer
- [@CristianProdius](https://github.com/CristianProdius) - Developer

---

## 📝 Types of Changes

- **Added** - For new features
- **Changed** - For changes in existing functionality
- **Deprecated** - For features that will be removed
- **Removed** - For removed features
- **Fixed** - For bug fixes
- **Security** - For security vulnerabilities

---

## 🔗 Useful Links

- [GitHub Repository](https://github.com/id18-v/smiletrace)
- [Issues](https://github.com/id18-v/smiletrace/issues)
- [Pull Requests](https://github.com/id18-v/smiletrace/pulls)
- [Documentation](https://github.com/id18-v/smiletrace/blob/master/README.md)

---

*For more details about each version, see [commit history](https://github.com/id18-v/smiletrace/commits/master) or [releases page](https://github.com/id18-v/smiletrace/releases).*