"use client"; // Necesario porque usamos interactividad (useState)

import { useState } from "react";

export default function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);

    try {
      // PASO 1: Pedirle a NUESTRO backend la URL firmada
      const response = await fetch("/api/upload", {
        method: "POST",
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
        }),
      });

      const { uploadUrl, fileUrl } = await response.json();

      // PASO 2: Usar esa URL para subir la imagen DIRECTO a AWS S3
      // Nota: Aquí no usamos JSON, enviamos el archivo crudo (file)
      await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      // ¡Listo! La imagen está en S3.
      // Aquí guardarías 'fileUrl' en tu base de datos Turso
      setImageUrl(fileUrl);
      alert("¡Imagen subida con éxito!");
    } catch (error) {
      console.error("Error subiendo imagen:", error);
      alert("Hubo un error al subir la imagen");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 border rounded shadow-md max-w-md mx-auto mt-10">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
        />

        <button
          type="submit"
          disabled={!file || uploading}
          className="bg-blue-600 text-white py-2 px-4 rounded disabled:opacity-50"
        >
          {uploading ? "Subiendo..." : "Subir Recuerdo"}
        </button>
      </form>

      {/* Vista previa si ya se subió */}
      {imageUrl && (
        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-2">Imagen disponible en:</p>
          <img
            src={imageUrl}
            alt="Recuerdo subido"
            className="w-full rounded"
          />
        </div>
      )}
    </div>
  );
}
