import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIdentifier, RATE_LIMIT_CONFIGS } from '@/lib/rate-limit';

export const maxDuration = 30;

// Groq API configuration - SECURITY: No hardcoded keys
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function POST(request: NextRequest) {
  try {
    // RATE LIMITING: Check if client has exceeded rate limit
    const clientId = getClientIdentifier(request);
    const rateLimitResult = checkRateLimit(clientId, RATE_LIMIT_CONFIGS.chat);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: `Has excedido el límite de mensajes. Intenta de nuevo en ${rateLimitResult.retryAfter} segundos.`, 
          success: false,
          retryAfter: rateLimitResult.retryAfter 
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': String(rateLimitResult.limit),
            'X-RateLimit-Remaining': String(rateLimitResult.remaining),
            'X-RateLimit-Reset': String(rateLimitResult.resetTime),
            'Retry-After': String(rateLimitResult.retryAfter || 60),
          }
        }
      );
    }

    // SECURITY: Validate API key exists
    if (!GROQ_API_KEY) {
      console.error('GROQ_API_KEY not configured');
      return NextResponse.json(
        { error: 'Servicio no configurado. Contacta al administrador.', success: false },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { message, category, history } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required', success: false },
        { status: 400 }
      );
    }

    // Build system prompt based on category
    const categoryPrompts: Record<string, string> = {
      ansiedad: 'Eres un psicólogo especializado en trastornos de ansiedad. Proporciona apoyo emocional, técnicas de manejo de ansiedad y orientación práctica.',
      depresion: 'Eres un psicólogo especializado en depresión. Ofrece apoyo compasivo, estrategias de afrontamiento y recursos para el bienestar emocional.',
      relaciones: 'Eres un psicólogo especializado en relaciones interpersonales y de pareja. Ayuda con comunicación, conflictos y vínculos saludables.',
      autoestima: 'Eres un psicólogo especializado en autoestima y desarrollo personal. Ayuda a fortalecer la autoconfianza y el autoconocimiento.',
      estres: 'Eres un psicólogo especializado en manejo del estrés. Ofrece técnicas de relajación, organización y equilibrio vida-trabajo.',
      duelo: 'Eres un psicólogo especializado en procesos de duelo. Proporciona apoyo emocional y acompañamiento en el proceso de pérdida.',
      general: 'Eres un psicólogo profesional empático y comprensivo. Ofrece orientación, apoyo emocional y recursos para el bienestar mental.',
    };

    const systemPrompt = categoryPrompts[category] || categoryPrompts.general;

    // Build messages array
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      {
        role: 'system',
        content: `${systemPrompt}

IMPORTANTE:
- Siempre muestra empatía y comprensión
- Ofrece consejos prácticos y alcanzables
- Recomienda buscar ayuda profesional si la situación lo requiere
- No diagnostiques condiciones médicas
- Mantén un tono cálido y profesional
- Respuestas concisas pero completas (máximo 3-4 párrafos)
- Si el usuario expresa pensamientos de autolesión, recomienda urgentemente buscar ayuda profesional y proporciona números de emergencia`
      }
    ];

    // Add conversation history
    if (history && Array.isArray(history)) {
      for (const msg of history.slice(-6)) {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      }
    }

    // Add current message
    messages.push({
      role: 'user',
      content: message
    });

    // Call Groq API
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.7,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', errorText);
      return NextResponse.json(
        { error: 'Error al conectar con el servicio de IA. Por favor, intenta de nuevo.', success: false },
        { status: 500 }
      );
    }

    const data = await response.json();
    const responseContent = data.choices?.[0]?.message?.content;

    if (!responseContent) {
      return NextResponse.json(
        { error: 'No se pudo generar una respuesta. Por favor, intenta de nuevo.', success: false },
        { status: 500 }
      );
    }

    // Return response with rate limit headers
    return NextResponse.json({ 
      response: responseContent,
      success: true 
    }, {
      headers: {
        'X-RateLimit-Limit': String(rateLimitResult.limit),
        'X-RateLimit-Remaining': String(rateLimitResult.remaining),
        'X-RateLimit-Reset': String(rateLimitResult.resetTime),
      }
    });

  } catch (error) {
    console.error('Chat API error:', error);
    
    let errorMessage = 'Error al procesar la consulta. Por favor, intenta de nuevo.';
    
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        errorMessage = 'La solicitud tardó demasiado. Por favor, intenta con un mensaje más corto.';
      }
    }
    
    return NextResponse.json(
      { error: errorMessage, success: false },
      { status: 500 }
    );
  }
}
