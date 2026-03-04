'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Lock,
  Sparkles,
  AlertCircle
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

export default function ChatSection() {
  const { user, canUseChat, remainingChats, incrementChatCount, addPoints } = useUser();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ChatCategory>('general');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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
        throw new Error(data.error);
      }
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudo enviar el mensaje. Inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
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

        <div className="max-w-4xl mx-auto">
          <Card className="border-2 shadow-lg">
            <CardHeader className="border-b bg-muted/30">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  Asistente Psicológico
                </CardTitle>
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

              {/* Input Area */}
              <div className="border-t p-4">
                {!canUseChat && !user?.isPremium ? (
                  <div className="flex items-center justify-center gap-2 py-4 text-muted-foreground">
                    <Lock className="h-4 w-4" />
                    <span>Límite diario alcanzado.</span>
                    <Button size="sm" variant="link" asChild>
                      <a href="#precios">Actualizar a Premium</a>
                    </Button>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      sendMessage();
                    }}
                    className="flex gap-2"
                  >
                    <Input
                      placeholder="Escribe tu consulta..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      disabled={isLoading}
                      className="flex-1"
                    />
                    <Button type="submit" disabled={isLoading || !input.trim()}>
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </form>
                )}
              </div>
            </CardContent>
          </Card>

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
