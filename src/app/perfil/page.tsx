'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/hooks/useUser';
import { Crown, Sparkles, User as UserIcon, Calendar, Trash2, LogOut, CheckCircle, Loader2 } from 'lucide-react';

interface ProfileInfo {
  name: string;
  age: number | null;
  occupation: string;
  goals: string[];
  currentConcerns: string;
  preferredTopics: string[];
  supportMethods: string[];
  medications: string;
  notes: string;
}

interface Profile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isPremium: boolean;
  premiumSince?: string;
  role: string;
  createdAt: string;
  profileInfo: ProfileInfo | null;
}

const categories = [
  { id: 'ansiedad', label: 'Ansiedad' },
  { id: 'depresion', label: 'Depresión' },
  { id: 'relaciones', label: 'Relaciones' },
  { id: 'autoestima', label: 'Autoestima' },
  { id: 'estres', label: 'Estrés' },
  { id: 'duelo', label: 'Duelo' },
  { id: 'sueno', label: 'Sueño' },
  { id: 'trauma', label: 'Trauma' },
  { id: 'otros', label: 'Otros' },
];

const supportMethods = [
  { id: 'terapia', label: 'Terapia' },
  { id: 'meditacion', label: 'Meditación' },
  { id: 'ejercicio', label: 'Ejercicio' },
  { id: 'journaling', label: 'Journaling' },
  { id: 'social', label: 'Apoyo social' },
  { id: 'profesional', label: 'Ayuda profesional' },
];

