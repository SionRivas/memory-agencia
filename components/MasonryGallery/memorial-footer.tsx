import { Button } from "@/components/ui/button"
import { Share2 } from "lucide-react"

export function MemorialFooter() {
  return (
    <footer className="mt-12 flex flex-col items-center gap-4 border-t border-border pt-8 lg:mt-16">
      <div className="h-px w-16 bg-accent" />
      <Button
        variant="outline"
        className="border-accent bg-card font-serif text-foreground hover:bg-accent hover:text-accent-foreground"
      >
        <Share2 className="mr-2 h-4 w-4" />
        Compartir este recuerdo
      </Button>
      <p className="font-serif text-sm text-muted-foreground">Con amor, siempre en nuestros corazones</p>
    </footer>
  )
}
