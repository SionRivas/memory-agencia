"use client";

interface MemorialHeaderProps {
  title: string;
  description: string;
}

export function MemorialHeader({ title, description }: MemorialHeaderProps) {
  return (
    <header className="text-center">
      <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl lg:text-5xl text-balance">
        {title}
      </h1>
      <p className="mt-4 font-serif text-lg text-muted-foreground sm:text-xl">
        {description}
      </p>
      {/* Decorative gold line */}
      <div className="mx-auto mt-6 h-px w-24 bg-accent" />
    </header>
  );
}
