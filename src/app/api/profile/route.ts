import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET - Obtener perfil de usuario
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

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available', success: false },
        { status: 500 }
      );
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error);
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado', success: false },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        isPremium: user.ispremium ?? false,
        premiumSince: user.premiumsince,
        role: user.role || 'user',
        createdAt: user.createdat,
        // Profile info for AI personalization
        profileInfo: user.profileinfo || null,
      }
    });

  } catch (error) {
    console.error('Error in profile GET:', error);
    return NextResponse.json(
      { error: 'Error al obtener perfil', success: false },
      { status: 500 }
    );
  }
}

// PATCH - Actualizar perfil de usuario
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, avatar, profileInfo } = body;

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

    const updateData: Record<string, unknown> = {
      updatedat: new Date().toISOString(),
    };

    if (name !== undefined) updateData.name = name;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (profileInfo !== undefined) updateData.profileinfo = profileInfo;

    const { data: user, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('email', email)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return NextResponse.json(
        { error: 'Error al actualizar perfil', success: false },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        isPremium: user.ispremium ?? false,
        premiumSince: user.premiumsince,
        role: user.role || 'user',
        profileInfo: user.profileinfo || null,
      }
    });

  } catch (error) {
    console.error('Error in profile PATCH:', error);
    return NextResponse.json(
      { error: 'Error al actualizar perfil', success: false },
      { status: 500 }
    );
  }
}
