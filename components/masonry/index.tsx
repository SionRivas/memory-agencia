import { HeroVideoDialog } from "../ui/hero-video-dialog";

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
  memorial: Memorial | null;
}

export const Masonry: React.FC<MasonryProps> = ({ memorial }) => {
  if (!memorial) return null; // Handle null case

  return (
    <>
      <HeroVideoDialog
        className="block"
        animationStyle="from-center"
        videoSrc={`https://www.youtube.com/embed/${memorial.youtubeVideoId}`}
        thumbnailSrc={`https://img.youtube.com/vi/${memorial.youtubeVideoId}/hqdefault.jpg`}
        thumbnailAlt="Dummy Video Thumbnail"
      />
      {memorial.gallery && memorial.gallery.length > 0 && (
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {memorial.gallery.map((image) => (
            <div key={image.id} className="overflow-hidden rounded-lg">
              <img
                src={image.url}
                alt={image.caption || "Memorial Image"}
                className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
};
