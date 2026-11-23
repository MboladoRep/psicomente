import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getClientIdentifier, RATE_LIMIT_CONFIGS } from '@/lib/rate-limit';
import { groqChat, GroqError } from '@/lib/groq';

export const maxDuration = 30;

// Prompts del sistema por categoría
const CATEGORY_PROMPTS: Record<string, string> = {
  ansiedad: 'Eres un psicólogo especializado en trastornos de ansiedad. Proporciona apoyo emocional, técnicas de manejo de ansiedad y orientación práctica.',
  depresion: 'Eres un psicólogo especializado en depresión. Ofrece apoyo compasivo, estrategias de afrontamiento y recursos para el bienestar emocional.',
  relaciones: 'Eres un psicólogo especializado en relaciones interpersonales y de pareja. Ayuda con comunicación, conflictos y vínculos saludables.',
  autoestima: 'Eres un psicólogo especializado en autoestima y desarrollo personal. Ayuda a fortalecer la autoconfianza y el autoconocimiento.',
  estres: 'Eres un psicólogo especializado en manejo del estrés. Ofrece técnicas de relajación, organización y equilibrio vida-trabajo.',
  duelo: 'Eres un psicólogo especializado en procesos de duelo. Proporciona apoyo emocional y acompañamiento en el proceso de pérdida.',
  general: 'Eres un psicólogo profesional empático y comprensivo. Ofrece orientación, apoyo emocional y recursos para el bienestar mental.',
};

const SYSTEM_RULES = `

IMPORTANTE:
- Siempre muestra empatía y comprensión
- Ofrece consejos prácticos y alcanzables
- Recomienda buscar ayuda profesional si la situación lo requiere
- No diagnostiques condiciones médicas
- Mantén un tono cálido y profesional
- Respuestas concisas pero completas (máximo 3-4 párrafos)
- Si el usuario expresa pensamientos de autolesión, recomienda urgentemente buscar ayuda profesional y proporciona números de emergencia`;

export async function POST(request: NextRequest) {
  try {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    console.log('[Chat API] Request received');

    // RATE LIMITING: comprobar si el cliente ha excedido el límite
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

    // Validar que la API key existe
    if (!GROQ_API_KEY) {
      console.error('[Chat API] GROQ_API_KEY not configured in environment variables');
      return NextResponse.json(
        {
          error: 'El servicio de chat no está configurado correctamente. Por favor, contacta al administrador y menciona que falta la API key de Groq.',
          success: false,
          errorCode: 'MISSING_API_KEY'
        },
        { status: 503 }
      );
    }

    // Parsear el cuerpo de la petición con seguridad
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('[Chat API] Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Error al procesar la solicitud. Formato inválido.', success: false, errorCode: 'INVALID_JSON' },
        { status: 400 }
      );
    }
    const { message, category, history } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required', success: false },
        { status: 400 }
      );
    }

    const systemPrompt = CATEGORY_PROMPTS[category] || CATEGORY_PROMPTS.general;

    // Construir el array de mensajes
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      {
        role: 'system',
        content: `${systemPrompt}${SYSTEM_RULES}`,
      }
    ];

    // Añadir historial de conversación (solo roles válidos para no rechazar la petición)
    if (history && Array.isArray(history)) {
      for (const msg of history.slice(-6)) {
        if (msg && typeof msg.content === 'string' && msg.content.trim()) {
          const role: 'user' | 'assistant' = msg.role === 'assistant' ? 'assistant' : 'user';
          messages.push({ role, content: msg.content });
        }
      }
    }

    // Añadir el mensaje actual
    messages.push({
      role: 'user',
      content: message
    });

    // Llamar a Groq con cadena de modelos de respaldo
    try {
      const { content, model } = await groqChat({
        messages,
        maxTokens: 600,
        temperature: 0.7,
      });

      console.log(`[Chat API] Respuesta generada con el modelo: ${model}`);

      // Devolver respuesta con cabeceras de rate limit
      return NextResponse.json({
        response: content,
        success: true,
        model,
      }, {
        headers: {
          'X-RateLimit-Limit': String(rateLimitResult.limit),
          'X-RateLimit-Remaining': String(rateLimitResult.remaining),
          'X-RateLimit-Reset': String(rateLimitResult.resetTime),
        }
      });
    } catch (groqError) {
      if (groqError instanceof GroqError) {
        console.error('[Chat API] Groq error:', groqError.status, groqError.message);

        if (groqError.status === 503) {
          return NextResponse.json(
            { error: 'El servicio de chat no está configurado. Falta la API key de Groq.', success: false, errorCode: 'MISSING_API_KEY' },
            { status: 503 }
          );
        }
        if (groqError.status === 401 || groqError.status === 403) {
          return NextResponse.json(
            { error: 'Error de autenticación con el servicio de IA. Contacta al administrador.', success: false, errorCode: 'AUTH_ERROR' },
            { status: 500 }
          );
        }
        if (groqError.status === 429) {
          return NextResponse.json(
            { error: 'El servicio de IA está temporalmente saturado. Espera un momento e intenta de nuevo.', success: false, errorCode: 'RATE_LIMITED' },
            { status: 429 }
          );
        }

        return NextResponse.json(
          { error: 'Error al conectar con el servicio de IA. Por favor, intenta de nuevo.', success: false, detail: groqError.message.slice(0, 200) },
          { status: 500 }
        );
      }
      throw groqError;
    }

  } catch (error) {
    console.error('[Chat API] Unexpected error:', error);

    let errorMessage = 'Error al procesar la consulta. Por favor, intenta de nuevo.';
    let errorCode = 'UNKNOWN_ERROR';

    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        errorMessage = 'La solicitud tardó demasiado. Por favor, intenta con un mensaje más corto.';
        errorCode = 'TIMEOUT';
      } else if (error.message.includes('fetch')) {
        errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
        errorCode = 'NETWORK_ERROR';
      }
    }

    return NextResponse.json(
      { error: errorMessage, success: false, errorCode },
      { status: 500 }
    );
  }
}
