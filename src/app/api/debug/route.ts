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

    console.log('[Debug API] Request from:', adminEmail);

    // Validate admin access
    let isAdmin = false;

    // Method 1: Check via header email (from frontend admin session)
    if (adminEmail && ADMIN_EMAILS.includes(adminEmail.toLowerCase())) {
      isAdmin = true;
      console.log('[Debug API] Admin via ADMIN_EMAILS list');
    }

    // Method 2: Check via Bearer token (simple admin secret for server-to-server)
    const adminSecret = process.env.ADMIN_SECRET;
    if (authHeader && adminSecret && authHeader === `Bearer ${adminSecret}`) {
      isAdmin = true;
      console.log('[Debug API] Admin via Bearer token');
    }

    // Method 3: Check database role if email provided
    if (adminEmail && supabase && !isAdmin) {
      const { data: user, error } = await supabase
        .from('users')
        .select('role')
        .eq('email', adminEmail)
        .single();

      console.log('[Debug API] DB check result:', user, error);

      if (user?.role === 'admin') {
        isAdmin = true;
      }
    }

    if (!isAdmin) {
      console.log('[Debug API] Access denied for:', adminEmail);
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Get user count
    let totalUsers = 0;
    if (supabase) {
      const { count } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      totalUsers = count || 0;
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
      success: true,
      diagnostics,
      stats: {
        totalUsers,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json(
      { success: false, error: 'Error checking diagnostics' },
      { status: 500 }
    );
  }
}
