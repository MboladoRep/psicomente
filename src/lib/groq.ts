/**
 * Cliente de Groq con cadena de modelos de respaldo.
 *
 * Groq retira modelos periódicamente (por ejemplo, `llama-3.3-70b-versatile`
 * se dio de baja el 16/08/2026). Para que la aplicación no vuelva a romperse
 * por ese motivo, este helper intenta varios modelos actuales en orden y
 * devuelve el contenido del primero que responda.
 *
 * El modelo preferido puede cambiarse sin tocar código con la variable de
 * entorno GROQ_MODEL (por ejemplo: openai/gpt-oss-120b).
 */

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GroqChatOptions {
  messages: GroqMessage[];
  maxTokens?: number;
  temperature?: number;
}

export interface GroqChatResult {
  content: string;
  model: string;
}

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Modelos vigentes (noviembre 2026). Groq recomienda openai/gpt-oss-120b como
// sustituto directo de llama-3.3-70b-versatile.
const FALLBACK_CHAIN = [
  'openai/gpt-oss-120b',
  'qwen/qwen3.8-27b',
  'openai/gpt-oss-20b',
];

/** Error de Groq con el último estado HTTP recibido. */
export class GroqError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'GroqError';
    this.status = status;
  }
}

function getModelChain(): string[] {
  const preferred = process.env.GROQ_MODEL?.trim();
  const chain = preferred
    ? [preferred, ...FALLBACK_CHAIN.filter((m) => m !== preferred)]
    : [...FALLBACK_CHAIN];
  return [...new Set(chain)];
}

export async function groqChat(opts: GroqChatOptions): Promise<GroqChatResult> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new GroqError('GROQ_API_KEY no está configurada', 503);
  }

  const errors: string[] = [];

  for (const model of getModelChain()) {
    try {
      // Cuerpo de la petición. Los modelos GPT-OSS admiten reasoning_effort:
      // con "low" responden más rápido y el contenido final llega completo.
      const body: Record<string, unknown> = {
        model,
        messages: opts.messages,
        temperature: opts.temperature ?? 0.7,
        max_tokens: opts.maxTokens ?? 600,
      };
      if (model.startsWith('openai/gpt-oss')) {
        body.reasoning_effort = 'low';
      }

      const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content;
        if (typeof content === 'string' && content.trim()) {
          return { content: content.trim(), model };
        }
        errors.push(`${model}: respuesta vacía`);
        continue;
      }

      const errorText = await response.text();
      errors.push(`${model} -> ${response.status}: ${errorText.slice(0, 300)}`);

      // Si la API key está mal, sin cuota o sin permisos, afecta a todos los
      // modelos: no tiene sentido seguir probando.
      if (response.status === 401 || response.status === 403) {
        throw new GroqError(
          `Groq rechazó la petición (${response.status}): ${errorText.slice(0, 200)}`,
          response.status
        );
      }

      // 404 (modelo retirado) o 400 (parámetro no admitido): probar el siguiente.
    } catch (err) {
      if (err instanceof GroqError) {
        throw err;
      }
      const msg = err instanceof Error ? err.message : String(err);
      errors.push(`${model}: ${msg}`);
    }
  }

  throw new GroqError(
    `Ningún modelo de Groq respondió. Detalle: ${errors.join(' | ').slice(0, 500)}`,
    502
  );
}
