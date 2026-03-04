'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Flame, 
  Target, 
  Zap,
  Award,
  CheckCircle2,
  MessageCircle,
  BookHeart,
  Sparkles
} from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { LEVEL_THRESHOLDS } from '@/types';

const achievements = [
  { id: 'first-chat', name: 'Primera Consulta', description: 'Realiza tu primera consulta', icon: MessageCircle, points: 20, unlocked: true },
  { id: 'week-streak', name: 'Racha Semanal', description: 'Usa la app 7 días seguidos', icon: Flame, points: 50, unlocked: false },
  { id: 'diary-5', name: 'Diario Emocional', description: 'Registra 5 entradas', icon: BookHeart, points: 30, unlocked: false },
  { id: 'test-complete', name: 'Autoconocimiento', description: 'Completa tu primer test', icon: Target, points: 25, unlocked: true },
  { id: 'mindfulness-10', name: 'Zen Master', description: '10 sesiones de mindfulness', icon: Sparkles, points: 40, unlocked: false },
  { id: 'points-500', name: 'Acumulador', description: 'Alcanza 500 puntos', icon: Zap, points: 100, unlocked: false },
];

const dailyChallenges = [
  { id: '1', title: 'Registro emocional', description: 'Registra cómo te sientes hoy', points: 15, type: 'diary', completed: false },
  { id: '2', title: '5 min de respiración', description: 'Completa una sesión de respiración', points: 20, type: 'meditation', completed: false },
  { id: '3', title: 'Lee un artículo', description: 'Lee un artículo de bienestar', points: 10, type: 'reading', completed: true },
];

export default function GamificationPanel() {
  const { progress } = useUser();

  const currentLevel = LEVEL_THRESHOLDS.find(l => l.level === progress.level) || LEVEL_THRESHOLDS[0];
  const nextLevel = LEVEL_THRESHOLDS.find(l => l.level === progress.level + 1);
  
  const progressPercent = nextLevel 
    ? ((progress.points - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100
    : 100;

  return (
    <section id="gamificacion" className="py-16 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-2">
            <Trophy className="h-3 w-3 mr-1" />
            Gamificación
          </Badge>
          <h2 className="text-3xl font-bold mb-2">Tu Progreso</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Gana puntos, desbloquea logros y avanza en tu camino de bienestar personal.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Level & Points Card */}
          <Card className="lg:col-span-1">
            <CardHeader className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-accent animate-pulse-soft" />
                <div className="absolute inset-2 rounded-full bg-background flex items-center justify-center">
                  <div className="text-center">
                    <Trophy className="h-8 w-8 text-primary mx-auto" />
                    <span className="text-2xl font-bold">{progress.level}</span>
                  </div>
                </div>
              </div>
              <CardTitle>{currentLevel.name}</CardTitle>
              <p className="text-muted-foreground text-sm">
                {progress.points} puntos totales
              </p>
            </CardHeader>
            <CardContent>
              {nextLevel && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progreso a {nextLevel.name}</span>
                    <span>{Math.round(progressPercent)}%</span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                  <p className="text-xs text-muted-foreground text-center">
                    {nextLevel.minPoints - progress.points} puntos para el siguiente nivel
                  </p>
                </div>
              )}
              
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t">
                <div className="text-center">
                  <Flame className="h-5 w-5 text-orange-500 mx-auto mb-1" />
                  <div className="text-xl font-bold">{progress.streak}</div>
                  <div className="text-xs text-muted-foreground">Racha</div>
                </div>
                <div className="text-center">
                  <Target className="h-5 w-5 text-green-500 mx-auto mb-1" />
                  <div className="text-xl font-bold">{progress.totalActivities}</div>
                  <div className="text-xs text-muted-foreground">Actividades</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Challenges */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Retos Diarios
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {dailyChallenges.map((challenge) => (
                <div
                  key={challenge.id}
                  className={`p-3 rounded-lg border ${challenge.completed ? 'bg-primary/5 border-primary/20' : 'bg-muted/50'}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm flex items-center gap-2">
                        {challenge.title}
                        {challenge.completed && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                      </p>
                      <p className="text-xs text-muted-foreground">{challenge.description}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      +{challenge.points}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Logros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      achievement.unlocked 
                        ? 'bg-primary/10 border-primary/20' 
                        : 'bg-muted/30 opacity-50'
                    }`}
                    title={achievement.description}
                  >
                    <achievement.icon className={`h-6 w-6 mx-auto mb-1 ${achievement.unlocked ? 'text-primary' : 'text-muted-foreground'}`} />
                    <p className="text-xs font-medium truncate">{achievement.name}</p>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4" size="sm">
                Ver todos los logros
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
