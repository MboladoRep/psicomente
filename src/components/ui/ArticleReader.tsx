'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Volume2,
  Play,
  Pause,
  Square,
  Loader2,
  SkipBack,
  SkipForward,
  AlertCircle,
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
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [needsConfig, setNeedsConfig] = useState(false);

  const [chunks, setChunks] = useState<string[]>([]);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const audioUrlsRef = useRef<Map<number, string>>(new Map());

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isInitializedRef = useRef(false);

  const cleanText = text
    .replace(/[#*_`]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\n+/g, ' ')
    .trim();

  useEffect(() => {
    if (cleanText && !isInitializedRef.current) {
      initializeChunks();
      isInitializedRef.current = true;
    }
  }, [cleanText]);

  const initializeChunks = async () => {
    if (!cleanText) return;

    try {
      setError(null);
      const response = await fetch('/api/tts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText }),
      });

      if (!response.ok) throw new Error('Error al procesar el texto');

      const data = await response.json();
      
      if (data.chunks && data.chunks.length > 0) {
        setChunks(data.chunks);
      } else {
        setError('No hay contenido para reproducir');
      }
    } catch (err) {
      console.error('Error initializing chunks:', err);
      setError('Error al inicializar el audio');
    }
  };

  const generateAudioForChunk = async (index: number): Promise<string | null> => {
    if (!chunks[index]) return null;

    if (audioUrlsRef.current.has(index)) {
      return audioUrlsRef.current.get(index)!;
    }

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: chunks[index],
          languageCode: 'es-ES',
          voiceName: 'es-ES-Standard-A',
          speakingRate: speechRate,
        }),
      });

      // Check content type to determine how to parse response
      const contentType = response.headers.get('Content-Type') || '';
      
      if (contentType.includes('application/json')) {
        // Error or JSON response
        const data = await response.json();
        
        if (data.needsConfig) {
          setNeedsConfig(true);
          throw new Error('Servicio de audio no configurado');
        }
        
        throw new Error(data.error || 'Error al generar audio');
      }

      if (!response.ok) {
        throw new Error('Error al generar audio');
      }

      // Audio response (MP3)
      const audioBlob = await response.blob();
      
      if (audioBlob.size === 0) throw new Error('Respuesta de audio vacía');

      const audioUrl = URL.createObjectURL(audioBlob);
      audioUrlsRef.current.set(index, audioUrl);

      return audioUrl;
    } catch (err) {
      console.error('Error generating audio:', err);
      return null;
    }
  };

  const playChunk = useCallback(async (index: number) => {
    if (index >= chunks.length) {
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(100);
      setCurrentChunkIndex(0);
      toast({ title: '✅ Finalizado', description: 'Has escuchado todo el artículo' });
      return;
    }

    setIsLoading(true);
    setError(null);

    const audioUrl = await generateAudioForChunk(index);

    if (!audioUrl) {
      setError(needsConfig 
        ? 'Servicio de audio en mantenimiento. Próximamente disponible.' 
        : 'No se pudo generar el audio. Inténtalo de nuevo.');
      setIsLoading(false);
      setIsPlaying(false);
      toast({ 
        title: 'Error', 
        description: needsConfig ? 'Servicio no disponible' : 'No se pudo generar el audio', 
        variant: 'destructive' 
      });
      return;
    }

    setIsLoading(false);
    setCurrentChunkIndex(index);

    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.load();
      
      try {
        await audioRef.current.play();
      } catch (playError) {
        console.error('Error playing audio:', playError);
        setError('Error al reproducir. Haz clic en play de nuevo.');
        setIsPlaying(false);
      }
    }
  }, [chunks, speechRate, toast, needsConfig]);

  const handlePlayPause = async () => {
    setError(null);

    if (needsConfig) {
      toast({
        title: '⚠️ Servicio no disponible',
        description: 'El servicio de audio necesita configuración.',
        variant: 'destructive',
      });
      return;
    }

    if (chunks.length === 0) {
      await initializeChunks();
      if (chunks.length === 0) {
        setError('No hay contenido para reproducir');
        return;
      }
    }

    if (!isPlaying) {
      setIsPlaying(true);
      setIsPaused(false);
      toast({ title: '🔊 Reproduciendo artículo', description: title || 'Escuchando el contenido' });
      playChunk(currentChunkIndex);
    } else if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play();
        setIsPaused(false);
      } else {
        audioRef.current.pause();
        setIsPaused(true);
      }
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = '';
    }
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
    setCurrentChunkIndex(0);
  };

  const handlePrevious = () => {
    if (currentChunkIndex > 0 && !isLoading) {
      if (audioRef.current) audioRef.current.pause();
      playChunk(currentChunkIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentChunkIndex < chunks.length - 1 && !isLoading) {
      if (audioRef.current) audioRef.current.pause();
      playChunk(currentChunkIndex + 1);
    }
  };

  const handleRateChange = async (rate: number) => {
    const wasPlaying = isPlaying && !isPaused;
    
    if (audioRef.current) audioRef.current.pause();
    
    setSpeechRate(rate);
    setIsPlaying(false);
    setIsPaused(false);

    audioUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    audioUrlsRef.current.clear();

    toast({
      title: 'Velocidad cambiada',
      description: `Nueva velocidad: ${rate}x`,
    });

    if (wasPlaying) {
      setIsPlaying(true);
      playChunk(currentChunkIndex);
    }
  };

  const onTimeUpdate = useCallback(() => {
    if (audioRef.current && audioRef.current.duration) {
      const chunkProgress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      const overallProgress = ((currentChunkIndex + chunkProgress / 100) / chunks.length) * 100;
      setProgress(Math.min(overallProgress, 100));
    }
  }, [currentChunkIndex, chunks.length]);

  const onChunkEnded = useCallback(() => {
    if (currentChunkIndex < chunks.length - 1) {
      playChunk(currentChunkIndex + 1);
    } else {
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(100);
      setCurrentChunkIndex(0);
      toast({ title: '✅ Finalizado', description: 'Has escuchado todo el artículo' });
    }
  }, [currentChunkIndex, chunks.length, playChunk, toast]);

  const onAudioError = useCallback(() => {
    setError('Error al reproducir el audio');
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      audioUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  return (
    <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4 space-y-4 border border-primary/20">
      <audio ref={audioRef} onTimeUpdate={onTimeUpdate} onEnded={onChunkEnded} onError={onAudioError} preload="auto" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Volume2 className="h-5 w-5 text-primary" />
          <span className="font-medium text-sm">Escuchar artículo</span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" disabled={isLoading}>{speechRate}x</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Velocidad</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleRateChange(0.5)}>0.5x - Muy lento</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRateChange(0.75)}>0.75x - Lento</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRateChange(1.0)}>1x - Normal</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRateChange(1.25)}>1.25x - Rápido</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRateChange(1.5)}>1.5x - Muy rápido</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg text-destructive text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {needsConfig && (
        <div className="flex items-center gap-2 p-3 bg-yellow-500/10 rounded-lg text-yellow-600 dark:text-yellow-400 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Servicio de audio en mantenimiento. Próximamente disponible.</span>
        </div>
      )}

      {(isPlaying || progress > 0) && chunks.length > 0 && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Parte {currentChunkIndex + 1} de {chunks.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-2">
        <Button variant="outline" size="icon" onClick={handlePrevious} disabled={currentChunkIndex === 0 || isLoading} className="h-10 w-10">
          <SkipBack className="h-4 w-4" />
        </Button>

        <Button variant="outline" size="icon" onClick={handleStop} disabled={!isPlaying && progress === 0} className="h-10 w-10">
          <Square className="h-4 w-4" />
        </Button>

        <Button size="icon" onClick={handlePlayPause} disabled={isLoading} className="h-12 w-12 rounded-full">
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : isPlaying && !isPaused ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
        </Button>

        <Button variant="outline" size="icon" onClick={handleNext} disabled={currentChunkIndex >= chunks.length - 1 || isLoading} className="h-10 w-10">
          <SkipForward className="h-4 w-4" />
        </Button>
      </div>

      {!isPlaying && progress === 0 && !error && !needsConfig && (
        <p className="text-xs text-muted-foreground text-center">
          🔊 Presiona play para escuchar este artículo mientras haces otras cosas
        </p>
      )}

      {isLoading && (
        <p className="text-xs text-primary text-center animate-pulse">
          🎵 Generando audio...
        </p>
      )}

      {isPaused && (
        <p className="text-xs text-muted-foreground text-center">
          ⏸️ Pausado - Presiona play para continuar
        </p>
      )}

      <p className="text-xs text-muted-foreground/60 text-center">
        Funciona con la pantalla bloqueada • Audio generado con IA
      </p>
    </div>
  );
}
