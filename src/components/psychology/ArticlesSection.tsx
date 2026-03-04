'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Clock, 
  Crown,
  ChevronRight,
  Heart,
  Brain,
  Users,
  Sparkles,
  Loader2,
  Calendar
} from 'lucide-react';
import { useUser } from '@/hooks/useUser';

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  read_time: number;
  is_featured: boolean;
  views: number;
  created_at: string;
}

const categoryIcons: Record<string, typeof Heart> = {
  ansiedad: Heart,
  depresion: Heart,
  relaciones: Users,
  autoestima: Brain,
  estres: Sparkles,
  mindfulness: Sparkles,
  desarrollo: Brain,
};

const categoryLabels: Record<string, string> = {
  ansiedad: 'Ansiedad',
  depresion: 'Depresión',
  relaciones: 'Relaciones',
  autoestima: 'Autoestima',
  estres: 'Estrés',
  mindfulness: 'Mindfulness',
  desarrollo: 'Desarrollo',
};

const categories = [
  { id: 'todos', label: 'Todos' },
  { id: 'ansiedad', label: 'Ansiedad' },
  { id: 'depresion', label: 'Depresión' },
  { id: 'relaciones', label: 'Relaciones' },
  { id: 'autoestima', label: 'Autoestima' },
  { id: 'estres', label: 'Estrés' },
  { id: 'mindfulness', label: 'Mindfulness' },
  { id: 'desarrollo', label: 'Desarrollo' },
];

export default function ArticlesSection() {
  const { user } = useUser();
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/articles?limit=12');
      const data = await response.json();
      if (data.articles) {
        setArticles(data.articles);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredArticles = selectedCategory === 'todos' 
    ? articles 
    : articles.filter(a => a.category === selectedCategory);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const getCategoryIcon = (category: string) => {
    return categoryIcons[category] || BookOpen;
  };

  const getCategoryLabel = (category: string) => {
    return categoryLabels[category] || category;
  };

  // Si no hay artículos en la BD, mostrar placeholder
  const displayArticles = filteredArticles.length > 0 ? filteredArticles : getPlaceholderArticles();

  return (
    <section id="articulos" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-2">
            <BookOpen className="h-3 w-3 mr-1" />
            Centro de Recursos
          </Badge>
          <h2 className="text-3xl font-bold mb-2">Artículos y Guías</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Contenido educativo creado por profesionales para tu bienestar emocional y crecimiento personal.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((cat) => (
            <Button
              key={cat.id}
              size="sm"
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(cat.id)}
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          /* Articles Grid */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayArticles.map((article) => {
              const isExpanded = expandedArticle === article.id;
              const Icon = getCategoryIcon(article.category);
              const isPremium = article.views > 100; // Artículos populares son premium
              const canAccess = !isPremium || user?.isPremium;
              
              return (
                <Card 
                  key={article.id} 
                  className={`group cursor-pointer transition-all hover:shadow-md ${isPremium && !user?.isPremium ? 'relative' : ''}`}
                  onClick={() => canAccess && setExpandedArticle(isExpanded ? null : article.id)}
                >
                  {isPremium && !user?.isPremium && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                      <div className="text-center p-4">
                        <Crown className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                        <p className="font-medium mb-2">Contenido Premium</p>
                        <Button size="sm" asChild>
                          <a href="#precios">Desbloquear</a>
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {getCategoryLabel(article.category)}
                        </Badge>
                        {isPremium && (
                          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs">
                            <Crown className="h-3 w-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-lg mt-3 line-clamp-2">{article.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{article.excerpt || article.content?.substring(0, 150) + '...'}</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {article.read_time} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(article.created_at)}
                        </span>
                      </div>
                      <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                    
                    {isExpanded && canAccess && (
                      <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          {article.content?.split('\n').slice(0, 5).map((paragraph, idx) => (
                            <p key={idx} className="mb-2">{paragraph}</p>
                          ))}
                        </div>
                        <Button className="w-full mt-4" variant="outline">
                          Leer artículo completo
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && articles.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Próximamente más artículos</h3>
            <p className="text-muted-foreground">
              Estamos preparando contenido de calidad. Vuelve pronto.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

// Artículos de placeholder mientras se generan los reales
function getPlaceholderArticles() {
  return [
    {
      id: '1',
      title: 'Cómo manejar la ansiedad en el día a día',
      slug: 'como-manejar-ansiedad',
      content: 'La ansiedad es una respuesta natural del cuerpo ante situaciones percibidas como amenazantes. Sin embargo, cuando esta respuesta se activa con demasiada frecuencia, puede interferir con nuestra calidad de vida.',
      excerpt: 'Aprende técnicas prácticas y efectivas para controlar los síntomas de ansiedad.',
      category: 'ansiedad',
      tags: ['ansiedad', 'bienestar'],
      read_time: 5,
      is_featured: false,
      views: 0,
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      title: 'La importancia de la autoestima en las relaciones',
      slug: 'autoestima-relaciones',
      content: 'La autoestima juega un papel fundamental en cómo nos relacionamos con los demás. Una autoestima saludable nos permite establecer límites adecuados y comunicarnos de forma efectiva.',
      excerpt: 'Descubre cómo tu autoestima influye en tus relaciones interpersonales.',
      category: 'autoestima',
      tags: ['autoestima', 'relaciones'],
      read_time: 7,
      is_featured: false,
      views: 0,
      created_at: new Date().toISOString(),
    },
    {
      id: '3',
      title: 'Mindfulness para principiantes: Guía completa',
      slug: 'mindfulness-principiantes',
      content: 'El mindfulness o atención plena es una práctica que nos ayuda a estar presentes en el momento actual, reduciendo el estrés y mejorando nuestro bienestar emocional.',
      excerpt: 'Una introducción detallada a las técnicas de mindfulness.',
      category: 'mindfulness',
      tags: ['mindfulness', 'meditación'],
      read_time: 10,
      is_featured: true,
      views: 150,
      created_at: new Date().toISOString(),
    },
  ];
}
