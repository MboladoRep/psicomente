import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Admin emails for fallback authorization
const ADMIN_EMAILS = ['m.bolado79@gmail.com'];

// SECURITY: This endpoint is now protected - only admins can access
export async function GET(request: NextRequest) {
  try {
    // Check for admin authorization via header
    const authHeader = request.headers.get('authorization');
    const adminEmail = request.headers.get('x-admin-email');

    // Validate admin access
    let isAdmin = false;

    // Method 1: Check via header email (from frontend admin session)
    if (adminEmail && ADMIN_EMAILS.includes(adminEmail)) {
      isAdmin = true;
    }

    // Method 2: Check via Bearer token (simple admin secret for server-to-server)
    const adminSecret = process.env.ADMIN_SECRET;
    if (authHeader && adminSecret && authHeader === `Bearer ${adminSecret}`) {
      isAdmin = true;
    }

    // Method 3: Check database role if email provided
    if (adminEmail && supabase && !isAdmin) {
      const { data: user } = await supabase
        .from('users')
        .select('role')
        .eq('email', adminEmail)
        .single();
      
      if (user?.role === 'admin') {
        isAdmin = true;
      }
    }

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Only return non-sensitive configuration status
    const diagnostics = {
      stripe: {
        configured: !!process.env.STRIPE_SECRET_KEY,
        webhookConfigured: !!process.env.STRIPE_WEBHOOK_SECRET,
        publishableKeyConfigured: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        isLive: process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') ?? false,
      },
      groq: {
        configured: !!process.env.GROQ_API_KEY,
      },
      supabase: {
        configured: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
      },
      firebase: {
        configured: !!(
          process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
          process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
          process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
        ),
      },
    };

    return NextResponse.json({
      diagnostics,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json(
      { error: 'Error checking diagnostics' },
      { status: 500 }
    );
  }
}
