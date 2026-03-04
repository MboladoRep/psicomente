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

    // Buscar usuario
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json({ user: existingUser, success: true });
    }

    // Crear usuario nuevo si no existe
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([{ email }])
      .select()
      .single();

    if (createError) {
      console.error('Error creating user:', createError);
      return NextResponse.json(
        { error: 'Error al crear usuario', success: false },
        { status: 500 }
      );
    }

    return NextResponse.json({ user: newUser, success: true });
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

    // Mapear campos de camelCase a los nombres de columna
    const mappedUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) mappedUpdates.name = updates.name;
    if (updates.avatar !== undefined) mappedUpdates.avatar = updates.avatar;
    if (updates.points !== undefined) mappedUpdates.points = updates.points;
    if (updates.level !== undefined) mappedUpdates.level = updates.level;
    if (updates.streak !== undefined) mappedUpdates.streak = updates.streak;
    if (updates.isPremium !== undefined) mappedUpdates.ispremium = updates.isPremium;
    if (updates.premiumSince !== undefined) mappedUpdates.premiumsince = updates.premiumSince;
    if (updates.lastActiveAt !== undefined) mappedUpdates.lastactiveat = updates.lastActiveAt;

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

    return NextResponse.json({ user: data, success: true });
  } catch (error) {
    console.error('Error in user PATCH:', error);
    return NextResponse.json(
      { error: 'Error al actualizar usuario', success: false },
      { status: 500 }
    );
  }
}
