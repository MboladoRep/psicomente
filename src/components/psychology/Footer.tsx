'use client';

import Link from 'next/link';
import { Brain, Heart, Mail, Github, Twitter, Linkedin } from 'lucide-react';
import VersionBadge from '@/components/VersionBadge';

export default function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-purple-600" />
              <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                PsicoMente
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Tu compañero de bienestar mental. Apoyo psicológico accesible para todos.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-3">Recursos</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#articulos" className="hover:text-foreground transition-colors">Artículos</a></li>
              <li><a href="#tests" className="hover:text-foreground transition-colors">Tests</a></li>
              <li><a href="#diario" className="hover:text-foreground transition-colors">Diario</a></li>
              <li><a href="#mindfulness" className="hover:text-foreground transition-colors">Mindfulness</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground transition-colors">Política de Privacidad</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Términos de Servicio</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Aviso Legal</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-3">Contacto</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <a href="mailto:info@psicamente.com" className="hover:text-foreground transition-colors">
                  info@psicamente.com
                </a>
              </li>
            </ul>
            <div className="flex gap-3 mt-4">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            © {new Date().getFullYear()} PsicoMente. Hecho con{' '}
            <Heart className="h-4 w-4 text-red-500 fill-red-500" /> para tu bienestar
          </p>
          <VersionBadge />
        </div>
      </div>
    </footer>
  );
}
