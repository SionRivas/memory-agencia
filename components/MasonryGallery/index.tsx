"use client";

import "./MasonryGrid.css";
import { HeroVideoDialog } from "@/components/ui/hero-video-dialog";
import { useEffect, useRef, useState } from "react";
import { MasonryImage } from "./MasonryImage";

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
  if (!memorial) return null;

  const gridRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const masonryInstance = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initMasonry = async () => {
      if (!gridRef.current) return;

      // Importar las librerías dinámicamente
      const [{ default: Masonry }, { default: imagesLoaded }] =
        await Promise.all([import("masonry-layout"), import("imagesloaded")]);

      // Esperar a que todas las imágenes carguen
      imagesLoaded(gridRef.current, () => {
        masonryInstance.current = new Masonry(gridRef.current!, {
          itemSelector: ".grid-masonry-item",
          columnWidth: ".grid-masonry-item",
          percentPosition: true,
          gutter: 10,
          stamp: ".stamp",
        });
        setIsLoading(false);
      });
    };

    initMasonry();

    return () => {
      if (masonryInstance.current) {
        masonryInstance.current.destroy();
      }
    };
  }, [memorial.gallery]);

  return (
    <>
      <div className="masonry-container mt-10">
        {memorial.gallery && memorial.gallery.length > 0 && (
          <div
            ref={gridRef}
            className="grid relative animate-fade-in"
            style={{
              transition: "opacity 0.3s ease",
            }}
          >
            <HeroVideoDialog
              className="stamp hero-video"
              animationStyle="from-center"
              videoSrc={`https://www.youtube.com/embed/${memorial.youtubeVideoId}`}
              thumbnailSrc={`https://img.youtube.com/vi/${memorial.youtubeVideoId}/hqdefault.jpg`}
              thumbnailAlt="Dummy Video Thumbnail"
            />
            <div className="stamp decoracion"></div>
            {memorial.gallery.map((image, index) => (
              <MasonryImage
                key={image.id}
                src={image.url}
                alt={image.caption || "Memorial Image"}
                index={index}
                isReady={!isLoading}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};
