import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Memory Agencia | Gestión de Recuerdos Digitales",
    template: "%s | Memory Agencia",
  },
  description:
    "Plataforma de gestión de memoriales digitales. Crea, organiza y comparte recuerdos de manera elegante con galerías interactivas, códigos QR y más.",
  keywords: [
    "memoriales digitales",
    "recuerdos",
    "galería de fotos",
    "QR code",
    "homenaje digital",
    "memoria",
  ],
  authors: [{ name: "Memory Agencia" }],
  creator: "Memory Agencia",
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "Memory Agencia",
    title: "Memory Agencia | Gestión de Recuerdos Digitales",
    description:
      "Plataforma de gestión de memoriales digitales. Crea, organiza y comparte recuerdos de manera elegante.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
