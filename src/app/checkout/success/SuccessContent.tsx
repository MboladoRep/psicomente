'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Crown, Loader2 } from 'lucide-react';
import { useUser } from '@/hooks/useUser';

export function SuccessContent() {
  const router = useRouter();
  const { user, upgradeToPremium } = useUser();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (user) {
        upgradeToPremium();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [user, upgradeToPremium]);

  return (
    <Card className="max-w-md w-full">
      <CardHeader className="text-center">
        {isLoading ? (
          <Loader2 className="h-16 w-16 text-primary mx-auto animate-spin" />
        ) : (
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
        )}
        <CardTitle className="text-2xl mt-4">
          {isLoading ? 'Procesando...' : '¡Pago Exitoso!'}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        {isLoading ? (
          <p className="text-muted-foreground">
            Estamos confirmando tu suscripción...
          </p>
        ) : (
          <>
            <div className="flex items-center justify-center gap-2 text-lg">
              <Crown className="h-6 w-6 text-amber-500" />
              <span className="font-semibold">Ya eres Premium</span>
            </div>
            
            <p className="text-muted-foreground">
              ¡Gracias por suscribirte a PsicoMente Premium! 
              Ahora tienes acceso ilimitado a todas las funciones.
            </p>
            
            <ul className="text-sm text-left space-y-2 bg-muted/50 p-4 rounded-lg">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Chat ilimitado con la IA
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Historial completo del diario
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Análisis de patrones emocionales
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Sin límites diarios
              </li>
            </ul>

            <Button 
              onClick={() => router.push('/')}
              className="w-full"
            >
              Comenzar a usar Premium
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
