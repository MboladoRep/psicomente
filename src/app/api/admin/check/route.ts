import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Admin emails que siempre tienen acceso (fallback)
const ADMIN_EMAILS = ['m.bolado79@gmail.com'];

// GET - Verificar si el usuario actual es admin
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { isAdmin: false, error: 'Email requerido' },
        { status: 400 }
      );
    }

    // Fallback: si el email está en la lista de admins, tiene acceso
    if (ADMIN_EMAILS.includes(email)) {
      return NextResponse.json({ isAdmin: true, role: 'admin', source: 'fallback' });
    }

    if (!supabase) {
      return NextResponse.json(
        { isAdmin: false, error: 'Database not available' },
        { status: 500 }
      );
    }

    // Buscar el rol del usuario en la base de datos
    const { data: user, error } = await supabase
      .from('users')
      .select('role')
      .eq('email', email)
      .single();

    if (error || !user) {
      return NextResponse.json({ isAdmin: false });
    }

    const isAdmin = user.role === 'admin';

    return NextResponse.json({ isAdmin, role: user.role, source: 'database' });
  } catch (error) {
    console.error('Error checking admin status:', error);
    return NextResponse.json({ isAdmin: false });
  }
}
