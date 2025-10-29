# 🎁 GiftBuddy# 🎁 GiftBuddy - Birthday Event Management App



A beautiful, modern web app for managing birthday celebrations, splitting costs fairly, and tracking payments.**Status**: 🟢 Core Backend Complete | UI Complete | Production Ready



## 🚀 Quick StartA beautiful, modern web app for managing birthday celebrations, splitting costs fairly, and tracking payments.



### Prerequisites---

- Node.js 18+

- npm or yarn## 🎯 What It Does

- Supabase account

### For Admins

### Installation- ✅ Create birthday events with multiple gifts

- ✅ Auto-split costs equally among participants

```bash- ✅ Track real-time payment status

# Install dependencies- ✅ See summary of collections vs pending

npm install- ✅ Mark events as completed

- ✅ Archive event records

# Set up environment variables

cp .env.example .env.local### For Users

- ✅ See upcoming birthday events

# Add your Supabase credentials to .env.local- ✅ View gift details and split amount

- ✅ Mark payment with one click

# Run development server- ✅ See payment history

npm run dev- ✅ Track UPI details

```

---

Visit `http://localhost:3000`

## � Quick Start (5 minutes)

## 📁 Project Structure

- **Frontend:** [Next.js 14](https://nextjs.org), [React 18](https://react.dev), [TypeScript](https://www.typescriptlang.org)

```- **Backend & DB:** [Supabase](https://supabase.com) (Postgres)

app/                  # Next.js app directory- **UI & Styling:** [TailwindCSS](https://tailwindcss.com), [ShadCN/UI](https://ui.shadcn.com)

├── (root)/           # Protected routes- **State Management:** Server Components + React Hooks

│   ├── dashboard/    # User dashboard- **Other:** [Sonner](https://sonner.emilkowal.ski) for toasts, [Lucide Icons](https://lucide.dev)

│   └── admin/        # Admin event management

├── auth/             # Authentication pages---

└── page.tsx          # Landing page

## 📦 Installation & Setup

components/           # Reusable React components

lib/                  # Utilities and supabase client1. **Clone the repository**

public/               # Static assets   ```bash

db/                   # Database migrations   git clone https://github.com/tanialapalelo/treatsplit.git

```   cd treatsplit

   ```

## 🎯 Key Features

2. **Install dependencies**

- ✅ Create birthday events with gifts   ```bash

- ✅ Auto-split costs among participants   npm install

- ✅ Track payment status in real-time   # or

- ✅ Vote on gifts and food   yarn install

- ✅ Beautiful dark/light mode support   ```

- ✅ Mobile-optimized UI

3. **Set up environment variables**  

## 🛠️ Available Commands   Create a `.env.local` file with:

   ```bash

```bash   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url

npm run dev      # Start development server   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

npm run build    # Build for production   ```

npm start        # Start production server

npm run lint     # Run ESLint4. **Run the development server**

```   ```bash

   npm run dev

## 📦 Tech Stack   # or

   yarn dev

- **Frontend:** Next.js 14, React 19, TypeScript   ```

- **Styling:** Tailwind CSS, shadcn/ui

- **Backend:** Supabase (PostgreSQL)5. **Visit**

- **Auth:** Supabase Auth (Magic Link)   ```

- **Deployment:** Vercel-ready   http://localhost:3000

   ```

## 📄 License

## 📜 License

MITMIT © 2025 Selvin PaulRaj K

