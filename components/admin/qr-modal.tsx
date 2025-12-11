"use client";

import { useRef, useEffect, useState } from "react";
import { Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { Recuerdo } from "./admin-dashboard";

interface QRModalProps {
  recuerdo: Recuerdo;
  onClose: () => void;
}

export function QRModal({ recuerdo, onClose }: QRModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showName, setShowName] = useState(true);
  const [qrLoaded, setQrLoaded] = useState(false);

  const qrUrl = `${
    typeof window !== "undefined" ? window.location.origin : ""
  }/recuerdo/${recuerdo.slug}`;

  useEffect(() => {
    const loadQRCode = async () => {
      const QRCode = (await import("qrcode")).default;
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const size = 280;
        const padding = 20;
        const nameHeight = showName ? 40 : 0;
        canvas.width = size + padding * 2;
        canvas.height = size + padding * 2 + nameHeight;

        // Fondo blanco
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Generar QR
        const qrCanvas = document.createElement("canvas");
        await QRCode.toCanvas(qrCanvas, qrUrl, {
          width: size,
          margin: 0,
          color: {
            dark: "#000000",
            light: "#ffffff",
          },
        });

        // Dibujar QR
        ctx.drawImage(qrCanvas, padding, padding);

        // Nombre opcional
        if (showName) {
          ctx.fillStyle = "#000000";
          ctx.font = "bold 16px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(
            recuerdo.title,
            canvas.width / 2,
            size + padding + 28,
            canvas.width - padding * 2
          );
        }

        setQrLoaded(true);
      }
    };

    loadQRCode();
  }, [qrUrl, recuerdo.title, showName]);

  const downloadAs = (format: "png" | "svg") => {
    if (!canvasRef.current) return;

    if (format === "png") {
      const link = document.createElement("a");
      link.download = `qr-${recuerdo.slug}.png`;
      link.href = canvasRef.current.toDataURL("image/png");
      link.click();
    } else {
      // Para SVG, generamos uno simple
      const svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" width="320" height="${
          showName ? 360 : 320
        }" viewBox="0 0 320 ${showName ? 360 : 320}">
          <rect width="100%" height="100%" fill="white"/>
          <image href="${canvasRef.current.toDataURL(
            "image/png"
          )}" width="320" height="${showName ? 360 : 320}"/>
        </svg>
      `;
      const blob = new Blob([svgContent], { type: "image/svg+xml" });
      const link = document.createElement("a");
      link.download = `qr-${recuerdo.slug}.svg`;
      link.href = URL.createObjectURL(blob);
      link.click();
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Código QR</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center py-4">
          {/* QR Canvas */}
          <div className="rounded-lg border border-border bg-white p-4">
            <canvas ref={canvasRef} className="max-w-full" />
          </div>

          {/* URL */}
          <p className="mt-3 text-center text-sm text-muted-foreground">
            {qrUrl}
          </p>

          {/* Opciones */}
          <div className="mt-4 flex items-center gap-2">
            <Checkbox
              id="show-name"
              checked={showName}
              onCheckedChange={(checked) => setShowName(checked === true)}
            />
            <Label htmlFor="show-name" className="text-sm">
              Mostrar nombre debajo del QR
            </Label>
          </div>

          {/* Botones de acción */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => downloadAs("png")}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Descargar PNG
            </Button>
            <Button
              variant="outline"
              onClick={() => downloadAs("svg")}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Descargar SVG
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
