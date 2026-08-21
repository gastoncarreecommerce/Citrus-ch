import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <Compass className="h-6 w-6" />
          </div>
          <CardTitle>No encontramos esta página</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-slate-500">
            El link puede estar roto o el contenido ya no existe.
          </p>
          <Button asChild>
            <Link href="/">Ir al inicio</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
