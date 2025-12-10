"use client";

interface MasonryImageProps {
  src: string;
  alt: string;
  index: number;
  isReady: boolean;
  onClick?: () => void;
}

export const MasonryImage: React.FC<MasonryImageProps> = ({
  src,
  alt,
  index,
  isReady,
  onClick,
}) => {
  return (
    <div
      className={`overflow-hidden border border-accent rounded-lg grid-masonry-item ${isReady ? "animate-fade-in-up" : "opacity-0"
        }`}
      style={{
        animationDelay: isReady ? `${100 + index * 200}ms` : undefined,
        animationFillMode: "backwards",
        cursor: onClick ? "pointer" : undefined,
      }}
      onClick={onClick}
    >
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
      />
    </div>
  );
};
