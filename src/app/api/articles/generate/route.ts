import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

// Groq API configuration
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Categorías de artículos con estilos de imagen
const CATEGORIES = [
  { id: 'ansiedad', name: 'Ansiedad', topics: ['técnicas de relajación', 'ataques de pánico', 'pensamientos intrusivos', 'fobias', 'ansiedad social'], imageStyle: 'calm blue sky with soft clouds, peaceful meditation' },
  { id: 'depresion', name: 'Depresión', topics: ['síntomas', 'autoayuda', 'motivación', 'pensamientos negativos', 'activación conductual'], imageStyle: 'sunrise over mountains, hope and renewal' },
  { id: 'relaciones', name: 'Relaciones', topics: ['comunicación', 'conflictos de pareja', 'límites personales', 'familia', 'amistades'], imageStyle: 'two people holding hands, warm sunset, connection' },
  { id: 'autoestima', name: 'Autoestima', topics: ['confianza', 'autocrítica', 'autoaceptación', 'comparación social', 'identidad'], imageStyle: 'person standing on mountain peak, confident silhouette, golden hour' },
  { id: 'estres', name: 'Estrés', topics: ['burnout', 'gestión del tiempo', 'relajación', 'equilibrio vida-trabajo', 'mindfulness'], imageStyle: 'peaceful zen garden, bamboo, water fountain, tranquility' },
  { id: 'mindfulness', name: 'Mindfulness', topics: ['meditación', 'atención plena', 'respiración', 'consciencia corporal', 'compasión'], imageStyle: 'person meditating in lotus position, soft light, serene atmosphere' },
  { id: 'desarrollo', name: 'Desarrollo Personal', topics: ['metas', 'hábitos', 'productividad', 'inteligencia emocional', 'resiliencia'], imageStyle: 'growing plant, sunrise, path forward, personal growth' },
];

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100);
}

function getRandomCategory() {
  return CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
}

function getRandomTopic(category: typeof CATEGORIES[0]) {
  return category.topics[Math.floor(Math.random() * category.topics.length)];
}

function isAuthorized(request: NextRequest): { authorized: boolean; reason: string } {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  const vercelCron = request.headers.get('x-vercel-cron');

  if (authHeader === 'Bearer vercel-cron') {
    return { authorized: true, reason: 'Vercel Cron Job' };
  }
  if (vercelCron === 'true') {
    return { authorized: true, reason: 'Vercel Cron Header' };
  }
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
    return { authorized: true, reason: 'CRON_SECRET' };
  }
  return { authorized: true, reason: 'Testing mode' };
}

// Generar imagen usando el CLI tool
async function generateArticleImage(title: string, category: typeof CATEGORIES[0], topic: string): Promise<string | null> {
  try {
    const { execSync } = require('child_process');
    
    // Crear prompt para la imagen
    const imagePrompt = `Professional psychology article illustration: ${category.imageStyle}. Theme: ${topic}. Style: minimalist, calming, therapeutic, warm colors, soft lighting, mental wellness aesthetic. No text, no faces clearly visible.`;
    
    console.log('[Image Generation] Prompt:', imagePrompt);
    
    // Crear directorio de descarga si no existe
    const downloadDir = '/home/z/my-project/download/articles';
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir, { recursive: true });
    }
    
    // Generar nombre único para la imagen
    const imageFileName = `article-${Date.now()}.png`;
    const imagePath = `${downloadDir}/${imageFileName}`;
    
    // Usar el CLI tool para generar la imagen
    const command = `z-ai-generate --prompt "${imagePrompt}" --output "${imagePath}" --size 1344x768`;
    
    console.log('[Image Generation] Running command...');
    execSync(command, { timeout: 60000 });
    
    // Verificar que la imagen se creó
    if (fs.existsSync(imagePath)) {
      console.log('[Image Generation] Image created successfully:', imagePath);
      // Devolver la ruta pública
      return `/download/articles/${imageFileName}`;
    }
    
    return null;
  } catch (error) {
    console.error('[Image Generation] Error:', error);
    return null;
  }
}

async function generateArticle() {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY not configured');
  }

  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const category = getRandomCategory();
  const topic = getRandomTopic(category);

  console.log(`Generating article about "${topic}" in category "${category.name}"...`);

  // Generar artículo con IA
  const prompt = `Escribe un artículo profesional de psicología sobre "${topic}" dentro de la categoría "${category.name}".

El artículo debe:
- Tener un título atractivo y profesional
- Estar escrito en español
- Tener entre 800-1200 palabras
- Ser informativo, útil y basado en evidencia psicológica
- Incluir consejos prácticos al final
- Tener un tono cálido y accesible

Formato de respuesta:
TÍTULO: [título del artículo]
EXTRACTO: [resumen de 2-3 frases, máximo 200 caracteres]
CONTENIDO: [artículo completo con párrafos bien estructurados]
TIEMPO_LECTURA: [número estimado de minutos]`;

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'Eres un psicólogo profesional y escritor de artículos de divulgación psicológica. Escribe contenido de alta calidad, basado en evidencia, con un tono accesible y cálido.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 2000,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Groq API error: ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('No content generated from AI');
  }

  // Parsear la respuesta
  const titleMatch = content.match(/TÍTULO:\s*(.+)/);
  const excerptMatch = content.match(/EXTRACTO:\s*(.+)/);
  const contentMatch = content.match(/CONTENIDO:\s*([\s\S]+?)(?=TIEMPO_LECTURA:|$)/);
  const timeMatch = content.match(/TIEMPO_LECTURA:\s*(\d+)/);

  const title = titleMatch?.[1]?.trim() || `Guía sobre ${topic}`;
  const excerpt = excerptMatch?.[1]?.trim() || content.substring(0, 150);
  const articleContent = contentMatch?.[1]?.trim() || content;
  const readTime = parseInt(timeMatch?.[1] || '5');

  // Generar slug único
  let slug = generateSlug(title);
  const { data: existingArticle } = await supabase
    .from('articles')
    .select('id')
    .eq('slug', slug)
    .single();

  if (existingArticle) {
    slug = `${slug}-${Date.now()}`;
  }

  // Generar imagen para el artículo
  console.log('[Article] Generating image...');
  const imageUrl = await generateArticleImage(title, category, topic);
  console.log('[Article] Image URL:', imageUrl);

  // Guardar en base de datos
  const { data: article, error } = await supabase
    .from('articles')
    .insert({
      title,
      slug,
      content: articleContent,
      excerpt,
      category: category.id,
      tags: [topic, category.name.toLowerCase()],
      read_time: readTime,
      is_featured: false,
      views: 0,
      image_url: imageUrl,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }

  return { article, title, category: category.name, topic, imageUrl };
}

// POST - Para cron jobs y llamadas API
export async function POST(request: NextRequest) {
  try {
    const auth = isAuthorized(request);
    console.log(`Article generation requested. Auth: ${auth.reason}`);

    const result = await generateArticle();

    return NextResponse.json({
      success: true,
      article: result.article,
      message: `Artículo generado: "${result.title}" (${result.category})`,
      imageUrl: result.imageUrl
    });

  } catch (error) {
    console.error('Generate article error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET - Para probar desde el navegador
export async function GET(request: NextRequest) {
  try {
    const auth = isAuthorized(request);
    console.log(`Article generation requested via GET. Auth: ${auth.reason}`);

    const result = await generateArticle();

    return NextResponse.json({
      success: true,
      article: result.article,
      message: `Artículo generado: "${result.title}" (${result.category})`,
      topic: result.topic,
      imageUrl: result.imageUrl,
      authMethod: auth.reason
    });

  } catch (error) {
    console.error('Generate article error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
