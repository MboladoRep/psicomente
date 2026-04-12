'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Server,
  Database,
  MessageSquare,
  AlertTriangle,
  Edit,
  Trash2,
  Image as ImageIcon,
  Eye,
  X
} from 'lucide-react';
import { useUser } from '@/hooks/useUser';
import { authGet, authPost } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  read_time: number;
  views: number;
  image_url?: string;
  created_at: string;
}

interface SystemStatus {
  groq: { status: 'ok' | 'error' | 'loading'; message: string };
  database: { status: 'ok' | 'error' | 'loading'; message: string };
  chat: { status: 'ok' | 'error' | 'loading'; message: string };
}

const categories = [
  { value: 'ansiedad', label: 'Ansiedad' },
  { value: 'depresion', label: 'Depresión' },
  { value: 'relaciones', label: 'Relaciones' },
  { value: 'autoestima', label: 'Autoestima' },
  { value: 'estres', label: 'Estrés' },
  { value: 'mindfulness', label: 'Mindfulness' },
  { value: 'desarrollo', label: 'Desarrollo Personal' },
];

const defaultImages: Record<string, string> = {
  ansiedad: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  depresion: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800&q=80',
  relaciones: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80',
  autoestima: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
  estres: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
  mindfulness: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80',
  desarrollo: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&q=80',
};

