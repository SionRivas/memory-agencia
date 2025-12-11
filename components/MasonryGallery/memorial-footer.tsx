import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";

export function MemorialFooter() {
  return (
    <footer className="mt-12 flex flex-col items-center gap-4 border-t border-border pt-8 lg:mt-16">
      <div className="h-px w-16 bg-accent" />
      <p className="font-serif text-sm text-muted-foreground">
        Con amor, siempre en nuestros corazones
      </p>
    </footer>
  );
}
