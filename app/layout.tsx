import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";

const defaultUrl = process.env.NEXT_PUBLIC_VERCEL_URL
  ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "GiftBuddy - Split Birthday Celebration",
  description:
    "GiftBuddy helps your team plan birthday events, split bills fairly, track payments, and vote for food - all in one place.",
  keywords: [
    "GiftBuddy",
    "birthday gift split",
    "team celebration",
    "event planning",
    "gift tracking",
    "cost splitting",
    "PWA",
  ],
  authors: [{ name: "Selvin PaulRaj K" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/gift.svg",
    apple: "/gift.png",
    other: [
      {
        rel: "mask-icon",
        url: "/gift.svg",
        color: "#000000",
      },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "GiftBuddy",
  },
  openGraph: {
    type: "website",
    url: defaultUrl,
    title: "GiftBuddy - Birthday Celebrations Made Easy",
    description:
      "Split costs, track payments, and celebrate birthdays together with your team.",
    images: [
      {
        url: "/gift.png",
        width: 512,
        height: 512,
        alt: "GiftBuddy",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "🎁 GiftBuddy",
    description: "Birthday Celebrations Made Easy",
    images: ["/gift.png"],
  },
  formatDetection: {
    telephone: true,
    email: true,
    address: false,
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* PWA Support */}
        <meta name="theme-color" content="#000000" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="GiftBuddy" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/gift.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/gift.png" />
        <link rel="alternate icon" href="/gift.png" />
        
        {/* Preload critical resources */}
        <link rel="preload" href="/gift.svg" as="image" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster />
          <PWAInstallPrompt />
          {children}
        </ThemeProvider>
        
        {/* Service Worker Registration Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', async () => {
                  try {
                    await navigator.serviceWorker.register('/sw.js', {
                      scope: '/',
                      updateViaCache: 'none'
                    });
                    console.log('Service Worker registered successfully');
                  } catch (error) {
                    console.error('Service Worker registration failed:', error);
                  }
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