export default function ProfilePage() {
  const { user, logout } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [loggingOut, setLoggingOut] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load profile on mount
  useEffect(() => {
    if (user?.email) {
      loadProfile();
    }
  }, [user?.email]);

  const loadProfile = async () => {
    if (!user?.email) return;

    try {
      const response = await fetch(`/api/profile?email=${encodeURIComponent(user.email)}`);
      const data = await response.json();

      if (data.success && data.profile) {
        setProfile(data.profile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.email || !profile) return;

    setSaving(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name: profile?.name,
          profileInfo: profile?.profileInfo,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Perfil actualizado',
          description: 'Tu información se ha guardado correctamente',
        });
      } else {
        toast({
          title: 'Error',
          description: 'No se pudo guardar el perfil',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Error',
        description: 'Error al guardar el perfil',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleDeleteAccount = async () => {
    setLoggingOut(true);
    await logout();
    setShowDeleteDialog(false);
    toast({
      title: 'Sesión cerrada',
      description: 'Has cerrado sesión correctamente.',
    });
    router.push('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <UserIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Acceso requerido</h3>
            <p className="text-muted-foreground">
              Inicia sesión para acceder a tu perfil
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-bold text-lg">
            {user?.name?.[0] || 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user?.name || 'Usuario'}</h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>

        {/* Premium Badge */}
        <div className="flex items-center gap-2">
          {profile?.isPremium ? (
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
              <Crown className="h-3 w-3 mr-1" />
              Usuario Premium
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1">
              <Sparkles className="h-3 w-3" />
              Plan Gratuito
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={() => router.push('/')}>
            Ir al inicio
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="info">Información</TabsTrigger>
          <TabsTrigger value="preferences">Preferencias</TabsTrigger>
          <TabsTrigger value="account">Cuenta</TabsTrigger>
        </TabsList>

        {/* Info Tab */}
        <TabsContent value="info" className="mt-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                value={profile?.name || ''}
                onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <Label htmlFor="age">Edad</Label>
              <Input
                id="age"
                type="number"
                value={profile?.profileInfo?.age ?? ''}
                onChange={(e) => setProfile(prev => ({
                  ...prev,
                  profileInfo: { ...prev.profileInfo, age: e.target.value ? parseInt(e.target.value) : null }
                }))}
                placeholder="Opcional"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="occupation">Ocupación</Label>
            <Input
              id="occupation"
              value={profile?.profileInfo?.occupation || ''}
              onChange={(e) => setProfile(prev => ({
                ...prev,
                profileInfo: { ...prev.profileInfo, occupation: e.target.value }
              }))}
              placeholder="Opcional"
            />
          </div>

          <Separator className="my-4" />

          <div>
            <Label className="text-sm font-medium">Información para personalizar la IA</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Esta información ayuda al chat a darte respuestas más relevantes y personalizadas.
            </p>
          </div>

          <div>
            <Label htmlFor="goals">Objetivos / Metas</Label>
            <Textarea
              id="goals"
              value={profile?.profileInfo?.goals?.join(', ') || ''}
              onChange={(e) => setProfile(prev => ({
                ...prev,
                profileInfo: {
                  ...prev.profileInfo,
                  goals: e.target.value.split(',').map((g) => g.trim()).filter(Boolean)
                }
              }))}
              placeholder="Escribe objetivos separados por comas (ej: reducir ansiedad, dormir mejor)"
              className="min-h-[80px]"
            />
          </div>

          <div>
            <Label htmlFor="currentConcerns">Preocupaciones actuales</Label>
            <Textarea
              id="currentConcerns"
              value={profile?.profileInfo?.currentConcerns || ''}
              onChange={(e) => setProfile(prev => ({
                ...prev,
                profileInfo: { ...prev.profileInfo, currentConcerns: e.target.value }
              }))}
              placeholder="Describe tus preocupaciones principales..."
              className="min-h-[80px]"
            />
          </div>

          <div>
            <Label htmlFor="notes">Notas adicionales</Label>
            <Textarea
              id="notes"
              value={profile?.profileInfo?.notes || ''}
              onChange={(e) => setProfile(prev => ({
                ...prev,
                profileInfo: { ...prev.profileInfo, notes: e.target.value }
              }))}
              placeholder="Cualquier otra información relevante para la IA..."
              className="min-h-[80px]"
            />
          </div>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="mt-4 space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2">Temas de interés</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Selecciona los temas sobre los que te gustaría hablar
            </p>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  size="sm"
                  variant={profile?.profileInfo?.preferredTopics?.includes(cat.id) ? 'default' : 'outline'}
                  onClick={() => {
                    const current = profile?.profileInfo?.preferredTopics || [];
                    const newTopics = current.includes(cat.id)
                      ? current.filter(c => c !== cat.id)
                      : [...current, cat.id];
                    setProfile(prev => ({
                      ...prev,
                      profileInfo: { ...prev.profileInfo, preferredTopics: newTopics }
                    }));
                  }}
                >
                  {cat.label}
                </Button>
              ))}
            </div>
          </div>

          <Separator className="my-4" />

          <div>
            <Label className="text-sm font-medium mb-2">Métodos de apoyo</Label>
            <p className="text-xs text-muted-foreground mb-2">
              ¿Qué métodos has encontrado útiles?
            </p>
            <div className="flex flex-wrap gap-2">
              {supportMethods.map((method) => (
                <Button
                  key={method.id}
                  size="sm"
                  variant={profile?.profileInfo?.supportMethods?.includes(method.id) ? 'default' : 'outline'}
                  onClick={() => {
                    const current = profile?.profileInfo?.supportMethods || [];
                    const newMethods = current.includes(method.id)
                      ? current.filter(m => m !== method.id)
                      : [...current, method.id];
                    setProfile(prev => ({
                      ...prev,
                      profileInfo: { ...prev.profileInfo, supportMethods: newMethods }
                    }));
                  }}
                >
                  {method.label}
                </Button>
              ))}
            </div>
          </div>

          <Separator className="my-4" />

          <div>
            <Label htmlFor="medications">Medicación actual</Label>
            <Textarea
              id="medications"
              value={profile?.profileInfo?.medications || ''}
              onChange={(e) => setProfile(prev => ({
                ...prev,
                profileInfo: { ...prev.profileInfo, medications: e.target.value }
              }))}
              placeholder="Lista de medicamentos o suplementos (opcional)"
              className="min-h-[60px]"
            />
          </div>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account" className="mt-4 space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div>
              <p className="font-medium">Plan actual</p>
              <p className="text-sm text-muted-foreground">
                {profile?.isPremium ? (
                  <span className="text-amber-600 font-medium flex items-center gap-1">
                    <Crown className="h-4 w-4" />
                    Usuario Premium
                  </span>
                ) : (
                  'Plan Gratuito'
                )}
              </p>
            </div>
            {!profile?.isPremium && (
              <Button onClick={() => router.push('/#precios')}>
                <Sparkles className="h-4 w-4 mr-2" />
                Actualizar a Premium
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div>
              <p className="font-medium">Miembro desde</p>
              <p className="text-sm text-muted-foreground">
                {profile?.createdAt ? formatDate(profile.createdAt) : 'N/A'}
              </p>
            </div>
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </div>

          {profile?.isPremium && profile?.premiumSince && (
            <div className="flex items-center justify-between p-4 rounded-lg bg-amber-50 border border-amber-200">
              <div>
                <p className="font-medium text-amber-700">Premium desde</p>
                <p className="text-sm text-amber-600">
                  {formatDate(profile.premiumSince)}
                </p>
              </div>
              <Crown className="h-5 w-5 text-amber-500" />
            </div>
          )}

          <Separator className="my-4" />

          <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 border border-red-200">
            <div>
              <p className="font-medium text-red-700">Zona de peligro</p>
              <p className="text-sm text-red-600">
                Cerrar sesión te desconectará de tu cuenta
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar sesión
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end mt-6 gap-2">
        <Button variant="outline" onClick={() => router.push('/')}>
          <UserIcon className="h-4 w-4 mr-2" />
          Volver al inicio
        </Button>
        <Button onClick={handleSaveProfile} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Guardar cambios
            </>
          )}
        </Button>
      </div>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Cerrar sesión?</DialogTitle>
            <DialogDescription>
              Se cerrará tu sesión actual. Tus datos permanecerán guardados.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 p-4">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              {loggingOut ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Cerrando...
                </>
              ) : (
                <>
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar sesión
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
