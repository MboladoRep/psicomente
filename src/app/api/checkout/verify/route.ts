import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Lazy initialization of Stripe
function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return null;
  }
  return new Stripe(key, {
    apiVersion: '2025-02-24.acacia',
  });
}

export async function GET(request: NextRequest) {
  const stripe = getStripe();
  
  const searchParams = request.nextUrl.searchParams;
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json(
      { success: false, error: 'Session ID es requerido' },
      { status: 400 }
    );
  }

  if (!stripe) {
    return NextResponse.json(
      { success: false, error: 'Stripe no está configurado' },
      { status: 500 }
    );
  }

  try {
    // Obtener la sesión de checkout
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    console.log('🔵 Verificando sesión:', sessionId);
    console.log('🔵 Payment status:', session.payment_status);
    console.log('🔵 Customer email:', session.customer_email || session.metadata?.email);

    const paymentStatus = session.payment_status;
    const email = session.customer_email || session.metadata?.email;

    // Si el pago está completo, actualizar el usuario en la BD
    if (paymentStatus === 'paid' && email && supabase) {
      console.log('✅ Pago completado, actualizando usuario:', email);
      
      const { data, error } = await supabase
        .from('users')
        .upsert({
          email,
          name: session.metadata?.name || email.split('@')[0],
          ispremium: true,
          premiumsince: new Date().toISOString(),
          updatedat: new Date().toISOString(),
        }, {
          onConflict: 'email'
        })
        .select();

      if (error) {
        console.error('❌ Error actualizando usuario:', error);
      } else {
        console.log('✅ Usuario actualizado a premium:', data);
      }
    }

    return NextResponse.json({
      success: true,
      paymentStatus,
      email,
      customerId: session.customer,
      subscriptionId: session.subscription,
    });
  } catch (error) {
    console.error('❌ Error verificando sesión:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
