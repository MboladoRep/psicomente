'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  ClipboardCheck, 
  Brain, 
  Heart, 
  TrendingUp,
  Sparkles,
  Crown,
  Lock,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { useToast } from '@/hooks/use-toast';

const tests = [
  {
    id: 'ansiedad',
    title: 'Test de Ansiedad',
    description: 'Evalúa tu nivel de ansiedad actual',
    icon: Brain,
    isPremium: false,
    questions: [
      { id: '1', text: 'En las últimas 2 semanas, ¿con qué frecuencia te has sentido nervioso, ansioso o al borde de un ataque de nervios?', options: [
        { value: 0, label: 'Nunca' },
        { value: 1, label: 'Varios días' },
        { value: 2, label: 'Más de la mitad de los días' },
        { value: 3, label: 'Casi todos los días' },
      ]},
      { id: '2', text: '¿Con qué frecuencia has sido incapaz de parar o controlar tu preocupación?', options: [
        { value: 0, label: 'Nunca' },
        { value: 1, label: 'Varios días' },
        { value: 2, label: 'Más de la mitad de los días' },
        { value: 3, label: 'Casi todos los días' },
      ]},
      { id: '3', text: '¿Con qué frecuencia te has sentido tan inquieto que es difícil estar quieto?', options: [
        { value: 0, label: 'Nunca' },
        { value: 1, label: 'Varios días' },
        { value: 2, label: 'Más de la mitad de los días' },
        { value: 3, label: 'Casi todos los días' },
      ]},
    ],
  },
  {
    id: 'estres',
    title: 'Test de Estrés',
    description: 'Mide tu nivel de estrés percibido',
    icon: TrendingUp,
    isPremium: false,
    questions: [
      { id: '1', text: 'En el último mes, ¿con qué frecuencia te has sentido alterado por algo que ocurrió inesperadamente?', options: [
        { value: 0, label: 'Nunca' },
        { value: 1, label: 'Casi nunca' },
        { value: 2, label: 'A veces' },
        { value: 3, label: 'A menudo' },
        { value: 4, label: 'Muy a menudo' },
      ]},
      { id: '2', text: 'En el último mes, ¿con qué frecuencia has sentido que eras incapaz de controlar las cosas importantes de tu vida?', options: [
        { value: 0, label: 'Nunca' },
        { value: 1, label: 'Casi nunca' },
        { value: 2, label: 'A veces' },
        { value: 3, label: 'A menudo' },
        { value: 4, label: 'Muy a menudo' },
      ]},
    ],
  },
  {
    id: 'autoestima',
    title: 'Test de Autoestima',
    description: 'Evalúa cómo te percibes a ti mismo',
    icon: Heart,
    isPremium: true,
    questions: [],
  },
  {
    id: 'bienestar',
    title: 'Test de Bienestar General',
    description: 'Análisis integral de tu salud mental',
    icon: Sparkles,
    isPremium: true,
    questions: [],
  },
];

