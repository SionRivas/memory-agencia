"use client";

import type React from "react";
import { useState, useCallback, useEffect } from "react";
import { ArrowLeft, Upload, X, Youtube, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { Recuerdo } from "./admin-dashboard";

interface RecuerdoEditorProps {
  recuerdo: Recuerdo | null;
  onSave: (recuerdo: Recuerdo) => void;
  onCancel: () => void;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function getYouTubeThumbnail(url: string): string | null {
  const videoId = extractYouTubeId(url);
  if (videoId) {
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  }
  return null;
}

function extractYouTubeId(url: string): string | null {
  // Si ya es solo un ID (11 caracteres alfanuméricos), retornarlo
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url;
  }

  // Extraer ID de URLs de YouTube
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

export function RecuerdoEditor({
  recuerdo,
  onSave,
  onCancel,
}: RecuerdoEditorProps) {
  const [titulo, setTitulo] = useState(recuerdo?.title || "");
  const [slug, setSlug] = useState(recuerdo?.slug || "");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(
    !!recuerdo?.slug
  );
  const [descripcion, setDescripcion] = useState(recuerdo?.description || "");
  // Almacenar el ID del video, no la URL completa
  const [videoId, setVideoId] = useState(recuerdo?.youtubeVideoId || "");
  const [fotos, setFotos] = useState<{ url: string; caption: string }[]>(
    recuerdo?.fotos || []
  );
  const [isDragging, setIsDragging] = useState(false);
  const [domain, setDomain] = useState("");

  const videoThumbnail = getYouTubeThumbnail(videoId);

  useEffect(() => {
    // Obtener el dominio actual
    setDomain(window.location.origin);
  }, []);

  useEffect(() => {
    // Solo auto-generar el slug si es un nuevo recuerdo (no existe recuerdo.id)
    // y el usuario no lo ha editado manualmente
    if (!slugManuallyEdited && titulo && !recuerdo?.id) {
      setSlug(slugify(titulo));
    }
  }, [titulo, slugManuallyEdited, recuerdo?.id]);

  const handleSlugChange = (value: string) => {
    setSlugManuallyEdited(true);
    setSlug(slugify(value));
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith("image/")
    );
    addPhotos(files);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addPhotos(files);
  };

  const addPhotos = (files: File[]) => {
    const newPhotos = files.map((file) => ({
      url: URL.createObjectURL(file),
      caption: "",
    }));
    setFotos([...fotos, ...newPhotos]);
  };

  const removePhoto = (index: number) => {
    setFotos(fotos.filter((_, i) => i !== index));
  };

  const updatePhotoCaption = (index: number, caption: string) => {
    setFotos(
      fotos.map((foto, i) => (i === index ? { ...foto, caption } : foto))
    );
  };

  const handleVideoUrlChange = (value: string) => {
    // Extraer el ID del video o usar el valor directamente si ya es un ID
    const extractedId = extractYouTubeId(value);
    setVideoId(extractedId || value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: recuerdo?.id || "",
      title: titulo,
      slug,
      description: descripcion,
      youtubeVideoId: videoId,
      fotos,
      createdAt: recuerdo?.createdAt || new Date(),
      updatedAt: new Date(),
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Volver</span>
            </Button>
            <h1 className="text-xl font-semibold text-foreground">
              {recuerdo ? "Editar Recuerdo" : "Crear Nuevo Recuerdo"}
            </h1>
          </div>
        </div>
      </header>

      {/* Editor Form */}
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Sección A: Información General */}
          <section className="space-y-6">
            <div>
              <h2 className="text-lg font-medium text-foreground mb-4">
                Información General
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="titulo">Título del Recuerdo</Label>
                  <Input
                    id="titulo"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ej: En memoria de la Abuela Ana"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="slug">Slug (URL)</Label>
                  <div className="mt-1.5 flex items-center rounded-md border border-input bg-background">
                    <span className="px-3 text-sm text-muted-foreground">
                      {domain}/recuerdo/
                    </span>
                    <Input
                      id="slug"
                      value={slug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      className="border-0 border-l rounded-l-none focus-visible:ring-0"
                      placeholder="slug-del-recuerdo"
                    />
                  </div>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    Se genera automáticamente desde el título, pero puedes
                    editarlo manualmente.
                  </p>
                </div>

                <div>
                  <Label htmlFor="descripcion">Descripción / Biografía</Label>
                  <Textarea
                    id="descripcion"
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Escribe una descripción o biografía..."
                    rows={5}
                    className="mt-1.5"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Sección B: Multimedia */}
          <section className="space-y-6">
            <h2 className="text-lg font-medium text-foreground">Multimedia</h2>

            {/* Video de YouTube */}
            <div>
              <Label htmlFor="videoUrl">Video de YouTube</Label>
              <div className="mt-1.5 flex items-center gap-2">
                <Youtube className="h-5 w-5 text-muted-foreground" />
                <Input
                  id="videoUrl"
                  value={videoId}
                  onChange={(e) => handleVideoUrlChange(e.target.value)}
                  placeholder="ID del video o URL completa de YouTube"
                  className="flex-1"
                />
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Sugerimos videos marcados como &quot;No Listado&quot; en
                YouTube.
              </p>
              {videoThumbnail && (
                <div className="mt-3 overflow-hidden rounded-lg border border-border">
                  <img
                    src={videoThumbnail || "/placeholder.svg"}
                    alt="Vista previa del video"
                    className="h-40 w-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* Galería de Fotos */}
            <div>
              <Label>Galería de Fotos</Label>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`mt-1.5 flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground"
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="flex cursor-pointer flex-col items-center p-6"
                >
                  <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    Arrastra tus fotos aquí o haz clic para buscar
                  </span>
                  <span className="mt-1 text-xs text-muted-foreground">
                    PNG, JPG hasta 10MB
                  </span>
                </label>
              </div>

              {/* Grid de fotos */}
              {fotos.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {fotos.map((foto, index) => (
                    <div key={index} className="group relative">
                      <div className="aspect-square overflow-hidden rounded-lg border border-border bg-muted">
                        <img
                          src={foto.url || "/placeholder.svg"}
                          alt={`Foto ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                        aria-label="Eliminar foto"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <Input
                        value={foto.caption}
                        onChange={(e) =>
                          updatePhotoCaption(index, e.target.value)
                        }
                        placeholder="Caption..."
                        className="mt-2 text-sm"
                      />
                    </div>
                  ))}
                </div>
              )}

              {fotos.length === 0 && (
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <ImageIcon className="h-4 w-4" />
                  <span>No hay fotos seleccionadas</span>
                </div>
              )}
            </div>
          </section>

          {/* Sticky Footer */}
          <div className="sticky bottom-0 -mx-4 border-t border-border bg-background px-4 py-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit">Guardar Cambios</Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
