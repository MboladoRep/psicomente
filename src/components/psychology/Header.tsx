'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Menu, 
  X, 
  User, 
  Crown, 
  LogOut, 
  Sparkles,
  ChevronDown,
  Shield
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useUser } from '@/hooks/useUser';
import AuthModal from './AuthModal';

export default function Header() {
  const { user, progress, logout, upgradeToPremium, isAdmin } = useUser();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const navItems = [
    { label: 'Inicio', href: '#inicio' },
    { label: 'Chat IA', href: '#chat' },
    { label: 'Artículos', href: '#articulos' },
    { label: 'Tests', href: '#tests' },
    { label: 'Diario', href: '#diario' },
    { label: 'Mindfulness', href: '#mindfulness' },
    { label: 'Precios', href: '#precios' },
  ];

  const levelName = ['', 'Novato', 'Aprendiz', 'Intermedio', 'Avanzado', 'Experto', 'Maestro'][progress.level] || 'Novato';

  const handleAvatarClick = () => {
    router.push('/perfil');
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/5 group-hover:from-purple-500/30 group-hover:to-pink-500/10 transition-all">
              <Brain className="h-6 w-6 text-purple-600" />
              <Sparkles className="h-3 w-3 text-purple-400 absolute -top-1 -right-1" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
              PsicoMente
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* User Section */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Points Badge */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted">
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">{progress.points} pts</span>
                  <Badge variant="secondary" className="text-xs">
                    {levelName}
                  </Badge>
                </div>

                {/* Premium Badge or Upgrade Button */}
                {user.isPremium ? (
                  <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0">
                    <Crown className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => document.getElementById('precios')?.scrollIntoView({ behavior: 'smooth' })}
                    className="hidden sm:flex bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                  >
                    <Crown className="h-4 w-4 mr-1" />
                    Premium
                  </Button>
                )}

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2">
                      <button 
                        onClick={handleAvatarClick}
                        className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium overflow-hidden hover:ring-2 hover:ring-purple-400 transition-all"
                      >
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                          user.name.charAt(0).toUpperCase()
                        )}
                      </button>
                      <span className="hidden sm:inline text-sm">{user.name}</span>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    {/* Mi Perfil Link */}
                    <DropdownMenuItem asChild>
                      <Link href="/perfil" className="cursor-pointer">
                        <User className="h-4 w-4 mr-2 text-purple-500" />
                        Mi Perfil
                      </Link>
                    </DropdownMenuItem>
                    {/* Admin Panel Link - Only visible for admins */}
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer">
                          <Shield className="h-4 w-4 mr-2 text-red-500" />
                          Panel Admin
                        </Link>
                      </DropdownMenuItem>
                    )}
                    {!user.isPremium && (
                      <DropdownMenuItem onClick={upgradeToPremium} className="text-emerald-600">
                        <Crown className="h-4 w-4 mr-2" />
                        Actualizar a Premium
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-red-600">
                      <LogOut className="h-4 w-4 mr-2" />
                      Cerrar Sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button onClick={() => setShowAuthModal(true)}>
                <User className="h-4 w-4 mr-2" />
                Iniciar Sesión
              </Button>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t bg-background">
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              {/* Profile Link in Mobile Menu */}
              {user && (
                <Link
                  href="/perfil"
                  className="px-3 py-2 text-sm font-medium text-purple-500 hover:text-purple-600 transition-colors rounded-md hover:bg-muted flex items-center gap-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  Mi Perfil
                </Link>
              )}
              {/* Admin Link in Mobile Menu */}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="px-3 py-2 text-sm font-medium text-red-500 hover:text-red-600 transition-colors rounded-md hover:bg-muted flex items-center gap-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Shield className="h-4 w-4" />
                  Panel Admin
                </Link>
              )}
            </nav>
          </div>
        )}
      </header>

      <AuthModal open={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
