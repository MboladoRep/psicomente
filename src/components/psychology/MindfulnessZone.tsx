'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { 
  Wind, 
  Flower2, 
  Moon, 
  Waves,
  Play,
  Pause,
  RotateCcw,
  Crown,
  Lock,
  Volume2,
  VolumeX,
  CloudRain,
  Trees,
  Flame
} from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { useToast } from '@/hooks/use-toast';

// Generador de ruido usando Web Audio API
class AmbientSoundGenerator {
  private audioContext: AudioContext | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;

  async init() {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  // Generar ruido blanco
  private createNoiseBuffer(): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not initialized');
    
    const bufferSize = this.audioContext.sampleRate * 2;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    return buffer;
  }

  // Sonido de olas del océano
  startOceanWaves(volume: number = 0.5) {
    this.stop();
    this.init();

    if (!this.audioContext) return;

    // Crear ruido rosa filtrado para simular olas
    this.noiseNode = this.audioContext.createBufferSource();
    this.noiseNode.buffer = this.createNoiseBuffer();
    this.noiseNode.loop = true;

    // Filtro paso bajo para suavizar
    this.filterNode = this.audioContext.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    this.filterNode.frequency.value = 500;

    // Segundo filtro para más suavidad
    const filter2 = this.audioContext.createBiquadFilter();
    filter2.type = 'lowpass';
    filter2.frequency.value = 800;

    // Control de volumen
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = volume * 0.3;

    // Conectar nodos
    this.noiseNode.connect(this.filterNode);
    this.filterNode.connect(filter2);
    filter2.connect(this.gainNode);
    this.gainNode.connect(this.audioContext.destination);

    // Modulación para simular olas
    this.modulateVolume();

    this.noiseNode.start();
  }

  // Sonido de lluvia
  startRain(volume: number = 0.5) {
    this.stop();
    this.init();

    if (!this.audioContext) return;

    this.noiseNode = this.audioContext.createBufferSource();
    this.noiseNode.buffer = this.createNoiseBuffer();
    this.noiseNode.loop = true;

    // Filtro para lluvia
    this.filterNode = this.audioContext.createBiquadFilter();
    this.filterNode.type = 'highpass';
    this.filterNode.frequency.value = 1000;

    const filter2 = this.audioContext.createBiquadFilter();
    filter2.type = 'lowpass';
    filter2.frequency.value = 8000;

    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = volume * 0.25;

    this.noiseNode.connect(this.filterNode);
    this.filterNode.connect(filter2);
    filter2.connect(this.gainNode);
    this.gainNode.connect(this.audioContext.destination);

    this.noiseNode.start();
  }

  // Sonido de bosque (viento entre árboles)
  startForest(volume: number = 0.5) {
    this.stop();
    this.init();

    if (!this.audioContext) return;

    this.noiseNode = this.audioContext.createBufferSource();
    this.noiseNode.buffer = this.createNoiseBuffer();
    this.noiseNode.loop = true;

    // Filtro para viento suave
    this.filterNode = this.audioContext.createBiquadFilter();
    this.filterNode.type = 'bandpass';
    this.filterNode.frequency.value = 600;
    this.filterNode.Q.value = 0.5;

    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = volume * 0.2;

    this.noiseNode.connect(this.filterNode);
    this.filterNode.connect(this.gainNode);
    this.gainNode.connect(this.audioContext.destination);

    // Modulación suave
    this.modulateVolume(0.1, 0.05);

    this.noiseNode.start();
  }

  // Sonido de fuego/chimenea
  startFire(volume: number = 0.5) {
    this.stop();
    this.init();

    if (!this.audioContext) return;

    this.noiseNode = this.audioContext.createBufferSource();
    this.noiseNode.buffer = this.createNoiseBuffer();
    this.noiseNode.loop = true;

    // Filtro para crepitar
    this.filterNode = this.audioContext.createBiquadFilter();
    this.filterNode.type = 'bandpass';
    this.filterNode.frequency.value = 300;
    this.filterNode.Q.value = 2;

    const filter2 = this.audioContext.createBiquadFilter();
    filter2.type = 'lowpass';
    filter2.frequency.value = 1500;

    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = volume * 0.3;

    this.noiseNode.connect(this.filterNode);
    this.filterNode.connect(filter2);
    filter2.connect(this.gainNode);
    this.gainNode.connect(this.audioContext.destination);

    // Crepitar rápido
    this.modulateVolume(0.15, 0.1);

    this.noiseNode.start();
  }

