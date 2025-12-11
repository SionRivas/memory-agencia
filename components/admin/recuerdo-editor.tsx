"use client";

import type React from "react";
import { useState, useCallback, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Upload,
  X,
  Youtube,
  ImageIcon,
  Loader2,
} from "lucide-react";
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

// Tipos para el manejo de fotos
interface PhotoData {
  url: string; // blob URL para previsualización o URL de S3 para existentes
  caption: string;
  file?: File; // Solo para fotos nuevas
  isExisting: boolean; // true si ya está en S3
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

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
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
    return url;
  }
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

// Función para comprimir imagen si excede 5MB
async function compressImage(file: File): Promise<File> {
  if (file.size <= MAX_FILE_SIZE) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    img.onload = () => {
      // Calcular dimensiones reducidas si es necesario
      let { width, height } = img;
      const maxDimension = 2048;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        } else {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);

      // Probar diferentes calidades hasta que sea menor a 5MB
      const tryQuality = (quality: number) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Error al comprimir imagen"));
              return;
            }

            if (blob.size <= MAX_FILE_SIZE || quality <= 0.1) {
              const compressedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              tryQuality(quality - 0.1);
            }
          },
          "image/jpeg",
          quality
        );
      };

      tryQuality(0.9);
    };

    img.onerror = () => reject(new Error("Error cargando imagen"));
    img.src = URL.createObjectURL(file);
  });
}

// Función para obtener URL firmada
async function getSignedUploadUrl(
  fileName: string,
  fileType: string
): Promise<{ uploadUrl: string; fileUrl: string }> {
  const response = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName, fileType }),
  });

  if (!response.ok) {
    throw new Error("Error obteniendo URL de subida");
  }

  return response.json();
}

// Función para subir archivo a S3
async function uploadToS3(uploadUrl: string, file: File): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!response.ok) {
    throw new Error("Error subiendo archivo a S3");
  }
}

// Función para eliminar archivo de S3
async function deleteFromS3(fileUrl: string): Promise<void> {
  const key = fileUrl.split("s3.amazonaws.com/").pop();
  if (!key) return;

  await fetch(`/api/upload/${encodeURIComponent(key)}`, {
    method: "DELETE",
  });
}

