import { Metadata } from 'next';
import ArticleClient from './ArticleClient';
import { supabase } from '@/lib/supabase';

// Generate metadata for Open Graph sharing - SERVER SIDE
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    // Query Supabase directly on the server
    const { data: article, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error || !article) {
      return {
        title: 'Artículo no encontrado | PsicoMente',
        description: 'PsicoMente - Tu plataforma de bienestar emocional',
      };
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
    const siteUrl = 'https://psicomente.vercel.app';
    const articleUrl = `${siteUrl}/articulos/${article.slug}`;

    return {
      title: `${article.title} | PsicoMente`,
      description: article.excerpt || article.content?.substring(0, 160),
      alternates: {
        canonical: articleUrl,
      },
      openGraph: {
        title: article.title,
        description: article.excerpt || article.content?.substring(0, 160),
        type: 'article',
        url: articleUrl,
        siteName: 'PsicoMente',
        locale: 'es_ES',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: article.title,
            type: 'image/jpeg',
          },
        ],
        publishedTime: article.created_at,
        authors: ['PsicoMente'],
      },
      twitter: {
        card: 'summary_large_image',
        title: article.title,
        description: article.excerpt || article.content?.substring(0, 160),
        images: [imageUrl],
        site: '@psicomente',
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Artículo | PsicoMente',
      description: 'PsicoMente - Tu plataforma de bienestar emocional',
    };
  }
}

// Generate static params for all published articles
export async function generateStaticParams() {
  try {
    const { data: articles } = await supabase
      .from('articles')
      .select('slug')
      .eq('status', 'published');

    return articles?.map((article) => ({
      slug: article.slug,
    })) || [];
  } catch {
    return [];
  }
}

export default function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  return <ArticleClient params={params} />;
}
