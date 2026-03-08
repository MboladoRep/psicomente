import { NextResponse } from 'next/server';

export async function GET() {
  const groqKey = process.env.GROQ_API_KEY;

  return NextResponse.json({
    hasGroqKey: !!groqKey,
    groqKeyPrefix: groqKey ? `${groqKey.substring(0, 8)}...` : 'NOT_SET',
    groqKeyLength: groqKey ? groqKey.length : 0,
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
}
