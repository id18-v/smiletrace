# Dental Management Platform MVP

A comprehensive dental practice management system built with Next.js 14, TypeScript, and PostgreSQL. This platform enables dentists to manage patients, record treatments, generate receipts, and handle appointments with automated reminders.

## 🦷 Project Overview

This MVP allows dental practices to:

- Manage patient records and treatment history
- Select teeth using an interactive dental chart
- Record procedures and associated costs
- Generate PDF receipts with QR codes
- Send receipts via email
- Schedule appointments with automated reminders
- Track treatment plans and recommendations

## 🚀 Tech Stack

### Frontend

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - Component library
- **React Hook Form** - Form handling
- **Zod** - Schema validation

### Backend

- **Next.js API Routes** - Backend API
- **Prisma** - ORM for database
- **PostgreSQL** - Database
- **NextAuth.js** - Authentication

### Additional Libraries

- **@react-pdf/renderer** - PDF generation
- **qrcode** - QR code generation
- **Resend** - Email service
- **node-cron** - Scheduled tasks
- **date-fns** - Date utilities

## 📁 Project Structure

```
dental-mvp/
├── src/                    # All application source code
│   ├── app/               # Next.js 14 app directory
│   │   ├── api/          # API routes
│   │   ├── (auth)/       # Authentication pages (login, register)
│   │   ├── (dashboard)/  # Protected dashboard pages
│   │   ├── layout.tsx    # Root layout
│   │   ├── page.tsx      # Home page
│   │   └── globals.css   # Global styles
│   ├── components/       # React components
│   ├── lib/             # Utility functions and configurations
│   ├── services/        # Business logic layer
│   ├── types/           # TypeScript type definitions
│   ├── hooks/           # Custom React hooks
│   └── config/          # Application configuration
├── prisma/              # Database schema and migrations
├── public/              # Static assets
├── .env.local          # Environment variables (not in git)
└── package.json        # Dependencies and scripts
```

### Detailed Structure Breakdown

#### 🔌 API Routes (`src/app/api/`)

```
api/
├── auth/[...nextauth]/   # NextAuth.js authentication
├── patients/             # Patient CRUD operations
│   ├── route.ts         # GET all, POST new patient
│   └── [id]/route.ts    # GET, PUT, DELETE by ID
├── treatments/          # Treatment records
├── appointments/        # Appointment management
│   └── reminders/       # Reminder scheduling
├── receipts/            # Receipt generation
│   └── [id]/pdf/        # PDF generation endpoint
└── procedures/          # Procedure catalog
```

#### 🎨 Components (`src/components/`)

```
components/
├── ui/                  # Base UI components (button, card, etc.)
├── layout/              # App layout components
│   ├── header.tsx      # Top navigation
│   ├── sidebar.tsx     # Side navigation
│   └── footer.tsx      # Footer
├── patients/           # Patient-related components
│   ├── patient-list.tsx    # Patient listing table
│   ├── patient-form.tsx    # Add/edit patient form
│   └── patient-card.tsx    # Patient info display
├── treatments/         # Treatment components
│   ├── tooth-chart.tsx     # Interactive tooth selector
│   ├── procedure-selector.tsx
│   └── treatment-form.tsx
├── appointments/       # Appointment components
└── receipts/          # Receipt components
```

#### 📚 Libraries (`src/lib/`)

```
lib/
├── auth.ts            # NextAuth configuration
├── db.ts             # Prisma client instance
├── email.ts          # Email service setup
├── pdf.ts            # PDF generation utilities
├── qr.ts             # QR code generation
├── utils.ts          # Helper functions
└── validations/      # Zod schemas
    ├── patient.ts
    ├── treatment.ts
    └── appointment.ts
```

#### 🔧 Services (`src/services/`)

Business logic layer that handles complex operations:

```
services/
├── patient.service.ts      # Patient operations
├── treatment.service.ts    # Treatment recording
├── appointment.service.ts  # Appointment logic
├── receipt.service.ts      # Receipt generation
└── reminder.service.ts     # Reminder scheduling
```

