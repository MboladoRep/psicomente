import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

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
        isPremium: existingUser.ispremium ?? false,
        premiumSince: existingUser.premiumsince,
        points: existingUser.points ?? 0,
        level: existingUser.level ?? 1,
        streak: existingUser.streak ?? 0,
        createdAt: existingUser.createdat,
        role: existingUser.role || 'user',
      };
      return NextResponse.json({ user, success: true });
    }

    // Crear usuario nuevo si no existe
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([{ email, name: email.split('@')[0], role: 'user' }])
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

// PATCH - Actualizar usuario
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

    // Mapear campos de camelCase a los nombres de columna
    const mappedUpdates: Record<string, unknown> = {
      updatedat: new Date().toISOString(),
    };
    
    if (updates.name !== undefined) mappedUpdates.name = updates.name;
    if (updates.avatar !== undefined) mappedUpdates.avatar = updates.avatar;
    if (updates.points !== undefined) mappedUpdates.points = updates.points;
    if (updates.level !== undefined) mappedUpdates.level = updates.level;
    if (updates.streak !== undefined) mappedUpdates.streak = updates.streak;
    if (updates.isPremium !== undefined) mappedUpdates.ispremium = updates.isPremium;
    if (updates.premiumSince !== undefined) mappedUpdates.premiumsince = updates.premiumSince;
    if (updates.lastActiveAt !== undefined) mappedUpdates.lastactiveat = updates.lastActiveAt;
    if (updates.role !== undefined) mappedUpdates.role = updates.role;

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

// POST - Crear o actualizar usuario (upsert)
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

    const { data, error } = await supabase
      .from('users')
      .upsert({
        email,
        name: name || email.split('@')[0],
        ispremium: isPremium ?? false,
        premiumsince: premiumSince,
        role: role || 'user',
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
