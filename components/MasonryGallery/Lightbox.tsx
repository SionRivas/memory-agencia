"use client";

import { motion, AnimatePresence, useDragControls, PanInfo } from "motion/react";
import { useEffect, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface GalleryImage {
    id: string;
    url: string;
    caption: string | null;
}

interface LightboxProps {
    images: GalleryImage[];
    currentIndex: number;
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (index: number) => void;
}

export const Lightbox: React.FC<LightboxProps> = ({
    images,
    currentIndex,
    isOpen,
    onClose,
    onNavigate,
}) => {
    const dragControls = useDragControls();
    const containerRef = useRef<HTMLDivElement>(null);

    const currentImage = images[currentIndex];

    const goToPrevious = useCallback(() => {
        if (currentIndex > 0) {
            onNavigate(currentIndex - 1);
        }
    }, [currentIndex, onNavigate]);

    const goToNext = useCallback(() => {
        if (currentIndex < images.length - 1) {
            onNavigate(currentIndex + 1);
        }
    }, [currentIndex, images.length, onNavigate]);

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case "Escape":
                    onClose();
                    break;
                case "ArrowLeft":
                    goToPrevious();
                    break;
                case "ArrowRight":
                    goToNext();
                    break;
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        // Prevent body scroll when lightbox is open
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [isOpen, onClose, goToPrevious, goToNext]);

    // Handle swipe gestures for mobile
    const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        const threshold = 50;
        if (info.offset.x > threshold) {
            goToPrevious();
        } else if (info.offset.x < -threshold) {
            goToNext();
        }
    };

    // Handle click on overlay to close
    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === containerRef.current) {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && currentImage && (
                <motion.div
                    ref={containerRef}
                    className="lightbox-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={handleOverlayClick}
                >
                    {/* Close button */}
                    <motion.button
                        className="lightbox-close"
                        onClick={onClose}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <X size={24} />
                    </motion.button>

                    {/* Previous button */}
                    {currentIndex > 0 && (
                        <motion.button
                            className="lightbox-nav lightbox-prev"
                            onClick={goToPrevious}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <ChevronLeft size={32} />
                        </motion.button>
                    )}

                    {/* Next button */}
                    {currentIndex < images.length - 1 && (
                        <motion.button
                            className="lightbox-nav lightbox-next"
                            onClick={goToNext}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <ChevronRight size={32} />
                        </motion.button>
                    )}

                    {/* Image container with swipe support */}
                    <motion.div
                        className="lightbox-content"
                        drag="x"
                        dragControls={dragControls}
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.2}
                        onDragEnd={handleDragEnd}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        key={currentImage.id}
                    >
                        <img
                            src={currentImage.url}
                            alt={currentImage.caption || "Gallery image"}
                            className="lightbox-image"
                            draggable={false}
                        />

                        {/* Caption */}
                        {currentImage.caption && (
                            <motion.div
                                className="lightbox-caption"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                {currentImage.caption}
                            </motion.div>
                        )}
                    </motion.div>

                    {/* Image counter */}
                    <motion.div
                        className="lightbox-counter"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        {currentIndex + 1} / {images.length}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
