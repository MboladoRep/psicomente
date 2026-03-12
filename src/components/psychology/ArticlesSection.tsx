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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  Download,
  Link2,
  Instagram,
  Twitter,
  MessageCircle,
  Eye,
  Image as ImageIcon,
  Check
} from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { useToast } from '@/hooks/use-toast';
import {
  generateShareImage,
  downloadShareImage,
  shareImage,
  copyImageToClipboard,
} from '@/lib/shareImage';

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

// Imágenes por defecto para cada categoría
const defaultImages: Record<string, string> = {
  ansiedad: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  depresion: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&q=80',
  relaciones: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
  autoestima: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
  estres: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
  mindfulness: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
  desarrollo: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80',
};

export default function ArticlesSection() {
  const { user } = useUser();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

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

  const getArticleImage = (article: Article) => {
    return article.image_url || defaultImages[article.category] || defaultImages.desarrollo;
  };

  const handleShareClick = (article: Article, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedArticle(article);
    setShareDialogOpen(true);
  };

  const handleDownloadImage = async () => {
    if (!selectedArticle) return;
    
    setIsGeneratingImage(true);
    try {
      const blob = await generateShareImage({
        title: selectedArticle.title,
        excerpt: selectedArticle.excerpt || selectedArticle.content?.substring(0, 150),
        category: getCategoryLabel(selectedArticle.category),
        imageUrl: getArticleImage(selectedArticle),
      });
      
      const filename = `psicomente-${selectedArticle.slug || selectedArticle.id}.png`;
      downloadShareImage(blob, filename);
      
      toast({
        title: 'Imagen descargada',
        description: 'La imagen se ha guardado en tu dispositivo',
      });
    } catch (error) {
      console.error('Error generando imagen:', error);
      toast({
        title: 'Error',
        description: 'No se pudo generar la imagen',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleShareNative = async () => {
    if (!selectedArticle) return;
    
    setIsGeneratingImage(true);
    try {
      const blob = await generateShareImage({
        title: selectedArticle.title,
        excerpt: selectedArticle.excerpt || selectedArticle.content?.substring(0, 150),
        category: getCategoryLabel(selectedArticle.category),
        imageUrl: getArticleImage(selectedArticle),
      });
      
      const shared = await shareImage(
        blob,
        selectedArticle.title,
        `Lee este artículo en PsicoMente: ${selectedArticle.title}`
      );
      
      if (!shared) {
        // Si no se pudo compartir nativamente, descargar
        downloadShareImage(blob, `psicomente-${selectedArticle.slug}.png`);
        toast({
          title: 'Imagen descargada',
          description: 'Puedes subirla manualmente a Instagram',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'No se pudo compartir la imagen',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleCopyLink = async () => {
    if (!selectedArticle) return;
    
    const articleUrl = `https://psicomente.vercel.app/articulos/${selectedArticle.slug}`;
    
    try {
      await navigator.clipboard.writeText(articleUrl);
      toast({
        title: 'Enlace copiado',
        description: 'El enlace se ha copiado al portapapeles',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo copiar el enlace',
        variant: 'destructive',
      });
    }
  };

  const handleInstagramShare = async () => {
    if (!selectedArticle) return;
    
    setIsGeneratingImage(true);
    try {
      const blob = await generateShareImage({
        title: selectedArticle.title,
        excerpt: selectedArticle.excerpt || selectedArticle.content?.substring(0, 150),
        category: getCategoryLabel(selectedArticle.category),
        imageUrl: getArticleImage(selectedArticle),
      });
      
      // Descargar la imagen para que el usuario la suba a Instagram
      const filename = `psicomente-${selectedArticle.slug || selectedArticle.id}.png`;
      downloadShareImage(blob, filename);
      
      // También copiar el texto sugerido
      const shareText = `${selectedArticle.title}\n\n${selectedArticle.excerpt || ''}\n\n🔗 psicomente.vercel.app`;
      await navigator.clipboard.writeText(shareText);
      
      toast({
        title: '¡Listo para Instagram!',
        description: 'Imagen descargada y texto copiado. Abre Instagram y sube la imagen.',
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'No se pudo preparar la imagen para Instagram',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleTwitterShare = () => {
    if (!selectedArticle) return;
    
    const text = encodeURIComponent(`${selectedArticle.title}\n\nLee más en PsicoMente:`);
    const url = encodeURIComponent(`https://psicomente.vercel.app/articulos/${selectedArticle.slug}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };

  const handleWhatsAppShare = () => {
    if (!selectedArticle) return;
    
    const text = encodeURIComponent(`${selectedArticle.title}\n\nLee este artículo en PsicoMente: https://psicomente.vercel.app/articulos/${selectedArticle.slug}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // Si no hay artículos en la BD, mostrar placeholder
  const displayArticles = filteredArticles.length > 0 ? filteredArticles : getPlaceholderArticles();

  return (
    <>
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
                const isPremium = article.views > 100;
                const canAccess = !isPremium || user?.isPremium;
                const articleImage = getArticleImage(article);
                
                return (
                  <Card 
                    key={article.id} 
                    className={`group cursor-pointer transition-all hover:shadow-md overflow-hidden ${isPremium && !user?.isPremium ? 'relative' : ''}`}
                    onClick={() => canAccess && setExpandedArticle(isExpanded ? null : article.id)}
                  >
                    {/* Article Image */}
                    <div className="relative h-48 w-full overflow-hidden bg-muted">
                      <img 
                        src={articleImage}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = defaultImages.desarrollo;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      
                      {/* Share button overlay */}
                      <Button
                        size="icon"
                        variant="secondary"
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => handleShareClick(article, e)}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      
                      {/* Category badge on image */}
                      <Badge 
                        variant="secondary" 
                        className="absolute bottom-3 left-3 bg-white/90 text-foreground"
                      >
                        <Icon className="h-3 w-3 mr-1" />
                        {getCategoryLabel(article.category)}
                      </Badge>
                      
                      {isPremium && (
                        <Badge className="absolute bottom-3 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                          <Crown className="h-3 w-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                    </div>
                    
                    {isPremium && !user?.isPremium && (
                      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
                        <div className="text-center p-4">
                          <Crown className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                          <p className="font-medium mb-2">Contenido Premium</p>
                          <Button size="sm" asChild>
                            <a href="#precios">Desbloquear</a>
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg line-clamp-2">{article.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{article.excerpt || article.content?.substring(0, 150) + '...'}</CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {article.read_time} min
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {article.views}
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

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Compartir artículo
            </DialogTitle>
            <DialogDescription>
              {selectedArticle?.title}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-3 py-4">
            {/* Instagram - Download image for manual upload */}
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12"
              onClick={handleInstagramShare}
              disabled={isGeneratingImage}
            >
              {isGeneratingImage ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Instagram className="h-5 w-5 text-pink-500" />
              )}
              <div className="text-left">
                <div className="font-medium">Instagram</div>
                <div className="text-xs text-muted-foreground">Descargar imagen para subir</div>
              </div>
            </Button>
            
            {/* Twitter */}
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12"
              onClick={handleTwitterShare}
            >
              <Twitter className="h-5 w-5 text-sky-500" />
              <div className="text-left">
                <div className="font-medium">Twitter / X</div>
                <div className="text-xs text-muted-foreground">Compartir enlace</div>
              </div>
            </Button>
            
            {/* WhatsApp */}
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12"
              onClick={handleWhatsAppShare}
            >
              <MessageCircle className="h-5 w-5 text-green-500" />
              <div className="text-left">
                <div className="font-medium">WhatsApp</div>
                <div className="text-xs text-muted-foreground">Compartir enlace</div>
              </div>
            </Button>
            
            {/* Copy Link */}
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12"
              onClick={handleCopyLink}
            >
              <Link2 className="h-5 w-5" />
              <div className="text-left">
                <div className="font-medium">Copiar enlace</div>
                <div className="text-xs text-muted-foreground">psicomente.vercel.app</div>
              </div>
            </Button>
            
            {/* Download Image */}
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12"
              onClick={handleDownloadImage}
              disabled={isGeneratingImage}
            >
              {isGeneratingImage ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Download className="h-5 w-5" />
              )}
              <div className="text-left">
                <div className="font-medium">Descargar imagen</div>
                <div className="text-xs text-muted-foreground">Guardar en tu dispositivo</div>
              </div>
            </Button>
          </div>
          
          {/* Preview note */}
          <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
            <ImageIcon className="h-4 w-4 inline mr-2" />
            La imagen incluirá el título, extracto y marca de agua con <strong>psicomente.vercel.app</strong>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Artículos de placeholder mientras se generan los reales
function getPlaceholderArticles(): Article[] {
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
