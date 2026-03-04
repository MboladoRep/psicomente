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
  
  console.log('🔔 Webhook received');

  if (!stripe) {
    console.error('❌ Stripe not configured');
    return NextResponse.json(
      { error: 'Stripe not configured' },
      { status: 500 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.error('❌ STRIPE_WEBHOOK_SECRET not configured');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature') || '';

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    console.log('✅ Webhook signature verified:', event.type);
  } catch (error) {
    console.error('❌ Webhook signature verification failed:', error);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  // Handle events
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('📦 Checkout session completed:', session.id);
        
        // Get email from multiple sources
        let email = session.metadata?.email || session.customer_email;
        
        // If no email, try to get from customer
        if (!email && session.customer) {
          try {
            const customer = await stripe.customers.retrieve(session.customer as string);
            if (customer && !('deleted' in customer)) {
              email = customer.email;
            }
          } catch (e) {
            console.error('Error fetching customer:', e);
          }
        }
        
        console.log('📧 Email from checkout:', email);

        if (email && supabase) {
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
            console.error('❌ Error updating user to premium:', error);
          } else {
            console.log(`✅ Usuario ${email} actualizado a Premium:`, data);
          }
        } else {
          console.log('⚠️ No email found or no supabase connection');
        }
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        let email = subscription.metadata?.email;
        
        // Get email from customer if not in metadata
        if (!email && subscription.customer) {
          try {
            const customer = await stripe.customers.retrieve(subscription.customer as string);
            if (customer && !('deleted' in customer)) {
              email = customer.email;
            }
          } catch (e) {
            console.error('Error fetching customer:', e);
          }
        }

        console.log('📧 Email from subscription:', email, 'Status:', subscription.status);

        if (email && supabase && subscription.status === 'active') {
          const { error } = await supabase
            .from('users')
            .upsert({
              email,
              ispremium: true,
              premiumsince: new Date().toISOString(),
              updatedat: new Date().toISOString(),
            }, {
              onConflict: 'email'
            });

          if (error) {
            console.error('❌ Error updating subscription:', error);
          } else {
            console.log(`✅ Subscription active for ${email}`);
          }
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        let email = subscription.metadata?.email;
        
        if (!email && subscription.customer) {
          try {
            const customer = await stripe.customers.retrieve(subscription.customer as string);
            if (customer && !('deleted' in customer)) {
              email = customer.email;
            }
          } catch (e) {
            console.error('Error fetching customer:', e);
          }
        }

        if (email && supabase) {
          const { error } = await supabase
            .from('users')
            .update({
              ispremium: false,
              premiumsince: null,
            })
            .eq('email', email);

          if (error) {
            console.error('❌ Error removing premium:', error);
          } else {
            console.log(`❌ Usuario ${email} ya no es Premium`);
          }
        }
        break;
      }

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    // Still return 200 to acknowledge receipt
  }

  return NextResponse.json({ received: true });
}

// GET for testing
export async function GET() {
  return NextResponse.json({ 
    message: 'Stripe webhook endpoint is working',
    hasSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
    hasStripe: !!process.env.STRIPE_SECRET_KEY,
  });
}
