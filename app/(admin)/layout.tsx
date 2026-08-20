import { auth } from "@/lib/auth";
import { AppHeader } from "@/components/app-header";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader
        email={session?.user.email ?? ""}
        roleLabel="Admin"
        homeHref="/admin/espacios"
      />
      {children}
    </div>
  );
}
