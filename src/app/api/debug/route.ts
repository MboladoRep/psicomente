import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const diagnostics = {
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY ? {
        exists: true,
        prefix: process.env.STRIPE_SECRET_KEY.substring(0, 7),
        length: process.env.STRIPE_SECRET_KEY.length,
        isLive: process.env.STRIPE_SECRET_KEY.startsWith('sk_live_'),
        isTest: process.env.STRIPE_SECRET_KEY.startsWith('sk_test_'),
      } : { exists: false },
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ? {
        exists: true,
        prefix: process.env.STRIPE_WEBHOOK_SECRET.substring(0, 6),
      } : { exists: false },
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? {
        exists: true,
        prefix: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.substring(0, 7),
      } : { exists: false },
    },
    groq: {
      apiKey: process.env.GROQ_API_KEY ? {
        exists: true,
        length: process.env.GROQ_API_KEY.length,
      } : { exists: false },
    },
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing',
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'configured' : 'missing',
    },
    firebase: {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'configured' : 'missing',
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'configured' : 'missing',
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'configured' : 'missing',
    },
  };

  // Probar conexión con Stripe
  let stripeTest = null;
  if (process.env.STRIPE_SECRET_KEY) {
    try {
      const Stripe = (await import('stripe')).default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2025-02-24.acacia',
      });
      
      // Intentar listar productos (operación simple)
      const products = await stripe.products.list({ limit: 1 });
      stripeTest = {
        success: true,
        productsCount: products.data.length,
        message: 'Stripe API connection successful',
      };
    } catch (error) {
      stripeTest = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  return NextResponse.json({
    diagnostics,
    stripeTest,
    timestamp: new Date().toISOString(),
  });
}
