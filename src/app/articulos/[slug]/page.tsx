import { Metadata } from 'next';
import ArticleClient from './ArticleClient';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://psicomente.vercel.app'}/api/articles?slug=${slug}`, {
      cache: 'no-store'
    });
    
    const data = await response.json();
    const article = data.article;
    
    if (!article) {
      return { title: 'Artículo no encontrado | PsicoMente' };
    }

    const defaultImages: Record<string, string> = {
      ansiedad: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
      depresion: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&q=80',
      relaciones: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
      autoestima: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
      estres: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
      mindfulness: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
      desarrollo: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80',
    };

    const imageUrl = article.image_url || defaultImages[article.category] || defaultImages.desarrollo;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://psicomente.vercel.app';

    return {
      title: `${article.title} | PsicoMente`,
      description: article.excerpt || article.content?.substring(0, 160),
      openGraph: {
        title: article.title,
        description: article.excerpt || article.content?.substring(0, 160),
        type: 'article',
        url: `${siteUrl}/articulos/${article.slug}`,
        images: [{ url: imageUrl, width: 800, height: 600, alt: article.title }],
        publishedTime: article.created_at,
        authors: ['PsicoMente'],
        siteName: 'PsicoMente',
      },
      twitter: {
        card: 'summary_large_image',
        title: article.title,
        description: article.excerpt || article.content?.substring(0, 160),
        images: [imageUrl],
      },
    };
  } catch {
    return { title: 'Artículo | PsicoMente' };
  }
}

export default function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  return <ArticleClient params={params} />;
}
