import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { groqChat, GroqError } from '@/lib/groq';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

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

/**
 * SEGURIDAD: la generación de artículos gasta créditos de Groq.
 * Solo se aceptan peticiones autenticadas con el secreto:
 *
 *   Authorization: Bearer <CRON_SECRET>
 *
 * Vercel envía esa cabecera automáticamente en los cron jobs cuando la
 * variable CRON_SECRET está configurada en el proyecto. El panel de
 * administración también puede enviarla de forma manual.
 */
function verifyCronSecret(request: NextRequest): { authorized: boolean; reason: string } {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization') || '';

  if (!cronSecret) {
    return {
      authorized: false,
      reason: 'No autorizado: falta configurar la variable CRON_SECRET en las variables de entorno de Vercel. Sin ella no se pueden generar artículos.',
    };
  }

  if (authHeader === `Bearer ${cronSecret}`) {
    return { authorized: true, reason: 'CRON_SECRET' };
  }

  return { authorized: false, reason: 'No autorizado: se requiere la clave CRON_SECRET.' };
}

async function generateArticle() {
  // Validar Supabase
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  // Seleccionar categoría y tema aleatorio
  const category = getRandomCategory();
  const topic = getRandomTopic(category);

  console.log(`Generating article about "${topic}" in category "${category.name}"...`);

  // Generar artículo con IA (con cadena de modelos de respaldo)
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

  const { content } = await groqChat({
    messages: [
      {
        role: 'system',
        content: 'Eres un psicólogo profesional y escritor de artículos de divulgación psicológica. Escribe contenido de alta calidad, basado en evidencia, con un tono accesible y cálido. Respeta EXACTAMENTE el formato de respuesta solicitado, incluidas las etiquetas TÍTULO:, EXTRACTO:, CONTENIDO: y TIEMPO_LECTURA:.',
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    maxTokens: 3500,
    temperature: 0.8,
  });

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

  // NOTA: No generamos imagen automáticamente.
  // El admin debe aprobar el artículo y asignar una imagen en el panel administrativo.

  // Guardar en base de datos como borrador (status: 'draft')
  // El admin debe aprobarlo y asignar una imagen antes de publicar
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
      image_url: null, // No asignar imagen automáticamente - el admin debe elegir
      status: 'draft', // Guardar como borrador para revisión
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Database error: ${error.message}`);
  }

  return { article, title, category: category.name, topic };
}

// POST - Para cron jobs y llamadas autenticadas
export async function POST(request: NextRequest) {
  const auth = verifyCronSecret(request);

  if (!auth.authorized) {
    console.warn('[Articles Generate] Petición rechazada:', auth.reason);
    return NextResponse.json({ success: false, error: auth.reason }, { status: 401 });
  }

  console.log(`[Articles Generate] Autorizado (${auth.reason})`);

  try {
    const result = await generateArticle();

    return NextResponse.json({
      success: true,
      article: result.article,
      message: `Artículo generado como BORRADOR: "${result.title}" (${result.category}). Ve al panel admin para aprobarlo y asignar una imagen.`,
      status: 'draft',
    });

  } catch (error) {
    console.error('[Articles Generate] Error:', error);
    const detail = error instanceof GroqError
      ? error.message.slice(0, 300)
      : (error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({
      success: false,
      error: `Error al generar el artículo: ${detail}`,
    }, { status: 500 });
  }
}

// GET - Para los cron jobs de Vercel (envían Authorization: Bearer CRON_SECRET)
export async function GET(request: NextRequest) {
  const auth = verifyCronSecret(request);

  if (!auth.authorized) {
    console.warn('[Articles Generate] Petición rechazada:', auth.reason);
    return NextResponse.json({ success: false, error: auth.reason }, { status: 401 });
  }

  console.log(`[Articles Generate] Autorizado (${auth.reason})`);

  try {
    const result = await generateArticle();

    return NextResponse.json({
      success: true,
      article: result.article,
      message: `Artículo generado como BORRADOR: "${result.title}" (${result.category}). Ve al panel admin para aprobarlo y asignar una imagen.`,
      topic: result.topic,
      authMethod: auth.reason,
      status: 'draft',
    });

  } catch (error) {
    console.error('[Articles Generate] Error:', error);
    const detail = error instanceof GroqError
      ? error.message.slice(0, 300)
      : (error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json({
      success: false,
      error: `Error al generar el artículo: ${detail}`,
    }, { status: 500 });
  }
}