export default function PsychologicalTests() {
  const { user, addPoints } = useUser();
  const { toast } = useToast();
  const [activeTest, setActiveTest] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [testCompleted, setTestCompleted] = useState(false);
  const [score, setScore] = useState(0);

  const currentTestData = tests.find(t => t.id === activeTest);
  const isPremium = user?.isPremium;

  const startTest = (testId: string) => {
    const test = tests.find(t => t.id === testId);
    if (test?.isPremium && !isPremium) {
      toast({
        title: 'Test Premium',
        description: 'Actualiza a Premium para acceder a este test.',
        variant: 'destructive',
      });
      return;
    }
    setActiveTest(testId);
    setCurrentQuestion(0);
    setAnswers({});
    setTestCompleted(false);
    setScore(0);
  };

  const handleAnswer = (value: number) => {
    const question = currentTestData?.questions[currentQuestion];
    if (question) {
      setAnswers(prev => ({ ...prev, [question.id]: value }));
    }
  };

  const nextQuestion = () => {
    if (currentTestData && currentQuestion < currentTestData.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Calculate score
      const totalScore = Object.values(answers).reduce((sum, val) => sum + val, 0);
      setScore(totalScore);
      setTestCompleted(true);
      addPoints(25);
    }
  };

  const closeTest = () => {
    setActiveTest(null);
    setCurrentQuestion(0);
    setAnswers({});
    setTestCompleted(false);
  };

  const getInterpretation = (testId: string, score: number) => {
    if (testId === 'ansiedad') {
      if (score <= 3) return { level: 'Mínimo', color: 'text-green-500', advice: 'Tu nivel de ansiedad es bajo. Continúa con tus hábitos saludables.' };
      if (score <= 6) return { level: 'Leve', color: 'text-yellow-500', advice: 'Ansiedad moderada. Considera prácticas de relajación y mindfulness.' };
      return { level: 'Moderado-Severo', color: 'text-red-500', advice: 'Te recomendamos consultar con un profesional de la salud mental.' };
    }
    return { level: 'Completado', color: 'text-primary', advice: 'Gracias por completar el test.' };
  };

  return (
    <section id="tests" className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-2">
            <ClipboardCheck className="h-3 w-3 mr-1" />
            Autoevaluación
          </Badge>
          <h2 className="text-3xl font-bold mb-2">Tests Psicológicos</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Realiza autoevaluaciones para conocer mejor tu estado emocional y obtener recomendaciones personalizadas.
          </p>
        </div>

        {/* Test Selection */}
        {!activeTest && (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {tests.map((test) => {
              const canAccess = !test.isPremium || isPremium;
              return (
                <Card 
                  key={test.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${!canAccess ? 'relative overflow-hidden' : ''}`}
                  onClick={() => canAccess && startTest(test.id)}
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
                    <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-2">
                      <test.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{test.title}</CardTitle>
                    <CardDescription className="text-sm">{test.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Button size="sm" className="w-full" disabled={!canAccess}>
                      {test.isPremium && !isPremium ? (
                        <>
                          <Crown className="h-4 w-4 mr-2" />
                          Premium
                        </>
                      ) : (
                        <>
                          Comenzar
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Active Test */}
        {activeTest && currentTestData && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <currentTestData.icon className="h-5 w-5 text-primary" />
                  {currentTestData.title}
                </CardTitle>
                <Badge variant="secondary">
                  {currentQuestion + 1} / {currentTestData.questions.length}
                </Badge>
              </div>
              <Progress 
                value={((currentQuestion + 1) / currentTestData.questions.length) * 100} 
                className="h-2 mt-2" 
              />
            </CardHeader>
            <CardContent>
              {!testCompleted ? (
                <div className="space-y-6">
                  <p className="text-lg font-medium">
                    {currentTestData.questions[currentQuestion]?.text}
                  </p>
                  <RadioGroup
                    value={answers[currentTestData.questions[currentQuestion]?.id]?.toString()}
                    onValueChange={(value) => handleAnswer(parseInt(value))}
                    className="space-y-3"
                  >
                    {currentTestData.questions[currentQuestion]?.options.map((option) => (
                      <div
                        key={option.value}
                        className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                        onClick={() => handleAnswer(option.value)}
                      >
                        <RadioGroupItem value={option.value.toString()} id={`option-${option.value}`} />
                        <Label htmlFor={`option-${option.value}`} className="cursor-pointer flex-1">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={closeTest}>
                      Cancelar
                    </Button>
                    <Button 
                      onClick={nextQuestion}
                      disabled={answers[currentTestData.questions[currentQuestion]?.id] === undefined}
                    >
                      {currentQuestion < currentTestData.questions.length - 1 ? 'Siguiente' : 'Ver Resultado'}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4 py-4">
                  <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
                  <h3 className="text-xl font-bold">Test Completado</h3>
                  <div className="space-y-2">
                    <p className="text-muted-foreground">Tu puntuación:</p>
                    <div className={`text-4xl font-bold ${getInterpretation(activeTest, score).color}`}>
                      {score} puntos
                    </div>
                    <Badge className={getInterpretation(activeTest, score).color}>
                      Nivel: {getInterpretation(activeTest, score).level}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    {getInterpretation(activeTest, score).advice}
                  </p>
                  <Button onClick={closeTest}>Cerrar</Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
}