## 🏁 Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database
- Email service account (Resend)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/dental-mvp.git
   cd dental-mvp
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Update `.env.local` with your values:

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/dental_mvp"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   RESEND_API_KEY="your-resend-api-key"
   FROM_EMAIL="noreply@yourdomain.com"
   ```

4. **Set up the database**

   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

5. **Run the development server**

   ```bash
   pnpm run dev
   ```

6. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔑 Key Features Explained

### 1. **Interactive Tooth Chart**

Located in `src/components/treatments/tooth-chart.tsx`

- Visual representation of all 32 adult teeth
- Click to select teeth for treatment
- Color coding for selected/treated teeth
- Hover information display

### 2. **Treatment Recording Flow**

1. Select patient from list
2. Click on tooth chart to select teeth
3. Choose procedures from catalog
4. Enter costs and notes
5. Save treatment record

### 3. **Receipt Generation**

- Automatic PDF generation with treatment details
- QR code containing appointment booking link
- Email delivery option
- Print-friendly format

### 4. **Appointment Reminders**

- Automated reminder system using cron jobs
- Sends reminders 24 hours before appointment
- Email/SMS capability (SMS requires additional setup)

## 👥 Team Development Guide

### Development Workflow

1. Each developer works on their assigned module
2. Create feature branches: `feature/module-name`
3. Make pull requests for code review
4. Merge to `main` after approval

### Module Ownership

- **Frontend Lead**: UI/UX, components, styling
- **Backend Lead**: API, database, authentication
- **Feature Dev 1**: Receipts, QR codes, PDF generation
- **Feature Dev 2**: Appointments, reminders, notifications
- **Full-Stack**: Integration, testing, bug fixes

### API Endpoint Reference

#### Authentication

- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout
- `GET /api/auth/session` - Get current session

#### Patients

- `GET /api/patients` - List all patients
- `POST /api/patients` - Create new patient
- `GET /api/patients/[id]` - Get patient details
- `PUT /api/patients/[id]` - Update patient
- `DELETE /api/patients/[id]` - Delete patient

#### Treatments

- `GET /api/treatments` - List treatments
- `POST /api/treatments` - Create treatment record
- `GET /api/treatments/[id]` - Get treatment details

#### Appointments

- `GET /api/appointments` - List appointments
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/[id]` - Update appointment
- `POST /api/appointments/reminders` - Trigger reminder check

#### Receipts

- `POST /api/receipts` - Generate receipt
- `GET /api/receipts/[id]/pdf` - Get PDF receipt

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm run test:watch

# Run e2e tests
pnpm run test:e2e
```

## 📝 Database Schema Overview

### Core Tables

- **User** - System users (dentists, assistants)
- **Patient** - Patient records
- **Treatment** - Treatment sessions
- **TreatmentItem** - Individual procedures per treatment
- **Appointment** - Scheduled appointments
- **Receipt** - Generated receipts
- **Procedure** - Procedure catalog

### Relationships

- User → has many → Patients, Treatments, Appointments
- Patient → has many → Treatments, Appointments
- Treatment → has many → TreatmentItems
- Treatment → has one → Receipt

## 🚀 Deployment

### Production Build

```bash
pnpm run build
pnpm start
```

### Environment Variables for Production

- Set all environment variables in your hosting platform
- Ensure `DATABASE_URL` points to production database
- Update `NEXTAUTH_URL` to your domain
- Use strong `NEXTAUTH_SECRET`

### Recommended Platforms

- **Vercel** - For Next.js application
- **Railway/Supabase** - For PostgreSQL database
- **Resend** - For email service

## 🐛 Troubleshooting

### Common Issues

1. **Database connection errors**

   - Check DATABASE_URL format
   - Ensure PostgreSQL is running
   - Verify credentials

2. **Authentication issues**

   - Regenerate NEXTAUTH_SECRET
   - Check callback URLs
   - Clear browser cookies

3. **Email not sending**
   - Verify RESEND_API_KEY
   - Check FROM_EMAIL domain
   - Review email logs

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui Components](https://ui.shadcn.com)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is proprietary and confidential.

---

For questions or support, contact the development team.
