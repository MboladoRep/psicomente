'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, LogIn, UserPlus } from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { useToast } from '@/hooks/use-toast';

interface LoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function LoginModal({ open, onOpenChange }: LoginModalProps) {
  const { login, isLoading } = useUser();
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: 'Email requerido',
        description: 'Por favor, introduce tu email.',
        variant: 'destructive',
      });
      return;
    }

    if (!email.includes('@')) {
      toast({
        title: 'Email inválido',
        description: 'Por favor, introduce un email válido.',
        variant: 'destructive',
      });
      return;
    }

    await login(name || email.split('@')[0], email);
    
    toast({
      title: '¡Bienvenido!',
      description: `Hola ${name || email.split('@')[0]}, tu cuenta está lista.`,
    });
    
    onOpenChange(false);
    setName('');
    setEmail('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogIn className="h-5 w-5" />
            {isRegistering ? 'Crear cuenta' : 'Iniciar sesión'}
          </DialogTitle>
          <DialogDescription>
            {isRegistering 
              ? 'Crea tu cuenta para guardar tu progreso en la nube.'
              : 'Accede a tu cuenta para sincronizar tu progreso.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                placeholder="Tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : isRegistering ? (
              <UserPlus className="h-4 w-4 mr-2" />
            ) : (
              <LogIn className="h-4 w-4 mr-2" />
            )}
            {isLoading 
              ? 'Cargando...' 
              : isRegistering 
                ? 'Crear cuenta' 
                : 'Entrar'}
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => setIsRegistering(!isRegistering)}
          >
            {isRegistering 
              ? '¿Ya tienes cuenta? Inicia sesión' 
              : '¿No tienes cuenta? Regístrate'}
          </Button>
        </form>
        
        <p className="text-xs text-muted-foreground text-center">
          Al continuar, aceptas nuestros términos de uso y política de privacidad.
        </p>
      </DialogContent>
    </Dialog>
  );
}
