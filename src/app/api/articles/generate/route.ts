import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Groq API configuration
const GROQ_API_KEY = process.env.GROQ_API_KEY || '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';
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

export async function POST(request: NextRequest) {
  try {
    // Verificar authorization para el cron job
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'psicomente-cron-secret';

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Seleccionar categoría y tema aleatorio
    const category = getRandomCategory();
    const topic = getRandomTopic(category);

    // Generar artículo con IA
    const prompt = `Escribe un artículo profesional de psicología sobre "${topic}" dentro de la categoría "${category.name}".

El artículo debe:
- Tener un título atractivo y profesional (primera línea)
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
      console.error('Groq API error:', errorText);
      return NextResponse.json({ error: 'Error generating article' }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ error: 'No content generated' }, { status: 500 });
    }

    // Parsear la respuesta
    const titleMatch = content.match(/TÍTULO:\s*(.+)/);
    const excerptMatch = content.match(/EXTRACTO:\s*(.+)/);
    const contentMatch = content.match(/CONTENIDO:\s*([\s\S]+?)(?=TIEMPO_LECTURA:|$)/);
    const timeMatch = content.match(/TIEMPO_LECTURA:\s*(\d+)/);

    const title = titleMatch?.[1]?.trim() || `Guía sobre ${topic}`;
    const excerpt = excerptMatch?.[1]?.trim() || '';
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
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving article:', error);
      return NextResponse.json({ error: 'Error saving article' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      article,
      message: `Artículo generado: "${title}" (${category.name})`
    });

  } catch (error) {
    console.error('Generate article error:', error);
    return NextResponse.json({ error: 'Error generating article' }, { status: 500 });
  }
}
