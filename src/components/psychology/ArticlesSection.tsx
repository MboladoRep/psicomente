'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  Calendar,
  Share2,
  Instagram,
  Twitter,
  Link2,
  MessageCircle,
  X,
  Check,
  Eye
} from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { useToast } from '@/hooks/use-toast';

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
  image_url?: string;
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

// Imágenes por defecto para categorías
const defaultImages: Record<string, string> = {
  ansiedad: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
  depresion: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=600&h=400&fit=crop',
  relaciones: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=400&fit=crop',
  autoestima: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&h=400&fit=crop',
  estres: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop',
  mindfulness: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=400&fit=crop',
  desarrollo: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=600&h=400&fit=crop',
};

export default function ArticlesSection() {
  const { user } = useUser();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [articleToShare, setArticleToShare] = useState<Article | null>(null);
  const [copied, setCopied] = useState(false);

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

  const getImageUrl = (article: Article) => {
    return article.image_url || defaultImages[article.category] || defaultImages.ansiedad;
  };

  const openShareDialog = (article: Article, e: React.MouseEvent) => {
    e.stopPropagation();
    setArticleToShare(article);
    setShowShareDialog(true);
    setCopied(false);
  };

  const shareToInstagram = () => {
    if (!articleToShare) return;
    // Instagram no permite compartir enlaces directamente, pero podemos copiar el enlace
    // y mostrar instrucciones
    const text = `${articleToShare.title}\n\n${articleToShare.excerpt}\n\nLee más en PsicoMente`;
    navigator.clipboard.writeText(text);
    toast({
      title: '¡Copiado!',
      description: 'El texto se ha copiado. Pégalo en tu historia o publicación de Instagram.',
    });
    setShowShareDialog(false);
  };

  const shareToTwitter = () => {
    if (!articleToShare) return;
    const text = encodeURIComponent(`${articleToShare.title} - PsicoMente`);
    const url = encodeURIComponent(`${window.location.origin}/articulo/${articleToShare.slug}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    setShowShareDialog(false);
  };

  const shareToWhatsApp = () => {
    if (!articleToShare) return;
    const text = encodeURIComponent(`📖 ${articleToShare.title}\n\n${articleToShare.excerpt}\n\nLee más: ${window.location.origin}/articulo/${articleToShare.slug}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
    setShowShareDialog(false);
  };

  const copyLink = () => {
    if (!articleToShare) return;
    const url = `${window.location.origin}/articulo/${articleToShare.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast({
      title: '¡Enlace copiado!',
      description: 'El enlace se ha copiado al portapapeles.',
    });
  };

  const displayArticles = filteredArticles.length > 0 ? filteredArticles : getPlaceholderArticles();

  return (
    <section id="articulos" className="py-16 bg-gradient-to-b from-background to-purple-500/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-2 bg-purple-500/10">
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
              className={selectedCategory === cat.id ? 'bg-gradient-to-r from-purple-600 to-pink-500' : ''}
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : (
          /* Articles Grid */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayArticles.map((article) => {
              const Icon = getCategoryIcon(article.category);
              const isPremium = article.views > 100;
              const canAccess = !isPremium || user?.isPremium;
              
              return (
                <Card 
                  key={article.id} 
                  className={`group cursor-pointer transition-all hover:shadow-lg overflow-hidden ${isPremium && !user?.isPremium ? 'relative' : ''}`}
                  onClick={() => canAccess && setSelectedArticle(article)}
                >
                  {/* Article Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={getImageUrl(article)} 
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    
                    {/* Category Badge on Image */}
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-purple-600/90 text-white">
                        {getCategoryLabel(article.category)}
                      </Badge>
                    </div>

                    {/* Share Button */}
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute top-3 right-3 h-8 w-8 bg-white/90 hover:bg-white"
                      onClick={(e) => openShareDialog(article, e)}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>

                    {/* Views Badge */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-1 text-white text-xs">
                      <Eye className="h-3 w-3" />
                      {article.views || 0}
                    </div>

                    {/* Premium Overlay */}
                    {isPremium && !user?.isPremium && (
                      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                        <div className="text-center">
                          <Crown className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                          <p className="text-sm font-medium">Premium</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg line-clamp-2 group-hover:text-purple-600 transition-colors">
                      {article.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {article.excerpt || article.content?.substring(0, 100) + '...'}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {article.read_time} min
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(article.created_at)}
                        </span>
                      </div>
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
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

      {/* Article Detail Dialog */}
      <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedArticle && (
            <>
              {selectedArticle.image_url && (
                <div className="relative h-64 -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-lg">
                  <img 
                    src={getImageUrl(selectedArticle)} 
                    alt={selectedArticle.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <Badge className="bg-purple-600 text-white mb-2">
                      {getCategoryLabel(selectedArticle.category)}
                    </Badge>
                    <h2 className="text-2xl font-bold text-white">{selectedArticle.title}</h2>
                  </div>
                </div>
              )}
              
              <DialogHeader>
                {!selectedArticle.image_url && (
                  <DialogTitle className="text-xl">{selectedArticle.title}</DialogTitle>
                )}
                <DialogDescription className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {selectedArticle.read_time} min de lectura
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(selectedArticle.created_at)}
                  </span>
                </DialogDescription>
              </DialogHeader>

              <div className="prose prose-sm max-w-none dark:prose-invert mt-4">
                {selectedArticle.content?.split('\n').map((paragraph, idx) => (
                  <p key={idx} className="mb-4 text-muted-foreground leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Share Buttons */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <span className="text-sm text-muted-foreground">Compartir:</span>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setArticleToShare(selectedArticle);
                      shareToInstagram();
                    }}
                  >
                    <Instagram className="h-4 w-4 mr-1" />
                    Instagram
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setArticleToShare(selectedArticle);
                      shareToTwitter();
                    }}
                  >
                    <Twitter className="h-4 w-4 mr-1" />
                    Twitter
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setArticleToShare(selectedArticle);
                      shareToWhatsApp();
                    }}
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    WhatsApp
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-purple-600" />
              Compartir artículo
            </DialogTitle>
            <DialogDescription>
              {articleToShare?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 mt-4">
            <Button 
              onClick={shareToInstagram}
              className="justify-start bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:opacity-90"
            >
              <Instagram className="h-5 w-5 mr-3" />
              Compartir en Instagram
            </Button>
            
            <Button 
              onClick={shareToTwitter}
              variant="outline"
              className="justify-start"
            >
              <Twitter className="h-5 w-5 mr-3 text-sky-500" />
              Compartir en Twitter
            </Button>
            
            <Button 
              onClick={shareToWhatsApp}
              variant="outline"
              className="justify-start"
            >
              <MessageCircle className="h-5 w-5 mr-3 text-green-500" />
              Compartir en WhatsApp
            </Button>
            
            <Button 
              onClick={copyLink}
              variant="outline"
              className="justify-start"
            >
              {copied ? (
                <>
                  <Check className="h-5 w-5 mr-3 text-green-500" />
                  ¡Enlace copiado!
                </>
              ) : (
                <>
                  <Link2 className="h-5 w-5 mr-3" />
                  Copiar enlace
                </>
              )}
            </Button>
          </div>

          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Tip para Instagram:</strong> El texto se ha copiado al portapapeles. 
              Puedes pegarlo en tu historia o crear una publicación con la imagen del artículo.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

// Artículos de placeholder
function getPlaceholderArticles(): Article[] {
  return [
    {
      id: '1',
      title: 'Cómo manejar la ansiedad en el día a día',
      slug: 'como-manejar-ansiedad',
      content: 'La ansiedad es una respuesta natural del cuerpo ante situaciones percibidas como amenazantes. Sin embargo, cuando esta respuesta se activa con demasiada frecuencia, puede interferir con nuestra calidad de vida.\n\nEn este artículo exploraremos técnicas prácticas y efectivas para manejar los síntomas de ansiedad.\n\nLa respiración profunda es una de las herramientas más poderosas. Cuando ansiamos, nuestra respiración se vuelve superficial y rápida. Al conscientemente reducir la velocidad y profundizar nuestra respiración, enviamos una señal a nuestro cerebro de que estamos seguros.',
      excerpt: 'Aprende técnicas prácticas y efectivas para controlar los síntomas de ansiedad.',
      category: 'ansiedad',
      tags: ['ansiedad', 'bienestar'],
      read_time: 5,
      is_featured: false,
      views: 0,
      created_at: new Date().toISOString(),
      image_url: defaultImages.ansiedad,
    },
    {
      id: '2',
      title: 'La importancia de la autoestima en las relaciones',
      slug: 'autoestima-relaciones',
      content: 'La autoestima juega un papel fundamental en cómo nos relacionamos con los demás. Una autoestima saludable nos permite establecer límites adecuados, comunicarnos de forma efectiva y mantener relaciones equilibradas.\n\nCuando valoramos quiénes somos, no necesitamos la aprobación constante de otros, lo que nos permite ser auténticos en nuestras interacciones.',
      excerpt: 'Descubre cómo tu autoestima influye en tus relaciones interpersonales.',
      category: 'autoestima',
      tags: ['autoestima', 'relaciones'],
      read_time: 7,
      is_featured: false,
      views: 0,
      created_at: new Date().toISOString(),
      image_url: defaultImages.autoestima,
    },
    {
      id: '3',
      title: 'Mindfulness para principiantes: Guía completa',
      slug: 'mindfulness-principiantes',
      content: 'El mindfulness o atención plena es una práctica que nos ayuda a estar presentes en el momento actual, reduciendo el estrés y mejorando nuestro bienestar emocional.\n\nPara comenzar, puedes practicar solo 5 minutos al día. Siéntate cómodamente, cierra los ojos y enfócate en tu respiración. Cuando tu mente divague, suavemente trae tu atención de vuelta a la respiración.',
      excerpt: 'Una introducción detallada a las técnicas de mindfulness.',
      category: 'mindfulness',
      tags: ['mindfulness', 'meditación'],
      read_time: 10,
      is_featured: true,
      views: 150,
      created_at: new Date().toISOString(),
      image_url: defaultImages.mindfulness,
    },
  ];
}
