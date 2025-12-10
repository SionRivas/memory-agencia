import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { MemorialHeader } from "@/components/MasonryGallery/memorial-header";
import { HeroVideoDialog } from "@/components/ui/hero-video-dialog";
import { MasonryGallery } from "@/components/MasonryGallery";
import { MemorialFooter } from "@/components/MasonryGallery/memorial-footer";

interface MemorialPageProps {
  params: Promise<{ slug: string }>;
}

// 1. GENERAR METADATA DINÁMICA (Para WhatsApp/Facebook)
export async function generateMetadata({
  params,
}: MemorialPageProps): Promise<Metadata> {
  const { slug } = await params;
  const memorial = await prisma.memorial.findUnique({
    where: { slug },
    include: { gallery: { take: 1 } }, // Solo traemos 1 foto para la previa
  });

  if (!memorial) return { title: "Recuerdo no encontrado" };

  // Usamos la primera foto de la galería como portada, o una por defecto
  const ogImage =
    memorial.gallery[0]?.url || "https://tudominio.com/default-flower.jpg";

  return {
    title: `En Memoria de ${memorial.title}`,
    description: memorial.description || "Un tributo a una vida especial.",
    openGraph: {
      images: [ogImage],
    },
  };
}

// 2. COMPONENTE DE PÁGINA
export default async function MemorialPage({ params }: MemorialPageProps) {
  const { slug } = await params;
  const memorial = await prisma.memorial.findUnique({
    where: { slug },
    include: {
      gallery: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!memorial) notFound();

  const { title, description, youtubeVideoId, gallery } = memorial;

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-12 lg:py-16">
        <MemorialHeader title={title} description={description || ""} />

        <MasonryGallery memorial={memorial} />
        <MemorialFooter />
      </div>
    </main>
  );
}
