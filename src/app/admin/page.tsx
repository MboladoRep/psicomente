'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminPanel from '@/components/admin/AdminPanel';
import { useUser } from '@/hooks/useUser';
import { Loader2, Lock } from 'lucide-react';

export default function AdminPage() {
  const { user, isLoading } = useUser();
  const [checking, setChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Verificar acceso en el servidor
    const checkAccess = async () => {
      if (!user?.email) {
        setChecking(false);
        return;
      }

      try {
        // Verificar con la API si el usuario es realmente admin
        const response = await fetch(`/api/admin/check?email=${encodeURIComponent(user.email)}`);
        const data = await response.json();
        
        if (data.isAdmin) {
          setHasAccess(true);
        } else {
          setHasAccess(false);
        }
      } catch {
        setHasAccess(false);
      }
      
      setChecking(false);
    };

    if (!isLoading) {
      checkAccess();
    }
  }, [user, isLoading]);

  // Mostrar loading mientras verifica
  if (isLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario, redirigir a login
  if (!user) {
    router.push('/?auth=true');
    return null;
  }

  // Si no es admin, mostrar mensaje de acceso denegado
  if (!hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Acceso Denegado</h1>
          <p className="text-muted-foreground mb-6">
            No tienes permisos para acceder al panel de administración.
            Solo los administradores pueden ver esta página.
          </p>
          <button
            onClick={() => router.push('/')}
            className="text-primary hover:underline"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  // Si es admin, mostrar el panel
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <AdminPanel />
      </div>
    </div>
  );
}