  // Modulación del volumen para efectos naturales
  private modulateVolume(intensity: number = 0.15, speed: number = 0.08) {
    if (!this.gainNode || !this.audioContext) return;

    const modulate = () => {
      if (!this.gainNode || !this.audioContext) return;
      
      const time = this.audioContext.currentTime;
      const baseGain = this.gainNode.gain.value;
      const modulation = Math.sin(time * speed) * intensity;
      
      this.gainNode.gain.setTargetAtTime(
        baseGain + modulation,
        this.audioContext.currentTime,
        0.1
      );

      if (this.noiseNode) {
        requestAnimationFrame(modulate);
      }
    };

    modulate();
  }

  setVolume(volume: number) {
    if (this.gainNode) {
      this.gainNode.gain.value = volume * 0.3;
    }
  }

  stop() {
    if (this.noiseNode) {
      try {
        this.noiseNode.stop();
      } catch {
        // ignore
      }
      this.noiseNode.disconnect();
      this.noiseNode = null;
    }
    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }
    if (this.filterNode) {
      this.filterNode.disconnect();
      this.filterNode = null;
    }
  }
}

const exercises = [
  {
    id: 'breathing-478',
    title: 'Respiración 4-7-8',
    description: 'Técnica de relajación profunda',
    duration: 5,
    type: 'breathing',
    icon: Wind,
    isPremium: false,
    soundType: null,
    instructions: [
      'Inhala por la nariz contando hasta 4',
      'Mantén el aire contando hasta 7',
      'Exhala lentamente por la boca contando hasta 8',
      'Repite el ciclo 3-4 veces'
    ],
  },
  {
    id: 'body-scan',
    title: 'Escaneo Corporal',
    description: 'Relajación muscular progresiva',
    duration: 10,
    type: 'body-scan',
    icon: Flower2,
    isPremium: false,
    soundType: null,
    instructions: [
      'Acuéstate cómodamente y cierra los ojos',
      'Lleva tu atención a los pies',
      'Siente cada parte de tu cuerpo',
      'Libera la tensión al exhalar'
    ],
  },
  {
    id: 'ocean-waves',
    title: 'Sonidos del Océano',
    description: 'Relajación con olas del mar',
    duration: 10,
    type: 'meditation',
    icon: Waves,
    isPremium: false,
    soundType: 'ocean',
    instructions: [
      'Cierra los ojos y respira profundamente',
      'Imagina que estás en una playa tranquila',
      'Escucha el ritmo de las olas',
      'Deja que el sonido te relaje'
    ],
  },
  {
    id: 'rain-sounds',
    title: 'Sonidos de Lluvia',
    description: 'Lluvia relajante para dormir',
    duration: 15,
    type: 'meditation',
    icon: CloudRain,
    isPremium: true,
    soundType: 'rain',
    instructions: [
      'Encuentra una posición cómoda',
      'Escucha la lluvia cayendo suavemente',
      'Deja que los pensamientos fluyan',
      'Relájate con cada gota'
    ],
  },
  {
    id: 'forest-sounds',
    title: 'Bosque Tranquilo',
    description: 'Viento entre los árboles',
    duration: 15,
    type: 'meditation',
    icon: Trees,
    isPremium: true,
    soundType: 'forest',
    instructions: [
      'Imagina un bosque frondoso',
      'Siente la brisa fresca en tu rostro',
      'Escucha el viento entre las hojas',
      'Respira el aire puro de la naturaleza'
    ],
  },
  {
    id: 'fireplace',
    title: 'Fogata Acogedora',
    description: 'Sonido de chimenea crepitante',
    duration: 20,
    type: 'meditation',
    icon: Flame,
    isPremium: true,
    soundType: 'fire',
    instructions: [
      'Imagina una cálida fogata frente a ti',
      'Escucha el crepitar de la madera',
      'Siente el calor reconfortante',
      'Déjate envolver por la calma'
    ],
  },
  {
    id: 'visualization',
    title: 'Visualización Guiada',
    description: 'Imagina un lugar tranquilo',
    duration: 15,
    type: 'visualization',
    icon: Moon,
    isPremium: true,
    soundType: 'forest',
    instructions: [
      'Cierra los ojos y respira profundo',
      'Visualiza tu lugar seguro perfecto',
      'Siente todos los detalles',
      'Disfruta de esta paz interior'
    ],
  },
];

