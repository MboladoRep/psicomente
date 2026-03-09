'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Brain, 
  Twitter, 
  Instagram, 
  Linkedin, 
  Sparkles,
  Heart
} from 'lucide-react';
import VersionBadge from '@/components/VersionBadge';

export default function Footer() {
  const footerLinks = [
    {
      title: 'Recursos',
      links: [
        { label: 'Chat Psicológico', href: '#chat' },
        { label: 'Artículos', href: '#articulos' },
        { label: 'Tests', href: '#tests' },
        { label: 'Mindfulness', href: '#mindfulness' },
      ],
    },
    {
      title: 'Empresa',
      links: [
        { label: 'Sobre Nosotros', href: '#' },
        { label: 'Blog', href: '#' },
        { label: 'Carreras', href: '#' },
        { label: 'Contacto', href: '#' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Términos de Servicio', href: '/terminos' },
        { label: 'Política de Privacidad', href: '/privacidad' },
        { label: 'Cookies', href: '/privacidad#cookies' },
        { label: 'Contacto', href: 'mailto:soporte@psicomente.com' },
      ],
    },
  ];

  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/5">
                <Brain className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                PsicoMente
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Tu plataforma de bienestar psicológico. Accede a herramientas profesionales 
              para tu crecimiento personal y salud mental.
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Linkedin className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Links */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left flex items-center gap-1">
            © {new Date().getFullYear()} PsicoMente. Hecho con{' '}
            <Heart className="h-4 w-4 text-red-500 fill-red-500" /> para tu bienestar
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Sparkles className="h-4 w-4 text-purple-500" />
              Cuidando tu mente
            </span>
            <VersionBadge />
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground text-center">
            <strong>Aviso importante:</strong> PsicoMente es una herramienta de apoyo y educación psicológica. 
            No sustituye el diagnóstico, tratamiento o consejo profesional de salud mental. 
            Si estás experimentando una crisis o pensamientos de autolesión, busca ayuda inmediata 
            contactando a los servicios de emergencia de tu localidad o yendo al centro de salud más cercano.
          </p>
        </div>
      </div>
    </footer>
  );
}
