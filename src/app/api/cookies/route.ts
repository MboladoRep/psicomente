import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// POST - Guardar consentimiento de cookies
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { necessary, analytics, marketing } = body;

    // Obtener IP y User Agent para registro (RGPD)
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // Intentar guardar en Supabase si está disponible
    if (supabase) {
      const { error } = await supabase
        .from('cookie_consents')
        .insert({
          ip_address: ip.toString(),
          user_agent: userAgent,
          necessary: necessary !== false,
          analytics: analytics === true,
          marketing: marketing === true,
        });

      if (error) {
        console.error('Error saving cookie consent to Supabase:', error);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Consentimiento guardado correctamente' 
    });
  } catch (error) {
    console.error('Error saving cookie consent:', error);
    // No fallar si hay error de base de datos - el consentimiento local es suficiente
    return NextResponse.json({ 
      success: true, 
      message: 'Consentimiento guardado localmente' 
    });
  }
}
