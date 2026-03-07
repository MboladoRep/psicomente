import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyAdminAccess } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

// GET - Obtener estadísticas generales (SOLO ADMIN)
export async function GET(request: NextRequest) {
  try {
    // SECURITY: Verify admin access
    const authResult = await verifyAdminAccess(request);
    
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.error || 'Acceso denegado', success: false },
        { status: 403 }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 500 }
      );
    }

    // Obtener estadísticas de usuarios
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Usuarios premium
    const { count: premiumUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('ispremium', true);

    // Usuarios activos hoy
    const today = new Date().toISOString().split('T')[0];
    const { count: activeToday } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('lastactiveat', today);

    // Últimos usuarios registrados
    const { data: recentUsers } = await supabase
      .from('users')
      .select('id, email, name, ispremium, createdat, premiumsince, role')
      .order('createdat', { ascending: false })
      .limit(10);

    // Usuarios premium
    const { data: premiumUsersList } = await supabase
      .from('users')
      .select('id, email, name, premiumsince')
      .eq('ispremium', true)
      .order('premiumsince', { ascending: false })
      .limit(20);

    // Calcular ingresos estimados (4.99€ por premium)
    const estimatedRevenue = (premiumUsers || 0) * 4.99;

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: totalUsers || 0,
        premiumUsers: premiumUsers || 0,
        freeUsers: (totalUsers || 0) - (premiumUsers || 0),
        activeToday: activeToday || 0,
        estimatedRevenue: estimatedRevenue.toFixed(2),
        conversionRate: totalUsers ? ((premiumUsers || 0) / totalUsers * 100).toFixed(1) : '0',
      },
      recentUsers: recentUsers || [],
      premiumUsersList: premiumUsersList || [],
    });
  } catch (error) {
    console.error('Error getting admin stats:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas', success: false },
      { status: 500 }
    );
  }
}

// POST - Actualizar usuario (SOLO ADMIN)
export async function POST(request: NextRequest) {
  try {
    // SECURITY: Verify admin access
    const authResult = await verifyAdminAccess(request);
    
    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.error || 'Acceso denegado', success: false },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, action } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'userId y action son requeridos', success: false },
        { status: 400 }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not available' },
        { status: 500 }
      );
    }

    // Log admin action for audit
    console.log(`Admin action: ${action} on user ${userId} by ${authResult.email}`);

    switch (action) {
      case 'makePremium': {
        const { error } = await supabase
          .from('users')
          .update({
            ispremium: true,
            premiumsince: new Date().toISOString(),
          })
          .eq('id', userId);
        
        if (error) throw error;
        return NextResponse.json({ success: true, message: 'Usuario actualizado a Premium' });
      }
      
      case 'removePremium': {
        const { error } = await supabase
          .from('users')
          .update({
            ispremium: false,
            premiumsince: null,
          })
          .eq('id', userId);
        
        if (error) throw error;
        return NextResponse.json({ success: true, message: 'Premium removido' });
      }
      
      case 'makeAdmin': {
        const { error } = await supabase
          .from('users')
          .update({
            role: 'admin',
          })
          .eq('id', userId);
        
        if (error) throw error;
        return NextResponse.json({ success: true, message: 'Usuario actualizado a Admin' });
      }
      
      case 'removeAdmin': {
        // Prevent removing admin from yourself
        const { data: targetUser } = await supabase
          .from('users')
          .select('email')
          .eq('id', userId)
          .single();

        if (targetUser?.email === authResult.email) {
          return NextResponse.json(
            { error: 'No puedes remover tu propio rol de admin', success: false },
            { status: 400 }
          );
        }

        const { error } = await supabase
          .from('users')
          .update({
            role: 'user',
          })
          .eq('id', userId);
        
        if (error) throw error;
        return NextResponse.json({ success: true, message: 'Rol de admin removido' });
      }
      
      case 'deleteUser': {
        // Prevent deleting yourself
        const { data: targetUser } = await supabase
          .from('users')
          .select('email')
          .eq('id', userId)
          .single();

        if (targetUser?.email === authResult.email) {
          return NextResponse.json(
            { error: 'No puedes eliminar tu propia cuenta', success: false },
            { status: 400 }
          );
        }

        const { error } = await supabase
          .from('users')
          .delete()
          .eq('id', userId);
        
        if (error) throw error;
        return NextResponse.json({ success: true, message: 'Usuario eliminado' });
      }
      
      default:
        return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in admin action:', error);
    return NextResponse.json(
      { error: 'Error al ejecutar acción', success: false },
      { status: 500 }
    );
  }
}
