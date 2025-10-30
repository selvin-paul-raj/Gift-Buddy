import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { AuthButton } from "@/components/auth-button";
import { redirect } from "next/navigation";
import Image from "next/image";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // Get user role and redirect accordingly
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userData?.role === "admin") {
      redirect("/admin");
    } else {
      redirect("/dashboard");
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-background">
      {/* Navbar */}
      <nav className="w-full border-b border-border/40 h-16 flex items-center sticky top-0 z-40 bg-background/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto w-full px-4 flex justify-between items-center">
          <div className="flex items-center gap-2 font-semibold text-lg">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              GiftBuddy
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <AuthButton />
            <ThemeSwitcher />
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex items-center py-12 md:py-24">
        <div className="max-w-6xl mx-auto w-full px-4 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Celebrate together, split fairly, keep everyone happy.
            </h1>
            <p className="mt-6 text-muted-foreground text-lg leading-relaxed">
              GiftBuddy makes team celebrations effortless. Plan birthday events, split costs instantly, track payments in real-time, and vote on food together. No more awkward money conversations.
            </p>
            <div className="mt-8 flex gap-3 flex-wrap">
              <Link
                href={user ? "/dashboard" : "/auth/login"}
                className="bg-primary text-primary-foreground hover:opacity-90 transition-opacity px-5 py-3 rounded-md font-medium"
              >
                {user ? "Go to Dashboard" : "Start Celebrating Free"}
              </Link>
              <Link
                href="#how-it-works"
                className="px-5 py-3 rounded-md font-medium border hover:bg-muted transition-colors"
              >
                See How It Works
              </Link>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              ✨ 100% free • No credit card required • Works instantly
            </p>
          </div>

          {/* Hero Image */}
          <div className="hidden md:block">
            <div className="w-full h-[300px] rounded-xl border bg-muted relative overflow-hidden">
              <Image
                src="/giftbuddy-dashboard.jpg"
                alt="GiftBuddy Dashboard"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-border/40 py-20 bg-background">
        <div className="max-w-6xl mx-auto w-full px-4">
          <h2 className="text-3xl font-bold mb-10">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StepCard
              step="01"
              title="Create an event"
              description="Set up a birthday celebration with names, gifts, and total budget in seconds."
            />
            <StepCard
              step="02"
              title="Split the costs"
              description="Automatically divide costs among team members with instant calculations."
            />
            <StepCard
              step="03"
              title="Track & collect"
              description="See who's paid, send payment reminders, and celebrate together."
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border/40 py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto w-full px-4">
          <h2 className="text-3xl font-bold mb-10">Features you'll love</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              title="💸 Smart Cost Splitting"
              description="Automatically calculate who owes what. No more math headaches or disputes."
            />
            <FeatureCard
              title="🎁 Gift Planning"
              description="Add gift items with links. Team votes to decide what to buy together."
            />
            <FeatureCard
              title="📊 Payment Tracking"
              description="See real-time payment status. Know who's paid and send friendly reminders."
            />
            <FeatureCard
              title="📈 Event Dashboard"
              description="View collection progress, participation stats, and contribution breakdowns at a glance."
            />
            <FeatureCard
              title="🔐 Secure & Private"
              description="Your data is encrypted and private. No spam, no selling your info."
            />
            <FeatureCard
              title="⚡ Instant Setup"
              description="No forms to fill out. Just sign in with your email and start celebrating."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border/40 py-20 bg-background">
        <div className="max-w-6xl mx-auto w-full px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to try GiftBuddy?</h2>
          <p className="text-muted-foreground mb-8">
            Join hundreds of teams making birthday celebrations stress-free and fun.
          </p>
          <Link
            href={user ? "/dashboard" : "/auth/login"}
            className="inline-block bg-primary text-primary-foreground hover:opacity-90 transition-opacity px-6 py-3 rounded-md font-medium"
          >
            {user ? "Go to Dashboard" : "Start Planning Now"}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 bg-muted/50">
        <div className="max-w-6xl mx-auto w-full px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 GiftBuddy. Made with ❤️ for teams everywhere.</p>
        </div>
      </footer>
    </main>
  );
}

function StepCard({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border p-6 bg-background hover:shadow-md transition-shadow">
      <div className="text-sm text-muted-foreground mb-2 font-medium">Step {step}</div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border p-6 bg-background hover:shadow-md transition-shadow">
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}