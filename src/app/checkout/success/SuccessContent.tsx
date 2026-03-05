'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Crown, Loader2, XCircle } from 'lucide-react';
import { useUser } from '@/hooks/useUser';

export function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, upgradeToPremium } = useUser();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      const sessionId = searchParams.get('session_id');
      
      if (!sessionId) {
        setStatus('error');
        setMessage('No se encontró información del pago');
        return;
      }

      try {
        // Verificar la sesión de pago con nuestra API
        const response = await fetch(`/api/checkout/verify?session_id=${sessionId}`);
        const data = await response.json();

        if (data.success && data.paymentStatus === 'paid') {
          setStatus('success');
          setMessage('¡Pago verificado correctamente!');
          
          // Actualizar usuario a premium
          if (user) {
            upgradeToPremium();
          }
        } else if (data.paymentStatus === 'open') {
          // Pago pendiente
          setStatus('loading');
          setMessage('Procesando pago...');
          // Reintentar en 3 segundos
          setTimeout(verifyPayment, 3000);
        } else {
          setStatus('error');
          setMessage(data.error || 'El pago no se completó correctamente');
        }
      } catch (error) {
        console.error('Error verifying payment:', error);
        setStatus('error');
        setMessage('Error al verificar el pago');
      }
    };

    if (user !== undefined) {
      verifyPayment();
    }
  }, [searchParams, user, upgradeToPremium]);

  return (
    <Card className="max-w-md w-full">
      <CardHeader className="text-center">
        {status === 'loading' && (
          <Loader2 className="h-16 w-16 text-primary mx-auto animate-spin" />
        )}
        {status === 'success' && (
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
        )}
        {status === 'error' && (
          <XCircle className="h-16 w-16 text-red-500 mx-auto" />
        )}
        <CardTitle className="text-2xl mt-4">
          {status === 'loading' && 'Verificando...'}
          {status === 'success' && '¡Pago Exitoso!'}
          {status === 'error' && 'Error'}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        {status === 'loading' && (
          <p className="text-muted-foreground">
            {message || 'Estamos confirmando tu suscripción...'}
          </p>
        )}
        
        {status === 'success' && (
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

        {status === 'error' && (
          <>
            <p className="text-muted-foreground">{message}</p>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => router.push('/#precios')}
                className="flex-1"
              >
                Intentar de nuevo
              </Button>
              <Button 
                onClick={() => router.push('/')}
                className="flex-1"
              >
                Volver al inicio
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
