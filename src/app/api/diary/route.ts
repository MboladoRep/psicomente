import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET - Obtener entradas del diario
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!email) {
      return NextResponse.json(
        { error: 'Email es requerido', success: false },
        { status: 400 }
      );
    }

    // Obtener user ID
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (!user) {
      return NextResponse.json({ entries: [], success: true });
    }

    const { data: entries, error } = await supabase
      .from('diary_entries')
      .select('*')
      .eq('userid', user.id)
      .order('createdat', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching diary:', error);
      return NextResponse.json({ entries: [], success: true });
    }

    return NextResponse.json({ entries: entries || [], success: true });
  } catch (error) {
    console.error('Error in diary GET:', error);
    return NextResponse.json(
      { error: 'Error al obtener entradas', success: false },
      { status: 500 }
    );
  }
}

// POST - Crear nueva entrada
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, mood, emotions, title, content, isPrivate } = body;

    if (!email || !content) {
      return NextResponse.json(
        { error: 'Email y contenido son requeridos', success: false },
        { status: 400 }
      );
    }

    // Obtener o crear usuario
    let { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (!user) {
      const { data: newUser } = await supabase
        .from('users')
        .insert([{ email }])
        .select('id')
        .single();
      user = newUser;
    }

    // Crear entrada
    const { data: entry, error } = await supabase
      .from('diary_entries')
      .insert([{
        userid: user.id,
        mood: mood || 3,
        emotions: emotions || [],
        title: title || null,
        content,
        isprivate: isPrivate !== false,
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating diary entry:', error);
      return NextResponse.json(
        { error: 'Error al crear entrada', success: false },
        { status: 500 }
      );
    }

    // Añadir puntos
    await supabase.rpc('increment_user_points', {
      user_email: email,
      points_to_add: 15
    }).catch(() => {
      // Si no existe la función, actualizar manualmente
      supabase
        .from('users')
        .update({ points: 15 })
        .eq('email', email);
    });

    return NextResponse.json({ entry, success: true, pointsEarned: 15 });
  } catch (error) {
    console.error('Error in diary POST:', error);
    return NextResponse.json(
      { error: 'Error al crear entrada', success: false },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar entrada
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const entryId = searchParams.get('id');
    const email = searchParams.get('email');

    if (!entryId || !email) {
      return NextResponse.json(
        { error: 'ID y email son requeridos', success: false },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('diary_entries')
      .delete()
      .eq('id', entryId);

    if (error) {
      console.error('Error deleting entry:', error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in diary DELETE:', error);
    return NextResponse.json(
      { error: 'Error al eliminar entrada', success: false },
      { status: 500 }
    );
  }
}
