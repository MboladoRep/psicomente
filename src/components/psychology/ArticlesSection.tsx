'use client';

import { useState, useEffect, useRef } from 'react';
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
  Check,
  Eye,
  Download,
  Image as ImageIcon,
  ExternalLink
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

const categoryColors: Record<string, string> = {
  ansiedad: '#7C3AED',
  depresion: '#3B82F6',
  relaciones: '#EC4899',
  autoestima: '#F59E0B',
  estres: '#10B981',
  mindfulness: '#8B5CF6',
  desarrollo: '#06B6D4',
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
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  const getCategoryColor = (category: string) => {
    return categoryColors[category] || '#7C3AED';
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

  // Generar imagen para Instagram (1080x1080 cuadrado)
  const generateInstagramImage = async () => {
    if (!articleToShare || !canvasRef.current) return;
    
    setIsGeneratingImage(true);
    
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Tamaño Instagram Feed (1080x1080)
      canvas.width = 1080;
      canvas.height = 1080;

      const color = getCategoryColor(articleToShare.category);

      // Fondo con gradiente
      const gradient = ctx.createLinearGradient(0, 0, 1080, 1080);
      gradient.addColorStop(0, color + '20');
      gradient.addColorStop(1, '#FFFFFF');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 1080, 1080);

      // Cargar y dibujar imagen del artículo
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise<void>((resolve) => {
        img.onload = () => {
          // Dibujar imagen circular en la parte superior
          ctx.save();
          ctx.beginPath();
          ctx.arc(540, 280, 180, 0, Math.PI * 2);
          ctx.closePath();
          ctx.clip();
          
          // Escalar y centrar imagen
          const scale = Math.max(360 / img.width, 360 / img.height);
          const x = 540 - (img.width * scale) / 2;
          const y = 280 - (img.height * scale) / 2;
          ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
          ctx.restore();
          
          // Borde de la imagen
          ctx.beginPath();
          ctx.arc(540, 280, 180, 0, Math.PI * 2);
          ctx.strokeStyle = color;
          ctx.lineWidth = 6;
          ctx.stroke();
          
          resolve();
        };
        img.onerror = () => resolve();
        img.src = getImageUrl(articleToShare);
      });

      // Categoría badge
      ctx.fillStyle = color;
      roundRect(ctx, 400, 500, 280, 45, 22);
      ctx.fill();
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(getCategoryLabel(articleToShare.category).toUpperCase(), 540, 530);

      // Título
      ctx.fillStyle = '#1F2937';
      ctx.font = 'bold 42px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      
      // Dividir título en líneas
      const titleLines = wrapText(ctx, articleToShare.title, 900);
      let titleY = 600;
      titleLines.forEach((line: string) => {
        ctx.fillText(line, 540, titleY);
        titleY += 55;
      });

      // Extracto
      ctx.fillStyle = '#6B7280';
      ctx.font = '26px system-ui, -apple-system, sans-serif';
      const excerptLines = wrapText(ctx, articleToShare.excerpt || '', 850);
      let excerptY = titleY + 30;
      excerptLines.slice(0, 3).forEach((line: string) => {
        ctx.fillText(line, 540, excerptY);
        excerptY += 38;
      });

      // Logo y URL
      ctx.fillStyle = color;
      ctx.font = 'bold 32px system-ui, -apple-system, sans-serif';
      ctx.fillText('🧠 PsicoMente', 540, 950);

      ctx.fillStyle = '#9CA3AF';
      ctx.font = '22px system-ui, -apple-system, sans-serif';
      ctx.fillText('psicamente.com', 540, 990);

      // Tiempo de lectura
      ctx.fillStyle = '#9CA3AF';
      ctx.font = '20px system-ui, -apple-system, sans-serif';
      ctx.fillText(`${articleToShare.read_time} min de lectura`, 540, 1020);

      // Descargar imagen
      const link = document.createElement('a');
      link.download = `psicomente-${articleToShare.slug}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      toast({
        title: '¡Imagen descargada! 📸',
        description: 'Ya puedes subirla a tu Instagram. El texto también se ha copiado.',
      });

      // También copiar el texto
      const shareText = `${articleToShare.title}\n\n${articleToShare.excerpt}\n\n📖 Lee el artículo completo en PsicoMente\n🔗 psicamente.com/articulo/${articleToShare.slug}`;
      navigator.clipboard.writeText(shareText);

    } catch (error) {
      console.error('Error generating image:', error);
      toast({
        title: 'Error',
        description: 'No se pudo generar la imagen',
        variant: 'destructive',
      });
    }
    
    setIsGeneratingImage(false);
    setShowShareDialog(false);
  };

  // Función helper para dibujar rectángulos redondeados
  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  // Función para dividir texto en líneas
  function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    words.forEach(word => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines;
  }

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
      {/* Canvas oculto para generar imágenes */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayArticles.map((article) => {
              const Icon = getCategoryIcon(article.category);
              const isPremium = article.views > 100;
              const canAccess = !isPremium || user?.isPremium;
              
              return (
                <Card 
                  key={article.id} 
                  className="group cursor-pointer transition-all hover:shadow-lg overflow-hidden"
                  onClick={() => canAccess && setSelectedArticle(article)}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={getImageUrl(article)} 
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-purple-600/90 text-white">
                        {getCategoryLabel(article.category)}
                      </Badge>
                    </div>

                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute top-3 right-3 h-8 w-8 bg-white/90 hover:bg-white"
                      onClick={(e) => openShareDialog(article, e)}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>

                    <div className="absolute bottom-3 right-3 flex items-center gap-1 text-white text-xs">
                      <Eye className="h-3 w-3" />
                      {article.views || 0}
                    </div>

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
              
              <DialogHeader>
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

              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <span className="text-sm text-muted-foreground">Compartir:</span>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setArticleToShare(selectedArticle);
                      setShowShareDialog(true);
                    }}
                    className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white border-0"
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

      {/* Share Dialog con Instagram mejorado */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Instagram className="h-5 w-5 text-pink-500" />
              Compartir en Instagram
            </DialogTitle>
            <DialogDescription>
              {articleToShare?.title}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Opción principal: Descargar imagen */}
            <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-200">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-purple-100">
                  <ImageIcon className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Imagen lista para Instagram</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Se descargará una imagen de 1080x1080 optimizada con el título, extracto y tu marca.
                  </p>
                </div>
              </div>
              
              <Button 
                onClick={generateInstagramImage}
                disabled={isGeneratingImage}
                className="w-full mt-3 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 hover:opacity-90"
              >
                {isGeneratingImage ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generando imagen...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Descargar imagen para Instagram
                  </>
                )}
              </Button>
            </div>

            {/* Pasos */}
            <div className="text-xs text-muted-foreground space-y-2 p-3 bg-muted/50 rounded-lg">
              <p className="font-medium text-foreground">¿Cómo subir a Instagram?</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Descarga la imagen</li>
                <li>Abre Instagram</li>
                <li>Crea un nuevo post o historia</li>
                <li>Selecciona la imagen descargada</li>
                <li>Pega el texto que se copió automáticamente</li>
              </ol>
            </div>

            {/* Otras opciones */}
            <div className="border-t pt-4">
              <p className="text-xs text-muted-foreground mb-3">Otras formas de compartir:</p>
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  onClick={shareToTwitter}
                  variant="outline"
                  size="sm"
                >
                  <Twitter className="h-4 w-4 mr-1" />
                  Twitter
                </Button>
                <Button 
                  onClick={shareToWhatsApp}
                  variant="outline"
                  size="sm"
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  WhatsApp
                </Button>
                <Button 
                  onClick={copyLink}
                  variant="outline"
                  size="sm"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Link2 className="h-4 w-4 mr-1" />
                      Copiar
                    </>
                  )}
                </Button>
              </div>
            </div>
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
      content: 'La autoestima juega un papel fundamental en cómo nos relacionamos con los demás. Una autoestima saludable nos permite establecer límites adecuados, comunicarnos de forma efectiva y mantener relaciones equilibradas.',
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
      content: 'El mindfulness o atención plena es una práctica que nos ayuda a estar presentes en el momento actual, reduciendo el estrés y mejorando nuestro bienestar emocional.',
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
