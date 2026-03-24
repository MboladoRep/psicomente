import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

// Split text into chunks of maximum 1000 characters
function splitTextIntoChunks(text: string, maxLength = 1000): string[] {
  const chunks: string[] = [];
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  
  let currentChunk = '';
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length <= maxLength) {
      currentChunk += sentence;
    } else {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = sentence;
    }
  }
  if (currentChunk) chunks.push(currentChunk.trim());
  
  return chunks;
}

export async function POST(req: NextRequest) {
  try {
    const { text, voice = 'tongtong', speed = 1.0 } = await req.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Validate and clamp speed
    const validSpeed = Math.max(0.5, Math.min(2.0, parseFloat(String(speed)) || 1.0));

    console.log('TTS Request:', { textLength: text.length, voice, speed: validSpeed });

    // Create SDK instance
    const zai = await ZAI.create();

    // Generate TTS audio - using mp3 for better browser compatibility
    const response = await zai.audio.tts.create({
      input: text.trim().substring(0, 1024), // Ensure max 1024 chars
      voice: voice,
      speed: validSpeed,
      response_format: 'mp3',
      stream: false,
    });

    // Get array buffer from Response object
    const arrayBuffer = await response.arrayBuffer();
    
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      throw new Error('Empty audio response');
    }

    const buffer = Buffer.from(new Uint8Array(arrayBuffer));

    console.log('TTS Response:', { bufferSize: buffer.length });

    // Return audio as response
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=3600',
        'Accept-Ranges': 'bytes',
      },
    });
  } catch (error) {
    console.error('TTS API Error:', error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Error generating speech',
      },
      { status: 500 }
    );
  }
}

// Endpoint to get text chunks info
export async function PUT(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Clean text
    const cleanText = text
      .replace(/[#*_`]/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\n+/g, ' ')
      .trim();

    const chunks = splitTextIntoChunks(cleanText, 900);

    return NextResponse.json({
      totalChunks: chunks.length,
      chunks: chunks,
    });
  } catch (error) {
    console.error('TTS chunking error:', error);
    return NextResponse.json(
      { error: 'Error processing text' },
      { status: 500 }
    );
  }
}
