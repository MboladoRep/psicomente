import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyAdminAccess } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

// Fields that regular users can update on their own profile
const ALLOWED_USER_UPDATE_FIELDS = ['name', 'avatar', 'lastActiveAt'];

// Fields that only admins or system can update
const PROTECTED_FIELDS = ['ispremium', 'premiumsince', 'role', 'points', 'level', 'streak'];

// GET - Obtener usuario por email o crear si no existe
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido', success: false },
        { status: 400 }
      );
    }

    // Check if supabase is available
    if (!supabase) {
      console.error('Supabase client is not initialized');
      return NextResponse.json(
        { error: 'Database connection not available', success: false },
        { status: 500 }
      );
    }

    // Buscar usuario
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching user:', fetchError);
    }

    if (existingUser) {
      // Map database fields to camelCase for frontend
      const user = {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
        avatar: existingUser.avatar,
        isPremium: existingUser.ispremium === true,
        premiumSince: existingUser.premiumsince,
        points: existingUser.points ?? 0,
        level: existingUser.level ?? 1,
        streak: existingUser.streak ?? 0,
        createdAt: existingUser.createdat,
        role: existingUser.role || 'user',
      };
      return NextResponse.json({ user, success: true });
    }

    // Crear usuario nuevo si no existe (siempre como user normal, no premium)
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([{ email, name: email.split('@')[0], role: 'user', ispremium: false }])
      .select()
      .single();

    if (createError) {
      console.error('Error creating user:', createError);
      return NextResponse.json(
        { error: 'Error al crear usuario', success: false },
        { status: 500 }
      );
    }

    const user = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      avatar: newUser.avatar,
      isPremium: newUser.ispremium ?? false,
      premiumSince: newUser.premiumsince,
      points: newUser.points ?? 0,
      level: newUser.level ?? 1,
      streak: newUser.streak ?? 0,
      createdAt: newUser.createdat,
      role: newUser.role || 'user',
    };

    return NextResponse.json({ user, success: true });
  } catch (error) {
    console.error('Error in user API:', error);
    return NextResponse.json(
      { error: 'Error al obtener usuario', success: false },
      { status: 500 }
    );
  }
}

// PATCH - Actualizar usuario (SECURED)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, ...updates } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido', success: false },
        { status: 400 }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available', success: false },
        { status: 500 }
      );
    }

    // Check if user is trying to update protected fields
    const attemptedProtectedUpdates = PROTECTED_FIELDS.filter(field => field in updates);
    
    if (attemptedProtectedUpdates.length > 0) {
      // Check if requester is admin
      const authResult = await verifyAdminAccess(request);
      
      if (!authResult.authorized) {
        console.warn(`Unauthorized attempt to update protected fields: ${attemptedProtectedUpdates.join(', ')} for email: ${email}`);
        return NextResponse.json(
          { error: 'No tienes permisos para actualizar estos campos', success: false },
          { status: 403 }
        );
      }
    }

    // Mapear campos de camelCase a los nombres de columna
    // Only allow specific fields based on permissions
    const mappedUpdates: Record<string, unknown> = {
      updatedat: new Date().toISOString(),
    };
    
    // Safe fields that users can update
    if (updates.name !== undefined) mappedUpdates.name = updates.name;
    if (updates.avatar !== undefined) mappedUpdates.avatar = updates.avatar;
    if (updates.lastActiveAt !== undefined) mappedUpdates.lastactiveat = updates.lastActiveAt;
    
    // Gamification fields (users can earn points, but this should be done via game actions)
    if (updates.points !== undefined) mappedUpdates.points = updates.points;
    if (updates.level !== undefined) mappedUpdates.level = updates.level;
    if (updates.streak !== undefined) mappedUpdates.streak = updates.streak;
    
    // Protected fields (only admins or system can set these)
    // These are only processed if admin access was verified above
    if (updates.isPremium !== undefined && attemptedProtectedUpdates.includes('ispremium')) {
      mappedUpdates.ispremium = updates.isPremium;
    }
    if (updates.premiumSince !== undefined && attemptedProtectedUpdates.includes('premiumsince')) {
      mappedUpdates.premiumsince = updates.premiumSince;
    }
    if (updates.role !== undefined && attemptedProtectedUpdates.includes('role')) {
      mappedUpdates.role = updates.role;
    }

    const { data, error } = await supabase
      .from('users')
      .update(mappedUpdates)
      .eq('email', email)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      return NextResponse.json(
        { error: 'Error al actualizar usuario', success: false },
        { status: 500 }
      );
    }

    const user = {
      id: data.id,
      email: data.email,
      name: data.name,
      avatar: data.avatar,
      isPremium: data.ispremium ?? false,
      premiumSince: data.premiumsince,
      points: data.points ?? 0,
      level: data.level ?? 1,
      streak: data.streak ?? 0,
      createdAt: data.createdat,
      role: data.role || 'user',
    };

    return NextResponse.json({ user, success: true });
  } catch (error) {
    console.error('Error in user PATCH:', error);
    return NextResponse.json(
      { error: 'Error al actualizar usuario', success: false },
      { status: 500 }
    );
  }
}

// POST - Crear o actualizar usuario (upsert) - SECURED
// This should only be used for creating users, not for granting premium
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, isPremium, premiumSince, role } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido', success: false },
        { status: 400 }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available', success: false },
        { status: 500 }
      );
    }

    // SECURITY: Check if trying to set premium or admin role
    const isTryingToSetPremium = isPremium === true;
    const isTryingToSetAdmin = role === 'admin';
    
    if (isTryingToSetPremium || isTryingToSetAdmin) {
      // Verify admin access
      const authResult = await verifyAdminAccess(request);
      
      if (!authResult.authorized) {
        console.warn(`Unauthorized attempt to create/update user with premium/admin status for email: ${email}`);
        return NextResponse.json(
          { error: 'No tienes permisos para realizar esta acción', success: false },
          { status: 403 }
        );
      }
    }

    const { data, error } = await supabase
      .from('users')
      .upsert({
        email,
        name: name || email.split('@')[0],
        // Only set premium if authorized (admin/system)
        ispremium: isTryingToSetPremium ? isPremium : false,
        premiumsince: isTryingToSetPremium ? premiumSince : null,
        // Only set role if authorized and not trying to set admin without permission
        role: isTryingToSetAdmin ? role : 'user',
        updatedat: new Date().toISOString(),
      }, {
        onConflict: 'email'
      })
      .select()
      .single();

    if (error) {
      console.error('Error upserting user:', error);
      return NextResponse.json(
        { error: 'Error al guardar usuario', success: false },
        { status: 500 }
      );
    }

    const user = {
      id: data.id,
      email: data.email,
      name: data.name,
      avatar: data.avatar,
      isPremium: data.ispremium ?? false,
      premiumSince: data.premiumsince,
      points: data.points ?? 0,
      level: data.level ?? 1,
      streak: data.streak ?? 0,
      createdAt: data.createdat,
      role: data.role || 'user',
    };

    return NextResponse.json({ user, success: true });
  } catch (error) {
    console.error('Error in user POST:', error);
    return NextResponse.json(
      { error: 'Error al guardar usuario', success: false },
      { status: 500 }
    );
  }
}