// Extraer key de una URL de S3
function extractS3Key(url: string): string | null {
  const match = url.match(/s3\.amazonaws\.com\/(.+)$/);
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
  const [videoId, setVideoId] = useState(recuerdo?.youtubeVideoId || "");
  const [fotos, setFotos] = useState<PhotoData[]>(
    recuerdo?.fotos.map((f) => ({ ...f, isExisting: true })) || []
  );
  const [isDragging, setIsDragging] = useState(false);
  const [domain, setDomain] = useState("");

  // Estados para el proceso de guardado
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Track de URLs originales para detectar eliminaciones
  const originalUrls = useRef<string[]>(
    recuerdo?.fotos.map((f) => f.url) || []
  );

  const videoThumbnail = getYouTubeThumbnail(videoId);

  useEffect(() => {
    setDomain(window.location.origin);
  }, []);

  useEffect(() => {
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
    const newPhotos: PhotoData[] = files.map((file) => ({
      url: URL.createObjectURL(file),
      caption: "",
      file,
      isExisting: false,
    }));
    setFotos((prev) => [...prev, ...newPhotos]);
  };

  const removePhoto = (index: number) => {
    setFotos((prev) => prev.filter((_, i) => i !== index));
  };

  const updatePhotoCaption = (index: number, caption: string) => {
    setFotos((prev) =>
      prev.map((foto, i) => (i === index ? { ...foto, caption } : foto))
    );
  };

  const handleVideoUrlChange = (value: string) => {
    const extractedId = extractYouTubeId(value);
    setVideoId(extractedId || value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const uploadedUrls: string[] = []; // Para cleanup si falla

    try {
      // Validaciones básicas
      if (!titulo.trim()) {
        throw new Error("El título es requerido");
      }
      if (!slug.trim()) {
        throw new Error("El slug es requerido");
      }

      // PASO 1: Subir fotos nuevas a S3
      const newPhotos = fotos.filter((f) => !f.isExisting && f.file);
      const existingPhotos = fotos.filter((f) => f.isExisting);

      setSubmitProgress(`Subiendo ${newPhotos.length} foto(s)...`);

      const uploadedPhotos: { url: string; caption: string }[] = [];

      for (let i = 0; i < newPhotos.length; i++) {
        const photo = newPhotos[i];
        if (!photo.file) continue;

        setSubmitProgress(`Procesando foto ${i + 1} de ${newPhotos.length}...`);

        // Comprimir si es necesario
        let fileToUpload = photo.file;
        if (photo.file.size > MAX_FILE_SIZE) {
          setSubmitProgress(`Comprimiendo foto ${i + 1}...`);
          fileToUpload = await compressImage(photo.file);
        }

        // Obtener URL firmada
        setSubmitProgress(`Subiendo foto ${i + 1} de ${newPhotos.length}...`);
        const { uploadUrl, fileUrl } = await getSignedUploadUrl(
          fileToUpload.name,
          fileToUpload.type
        );

        // Subir a S3
        await uploadToS3(uploadUrl, fileToUpload);

        uploadedUrls.push(fileUrl);
        uploadedPhotos.push({ url: fileUrl, caption: photo.caption });
      }

      // Combinar fotos existentes con las nuevas subidas
      const allImages = [
        ...existingPhotos.map((p) => ({ url: p.url, caption: p.caption })),
        ...uploadedPhotos,
      ];

      // Identificar URLs eliminadas
      const currentUrls = fotos.filter((f) => f.isExisting).map((f) => f.url);
      const deletedImageUrls = originalUrls.current.filter(
        (url) => !currentUrls.includes(url)
      );

      // PASO 2: Guardar en la base de datos
      setSubmitProgress("Guardando en la base de datos...");

      const requestBody = {
        title: titulo,
        slug,
        description: descripcion || undefined,
        youtubeVideoId: videoId || undefined,
        images: allImages,
        deletedImageUrls: recuerdo ? deletedImageUrls : undefined,
      };

      const apiUrl = recuerdo
        ? `/api/memorials/${recuerdo.id}`
        : "/api/memorials";

      const response = await fetch(apiUrl, {
        method: recuerdo ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error guardando el recuerdo");
      }

      // PASO 3: Eliminar fotos antiguas de S3 (las que fueron removidas)
      if (deletedImageUrls.length > 0) {
        setSubmitProgress("Limpiando fotos antiguas...");
        for (const url of deletedImageUrls) {
          try {
            await deleteFromS3(url);
          } catch {
            console.warn("Error eliminando foto de S3:", url);
          }
        }
      }

      // Éxito
      setSubmitProgress("¡Guardado exitosamente!");

      // Notificar al dashboard
      onSave({
        id: data.memorial.id,
        title: data.memorial.title,
        slug: data.memorial.slug,
        description: data.memorial.description,
        youtubeVideoId: data.memorial.youtubeVideoId,
        fotos: data.memorial.fotos,
        createdAt: new Date(data.memorial.createdAt),
        updatedAt: new Date(data.memorial.updatedAt),
      });
    } catch (err) {
      console.error("Error en el proceso de guardado:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");

      // Cleanup: Eliminar fotos ya subidas si falló
      if (uploadedUrls.length > 0) {
        setSubmitProgress("Limpiando archivos subidos...");
        for (const url of uploadedUrls) {
          try {
            await deleteFromS3(url);
          } catch {
            console.warn("Error en cleanup:", url);
          }
        }
      }
    } finally {
      setIsSubmitting(false);
      setSubmitProgress("");
    }
  };

  return (
    <div className="min-h-screen bg-background relative">
      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-8 max-w-md w-full mx-4 text-center shadow-xl">
            <Loader2 className="h-12 w-12 animate-spin-clockwise animate-iteration-count-infinite mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">
              Guardando recuerdo...
            </h3>
            <p className="text-muted-foreground">{submitProgress}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancel}
              disabled={isSubmitting}
            >
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
          {/* Error Message */}
          {error && (
            <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

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
                    disabled={isSubmitting}
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
                      disabled={isSubmitting}
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
                    disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
              <p className="text-sm text-muted-foreground mb-2">
                Las imágenes mayores a 5MB serán comprimidas automáticamente.
              </p>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`mt-1.5 flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground"
                } ${isSubmitting ? "pointer-events-none opacity-50" : ""}`}
              >
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                  id="photo-upload"
                  disabled={isSubmitting}
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
                    PNG, JPG hasta 10MB (se comprimen a 5MB)
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
                        disabled={isSubmitting}
                        className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-50"
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
                        disabled={isSubmitting}
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
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin-clockwise animate-iteration-count-infinite" />
                    Guardando...
                  </>
                ) : (
                  "Guardar Cambios"
                )}
              </Button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
