import Link from "next/link";
import { ThemeSwitcher } from "../theme-switcher";

export default function Footer() {
  return (
    <footer className="w-full border-t border-border/40 py-10 text-xs text-muted-foreground">
      <div className="max-w-6xl mx-auto w-full px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <p>
          © {new Date().getFullYear()} GiftBuddy — GenXRverse
        </p>
        <ThemeSwitcher />
        <p>
          • <Link href="https://github.com/selvin-paul-raj" className="hover:underline">Selvin PaulRaj K</Link>
        </p>
      </div>
    </footer>
  );
}
