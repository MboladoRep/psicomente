'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { useToast } from '@/hooks/use-toast';

interface ArticleReaderProps {
  text: string;
  title?: string;
}

export function ArticleReader({ text, title }: ArticleReaderProps) {
  const { toast } = useToast();
  const [speechRate, setSpeechRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  
  const {
    isPlaying,
    isPaused,
    isSupported,
    progress,
    currentSentence,
    totalSentences,
    play,
    pause,
    resume,
    stop,
  } = useTextToSpeech({ rate: speechRate });

  // Load voices
  useEffect(() => {
    if (isSupported) {
      // Load voices
      window.speechSynthesis.getVoices();
    }
  }, [isSupported]);

  const handlePlayPause = () => {
    if (!isSupported) {
      toast({
        title: 'No soportado',
        description: 'Tu navegador no soporta síntesis de voz',
        variant: 'destructive',
      });
      return;
    }

    // Clean text for speech
    const cleanText = text
      .replace(/[#*_`]/g, '') // Remove markdown symbols
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Convert links to text
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .trim();

    if (!isPlaying) {
      play(cleanText);
      toast({
        title: '🔊 Reproduciendo artículo',
        description: title || 'Escuchando el contenido del artículo',
      });
    } else if (isPaused) {
      resume();
    } else {
      pause();
    }
  };

  const handleStop = () => {
    stop();
  };

  const handleRateChange = (rate: number) => {
    setSpeechRate(rate);
    if (isPlaying) {
      stop();
      const cleanText = text
        .replace(/[#*_`]/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/\n+/g, ' ')
        .trim();
      play(cleanText);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    // Note: Web Speech API doesn't have mute, we just stop the speech
    if (!isMuted && isPlaying) {
      stop();
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className="bg-muted/50 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Volume2 className="h-5 w-5 text-primary" />
          <span className="font-medium text-sm">Escuchar artículo</span>
        </div>
        
        {/* Speed control */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              {speechRate}x velocidad
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Velocidad de lectura</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleRateChange(0.5)}>
              0.5x - Muy lento
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRateChange(0.75)}>
              0.75x - Lento
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRateChange(1)}>
              1x - Normal
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRateChange(1.25)}>
              1.25x - Rápido
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRateChange(1.5)}>
              1.5x - Muy rápido
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Progress */}
      {isPlaying && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Frase {currentSentence + 1} de {totalSentences}</span>
            <span>{Math.round(progress)}% completado</span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        {/* Stop */}
        <Button
          variant="outline"
          size="icon"
          onClick={handleStop}
          disabled={!isPlaying && !isPaused}
          className="h-10 w-10"
        >
          <Square className="h-4 w-4" />
        </Button>

        {/* Play/Pause */}
        <Button
          size="icon"
          onClick={handlePlayPause}
          className="h-12 w-12 rounded-full"
        >
          {isPlaying && !isPaused ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5 ml-0.5" />
          )}
        </Button>

        {/* Volume/Mute */}
        <Button
          variant="outline"
          size="icon"
          onClick={toggleMute}
          className="h-10 w-10"
        >
          {isMuted ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Tip */}
      {!isPlaying && (
        <p className="text-xs text-muted-foreground text-center">
          Presiona play para escuchar este artículo
        </p>
      )}
    </div>
  );
}
