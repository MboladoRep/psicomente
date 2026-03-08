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
  Shield,
  FileText,
  Plus,
  Loader2,
  CheckCircle,
  XCircle,
  Home,
  BarChart3,
  ExternalLink,
  Server,
  Database,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { authGet, authPost } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

interface AdminStats {
  totalUsers: number;
  premiumUsers: number;
  freeUsers: number;
  activeToday: number;
  estimatedRevenue: string;
  conversionRate: string;
}

interface UserItem {
  id: string;
  email: string;
  name: string;
  isPremium: boolean;
  createdAt: string;
  premiumSince?: string;
  role?: string;
}

interface SystemStatus {
  groq: { status: 'ok' | 'error' | 'loading'; message: string };
  database: { status: 'ok' | 'error' | 'loading'; message: string };
  chat: { status: 'ok' | 'error' | 'loading'; message: string };
}

export default function AdminPanel() {
  const { user, isAdmin } = useUser();
  const { toast } = useToast();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generatingArticle, setGeneratingArticle] = useState(false);
  const [lastArticleResult, setLastArticleResult] = useState<{success: boolean; message: string} | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    groq: { status: 'loading', message: 'Verificando...' },
    database: { status: 'loading', message: 'Verificando...' },
    chat: { status: 'loading', message: 'Verificando...' },
  });

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const response = await authGet('/api/admin', user);
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
        setRecentUsers(data.recentUsers || []);
      } else if (response.status === 403) {
        console.error('Access denied - not an admin');
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAdmin && user) {
      fetchData();
    }
  }, [isAdmin, user]);

  const handleMakePremium = async (userId: string) => {
    try {
      const response = await authPost('/api/admin', { userId, action: 'makePremium' }, user);
      const data = await response.json();
      
      if (data.success) {
        fetchData();
      } else {
        console.error('Failed to make premium:', data.error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleMakeAdmin = async (userId: string) => {
    try {
      const response = await authPost('/api/admin', { userId, action: 'makeAdmin' }, user);
      const data = await response.json();
      
      if (data.success) {
        fetchData();
      } else {
        console.error('Failed to make admin:', data.error);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleGenerateArticle = async () => {
    setGeneratingArticle(true);
    setLastArticleResult(null);
    
    try {
      const response = await fetch('/api/articles/generate', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user?.email || '',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setLastArticleResult({ success: true, message: data.message });
        toast({
          title: 'Artículo generado',
          description: data.message,
        });
      } else {
        setLastArticleResult({ success: false, message: data.error });
        toast({
          title: 'Error',
          description: data.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      setLastArticleResult({ success: false, message: errorMsg });
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setGeneratingArticle(false);
    }
  };

  const checkSystemStatus = async () => {
    setShowStatusModal(true);
    setSystemStatus({
      groq: { status: 'loading', message: 'Verificando...' },
      database: { status: 'loading', message: 'Verificando...' },
      chat: { status: 'loading', message: 'Verificando...' },
    });

    // Check Groq API
    try {
      const groqRes = await fetch('/api/test-groq');
      const groqData = await groqRes.json();
      setSystemStatus(prev => ({
        ...prev,
        groq: groqData.success 
          ? { status: 'ok', message: 'API funcionando correctamente' }
          : { status: 'error', message: groqData.body || groqData.error || 'Error desconocido' }
      }));
    } catch (error) {
      setSystemStatus(prev => ({
        ...prev,
        groq: { status: 'error', message: 'Error de conexión' }
      }));
    }

    // Check Database (via debug endpoint)
    try {
      const dbRes = await fetch('/api/debug');
      const dbData = await dbRes.json();
      setSystemStatus(prev => ({
        ...prev,
        database: dbData.success 
          ? { status: 'ok', message: `Conectado - ${dbData.stats?.totalUsers || 0} usuarios` }
          : { status: 'error', message: dbData.error || 'Error de conexión' }
      }));
    } catch (error) {
      setSystemStatus(prev => ({
        ...prev,
        database: { status: 'error', message: 'Error de conexión' }
      }));
    }

    // Check Chat API
    try {
      const chatRes = await fetch('/api/debug-chat');
      const chatData = await chatRes.json();
      setSystemStatus(prev => ({
        ...prev,
        chat: chatData.hasGroqKey 
          ? { status: 'ok', message: `API Key configurada (${chatData.groqKeyLength} chars)` }
          : { status: 'error', message: 'API Key no configurada' }
      }));
    } catch (error) {
      setSystemStatus(prev => ({
        ...prev,
        chat: { status: 'error', message: 'Error de conexión' }
      }));
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Panel de Administración</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => window.location.href = '/'} variant="outline" size="sm">
            <Home className="h-4 w-4 mr-2" />
            Volver a la Web
          </Button>
          <Button onClick={checkSystemStatus} variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Estado del Sistema
          </Button>
          <Button onClick={fetchData} disabled={refreshing} size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* System Status Modal */}
      {showStatusModal && (
        <Card className="border-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Server className="h-5 w-5" />
                Estado del Sistema
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowStatusModal(false)}>
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {/* Groq API */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  {systemStatus.groq.status === 'loading' ? (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  ) : systemStatus.groq.status === 'ok' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium text-sm flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Groq API (Chat IA)
                    </p>
                    <p className={`text-xs ${systemStatus.groq.status === 'error' ? 'text-red-500' : 'text-muted-foreground'}`}>
                      {systemStatus.groq.message}
                    </p>
                  </div>
                </div>
              </div>

              {/* Database */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  {systemStatus.database.status === 'loading' ? (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  ) : systemStatus.database.status === 'ok' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium text-sm flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Base de Datos
                    </p>
                    <p className={`text-xs ${systemStatus.database.status === 'error' ? 'text-red-500' : 'text-muted-foreground'}`}>
                      {systemStatus.database.message}
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat Config */}
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  {systemStatus.chat.status === 'loading' ? (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  ) : systemStatus.chat.status === 'ok' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium text-sm flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Configuración Chat
                    </p>
                    <p className={`text-xs ${systemStatus.chat.status === 'error' ? 'text-red-500' : 'text-muted-foreground'}`}>
                      {systemStatus.chat.message}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Overall Status */}
            <div className="mt-4 pt-4 border-t">
              {systemStatus.groq.status === 'error' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <strong>⚠️ Problema detectado:</strong> La API de Groq no está funcionando. 
                  Verifica que la API Key sea correcta en Vercel (Settings → Environment Variables).
                </div>
              )}
              {systemStatus.groq.status === 'ok' && systemStatus.database.status === 'ok' && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                  <strong>✅ Todo funcionando correctamente</strong>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

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

      {/* Content Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Gestión de Contenido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-2">
                Genera artículos automáticamente usando IA. Los artículos se guardan en la base de datos 
                y aparecen en la sección de artículos de la web.
              </p>
              {lastArticleResult && (
                <div className={`flex items-center gap-2 text-sm ${lastArticleResult.success ? 'text-green-600' : 'text-red-600'}`}>
                  {lastArticleResult.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  {lastArticleResult.message}
                </div>
              )}
            </div>
            <Button 
              onClick={handleGenerateArticle} 
              disabled={generatingArticle}
              className="flex-shrink-0"
            >
              {generatingArticle ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Generar Artículo
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

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
                  {/* Role Badge */}
                  {u.role === 'admin' && (
                    <Badge className="bg-red-500 text-xs">
                      <Shield className="h-3 w-3 mr-1" />
                      Admin
                    </Badge>
                  )}
                  {/* Premium Badge */}
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
                        title="Hacer Premium"
                      >
                        <Crown className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  {/* Make Admin Button (only for non-admins) */}
                  {u.role !== 'admin' && (
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleMakeAdmin(u.id)}
                      className="text-red-600 hover:text-red-700"
                      title="Hacer Admin"
                    >
                      <Shield className="h-4 w-4" />
                    </Button>
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
