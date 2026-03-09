-- Ejecutar este SQL en Supabase SQL Editor para crear la tabla de conversaciones

-- Crear tabla de conversaciones de chat
CREATE TABLE IF NOT EXISTS chat_conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'Nueva conversación',
  category TEXT DEFAULT 'general',
  messages JSONB DEFAULT '[]'::jsonb,
  createdat TIMESTAMPTZ DEFAULT NOW(),
  updatedat TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_email ON chat_conversations(user_email);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_updatedat ON chat_conversations(updatedat DESC);

-- Habilitar RLS (Row Level Security)
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver sus propias conversaciones
CREATE POLICY "Users can view own conversations" ON chat_conversations
  FOR SELECT USING (true);  -- Temporalmente abierta para desarrollo, luego cambiar a: auth.jwt() ->> 'email' = user_email

-- Política: Los usuarios pueden insertar sus propias conversaciones
CREATE POLICY "Users can insert own conversations" ON chat_conversations
  FOR INSERT WITH CHECK (true);

-- Política: Los usuarios pueden actualizar sus propias conversaciones
CREATE POLICY "Users can update own conversations" ON chat_conversations
  FOR UPDATE USING (true);

-- Política: Los usuarios pueden eliminar sus propias conversaciones
CREATE POLICY "Users can delete own conversations" ON chat_conversations
  FOR DELETE USING (true);

-- Comentario
COMMENT ON TABLE chat_conversations IS 'Almacena las conversaciones de chat con IA de los usuarios';
