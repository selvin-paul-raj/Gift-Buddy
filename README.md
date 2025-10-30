# 🎁 GiftBuddy

> **Celebrate Together, Split Fairly, Keep Everyone Happy**

A modern Progressive Web App (PWA) for managing birthday celebrations and splitting costs fairly among friends and family.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://giftz-buddy.vercel.app/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com)

## ✨ Features

### For Event Organizers
- ✅ Create birthday events with multiple gifts
- ✅ Auto-split costs equally among participants
- ✅ Real-time payment tracking
- ✅ Guest management (add/remove participants)
- ✅ Payment collection summary
- ✅ Event analytics and completion tracking

### For Participants
- ✅ View upcoming birthday events
- ✅ See gift details and split amounts
- ✅ One-click payment marking
- ✅ UPI payment integration
- ✅ Payment history tracking
- ✅ Event reminders

### Technical Highlights
- 🌐 Progressive Web App (PWA) - offline capable & installable
- 📱 Mobile-first responsive design
- 🔐 Secure authentication with magic links
- 🔒 Row-level security (RLS) data protection
- 💰 Indian currency (₹) support
- ⚡ Lightning-fast performance
- 🌓 Dark mode support
- 📡 Real-time data synchronization

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account (free at [supabase.com](https://supabase.com))

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/selvin-paul-raj/Gift-Buddy.git
cd Gift-Buddy
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

Get these values from your [Supabase Dashboard](https://app.supabase.com) under Settings → API.

4. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📁 Project Structure

```
Gift-Buddy/
├── app/                      # Next.js App Router
│   ├── page.tsx             # Landing page
│   ├── layout.tsx           # Root layout with PWA config
│   ├── (root)/              # Protected routes
│   │   ├── dashboard/       # User dashboard
│   │   └── admin/           # Admin dashboard
│   └── auth/                # Authentication pages
├── components/              # Reusable React components
├── lib/                     # Utilities & helpers
│   ├── supabase/           # Supabase clients
│   ├── actions/            # Server actions
│   └── types/              # TypeScript types
├── public/                 # Static assets & PWA config
├── db/                     # Database migrations
└── next.config.ts          # Next.js configuration
```

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14, React 19, TypeScript |
| **Styling** | Tailwind CSS, shadcn/ui |
| **Backend** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth (Magic Link) |
| **State** | React Hooks, Server Components |
| **Deployment** | Vercel |

## 📦 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## 🌐 Deployment

### Deploy to Vercel (Recommended)

```bash
npm i -g vercel
vercel --prod
```

### Environment Variables
Configure these in your deployment platform:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## 📱 PWA Installation

### Android
1. Open GiftBuddy in Chrome/Edge
2. Tap menu (⋮) → "Install app"
3. App appears on home screen

### iOS
1. Open GiftBuddy in Safari
2. Tap Share → "Add to Home Screen"
3. App appears on home screen

### Desktop
1. Open GiftBuddy in Chrome/Edge
2. Click install icon in address bar
3. App launches in window mode

## 🔒 Security

- **Authentication**: Magic link via email
- **Session Management**: Supabase handles securely
- **Database**: Row-Level Security (RLS) enabled
- **API**: HTTPS only, CSRF protection enabled
- **User Data**: Isolated per user with RLS policies

## 🐛 Troubleshooting

**Issue: Cannot connect to Supabase**
- Verify environment variables in `.env.local`
- Check credentials in Supabase Dashboard
- Ensure correct project URL

**Issue: Service Worker not working**
- Clear browser cache and site data
- Go to DevTools → Application → Clear storage
- Refresh the page

**Issue: Build fails**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📚 Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Built with ❤️ using:
- [Next.js](https://nextjs.org)
- [Supabase](https://supabase.com)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Sonner](https://sonner.emilkowal.ski)
- [Lucide Icons](https://lucide.dev)

## 📞 Support

- Open an [issue](https://github.com/selvin-paul-raj/Gift-Buddy/issues) for bug reports
- Check [discussions](https://github.com/selvin-paul-raj/Gift-Buddy/discussions) for questions

---

<div align="center">

**[View Live Demo](https://giftz-buddy.vercel.app/)**

Made with 🎁 for celebrating birthdays together

</div>
