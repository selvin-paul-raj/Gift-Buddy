# 🎁 GiftBuddy# 🎁 GiftBuddy# 🎁 GiftBuddy - Birthday Event Management App



> **Celebrate Together, Split Fairly, Keep Everyone Happy**



A modern, feature-rich Progressive Web App (PWA) for managing birthday celebrations and splitting costs fairly among friends and family.A beautiful, modern web app for managing birthday celebrations, splitting costs fairly, and tracking payments.**Status**: 🟢 Core Backend Complete | UI Complete | Production Ready



**Status**: 🟢 **Production Ready** | ✅ All Features Complete | 📱 iOS & Android Compatible



---## 🚀 Quick StartA beautiful, modern web app for managing birthday celebrations, splitting costs fairly, and tracking payments.



## 📋 Table of Contents



- [Features](#-features)### Prerequisites---

- [Tech Stack](#-tech-stack)

- [Installation](#-installation--setup)- Node.js 18+

- [Project Structure](#-project-structure)

- [Usage](#-usage)- npm or yarn## 🎯 What It Does

- [Configuration](#-configuration)

- [Deployment](#-deployment)- Supabase account

- [PWA Features](#-pwa-features)

- [API Reference](#-api-reference)### For Admins

- [Environment Variables](#-environment-variables)

- [Troubleshooting](#-troubleshooting)### Installation- ✅ Create birthday events with multiple gifts

- [Contributing](#-contributing)

- [License](#-license)- ✅ Auto-split costs equally among participants



---```bash- ✅ Track real-time payment status



## 🎯 Features# Install dependencies- ✅ See summary of collections vs pending



### For Event Organizers (Admin)npm install- ✅ Mark events as completed

- ✅ **Create Birthday Events** - Set date, guest list, and event details

- ✅ **Multiple Gift Management** - Add multiple gift options with costs- ✅ Archive event records

- ✅ **Auto Cost Splitting** - Automatic equal split calculation

- ✅ **Real-time Payment Tracking** - Monitor who paid and who's pending# Set up environment variables

- ✅ **Payment Collection Summary** - See total collected vs. total required

- ✅ **Guest Management** - Add/remove participants easilycp .env.example .env.local### For Users

- ✅ **Event Analytics** - View collection progress and payment status

- ✅ **Mark as Completed** - Archive events when done- ✅ See upcoming birthday events

- ✅ **UPI Payment Links** - Generate UPI links for payments

- ✅ **Event History** - Access past events anytime# Add your Supabase credentials to .env.local- ✅ View gift details and split amount



### For Participants (Users)- ✅ Mark payment with one click

- ✅ **View Upcoming Events** - See all birthday celebrations

- ✅ **Gift Details** - See what gifts are being collected for# Run development server- ✅ See payment history

- ✅ **Split Amount Display** - Know exactly how much to pay

- ✅ **One-Click Payment** - Mark payment instantlynpm run dev- ✅ Track UPI details

- ✅ **Payment History** - Track payments you've made

- ✅ **UPI Integration** - Link UPI details for easy payments```

- ✅ **Event Reminders** - Stay updated on upcoming events

---

### Technical Features

- 🌐 **Progressive Web App (PWA)** - Works offline, installable on all devicesVisit `http://localhost:3000`

- 📱 **Mobile-First Design** - Perfect on phones, tablets, and desktops

- 🔐 **Secure Authentication** - Magic link authentication via email## � Quick Start (5 minutes)

- 🔒 **Row-Level Security (RLS)** - Data protected with Supabase RLS policies

- 💰 **Indian Currency Support** - ₹ formatting with proper localization## 📁 Project Structure

- 🚀 **Lightning Fast** - Optimized performance, lazy loading

- 🎨 **Beautiful UI** - Modern design system with dark mode support- **Frontend:** [Next.js 14](https://nextjs.org), [React 18](https://react.dev), [TypeScript](https://www.typescriptlang.org)

- 📡 **Real-time Updates** - Instant data synchronization

- 🔄 **Service Worker** - Offline support with smart caching```- **Backend & DB:** [Supabase](https://supabase.com) (Postgres)

- 🎯 **SEO Optimized** - Proper metadata for search engines

- 📊 **Analytics Ready** - Built for Google Analytics integrationapp/                  # Next.js app directory- **UI & Styling:** [TailwindCSS](https://tailwindcss.com), [ShadCN/UI](https://ui.shadcn.com)



---├── (root)/           # Protected routes- **State Management:** Server Components + React Hooks



## 🛠 Tech Stack│   ├── dashboard/    # User dashboard- **Other:** [Sonner](https://sonner.emilkowal.ski) for toasts, [Lucide Icons](https://lucide.dev)



### Frontend│   └── admin/        # Admin event management

- **Framework**: [Next.js 16](https://nextjs.org) with App Router & Turbopack

- **Language**: [TypeScript](https://www.typescriptlang.org) for type safety├── auth/             # Authentication pages---

- **UI Library**: [React 19](https://react.dev) with Server Components

- **Styling**: [TailwindCSS](https://tailwindcss.com) + [CSS Variables](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)└── page.tsx          # Landing page

- **Components**: [shadcn/ui](https://ui.shadcn.com) - Customizable components

- **Icons**: [Lucide React](https://lucide.dev) - 1000+ icons## 📦 Installation & Setup

- **Notifications**: [Sonner](https://sonner.emilkowal.ski) - Toast notifications

- **Date Handling**: [date-fns](https://date-fns.org) - Date utilitiescomponents/           # Reusable React components



### Backend & Databaselib/                  # Utilities and supabase client1. **Clone the repository**

- **Backend**: [Supabase](https://supabase.com) - PostgreSQL + Realtime

- **Authentication**: [Supabase Auth](https://supabase.com/docs/guides/auth) - Magic Link (Email)public/               # Static assets   ```bash

- **Database**: PostgreSQL with Row-Level Security

- **Real-time**: Supabase Realtime subscriptionsdb/                   # Database migrations   git clone https://github.com/tanialapalelo/treatsplit.git

- **File Storage**: Supabase Storage (for future features)

```   cd treatsplit

### PWA & Offline

- **Service Worker**: Custom SW.js with caching strategies   ```

- **Manifest**: Web App Manifest for installability

- **Offline Support**: Network-first API, cache-first assets## 🎯 Key Features

- **Push Notifications**: Ready for Web Push API

2. **Install dependencies**

### DevOps & Build

- **Package Manager**: npm- ✅ Create birthday events with gifts   ```bash

- **Build Tool**: Next.js Turbopack (production)

- **Deployment**: Vercel-ready (or Docker/Node.js)- ✅ Auto-split costs among participants   npm install

- **CI/CD**: GitHub Actions ready

- **Monitoring**: Sentry-ready, Google Analytics-ready- ✅ Track payment status in real-time   # or



---- ✅ Vote on gifts and food   yarn install



## 📦 Installation & Setup- ✅ Beautiful dark/light mode support   ```



### Prerequisites- ✅ Mobile-optimized UI

- **Node.js**: v18.0.0 or higher

- **npm**: v9.0.0 or higher (or yarn/pnpm)3. **Set up environment variables**  

- **Supabase Account**: Free tier at [supabase.com](https://supabase.com)

- **Git**: For cloning the repository## 🛠️ Available Commands   Create a `.env.local` file with:



### Step 1: Clone Repository   ```bash

```bash

git clone https://github.com/yourusername/giftbuddy.git```bash   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url

cd giftbuddy

```npm run dev      # Start development server   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key



### Step 2: Install Dependenciesnpm run build    # Build for production   ```

```bash

npm installnpm start        # Start production server

```

npm run lint     # Run ESLint4. **Run the development server**

### Step 3: Setup Environment Variables

Create a `.env.local` file in the root directory:```   ```bash



```env   npm run dev

# Supabase Configuration

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co## 📦 Tech Stack   # or

NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   yarn dev



# App Configuration- **Frontend:** Next.js 14, React 19, TypeScript   ```

NEXT_PUBLIC_APP_NAME=GiftBuddy

NEXT_PUBLIC_APP_URL=http://localhost:3000- **Styling:** Tailwind CSS, shadcn/ui

```

- **Backend:** Supabase (PostgreSQL)5. **Visit**

Get these values from your [Supabase Dashboard](https://app.supabase.com):

1. Go to **Settings** → **API**- **Auth:** Supabase Auth (Magic Link)   ```

2. Copy `Project URL` and `anon public key`

3. Copy `service_role key` (keep this secret!)- **Deployment:** Vercel-ready   http://localhost:3000



### Step 4: Setup Database   ```



1. Go to your Supabase project## 📄 License

2. Open **SQL Editor**

3. Run the migration files in `db/` folder in order:## 📜 License

   ```sql

   -- Run each file in SQL EditorMITMIT © 2025 Selvin PaulRaj K

   -- Check database schema to verify setup

   ```

4. Enable RLS on all tables
5. Configure RLS policies (see Security section)

### Step 5: Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
giftbuddy/
├── app/                              # Next.js App Router
│   ├── page.tsx                      # Landing page
│   ├── layout.tsx                    # Root layout with PWA config
│   ├── globals.css                   # Global styles
│   ├── (root)/                       # Protected routes layout
│   │   ├── layout.tsx
│   │   ├── dashboard/                # User dashboard
│   │   │   ├── page.tsx
│   │   │   └── _components/
│   │   └── admin/                    # Admin dashboard
│   │       ├── page.tsx
│   │       ├── event/
│   │       │   ├── create/page.tsx   # Create event
│   │       │   └── [id]/page.tsx     # Event details
│   │       └── _components/
│   └── auth/                         # Authentication pages
│       ├── login/page.tsx
│       ├── sign-up/page.tsx
│       ├── confirm/page.tsx
│       └── error/page.tsx
│
├── components/                       # Reusable React Components
│   ├── forms/
│   │   ├── AdminCreateEventForm.tsx
│   │   ├── LoginForm.tsx
│   │   └── SignUpForm.tsx
│   ├── shared/
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── ui/                           # shadcn/ui components
│   ├── pwa-install-prompt.tsx        # PWA installation UI
│   ├── auth-button.tsx
│   └── theme-switcher.tsx
│
├── lib/                              # Utilities & Helpers
│   ├── supabase/
│   │   ├── client.ts                 # Supabase client
│   │   └── server.ts                 # Server-side Supabase
│   ├── actions/                      # Server actions
│   ├── queries/                      # Database queries
│   ├── types/                        # TypeScript types
│   ├── pwa.ts                        # PWA utilities
│   ├── currency.ts                   # Currency formatting
│   └── utils.ts                      # Helper functions
│
├── public/                           # Static assets
│   ├── manifest.json                 # PWA manifest
│   ├── sw.js                         # Service Worker
│   ├── offline.html                  # Offline fallback
│   ├── gift.svg                      # SVG icon
│   ├── gift.png                      # PNG icon
│   └── favicon.ico
│
├── db/                               # Database migrations
│   ├── migration-new-schema.sql
│   ├── fix-rls-complete.sql
│   └── other-migrations.sql
│
├── supabase/                         # Supabase config
│   └── migrations/
│
├── next.config.ts                    # Next.js configuration
├── tailwind.config.ts                # TailwindCSS config
├── tsconfig.json                     # TypeScript config
├── postcss.config.mjs                # PostCSS config
├── components.json                   # shadcn/ui config
├── package.json                      # Dependencies
└── .env.local                        # Environment variables (git ignored)
```

---

## 🚀 Usage

### For Admin Users

#### 1. Create an Event
1. Log in as admin
2. Go to **Admin Dashboard**
3. Click **Create Event**
4. Fill in event details:
   - Event name (e.g., "Priya's Birthday")
   - Date and time
   - List of participants
5. Add gifts with costs
6. Review and create

#### 2. Manage Event
1. View all events in **Admin Dashboard**
2. Click on an event to see details
3. Monitor payment status
4. Mark payments as received
5. Mark event as completed when done

### For Regular Users

#### 1. Sign Up
1. Click **Sign Up**
2. Enter your email
3. Check email for magic link
4. Click link to create password
5. Done! You're logged in

#### 2. View Events & Pay
1. Go to **Dashboard**
2. See all upcoming birthday events
3. Click event for details
4. See your split amount
5. Click **Mark as Paid** when done
6. View payment history

---

## ⚙️ Configuration

### Next.js Configuration
Edit `next.config.ts` for:
- Security headers
- Image optimization
- PWA settings
- Environment variables

### TailwindCSS
Customize colors and themes in `tailwind.config.ts`:
```typescript
colors: {
  background: 'hsl(var(--background))',
  card: 'hsl(var(--card))',
  primary: 'hsl(var(--primary))',
  // ... more colors
}
```

### Supabase
Configure in Supabase Dashboard:
- Enable email authentication
- Setup email templates
- Configure RLS policies
- Setup realtime subscriptions

---

## 🌐 Deployment

### Option 1: Vercel (Recommended - 2 minutes)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Follow prompts to connect your repository
```

### Option 2: Docker
```bash
# Build Docker image
docker build -t giftbuddy .

# Run container
docker run -p 3000:3000 giftbuddy
```

### Option 3: Traditional Node.js Server
```bash
# Build for production
npm run build

# Start server
npm start
```

### Pre-Deployment Checklist
- [ ] Environment variables configured in production
- [ ] Supabase RLS policies enabled
- [ ] HTTPS certificate installed
- [ ] Custom domain configured
- [ ] Database backups enabled
- [ ] Monitoring setup (Sentry, Analytics)
- [ ] Email configuration verified
- [ ] PWA manifest validated

---

## 📱 PWA Features

### Installation

#### Android
1. Open GiftBuddy in Chrome/Edge
2. Tap menu (⋮) → "Install app"
3. Confirm installation
4. App appears on home screen

#### iOS
1. Open GiftBuddy in Safari
2. Tap Share → "Add to Home Screen"
3. Choose name and add
4. App appears on home screen

#### Desktop (Windows/Mac/Linux)
1. Open GiftBuddy in Chrome/Edge
2. Click install icon in address bar
3. Confirm installation
4. App launches as window

### Offline Support
- **Automatic**: App caches data on first visit
- **Works Offline**: View cached events and data
- **Sync on Connect**: Auto-syncs when connection restored
- **Offline Page**: Shows friendly message if offline

### Service Worker
- **Cache Strategy**: Network-first for API, cache-first for assets
- **Background Sync**: Queue payments when offline
- **Push Notifications**: Ready for implementation

---

## 🔌 API Reference

### Authentication Endpoints
```typescript
// Sign up
POST /auth/sign-up
{ email: string; password: string }

// Login
POST /auth/login
{ email: string; password: string }

// Logout
POST /auth/logout

// Reset password
POST /auth/forgot-password
{ email: string }
```

### Events Endpoints
```typescript
// Get all events
GET /api/events

// Get event details
GET /api/events/:id

// Create event (admin only)
POST /api/events
{ name: string; date: string; participants: string[] }

// Update event
PUT /api/events/:id

// Delete event
DELETE /api/events/:id
```

### Payments Endpoints
```typescript
// Mark payment
POST /api/payments/mark
{ eventId: string; userId: string }

// Get payment status
GET /api/payments/:eventId

// Get user payments
GET /api/payments/user/:userId
```

---

## 🔑 Environment Variables

### Required
```env
NEXT_PUBLIC_SUPABASE_URL=          # Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # Supabase anon key
SUPABASE_SERVICE_ROLE_KEY=         # Supabase service role key
```

### Optional
```env
NEXT_PUBLIC_APP_NAME=GiftBuddy     # App name (for PWA)
NEXT_PUBLIC_APP_URL=               # Production app URL
NEXT_PUBLIC_ANALYTICS_ID=          # Google Analytics ID
NEXT_PUBLIC_SENTRY_DSN=            # Sentry error tracking
```

### Local Development
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🔒 Security

### Authentication
- **Magic Link**: Secure email-based authentication
- **Session Management**: Supabase handles sessions securely
- **Password**: Supabase handles password encryption

### Database Security
- **RLS Policies**: Row-Level Security enabled on all tables
- **User Isolation**: Users only see their own data
- **Admin Policies**: Separate policies for admin functions

### API Security
- **HTTPS**: All production traffic encrypted
- **CSRF Protection**: Next.js built-in protection
- **XSS Prevention**: React sanitizes by default
- **Security Headers**: CSP, X-Frame-Options, etc.

---

## 🐛 Troubleshooting

### Issue: "Cannot find module" error
```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Issue: Service Worker not working
```bash
# Solution: Clear browser cache
# DevTools → Application → Clear storage → Clear site data
# Refresh page
```

### Issue: Supabase connection failed
```bash
# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY

# Verify credentials in .env.local
# Test connection: npm run test-connection
```

### Issue: RLS policy denies access
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'events';

-- Re-enable RLS
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
```

### Issue: Build fails with TypeScript errors
```bash
# Check TypeScript errors
npx tsc --noEmit

# Fix and rebuild
npm run build
```

---

## 📚 Documentation

### Full Documentation
- **PWA Guide**: See `PWA_CONFIGURATION.md`
- **Deployment**: See `DEPLOYMENT_GUIDE.md`
- **Database**: Check `COMPLETE_DATABASE_GUIDE.md`

### External Resources
- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com)

---

## 🤝 Contributing

### Setup Development Environment
```bash
# Fork and clone
git clone https://github.com/yourusername/giftbuddy.git
cd giftbuddy

# Create feature branch
git checkout -b feature/your-feature

# Install and run
npm install
npm run dev
```

### Code Standards
- Use TypeScript for all files
- Follow existing code style
- Write meaningful commit messages
- Test before submitting PR

### Pull Request Process
1. Create feature branch from `main`
2. Make changes with proper commits
3. Push to your fork
4. Create PR with description
5. Wait for review and feedback
6. Merge when approved

---

## 📄 License

MIT License - See LICENSE file for details

---

## 📞 Support

- **GitHub Issues**: Report bugs or request features
- **Email**: support@giftbuddy.app
- **Twitter**: [@GiftBuddyApp](https://twitter.com/giftbuddyapp)
- **Discord**: [Join our community](https://discord.gg/giftbuddy)

---

## 🎉 Acknowledgments

Built with ❤️ using:
- [Next.js](https://nextjs.org)
- [Supabase](https://supabase.com)
- [TailwindCSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- And many other amazing open-source projects

---

<div align="center">

**[⬆ back to top](#-giftbuddy)**

Made with 🎁 for celebrating birthdays together

</div>
