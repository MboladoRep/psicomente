import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

// Lazy initialization of Stripe to avoid build-time errors
function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return null;
  }
  return new Stripe(key, {
    apiVersion: '2025-02-24.acacia',
  });
}

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  
  if (!stripe) {
    console.error('STRIPE_SECRET_KEY no está configurada');
    return NextResponse.json(
      { error: 'Stripe no está configurado. Contacta al administrador.', success: false },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido', success: false },
        { status: 400 }
      );
    }

    console.log('Creando checkout para:', email);

    // Buscar o crear producto
    let product;
    const products = await stripe.products.list({
      active: true,
      limit: 100,
    });

    product = products.data.find(p => p.name === 'PsicoMente Premium');

    if (!product) {
      console.log('Creando nuevo producto...');
      product = await stripe.products.create({
        name: 'PsicoMente Premium',
        description: 'Acceso ilimitado al chat con IA, diario completo y funciones avanzadas',
      });
      console.log('Producto creado:', product.id);
    } else {
      console.log('Producto encontrado:', product.id);
    }

    // Buscar precio existente
    const prices = await stripe.prices.list({
      product: product.id,
      active: true,
    });

    let priceId: string;

    if (prices.data.length > 0) {
      priceId = prices.data[0].id;
      console.log('Precio encontrado:', priceId);
    } else {
      console.log('Creando nuevo precio...');
      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: 499, // 4.99 EUR
        currency: 'eur',
        recurring: {
          interval: 'month',
        },
        nickname: 'Premium Mensual',
      });
      priceId = price.id;
      console.log('Precio creado:', priceId);
    }

    // Crear sesión de checkout
    console.log('Creando sesión de checkout...');
    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://my-project-kohl-three-63.vercel.app'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://my-project-kohl-three-63.vercel.app'}/checkout/cancel`,
      metadata: {
        email,
        name: name || '',
      },
      subscription_data: {
        metadata: {
          email,
        },
      },
    });

    console.log('Sesión creada:', session.id);

    return NextResponse.json({ 
      url: session.url,
      sessionId: session.id,
      success: true 
    });
  } catch (error) {
    console.error('Error en checkout:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    return NextResponse.json(
      { error: `Error al crear sesión de pago: ${errorMessage}`, success: false },
      { status: 500 }
    );
  }
}
