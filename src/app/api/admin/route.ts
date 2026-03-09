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

    // Obtener TODOS los usuarios sin límite para conteo preciso
    const { data: allUsersData, error: allUsersError } = await supabase
      .from('users')
      .select('id, email, name, ispremium, createdat, premiumsince, role, lastactiveat');

    if (allUsersError) {
      console.error('[Admin API] Error fetching users:', allUsersError);
      return NextResponse.json(
        { error: 'Error al obtener usuarios', success: false },
        { status: 500 }
      );
    }

    // Calcular estadísticas manualmente para mayor precisión
    const totalUsers = allUsersData?.length || 0;
    const premiumUsers = allUsersData?.filter(u => u.ispremium === true).length || 0;
    const freeUsers = totalUsers - premiumUsers;
    
    // Usuarios activos hoy
    const today = new Date().toISOString().split('T')[0];
    const activeToday = allUsersData?.filter(u => 
      u.lastactiveat && u.lastactiveat >= today
    ).length || 0;

    // Últimos usuarios registrados
    const recentUsers = allUsersData
      ?.sort((a, b) => new Date(b.createdat).getTime() - new Date(a.createdat).getTime())
      .slice(0, 10)
      .map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        isPremium: u.ispremium,
        createdAt: u.createdat,
        premiumSince: u.premiumsince,
        role: u.role
      }));

    // Usuarios premium para la lista
    const premiumUsersList = allUsersData
      ?.filter(u => u.ispremium === true)
      .sort((a, b) => new Date(b.premiumsince || 0).getTime() - new Date(a.premiumsince || 0).getTime())
      .slice(0, 20);

    // Calcular ingresos estimados (4.99€ por premium)
    const estimatedRevenue = (premiumUsers * 4.99).toFixed(2);

    console.log('[Admin API] Stats:', {
      totalUsers,
      premiumUsers,
      freeUsers,
      activeToday,
      estimatedRevenue
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        premiumUsers,
        freeUsers,
        activeToday,
        estimatedRevenue,
        conversionRate: totalUsers ? ((premiumUsers / totalUsers) * 100).toFixed(1) : '0',
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
