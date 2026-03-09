'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Heart, 
  Save, 
  Crown,
  Smile,
  Meh,
  Frown,
  Angry,
  Sparkles,
  TrendingUp,
  Calendar,
  Trash2,
  Loader2
} from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { useToast } from '@/hooks/use-toast';
import { authPost, authDelete } from '@/lib/api-client';

const emotions = [
  { id: 'feliz', label: 'Feliz', icon: Smile, color: 'text-yellow-500' },
  { id: 'tranquilo', label: 'Tranquilo', icon: Meh, color: 'text-blue-500' },
  { id: 'agradecido', label: 'Agradecido', icon: Sparkles, color: 'text-pink-500' },
  { id: 'neutral', label: 'Neutral', icon: Meh, color: 'text-gray-500' },
  { id: 'triste', label: 'Triste', icon: Frown, color: 'text-indigo-500' },
  { id: 'ansioso', label: 'Ansioso', icon: TrendingUp, color: 'text-orange-500' },
  { id: 'estresado', label: 'Estresado', icon: Angry, color: 'text-red-500' },
];

interface DiaryEntry {
  id: string;
  mood: number;
  emotions: string[];
  title?: string;
  content: string;
  createdAt: string;
}

const STORAGE_ENTRIES_KEY = 'psicomente_diary_entries';

function getInitialEntries(): DiaryEntry[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_ENTRIES_KEY);
  return stored ? JSON.parse(stored) : [];
}

export default function EmotionalDiary() {
  const { user, addPoints } = useUser();
  const { toast } = useToast();
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  const [intensity, setIntensity] = useState(5);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [entries, setEntries] = useState<DiaryEntry[]>(getInitialEntries);

  const handleSave = async () => {
    if (!selectedEmotion) {
      toast({
        title: 'Selecciona una emoción',
        description: 'Por favor, selecciona cómo te sientes hoy.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    
    const newEntry: DiaryEntry = {
      id: crypto.randomUUID(),
      mood: intensity,
      emotions: [selectedEmotion],
      content: notes || `Me siento ${selectedEmotion} con intensidad ${intensity}/10`,
      createdAt: new Date().toISOString(),
    };
    
    // Guardar en localStorage
    const updatedEntries = [newEntry, ...entries];
    localStorage.setItem(STORAGE_ENTRIES_KEY, JSON.stringify(updatedEntries));
    setEntries(updatedEntries);
    
    // Intentar guardar en la base de datos con autenticación
    if (user?.email) {
      authPost('/api/diary', {
        email: user.email,
        mood: intensity,
        emotions: [selectedEmotion],
        content: notes || `Me siento ${selectedEmotion} con intensidad ${intensity}/10`,
      }, user).catch(() => {});
    }
    
    addPoints(15);
    toast({
      title: 'Entrada guardada',
      description: 'Has ganado 15 puntos por tu registro emocional.',
    });
    setNotes('');
    setSelectedEmotion(null);
    setIntensity(5);
    setIsSaving(false);
  };

  const handleDelete = async (entryId: string) => {
    const updatedEntries = entries.filter(e => e.id !== entryId);
    localStorage.setItem(STORAGE_ENTRIES_KEY, JSON.stringify(updatedEntries));
    setEntries(updatedEntries);
    
    if (user?.email) {
      try {
        await authDelete(`/api/diary?id=${entryId}&email=${encodeURIComponent(user.email)}`, user);
      } catch (error) {
        console.error('Error deleting entry:', error);
      }
    }
    
    toast({
      title: 'Entrada eliminada',
      description: 'La entrada ha sido eliminada.',
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEmotionIcon = (emotionId: string) => {
    const emotion = emotions.find(e => e.id === emotionId);
    return emotion?.icon || Meh;
  };

  const canAccessAdvanced = user?.isPremium;

  return (
    <section id="diario" className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-2">
            <Heart className="h-3 w-3 mr-1" />
            Autoconocimiento
          </Badge>
          <h2 className="text-3xl font-bold mb-2">Diario Emocional</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Registrar tus emociones te ayuda a entender patrones y mejorar tu bienestar emocional.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
          {/* Entry Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Registro de Hoy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Emotion Selection */}
              <div>
                <label className="text-sm font-medium mb-3 block">¿Cómo te sientes hoy?</label>
                <div className="grid grid-cols-4 gap-2">
                  {emotions.map((emotion) => (
                    <Button
                      key={emotion.id}
                      variant={selectedEmotion === emotion.id ? 'default' : 'outline'}
                      className={`flex flex-col py-3 h-auto ${selectedEmotion === emotion.id ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => setSelectedEmotion(emotion.id)}
                    >
                      <emotion.icon className={`h-6 w-6 mb-1 ${selectedEmotion !== emotion.id ? emotion.color : ''}`} />
                      <span className="text-xs">{emotion.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Intensity Slider */}
              <div>
                <label className="text-sm font-medium mb-3 block">
                  Intensidad: {intensity}/10
                </label>
                <Slider
                  value={[intensity]}
                  onValueChange={(value) => setIntensity(value[0])}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Leve</span>
                  <span>Intenso</span>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm font-medium mb-2 block">Notas personales (opcional)</label>
                <Textarea
                  placeholder="¿Qué ha pasado hoy? ¿Cómo te sientes?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <Button onClick={handleSave} disabled={isSaving} className="w-full">
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                {isSaving ? 'Guardando...' : 'Guardar Entrada'}
              </Button>
            </CardContent>
          </Card>

          {/* History */}
          <Card className="relative">
            {!canAccessAdvanced && entries.length > 3 && (
              <div className="absolute inset-0 bg-background/90 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                <div className="text-center p-4">
                  <Crown className="h-10 w-10 text-amber-500 mx-auto mb-3" />
                  <p className="font-medium mb-2">Función Premium</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Desbloquea el historial completo, análisis de patrones y gráficos de evolución.
                  </p>
                  <Button asChild>
                    <a href="#precios">Actualizar a Premium</a>
                  </Button>
                </div>
              </div>
            )}
            
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Tu Evolución
              </CardTitle>
            </CardHeader>
            <CardContent>
              {entries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Aún no tienes entradas</p>
                  <p className="text-sm">Comienza a registrar tus emociones</p>
                </div>
              ) : (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {entries.slice(0, canAccessAdvanced ? 50 : 3).map((entry) => {
                      const EmotionIcon = getEmotionIcon(entry.emotions[0] || 'neutral');
                      return (
                        <div 
                          key={entry.id} 
                          className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg group"
                        >
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <EmotionIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                {formatDate(entry.createdAt)}
                              </span>
                              <span className="text-xs font-medium">
                                {entry.mood}/10
                              </span>
                            </div>
                            <p className="text-sm mt-1 line-clamp-2">{entry.content}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDelete(entry.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
