import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";
import { Badge } from "@/components/ui/badge";
import { AppNav } from "@/components/app-nav";

export function AppHeader({
  email,
  roleLabel,
  homeHref,
  navItems = [],
}: {
  email: string;
  roleLabel: string;
  homeHref: string;
  navItems?: { href: string; label: string }[];
}) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href={homeHref} className="flex items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-600 text-sm font-bold text-white">
            C
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold text-slate-900">Propuestas Comerciales</p>
            <p className="text-xs text-slate-500">Carrefour Marketplace</p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-slate-900">{email}</p>
            <Badge variant="secondary" className="mt-0.5">
              {roleLabel}
            </Badge>
          </div>
          <LogoutButton />
        </div>
      </div>

      {navItems.length > 0 && <AppNav items={navItems} />}
    </header>
  );
}
