"use client";

import "./MasonryGrid.css";
import { HeroVideoDialog } from "@/components/ui/hero-video-dialog";
import Masonry from "masonry-layout";
import { useEffect, useRef } from "react";

interface GalleryImage {
  id: string;
  createdAt: Date;
  url: string;
  caption: string | null;
  memorialId: string;
}

interface Memorial {
  gallery: GalleryImage[] | null;
  id: string;
  slug: string;
  title: string;
  description: string | null;
  youtubeVideoId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface MasonryProps {
  memorial: Memorial;
}

export const MasonryGallery: React.FC<MasonryProps> = ({ memorial }) => {
  if (!memorial) return null; // Handle null case
  // 1. Referencia al contenedor del grid
  const gridRef = useRef<HTMLDivElement>(null);
  // Referencia para guardar la instancia de Masonry
  const masonryInstance = useRef<Masonry | null>(null);

  useEffect(() => {
    const initMasonry = async () => {
      // 2. Inicializar Masonry solo si la referencia existe
      if (gridRef.current) {
        const Masonry = (await import("masonry-layout")).default;
        masonryInstance.current = new Masonry(gridRef.current, {
          itemSelector: ".grid-masonry-item", // Clase de tus elementos hijos
          columnWidth: ".grid-masonry-item", // Usar el ancho del elemento para definir columnas
          percentPosition: true, // Importante para diseño responsive
          gutter: 10, // Espacio entre elementos
          stamp: ".stamp", // Excluir el video del layout
        });
      }
    };

    initMasonry();

    // // 3. Limpieza: destruir la instancia si el componente se desmonta
    // return () => {
    //   if (masonryInstance.current) {
    //     masonryInstance.current.destroy();
    //   }
    // };
  }, []); // El array vacío asegura que esto corra al montar

  return (
    <>
      <div className="masonry-container mt-10">
        {memorial.gallery && memorial.gallery.length > 0 && (
          <div ref={gridRef} className="grid relative">
            <HeroVideoDialog
              className="stamp hero-video"
              animationStyle="from-center"
              videoSrc={`https://www.youtube.com/embed/${memorial.youtubeVideoId}`}
              thumbnailSrc={`https://img.youtube.com/vi/${memorial.youtubeVideoId}/hqdefault.jpg`}
              thumbnailAlt="Dummy Video Thumbnail"
            />
            <div className="stamp decoracion"></div>
            {memorial.gallery.map((image) => (
              <div
                key={image.id}
                className="overflow-hidden rounded-lg grid-masonry-item"
              >
                <img
                  src={image.url}
                  alt={image.caption || "Memorial Image"}
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105 "
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
