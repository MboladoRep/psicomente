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
  title: "PsicoMente | Bienestar Psicológico",
  description: "Plataforma integral de psicología y bienestar emocional. Consultas con IA, recursos educativos, diario emocional, tests psicológicos y técnicas de mindfulness. Versión gratuita y premium disponible.",
  keywords: ["psicología", "bienestar", "salud mental", "terapia online", "mindfulness", "tests psicológicos", "apoyo emocional", "consulta psicológica"],
  authors: [{ name: "PsicoMente Team" }],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-v2.png", type: "image/png", sizes: "1024x1024" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
  },
  openGraph: {
    title: "PsicoMente | Tu Bienestar Mental",
    description: "Consultas psicológicas con IA, recursos educativos y herramientas para tu bienestar emocional",
    type: "website",
    images: ["/favicon-v2.png"],
  },
  twitter: {
    card: "summary",
    title: "PsicoMente | Bienestar Psicológico",
    description: "Consultas psicológicas con IA, recursos educativos y herramientas para tu bienestar emocional",
    images: ["/favicon-v2.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" key="favicon" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" key="apple-icon" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
