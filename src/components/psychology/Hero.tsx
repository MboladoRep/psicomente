'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  MessageCircle, 
  BookOpen, 
  Target, 
  Heart, 
  TrendingUp,
  ChevronRight,
  Sparkles,
  Shield,
  Clock
} from 'lucide-react';

export default function Hero() {
  const features = [
    { icon: MessageCircle, label: 'Chat con IA', desc: 'Consultas 24/7', href: '#chat' },
    { icon: BookOpen, label: 'Artículos', desc: 'Recursos expertos', href: '#articulos' },
    { icon: Target, label: 'Tests', desc: 'Autoevaluaciones', href: '#tests' },
    { icon: Heart, label: 'Bienestar', desc: 'Mindfulness', href: '#mindfulness' },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="inicio" className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5QzkyQUMiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

      <div className="relative container mx-auto px-4 py-16 lg:py-24">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Content */}
          <div className="flex-1 text-center lg:text-left">
            <Badge variant="secondary" className="mb-4 px-4 py-1.5 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
              <Sparkles className="h-3.5 w-3.5 mr-1.5 text-primary" />
              Tu espacio de bienestar mental
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Tu bienestar mental{' '}
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                comienza aquí
              </span>
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0">
              Accede a consultas psicológicas con IA, recursos educativos, tests de autoevaluación 
              y herramientas de mindfulness. Un espacio seguro para tu crecimiento personal.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <Button size="lg" className="text-lg px-8" asChild>
                <a href="#chat">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Comenzar Gratis
                </a>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8" asChild>
                <a href="#precios">
                  <Sparkles className="h-5 w-5 mr-2" />
                  Ver Planes
                </a>
              </Button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <span>100% Privado</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>Disponible 24/7</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                <span>IA Avanzada</span>
              </div>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="flex-1 w-full max-w-lg">
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  onClick={() => scrollToSection(feature.href)}
                  className="group p-6 rounded-2xl bg-card border shadow-sm hover:shadow-md transition-all hover:scale-105 cursor-pointer"
                >
                  <feature.icon className="h-8 w-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                  <h3 className="font-semibold mb-1">{feature.label}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </div>

            {/* Stats - Datos honestos */}
            <div className="mt-6 p-6 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-primary">24/7</div>
                  <div className="text-xs text-muted-foreground">Disponible</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">100%</div>
                  <div className="text-xs text-muted-foreground">Privado</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-primary">IA</div>
                  <div className="text-xs text-muted-foreground">Experta</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
