'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Volume2
} from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { useToast } from '@/hooks/use-toast';

const exercises = [
  {
    id: 'breathing-478',
    title: 'Respiración 4-7-8',
    description: 'Técnica de relajación profunda',
    duration: 5,
    type: 'breathing',
    icon: Wind,
    isPremium: false,
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
    instructions: [
      'Acuéstate cómodamente y cierra los ojos',
      'Lleva tu atención a los pies',
      'Siente cada parte de tu cuerpo',
      'Libera la tensión al exhalar'
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
    instructions: [],
  },
  {
    id: 'ocean-waves',
    title: 'Sonidos del Océano',
    description: 'Relajación con sonidos naturales',
    duration: 20,
    type: 'meditation',
    icon: Waves,
    isPremium: true,
    instructions: [],
  },
];

export default function MindfulnessZone() {
  const { user, addPoints } = useUser();
  const { toast } = useToast();
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const addPointsRef = useRef(addPoints);
  const toastRef = useRef(toast);

  // Keep refs updated
  useEffect(() => {
    addPointsRef.current = addPoints;
    toastRef.current = toast;
  }, [addPoints, toast]);

  const isPremium = user?.isPremium;
  const currentExercise = exercises.find(e => e.id === activeExercise);

  // Timer logic
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsActive(false);
            // Use refs to avoid dependency on these functions
            addPointsRef.current(20);
            toastRef.current({
              title: 'Ejercicio completado',
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
    setActiveExercise(exerciseId);
    setTimeLeft(exercise!.duration * 60);
    setIsActive(false);
    setBreathPhase('inhale');
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    if (currentExercise) {
      setTimeLeft(currentExercise.duration * 60);
    }
    setBreathPhase('inhale');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <section id="mindfulness" className="py-16 bg-gradient-to-b from-background to-primary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-2">
            <Flower2 className="h-3 w-3 mr-1" />
            Relajación
          </Badge>
          <h2 className="text-3xl font-bold mb-2">Zona Mindfulness</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Técnicas de respiración, meditación y relajación para reducir el estrés y mejorar tu bienestar.
          </p>
        </div>

        {/* Exercise Selection or Active Exercise */}
        {!activeExercise ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
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
                    <div className="w-14 h-14 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-3">
                      <exercise.icon className="h-7 w-7 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{exercise.title}</CardTitle>
                    <CardDescription>{exercise.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Badge variant="secondary" className="mb-3">
                      {exercise.duration} min
                    </Badge>
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
                {currentExercise && <currentExercise.icon className="h-5 w-5 text-primary" />}
                {currentExercise?.title}
              </CardTitle>
              <CardDescription>{currentExercise?.description}</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              {/* Timer Display */}
              <div className="relative w-48 h-48 mx-auto">
                <div 
                  className={`absolute inset-0 rounded-full border-4 transition-all duration-1000 ${
                    breathPhase === 'inhale' ? 'border-primary scale-110' :
                    breathPhase === 'hold' ? 'border-accent scale-105' :
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

              {/* Instructions */}
              {currentExercise?.instructions && currentExercise.instructions.length > 0 && (
                <div className="text-left space-y-2 p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium">Instrucciones:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {currentExercise.instructions.map((instruction, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary">{i + 1}.</span>
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
                <Button size="lg" onClick={toggleTimer}>
                  {isActive ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                </Button>
                <Button variant="outline" size="icon" onClick={() => setActiveExercise(null)}>
                  <Volume2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
