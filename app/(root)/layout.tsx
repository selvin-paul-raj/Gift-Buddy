import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import Footer from "@/components/shared/Footer";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-0 items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <Link href={"/dashboard/profile"} className="hover:underline text-lg">{"<Profile />"}</Link>
            </div>
            <div>
              {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
            </div>
          </div>
        </nav>
        <div className="flex-1 flex flex-col gap-20 w-full p-5">
          {children}
        </div>
        <Footer />
      </div>
    </main>
  );
}
