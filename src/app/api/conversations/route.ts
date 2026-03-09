import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

// GET - Obtener conversaciones del usuario
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');
    const conversationId = searchParams.get('id');

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

    // If conversationId is provided, get specific conversation with messages
    if (conversationId) {
      const { data: conversation, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('user_email', email)
        .single();

      if (error) {
        console.error('Error fetching conversation:', error);
        return NextResponse.json(
          { error: 'Conversación no encontrada', success: false },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        conversation: {
          id: conversation.id,
          title: conversation.title,
          category: conversation.category,
          messages: conversation.messages || [],
          createdAt: conversation.createdat,
          updatedAt: conversation.updatedat,
        }
      });
    }

    // Get all conversations for the user (just metadata, no messages)
    const { data: conversations, error } = await supabase
      .from('chat_conversations')
      .select('id, title, category, createdat, updatedat')
      .eq('user_email', email)
      .order('updatedat', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return NextResponse.json(
        { error: 'Error al obtener conversaciones', success: false },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      conversations: conversations?.map(c => ({
        id: c.id,
        title: c.title,
        category: c.category,
        createdAt: c.createdat,
        updatedAt: c.updatedat,
      })) || []
    });

  } catch (error) {
    console.error('Error in conversations GET:', error);
    return NextResponse.json(
      { error: 'Error al obtener conversaciones', success: false },
      { status: 500 }
    );
  }
}

// POST - Crear nueva conversación
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, title, category, messages } = body;

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

    // Check if user is premium (for limiting conversations)
    const { data: user } = await supabase
      .from('users')
      .select('ispremium')
      .eq('email', email)
      .single();

    const isPremium = user?.ispremium ?? false;

    // If not premium, check conversation limit
    if (!isPremium) {
      const { count } = await supabase
        .from('chat_conversations')
        .select('*', { count: 'exact', head: true })
        .eq('user_email', email);

      // Free users can only have 3 conversations
      if (count && count >= 3) {
        return NextResponse.json(
          {
            error: 'Has alcanzado el límite de 3 conversaciones. Actualiza a Premium para conversaciones ilimitadas.',
            success: false,
            limitReached: true
          },
          { status: 403 }
        );
      }
    }

    const { data: conversation, error } = await supabase
      .from('chat_conversations')
      .insert([{
        user_email: email,
        title: title || 'Nueva conversación',
        category: category || 'general',
        messages: messages || [],
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating conversation:', error);
      return NextResponse.json(
        { error: 'Error al crear conversación', success: false },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      conversation: {
        id: conversation.id,
        title: conversation.title,
        category: conversation.category,
        messages: conversation.messages || [],
        createdAt: conversation.createdat,
      }
    });

  } catch (error) {
    console.error('Error in conversations POST:', error);
    return NextResponse.json(
      { error: 'Error al crear conversación', success: false },
      { status: 500 }
    );
  }
}

// PATCH - Actualizar conversación (añadir mensajes)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationId, email, title, messages, appendMessages } = body;

    if (!conversationId || !email) {
      return NextResponse.json(
        { error: 'conversationId y email son requeridos', success: false },
        { status: 400 }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available', success: false },
        { status: 500 }
      );
    }

    // Verify ownership
    const { data: existing } = await supabase
      .from('chat_conversations')
      .select('messages')
      .eq('id', conversationId)
      .eq('user_email', email)
      .single();

    if (!existing) {
      return NextResponse.json(
        { error: 'Conversación no encontrada', success: false },
        { status: 404 }
      );
    }

    // Prepare update
    const updateData: Record<string, unknown> = {
      updatedat: new Date().toISOString(),
    };

    if (title) {
      updateData.title = title;
    }

    if (messages) {
      // Replace all messages
      updateData.messages = messages;
    } else if (appendMessages && Array.isArray(appendMessages)) {
      // Append new messages to existing
      updateData.messages = [...(existing.messages || []), ...appendMessages];
    }

    const { data: conversation, error } = await supabase
      .from('chat_conversations')
      .update(updateData)
      .eq('id', conversationId)
      .eq('user_email', email)
      .select()
      .single();

    if (error) {
      console.error('Error updating conversation:', error);
      return NextResponse.json(
        { error: 'Error al actualizar conversación', success: false },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      conversation: {
        id: conversation.id,
        title: conversation.title,
        messages: conversation.messages || [],
        updatedAt: conversation.updatedat,
      }
    });

  } catch (error) {
    console.error('Error in conversations PATCH:', error);
    return NextResponse.json(
      { error: 'Error al actualizar conversación', success: false },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar conversación
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const conversationId = searchParams.get('id');
    const email = searchParams.get('email');

    if (!conversationId || !email) {
      return NextResponse.json(
        { error: 'id y email son requeridos', success: false },
        { status: 400 }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not available', success: false },
        { status: 500 }
      );
    }

    // Verify ownership and delete
    const { error } = await supabase
      .from('chat_conversations')
      .delete()
      .eq('id', conversationId)
      .eq('user_email', email);

    if (error) {
      console.error('Error deleting conversation:', error);
      return NextResponse.json(
        { error: 'Error al eliminar conversación', success: false },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Conversación eliminada correctamente'
    });

  } catch (error) {
    console.error('Error in conversations DELETE:', error);
    return NextResponse.json(
      { error: 'Error al eliminar conversación', success: false },
      { status: 500 }
    );
  }
}