export default function MindfulnessZone() {
  const { user, addPoints } = useUser();
  const { toast } = useToast();
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const addPointsRef = useRef(addPoints);
  const toastRef = useRef(toast);
  const soundGeneratorRef = useRef<AmbientSoundGenerator | null>(null);

  // Keep refs updated
  useEffect(() => {
    addPointsRef.current = addPoints;
    toastRef.current = toast;
  }, [addPoints, toast]);

  // Initialize sound generator
  useEffect(() => {
    soundGeneratorRef.current = new AmbientSoundGenerator();
    return () => {
      soundGeneratorRef.current?.stop();
    };
  }, []);

  const isPremium = user?.isPremium;
  const currentExercise = exercises.find(e => e.id === activeExercise);

  // Play/stop ambient sound
  const playAmbientSound = useCallback((soundType: string | null) => {
    if (!soundType || !soundGeneratorRef.current) return;

    const vol = isMuted ? 0 : volume / 100;

    switch (soundType) {
      case 'ocean':
        soundGeneratorRef.current.startOceanWaves(vol);
        break;
      case 'rain':
        soundGeneratorRef.current.startRain(vol);
        break;
      case 'forest':
        soundGeneratorRef.current.startForest(vol);
        break;
      case 'fire':
        soundGeneratorRef.current.startFire(vol);
        break;
    }
  }, [volume, isMuted]);

  // Timer logic
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsActive(false);
            soundGeneratorRef.current?.stop();
            addPointsRef.current(20);
            toastRef.current({
              title: 'Ejercicio completado 🧘',
              description: 'Has ganado 20 puntos por tu práctica de mindfulness.',
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive]);

  // Breathing animation cycle
  useEffect(() => {
    if (isActive && currentExercise?.id === 'breathing-478') {
      const phases = [
        { phase: 'inhale', duration: 4000 },
        { phase: 'hold', duration: 7000 },
        { phase: 'exhale', duration: 8000 },
      ];
      let currentPhase = 0;
      
      const breathInterval = setInterval(() => {
        currentPhase = (currentPhase + 1) % 3;
        setBreathPhase(phases[currentPhase].phase as 'inhale' | 'hold' | 'exhale');
      }, phases[currentPhase].duration);

      return () => clearInterval(breathInterval);
    }
  }, [isActive, currentExercise]);

  // Update volume
  useEffect(() => {
    if (isActive && currentExercise?.soundType && soundGeneratorRef.current) {
      soundGeneratorRef.current.setVolume(isMuted ? 0 : volume / 100);
    }
  }, [volume, isMuted, isActive, currentExercise]);

  const startExercise = (exerciseId: string) => {
    const exercise = exercises.find(e => e.id === exerciseId);
    if (exercise?.isPremium && !isPremium) {
      toast({
        title: 'Ejercicio Premium',
        description: 'Actualiza a Premium para acceder a este ejercicio.',
        variant: 'destructive',
      });
      return;
    }
    
    // Stop any previous sound
    soundGeneratorRef.current?.stop();
    
    setActiveExercise(exerciseId);
    setTimeLeft(exercise!.duration * 60);
    setIsActive(false);
    setBreathPhase('inhale');
  };

  const toggleTimer = () => {
    const newIsActive = !isActive;
    setIsActive(newIsActive);
    
    if (newIsActive && currentExercise?.soundType) {
      playAmbientSound(currentExercise.soundType);
    } else if (!newIsActive) {
      soundGeneratorRef.current?.stop();
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    soundGeneratorRef.current?.stop();
    if (currentExercise) {
      setTimeLeft(currentExercise.duration * 60);
    }
    setBreathPhase('inhale');
  };

  const closeExercise = () => {
    setIsActive(false);
    soundGeneratorRef.current?.stop();
    setActiveExercise(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <section id="mindfulness" className="py-16 bg-gradient-to-b from-background to-purple-500/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-2">
            <Flower2 className="h-3 w-3 mr-1" />
            Relajación
          </Badge>
          <h2 className="text-3xl font-bold mb-2">Zona Mindfulness</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Técnicas de respiración, meditación y sonidos relajantes para reducir el estrés.
          </p>
        </div>

        {/* Exercise Selection or Active Exercise */}
        {!activeExercise ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-6xl mx-auto">
            {exercises.map((exercise) => {
              const canAccess = !exercise.isPremium || isPremium;
              return (
                <Card 
                  key={exercise.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${!canAccess ? 'relative overflow-hidden' : ''}`}
                  onClick={() => canAccess && startExercise(exercise.id)}
                >
                  {!canAccess && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
                      <div className="text-center">
                        <Lock className="h-6 w-6 text-muted-foreground mx-auto mb-1" />
                        <span className="text-xs text-muted-foreground">Premium</span>
                      </div>
                    </div>
                  )}
                  <CardHeader className="text-center">
                    <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-3">
                      <exercise.icon className="h-7 w-7 text-purple-600" />
                    </div>
                    <CardTitle className="text-lg">{exercise.title}</CardTitle>
                    <CardDescription>{exercise.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <Badge variant="secondary">
                        {exercise.duration} min
                      </Badge>
                      {exercise.soundType && (
                        <Badge variant="outline" className="text-purple-600">
                          <Volume2 className="h-3 w-3 mr-1" />
                          Audio
                        </Badge>
                      )}
                    </div>
                    <Button size="sm" className="w-full" disabled={!canAccess}>
                      {exercise.isPremium && !isPremium ? (
                        <>
                          <Crown className="h-4 w-4 mr-2" />
                          Premium
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Comenzar
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                {currentExercise && <currentExercise.icon className="h-5 w-5 text-purple-600" />}
                {currentExercise?.title}
              </CardTitle>
              <CardDescription>{currentExercise?.description}</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              {/* Timer Display */}
              <div className="relative w-48 h-48 mx-auto">
                <div 
                  className={`absolute inset-0 rounded-full border-4 transition-all duration-1000 ${
                    breathPhase === 'inhale' ? 'border-purple-500 scale-110' :
                    breathPhase === 'hold' ? 'border-pink-500 scale-105' :
                    'border-muted scale-100'
                  }`}
                />
                <div className="absolute inset-4 rounded-full bg-muted flex items-center justify-center">
                  <div>
                    <div className="text-3xl font-bold">{formatTime(timeLeft)}</div>
                    {currentExercise?.id === 'breathing-478' && isActive && (
                      <div className="text-sm text-muted-foreground capitalize">
                        {breathPhase === 'inhale' ? 'Inhala...' :
                         breathPhase === 'hold' ? 'Mantén...' : 'Exhala...'}
                      </div>
                    )}
                    {currentExercise?.soundType && isActive && (
                      <div className="text-sm text-purple-600 flex items-center justify-center gap-1">
                        <Volume2 className="h-3 w-3" />
                        Sonido activo
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress */}
              {currentExercise && (
                <Progress 
                  value={((currentExercise.duration * 60 - timeLeft) / (currentExercise.duration * 60)) * 100} 
                  className="h-2"
                />
              )}

              {/* Volume Control for sound exercises */}
              {currentExercise?.soundType && (
                <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Volumen</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsMuted(!isMuted)}
                    >
                      {isMuted ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <Slider
                    value={[volume]}
                    onValueChange={(value) => setVolume(value[0])}
                    max={100}
                    step={1}
                    disabled={isMuted}
                  />
                </div>
              )}

              {/* Instructions */}
              {currentExercise?.instructions && currentExercise.instructions.length > 0 && (
                <div className="text-left space-y-2 p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium">Instrucciones:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {currentExercise.instructions.map((instruction, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-purple-600">{i + 1}.</span>
                        {instruction}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Controls */}
              <div className="flex justify-center gap-4">
                <Button variant="outline" size="icon" onClick={resetTimer}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button size="lg" onClick={toggleTimer} className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600">
                  {isActive ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
                <Button variant="outline" size="icon" onClick={closeExercise}>
                  ✕
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
