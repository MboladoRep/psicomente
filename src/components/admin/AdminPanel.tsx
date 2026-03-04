'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Crown, 
  TrendingUp, 
  DollarSign, 
  Activity,
  RefreshCw,
  Lock,
  X
} from 'lucide-react';
import { useUser } from '@/hooks/useUser';

interface AdminStats {
  totalUsers: number;
  premiumUsers: number;
  freeUsers: number;
  activeToday: number;
  estimatedRevenue: string;
  conversionRate: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  isPremium: boolean;
  createdAt: string;
  premiumSince?: string;
}

export default function AdminPanel() {
  const { user } = useUser();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Only allow admin access (check by email)
  const isAdmin = user?.email === 'm.bolado79@gmail.com';

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const response = await fetch('/api/admin');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
        setRecentUsers(data.recentUsers || []);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const handleMakePremium = async (userId: string) => {
    try {
      await fetch('/api/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'makePremium' }),
      });
      fetchData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
    });
  };

  if (!isAdmin) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Lock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Acceso Restringido</h3>
            <p className="text-muted-foreground">
              Solo los administradores pueden acceder a esta sección.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Panel de Administración</h2>
        <Button onClick={fetchData} disabled={refreshing} size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Users className="h-4 w-4" />
                Usuarios
              </div>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-amber-600 text-sm mb-1">
                <Crown className="h-4 w-4" />
                Premium
              </div>
              <div className="text-2xl font-bold">{stats.premiumUsers}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                <Users className="h-4 w-4" />
                Gratis
              </div>
              <div className="text-2xl font-bold">{stats.freeUsers}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-green-600 text-sm mb-1">
                <Activity className="h-4 w-4" />
                Activos Hoy
              </div>
              <div className="text-2xl font-bold">{stats.activeToday}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-green-600 text-sm mb-1">
                <DollarSign className="h-4 w-4" />
                Ingresos
              </div>
              <div className="text-2xl font-bold">{stats.estimatedRevenue}€</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-blue-600 text-sm mb-1">
                <TrendingUp className="h-4 w-4" />
                Conversión
              </div>
              <div className="text-2xl font-bold">{stats.conversionRate}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Users */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Usuarios Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentUsers.map((u) => (
              <div 
                key={u.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-sm font-medium">
                    {(u.name || u.email?.[0] || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{u.name || 'Sin nombre'}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {u.isPremium ? (
                    <Badge className="bg-amber-500 text-xs">
                      <Crown className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  ) : (
                    <>
                      <Badge variant="outline" className="text-xs">Gratis</Badge>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleMakePremium(u.id)}
                        className="text-amber-600 hover:text-amber-700"
                      >
                        <Crown className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {u.createdAt ? formatDate(u.createdAt) : ''}
                  </span>
                </div>
              </div>
            ))}
            {recentUsers.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No hay usuarios registrados todavía
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
