import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect(session.user.rol === "ADMIN" ? "/admin/espacios" : "/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white shadow-sm">
            C
          </span>
          <div className="text-center">
            <p className="text-lg font-semibold text-slate-900">Propuestas Comerciales</p>
            <p className="text-sm text-slate-500">Carrefour Marketplace</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Ingresar</CardTitle>
            <CardDescription>Portal de sellers y administración del marketplace</CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