export default function AdminPanel() {
  const { user, isAdmin } = useUser();
  const { toast } = useToast();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<UserItem[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generatingArticle, setGeneratingArticle] = useState(false);
  const [lastArticleResult, setLastArticleResult] = useState<{success: boolean; message: string} | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'articles'>('users');
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    groq: { status: 'loading', message: 'Verificando...' },
    database: { status: 'loading', message: 'Verificando...' },
    chat: { status: 'loading', message: 'Verificando...' },
  });

  // Article editing state
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null);
  const [saving, setSaving] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    image_url: '',
    tags: '',
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

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/articles?limit=50&admin=true');
      const data = await response.json();
      
      if (data.articles) {
        setArticles(data.articles);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    }
  };

  useEffect(() => {
    if (isAdmin && user) {
      fetchData();
      fetchArticles();
    }
  }, [isAdmin, user]);

  const handleMakePremium = async (userId: string) => {
    try {
      const response = await authPost('/api/admin', { userId, action: 'makePremium' }, user);
      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Usuario Premium',
          description: 'El usuario ahora tiene acceso premium',
        });
        fetchData();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'No se pudo actualizar',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Error de conexión',
        variant: 'destructive',
      });
    }
  };

  const handleRemovePremium = async (userId: string) => {
    try {
      const response = await authPost('/api/admin', { userId, action: 'removePremium' }, user);
      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Premium removido',
          description: 'El usuario ya no tiene acceso premium',
        });
        fetchData();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'No se pudo actualizar',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Error de conexión',
        variant: 'destructive',
      });
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
        fetchArticles();
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

  // Article editing functions
  const openEditDialog = (article: Article) => {
    setEditingArticle(article);
    setEditForm({
      title: article.title,
      excerpt: article.excerpt || '',
      content: article.content || '',
      category: article.category,
      image_url: article.image_url || '',
      tags: article.tags?.join(', ') || '',
    });
    setEditDialogOpen(true);
  };

  const handleSaveArticle = async () => {
    if (!editingArticle) return;
    
    setSaving(true);
    try {
      const response = await fetch('/api/articles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingArticle.id,
          title: editForm.title,
          excerpt: editForm.excerpt,
          content: editForm.content,
          category: editForm.category,
          image_url: editForm.image_url || null,
          tags: editForm.tags.split(',').map(t => t.trim()).filter(Boolean),
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Artículo actualizado',
          description: 'Los cambios se han guardado correctamente',
        });
        setEditDialogOpen(false);
        fetchArticles();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Error al actualizar',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error de conexión',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const openDeleteDialog = (article: Article) => {
    setArticleToDelete(article);
    setDeleteDialogOpen(true);
  };

  const handleDeleteArticle = async () => {
    if (!articleToDelete) return;
    
    setSaving(true);
    try {
      const response = await fetch(`/api/articles?id=${articleToDelete.id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Artículo eliminado',
          description: 'El artículo ha sido eliminado correctamente',
        });
        setDeleteDialogOpen(false);
        fetchArticles();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Error al eliminar',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error de conexión',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const checkSystemStatus = async () => {
    setShowStatusModal(true);
    setSystemStatus({
      groq: { status: 'loading', message: 'Verificando...' },
      database: { status: 'loading', message: 'Verificando...' },
      chat: { status: 'loading', message: 'Verificando...' },
    });

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

    try {
      const dbRes = await fetch('/api/debug', {
        headers: { 'x-admin-email': user?.email || '' },
      });
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
        <RefreshCw className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-purple-600" />
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
          <Button onClick={() => { fetchData(); fetchArticles(); }} disabled={refreshing} size="sm" className="bg-purple-600 hover:bg-purple-700">
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* System Status Modal */}
      {showStatusModal && (
        <Card className="border-2 border-purple-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Server className="h-5 w-5 text-purple-600" />
                Estado del Sistema
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowStatusModal(false)}>
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
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
              <div className="flex items-center gap-2 text-emerald-600 text-sm mb-1">
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
              <div className="flex items-center gap-2 text-emerald-600 text-sm mb-1">
                <DollarSign className="h-4 w-4" />
                Ingresos
              </div>
              <div className="text-2xl font-bold">{stats.estimatedRevenue}€</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-purple-600 text-sm mb-1">
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
            <FileText className="h-5 w-5 text-purple-600" />
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
              className="flex-shrink-0 bg-purple-600 hover:bg-purple-700"
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

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-2">
        <Button 
          variant={activeTab === 'users' ? 'default' : 'ghost'} 
          size="sm"
          onClick={() => setActiveTab('users')}
        >
          <Users className="h-4 w-4 mr-2" />
          Usuarios ({recentUsers.length})
        </Button>
        <Button 
          variant={activeTab === 'articles' ? 'default' : 'ghost'} 
          size="sm"
          onClick={() => setActiveTab('articles')}
        >
          <FileText className="h-4 w-4 mr-2" />
          Artículos ({articles.length})
        </Button>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
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
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-medium">
                      {(u.name || u.email?.[0] || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{u.name || 'Sin nombre'}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {u.role === 'admin' && (
                      <Badge className="bg-red-500 text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        Admin
                      </Badge>
                    )}
                    {u.isPremium ? (
                      <div className="flex items-center gap-1">
                        <Badge className="bg-emerald-500 text-xs">
                          <Crown className="h-3 w-3 mr-1" />
                          Premium
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemovePremium(u.id)}
                          className="text-orange-600 hover:text-orange-700"
                          title="Quitar Premium"
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Badge variant="outline" className="text-xs">Gratis</Badge>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleMakePremium(u.id)}
                          className="text-emerald-600 hover:text-emerald-700"
                          title="Hacer Premium"
                        >
                          <Crown className="h-4 w-4" />
                        </Button>
                      </>
                    )}
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
      )}

      {/* Articles Tab */}
      {activeTab === 'articles' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Gestionar Artículos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {articles.map((article) => (
                <div 
                  key={article.id}
                  className="flex items-start gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  {/* Article Image */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                    <img 
                      src={article.image_url || defaultImages[article.category] || defaultImages.desarrollo}
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  {/* Article Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-medium text-sm line-clamp-1">{article.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {article.excerpt || 'Sin descripción'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {categories.find(c => c.value === article.category)?.label || article.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {article.views || 0}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(article.created_at)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => openEditDialog(article)}
                          className="text-blue-600 hover:text-blue-700"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => openDeleteDialog(article)}
                          className="text-red-600 hover:text-red-700"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {articles.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No hay artículos. Genera uno nuevo arriba.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Article Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Editar Artículo
            </DialogTitle>
            <DialogDescription>
              Modifica los campos que desees actualizar
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Current Image Preview */}
            {editForm.image_url && (
              <div className="space-y-2">
                <Label>Imagen actual</Label>
                <div className="relative w-full h-40 rounded-lg overflow-hidden bg-muted">
                  <img 
                    src={editForm.image_url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}
            
            {/* Image URL */}
            <div className="space-y-2">
              <Label htmlFor="image_url" className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                URL de la imagen
              </Label>
              <Input
                id="image_url"
                placeholder="https://ejemplo.com/imagen.jpg"
                value={editForm.image_url}
                onChange={(e) => setEditForm({ ...editForm, image_url: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Deja vacío para usar la imagen por defecto de la categoría
              </p>
            </div>
            
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              />
            </div>
            
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Categoría</Label>
              <Select 
                value={editForm.category} 
                onValueChange={(value) => setEditForm({ ...editForm, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Excerpt */}
            <div className="space-y-2">
              <Label htmlFor="excerpt">Resumen</Label>
              <Textarea
                id="excerpt"
                rows={2}
                value={editForm.excerpt}
                onChange={(e) => setEditForm({ ...editForm, excerpt: e.target.value })}
              />
            </div>
            
            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Contenido</Label>
              <Textarea
                id="content"
                rows={8}
                value={editForm.content}
                onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
              />
            </div>
            
            {/* Tags */}
            <div className="space-y-2">
              <Label htmlFor="tags">Etiquetas (separadas por coma)</Label>
              <Input
                id="tags"
                placeholder="ansiedad, estrés, relajación"
                value={editForm.tags}
                onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveArticle} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Guardar cambios'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Eliminar Artículo
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar el artículo?
            </DialogDescription>
          </DialogHeader>
          
          {articleToDelete && (
            <div className="py-4">
              <p className="font-medium">{articleToDelete.title}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Esta acción no se puede deshacer.
              </p>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteArticle} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Eliminando...
                </>
              ) : (
                'Eliminar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
