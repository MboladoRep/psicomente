'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, CreditCard } from 'lucide-react';
import Link from 'next/link';

export function CancelContent() {
  return (
    <Card className="max-w-md w-full">
      <CardHeader className="text-center">
        <XCircle className="h-16 w-16 text-destructive mx-auto" />
        <CardTitle className="text-2xl mt-4">
          Pago Cancelado
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        <p className="text-muted-foreground">
          El proceso de pago fue cancelado. No se ha realizado ningún cargo.
        </p>
        
        <div className="bg-muted/50 p-4 rounded-lg">
          <p className="text-sm">
            Si tuviste algún problema con el pago, contacta con nosotros o inténtalo de nuevo.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Button asChild>
            <Link href="/#precios">
              <CreditCard className="h-4 w-4 mr-2" />
              Intentar de nuevo
            </Link>
          </Button>
          
          <Button variant="outline" asChild>
            <Link href="/">
              Volver al inicio
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
