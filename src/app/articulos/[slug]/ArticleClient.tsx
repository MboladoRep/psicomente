'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Clock,
  Eye,
  Heart,
  Brain,
  Users,
  Sparkles,
  BookOpen,
  ArrowLeft,
  Share2,
  Loader2,
  ChevronLeft,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  generateShareImage,
  generateShareFile,
  downloadShareImage,
  nativeShare,
  SITE_URL,
  isMobile,
  canShareFiles,
} from '@/lib/shareImage';
import { ArticleReader } from '@/components/ui/ArticleReader';

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
  desarrollo: 'Desarrollo Personal',
};

const defaultImages: Record<string, string> = {
  ansiedad: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  depresion: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&q=80',
  relaciones: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
  autoestima: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
  estres: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
  mindfulness: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
  desarrollo: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80',
};

interface ArticleClientProps {
  params: Promise<{ slug: string }>;
}

export default function ArticleClient({ params }: ArticleClientProps) {
  const [slug, setSlug] = useState<string>('');
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareSheetOpen, setShareSheetOpen] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    setIsMobileDevice(isMobile());
    params.then(p => setSlug(p.slug));
  }, [params]);

  useEffect(() => {
    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  const fetchArticle = async () => {
    try {
      const response = await fetch(`/api/articles?slug=${slug}`);
      const data = await response.json();

      if (!response.ok) {
        setError('Artículo no encontrado');
        return;
      }

      setArticle(data.article);
    } catch (err) {
      console.error('Error fetching article:', err);
      setError('Error al cargar el artículo');
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    return categoryIcons[category] || BookOpen;
  };

  const getCategoryLabel = (category: string) => {
    return categoryLabels[category] || category;
  };

  const getArticleImage = () => {
    return article?.image_url || defaultImages[article?.category || 'desarrollo'] || defaultImages.desarrollo;
  };

  const getArticleUrl = () => {
    return `https://${SITE_URL}/articulos/${article?.slug}`;
  };

  const handleShareClick = () => {
    setShareSheetOpen(true);
  };

  // Compartir nativo (móviles)
  const handleNativeShare = async () => {
    if (!article) return;

    setIsGeneratingImage(true);
    try {
      const file = await generateShareFile({
        title: article.title,
        excerpt: article.excerpt || article.content?.substring(0, 150),
        category: getCategoryLabel(article.category),
        imageUrl: getArticleImage(),
      });

      const shared = await nativeShare(file, article.title, `Lee este artículo en PsicoMente: ${getArticleUrl()}`);

      if (shared) {
        setShareSheetOpen(false);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Instagram
  const handleInstagramShare = async () => {
    if (!article) return;

    setIsGeneratingImage(true);
    try {
      const blob = await generateShareImage({
        title: article.title,
        excerpt: article.excerpt || article.content?.substring(0, 150),
        category: getCategoryLabel(article.category),
        imageUrl: getArticleImage(),
      });

      if (isMobileDevice && canShareFiles()) {
        const file = new File([blob], 'articulo.png', { type: 'image/png' });
        const shared = await nativeShare(file, article.title, '');
        if (shared) {
          setShareSheetOpen(false);
          setIsGeneratingImage(false);
          return;
        }
      }

      const filename = `psicomente-${article.slug}.png`;
      downloadShareImage(blob, filename);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // WhatsApp
  const handleWhatsAppShare = () => {
    if (!article) return;

    const text = encodeURIComponent(`${article.title}\n\nLee este artículo en PsicoMente: ${getArticleUrl()}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
    setShareSheetOpen(false);
  };

  // Twitter
  const handleTwitterShare = () => {
    if (!article) return;

    const text = encodeURIComponent(`${article.title}\n\nLee más en PsicoMente:`);
    const url = encodeURIComponent(getArticleUrl());
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    setShareSheetOpen(false);
  };

  // Copiar enlace
  const handleCopyLink = async () => {
    if (!article) return;

    try {
      await navigator.clipboard.writeText(getArticleUrl());
      setShareSheetOpen(false);
    } catch (error) {
      console.error('Error copying link:', error);
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error state
  if (error || !article) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
        <h1 className="text-2xl font-bold mb-2">Artículo no encontrado</h1>
        <p className="text-muted-foreground mb-6">{error || 'El artículo que buscas no existe o ha sido eliminado.'}</p>
        <Button asChild>
          <Link href="/#articulos">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Volver a artículos
          </Link>
        </Button>
      </div>
    );
  }

  const Icon = getCategoryIcon(article.category);

  // Renderizar opciones de compartir
  const ShareOptions = () => (
    <div className="grid gap-2">
      {isMobileDevice && canShareFiles() && (
        <Button
          variant="default"
          className="w-full justify-start gap-3 h-14 text-left"
          onClick={handleNativeShare}
          disabled={isGeneratingImage}
        >
          {isGeneratingImage ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Share2 className="h-5 w-5" />
          )}
          <div>
            <div className="font-medium">Compartir</div>
            <div className="text-xs opacity-80">Selecciona Instagram, WhatsApp...</div>
          </div>
        </Button>
      )}

      <Button
        variant="outline"
        className="w-full justify-start gap-3 h-14 text-left"
        onClick={handleInstagramShare}
        disabled={isGeneratingImage}
      >
        {isGeneratingImage ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <span className="text-pink-500 text-xl">📷</span>
        )}
        <div>
          <div className="font-medium">Instagram</div>
          <div className="text-xs text-muted-foreground">Descargar imagen para subir</div>
        </div>
      </Button>

      <Button
        variant="outline"
        className="w-full justify-start gap-3 h-14 text-left"
        onClick={handleWhatsAppShare}
      >
        <span className="text-green-500 text-xl">💬</span>
        <div>
          <div className="font-medium">WhatsApp</div>
          <div className="text-xs text-muted-foreground">Compartir enlace</div>
        </div>
      </Button>

      <Button
        variant="outline"
        className="w-full justify-start gap-3 h-14 text-left"
        onClick={handleTwitterShare}
      >
        <span className="text-sky-500 text-xl">🐦</span>
        <div>
          <div className="font-medium">Twitter / X</div>
          <div className="text-xs text-muted-foreground">Compartir enlace</div>
        </div>
      </Button>

      <Button
        variant="outline"
        className="w-full justify-start gap-3 h-14 text-left"
        onClick={handleCopyLink}
      >
        <span className="text-xl">🔗</span>
        <div>
          <div className="font-medium">Copiar enlace</div>
          <div className="text-xs text-muted-foreground">{SITE_URL}</div>
        </div>
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero con imagen */}
      <div className="relative h-[40vh] min-h-[300px] w-full overflow-hidden">
        <img
          src={getArticleImage()}
          alt={article.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = defaultImages.desarrollo;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

        {/* Back button */}
        <div className="absolute top-4 left-4 z-10">
          <Button variant="secondary" size="sm" asChild>
            <Link href="/#articulos">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Artículos
            </Link>
          </Button>
        </div>

        {/* Share button */}
        <div className="absolute top-4 right-4 z-10">
          <Button variant="secondary" size="sm" onClick={handleShareClick}>
            <Share2 className="h-4 w-4 mr-2" />
            Compartir
          </Button>
        </div>
      </div>

      {/* Contenido */}
      <div className="container max-w-3xl mx-auto px-4 -mt-20 relative z-10">
        <Card className="overflow-hidden">
          <CardContent className="p-6 md:p-8">
            {/* Category & Meta */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge variant="secondary" className="gap-1">
                <Icon className="h-3 w-3" />
                {getCategoryLabel(article.category)}
              </Badge>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {article.read_time} min de lectura
              </span>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {article.views} vistas
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold mb-4">{article.title}</h1>

            {/* Excerpt */}
            {article.excerpt && (
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                {article.excerpt}
              </p>
            )}

            {/* Date */}
            <p className="text-sm text-muted-foreground mb-6">
              Publicado el {formatDate(article.created_at)}
            </p>

            {/* Audio Reader */}
            <ArticleReader 
              text={article.content || article.excerpt || ''} 
              title={article.title}
            />

            {/* Divider */}
            <div className="border-t mb-6 mt-6" />

            {/* Content */}
            <div className="prose prose-sm md:prose-base max-w-none dark:prose-invert">
              {article.content?.split('\n\n').map((paragraph, index) => (
                <p key={index} className="mb-4 leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t">
                <h3 className="text-sm font-medium mb-3">Etiquetas:</h3>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Share section */}
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-sm font-medium mb-3">Compartir este artículo:</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleWhatsAppShare}>
                  <span className="mr-2">💬</span>
                  WhatsApp
                </Button>
                <Button variant="outline" size="sm" onClick={handleTwitterShare}>
                  <span className="mr-2">🐦</span>
                  Twitter
                </Button>
                <Button variant="outline" size="sm" onClick={handleCopyLink}>
                  <span className="mr-2">🔗</span>
                  Copiar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to articles */}
        <div className="py-8 text-center">
          <Button variant="outline" asChild>
            <Link href="/#articulos">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Ver más artículos
            </Link>
          </Button>
        </div>
      </div>

      {/* Share Sheet/Dialog */}
      {isMobileDevice ? (
        <Sheet open={shareSheetOpen} onOpenChange={setShareSheetOpen}>
          <SheetContent side="bottom" className="rounded-t-3xl">
            <SheetHeader className="text-left">
              <SheetTitle className="flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Compartir artículo
              </SheetTitle>
              <SheetDescription className="line-clamp-2">
                {article.title}
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <ShareOptions />
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
                {article.title}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <ShareOptions />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
