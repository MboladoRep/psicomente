'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useUser } from '@/hooks/useUser';
import { useToast } from '@/hooks/use-toast';
import { Brain, Mail, Lock, User, Loader2, Crown, Sparkles } from 'lucide-react';
import { signInWithGoogle } from '@/lib/firebase-auth';

// Google Icon component
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const { login, isLoading } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '' });
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const result = await signInWithGoogle();
      
      if (result.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
        setGoogleLoading(false);
        return;
      }

      if (result.user) {
        // Login with Firebase user data
        const loginResult = await login(result.user.name, result.user.email, result.user.avatar);
        
        // Show appropriate welcome message based on premium status
        if (loginResult.isPremium) {
          toast({
            title: '¡Bienvenido de nuevo! 👑',
            description: (
              <div className="flex items-center gap-2">
                <span>Has iniciado sesión como <strong>{result.user.name}</strong>.</span>
                <span className="flex items-center gap-1 text-amber-500 font-medium">
                  <Crown className="h-4 w-4" />
                  Eres usuario Premium
                </span>
              </div>
            ),
          });
        } else {
          toast({
            title: '¡Bienvenido!',
            description: `Has iniciado sesión como ${result.user.name}. ¡Explora PsicoMente!`,
          });
        }
        
        onClose();
        
        // Redirect to profile page
        router.push('/perfil');
        return;
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error al conectar con Google',
        variant: 'destructive',
      });
    }
    setGoogleLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginData.email.includes('@')) {
      toast({
        title: 'Email inválido',
        description: 'Por favor, introduce un email válido.',
        variant: 'destructive',
      });
      return;
    }
    
    const loginResult = await login(loginData.email.split('@')[0] || 'Usuario', loginData.email);
    
    // Show appropriate message based on premium status
    if (loginResult.isPremium) {
      toast({
        title: '¡Bienvenido de nuevo! 👑',
        description: (
          <div className="flex items-center gap-2">
            <span>Has iniciado sesión correctamente.</span>
            <span className="flex items-center gap-1 text-amber-500 font-medium">
              <Crown className="h-4 w-4" />
              Eres usuario Premium
            </span>
          </div>
        ),
      });
    } else {
      toast({
        title: '¡Bienvenido de nuevo!',
        description: 'Has iniciado sesión correctamente.',
      });
    }
    
    setLoginData({ email: '', password: '' });
    onClose();
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerData.email.includes('@')) {
      toast({
        title: 'Email inválido',
        description: 'Por favor, introduce un email válido.',
        variant: 'destructive',
      });
      return;
    }
    
    await login(registerData.name || registerData.email.split('@')[0], registerData.email);
    toast({
      title: '¡Cuenta creada!',
      description: `Bienvenido a PsicoMente, ${registerData.name || 'Usuario'}.`,
    });
    setRegisterData({ name: '', email: '', password: '' });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-xl bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5">
            <Brain className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-xl">Bienvenido a PsicoMente</DialogTitle>
          <DialogDescription>
            Inicia sesión para acceder a tu cuenta y guardar tu progreso
          </DialogDescription>
        </DialogHeader>

        {/* Google Login Button - Primary option */}
        <Button
          type="button"
          variant="outline"
          className="w-full h-11 hover:bg-muted/50"
          onClick={handleGoogleLogin}
          disabled={googleLoading || isLoading}
        >
          {googleLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <GoogleIcon className="h-5 w-5 mr-2" />
          )}
          Continuar con Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              O continúa con email
            </span>
          </div>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
            <TabsTrigger value="register">Registrarse</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="tu@email.com"
                    className="pl-10"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="********"
                    className="pl-10"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Iniciar Sesión
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register" className="mt-4">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-name">Nombre completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="Tu nombre"
                    className="pl-10"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-email">Correo electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="tu@email.com"
                    className="pl-10"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="register-password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="********"
                    className="pl-10"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Crear Cuenta
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <p className="text-xs text-center text-muted-foreground mt-4">
          Al continuar, aceptas nuestros términos de servicio y política de privacidad.
          Esta aplicación no sustituye la ayuda profesional.
        </p>
      </DialogContent>
    </Dialog>
  );
}
