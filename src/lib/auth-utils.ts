import { NextRequest } from 'next/server';
import { supabase } from './supabase';

// Admin emails for fallback authorization (when DB role not available)
const ADMIN_EMAILS = ['m.bolado79@gmail.com'];

export interface AuthResult {
  authorized: boolean;
  email?: string;
  userId?: string;
  role?: string;
  error?: string;
}

/**
 * Verifies if the requester is an admin
 * Checks multiple methods:
 * 1. X-Admin-Email header (from frontend session)
 * 2. X-User-Email header (general user context)
 * 3. Admin secret for server-to-server calls
 */
export async function verifyAdminAccess(request: NextRequest): Promise<AuthResult> {
  try {
    const adminEmail = request.headers.get('x-admin-email');
    const userEmail = request.headers.get('x-user-email');
    const authHeader = request.headers.get('authorization');

    // Method 1: Check admin secret (for server-to-server)
    const adminSecret = process.env.ADMIN_SECRET;
    if (authHeader && adminSecret && authHeader === `Bearer ${adminSecret}`) {
      return { authorized: true, role: 'admin', source: 'secret' };
    }

    // Method 2: Check X-Admin-Email header
    const emailToCheck = adminEmail || userEmail;
    
    if (!emailToCheck) {
      return { authorized: false, error: 'No authentication provided' };
    }

    // Method 3: Check hardcoded admin emails (fallback)
    if (ADMIN_EMAILS.includes(emailToCheck)) {
      return { authorized: true, email: emailToCheck, role: 'admin', source: 'fallback' };
    }

    // Method 4: Check database role
    if (supabase) {
      const { data: user, error } = await supabase
        .from('users')
        .select('id, email, role')
        .eq('email', emailToCheck)
        .single();

      if (error) {
        console.error('Error fetching user for admin check:', error);
      }

      if (user?.role === 'admin') {
        return { 
          authorized: true, 
          email: user.email, 
          userId: user.id, 
          role: 'admin',
          source: 'database'
        };
      }
    }

    return { authorized: false, error: 'Admin access required' };

  } catch (error) {
    console.error('Error in verifyAdminAccess:', error);
    return { authorized: false, error: 'Authentication error' };
  }
}

/**
 * Verifies if the requester owns the resource or is an admin
 */
export async function verifyResourceAccess(
  request: NextRequest, 
  resourceEmail: string
): Promise<AuthResult> {
  try {
    const userEmail = request.headers.get('x-user-email');
    const adminEmail = request.headers.get('x-admin-email');
    const emailToCheck = userEmail || adminEmail;

    if (!emailToCheck) {
      return { authorized: false, error: 'No authentication provided' };
    }

    // User owns the resource
    if (emailToCheck === resourceEmail) {
      return { authorized: true, email: emailToCheck, role: 'owner' };
    }

    // Check if user is admin (can access any resource)
    const adminCheck = await verifyAdminAccess(request);
    if (adminCheck.authorized) {
      return adminCheck;
    }

    return { authorized: false, error: 'Access denied' };

  } catch (error) {
    console.error('Error in verifyResourceAccess:', error);
    return { authorized: false, error: 'Authentication error' };
  }
}

/**
 * Gets user info from request headers
 */
export async function getUserFromRequest(
  request: NextRequest
): Promise<{ email: string; id?: string; role?: string } | null> {
  try {
    const userEmail = request.headers.get('x-user-email');
    
    if (!userEmail) {
      return null;
    }

    if (supabase) {
      const { data: user } = await supabase
        .from('users')
        .select('id, email, role')
        .eq('email', userEmail)
        .single();

      if (user) {
        return { email: user.email, id: user.id, role: user.role };
      }
    }

    return { email: userEmail };

  } catch (error) {
    console.error('Error getting user from request:', error);
    return null;
  }
}
