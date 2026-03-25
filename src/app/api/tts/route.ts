import { NextRequest, NextResponse } from 'next/server';

// Google Cloud Text-to-Speech API
// Free tier: 4 million characters per month
// Requires: GOOGLE_TTS_API_KEY environment variable

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface TTSRequest {
  text: string;
  languageCode?: string;
  voiceName?: string;
  audioEncoding?: 'MP3' | 'OGG_OPUS' | 'LINEAR16';
  speakingRate?: number;
  pitch?: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: TTSRequest = await request.json();
    const {
      text,
      languageCode = 'es-ES',
      voiceName = 'es-ES-Standard-A',
      audioEncoding = 'MP3',
      speakingRate = 1.0,
      pitch = 0,
    } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Check for API key
    const apiKey = process.env.GOOGLE_TTS_API_KEY;
    
    if (!apiKey) {
      console.error('GOOGLE_TTS_API_KEY not configured');
      return NextResponse.json(
        { 
          error: 'TTS service not configured. Please add GOOGLE_TTS_API_KEY to environment variables.',
          needsConfig: true 
        },
        { status: 503 }
      );
    }

    // Clean and truncate text (Google TTS limit is 5000 characters)
    const cleanText = text
      .replace(/[#*_`]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\n+/g, ' ')
      .trim()
      .substring(0, 4900);

    if (!cleanText) {
      return NextResponse.json(
        { error: 'No valid text to synthesize' },
        { status: 400 }
      );
    }

    // Call Google Cloud TTS API
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: { text: cleanText },
          voice: {
            languageCode,
            name: voiceName,
            ssmlGender: 'FEMALE',
          },
          audioConfig: {
            audioEncoding,
            speakingRate: Math.max(0.25, Math.min(4.0, speakingRate)),
            pitch,
            effectsProfileId: ['small-bluetooth-speaker-class-device'],
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Google TTS API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to generate speech', details: errorData },
        { status: 500 }
      );
    }

    const data = await response.json();
    
    if (!data.audioContent) {
      return NextResponse.json(
        { error: 'No audio content in response' },
        { status: 500 }
      );
    }

    // Convert base64 to buffer
    const audioBuffer = Buffer.from(data.audioContent, 'base64');
    
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
        'Cache-Control': 'public, max-age=86400',
      },
    });

  } catch (error) {
    console.error('TTS API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Endpoint to split text into chunks for long articles
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const cleanText = text
      .replace(/[#*_`]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\n+/g, ' ')
      .trim();

    // Split into chunks of ~4500 chars (safe margin under 5000 limit)
    const maxChars = 4500;
    const sentences = cleanText.match(/[^.!?]+[.!?]+/g) || [cleanText];
    const chunks: string[] = [];
    let currentChunk = '';
    
    for (const sentence of sentences) {
      if ((currentChunk + sentence).length <= maxChars) {
        currentChunk += sentence;
      } else {
        if (currentChunk) chunks.push(currentChunk.trim());
        currentChunk = sentence;
      }
    }
    if (currentChunk) chunks.push(currentChunk.trim());

    return NextResponse.json({
      totalChunks: chunks.length,
      chunks: chunks,
    });
  } catch (error) {
    console.error('TTS chunking error:', error);
    return NextResponse.json({ error: 'Error processing text' }, { status: 500 });
  }
}

// Endpoint to get available voices
export async function GET() {
  const apiKey = process.env.GOOGLE_TTS_API_KEY;
  
  if (!apiKey) {
    return NextResponse.json({
      voices: [],
      message: 'GOOGLE_TTS_API_KEY not configured',
    });
  }

  try {
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/voices?key=${apiKey}&languageCode=es-ES`
    );
    
    const data = await response.json();
    
    return NextResponse.json({
      voices: data.voices || [],
    });
  } catch (error) {
    console.error('Error fetching voices:', error);
    return NextResponse.json({ voices: [] });
  }
}
