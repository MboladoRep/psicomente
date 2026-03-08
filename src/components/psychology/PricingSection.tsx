'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Crown, 
  Check, 
  X, 
  Sparkles, 
  Zap,
  Shield,
  Headphones,
  Loader2
} from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { useToast } from '@/hooks/use-toast';

const plans = [
  {
    id: 'free',
    name: 'Gratis',
    price: 0,
    description: 'Perfecto para comenzar tu camino de bienestar',
    features: [
      { text: '5 consultas IA diarias', included: true },
      { text: 'Artículos básicos', included: true },
      { text: 'Diario emocional básico', included: true },
      { text: '3 tests psicológicos', included: true },
      { text: 'Ejercicios de respiración', included: true },
      { text: 'Consultas ilimitadas', included: false },
      { text: 'Análisis avanzado', included: false },
      { text: 'Soporte prioritario', included: false },
    ],
    buttonText: 'Comenzar Gratis',
    popular: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 4.99,
    description: 'Acceso completo a todas las herramientas de bienestar',
    features: [
      { text: 'Consultas IA ilimitadas', included: true },
      { text: 'Todos los artículos', included: true },
      { text: 'Diario emocional avanzado', included: true },
      { text: 'Todos los tests', included: true },
      { text: 'Biblioteca mindfulness completa', included: true },
      { text: 'Análisis y gráficos detallados', included: true },
      { text: 'Soporte prioritario', included: true },
      { text: 'Nuevo contenido semanal', included: true },
    ],
    buttonText: 'Actualizar a Premium',
    popular: true,
  },
];

export default function PricingSection() {
  const { user } = useUser();
  const { toast } = useToast();
  const [isAnnual, setIsAnnual] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!user?.email) {
      toast({
        title: 'Inicia sesión primero',
        description: 'Necesitas una cuenta para suscribirte a Premium.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name: user.name,
        }),
      });

      const data = await response.json();

      if (data.url) {
        // Redirigir a Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error('No se pudo crear la sesión de pago');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo procesar el pago. Inténtalo de nuevo.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const getPrice = (monthlyPrice: number) => {
    if (monthlyPrice === 0) return 'Gratis';
    if (isAnnual) {
      const annual = monthlyPrice * 12 * 0.8;
      return `${annual.toFixed(2)}€/año`;
    }
    return `${monthlyPrice.toFixed(2)}€`;
  };

  return (
    <section id="precios" className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-2">
            <Crown className="h-3 w-3 mr-1" />
            Planes
          </Badge>
          <h2 className="text-3xl font-bold mb-2">Elige tu Plan</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Comienza gratis y actualiza cuando estés listo para más funciones.
          </p>
        </div>

        {/* Annual Toggle */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <Label htmlFor="annual-toggle" className={!isAnnual ? 'font-medium' : 'text-muted-foreground'}>
            Mensual
          </Label>
          <Switch
            id="annual-toggle"
            checked={isAnnual}
            onCheckedChange={setIsAnnual}
          />
          <Label htmlFor="annual-toggle" className={isAnnual ? 'font-medium' : 'text-muted-foreground'}>
            Anual
            <Badge variant="secondary" className="ml-2 text-xs">-20%</Badge>
          </Label>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.id}
              className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Más Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{getPrice(plan.price)}</span>
                  {plan.price > 0 && (
                    <span className="text-muted-foreground">{isAnnual ? '' : '/mes'}</span>
                  )}
                </div>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground" />
                      )}
                      <span className={feature.included ? '' : 'text-muted-foreground'}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
                
                {plan.id === 'premium' && user?.isPremium ? (
                  <Button className="w-full" disabled>
                    <Check className="h-4 w-4 mr-2" />
                    Plan Actual
                  </Button>
                ) : plan.id === 'premium' ? (
                  <Button 
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                    onClick={handleUpgrade}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Redirigiendo...
                      </>
                    ) : (
                      plan.buttonText
                    )}
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full" disabled>
                    {user && !user.isPremium ? 'Plan Actual' : plan.buttonText}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="flex flex-wrap justify-center gap-6 mt-12 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span>Pago seguro con Stripe</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-primary" />
            <span>Cancelación en cualquier momento</span>
          </div>
          <div className="flex items-center gap-2">
            <Headphones className="h-4 w-4 text-primary" />
            <span>Soporte 24/7</span>
          </div>
        </div>
      </div>
    </section>
  );
}
