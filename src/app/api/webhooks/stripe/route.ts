import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

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
    console.error('Stripe not configured');
    return NextResponse.json(
      { error: 'Stripe not configured' },
      { status: 500 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
  const body = await request.text();
  const signature = request.headers.get('stripe-signature') || '';

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  // Handle events
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const email = session.metadata?.email || session.customer_email;

      if (email && supabase) {
        await supabase
          .from('users')
          .update({
            ispremium: true,
            premiumsince: new Date().toISOString(),
          })
          .eq('email', email);

        console.log(`✅ Usuario ${email} actualizado a Premium`);
      }
      break;
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const email = subscription.metadata?.email;

      if (email && supabase && subscription.status === 'active') {
        await supabase
          .from('users')
          .update({
            ispremium: true,
            premiumsince: new Date().toISOString(),
          })
          .eq('email', email);
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const email = subscription.metadata?.email;

      if (email && supabase) {
        await supabase
          .from('users')
          .update({
            ispremium: false,
            premiumsince: null,
          })
          .eq('email', email);

        console.log(`❌ Usuario ${email} ya no es Premium`);
      }
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
