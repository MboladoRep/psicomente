import { NextResponse } from 'next/server';

export async function GET() {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

  console.log('[Test Groq] Starting test...');
  console.log('[Test Groq] API Key exists:', !!GROQ_API_KEY);
  console.log('[Test Groq] API Key length:', GROQ_API_KEY?.length);

  if (!GROQ_API_KEY) {
    return NextResponse.json({
      success: false,
      error: 'GROQ_API_KEY not found in environment',
      step: 'env_check'
    });
  }

  try {
    console.log('[Test Groq] Calling Groq API...');

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'user', content: 'Say "Hello" in Spanish' }
        ],
        max_tokens: 50,
      }),
    });

    console.log('[Test Groq] Response status:', response.status);

    const responseText = await response.text();
    console.log('[Test Groq] Response body:', responseText);

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: 'Groq API error',
        status: response.status,
        body: responseText,
        step: 'groq_api_call'
      });
    }

    const data = JSON.parse(responseText);

    return NextResponse.json({
      success: true,
      message: 'Groq API working correctly!',
      response: data.choices?.[0]?.message?.content,
      model: data.model,
      usage: data.usage
    });

  } catch (error) {
    console.error('[Test Groq] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      step: 'exception'
    });
  }
}
