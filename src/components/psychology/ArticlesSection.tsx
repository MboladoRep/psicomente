'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
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
  Share2,
  Download,
  Link2,
  Instagram,
  Twitter,
  MessageCircle,
  Eye,
  Image as ImageIcon,
  Smartphone
} from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { useToast } from '@/hooks/use-toast';
import {
  generateShareImage,
  generateShareFile,
  downloadShareImage,
  nativeShare,
  SITE_URL,
  isMobile,
  isIOS,
  canShareFiles,
  openImageFullscreen,
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

const defaultImages: Record<string, string> = {
  ansiedad: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  depresion: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&q=80',
  relaciones: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
  autoestima: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
  estres: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
  mindfulness: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
  desarrollo: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80',
};

const INITIAL_LIMIT = 9;
const LOAD_MORE_COUNT = 9;

export default function ArticlesSection() {
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [totalArticles, setTotalArticles] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [shareSheetOpen, setShareSheetOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const [isIOSDevice, setIsIOSDevice] = useState(false);

  useEffect(() => {
    fetchArticles();
    setIsMobileDevice(isMobile());
    setIsIOSDevice(isIOS());
  }, []);

  const fetchArticles = async (offset = 0, append = false) => {
    try {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }
      
      const response = await fetch(`/api/articles?limit=${LOAD_MORE_COUNT}&offset=${offset}`);
      const data = await response.json();
      
      if (data.articles) {
        if (append) {
          setArticles(prev => [...prev, ...data.articles]);
        } else {
          setArticles(data.articles);
        }
        setTotalArticles(data.total || data.articles.length);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  const loadMore = () => {
    const newOffset = (currentPage + 1) * LOAD_MORE_COUNT;
    setCurrentPage(prev => prev + 1);
    fetchArticles(newOffset, true);
  };

  const hasMoreArticles = articles.length < totalArticles;

  const filteredArticles = selectedCategory === 'todos' 
    ? articles 
    : articles.filter(a => a.category === selectedCategory);

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
    setShareSheetOpen(true);
  };

  const getArticleUrl = () => {
    if (!selectedArticle) return `https://${SITE_URL}`;
    return `https://${SITE_URL}/articulos/${selectedArticle.slug}`;
  };

  const handleNativeShare = async () => {
    if (!selectedArticle) return;
    
    setIsGeneratingImage(true);
    try {
      const file = await generateShareFile({
        title: selectedArticle.title,
        excerpt: selectedArticle.excerpt || selectedArticle.content?.substring(0, 150),
        category: getCategoryLabel(selectedArticle.category),
        imageUrl: getArticleImage(selectedArticle),
      });
      
      const shared = await nativeShare(
        file,
        selectedArticle.title,
        `Lee este artículo en PsicoMente: ${getArticleUrl()}`
      );
      
      if (shared) {
        setShareSheetOpen(false);
        toast({ title: '¡Compartido!', description: 'El artículo se ha compartido correctamente' });
      } else {
        const blob = await generateShareImage({
          title: selectedArticle.title,
          excerpt: selectedArticle.excerpt || selectedArticle.content?.substring(0, 150),
          category: getCategoryLabel(selectedArticle.category),
          imageUrl: getArticleImage(selectedArticle),
        });
        openImageFullscreen(blob);
        setShareSheetOpen(false);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({ title: 'Error', description: 'No se pudo compartir la imagen', variant: 'destructive' });
    } finally {
      setIsGeneratingImage(false);
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
      
      if (isMobileDevice && canShareFiles()) {
        const file = new File([blob], 'articulo.png', { type: 'image/png' });
        const shared = await nativeShare(file, selectedArticle.title, '');
        
        if (shared) {
          setShareSheetOpen(false);
          toast({ title: '¡Compartido!', description: 'Selecciona Instagram de la lista' });
          setIsGeneratingImage(false);
          return;
        }
      }
      
      if (isIOSDevice) {
        openImageFullscreen(blob);
        setShareSheetOpen(false);
        toast({ title: 'Consejo', description: 'Mantén pulsada la imagen para guardarla' });
      } else {
        const filename = `psicomente-${selectedArticle.slug || selectedArticle.id}.png`;
        downloadShareImage(blob, filename);
        toast({ title: 'Imagen descargada', description: 'Ábrela en Instagram para publicarla' });
      }
      
      const shareText = `${selectedArticle.title}\n\n${selectedArticle.excerpt || ''}\n\n🔗 ${SITE_URL}`;
      await navigator.clipboard.writeText(shareText);
      
    } catch (error) {
      console.error('Error:', error);
      toast({ title: 'Error', description: 'No se pudo preparar la imagen', variant: 'destructive' });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleTwitterShare = () => {
    if (!selectedArticle) return;
    const text = encodeURIComponent(`${selectedArticle.title}\n\nLee más en PsicoMente:`);
    const url = encodeURIComponent(getArticleUrl());
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    setShareSheetOpen(false);
  };

  const handleWhatsAppShare = () => {
    if (!selectedArticle) return;
    const text = encodeURIComponent(`${selectedArticle.title}\n\nLee este artículo en PsicoMente: ${getArticleUrl()}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
    setShareSheetOpen(false);
  };

  const handleCopyLink = async () => {
    if (!selectedArticle) return;
    try {
      await navigator.clipboard.writeText(getArticleUrl());
      toast({ title: 'Enlace copiado', description: 'El enlace se ha copiado al portapapeles' });
      setShareSheetOpen(false);
    } catch {
      toast({ title: 'Error', description: 'No se pudo copiar el enlace', variant: 'destructive' });
    }
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
      toast({ title: 'Imagen descargada', description: 'La imagen se ha guardado en tu dispositivo' });
    } catch {
      toast({ title: 'Error', description: 'No se pudo generar la imagen', variant: 'destructive' });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const ShareOptions = () => (
    <div className="grid gap-2">
      {isMobileDevice && canShareFiles() && (
        <Button variant="default" className="w-full justify-start gap-3 h-14 text-left" onClick={handleNativeShare} disabled={isGeneratingImage}>
          {isGeneratingImage ? <Loader2 className="h-5 w-5 animate-spin" /> : <Share2 className="h-5 w-5" />}
          <div>
            <div className="font-medium">Compartir</div>
            <div className="text-xs opacity-80">Selecciona Instagram, WhatsApp...</div>
          </div>
        </Button>
      )}
      
      <Button variant="outline" className="w-full justify-start gap-3 h-14 text-left" onClick={handleInstagramShare} disabled={isGeneratingImage}>
        {isGeneratingImage ? <Loader2 className="h-5 w-5 animate-spin" /> : <Instagram className="h-5 w-5 text-pink-500" />}
        <div>
          <div className="font-medium">Instagram</div>
          <div className="text-xs text-muted-foreground">{isIOSDevice ? 'Mantén pulsado para guardar' : 'Descargar imagen para subir'}</div>
        </div>
      </Button>
      
      <Button variant="outline" className="w-full justify-start gap-3 h-14 text-left" onClick={handleWhatsAppShare}>
        <MessageCircle className="h-5 w-5 text-green-500" />
        <div>
          <div className="font-medium">WhatsApp</div>
          <div className="text-xs text-muted-foreground">Compartir enlace</div>
        </div>
      </Button>
      
      <Button variant="outline" className="w-full justify-start gap-3 h-14 text-left" onClick={handleTwitterShare}>
        <Twitter className="h-5 w-5 text-sky-500" />
        <div>
          <div className="font-medium">Twitter / X</div>
          <div className="text-xs text-muted-foreground">Compartir enlace</div>
        </div>
      </Button>
      
      <Button variant="outline" className="w-full justify-start gap-3 h-14 text-left" onClick={handleCopyLink}>
        <Link2 className="h-5 w-5" />
        <div>
          <div className="font-medium">Copiar enlace</div>
          <div className="text-xs text-muted-foreground">{SITE_URL}</div>
        </div>
      </Button>
      
      {(!isMobileDevice || !canShareFiles()) && (
        <Button variant="outline" className="w-full justify-start gap-3 h-14 text-left" onClick={handleDownloadImage} disabled={isGeneratingImage}>
          {isGeneratingImage ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
          <div>
            <div className="font-medium">Descargar imagen</div>
            <div className="text-xs text-muted-foreground">Guardar en dispositivo</div>
          </div>
        </Button>
      )}
    </div>
  );

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
            {totalArticles > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                {totalArticles} artículos disponibles
              </p>
            )}
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
            <>
              {/* Articles Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredArticles.map((article) => {
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
                        
                        <Button
                          size="icon"
                          variant="secondary"
                          className={`absolute top-3 right-3 ${isMobileDevice ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}
                          onClick={(e) => handleShareClick(article, e)}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                        
                        <Badge variant="secondary" className="absolute bottom-3 left-3 bg-white/90 text-foreground">
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
                          <div className="mt-4 pt-4 border-t text-sm text-muted-foreground" onClick={(e) => e.stopPropagation()}>
                            <div className="prose prose-sm max-w-none dark:prose-invert">
                              {article.content?.split('\n').slice(0, 5).map((paragraph, idx) => (
                                <p key={idx} className="mb-2">{paragraph}</p>
                              ))}
                            </div>
                            <Button 
                              className="w-full mt-4" 
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/articulos/${article.slug}`);
                              }}
                            >
                              Leer artículo completo
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Load More Button */}
              {hasMoreArticles && selectedCategory === 'todos' && (
                <div className="flex justify-center mt-8">
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={loadMore}
                    disabled={isLoadingMore}
                    className="min-w-[200px]"
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Cargando...
                      </>
                    ) : (
                      <>
                        Ver más artículos
                        <ChevronRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Articles count */}
              {!hasMoreArticles && articles.length > 0 && (
                <p className="text-center text-muted-foreground mt-8">
                  Has visto todos los artículos ({articles.length} de {totalArticles})
                </p>
              )}
            </>
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

      {/* Share Sheet */}
      {isMobileDevice ? (
        <Sheet open={shareSheetOpen} onOpenChange={setShareSheetOpen}>
          <SheetContent side="bottom" className="rounded-t-3xl">
            <SheetHeader className="text-left">
              <SheetTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Compartir artículo
              </SheetTitle>
              <SheetDescription className="line-clamp-2">
                {selectedArticle?.title}
              </SheetDescription>
            </SheetHeader>
            
            <div className="mt-6">
              <ShareOptions />
            </div>
            
            <div className="mt-6 p-4 bg-muted/50 rounded-xl">
              <div className="flex items-start gap-3">
                <Smartphone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">Tip para Instagram</p>
                  <p>Comparte la imagen directamente o guárdala en tu galería para subirla a Instagram.</p>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <Dialog open={shareSheetOpen} onOpenChange={setShareSheetOpen}>
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
            
            <div className="py-4">
              <ShareOptions />
            </div>
            
            <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
              <ImageIcon className="h-4 w-4 inline mr-2" />
              La imagen incluirá el título, extracto y marca de agua con <strong>{SITE_URL}</strong>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
