import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyAdminAccess } from '@/lib/auth-utils';

export const dynamic = 'force-dynamic';

// GET - Obtener usuario por email o crear si no existe
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');

    console.log('[API /user] GET request for email:', email);

    if (!email) {
      console.log('[API /user] No email provided');
      return NextResponse.json(
        { error: 'Email es requerido', success: false },
        { status: 400 }
      );
    }

    // Check if supabase is available
    if (!supabase) {
      console.error('[API /user] Supabase client is not initialized');
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
      console.error('[API /user] Error fetching user:', fetchError);
    }

    if (existingUser) {
      console.log('[API /user] Found user:', existingUser.email);
      console.log('[API /user] ispremium field:', existingUser.ispremium, 'type:', typeof existingUser.ispremium);

      // IMPORTANTE: Convertir a booleano de forma estricta
      const isPremiumValue = existingUser.ispremium === true;
      
      console.log('[API /user] Parsed isPremium:', isPremiumValue);

      const user = {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name || email.split('@')[0],
        avatar: existingUser.avatar,
        isPremium: isPremiumValue,
        premiumSince: existingUser.premiumsince,
        points: existingUser.points ?? 0,
        level: existingUser.level ?? 1,
        streak: existingUser.streak ?? 0,
        createdAt: existingUser.createdat,
        role: existingUser.role || 'user',
      };

      console.log('[API /user] Returning user with isPremium:', user.isPremium);
      return NextResponse.json({ user, success: true });
    }

    // Crear usuario nuevo si no existe
    console.log('[API /user] User not found, creating new user');
    
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([{ email, name: email.split('@')[0], role: 'user', ispremium: false }])
      .select()
      .single();

    if (createError) {
      console.error('[API /user] Error creating user:', createError);
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
      isPremium: false,
      premiumSince: newUser.premiumsince,
      points: newUser.points ?? 0,
      level: newUser.level ?? 1,
      streak: newUser.streak ?? 0,
      createdAt: newUser.createdat,
      role: newUser.role || 'user',
    };

    console.log('[API /user] Created new user:', user.email);
    return NextResponse.json({ user, success: true });

  } catch (error) {
    console.error('[API /user] Unexpected error:', error);
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

    // Protected fields that only admins can update
    const PROTECTED_FIELDS = ['ispremium', 'premiumsince', 'role', 'points', 'level', 'streak'];
    const attemptedProtectedUpdates = PROTECTED_FIELDS.filter(field => field in updates);

    if (attemptedProtectedUpdates.length > 0) {
      const authResult = await verifyAdminAccess(request);

      if (!authResult.authorized) {
        console.warn(`[API /user] Unauthorized attempt to update protected fields for email: ${email}`);
        return NextResponse.json(
          { error: 'No tienes permisos para actualizar estos campos', success: false },
          { status: 403 }
        );
      }
    }

    const mappedUpdates: Record<string, unknown> = {
      updatedat: new Date().toISOString(),
    };

    if (updates.name !== undefined) mappedUpdates.name = updates.name;
    if (updates.avatar !== undefined) mappedUpdates.avatar = updates.avatar;
    if (updates.lastActiveAt !== undefined) mappedUpdates.lastactiveat = updates.lastActiveAt;
    if (updates.points !== undefined) mappedUpdates.points = updates.points;
    if (updates.level !== undefined) mappedUpdates.level = updates.level;
    if (updates.streak !== undefined) mappedUpdates.streak = updates.streak;

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
      console.error('[API /user] Error updating user:', error);
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
      isPremium: data.ispremium === true,
      premiumSince: data.premiumsince,
      points: data.points ?? 0,
      level: data.level ?? 1,
      streak: data.streak ?? 0,
      createdAt: data.createdat,
      role: data.role || 'user',
    };

    return NextResponse.json({ user, success: true });

  } catch (error) {
    console.error('[API /user] Error in PATCH:', error);
    return NextResponse.json(
      { error: 'Error al actualizar usuario', success: false },
      { status: 500 }
    );
  }
}

// POST - Crear o actualizar usuario (upsert) - SECURED
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

    const isTryingToSetPremium = isPremium === true;
    const isTryingToSetAdmin = role === 'admin';

    if (isTryingToSetPremium || isTryingToSetAdmin) {
      const authResult = await verifyAdminAccess(request);

      if (!authResult.authorized) {
        console.warn(`[API /user] Unauthorized attempt to create/update user with premium/admin status for email: ${email}`);
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
        ispremium: isTryingToSetPremium ? isPremium : false,
        premiumsince: isTryingToSetPremium ? premiumSince : null,
        role: isTryingToSetAdmin ? role : 'user',
        updatedat: new Date().toISOString(),
      }, {
        onConflict: 'email'
      })
      .select()
      .single();

    if (error) {
      console.error('[API /user] Error upserting user:', error);
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
      isPremium: data.ispremium === true,
      premiumSince: data.premiumsince,
      points: data.points ?? 0,
      level: data.level ?? 1,
      streak: data.streak ?? 0,
      createdAt: data.createdat,
      role: data.role || 'user',
    };

    return NextResponse.json({ user, success: true });

  } catch (error) {
    console.error('[API /user] Error in POST:', error);
    return NextResponse.json(
      { error: 'Error al guardar usuario', success: false },
      { status: 500 }
    );
  }
}
