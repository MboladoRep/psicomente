'use client';

import { useState } from 'react';
import Link from 'next/link';
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
  Settings,
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
                  <Sparkles className="h-4 w-
