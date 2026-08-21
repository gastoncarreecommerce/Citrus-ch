import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return (
    <div className="flex items-center justify-center py-16">
      <Loader2 className={cn("h-6 w-6 animate-spin text-slate-400", className)} />
    </div>
  );
}
