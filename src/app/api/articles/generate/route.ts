import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import ZAI from 'z-ai-web-dev-sdk';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Groq API configuration
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Categorías de artículos
const CATEGORIES = [
  { id: 'ansiedad', name: 'Ansiedad', topics: ['técnicas de relajación', 'ataques de pánico', 'pensamientos intrusivos', 'fobias', 'ansiedad social'] },
  { id: 'depresion', name: 'Depresión', topics: ['síntomas', 'autoayuda', 'motivación', 'pensamientos negativos', 'activación conductual'] },
  { id: 'relaciones', name: 'Relaciones', topics: ['comunicación', 'conflictos de pareja', 'límites personales', 'familia', 'amistades'] },
  { id: 'autoestima', name: 'Autoestima', topics: ['confianza', 'autocrítica', 'autoaceptación', 'comparación social', 'identidad'] },
  { id: 'estres', name: 'Estrés', topics: ['burnout', 'gestión del tiempo', 'relajación', 'equilibrio vida-trabajo', 'mindfulness'] },
  { id: 'mindfulness', name: 'Mindfulness', topics: ['meditación', 'atención plena', 'respiración', 'consciencia corporal', 'compasión'] },
  { id: 'desarrollo', name: 'Desarrollo Personal', topics: ['metas', 'hábitos', 'productividad', 'inteligencia emocional', 'resiliencia'] },
];

// Prompts de imagen únicos por categoría
const IMAGE_PROMPTS: Record<string, string[]> = {
  ansiedad: [
    'calm ocean waves at sunset, peaceful meditation, serenity, mindfulness, soft colors, therapeutic environment',
    'person meditating in nature, zen garden, tranquility, mental peace, soft natural lighting',
    'gentle mountain stream, forest path, peaceful solitude, natural therapy, calming atmosphere',
    'soft clouds at dawn, peaceful sky, hope and renewal, gentle morning light',
    'quiet lake reflection, stillness, inner peace, meditation spot, natural serenity',
  ],
  depresion: [
    'sunrise over mountains, hope, new beginning, warm light breaking through clouds',
    'single flower blooming in spring, resilience, growth, natural beauty, soft focus',
    'path through misty forest, journey of healing, gentle light ahead, peaceful walk',
    'rainbow after storm, hope emerging, natural wonder, beautiful sky, optimism',
    'warm candlelight in dark room, hope in darkness, gentle glow, comfort and peace',
  ],
  relaciones: [
    'two hands holding, human connection, warmth, trust, soft natural light',
    'people silhouettes watching sunset together, companionship, shared moment, beautiful horizon',
    'family walking on beach, togetherness, bonding, golden hour, peaceful scene',
    'friends around campfire, connection, sharing stories, warm atmosphere, community',
    'bridge connecting two places, symbol of connection, peaceful landscape, gentle stream below',
  ],
  autoestima: [
    'person standing on mountain peak at sunrise, achievement, self-confidence, magnificent view',
    'mirror reflecting beautiful nature, self-reflection, inner beauty, peaceful surroundings',
    'butterfly emerging from cocoon, transformation, growth, new beginnings, delicate beauty',
    'person looking at reflection in calm water, self-discovery, peaceful lake, meditation',
    'flower opening to sun, self-expression, blooming, natural growth, gentle light',
  ],
  estres: [
    'calm zen garden with rake patterns, mindfulness, peaceful meditation space, japanese aesthetic',
    'person relaxing in hammock, rest, peaceful afternoon, gentle breeze, outdoor tranquility',
    'peaceful spa atmosphere, candles and stones, relaxation, wellness, soft lighting',
    'gentle rain on window, cozy atmosphere, peaceful rest, indoor comfort, relaxation',
    'tea cup with steam rising, mindful moment, peaceful break, warm atmosphere, self-care',
  ],
  mindfulness: [
    'lotus flower floating on calm water, meditation, spiritual awakening, peaceful pond',
    'person in lotus position at sunrise, meditation practice, inner peace, beautiful nature',
    'singing bowl with mallet, sound healing, mindfulness practice, peaceful setting',
    'yoga mat in nature, mindful practice, outdoor meditation, peaceful morning light',
    'mala beads on natural surface, meditation tools, spiritual practice, peaceful textures',
  ],
  desarrollo: [
    'path winding up mountain, personal journey, growth, achievement, inspiring landscape',
    'compass on old map, direction, purpose, self-discovery, adventure awaits',
    'seedling growing from soil, potential, growth mindset, new beginnings, nurturing',
    'open book with light rays, knowledge, learning, wisdom, enlightenment',
    'lighthouse on cliff, guidance, direction, purpose, coastal beauty, beacon of hope',
  ],
};

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

function getRandomImagePrompt(categoryId: string): string {
  const prompts = IMAGE_PROMPTS[categoryId] || IMAGE_PROMPTS.desarrollo;
  return prompts[Math.floor(Math.random() * prompts.length)];
}

/**
 * Verifica si la solicitud está autorizada
 */
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

/**
 * Genera una imagen única para el artículo usando IA
 */
async function generateArticleImage(title: string, categoryId: string, topic: string): Promise<string | null> {
  try {
    const zai = await ZAI.create();

    // Crear un prompt único combinando el tema y elementos visuales apropiados
    const basePrompt = getRandomImagePrompt(categoryId);
    const imagePrompt = `${basePrompt}, psychology article about ${topic}, calming therapeutic style, soft pastel colors, professional mental health aesthetic, high quality, 4k`;

    console.log(`Generating image with prompt: ${imagePrompt}`);

    const response = await zai.images.generations.create({
      prompt: imagePrompt,
      size: '1024x1024',
    });

    if (response.data && response.data[0]?.base64) {
      // Guardar la imagen en Supabase Storage
      const base64Data = response.data[0].base64;
      const buffer = Buffer.from(base64Data, 'base64');
      const filename = `articles/${categoryId}-${Date.now()}.png`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(filename, buffer, {
          contentType: 'image/png',
          upsert: true,
        });

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        // Si falla la subida, devolver null y usar imagen por defecto
        return null;
      }

      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(filename);

      return urlData.publicUrl;
    }

    return null;
  } catch (error) {
    console.error('Error generating image:', error);
    return null;
  }
}

async function generateArticle() {
  // Validar API key
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY not configured');
  }

  // Validar Supabase
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  // Seleccionar categoría y tema aleatorio
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

  // Generar imagen única para el artículo
  console.log('Generating unique image for article...');
  const imageUrl = await generateArticleImage(title, category.id, topic);

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
      image_url: imageUrl, // Guardar la URL de la imagen generada
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
      imageGenerated: !!result.imageUrl,
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
      authMethod: auth.reason,
      imageGenerated: !!result.imageUrl,
    });

  } catch (error) {
    console.error('Generate article error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
