import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PsicoMente - Tu Portal de Bienestar Psicológico",
  description: "Plataforma integral de psicología y bienestar emocional. Consultas con IA, recursos educativos, diario emocional, tests psicológicos y técnicas de mindfulness. Versión gratuita y premium disponible.",
  keywords: ["psicología", "bienestar", "salud mental", "terapia online", "mindfulness", "tests psicológicos", "apoyo emocional", "consulta psicológica"],
  authors: [{ name: "PsicoMente Team" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "PsicoMente - Tu Portal de Bienestar Psicológico",
    description: "Consultas psicológicas con IA, recursos educativos y herramientas para tu bienestar emocional",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
