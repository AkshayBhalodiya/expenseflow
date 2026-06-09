import Link from 'next/link';
import { Receipt, TrendingUp, Wallet, Shield } from 'lucide-react';

const features = [
  { icon: TrendingUp, text: 'Track income & expenses easily' },
  { icon: Wallet, text: 'Manage EMI, cards & budgets' },
  { icon: Shield, text: 'Secure household sharing' },
];

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background lg:flex-row">
      <div className="relative hidden overflow-hidden bg-primary lg:flex lg:w-[45%] xl:w-1/2">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-indigo-700" />
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-14 text-primary-foreground">
          <Link href="/login" className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
              <Receipt className="h-6 w-6" />
            </span>
            <span className="text-2xl font-bold tracking-tight">ExpenseFlow</span>
          </Link>

          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold leading-tight xl:text-4xl">
                Smart finance management for you & your family
              </h1>
              <p className="mt-3 text-base text-primary-foreground/80 max-w-md">
                Track expenses, income, EMIs, credit cards and shared home finances — all in one place.
              </p>
            </div>
            <ul className="space-y-4">
              {features.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-sm text-primary-foreground/90">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15">
                    <Icon className="h-4 w-4" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-primary-foreground/60">
            © {new Date().getFullYear()} ExpenseFlow. All rights reserved.
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-center border-b px-4 py-4 pt-safe lg:hidden">
          <Link href="/login" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Receipt className="h-5 w-5 text-primary" />
            </span>
            <span className="text-lg font-bold tracking-tight">ExpenseFlow</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-4 py-8 pb-safe sm:px-6 lg:px-10">
          <div className="w-full max-w-[420px]">{children}</div>
        </div>
      </div>
    </div>
  );
}
