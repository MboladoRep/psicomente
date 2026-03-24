'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Square,
  Loader2,
  SkipBack,
  SkipForward,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface ArticleReaderProps {
  text: string;
  title?: string;
}

export function ArticleReader({ text, title }: ArticleReaderProps) {
  const { toast } = useToast();
  const [speechRate, setSpeechRate] = useState(1.0);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Chunks state
  const [chunks, setChunks] = useState<string[]>([]);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [audioUrls, setAudioUrls] = useState<Map<number, string>>(new Map());

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Clean text for TTS
  const cleanText = text
    .replace(/[#*_`]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\n+/g, ' ')
    .trim();

  // Initialize chunks on mount
  useEffect(() => {
    initializeChunks();
  }, [cleanText]);

  // Initialize chunks from API
  const initializeChunks = async () => {
    if (!cleanText) return;

    try {
      const response = await fetch('/api/tts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText }),
      });

      if (response.ok) {
        const data = await response.json();
        setChunks(data.chunks || []);
      }
    } catch (error) {
      console.error('Error initializing chunks:', error);
    }
  };

  // Generate audio for a specific chunk
  const generateAudioForChunk = async (index: number): Promise<string | null> => {
    if (!chunks[index]) return null;

    // Check if we already have this audio
    if (audioUrls.has(index)) {
      return audioUrls.get(index)!;
    }

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: chunks[index],
          voice: 'tongtong',
          speed: speechRate,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate audio');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Store the URL
      setAudioUrls((prev) => new Map(prev).set(index, audioUrl));

      return audioUrl;
    } catch (error) {
      console.error('Error generating audio:', error);
      return null;
    }
  };

  // Play a specific chunk
  const playChunk = async (index: number) => {
    if (index >= chunks.length) {
      // Finished all chunks
      setIsPlaying(false);
      setProgress(100);
      setCurrentChunkIndex(0);
      return;
    }

    setIsLoading(true);

    const audioUrl = await generateAudioForChunk(index);

    if (!audioUrl) {
      toast({
        title: 'Error',
        description: 'No se pudo generar el audio',
        variant: 'destructive',
      });
      setIsLoading(false);
      setIsPlaying(false);
      return;
    }

    setIsLoading(false);
    setCurrentChunkIndex(index);

    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.load();
      try {
        await audioRef.current.play();
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    }
  };

  // Handle play/pause
  const handlePlayPause = async () => {
    if (chunks.length === 0) {
      // Initialize chunks first
      await initializeChunks();
      if (chunks.length === 0) {
        toast({
          title: 'Error',
          description: 'No hay contenido para reproducir',
          variant: 'destructive',
        });
        return;
      }
    }

    if (!isPlaying) {
      setIsPlaying(true);
      toast({
        title: '🔊 Reproduciendo artículo',
        description: title || 'Escuchando el contenido',
      });
      playChunk(currentChunkIndex);
    } else if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  };

  // Handle stop
  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setProgress(0);
    setCurrentChunkIndex(0);
    setCurrentTime(0);
  };

  // Handle previous chunk
  const handlePrevious = () => {
    if (currentChunkIndex > 0) {
      playChunk(currentChunkIndex - 1);
    }
  };

  // Handle next chunk
  const handleNext = () => {
    if (currentChunkIndex < chunks.length - 1) {
      playChunk(currentChunkIndex + 1);
    }
  };

  // Handle speed change
  const handleRateChange = async (rate: number) => {
    setSpeechRate(rate);

    // Clear cached audio URLs since speed changed
    audioUrls.forEach((url) => URL.revokeObjectURL(url));
    setAudioUrls(new Map());

    if (isPlaying) {
      // Restart from current chunk with new speed
      playChunk(currentChunkIndex);
    }
  };

  // Audio event handlers
  const onTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);

      // Calculate overall progress
      const chunkProgress = audioRef.current.duration
        ? (audioRef.current.currentTime / audioRef.current.duration) * 100
        : 0;
      const overallProgress =
        ((currentChunkIndex + chunkProgress / 100) / chunks.length) * 100;
      setProgress(overallProgress);
    }
  }, [currentChunkIndex, chunks.length]);

  const onChunkEnded = useCallback(() => {
    // Play next chunk
    if (currentChunkIndex < chunks.length - 1) {
      playChunk(currentChunkIndex + 1);
    } else {
      // Finished
      setIsPlaying(false);
      setProgress(100);
      setCurrentChunkIndex(0);
    }
  }, [currentChunkIndex, chunks.length]);

  const onLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-muted/50 rounded-lg p-4 space-y-4">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        onTimeUpdate={onTimeUpdate}
        onEnded={onChunkEnded}
        onLoadedMetadata={onLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => {}}
      />

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
            <DropdownMenuItem onClick={() => handleRateChange(1.0)}>
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
      {(isPlaying || progress > 0) && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              Parte {currentChunkIndex + 1} de {chunks.length}
            </span>
            <span>{Math.round(progress)}% completado</span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        {/* Previous */}
        <Button
          variant="outline"
          size="icon"
          onClick={handlePrevious}
          disabled={currentChunkIndex === 0 || isLoading}
          className="h-10 w-10"
        >
          <SkipBack className="h-4 w-4" />
        </Button>

        {/* Stop */}
        <Button
          variant="outline"
          size="icon"
          onClick={handleStop}
          disabled={!isPlaying && progress === 0}
          className="h-10 w-10"
        >
          <Square className="h-4 w-4" />
        </Button>

        {/* Play/Pause */}
        <Button
          size="icon"
          onClick={handlePlayPause}
          disabled={isLoading}
          className="h-12 w-12 rounded-full"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : isPlaying ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5 ml-0.5" />
          )}
        </Button>

        {/* Next */}
        <Button
          variant="outline"
          size="icon"
          onClick={handleNext}
          disabled={currentChunkIndex >= chunks.length - 1 || isLoading}
          className="h-10 w-10"
        >
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>

      {/* Tip */}
      {!isPlaying && progress === 0 && (
        <p className="text-xs text-muted-foreground text-center">
          Presiona play para escuchar este artículo (funciona con pantalla bloqueada)
        </p>
      )}

      {/* Loading indicator */}
      {isLoading && (
        <p className="text-xs text-muted-foreground text-center">
          Generando audio...
        </p>
      )}
    </div>
  );
}
