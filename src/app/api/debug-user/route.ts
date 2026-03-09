import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// Diagnostic endpoint to check user data in database
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido. Usa ?email=tu@email.com', success: false },
        { status: 400 }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available', success: false },
        { status: 500 }
      );
    }

    // Get raw user data from database
    const { data: rawUser, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      return NextResponse.json({
        success: false,
        error: 'Error al obtener usuario',
        details: error.message,
        code: error.code
      });
    }

    if (!rawUser) {
      return NextResponse.json({
        success: false,
        error: 'Usuario no encontrado',
        email
      });
    }

    // Return all raw data for debugging
    return NextResponse.json({
      success: true,
      email,
      rawDatabaseData: rawUser,
      mappedFields: {
        id: rawUser.id,
        email: rawUser.email,
        name: rawUser.name,
        isPremium: rawUser.ispremium,
        premiumSince: rawUser.premiumsince,
        role: rawUser.role,
        createdAt: rawUser.createdat,
        updatedAt: rawUser.updatedat,
        points: rawUser.points,
        level: rawUser.level,
        streak: rawUser.streak,
        profileInfo: rawUser.profileinfo,
      },
      columnNames: Object.keys(rawUser),
      premiumStatusCheck: {
        rawValue: rawUser.ispremium,
        type: typeof rawUser.ispremium,
        isTrue: rawUser.ispremium === true,
        isTruthy: !!rawUser.ispremium,
        isOne: rawUser.ispremium === 1,
        isStringTrue: rawUser.ispremium === 'true',
      }
    });

  } catch (error) {
    console.error('Error in debug-user:', error);
    return NextResponse.json(
      { error: 'Error interno', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}
