'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import {
  MessageCircle,
  Send,
  Bot,
  User,
  Loader2,
  Lock,
  Sparkles,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Crown,
  Save,
  Check,
  Plus,
  Trash2
} from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { ChatMessage, ChatCategory } from '@/types';
import { useToast } from '@/hooks/use-toast';

const categories: { id: ChatCategory; label: string }[] = [
  { id: 'ansiedad', label: 'Ansiedad' },
  { id: 'depresion', label: 'Depresión' },
  { id: 'relaciones', label: 'Relaciones' },
  { id: 'autoestima', label: 'Autoestima' },
  { id: 'estres', label: 'Estrés' },
  { id: 'duelo', label: 'Duelo' },
  { id: 'general', label: 'General' },
];

interface SavedConversation {
  id: string;
  title: string;
  category: string;
  createdAt: string;
  updatedAt: string;
}

export default function ChatSection() {
  const { user, canUseChat, remainingChats, incrementChatCount, addPoints } = useUser();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ChatCategory>('general');
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Conversation history state
  const [showHistory, setShowHistory] = useState(false);
  const [conversations, setConversations] = useState<SavedConversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [savingConversation, setSavingConversation] = useState(false);
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);

  // Load conversations on mount if user is logged in
  useEffect(() => {
    if (user?.email) {
      loadConversations();
    }
  }, [user?.email]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 200);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [input]);

  const loadConversations = async () => {
    if (!user?.email) return;

    setLoadingHistory(true);
    try {
      const response = await fetch(`/api/conversations?email=${encodeURIComponent(user.email)}`);
      const data = await response.json();

      if (data.success) {
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadConversation = async (conversationId: string) => {
    if (!user?.email) return;

    try {
      const response = await fetch(`/api/conversations?email=${encodeURIComponent(user.email)}&id=${conversationId}`);
      const data = await response.json();

      if (data.success && data.conversation) {
        setMessages(data.conversation.messages.map((m: { role: string; content: string; timestamp?: string }) => ({
          id: crypto.randomUUID(),
          role: m.role as 'user' | 'assistant',
          content: m.content,
          timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
        })));
        setCurrentConversationId(conversationId);
        setSelectedCategory((data.conversation.category as ChatCategory) || 'general');
        setShowHistory(false);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar la conversación',
        variant: 'destructive',
      });
    }
  };

  const saveConversation = async () => {
    if (!user?.email || messages.length === 0) return;

    setSavingConversation(true);
    setSavedSuccessfully(false);
    try {
      const firstUserMessage = messages.find(m => m.role === 'user');
      const title = firstUserMessage
        ? firstUserMessage.content.substring(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '')
        : 'Nueva conversación';

      if (currentConversationId) {
        const response = await fetch('/api/conversations', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId: currentConversationId,
            email: user.email,
            title,
            messages: messages.map(m => ({
              role: m.role,
              content: m.content,
              timestamp: m.timestamp?.toISOString(),
            })),
          }),
        });

        const data = await response.json();
        if (data.success) {
          setSavedSuccessfully(true);
          setTimeout(() => setSavedSuccessfully(false), 2000);
          toast({
            title: '✓ Conversación guardada',
            description: 'Tu conversación se ha guardado correctamente',
          });
          loadConversations();
        } else if (data.limitReached) {
          toast({
            title: 'Límite alcanzado',
            description: data.error,
            variant: 'destructive',
          });
        }
      } else {
        const response = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            title,
            category: selectedCategory,
            messages: messages.map(m => ({
              role: m.role,
              content: m.content,
              timestamp: m.timestamp?.toISOString(),
            })),
          }),
        });

        const data = await response.json();
        if (data.success) {
          setCurrentConversationId(data.conversation.id);
          setSavedSuccessfully(true);
          setTimeout(() => setSavedSuccessfully(false), 2000);
          toast({
            title: '✓ Conversación guardada',
            description: 'Tu conversación se ha guardado correctamente',
          });
          loadConversations();
        } else if (data.limitReached) {
          toast({
            title: 'Límite alcanzado',
            description: data.error,
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Error saving conversation:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar la conversación',
        variant: 'destructive',
      });
    } finally {
      setSavingConversation(false);
    }
  };

  const deleteConversation = async (conversationId: string) => {
    if (!user?.email) return;

    try {
      const response = await fetch(`/api/conversations?id=${conversationId}&email=${encodeURIComponent(user.email)}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Conversación eliminada',
          description: 'La conversación ha sido eliminada',
        });
        setConversations(prev => prev.filter(c => c.id !== conversationId));
        if (currentConversationId === conversationId) {
          setCurrentConversationId(null);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar la conversación',
        variant: 'destructive',
      });
    }
  };

  const startNewConversation = () => {
    setMessages([]);
    setCurrentConversationId(null);
    setSelectedCategory('general');
    setSavedSuccessfully(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    if (!canUseChat) {
      toast({
        title: 'Límite alcanzado',
        description: 'Has alcanzado tu límite de 5 consultas diarias. Actualiza a Premium para consultas ilimitadas.',
        variant: 'destructive',
      });
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          category: selectedCategory,
          history: messages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
        incrementChatCount();
        addPoints(10);
      } else {
        const errorMsg = data.error || 'No se pudo enviar el mensaje. Inténtalo de nuevo.';

        if (data.errorCode === 'MISSING_API_KEY' || data.errorCode === 'AUTH_ERROR') {
          toast({
            title: 'Error de configuración',
            description: 'El servicio de chat no está disponible temporalmente.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Error',
            description: errorMsg,
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: 'Error',
        description: 'No se pudo enviar el mensaje. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  return (
    <section id="chat" className="py-16 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-2">
            <MessageCircle className="h-3 w-3 mr-1" />
            Consultas con IA
          </Badge>
          <h2 className="text-3xl font-bold mb-2">Chat Psicológico</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Consulta tus dudas, inquietudes o situaciones personales. Nuestra IA te brindará orientación y apoyo.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="flex gap-4">
            {/* History Sidebar - Only for logged in users */}
            {user && (
              <div className={`${showHistory ? 'w-64' : 'w-12'} transition-all duration-300 flex-shrink-0`}>
                <Card className="h-full">
                  <CardContent className="p-2 h-full flex flex-col">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowHistory(!showHistory)}
                      className="w-full justify-start mb-2"
                    >
                      {showHistory ? <ChevronLeft className="h-4 w-4 mr-1" /> : <ChevronRight className="h-4 w-4 mr-1" />}
                      {showHistory && <span className="text-sm">Historial</span>}
                    </Button>

                    {showHistory && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={startNewConversation}
                          className="w-full mb-2"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Nueva
                        </Button>

                        <ScrollArea className="flex-1">
                          {loadingHistory ? (
                            <div className="flex justify-center py-4">
                              <Loader2 className="h-4 w-4 animate-spin" />
                            </div>
                          ) : conversations.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center py-4">
                              No hay conversaciones guardadas
                            </p>
                          ) : (
                            <div className="space-y-1">
                              {conversations.map((conv) => (
                                <div
                                  key={conv.id}
                                  className={`group p-2 rounded-lg cursor-pointer hover:bg-muted transition-colors ${
                                    currentConversationId === conv.id ? 'bg-muted' : ''
                                  }`}
                                  onClick={() => loadConversation(conv.id)}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-medium truncate">{conv.title}</p>
                                      <p className="text-xs text-muted-foreground">{formatDate(conv.updatedAt)}</p>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        deleteConversation(conv.id);
                                      }}
                                    >
                                      <Trash2 className="h-3 w-3 text-destructive" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </ScrollArea>

                        {/* Limit info for free users */}
                        {!user.isPremium && (
                          <div className="mt-2 p-2 bg-muted/50 rounded-lg">
                            <p className="text-xs text-muted-foreground text-center">
                              {conversations.length}/3 conversaciones
                            </p>
                            {conversations.length >= 3 && (
                              <Button variant="link" size="sm" className="w-full text-xs" asChild>
                                <a href="#precios">
                                  <Crown className="h-3 w-3 mr-1" />
                                  Premium ilimitado
                                </a>
                              </Button>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Main Chat Area */}
            <Card className="border-2 shadow-lg flex-1">
              <CardHeader className="border-b bg-muted/30">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    Asistente Psicológico
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {!user?.isPremium && (
                      <Badge variant={remainingChats > 0 ? 'secondary' : 'destructive'}>
                        {remainingChats === Infinity ? (
                          <>
                            <Sparkles className="h-3 w-3 mr-1" /> Ilimitado
                          </>
                        ) : (
                          <>
                            {remainingChats} consultas restantes
                          </>
                        )}
                      </Badge>
                    )}
                    {user?.isPremium && (
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500">
                        <Sparkles className="h-3 w-3 mr-1" /> Premium Ilimitado
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Category Selection */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {categories.map((cat) => (
                    <Button
                      key={cat.id}
                      size="sm"
                      variant={selectedCategory === cat.id ? 'default' : 'outline'}
                      onClick={() => setSelectedCategory(cat.id)}
                      className="text-xs"
                    >
                      {cat.label}
                    </Button>
                  ))}
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {/* Messages Area */}
                <ScrollArea className="h-[400px] p-4" ref={scrollRef}>
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                      <Bot className="h-16 w-16 mb-4 text-primary/30" />
                      <p className="font-medium mb-1">Hola, soy tu asistente psicológico</p>
                      <p className="text-sm max-w-md">
                        Selecciona una categoría y escribe tu consulta. Estoy aquí para escucharte y orientarte.
                      </p>
                      {!user && (
                        <p className="text-xs mt-2 text-amber-600">
                          Inicia sesión para guardar tus conversaciones
                        </p>
                      )}
                      <div className="mt-4 grid grid-cols-2 gap-2 max-w-sm">
                        {['¿Cómo manejar la ansiedad?', 'Técnicas de relajación', 'Me siento abrumado', 'Problemas en relaciones'].map((suggestion) => (
                          <Button
                            key={suggestion}
                            variant="outline"
                            size="sm"
                            className="text-xs justify-start"
                            onClick={() => setInput(suggestion)}
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                          {message.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <Bot className="h-4 w-4 text-primary" />
                            </div>
                          )}
                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                              message.role === 'user'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          </div>
                          {message.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                              <User className="h-4 w-4 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Bot className="h-4 w-4 text-primary" />
                          </div>
                          <div className="bg-muted rounded-2xl px-4 py-3">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>

                {/* Input Area - Con botón de guardar */}
                <div className="border-t p-4 space-y-3">
                  {/* Botón de guardar - Visible cuando hay mensajes */}
                  {user && messages.length > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant={savedSuccessfully ? "default" : "outline"}
                          size="sm"
                          onClick={saveConversation}
                          disabled={savingConversation}
                          className={`gap-2 ${savedSuccessfully ? 'bg-green-600 hover:bg-green-700' : ''}`}
                        >
                          {savingConversation ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Guardando...
                            </>
                          ) : savedSuccessfully ? (
                            <>
                              <Check className="h-4 w-4" />
                              Guardado
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4" />
                              Guardar conversación
                            </>
                          )}
                        </Button>
                        {currentConversationId && (
                          <span className="text-xs text-muted-foreground">
                            {user.isPremium ? '✓ Sin límite' : `${conversations.length}/3 guardadas`}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Campo de texto y botón enviar */}
                  {!canUseChat && !user?.isPremium ? (
                    <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
                      <Lock className="h-4 w-4" />
                      <span>Límite diario alcanzado.</span>
                      <Button size="sm" variant="link" asChild>
                        <a href="#precios">Actualizar a Premium</a>
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2 items-end">
                      <Textarea
                        ref={textareaRef}
                        placeholder="Escribe tu consulta... (Shift+Enter para nueva línea)"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isLoading}
                        className="flex-1 min-h-[44px] max-h-[200px] resize-none"
                        rows={1}
                      />
                      <Button 
                        type="submit" 
                        disabled={isLoading || !input.trim()} 
                        className="h-11 px-4"
                        onClick={sendMessage}
                      >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      </Button>
                    </div>
                  )}
                  
                  {/* Hint para el usuario */}
                  <p className="text-xs text-muted-foreground text-center">
                    Pulsa Enter para enviar • Shift+Enter para nueva línea
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Disclaimer */}
          <div className="mt-4 flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <p>
              <strong>Aviso importante:</strong> Este chat es una herramienta de apoyo y educación,
              no sustituye la ayuda profesional. Si estás en crisis o tienes pensamientos de autolesión,
              busca ayuda inmediata. Línea de emergencia: 024 (España) o tu número local de emergencias.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
